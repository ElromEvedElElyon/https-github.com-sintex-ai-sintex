/* SintexOS OpenClaw + PicoClaw — Agent Communication Apps */
(function () {
  const I = SOS.ICO;

  // ======================== SHARED STATE ========================
  let ws = null;
  let rawLog = [];
  let picoConnected = false;
  const PICO_URL = 'http://localhost:18790/v1/chat/completions';
  const RELAY_URL = '/api/ws-relay';

  function ts() { return new Date().toLocaleTimeString('en-US', { hour12: false }); }

  function bubbleHTML(role, text, agent) {
    const cls = role === 'user' ? 'oc-msg-user' : 'oc-msg-agent';
    const label = role === 'user' ? 'You' : SOS.esc(agent || 'Agent');
    return `<div class="oc-msg ${cls}">
      <div class="oc-msg-label">${label} <span class="oc-msg-time">${ts()}</span></div>
      <div class="oc-msg-bubble">${SOS.esc(text)}</div></div>`;
  }

  function statusDot(state) {
    const colors = { connected: '#0f0', disconnected: '#888', error: '#f44', relay: '#fa0' };
    const labels = { connected: 'Connected', disconnected: 'Disconnected', error: 'Error', relay: 'HTTP Relay' };
    return `<span class="oc-dot" style="background:${colors[state] || '#888'}"></span>
            <span class="oc-status-text">${labels[state] || state}</span>`;
  }

  // ======================== APP 1: OPENCLAW ========================
  SOS.registerApp({
    id: 'openclaw', name: 'OpenClaw', icon: I.openclaw,
    pin: true, w: 860, h: 580, color: '#00FF88',
    render: renderOpenClaw
  });

  function renderOpenClaw() {
    const el = SOS.h('div', { className: 'app-openclaw' });
    let status = ws && ws.readyState === 1 ? 'connected' : 'disconnected';
    let selectedAgent = 'main';
    let showRaw = false;

    el.innerHTML = `
      <style>
        .app-openclaw{display:flex;flex-direction:column;height:100%;font-family:inherit;color:#e0e0e0}
        .oc-bar{display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(0,0,0,.35);border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0}
        .oc-dot{width:8px;height:8px;border-radius:50%;display:inline-block}
        .oc-status-text{font-size:11px;opacity:.8}
        .oc-bar input{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:5px 10px;color:#fff;font-size:12px;min-width:180px}
        .oc-bar select{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:5px 8px;color:#fff;font-size:12px}
        .oc-bar button{padding:5px 14px;border:none;border-radius:6px;font-size:12px;cursor:pointer;font-weight:600}
        .oc-btn-connect{background:#00ff88;color:#000}.oc-btn-connect:hover{background:#00cc6e}
        .oc-btn-disconnect{background:#f44;color:#fff}.oc-btn-disconnect:hover{background:#c33}
        .oc-btn-raw{background:rgba(255,255,255,.08);color:#aaa}.oc-btn-raw.active{background:rgba(0,255,136,.15);color:#0f8}
        .oc-chat{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:6px}
        .oc-msg{max-width:80%;animation:ocFade .2s ease}
        .oc-msg-user{align-self:flex-end}.oc-msg-agent{align-self:flex-start}
        .oc-msg-label{font-size:10px;opacity:.5;margin-bottom:2px;padding:0 8px}
        .oc-msg-user .oc-msg-label{text-align:right}
        .oc-msg-bubble{padding:8px 14px;border-radius:14px;font-size:13px;line-height:1.5;word-break:break-word}
        .oc-msg-user .oc-msg-bubble{background:rgba(0,255,136,.15);border:1px solid rgba(0,255,136,.25);border-bottom-right-radius:4px}
        .oc-msg-agent .oc-msg-bubble{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-bottom-left-radius:4px}
        .oc-msg-time{font-size:9px;opacity:.4}
        .oc-input-row{display:flex;gap:8px;padding:10px 12px;background:rgba(0,0,0,.25);border-top:1px solid rgba(255,255,255,.07);flex-shrink:0}
        .oc-input-row input{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px 16px;color:#fff;font-size:13px}
        .oc-input-row input::placeholder{color:rgba(255,255,255,.3)}
        .oc-input-row button{background:#00ff88;color:#000;border:none;border-radius:10px;padding:10px 20px;font-weight:700;cursor:pointer;font-size:13px}
        .oc-input-row button:hover{background:#00cc6e}
        .oc-raw{background:rgba(0,0,0,.5);border-top:1px solid rgba(255,255,255,.07);max-height:160px;overflow-y:auto;padding:8px 12px;font-family:'Cascadia Code',monospace;font-size:11px;color:#0f8;display:none;flex-shrink:0}
        .oc-raw.visible{display:block}
        .oc-raw-in{color:#0af}.oc-raw-out{color:#0f8}
        .oc-empty{text-align:center;opacity:.3;padding:60px 20px;font-size:14px}
        @keyframes ocFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
      </style>
      <div class="oc-bar">
        <span id="oc-status">${statusDot(status)}</span>
        <input id="oc-url" value="${SOS.esc(SOS.load('oc-url') || 'ws://127.0.0.1:18789')}" placeholder="Gateway URL">
        <select id="oc-agent"><option value="main">JARVIS (main)</option><option value="bitnet">BitNet</option><option value="custom">Custom</option></select>
        <button id="oc-conn" class="${status === 'connected' ? 'oc-btn-disconnect' : 'oc-btn-connect'}">${status === 'connected' ? 'Disconnect' : 'Connect'}</button>
        <button id="oc-raw-btn" class="oc-btn-raw">RAW</button>
      </div>
      <div class="oc-chat" id="oc-chat">
        <div class="oc-empty">Connect to OpenClaw gateway or use HTTP relay to start chatting.</div>
      </div>
      <div class="oc-raw" id="oc-raw"></div>
      <div class="oc-input-row">
        <input id="oc-input" placeholder="Message agent..." autocomplete="off">
        <button id="oc-send">Send</button>
      </div>`;

    const $status = el.querySelector('#oc-status');
    const $url = el.querySelector('#oc-url');
    const $agent = el.querySelector('#oc-agent');
    const $conn = el.querySelector('#oc-conn');
    const $rawBtn = el.querySelector('#oc-raw-btn');
    const $chat = el.querySelector('#oc-chat');
    const $raw = el.querySelector('#oc-raw');
    const $input = el.querySelector('#oc-input');
    const $send = el.querySelector('#oc-send');
    let chatStarted = false;

    function updateStatus(s) {
      status = s;
      $status.innerHTML = statusDot(s);
      $conn.textContent = s === 'connected' ? 'Disconnect' : 'Connect';
      $conn.className = s === 'connected' ? 'oc-btn-disconnect' : 'oc-btn-connect';
    }

    function logRaw(dir, data) {
      const line = typeof data === 'string' ? data : JSON.stringify(data);
      rawLog.push({ dir, line, t: ts() });
      if (rawLog.length > 200) rawLog.shift();
      const cls = dir === 'out' ? 'oc-raw-out' : 'oc-raw-in';
      $raw.innerHTML += `<div class="${cls}">[${ts()} ${dir.toUpperCase()}] ${SOS.esc(line)}</div>`;
      $raw.scrollTop = $raw.scrollHeight;
    }

    function addMsg(role, text, agent) {
      if (!chatStarted) { $chat.innerHTML = ''; chatStarted = true; }
      $chat.insertAdjacentHTML('beforeend', bubbleHTML(role, text, agent));
      $chat.scrollTop = $chat.scrollHeight;
    }

    function handleFrame(data) {
      logRaw('in', data);
      if (data.type === 'res' || data.result) {
        const text = data.result?.content || data.result?.text || data.content || JSON.stringify(data.result || data);
        addMsg('agent', text, $agent.value);
      } else if (data.type === 'event' && data.event === 'message') {
        addMsg('agent', data.data?.content || JSON.stringify(data.data), $agent.value);
      } else if (data.error) {
        addMsg('agent', 'Error: ' + (data.error.message || JSON.stringify(data.error)), 'System');
        SOS.sound('error');
      }
    }

    function fallbackMode() {
      updateStatus('relay');
      SOS.toast('Using HTTP relay mode');
    }

    function connectWS(url) {
      if (ws) { ws.close(); ws = null; }
      try {
        ws = new WebSocket(url);
        ws.onopen = () => { updateStatus('connected'); SOS.sound('connect'); logRaw('in', '-- connected --'); };
        ws.onmessage = (e) => { try { handleFrame(JSON.parse(e.data)); } catch { logRaw('in', e.data); } };
        ws.onerror = () => { updateStatus('error'); SOS.sound('error'); fallbackMode(); };
        ws.onclose = () => { updateStatus('disconnected'); ws = null; logRaw('in', '-- disconnected --'); };
      } catch (err) { fallbackMode(); }
    }

    function disconnectWS() {
      if (ws) { ws.close(); ws = null; }
      updateStatus('disconnected');
    }

    async function sendMessage(text) {
      if (!text.trim()) return;
      addMsg('user', text);
      $input.value = '';
      const agent = $agent.value;

      if (ws && ws.readyState === 1) {
        const frame = { type: 'req', id: Date.now().toString(), method: 'message', params: { agent: agent, content: text } };
        ws.send(JSON.stringify(frame));
        logRaw('out', frame);
      } else {
        try {
          const relayBody = { agent, message: text };
          const ck = SOS.load('claude-api-key');
          if (ck) relayBody.apiKey = ck;
          logRaw('out', { agent, message: text, via: 'relay' });
          const res = await fetch(RELAY_URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(relayBody)
          });
          if (!res.ok) throw new Error('Relay returned ' + res.status);
          const data = await res.json();
          const reply = data.content || data.text || data.result || JSON.stringify(data);
          addMsg('agent', reply, agent);
          logRaw('in', data);
          SOS.sound('message');
        } catch (err) {
          addMsg('agent', 'Relay error: ' + err.message, 'System');
          SOS.sound('error');
        }
      }
    }

    // Event wiring
    $conn.onclick = () => {
      if (status === 'connected') { disconnectWS(); } else {
        const url = $url.value.trim();
        SOS.save('oc-url', url);
        connectWS(url);
      }
    };
    $rawBtn.onclick = () => { showRaw = !showRaw; $raw.classList.toggle('visible', showRaw); $rawBtn.classList.toggle('active', showRaw); };
    $send.onclick = () => sendMessage($input.value);
    $input.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage($input.value); } };

    // Auto-restore agent selection
    $agent.value = SOS.load('oc-agent') || 'main';
    $agent.onchange = () => SOS.save('oc-agent', $agent.value);

    return el;
  }

  // ======================== APP 2: PICOCLAW ========================
  SOS.registerApp({
    id: 'picoclaw', name: 'PicoClaw', icon: I.picoclaw,
    pin: false, w: 800, h: 540, color: '#B4A0FF',
    render: renderPicoClaw
  });

  function renderPicoClaw() {
    const el = SOS.h('div', { className: 'app-picoclaw' });
    let picoStatus = 'disconnected';
    let selectedModel = 'picoclaw-1b';
    let pcChatStarted = false;

    const tools = [
      { id: 'web_search', name: 'Web Search', desc: 'Search the web for real-time information using multiple engines.' },
      { id: 'web_fetch', name: 'Web Fetch', desc: 'Fetch and parse content from any URL, returns clean text.' },
      { id: 'memory', name: 'Memory', desc: 'Persistent key-value store that survives restarts. <10ms reads.' },
      { id: 'cron', name: 'Cron', desc: 'Schedule tasks with cron expressions. Background execution.' },
      { id: 'spawn', name: 'Spawn', desc: 'Launch sub-agents for parallel task execution.' },
      { id: 'file_read', name: 'File Read', desc: 'Read local files with path resolution and encoding detection.' }
    ];

    el.innerHTML = `
      <style>
        .app-picoclaw{display:flex;height:100%;font-family:inherit;color:#e0e0e0}
        .pc-side{width:200px;background:rgba(0,0,0,.3);border-right:1px solid rgba(255,255,255,.07);display:flex;flex-direction:column;overflow-y:auto;flex-shrink:0}
        .pc-side-section{padding:12px}
        .pc-side-title{font-size:10px;text-transform:uppercase;letter-spacing:1px;opacity:.4;margin-bottom:8px}
        .pc-info{background:rgba(180,160,255,.08);border:1px solid rgba(180,160,255,.15);border-radius:8px;padding:10px;font-size:11px;line-height:1.7}
        .pc-info b{color:#b4a0ff}
        .pc-info .pc-dot{width:6px;height:6px;border-radius:50%;display:inline-block;margin-right:4px}
        .pc-tools{list-style:none;padding:0;margin:0}
        .pc-tools li{padding:7px 10px;border-radius:6px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:6px;transition:background .15s}
        .pc-tools li:hover{background:rgba(180,160,255,.1)}
        .pc-tools li.active{background:rgba(180,160,255,.15)}
        .pc-tool-icon{width:6px;height:6px;border-radius:50%;background:#b4a0ff;flex-shrink:0}
        .pc-tool-desc{font-size:11px;color:rgba(255,255,255,.45);padding:6px 10px 10px 22px;display:none;line-height:1.5}
        .pc-tool-desc.show{display:block}
        .pc-model{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:6px 8px;color:#fff;font-size:11px;margin-top:6px}
        .pc-main{flex:1;display:flex;flex-direction:column;min-width:0}
        .pc-header{display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(0,0,0,.2);border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0}
        .pc-header-title{font-size:13px;font-weight:600;color:#b4a0ff}
        .pc-chat{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:6px}
        .pc-empty{text-align:center;opacity:.3;padding:50px 20px;font-size:13px}
        .pc-input-row{display:flex;gap:8px;padding:10px 12px;background:rgba(0,0,0,.25);border-top:1px solid rgba(255,255,255,.07);flex-shrink:0}
        .pc-input-row input{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px 16px;color:#fff;font-size:13px}
        .pc-input-row input::placeholder{color:rgba(255,255,255,.3)}
        .pc-input-row button{background:#b4a0ff;color:#000;border:none;border-radius:10px;padding:10px 18px;font-weight:700;cursor:pointer;font-size:13px}
        .pc-input-row button:hover{background:#9b85e6}
        .oc-msg{max-width:85%}.oc-msg-user{align-self:flex-end}.oc-msg-agent{align-self:flex-start}
        .oc-msg-label{font-size:10px;opacity:.5;margin-bottom:2px;padding:0 8px}
        .oc-msg-user .oc-msg-label{text-align:right}
        .oc-msg-bubble{padding:8px 14px;border-radius:14px;font-size:13px;line-height:1.5;word-break:break-word}
        .oc-msg-user .oc-msg-bubble{background:rgba(180,160,255,.15);border:1px solid rgba(180,160,255,.25);border-bottom-right-radius:4px}
        .oc-msg-agent .oc-msg-bubble{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-bottom-left-radius:4px}
      </style>
      <div class="pc-side">
        <div class="pc-side-section">
          <div class="pc-side-title">System</div>
          <div class="pc-info">
            <b>PicoClaw v1.0</b><br>
            Memory: &lt;10MB<br>
            Startup: &lt;1s<br>
            Status: <span class="pc-dot" id="pc-dot" style="background:#888"></span><span id="pc-status-text">Offline</span>
          </div>
        </div>
        <div class="pc-side-section">
          <div class="pc-side-title">Tools</div>
          <ul class="pc-tools" id="pc-tools">
            ${tools.map(t => `<li data-id="${t.id}"><span class="pc-tool-icon"></span>${SOS.esc(t.name)}</li><div class="pc-tool-desc" data-for="${t.id}">${t.desc}</div>`).join('')}
          </ul>
        </div>
        <div class="pc-side-section">
          <div class="pc-side-title">Model</div>
          <select class="pc-model" id="pc-model">
            <option value="picoclaw-1b">PicoClaw 1B</option>
            <option value="picoclaw-3b">PicoClaw 3B</option>
            <option value="bitnet-ternary">BitNet Ternary</option>
          </select>
        </div>
      </div>
      <div class="pc-main">
        <div class="pc-header">
          <span class="pc-header-title">PicoClaw Chat</span>
          <span style="font-size:11px;opacity:.4">Lightweight agent &bull; local inference</span>
        </div>
        <div class="pc-chat" id="pc-chat">
          <div class="pc-empty">PicoClaw is a lightweight local agent. Send a message to begin.</div>
        </div>
        <div class="pc-input-row">
          <input id="pc-input" placeholder="Ask PicoClaw..." autocomplete="off">
          <button id="pc-send">Send</button>
        </div>
      </div>`;

    const $chat = el.querySelector('#pc-chat');
    const $input = el.querySelector('#pc-input');
    const $send = el.querySelector('#pc-send');
    const $dot = el.querySelector('#pc-dot');
    const $statusText = el.querySelector('#pc-status-text');
    const $model = el.querySelector('#pc-model');

    // Tools toggle
    el.querySelectorAll('.pc-tools li').forEach(li => {
      li.onclick = () => {
        const id = li.dataset.id;
        const desc = el.querySelector(`.pc-tool-desc[data-for="${id}"]`);
        const wasActive = li.classList.contains('active');
        el.querySelectorAll('.pc-tools li').forEach(l => l.classList.remove('active'));
        el.querySelectorAll('.pc-tool-desc').forEach(d => d.classList.remove('show'));
        if (!wasActive) { li.classList.add('active'); desc.classList.add('show'); }
      };
    });

    $model.value = SOS.load('pc-model') || 'picoclaw-1b';
    $model.onchange = () => SOS.save('pc-model', $model.value);

    function updatePicoStatus(s) {
      picoStatus = s;
      picoConnected = (s === 'connected');
      const colors = { connected: '#0f0', disconnected: '#888', error: '#f44', relay: '#fa0' };
      const labels = { connected: 'Online', disconnected: 'Offline', error: 'Error', relay: 'Relay' };
      $dot.style.background = colors[s] || '#888';
      $statusText.textContent = labels[s] || s;
    }

    function addPicoMsg(role, text, agent) {
      if (!pcChatStarted) { $chat.innerHTML = ''; pcChatStarted = true; }
      const cls = role === 'user' ? 'oc-msg-user' : 'oc-msg-agent';
      const label = role === 'user' ? 'You' : SOS.esc(agent || 'PicoClaw');
      $chat.insertAdjacentHTML('beforeend',
        `<div class="oc-msg ${cls}">
          <div class="oc-msg-label">${label} <span class="oc-msg-time">${ts()}</span></div>
          <div class="oc-msg-bubble">${SOS.esc(text)}</div></div>`);
      $chat.scrollTop = $chat.scrollHeight;
    }

    async function checkPicoHealth() {
      try {
        const res = await fetch(PICO_URL.replace('/v1/chat/completions', '/health'), { signal: AbortSignal.timeout(2000) });
        if (res.ok) { updatePicoStatus('connected'); return; }
      } catch {}
      updatePicoStatus('relay');
    }

    async function sendPico(text) {
      if (!text.trim()) return;
      addPicoMsg('user', text);
      $input.value = '';
      selectedModel = $model.value;

      // Try local REST first
      if (picoStatus === 'connected') {
        try {
          const res = await fetch(PICO_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: selectedModel,
              messages: [{ role: 'user', content: text }],
              max_tokens: 1024,
              temperature: 0.7
            })
          });
          if (res.ok) {
            const data = await res.json();
            const reply = data.choices?.[0]?.message?.content || JSON.stringify(data);
            addPicoMsg('agent', reply, 'PicoClaw');
            SOS.sound('message');
            return;
          }
        } catch {}
        updatePicoStatus('relay');
      }

      // Fallback to relay (with Claude key if available)
      try {
        const picoRelay = { agent: 'picoclaw', message: text };
        const picoKey = SOS.load('claude-api-key');
        if (picoKey) picoRelay.apiKey = picoKey;
        const res = await fetch(RELAY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(picoRelay)
        });
        if (!res.ok) throw new Error('Relay returned ' + res.status);
        const data = await res.json();
        const reply = data.content || data.text || data.result || JSON.stringify(data);
        addPicoMsg('agent', reply, 'PicoClaw');
        SOS.sound('message');
      } catch (err) {
        addPicoMsg('agent', 'Error: ' + err.message, 'System');
        SOS.sound('error');
      }
    }

    $send.onclick = () => sendPico($input.value);
    $input.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendPico($input.value); } };

    // Probe on render
    checkPicoHealth();

    return el;
  }

  // ======================== PUBLIC API ========================
  SOS.openclaw = {
    send: async (msg) => {
      if (ws && ws.readyState === 1) {
        const frame = { type: 'req', id: Date.now().toString(), method: 'message', params: { agent: 'main', content: msg } };
        ws.send(JSON.stringify(frame));
        return new Promise((resolve) => {
          const orig = ws.onmessage;
          ws.onmessage = (e) => {
            ws.onmessage = orig;
            try { const d = JSON.parse(e.data); resolve(d.result?.content || d.content || e.data); }
            catch { resolve(e.data); }
            if (orig) orig(e);
          };
        });
      }
      const relayB = { agent: 'main', message: msg };
      const cKey = SOS.load('claude-api-key');
      if (cKey) relayB.apiKey = cKey;
      const res = await fetch(RELAY_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(relayB)
      });
      const data = await res.json();
      return data.content || data.text || data.result || JSON.stringify(data);
    },
    status: () => ws && ws.readyState === 1 ? 'connected' : 'relay'
  };

  SOS.picoclaw = {
    send: async (msg) => {
      try {
        const res = await fetch(PICO_URL, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'picoclaw-1b', messages: [{ role: 'user', content: msg }], max_tokens: 1024 })
        });
        if (res.ok) {
          const data = await res.json();
          return data.choices?.[0]?.message?.content || JSON.stringify(data);
        }
      } catch {}
      const picoB = { agent: 'picoclaw', message: msg };
      const pKey = SOS.load('claude-api-key');
      if (pKey) picoB.apiKey = pKey;
      const res = await fetch(RELAY_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(picoB)
      });
      const data = await res.json();
      return data.content || data.text || data.result || JSON.stringify(data);
    },
    status: () => picoConnected ? 'connected' : 'relay'
  };

})();
