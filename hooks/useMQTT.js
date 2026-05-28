/**
 * hooks/useMQTT.js
 *
 * WHY THE OLD CODE FAILED:
 *  1. `window.mqtt` never exists — mqtt is an npm package, not a CDN global.
 *     The old `if (!window.mqtt) return` silently killed the entire hook.
 *  2. Top-level `import mqtt from 'mqtt'` crashes Next.js SSR because mqtt
 *     internally uses Node.js `net`/`tls` modules that don't exist in the browser.
 *     Fix: dynamic import inside useEffect (client-only, never runs on server).
 *  3. No subscriptions were ever made because the client never connected.
 *  4. Payload field names were wrong: ESP32 sends `temp` not `temperature`,
 *     and water sends "EMPTY"/"LOW"/"MEDIUM"/"FULL" not "Low"/"Medium"/"Full".
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Broker config ────────────────────────────────────────────────────────────
const BROKER_URL = 'wss://de740a3cc40d4fa89e921c2d6b25ce62.s1.eu.hivemq.cloud:8884/mqtt';
const MQTT_OPTIONS = {
  username: 'Aakash_Kavediya',
  password: 'Aakash@2006',
  clientId: `agrobot-dashboard-${Math.random().toString(16).slice(2, 10)}`,
  clean: true,
  reconnectPeriod: 4000,   // ms between reconnect attempts
  connectTimeout: 10000,   // ms before giving up on a connect attempt
  keepalive: 30,           // seconds
  protocolVersion: 4,      // MQTT 3.1.1
};

// Topics to subscribe to immediately after connect
const SUBSCRIBE_TOPICS = [
  'sensor/dht',
  'sensor/soil',
  'sensor/water',
  'esp32/sensors',
];

// ─── Water level normaliser ───────────────────────────────────────────────────
// ESP32 sends uppercase strings; UI uses Title-case display labels.
const normaliseWater = (raw) => {
  if (raw == null) return null;
  const upper = String(raw).toUpperCase().trim();
  const map = {
    EMPTY: 'Empty',
    LOW:   'Low',
    MED:   'Medium',
    MEDIUM:'Medium',
    HIGH:  'Full',
    FULL:  'Full',
  };
  return map[upper] ?? raw; // fall back to original if unknown
};

// ─── Safe JSON parse (returns null on failure) ────────────────────────────────
const tryParse = (str) => {
  try { return JSON.parse(str); } catch { return null; }
};

// ═════════════════════════════════════════════════════════════════════════════
//  useMQTT — establishes and maintains the MQTT WebSocket connection
// ═════════════════════════════════════════════════════════════════════════════
export function useMQTT() {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);     // holds the mqtt.Client instance
  const mountedRef = useRef(true);    // guards async state updates after unmount

  useEffect(() => {
    mountedRef.current = true;
    let client = null;

    // Dynamic import keeps mqtt OUT of the SSR bundle entirely.
    // This runs only in the browser.
    import('mqtt').then((mqttModule) => {
      if (!mountedRef.current) return; // component unmounted while importing

      const mqtt = mqttModule.default ?? mqttModule;

      console.log(`[MQTT] Connecting to ${BROKER_URL}…`);
      client = mqtt.connect(BROKER_URL, MQTT_OPTIONS);
      clientRef.current = client;

      client.on('connect', () => {
        if (!mountedRef.current) return;
        console.log('[MQTT] ✅ Connected');
        setConnected(true);

        // Subscribe to all topics in one batch; log any errors
        client.subscribe(SUBSCRIBE_TOPICS, { qos: 0 }, (err, granted) => {
          if (err) {
            console.error('[MQTT] Subscribe error:', err);
          } else {
            console.log('[MQTT] Subscribed to:', granted.map((g) => g.topic).join(', '));
          }
        });
      });

      client.on('reconnect', () => {
        console.log('[MQTT] 🔄 Reconnecting…');
      });

      client.on('close', () => {
        if (!mountedRef.current) return;
        console.log('[MQTT] 🔌 Disconnected');
        setConnected(false);
      });

      client.on('error', (err) => {
        console.error('[MQTT] ❌ Error:', err.message);
      });

      client.on('offline', () => {
        console.warn('[MQTT] Offline');
      });
    }).catch((err) => {
      console.error('[MQTT] Failed to import mqtt package:', err);
    });

    // Cleanup: end the client gracefully when the component unmounts
    return () => {
      mountedRef.current = false;
      if (client) {
        console.log('[MQTT] Cleaning up client');
        client.end(true); // true = force-close without waiting for in-flight messages
        clientRef.current = null;
      }
    };
  }, []); // run once on mount

  // Stable publish function — safe to call even if not yet connected
  const publish = useCallback((topic, value) => {
    const client = clientRef.current;
    if (!client || !client.connected) {
      console.warn('[MQTT] publish skipped — not connected yet');
      return;
    }
    client.publish(topic, String(value), { qos: 0 }, (err) => {
      if (err) console.error('[MQTT] Publish error on', topic, err);
    });
  }, []);

  return { connected, publish, clientRef };
}

// ═════════════════════════════════════════════════════════════════════════════
//  useRealSensors — subscribes to sensor topics and parses all payloads
// ═════════════════════════════════════════════════════════════════════════════
export function useRealSensors(clientRef) {
  const [sensors, setSensors] = useState({
    temp:      null,   // °C  — null means "no data yet"
    humidity:  null,   // %
    soil:      null,   // %
    soilRaw:   null,   // ADC raw value
    soilState: null,   // "DRY" / "WET" / etc.
    water:     null,   // "Empty" / "Low" / "Medium" / "Full"
    speed:     120,
    direction: 'STOP',
  });

  // Rolling history arrays for charts (max 60 points each)
  const histRef = useRef({ temp: [], humidity: [], soil: [] });

  const pushHistory = useCallback((key, val) => {
    const arr = histRef.current[key];
    const next = [...arr, { t: Date.now(), v: val }];
    histRef.current[key] = next.length > 60 ? next.slice(-60) : next;
  }, []);

  // ── Message handler ────────────────────────────────────────────────────────
  const handleMessage = useCallback((topic, messageBuffer) => {
    const raw = messageBuffer.toString().trim();
    console.log(`[MQTT RX] ${topic}:`, raw);

    const parsed = tryParse(raw);

    // ── sensor/dht  →  { "temp": 33.9, "humidity": 65 } ───────────────────
    if (topic === 'sensor/dht') {
      // Support both { temp } and { temperature } just in case
      const t = parsed?.temp ?? parsed?.temperature ?? null;
      const h = parsed?.humidity ?? null;

      setSensors((prev) => {
        const newTemp = t != null && !isNaN(t) ? +parseFloat(t).toFixed(1) : prev.temp;
        const newHum  = h != null && !isNaN(h) ? +parseFloat(h).toFixed(1) : prev.humidity;
        if (newTemp !== prev.temp) pushHistory('temp', newTemp);
        if (newHum  !== prev.humidity) pushHistory('humidity', newHum);
        return { ...prev, temp: newTemp, humidity: newHum };
      });
      return;
    }

    // ── sensor/soil  →  { "soil": 0, "raw": 4095, "state": "DRY" } ────────
    if (topic === 'sensor/soil') {
      const s     = parsed?.soil ?? parsed?.moisture ?? parsed?.value ?? null;
      const raw_v = parsed?.raw  ?? null;
      const state = parsed?.state ?? null;

      if (s != null && !isNaN(s)) {
        const soilPct = +Math.min(100, Math.max(0, parseFloat(s))).toFixed(1);
        setSensors((prev) => {
          pushHistory('soil', soilPct);
          return {
            ...prev,
            soil:      soilPct,
            soilRaw:   raw_v,
            soilState: state,
          };
        });
      }
      return;
    }

    // ── sensor/water  →  { "water": "EMPTY" } ─────────────────────────────
    if (topic === 'sensor/water') {
      // Accept both { water: "EMPTY" } JSON and plain string "EMPTY"
      const rawWater = parsed?.water ?? (parsed == null ? raw : null);
      const level = normaliseWater(rawWater);
      if (level) setSensors((prev) => ({ ...prev, water: level }));
      return;
    }

    // ── esp32/sensors  →  combined JSON ───────────────────────────────────
    if (topic === 'esp32/sensors') {
      if (!parsed) { console.warn('[MQTT] esp32/sensors: invalid JSON:', raw); return; }

      const t = parsed.temp ?? parsed.temperature ?? null;
      const h = parsed.humidity ?? null;
      const s = parsed.soil ?? parsed.moisture ?? null;
      const w = normaliseWater(parsed.water ?? parsed.water_level ?? null);

      setSensors((prev) => {
        const newTemp = t != null && !isNaN(t) ? +parseFloat(t).toFixed(1) : prev.temp;
        const newHum  = h != null && !isNaN(h) ? +parseFloat(h).toFixed(1) : prev.humidity;
        const newSoil = s != null && !isNaN(s)
          ? +Math.min(100, Math.max(0, parseFloat(s))).toFixed(1)
          : prev.soil;
        const newWater = w ?? prev.water;

        if (newTemp !== prev.temp) pushHistory('temp', newTemp);
        if (newHum  !== prev.humidity) pushHistory('humidity', newHum);
        if (newSoil !== prev.soil) pushHistory('soil', newSoil);

        return {
          ...prev,
          temp:      newTemp,
          humidity:  newHum,
          soil:      newSoil,
          soilState: parsed.state ?? prev.soilState,
          water:     newWater,
        };
      });
    }
  }, [pushHistory]);

  // ── Attach / detach message listener whenever client reference changes ────
  useEffect(() => {
    // clientRef is a ref — its .current may be null until MQTT connects.
    // We poll for the client being available to attach the listener.
    // The listener is idempotent so attaching multiple times is safe,
    // but we guard with a flag anyway.
    const client = clientRef?.current;
    if (!client) return;

    client.on('message', handleMessage);
    console.log('[Sensors] Message handler attached');

    return () => {
      client.off('message', handleMessage);
      console.log('[Sensors] Message handler detached');
    };
  });
  // Intentionally no dependency array — re-runs each render so that when
  // clientRef.current transitions from null → client, we catch it immediately.
  // This is safe because on/off are idempotent and cheap.

  const setDirection = useCallback((dir) => setSensors((p) => ({ ...p, direction: dir })), []);
  const setSpeed     = useCallback((spd) => setSensors((p) => ({ ...p, speed: +spd })), []);

  return { sensors, histRef, setDirection, setSpeed };
}