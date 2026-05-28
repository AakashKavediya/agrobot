export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CAM_URL = 'http://192.168.0.170/video';

export async function GET() {
  try {
    const upstream = await fetch(CAM_URL, { method: 'GET' });
    const headers = new Headers();
    headers.set('Content-Type', upstream.headers.get('content-type') || 'multipart/x-mixed-replace; boundary=frame');
    headers.set('Cache-Control', 'no-cache, no-store');
    headers.set('Access-Control-Allow-Origin', '*');
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (e) {
    console.error('[CAMPROBE] fetch error', e?.message || e);
    return new Response('proxy error', { status: 502 });
  }
}
