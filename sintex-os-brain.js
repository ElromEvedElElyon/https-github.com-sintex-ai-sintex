/* SintexOS AI Brain — Model Dashboard + BitNet Ternary HUD */
(function () {
  const I = SOS.ICO;

  const MODELS = [
    { id: 'deepseek', name: 'DeepSeek V3', params: '671B', arch: 'MoE (37B active)', license: 'MIT', color: '#a855f7', provider: 'deepseek', status: 'online' },
    { id: 'llama', name: 'Llama 3.3', params: '70B', arch: 'Dense Transformer', license: 'Meta', color: '#3b82f6', provider: 'groq', status: 'online' },
    { id: 'qwen', name: 'Qwen 2.5', params: '235B', arch: 'MoE (22B active)', license: 'Apache 2.0', color: '#f97316', provider: 'together', status: 'online' },
    { id: 'gemini', name: 'Gemini 2.0 Flash', params: 'Unknown', arch: 'Multimodal', license: 'Google', color: '#34a853', provider: 'gemini', status: 'online' },
    { id: 'grok', name: 'Grok 3', params: 'Unknown', arch: 'Dense + Web Search', license: 'xAI', color: '#ef4444', provider: 'xai', status: 'online' },
    { id: 'bitnet', name: 'BitNet b1.58', params: '2B', arch: 'Ternary {-1,0,1}', license: 'MIT', color: '#00ff88', provider: 'local', status: 'standby' },
  ];

  let ternaryCanvas, ternaryCtx, ternaryAnim;
  let lastProvider = null;

  SOS.on('searchComplete', (data) => {
    if (data?.provider) lastProvider = data.provider;
  });

  function renderBrain() {
    const el = SOS.h('div', { className: 'brain-app' });

    // Header
    const header = SOS.h('div', { className: 'brain-header' });
    header.innerHTML = `
      <div class="brain-title">${I.brain} <span>AI Brain — Neural Core Dashboard</span></div>
      <div class="brain-stats">
        <span class="brain-stat"><strong>6</strong> Models</span>
        <span class="brain-stat"><strong>~1T+</strong> Total Parameters</span>
        <span class="brain-stat">Last: <span id="brain-last-provider">auto</span></span>
      </div>`;
    el.appendChild(header);

    // Main layout: cards left, HUD right
    const main = SOS.h('div', { className: 'brain-main' });

    // Model cards grid
    const grid = SOS.h('div', { className: 'brain-grid' });
    MODELS.forEach(m => {
      const card = SOS.h('div', { className: `brain-card ${m.status}` });
      card.style.borderColor = m.color + '40';
      card.innerHTML = `
        <div class="brain-card-head">
          <div class="brain-card-dot" style="background:${m.color}"></div>
          <div class="brain-card-name">${m.name}</div>
          <label class="brain-toggle">
            <input type="checkbox" ${m.status === 'online' ? 'checked' : ''} data-model="${m.id}">
            <span class="brain-toggle-slider"></span>
          </label>
        </div>
        <div class="brain-card-body">
          <div class="brain-card-row"><span>Parameters</span><span style="color:${m.color}">${m.params}</span></div>
          <div class="brain-card-row"><span>Architecture</span><span>${m.arch}</span></div>
          <div class="brain-card-row"><span>License</span><span>${m.license}</span></div>
          <div class="brain-card-row"><span>Provider</span><span>${m.provider}</span></div>
          <div class="brain-card-row"><span>Status</span><span class="brain-status-${m.status}">${m.status.toUpperCase()}</span></div>
        </div>
        <div class="brain-card-latency">
          <canvas class="brain-spark" width="120" height="30" data-model="${m.id}"></canvas>
          <span class="brain-ping" id="brain-ping-${m.id}">--ms</span>
        </div>`;
      grid.appendChild(card);

      // Toggle handler
      card.querySelector('input').onchange = (e) => {
        const model = MODELS.find(x => x.id === e.target.dataset.model);
        if (model) model.status = e.target.checked ? 'online' : 'offline';
        card.className = `brain-card ${model.status}`;
      };
    });
    main.appendChild(grid);

    // BitNet Ternary HUD
    const hud = SOS.h('div', { className: 'brain-hud' });
    hud.innerHTML = `
      <div class="brain-hud-title">BitNet Ternary Core</div>
      <canvas id="brain-ternary" width="280" height="320"></canvas>
      <div class="brain-hud-info">
        <div class="brain-hud-row"><span>Encoding</span><span style="color:#00ff88">{-1, 0, +1}</span></div>
        <div class="brain-hud-row"><span>Bit Width</span><span>1.58-bit</span></div>
        <div class="brain-hud-row"><span>Speedup</span><span style="color:#60CDFF">2.37x — 6.17x</span></div>
        <div class="brain-hud-row"><span>Energy Save</span><span style="color:#00ff88">55% — 82%</span></div>
      </div>
      <div class="brain-energy">
        <div class="brain-energy-label">Energy Comparison</div>
        <div class="brain-energy-bars">
          <div class="brain-energy-bar">
            <span>Traditional FP16</span>
            <div class="brain-bar-track"><div class="brain-bar-fill" style="width:100%;background:#ff4444"></div></div>
            <span>100W</span>
          </div>
          <div class="brain-energy-bar">
            <span>BitNet 1.58-bit</span>
            <div class="brain-bar-track"><div class="brain-bar-fill" style="width:22%;background:#00ff88"></div></div>
            <span>22W</span>
          </div>
        </div>
      </div>`;
    main.appendChild(hud);
    el.appendChild(main);

    // Test buttons
    const controls = SOS.h('div', { className: 'brain-controls' });
    const testBtn = SOS.h('button', { className: 'brain-test-btn' });
    testBtn.textContent = 'Test All Models';
    testBtn.onclick = () => testModels(el);
    controls.appendChild(testBtn);

    const routeBtn = SOS.h('button', { className: 'brain-test-btn secondary' });
    routeBtn.textContent = 'Smart Route Query';
    routeBtn.onclick = () => {
      const q = prompt('Enter query for AI Brain:');
      if (q) routeQuery(q, el);
    };
    controls.appendChild(routeBtn);
    el.appendChild(controls);

    // Initialize ternary animation after DOM
    setTimeout(() => {
      ternaryCanvas = el.querySelector('#brain-ternary');
      if (ternaryCanvas) {
        ternaryCtx = ternaryCanvas.getContext('2d');
        startTernaryAnimation();
      }
      initSparklines(el);
    }, 100);

    return el;
  }

  function startTernaryAnimation() {
    if (ternaryAnim) cancelAnimationFrame(ternaryAnim);
    const c = ternaryCanvas, ctx = ternaryCtx;
    if (!c || !ctx) return;
    const W = c.width, H = c.height;
    const cols = Math.floor(W / 14);
    const drops = new Array(cols).fill(0).map(() => Math.random() * H);
    const values = ['-1', ' 0', '+1'];
    const colors = { '-1': '#ff4444', ' 0': 'rgba(255,255,255,0.2)', '+1': '#00ff88' };

    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = '11px "JetBrains Mono", monospace';

      for (let i = 0; i < cols; i++) {
        const val = values[Math.floor(Math.random() * 3)];
        ctx.fillStyle = colors[val];
        ctx.fillText(val, i * 14, drops[i]);
        if (drops[i] > H && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 14;
      }

      // Arc reactor center glow
      const cx = W / 2, cy = H / 2;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
      grd.addColorStop(0, 'rgba(96,205,255,0.08)');
      grd.addColorStop(1, 'rgba(96,205,255,0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(cx, cy, 40, 0, Math.PI * 2); ctx.fill();

      ternaryAnim = requestAnimationFrame(draw);
    };
    draw();
  }

  function initSparklines(el) {
    MODELS.forEach(m => {
      const canvas = el.querySelector(`.brain-spark[data-model="${m.id}"]`);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      const data = Array.from({ length: 20 }, () => 20 + Math.random() * 60);

      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = m.color + '80';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      data.forEach((v, i) => {
        const x = (i / (data.length - 1)) * W;
        const y = H - (v / 100) * H;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Fill under
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      ctx.fillStyle = m.color + '10';
      ctx.fill();
    });
  }

  async function testModels(el) {
    for (const m of MODELS) {
      if (m.status !== 'online') continue;
      const pingEl = el.querySelector(`#brain-ping-${m.id}`);
      if (pingEl) pingEl.textContent = '...';
      const start = performance.now();
      try {
        await fetch('/api/ai-brain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'ping', model: m.provider })
        });
        const ms = Math.round(performance.now() - start);
        if (pingEl) pingEl.textContent = ms + 'ms';
      } catch {
        if (pingEl) pingEl.textContent = 'ERR';
      }
    }
  }

  async function routeQuery(query, el) {
    SOS.toast('Routing query through AI Brain...');
    try {
      const res = await fetch('/api/ai-brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      const lp = el.querySelector('#brain-last-provider');
      if (lp) lp.textContent = data.provider || 'unknown';
      SOS.toast(`Routed via ${data.provider}. Answer ready.`);
      SOS.emit('searchComplete', data);
    } catch (e) {
      SOS.toast('Brain routing failed');
    }
  }

  SOS.registerApp({
    id: 'brain',
    name: 'AI Brain',
    icon: I.brain,
    pin: true,
    w: 920, h: 620,
    color: '#a855f7',
    render: renderBrain
  });

  // Inject styles
  if (!SOS.$('#sos-brain-css')) {
    const s = document.createElement('style'); s.id = 'sos-brain-css';
    s.textContent = `
.brain-app{display:flex;flex-direction:column;height:100%;background:#0a0a1a;color:#e0e0e0;font-family:Inter,sans-serif;overflow:hidden}
.brain-header{padding:16px 20px;border-bottom:1px solid rgba(255,255,255,.06)}
.brain-title{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:600}
.brain-title svg{color:#60CDFF}
.brain-stats{display:flex;gap:16px;margin-top:8px;font-size:12px;color:rgba(255,255,255,.5)}
.brain-stat strong{color:#60CDFF}
.brain-main{display:flex;flex:1;overflow:hidden}
.brain-grid{flex:1;display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;padding:16px;overflow-y:auto;align-content:start}
.brain-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:14px;transition:all .2s}
.brain-card:hover{background:rgba(255,255,255,.06)}
.brain-card.offline{opacity:.5}
.brain-card-head{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.brain-card-dot{width:8px;height:8px;border-radius:50%}
.brain-card-name{flex:1;font-weight:600;font-size:14px}
.brain-toggle{position:relative;width:36px;height:20px;cursor:pointer}
.brain-toggle input{display:none}
.brain-toggle-slider{position:absolute;inset:0;background:rgba(255,255,255,.15);border-radius:10px;transition:.2s}
.brain-toggle-slider:before{content:'';position:absolute;width:16px;height:16px;border-radius:50%;background:#fff;top:2px;left:2px;transition:.2s}
.brain-toggle input:checked+.brain-toggle-slider{background:#60CDFF}
.brain-toggle input:checked+.brain-toggle-slider:before{left:18px}
.brain-card-body{display:flex;flex-direction:column;gap:4px}
.brain-card-row{display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,.5)}
.brain-card-row span:last-child{color:rgba(255,255,255,.8)}
.brain-status-online{color:#00ff88!important}
.brain-status-standby{color:#ffa500!important}
.brain-status-offline{color:#666!important}
.brain-card-latency{display:flex;align-items:center;gap:8px;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.05)}
.brain-ping{font-size:11px;font-family:'JetBrains Mono',monospace;color:#60CDFF;min-width:40px;text-align:right}
.brain-hud{width:300px;border-left:1px solid rgba(255,255,255,.06);padding:16px;display:flex;flex-direction:column;gap:12px;overflow-y:auto}
.brain-hud-title{font-size:13px;font-weight:600;color:#00ff88;text-align:center}
#brain-ternary{border-radius:8px;background:#000;width:100%}
.brain-hud-info{display:flex;flex-direction:column;gap:4px}
.brain-hud-row{display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,.5)}
.brain-hud-row span:last-child{font-family:'JetBrains Mono',monospace}
.brain-energy{margin-top:8px}
.brain-energy-label{font-size:11px;color:rgba(255,255,255,.5);margin-bottom:6px}
.brain-energy-bar{display:flex;align-items:center;gap:6px;font-size:10px;color:rgba(255,255,255,.6);margin-bottom:4px}
.brain-bar-track{flex:1;height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden}
.brain-bar-fill{height:100%;border-radius:3px;transition:width 1s}
.brain-controls{display:flex;gap:8px;padding:12px 20px;border-top:1px solid rgba(255,255,255,.06)}
.brain-test-btn{padding:8px 16px;border:none;border-radius:8px;background:#60CDFF;color:#000;font-size:12px;font-weight:600;cursor:pointer}
.brain-test-btn.secondary{background:rgba(255,255,255,.08);color:#e0e0e0}
.brain-test-btn:hover{opacity:.85}
@media(max-width:768px){.brain-main{flex-direction:column}.brain-hud{width:100%;border-left:none;border-top:1px solid rgba(255,255,255,.06)}}
    `;
    document.head.appendChild(s);
  }
})();
