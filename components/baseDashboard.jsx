'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

// =========================== UTILITIES & HELPERS ===========================
const fmt = (v, unit = '') => (v != null ? `${v}${unit}` : '—');

const generateSeedData = (base, amp, n) =>
  Array.from({ length: n }, (_, i) => ({ t: i, v: +(base + (Math.random() - 0.5) * amp * 2).toFixed(1) }));

const getWxEmoji = (code) => {
  if (code == null) return '🌡️';
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 49) return '🌫️';
  if (code <= 69) return '🌧️';
  if (code <= 79) return '🌨️';
  if (code <= 99) return '⛈️';
  return '🌡️';
};

const getUvLabel = (uv) => {
  if (uv == null) return 'No data';
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
};

// =========================== CUSTOM HOOKS ===========================
const useMumbaiWeather = () => {
  const [wx, setWx] = useState(null);
  const [wxHist, setWxHist] = useState([]);

  useEffect(() => {
    const URL =
      'https://api.open-meteo.com/v1/forecast?latitude=19.076&longitude=72.8777' +
      '&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,' +
      'weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,' +
      'wind_gusts_10m,uv_index,visibility' +
      '&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,pressure_msl,uv_index' +
      '&timezone=Asia%2FKolkata&forecast_days=1';

    const fetchWx = async () => {
      try {
        const res = await fetch(URL);
        const data = await res.json();
        const c = data.current;
        setWx({
          temp: c.temperature_2m,
          feelsLike: c.apparent_temperature,
          humidity: c.relative_humidity_2m,
          wind: c.wind_speed_10m,
          windDir: c.wind_direction_10m,
          windGusts: c.wind_gusts_10m,
          pressure: c.pressure_msl,
          uvIndex: c.uv_index,
          cloudCover: c.cloud_cover,
          rain: c.precipitation,
          visibility: c.visibility != null ? +(c.visibility / 1000).toFixed(1) : null,
          code: c.weather_code,
        });

        const h = data.hourly;
        const hourlyData = h.time.map((t, i) => ({
          time: t.slice(11, 16),
          temp: h.temperature_2m[i],
          humidity: h.relative_humidity_2m[i],
          wind: h.wind_speed_10m[i],
          pressure: h.pressure_msl[i],
          uv: h.uv_index[i],
        }));
        setWxHist(hourlyData.filter((r) => r.temp != null));
      } catch (e) {
        console.warn('Weather fetch failed:', e);
      }
    };

    fetchWx();
    const interval = setInterval(fetchWx, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { wx, wxHist };
};

const useFakeSensors = () => {
  const [sensors, setSensors] = useState({
    temp: 28.4,
    humidity: 62,
    soil: 47,
    water: 'Medium',
    speed: 120,
    direction: 'STOP',
  });

  const histRef = useRef({
    temp: generateSeedData(28, 2, 20),
    humidity: generateSeedData(62, 5, 20),
    soil: generateSeedData(47, 8, 20),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSensors((prev) => {
        const newTemp = +(prev.temp + (Math.random() - 0.5) * 0.5).toFixed(1);
        const newHum = Math.min(100, Math.max(0, +(prev.humidity + (Math.random() - 0.5) * 1.5).toFixed(1)));
        const newSoil = Math.min(100, Math.max(0, +(prev.soil + (Math.random() - 0.5) * 2).toFixed(1)));
        const ts = Date.now();

        const pushHistory = (arr, val) => {
          const newArr = [...arr, { t: ts, v: val }];
          return newArr.length > 60 ? newArr.slice(-60) : newArr;
        };

        histRef.current.temp = pushHistory(histRef.current.temp, newTemp);
        histRef.current.humidity = pushHistory(histRef.current.humidity, newHum);
        histRef.current.soil = pushHistory(histRef.current.soil, newSoil);

        let waterStatus = 'Medium';
        if (newSoil < 25) waterStatus = 'Low';
        else if (newSoil > 70) waterStatus = 'Full';

        return {
          ...prev,
          temp: newTemp,
          humidity: newHum,
          soil: newSoil,
          water: waterStatus,
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const setDirection = (dir) => setSensors((p) => ({ ...p, direction: dir }));
  const setSpeed = (spd) => setSensors((p) => ({ ...p, speed: +spd }));

  return { sensors, histRef, setDirection, setSpeed };
};

const useMQTT = (setDirection, setSpeed) => {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.mqtt) return;

    const client = window.mqtt.connect(
      'wss://de740a3cc40d4fa89e921c2d6b25ce62.s1.eu.hivemq.cloud:8884/mqtt',
      {
        username: 'Aakash_Kavediya',
        password: 'Aakash@2006',
        reconnectPeriod: 3000,
      }
    );

    clientRef.current = client;
    client.on('connect', () => setConnected(true));
    client.on('close', () => setConnected(false));
    client.on('error', (e) => console.error('MQTT error:', e));

    return () => client.end(true);
  }, []);

  const publish = useCallback(
    (topic, value) => {
      clientRef.current?.publish(topic, String(value));
      if (topic === 'tank/control') setDirection(value);
      if (topic === 'tank/speed') setSpeed(value);
    },
    [setDirection, setSpeed]
  );

  return { connected, publish };
};

// =========================== UI COMPONENTS ===========================
const Card = ({ children, style = {}, glowColor = null }) => (
  <div
    style={{
      background: 'rgba(20, 20, 22, 0.96)',
      backdropFilter: 'blur(18px)',
      borderRadius: 20,
      padding: '14px 16px',
      border: '0.5px solid rgba(255, 255, 255, 0.08)',
      boxShadow: glowColor
        ? `0 0 14px ${glowColor}30, 0 2px 8px rgba(0, 0, 0, 0.6)`
        : '0 2px 8px rgba(0, 0, 0, 0.5)',
      transition: 'all 0.2s ease',
      ...style,
    }}
  >
    {children}
  </div>
);

const Label = ({ children, color = '#8E8E93' }) => (
  <div
    style={{
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color,
      marginBottom: 6,
    }}
  >
    {children}
  </div>
);

const Value = ({ children, color = '#FFFFFF', size = 20 }) => (
  <div
    style={{
      fontSize: size,
      fontWeight: 600,
      color,
      letterSpacing: '-0.3px',
      lineHeight: 1.2,
    }}
  >
    {children}
  </div>
);

const ArcGauge = ({ value, max = 100, color, size = 52 }) => {
  const r = 40;
  const cx = 55;
  const cy = 55;
  const sweep = 240;
  const startAngle = -210;
  const pct = value != null ? Math.min(value / max, 1) : 0;

  const toRad = (deg) => deg * (Math.PI / 180);
  const getPoint = (angle) => ({
    x: cx + r * Math.cos(toRad(angle)),
    y: cy + r * Math.sin(toRad(angle)),
  });

  const start = getPoint(startAngle);
  const bgEnd = getPoint(startAngle + sweep);
  const valueEnd = getPoint(startAngle + sweep * pct);

  return (
    <svg width={size} height={size} viewBox="0 0 110 110">
      <path
        d={`M${start.x},${start.y} A${r},${r} 0 1 1 ${bgEnd.x},${bgEnd.y}`}
        fill="none"
        stroke="#2C2C2E"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {value != null && (
        <path
          d={`M${start.x},${start.y} A${r},${r} 0 ${sweep * pct > 180 ? 1 : 0} 1 ${valueEnd.x},${valueEnd.y}`}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
        />
      )}
      <text
        x="55"
        y="62"
        textAnchor="middle"
        fontSize="18"
        fontWeight="600"
        fill={value != null ? color : '#3A3A3C'}
        fontFamily="-apple-system, sans-serif"
      >
        {value != null ? Math.round(value) : '—'}
      </text>
    </svg>
  );
};

const Toggle = ({ on, onToggle, color = '#30D158' }) => (
  <div
    onClick={onToggle}
    style={{
      width: 44,
      height: 24,
      borderRadius: 12,
      background: on ? color : '#2C2C2E',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      flexShrink: 0,
      boxShadow: on ? `0 0 6px ${color}60` : 'none',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 2,
        left: on ? 22 : 2,
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: '#FFFFFF',
        transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
      }}
    />
  </div>
);

const WaterBar = ({ level }) => {
  const levels = { Low: 0.2, Medium: 0.55, Full: 0.85 };
  const pct = level != null ? levels[level] ?? 0.5 : 0;
  const color = pct < 0.3 ? '#FF453A' : pct < 0.6 ? '#FFD60A' : '#30D158';

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 38 }}>
      {[0.25, 0.5, 0.75, 1].map((h, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${h * 100}%`,
            borderRadius: 4,
            background: level != null && pct >= h ? color : '#1C1C1E',
            transition: 'background 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: level != null && pct >= h ? `0 0 6px ${color}80` : 'none',
          }}
        />
      ))}
    </div>
  );
};

const WindDirection = ({ deg }) => {
  if (deg == null) return <span style={{ color: '#636366' }}>—</span>;
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return <span style={{ fontWeight: 500 }}>{dirs[Math.round(deg / 45) % 8]}</span>;
};

const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'rgba(28, 28, 30, 0.98)',
        backdropFilter: 'blur(12px)',
        border: '0.5px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: '8px 12px',
        fontSize: 11,
        color: '#FFFFFF',
        fontFamily: '-apple-system, sans-serif',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div style={{ color: '#8E8E93', marginBottom: 4, fontSize: 10 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: 'flex', gap: 6, alignItems: 'baseline' }}>
          <span>{p.name}:</span>
          <strong style={{ color: '#FFFFFF' }}>
            {p.value}
            {unit}
          </strong>
        </div>
      ))}
    </div>
  );
};

// =========================== PATH HISTORY COMPONENT ===========================
const PathHistory = ({ pathPoints }) => {
  const [showHistory, setShowHistory] = useState(false);

  const clearHistory = () => {
    if (pathPoints.length > 0 && window.confirm('Clear all path history?')) {
      if (window.clearPathCallback) window.clearPathCallback();
    }
  };

  return (
    <Card style={{ padding: '12px 14px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          marginBottom: showHistory ? 10 : 0,
        }}
        onClick={() => setShowHistory(!showHistory)}
      >
        <Label color="#0A84FF">📍 Path History</Label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#8E8E93' }}>
            {pathPoints.length} points
          </span>
          <span style={{ fontSize: 12, color: '#0A84FF' }}>{showHistory ? '▼' : '▶'}</span>
        </div>
      </div>

      {showHistory && (
        <div
          style={{
            maxHeight: 200,
            overflowY: 'auto',
            borderTop: '0.5px solid rgba(255,255,255,0.08)',
            paddingTop: 10,
            marginTop: 4,
          }}
        >
          {pathPoints.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#636366', fontSize: 11, padding: 16 }}>
              No movement yet. Control the bot to record path.
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr',
                  gap: 6,
                  fontSize: 9,
                  color: '#636366',
                  padding: '6px 4px',
                  borderBottom: '0.5px solid rgba(255,255,255,0.06)',
                  marginBottom: 4,
                }}
              >
                <span>#</span>
                <span>Position (X, Z)</span>
              </div>
              {[...pathPoints].reverse().map((point, idx) => {
                const originalIndex = pathPoints.length - 1 - idx;
                return (
                  <div
                    key={originalIndex}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr',
                      gap: 6,
                      fontSize: 10,
                      color: '#E5E5EA',
                      padding: '5px 4px',
                      borderRadius: 8,
                      fontFamily: 'monospace',
                    }}
                  >
                    <span style={{ color: '#0A84FF' }}>#{originalIndex + 1}</span>
                    <span>
                      ({point.x.toFixed(1)}, {point.z.toFixed(1)})
                    </span>
                  </div>
                );
              })}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearHistory();
                }}
                style={{
                  marginTop: 10,
                  width: '100%',
                  padding: '8px',
                  borderRadius: 10,
                  background: 'rgba(255, 69, 58, 0.15)',
                  border: '0.5px solid rgba(255, 69, 58, 0.3)',
                  color: '#FF453A',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Clear History
              </button>
            </>
          )}
        </div>
      )}
    </Card>
  );
};

// =========================== 3D BOT VIEWER ===========================
// Make sure your model is at: public/models/AgroBotModel-v1.glb
const MODEL_PATH = '/models/AgroBotModel-v1.glb';

const BotViewer3D = ({ direction, speed, onPathUpdate }) => {
  const mountRef = useRef(null);
  const stateRef = useRef({ direction: 'STOP', speed: 120 });
  const lastPosRef = useRef({ x: 0, z: 0 });
  const cleanRef = useRef(null);
  const [loadError, setLoadError] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    stateRef.current = { direction, speed };
  }, [direction, speed]);

  useEffect(() => {
    window.clearPathCallback = () => {
      if (window.pathPointsArray) {
        window.pathPointsArray = [];
        lastPosRef.current = { x: 0, z: 0 };
        if (onPathUpdate) onPathUpdate([]);
      }
    };
    return () => {
      delete window.clearPathCallback;
    };
  }, [onPathUpdate]);

  useEffect(() => {
    if (!mountRef.current) return;
    let cancelled = false;

    const initThree = async () => {
      try {
        const loadScript = (src) => {
          return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
              resolve();
              return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        };

        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js');
        await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/DRACOLoader.js');
        
        if (!cancelled) {
          initScene();
        }
      } catch (err) {
        console.error('Failed to load Three.js libraries:', err);
        setLoadError('Failed to load 3D libraries');
      }
    };

    const initScene = () => {
      const THREE = window.THREE;
      if (!THREE || !mountRef.current) return;
      
      const container = mountRef.current;
      const width = container.clientWidth || 320;
      const height = container.clientHeight || 260;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 1);
      renderer.shadowMap.enabled = true;
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      scene.fog = new THREE.FogExp2(0x000000, 0.008);

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
      camera.position.set(0, 6, 18);
      camera.lookAt(0, 0, 0);

      let isDragging = false;
      let prevMouse = { x: 0, y: 0 };
      let theta = 0;
      let phi = 0.5;
      let radius = 16;
      const updateCamera = () => {
        camera.position.x = radius * Math.sin(theta) * Math.cos(phi);
        camera.position.y = radius * Math.sin(phi);
        camera.position.z = radius * Math.cos(theta) * Math.cos(phi);
        camera.lookAt(0, 1.2, 0);
      };
      updateCamera();

      const canvasEl = renderer.domElement;
      canvasEl.addEventListener('mousedown', (e) => {
        isDragging = true;
        prevMouse = { x: e.clientX, y: e.clientY };
      });
      window.addEventListener('mouseup', () => (isDragging = false));
      canvasEl.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        theta += (e.clientX - prevMouse.x) * 0.008;
        phi = Math.max(0.2, Math.min(1.3, phi + (e.clientY - prevMouse.y) * 0.008));
        prevMouse = { x: e.clientX, y: e.clientY };
        updateCamera();
      });
      canvasEl.addEventListener('wheel', (e) => {
        radius = Math.max(6, Math.min(28, radius + e.deltaY * 0.02));
        updateCamera();
      });

      const ambient = new THREE.AmbientLight(0x222222);
      scene.add(ambient);
      const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
      mainLight.position.set(5, 12, 8);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.set(1024, 1024);
      scene.add(mainLight);
      const fillLight = new THREE.PointLight(0x4466aa, 0.5);
      fillLight.position.set(-3, 5, 5);
      scene.add(fillLight);
      const rimLight = new THREE.PointLight(0xffaa55, 0.4);
      rimLight.position.set(0, 3, -7);
      scene.add(rimLight);

      const gridHelper = new THREE.GridHelper(30, 20, 0x2a2a2e, 0x1c1c1e);
      gridHelper.position.y = -0.6;
      scene.add(gridHelper);

      const botGroup = new THREE.Group();
      scene.add(botGroup);

      // Load custom model
      const gltfLoader = new THREE.GLTFLoader();
      const dracoLoader = new THREE.DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
      gltfLoader.setDRACOLoader(dracoLoader);

      let retryCount = 0;
      const maxRetries = 3;
      
      const loadModel = () => {
        console.log('Attempting to load model from:', MODEL_PATH);
        gltfLoader.load(
          MODEL_PATH,
          (gltf) => {
            if (cancelled) return;
            console.log('Model loaded successfully');
            const model = gltf.scene;

            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = maxDim > 0 ? 3.5 / maxDim : 1;
            model.scale.setScalar(scale);

            const box2 = new THREE.Box3().setFromObject(model);
            const center = box2.getCenter(new THREE.Vector3());
            model.position.set(-center.x, -box2.min.y, -center.z);

            // Apply 90-degree rotation
            model.rotation.y = Math.PI / 2;

            model.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });

            while (botGroup.children.length > 0) {
              botGroup.remove(botGroup.children[0]);
            }
            botGroup.add(model);
            setModelLoaded(true);
            setLoadError(null);
          },
          (progress) => {
            console.log('Loading progress:', (progress.loaded / progress.total) * 100, '%');
          },
          (error) => {
            console.error('Error loading model:', error);
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`Retry ${retryCount}/${maxRetries}...`);
              setTimeout(loadModel, 2000);
            } else {
              setLoadError(`Model not found. Please ensure file exists at: ${MODEL_PATH}`);
              // Add fallback model
              addFallbackModel(botGroup);
            }
          }
        );
      };

      const addFallbackModel = (group) => {
        const fallbackBody = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 0.6, 1.5),
          new THREE.MeshStandardMaterial({ color: 0x1c1c1e, metalness: 0.7, roughness: 0.3 })
        );
        fallbackBody.castShadow = true;
        fallbackBody.position.y = 0.3;
        fallbackBody.rotation.y = Math.PI / 2;
        group.add(fallbackBody);

        const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.2, 16);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const wheelPositions = [
          [-0.7, 0.2, -0.6], [-0.7, 0.2, 0.6],
          [0.7, 0.2, -0.6], [0.7, 0.2, 0.6]
        ];
        wheelPositions.forEach(pos => {
          const wheel = new THREE.Mesh(wheelGeo, wheelMat);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(pos[0], pos[1], pos[2]);
          wheel.castShadow = true;
          group.add(wheel);
        });
        
        const headGeo = new THREE.SphereGeometry(0.45, 32, 32);
        const headMat = new THREE.MeshStandardMaterial({ color: 0x2c2c2e, metalness: 0.5 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 0.85;
        head.castShadow = true;
        group.add(head);
      };

      loadModel();

      let lastTime = performance.now();
      let posX = 0, posZ = 0, angle = 0;
      const speedMap = (pwm) => 1.5 + ((pwm - 60) / 255) * 9;

      let tubeMesh = null;
      let pathPoints = [{ x: 0, z: 0 }];
      window.pathPointsArray = pathPoints;
      
      const updatePathVisual = () => {
        if (pathPoints.length < 2) return;
        if (tubeMesh) scene.remove(tubeMesh);

        const points = pathPoints.map((p) => new THREE.Vector3(p.x, 0.05, p.z));
        if (points.length < 2) return;

        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeometry = new THREE.TubeGeometry(curve, Math.min(points.length * 10, 300), 0.05, 6, false);
        const tubeMaterial = new THREE.MeshStandardMaterial({
          color: 0x0a84ff,
          emissive: 0x0a84ff,
          emissiveIntensity: 0.25,
          transparent: true,
          opacity: 0.6,
        });
        tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
        scene.add(tubeMesh);
      };

      let animFrame;
      let lastPathUpdate = 0;

      const animate = () => {
        animFrame = requestAnimationFrame(animate);
        const now = performance.now();
        let dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        const { direction: dir, speed: spd } = stateRef.current;
        const moveSpeed = speedMap(spd);
        let moved = false;

        if (dir === 'FORWARD') {
          posX -= Math.sin(angle) * moveSpeed * dt;
          posZ -= Math.cos(angle) * moveSpeed * dt;
          moved = true;
        } else if (dir === 'BACKWARD') {
          posX += Math.sin(angle) * moveSpeed * dt;
          posZ += Math.cos(angle) * moveSpeed * dt;
          moved = true;
        } else if (dir === 'LEFT') {
          angle += 2.0 * dt;
          moved = true;
        } else if (dir === 'RIGHT') {
          angle -= 2.0 * dt;
          moved = true;
        }

        botGroup.position.set(posX, 0, posZ);
        botGroup.rotation.y = angle;

        if (moved && (dir === 'FORWARD' || dir === 'BACKWARD')) {
          const currentPos = { x: posX, z: posZ };
          const lastPos = lastPosRef.current;
          const distance = Math.hypot(currentPos.x - lastPos.x, currentPos.z - lastPos.z);

          if (distance > 0.15) {
            pathPoints.push({ x: posX, z: posZ });
            if (pathPoints.length > 500) pathPoints.shift();
            lastPosRef.current = { x: posX, z: posZ };
            updatePathVisual();

            if (onPathUpdate && Date.now() - lastPathUpdate > 100) {
              onPathUpdate([...pathPoints]);
              lastPathUpdate = Date.now();
            }
          }
        }

        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!mountRef.current) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      cleanRef.current = () => {
        cancelAnimationFrame(animFrame);
        window.removeEventListener('resize', handleResize);
        if (tubeMesh) scene.remove(tubeMesh);
        renderer.dispose();
        if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
        dracoLoader.dispose();
      };
    };

    initThree();

    return () => {
      cancelled = true;
      cleanRef.current?.();
    };
  }, [onPathUpdate]);

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden', position: 'relative', minHeight: 250 }}>
      {loadError && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 20,
            background: 'rgba(255, 69, 58, 0.9)',
            backdropFilter: 'blur(8px)',
            padding: '8px 16px',
            borderRadius: 12,
            fontSize: 11,
            color: '#FFFFFF',
            textAlign: 'center',
            pointerEvents: 'none',
            maxWidth: '80%',
          }}
        >
          ⚠️ {loadError}
        </div>
      )}
      {!modelLoaded && !loadError && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 20,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            padding: '8px 16px',
            borderRadius: 12,
            fontSize: 12,
            color: '#0A84FF',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          🚜 Loading 3D Model...
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          zIndex: 10,
          fontSize: 9,
          fontWeight: 500,
          color: '#8E8E93',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          padding: '4px 10px',
          borderRadius: 20,
          letterSpacing: 0.5,
          pointerEvents: 'none',
        }}
      >
        🕹️ drag to orbit
      </div>
    </div>
  );
};

// =========================== MAIN DASHBOARD ===========================
export default function IoTDashboard() {
  const { sensors, histRef, setDirection, setSpeed } = useFakeSensors();
  const { connected, publish } = useMQTT(setDirection, setSpeed);
  const { wx, wxHist } = useMumbaiWeather();

  const [relay1, setRelay1] = useState(false);
  const [relay2, setRelay2] = useState(false);
  const [servo, setServo] = useState(90);
  const [rgb, setRgb] = useState('#00E5FF');
  const [gear, setGear] = useState(3);
  const [holding, setHolding] = useState(null);
  const [wxTab, setWxTab] = useState('temp');
  const [snapshots, setSnapshots] = useState({ temp: [], humidity: [], soil: [] });
  const [pathHistory, setPathHistory] = useState([]);

  const gearSpeeds = { 1: 60, 2: 90, 3: 120, 4: 160, 5: 210, 6: 255 };
  const colors = {
    temp: '#FF6B35',
    humidity: '#30AAFF',
    soil: '#30D158',
    accent: '#0A84FF',
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSnapshots({
        temp: [...histRef.current.temp],
        humidity: [...histRef.current.humidity],
        soil: [...histRef.current.soil],
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [histRef]);

  const directionButtons = [
    { id: 'F', label: '↑', col: 2, row: 1, cmd: 'FORWARD' },
    { id: 'L', label: '←', col: 1, row: 2, cmd: 'LEFT' },
    { id: 'S', label: '■', col: 2, row: 2, cmd: 'STOP' },
    { id: 'R', label: '→', col: 3, row: 2, cmd: 'RIGHT' },
    { id: 'B', label: '↓', col: 2, row: 3, cmd: 'BACKWARD' },
  ];

  const startMove = (cmd) => {
    publish('tank/control', cmd);
    setHolding(cmd);
  };
  const stopMove = () => {
    publish('tank/control', 'STOP');
    setHolding(null);
  };
  const selectGear = (g) => {
    setGear(g);
    publish('tank/speed', String(gearSpeeds[g]));
  };

  const weatherCharts = {
    temp: { key: 'temp', color: '#FF6B35', label: 'Temperature', unit: '°C', domain: [24, 36] },
    humidity: { key: 'humidity', color: '#30AAFF', label: 'Humidity', unit: '%', domain: [40, 90] },
    wind: { key: 'wind', color: '#30D158', label: 'Wind', unit: ' km/h' },
    pressure: { key: 'pressure', color: '#BF5AF2', label: 'Pressure', unit: ' mb', domain: [995, 1020] },
  };
  const activeChart = weatherCharts[wxTab];

  const weatherCards = [
    { label: 'Temp', val: wx?.temp != null ? `${wx.temp}°C` : '—', sub: `feels ${wx?.feelsLike ?? '—'}°C`, color: '#FF6B35' },
    { label: 'Humidity', val: wx?.humidity != null ? `${wx.humidity}%` : '—', sub: 'relative', color: '#30AAFF' },
    { label: 'Wind', val: wx?.wind != null ? `${wx.wind} km/h` : '—', sub: <WindDirection deg={wx?.windDir} />, color: '#30D158' },
    { label: 'UV', val: wx?.uvIndex ?? '—', sub: getUvLabel(wx?.uvIndex), color: '#FF9F0A' },
    { label: 'Pressure', val: wx?.pressure != null ? `${Math.round(wx.pressure)} mb` : '—', sub: 'MSL', color: '#BF5AF2' },
    { label: 'Cloud', val: wx?.cloudCover != null ? `${wx.cloudCover}%` : '—', sub: 'cover', color: '#8E8E93' },
  ];

  return (
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        background: '#000000',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", sans-serif',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 40% at 20% 10%, rgba(10, 132, 255, 0.08) 0%, transparent 60%)',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            height: 52,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            borderBottom: '0.5px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.3px' }}>🌱 AgroBot</span>
            <span style={{ fontSize: 11, color: '#8E8E93', fontWeight: 500 }}>ESP32 · HiveMQ</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div
              style={{
                background: connected ? 'rgba(48, 209, 88, 0.12)' : 'rgba(255, 69, 58, 0.12)',
                border: `0.5px solid ${connected ? 'rgba(48, 209, 88, 0.3)' : 'rgba(255, 69, 58, 0.3)'}`,
                borderRadius: 24,
                padding: '5px 14px',
                fontSize: 11,
                fontWeight: 600,
                color: connected ? '#30D158' : '#FF453A',
              }}
            >
              {connected ? '● MQTT LIVE' : '○ MQTT OFF'}
            </div>
            {wx && (
              <div
                style={{
                  background: 'rgba(48, 170, 255, 0.1)',
                  border: '0.5px solid rgba(48, 170, 255, 0.2)',
                  borderRadius: 24,
                  padding: '5px 14px',
                  fontSize: 11,
                  fontWeight: 500,
                  color: '#30AAFF',
                }}
              >
                {getWxEmoji(wx.code)} {wx.temp}°C · Mumbai
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            padding: '14px 16px',
            overflowY: 'auto',
          }}
        >
          {/* LEFT COLUMN */}
          <div style={{ flex: '1.2 1 280px', minWidth: 260, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Card style={{ padding: 0, overflow: 'hidden', minHeight: 280, flex: '1 1 auto' }}>
              <BotViewer3D
                direction={sensors.direction}
                speed={sensors.speed}
                onPathUpdate={setPathHistory}
              />
            </Card>

            <PathHistory pathPoints={pathHistory} />

            <Card>
              <Label color="#8E8E93">Direction control</Label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                  maxWidth: 200,
                  margin: '0 auto',
                }}
              >
                {directionButtons.map((btn) => (
                  <button
                    key={btn.id}
                    onMouseDown={() => (btn.cmd === 'STOP' ? stopMove() : startMove(btn.cmd))}
                    onMouseUp={stopMove}
                    onMouseLeave={stopMove}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      btn.cmd === 'STOP' ? stopMove() : startMove(btn.cmd);
                    }}
                    onTouchEnd={stopMove}
                    style={{
                      gridColumn: btn.col,
                      gridRow: btn.row,
                      borderRadius: 14,
                      border: `1px solid ${holding === btn.cmd ? 'rgba(10, 132, 255, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                      background: holding === btn.cmd ? 'rgba(10, 132, 255, 0.2)' : btn.cmd === 'STOP' ? 'rgba(255, 69, 58, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      color: holding === btn.cmd ? '#0A84FF' : btn.cmd === 'STOP' ? '#FF453A' : '#E5E5EA',
                      fontSize: 20,
                      fontWeight: 500,
                      padding: '10px 0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 9, color: '#636366', textAlign: 'center', marginTop: 10 }}>
                hold to move · release stops
              </div>
            </Card>

            <Card>
              <Label color="#FFD60A">Gear selector</Label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <button
                    key={g}
                    onClick={() => selectGear(g)}
                    style={{
                      padding: '8px 0',
                      borderRadius: 12,
                      border: 'none',
                      background: gear === g ? 'rgba(255, 214, 10, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      color: gear === g ? '#FFD60A' : '#8E8E93',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 10, color: '#8E8E93', marginTop: 8, textAlign: 'center' }}>
                PWM {gearSpeeds[gear]}
              </div>
            </Card>
          </div>

          {/* CENTER COLUMN */}
          <div style={{ flex: '2.5 1 400px', minWidth: 300, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              {[
                { label: 'Temperature', value: sensors.temp, unit: '°C', color: colors.temp, max: 50 },
                { label: 'Humidity', value: sensors.humidity, unit: '%', color: colors.humidity, max: 100 },
                { label: 'Soil Moisture', value: sensors.soil, unit: '%', color: colors.soil, max: 100 },
              ].map((item) => (
                <Card key={item.label} glowColor={item.color}>
                  <Label color={item.color}>{item.label}</Label>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Value color={item.color} size={24}>
                      {fmt(item.value, item.unit)}
                    </Value>
                    <ArcGauge value={item.value} max={item.max} color={item.color} size={52} />
                  </div>
                </Card>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, flex: '1 1 auto', minHeight: 180 }}>
              {[
                { data: snapshots.temp, key: 'temp', color: colors.temp, label: 'Temperature', unit: '°C' },
                { data: snapshots.humidity, key: 'humidity', color: colors.humidity, label: 'Humidity', unit: '%' },
                { data: snapshots.soil, key: 'soil', color: colors.soil, label: 'Soil Moisture', unit: '%' },
              ].map((chart) => (
                <Card key={chart.key} style={{ display: 'flex', flexDirection: 'column', padding: '12px 12px' }}>
                  <Label color={chart.color}>{chart.label} · live</Label>
                  <div style={{ flex: 1, minHeight: 130 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chart.data} margin={{ top: 4, right: 2, bottom: 0, left: -18 }}>
                        <defs>
                          <linearGradient id={`grad-${chart.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chart.color} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={chart.color} stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#1C1C1E" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="t" hide />
                        <YAxis tick={{ fill: '#636366', fontSize: 9 }} width={28} />
                        <Tooltip content={<CustomTooltip unit={chart.unit} />} />
                        <Area
                          type="monotone"
                          dataKey="v"
                          name={chart.label}
                          stroke={chart.color}
                          strokeWidth={1.8}
                          fill={`url(#grad-${chart.key})`}
                          dot={false}
                          activeDot={{ r: 3, fill: chart.color }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              <Card>
                <Label>Water tank</Label>
                <WaterBar level={sensors.water} />
                <Value size={14} color="#E5E5EA" style={{ marginTop: 8 }}>
                  {sensors.water}
                </Value>
              </Card>
              <Card>
                <Label>Relay controls</Label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>Relay 1</span>
                    <Toggle on={relay1} onToggle={() => { setRelay1((v) => !v); publish('control/relay1', relay1 ? 'OFF' : 'ON'); }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>Relay 2</span>
                    <Toggle on={relay2} onToggle={() => { setRelay2((v) => !v); publish('control/relay2', relay2 ? 'OFF' : 'ON'); }} />
                  </div>
                </div>
              </Card>
              <Card>
                <Label>Servo angle</Label>
                <Value color="#BF5AF2" size={20}>
                  {servo}°
                </Value>
                <input
                  type="range"
                  min={0}
                  max={180}
                  value={servo}
                  onChange={(e) => {
                    const val = +e.target.value;
                    setServo(val);
                    publish('control/servo', val);
                  }}
                  style={{ width: '100%', marginTop: 8 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#636366', marginTop: 4 }}>
                  <span>0°</span>
                  <span>90°</span>
                  <span>180°</span>
                </div>
              </Card>
            </div>

            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <Label>RGB LED</Label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {['#FF453A', '#30D158', '#30AAFF', '#BF5AF2', '#00E5FF'].map((c) => (
                    <div
                      key={c}
                      onClick={() => {
                        setRgb(c);
                        publish('control/rgb', c);
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: c,
                        border: rgb === c ? '2px solid #FFFFFF' : '2px solid transparent',
                        cursor: 'pointer',
                        boxShadow: rgb === c ? `0 0 8px ${c}80` : 'none',
                        transition: 'all 0.2s',
                      }}
                    />
                  ))}
                  <input
                    type="color"
                    value={rgb}
                    onChange={(e) => {
                      setRgb(e.target.value);
                      publish('control/rgb', e.target.value);
                    }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: '1px solid #3A3A3C',
                      background: 'transparent',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                </div>
                <Value size={13} color={rgb} style={{ textTransform: 'uppercase' }}>
                  {rgb}
                </Value>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ flex: '1.2 1 260px', minWidth: 260, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#8E8E93', letterSpacing: '0.5px', paddingLeft: 4 }}>
              🌤️ MUMBAI · REAL-TIME
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {weatherCards.map((item) => (
                <Card key={item.label} glowColor={wx ? item.color : null} style={{ padding: '10px 12px' }}>
                  <Label color={wx ? item.color : '#48484A'}>{item.label}</Label>
                  <Value color={wx ? item.color : '#3A3A3C'} size={18}>
                    {item.val}
                  </Value>
                  <div style={{ fontSize: 9, color: '#636366', marginTop: 4 }}>{item.sub}</div>
                </Card>
              ))}
            </div>

            <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 200 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {Object.entries(weatherCharts).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setWxTab(key)}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: 12,
                      border: 'none',
                      background: wxTab === key ? `${cfg.color}18` : 'rgba(255, 255, 255, 0.04)',
                      color: wxTab === key ? cfg.color : '#8E8E93',
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
              <div style={{ flex: 1, minHeight: 160 }}>
                {wxHist.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={wxHist} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                      <defs>
                        <linearGradient id="wxGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={activeChart.color} stopOpacity={0.35} />
                          <stop offset="95%" stopColor={activeChart.color} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#1C1C1E" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="time" tick={{ fill: '#636366', fontSize: 8 }} interval={3} />
                      <YAxis domain={activeChart.domain || ['auto', 'auto']} tick={{ fill: '#8E8E93', fontSize: 8 }} width={28} />
                      <Tooltip content={<CustomTooltip unit={activeChart.unit} />} />
                      <Area
                        type="monotone"
                        dataKey={activeChart.key}
                        name={activeChart.label}
                        stroke={activeChart.color}
                        strokeWidth={2}
                        fill="url(#wxGradient)"
                        dot={false}
                        activeDot={{ r: 3, fill: activeChart.color }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#636366', fontSize: 11 }}>
                    loading forecast...
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}