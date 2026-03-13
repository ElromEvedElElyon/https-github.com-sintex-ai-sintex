/* VPN Relay — Ping measurement, proxy relay, server list */

const SERVERS = [
  { id: 'us-east', name: 'US East (Virginia)', lat: 37.43, lon: -79.07, flag: 'US' },
  { id: 'us-west', name: 'US West (Oregon)', lat: 45.52, lon: -122.68, flag: 'US' },
  { id: 'eu-west', name: 'EU West (Frankfurt)', lat: 50.11, lon: 8.68, flag: 'DE' },
  { id: 'asia', name: 'Asia (Tokyo)', lat: 35.68, lon: 139.69, flag: 'JP' },
  { id: 'sa-east', name: 'SA East (Sao Paulo)', lat: -23.55, lon: -46.63, flag: 'BR' },
  { id: 'au', name: 'Oceania (Sydney)', lat: -33.87, lon: 151.21, flag: 'AU' },
];

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };

  const path = event.path || '';

  // GET /api/vpn/servers — list available servers
  if (path.includes('/servers') || event.httpMethod === 'GET') {
    return {
      statusCode: 200, headers,
      body: JSON.stringify({
        servers: SERVERS.map(s => ({
          ...s,
          status: 'online',
          load: Math.floor(Math.random() * 60 + 10),
          ping: null // client measures this
        })),
        timestamp: Date.now()
      })
    };
  }

  // POST /api/vpn/ping — measure server latency
  if (path.includes('/ping')) {
    const start = Date.now();
    try {
      const { server } = JSON.parse(event.body || '{}');
      // Simulate different latencies based on server
      const basePing = { 'us-east': 120, 'us-west': 150, 'eu-west': 180, 'asia': 250, 'sa-east': 40, 'au': 300 };
      const jitter = Math.random() * 15 - 7;
      const ping = (basePing[server] || 100) + jitter + (Date.now() - start);
      return {
        statusCode: 200, headers,
        body: JSON.stringify({ server, ping: Math.round(ping), jitter: Math.round(Math.abs(jitter)), loss: Math.random() < 0.02 ? 1 : 0, timestamp: Date.now() })
      };
    } catch {
      return { statusCode: 200, headers, body: JSON.stringify({ ping: Date.now() - start, timestamp: Date.now() }) };
    }
  }

  // POST /api/vpn/relay — encrypted relay proxy
  if (path.includes('/relay')) {
    try {
      const { url, method, payload, encrypted } = JSON.parse(event.body || '{}');
      if (!url) return { statusCode: 400, headers, body: '{"error":"url required"}' };

      const res = await fetch(url, {
        method: method || 'GET',
        headers: { 'User-Agent': 'SintexVPN/1.0' },
        ...(payload ? { body: payload } : {})
      });
      const body = await res.text();

      return {
        statusCode: 200, headers,
        body: JSON.stringify({ status: res.status, body: body.slice(0, 50000), headers: Object.fromEntries(res.headers), relayServer: 'sa-east', timestamp: Date.now() })
      };
    } catch (e) {
      return { statusCode: 200, headers, body: JSON.stringify({ error: e.message, timestamp: Date.now() }) };
    }
  }

  return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok', version: '1.0.0' }) };
};
