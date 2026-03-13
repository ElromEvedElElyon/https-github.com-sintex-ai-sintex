/* SintexOS VPN — Low-latency Gaming VPN Dashboard */
(function () {
  const I = SOS.ICO;
  let connected = false, selectedServer = 'sa-east', pingInterval = null;
  let bwCanvas, bwCtx, bwAnim, bwData = { up: [], down: [] };
  const SERVERS = [
    { id: 'sa-east', name: 'Sao Paulo', flag: 'BR', x: 30, y: 72 },
    { id: 'us-east', name: 'Virginia', flag: 'US', x: 27, y: 38 },
    { id: 'us-west', name: 'Oregon', flag: 'US', x: 15, y: 36 },
    { id: 'eu-west', name: 'Frankfurt', flag: 'DE', x: 52, y: 32 },
    { id: 'asia', name: 'Tokyo', flag: 'JP', x: 82, y: 38 },
    { id: 'au', name: 'Sydney', flag: 'AU', x: 85, y: 75 },
  ];

  function renderVPN() {
    const el = SOS.h('div', { className: 'vpn-app' });
    el.innerHTML = `
      <div class="vpn-header">
        <div class="vpn-title">${I.vpn} <span>SintexVPN</span></div>
        <div class="vpn-badges">
          <span class="vpn-badge">AES-256-GCM</span>
          <span class="vpn-badge">WireGuard</span>
          <span class="vpn-badge gaming" id="vpn-gaming-badge">Gaming Mode</span>
        </div>
      </div>
      <div class="vpn-main">
        <div class="vpn-left">
          <div class="vpn-connect-area">
            <button class="vpn-big-btn" id="vpn-connect-btn">
              <div class="vpn-big-icon" id="vpn-big-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
                </svg>
              </div>
              <div class="vpn-big-text" id="vpn-big-text">Connect</div>
            </button>
            <div class="vpn-status-text" id="vpn-status">Disconnected</div>
          </div>
          <div class="vpn-stats">
            <div class="vpn-stat-card">
              <div class="vpn-stat-label">Ping</div>
              <div class="vpn-stat-value" id="vpn-ping">--</div>
              <div class="vpn-stat-unit">ms</div>
            </div>
            <div class="vpn-stat-card">
              <div class="vpn-stat-label">Jitter</div>
              <div class="vpn-stat-value" id="vpn-jitter">--</div>
              <div class="vpn-stat-unit">ms</div>
            </div>
            <div class="vpn-stat-card">
              <div class="vpn-stat-label">Loss</div>
              <div class="vpn-stat-value" id="vpn-loss">0</div>
              <div class="vpn-stat-unit">%</div>
            </div>
            <div class="vpn-stat-card">
              <div class="vpn-stat-label">Uptime</div>
              <div class="vpn-stat-value" id="vpn-uptime">0:00</div>
              <div class="vpn-stat-unit"></div>
            </div>
          </div>
          <div class="vpn-bandwidth">
            <div class="vpn-bw-header">
              <span>Bandwidth</span>
              <span class="vpn-bw-values"><span id="vpn-bw-down">0</span> ↓ / <span id="vpn-bw-up">0</span> ↑ Mbps</span>
            </div>
            <canvas id="vpn-bw-canvas" width="360" height="80"></canvas>
          </div>
        </div>
        <div class="vpn-right">
          <div class="vpn-map-area">
            <svg id="vpn-map" viewBox="0 0 100 80" class="vpn-map">
              <rect width="100" height="80" fill="none"/>
              <!-- Simplified world map outlines -->
              <path d="M15,25 Q20,20 28,22 L32,28 Q35,35 30,40 L25,45 Q20,50 18,55 L15,60 Q10,65 12,70 L18,75 Q22,78 28,72 L32,65 Q35,60 30,55 L28,50 Q25,45 20,40 L18,35 Q15,30 15,25Z" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.1)" stroke-width=".3"/>
              <path d="M45,20 Q50,15 58,18 L65,22 Q70,25 72,30 L75,35 Q78,40 75,50 L70,55 Q65,60 55,58 L48,52 Q44,48 42,40 L40,35 Q38,28 42,22Z" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.1)" stroke-width=".3"/>
              <path d="M72,25 Q78,20 88,28 L92,35 Q95,42 90,50 L85,55 Q80,58 75,52 L72,45 Q70,38 72,30Z" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.1)" stroke-width=".3"/>
              <path d="M80,65 Q85,60 90,65 L88,75 Q82,78 80,72Z" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.1)" stroke-width=".3"/>
            </svg>
            <div class="vpn-servers" id="vpn-servers-dots"></div>
          </div>
          <div class="vpn-server-list" id="vpn-server-list"></div>
          <div class="vpn-options">
            <label class="vpn-option">
              <span>Protocol</span>
              <select id="vpn-protocol" class="vpn-select">
                <option value="wireguard" selected>WireGuard</option>
                <option value="openvpn">OpenVPN</option>
                <option value="sintex">SintexTunnel</option>
              </select>
            </label>
            <label class="vpn-option vpn-toggle-opt">
              <span>Kill Switch</span>
              <input type="checkbox" class="vpn-checkbox" id="vpn-killswitch">
            </label>
            <label class="vpn-option vpn-toggle-opt">
              <span>Gaming Mode</span>
              <input type="checkbox" class="vpn-checkbox" id="vpn-gaming" checked>
            </label>
            <label class="vpn-option vpn-toggle-opt">
              <span>DNS over HTTPS</span>
              <input type="checkbox" class="vpn-checkbox" id="vpn-doh" checked>
            </label>
          </div>
        </div>
      </div>`;

    setTimeout(() => initVPN(el), 50);
    return el;
  }

  function initVPN(el) {
    // Render server dots on map
    const dotsContainer = el.querySelector('#vpn-servers-dots');
    SERVERS.forEach(s => {
      const dot = SOS.h('div', { className: `vpn-server-dot ${s.id === selectedServer ? 'active' : ''}` });
      dot.style.left = s.x + '%';
      dot.style.top = s.y + '%';
      dot.title = s.name;
      dot.onclick = () => selectServer(s.id, el);
      dotsContainer.appendChild(dot);
    });

    // Render server list
    const list = el.querySelector('#vpn-server-list');
    SERVERS.forEach(s => {
      const item = SOS.h('div', { className: `vpn-server-item ${s.id === selectedServer ? 'active' : ''}`, 'data-id': s.id });
      item.innerHTML = `
        <span class="vpn-server-flag">${s.flag}</span>
        <span class="vpn-server-name">${s.name}</span>
        <span class="vpn-server-ping" id="vpn-sp-${s.id}">--ms</span>`;
      item.onclick = () => selectServer(s.id, el);
      list.appendChild(item);
    });

    // Connect button
    el.querySelector('#vpn-connect-btn').onclick = () => toggleConnect(el);

    // Bandwidth canvas
    bwCanvas = el.querySelector('#vpn-bw-canvas');
    if (bwCanvas) bwCtx = bwCanvas.getContext('2d');

    // Initial ping all servers
    pingAllServers(el);
  }

  function selectServer(id, el) {
    selectedServer = id;
    el.querySelectorAll('.vpn-server-dot').forEach((d, i) => d.classList.toggle('active', SERVERS[i].id === id));
    el.querySelectorAll('.vpn-server-item').forEach(d => d.classList.toggle('active', d.dataset?.id === id || d.getAttribute('data-id') === id));
  }

  async function toggleConnect(el) {
    if (connected) {
      disconnect(el);
    } else {
      connect(el);
    }
  }

  async function connect(el) {
    const btn = el.querySelector('#vpn-big-icon');
    const text = el.querySelector('#vpn-big-text');
    const status = el.querySelector('#vpn-status');
    const bigBtn = el.querySelector('#vpn-connect-btn');

    text.textContent = 'Connecting...';
    status.textContent = 'Establishing tunnel...';
    bigBtn.classList.add('connecting');
    SOS.sound('connect');

    // Simulate connection
    await new Promise(r => setTimeout(r, 1500));

    connected = true;
    bigBtn.classList.remove('connecting');
    bigBtn.classList.add('connected');
    text.textContent = 'Disconnect';
    status.textContent = `Connected to ${SERVERS.find(s => s.id === selectedServer)?.name || selectedServer}`;
    status.style.color = '#00ff88';

    SOS.sound('connect');
    SOS.toast('VPN Connected');

    // Start monitoring
    let seconds = 0;
    pingInterval = setInterval(() => {
      seconds++;
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      const uptimeEl = el.querySelector('#vpn-uptime');
      if (uptimeEl) uptimeEl.textContent = `${m}:${String(s).padStart(2, '0')}`;
      measurePing(el);
      updateBandwidth(el);
    }, 1000);

    startBandwidthViz();
  }

  function disconnect(el) {
    connected = false;
    if (pingInterval) { clearInterval(pingInterval); pingInterval = null; }
    if (bwAnim) { cancelAnimationFrame(bwAnim); bwAnim = null; }

    const bigBtn = el.querySelector('#vpn-connect-btn');
    bigBtn.classList.remove('connected', 'connecting');
    el.querySelector('#vpn-big-text').textContent = 'Connect';
    const status = el.querySelector('#vpn-status');
    status.textContent = 'Disconnected';
    status.style.color = '';
    el.querySelector('#vpn-ping').textContent = '--';
    el.querySelector('#vpn-jitter').textContent = '--';
    el.querySelector('#vpn-uptime').textContent = '0:00';

    SOS.sound('click');
    SOS.toast('VPN Disconnected');
  }

  async function measurePing(el) {
    const start = performance.now();
    try {
      const res = await fetch('/api/vpn/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server: selectedServer })
      });
      const data = await res.json();
      const pingEl = el.querySelector('#vpn-ping');
      const jitterEl = el.querySelector('#vpn-jitter');
      const lossEl = el.querySelector('#vpn-loss');
      if (pingEl) pingEl.textContent = Math.round(data.ping);
      if (jitterEl) jitterEl.textContent = Math.round(data.jitter);
      if (lossEl) lossEl.textContent = data.loss || '0';
    } catch {
      // offline
    }
  }

  async function pingAllServers(el) {
    for (const s of SERVERS) {
      try {
        const res = await fetch('/api/vpn/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ server: s.id })
        });
        const data = await res.json();
        const spEl = el.querySelector(`#vpn-sp-${s.id}`);
        if (spEl) spEl.textContent = Math.round(data.ping) + 'ms';
      } catch {
        const spEl = el.querySelector(`#vpn-sp-${s.id}`);
        if (spEl) spEl.textContent = 'ERR';
      }
    }
  }

  function updateBandwidth(el) {
    const down = (15 + Math.random() * 35).toFixed(1);
    const up = (5 + Math.random() * 15).toFixed(1);
    const dEl = el.querySelector('#vpn-bw-down');
    const uEl = el.querySelector('#vpn-bw-up');
    if (dEl) dEl.textContent = down;
    if (uEl) uEl.textContent = up;
    bwData.down.push(+down); bwData.up.push(+up);
    if (bwData.down.length > 60) { bwData.down.shift(); bwData.up.shift(); }
  }

  function startBandwidthViz() {
    if (!bwCanvas || !bwCtx) return;
    const W = bwCanvas.width, H = bwCanvas.height;
    const draw = () => {
      if (!connected) return;
      bwAnim = requestAnimationFrame(draw);
      bwCtx.fillStyle = 'rgba(0,0,0,0.2)';
      bwCtx.fillRect(0, 0, W, H);

      const maxVal = 60;
      // Download line
      bwCtx.strokeStyle = '#00ff88';
      bwCtx.lineWidth = 1.5;
      bwCtx.beginPath();
      bwData.down.forEach((v, i) => {
        const x = (i / 59) * W;
        const y = H - (v / maxVal) * H;
        i === 0 ? bwCtx.moveTo(x, y) : bwCtx.lineTo(x, y);
      });
      bwCtx.stroke();

      // Upload line
      bwCtx.strokeStyle = '#60CDFF';
      bwCtx.lineWidth = 1;
      bwCtx.beginPath();
      bwData.up.forEach((v, i) => {
        const x = (i / 59) * W;
        const y = H - (v / maxVal) * H;
        i === 0 ? bwCtx.moveTo(x, y) : bwCtx.lineTo(x, y);
      });
      bwCtx.stroke();
    };
    draw();
  }

  SOS.registerApp({
    id: 'vpn',
    name: 'SintexVPN',
    icon: I.vpn,
    pin: true,
    w: 820, h: 560,
    color: '#00ff88',
    render: renderVPN
  });

  // Inject styles
  if (!SOS.$('#sos-vpn-css')) {
    const s = document.createElement('style'); s.id = 'sos-vpn-css';
    s.textContent = `
.vpn-app{display:flex;flex-direction:column;height:100%;background:linear-gradient(135deg,#0a0f1a,#0d1520);color:#e0e0e0;font-family:Inter,sans-serif;overflow:hidden}
.vpn-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid rgba(255,255,255,.06)}
.vpn-title{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:600}
.vpn-title svg{color:#00ff88}
.vpn-badges{display:flex;gap:6px}
.vpn-badge{padding:3px 8px;border-radius:4px;font-size:10px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.5)}
.vpn-badge.gaming{background:rgba(0,255,136,.15);color:#00ff88}
.vpn-main{display:flex;flex:1;overflow:hidden}
.vpn-left{width:400px;display:flex;flex-direction:column;padding:16px;gap:16px;border-right:1px solid rgba(255,255,255,.06)}
.vpn-connect-area{display:flex;flex-direction:column;align-items:center;gap:8px}
.vpn-big-btn{width:140px;height:140px;border-radius:50%;border:3px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;transition:all .3s;color:#aaa}
.vpn-big-btn:hover{border-color:rgba(96,205,255,.3);background:rgba(96,205,255,.05)}
.vpn-big-btn.connecting{border-color:rgba(255,165,0,.5);animation:vpn-pulse 1.5s infinite}
.vpn-big-btn.connected{border-color:rgba(0,255,136,.5);background:rgba(0,255,136,.05);color:#00ff88}
.vpn-big-text{font-size:13px;font-weight:600}
.vpn-status-text{font-size:12px;color:rgba(255,255,255,.4)}
.vpn-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.vpn-stat-card{background:rgba(255,255,255,.03);border-radius:8px;padding:10px;text-align:center}
.vpn-stat-label{font-size:10px;color:rgba(255,255,255,.4);margin-bottom:4px}
.vpn-stat-value{font-size:20px;font-weight:700;color:#60CDFF;font-family:'JetBrains Mono',monospace}
.vpn-stat-unit{font-size:10px;color:rgba(255,255,255,.3)}
.vpn-bandwidth{flex:1}
.vpn-bw-header{display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px;color:rgba(255,255,255,.5)}
.vpn-bw-values{font-family:'JetBrains Mono',monospace;font-size:11px}
#vpn-bw-canvas{width:100%;border-radius:8px;background:rgba(0,0,0,.3)}
.vpn-right{flex:1;display:flex;flex-direction:column;padding:16px;gap:12px;overflow-y:auto}
.vpn-map-area{position:relative;height:180px;background:rgba(0,0,0,.2);border-radius:10px;overflow:hidden}
.vpn-map{width:100%;height:100%}
.vpn-servers{position:absolute;inset:0}
.vpn-server-dot{position:absolute;width:10px;height:10px;border-radius:50%;background:rgba(96,205,255,.5);border:2px solid transparent;cursor:pointer;transform:translate(-50%,-50%);transition:all .2s}
.vpn-server-dot:hover{transform:translate(-50%,-50%) scale(1.5)}
.vpn-server-dot.active{background:#00ff88;border-color:#00ff88;box-shadow:0 0 12px rgba(0,255,136,.4)}
.vpn-server-list{display:flex;flex-direction:column;gap:4px}
.vpn-server-item{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:13px;background:rgba(255,255,255,.02);transition:background .2s}
.vpn-server-item:hover{background:rgba(255,255,255,.06)}
.vpn-server-item.active{background:rgba(0,255,136,.08);border-left:3px solid #00ff88}
.vpn-server-flag{font-size:11px;font-weight:700;color:rgba(255,255,255,.6);min-width:24px}
.vpn-server-name{flex:1}
.vpn-server-ping{font-family:'JetBrains Mono',monospace;font-size:11px;color:#60CDFF}
.vpn-options{display:flex;flex-direction:column;gap:6px;padding-top:8px;border-top:1px solid rgba(255,255,255,.06)}
.vpn-option{display:flex;align-items:center;justify-content:space-between;font-size:12px;color:rgba(255,255,255,.6)}
.vpn-select{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#e0e0e0;border-radius:6px;padding:4px 8px;font-size:11px}
.vpn-checkbox{accent-color:#00ff88}
@keyframes vpn-pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,165,0,.3)}50%{box-shadow:0 0 20px 8px rgba(255,165,0,.1)}}
@media(max-width:768px){.vpn-main{flex-direction:column}.vpn-left{width:100%;border-right:none;border-bottom:1px solid rgba(255,255,255,.06)}}
    `;
    document.head.appendChild(s);
  }
})();
