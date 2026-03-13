/* SintexOS Shell — Taskbar, Start Menu, Search, Notifications, Action Center, Widgets */
(function () {
  const S = SOS.state;

  SOS.on('initShell', () => {
    initTaskbar(); initStart(); initSearch(); initCtx(); initClock();
    initCopilot(); initNotifyCenter(); initActionCenter(); initWidgets();
  });

  // ===== TASKBAR =====
  function initTaskbar() {
    SOS.$('#tb-start').onclick = () => SOS.emit('toggleStart');
    SOS.$('#tb-search-btn').onclick = () => SOS.emit('toggleSearch');
    SOS.$('#tb-copilot').onclick = () => toggleCopilot();
    SOS.$('#tb-widgets').onclick = () => toggleWidgets();
    SOS.$('#tb-notify').onclick = () => toggleNotifyCenter();
    SOS.$('#tb-tray-icons').onclick = () => toggleActionCenter();

    const tb = SOS.$('#tb-apps'); tb.innerHTML = '';
    SOS.apps.filter(a => a.pin).forEach(app => {
      const btn = SOS.h('button', { className: 'tb-app-btn', title: app.name });
      btn.innerHTML = app.icon; btn.dataset.app = app.id;
      btn.onclick = () => SOS.emit('openApp', app.id);
      tb.appendChild(btn);
    });
  }

  SOS.on('updateTB', () => {
    SOS.$$('.tb-app-btn').forEach(btn => {
      const id = btn.dataset.app;
      const wins = [...S.wins.entries()].filter(([, w]) => w.appId === id);
      btn.classList.toggle('running', wins.length > 0);
      btn.classList.toggle('active', wins.some(([k]) => k === S.focused));
    });
  });

  // ===== CLOCK =====
  function initClock() {
    const el = SOS.$('#tb-clock');
    const up = () => {
      const now = new Date();
      el.innerHTML = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
        '<br>' + now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };
    up(); setInterval(up, 30000);
  }

  // ===== START MENU =====
  let startOpen = false, allAppsView = false;
  function initStart() {
    const grid = SOS.$('#start-apps');
    const allAppsGrid = SOS.$('#start-all-apps');
    const pinnedLabel = SOS.$('#start-label');
    const allAppsBtn = SOS.$('#start-all-apps-btn');

    // Pinned apps
    SOS.apps.forEach(app => {
      const el = SOS.h('div', { className: 's-app' });
      el.innerHTML = `<div class="s-app-icon">${app.icon}</div><div class="s-app-name">${app.name}</div>`;
      el.onclick = () => { SOS.emit('openApp', app.id); SOS.emit('toggleStart', false) };
      grid.appendChild(el);
    });

    // All apps list
    if (allAppsGrid) {
      const sorted = [...SOS.apps].sort((a, b) => a.name.localeCompare(b.name));
      sorted.forEach(app => {
        const el = SOS.h('div', { className: 's-all-app' });
        el.innerHTML = `<div class="s-all-icon">${app.icon}</div><span>${app.name}</span>`;
        el.onclick = () => { SOS.emit('openApp', app.id); SOS.emit('toggleStart', false) };
        allAppsGrid.appendChild(el);
      });
    }

    if (allAppsBtn) {
      allAppsBtn.onclick = () => {
        allAppsView = !allAppsView;
        SOS.$('#start-pinned-section').classList.toggle('hidden', allAppsView);
        SOS.$('#start-all-section').classList.toggle('hidden', !allAppsView);
        allAppsBtn.textContent = allAppsView ? '← Back' : 'All apps →';
      };
    }

    // Recent
    const rec = SOS.$('#start-recent');
    if (rec) {
      const recents = [
        { name: 'Welcome to JARVIS', time: 'Just now', icon: SOS.ICO.jarvis },
        { name: 'BitNet Research', time: 'Today', icon: SOS.ICO.file },
        { name: 'AI Multi-Search', time: 'Today', icon: SOS.ICO.search },
      ];
      recents.forEach(r => {
        const el = SOS.h('div', { className: 's-recent' });
        el.innerHTML = `<div class="s-recent-icon">${r.icon}</div><div class="s-recent-info"><div class="s-recent-name">${r.name}</div><div class="s-recent-time">${r.time}</div></div>`;
        rec.appendChild(el);
      });
    }

    // Search filter
    SOS.$('#start-search').oninput = e => {
      const q = e.target.value.toLowerCase();
      SOS.$$('.s-app').forEach((el, i) => {
        el.style.display = SOS.apps[i].name.toLowerCase().includes(q) ? '' : 'none';
      });
    };

    // Power
    SOS.$('#start-power').onclick = () => { if (confirm('Exit SintexOS?')) location.href = '/' };

    // Close on outside
    document.addEventListener('click', e => {
      if (startOpen && !SOS.$('#start').contains(e.target) && !SOS.$('#tb-start').contains(e.target)) SOS.emit('toggleStart', false);
      if (S.searchOpen && !SOS.$('#search-flyout').contains(e.target) && !SOS.$('#tb-search-btn').contains(e.target)) SOS.emit('toggleSearch', false);
    });
  }

  SOS.on('toggleStart', force => {
    startOpen = typeof force === 'boolean' ? force : !startOpen;
    if (startOpen) SOS.emit('toggleSearch', false);
    SOS.$('#start').classList.toggle('hidden', !startOpen);
    SOS.$('#tb-start').classList.toggle('active', startOpen);
    if (startOpen) { SOS.$('#start-search').value = ''; SOS.$('#start-search').focus() }
    // Reset all apps view
    if (!startOpen && allAppsView) {
      allAppsView = false;
      const ps = SOS.$('#start-pinned-section'); if (ps) ps.classList.remove('hidden');
      const as = SOS.$('#start-all-section'); if (as) as.classList.add('hidden');
      const btn = SOS.$('#start-all-apps-btn'); if (btn) btn.textContent = 'All apps →';
    }
  });

  // ===== SEARCH FLYOUT =====
  function initSearch() {
    const list = SOS.$('#sf-apps-list');
    SOS.apps.forEach(app => {
      const el = SOS.h('div', { className: 'sf-item' });
      el.innerHTML = `${app.icon}<div><div class="sf-item-name">${app.name}</div></div>`;
      el.onclick = () => { SOS.emit('openApp', app.id); SOS.emit('toggleSearch', false) };
      list.appendChild(el);
    });
    const quick = SOS.$('#sf-quick');
    ['What is BitNet?', 'JARVIS status', 'OpenClaw agents', 'Bitcoin energy', 'STBTCx token', 'Sintex vs Perplexity'].forEach(q => {
      const el = SOS.h('div', { className: 'sf-item' });
      el.innerHTML = `${SOS.ICO.search}<div class="sf-item-name">${q}</div>`;
      el.onclick = () => { SOS.emit('openApp', 'search'); SOS.emit('toggleSearch', false) };
      quick.appendChild(el);
    });
    SOS.$('#sf-input').oninput = e => {
      const q = e.target.value.toLowerCase();
      SOS.$$('#sf-apps-list .sf-item').forEach((el, i) => {
        el.style.display = SOS.apps[i].name.toLowerCase().includes(q) ? '' : 'none';
      });
    };
    SOS.$('#sf-input').onkeydown = e => {
      if (e.key === 'Enter') { SOS.emit('openApp', 'search'); SOS.emit('toggleSearch', false) }
      if (e.key === 'Escape') SOS.emit('toggleSearch', false);
    };
  }

  SOS.on('toggleSearch', force => {
    S.searchOpen = typeof force === 'boolean' ? force : !S.searchOpen;
    if (S.searchOpen) SOS.emit('toggleStart', false);
    SOS.$('#search-flyout').classList.toggle('hidden', !S.searchOpen);
    if (S.searchOpen) { SOS.$('#sf-input').value = ''; SOS.$('#sf-input').focus() }
  });

  // ===== CONTEXT MENU =====
  function initCtx() {
    const ctx = SOS.$('#ctx');
    SOS.$('#desktop').addEventListener('contextmenu', e => {
      e.preventDefault(); ctx.classList.remove('hidden');
      ctx.style.left = Math.min(e.clientX, innerWidth - 240) + 'px';
      ctx.style.top = Math.min(e.clientY, innerHeight - 280) + 'px';
    });
    document.addEventListener('click', () => ctx.classList.add('hidden'));
    SOS.$$('.ctx-item').forEach(it => it.onclick = () => {
      const a = it.dataset.a;
      if (a === 'terminal') SOS.emit('openApp', 'terminal');
      if (a === 'notepad') SOS.emit('openApp', 'notepad');
      if (a === 'display' || a === 'personalize') SOS.emit('openApp', 'settings');
      if (a === 'refresh') { SOS.stopWP(); SOS.initWallpaper(); SOS.toast('Desktop refreshed') }
      ctx.classList.add('hidden');
    });
  }

  // ===== COPILOT / JARVIS SIDEBAR =====
  function initCopilot() {
    SOS.$('#copilot-close').onclick = () => toggleCopilot(false);
    const body = SOS.$('#copilot-body');
    const welcome = SOS.h('div', { className: 'co-msg ai' });
    welcome.innerHTML = `<div class="co-jarvis-badge">J.A.R.V.I.S</div>
<strong>${SOS.getGreeting()}, sir.</strong><br><br>I'm your AI assistant powered by the multi-AI search engine. I communicate with:<br><br>
<span class="co-provider">Groq</span> <span class="co-provider">Gemini</span> <span class="co-provider">Grok</span> <span class="co-provider">Together</span><br><br>
• Search and research any topic<br>• Real-time web results via Google<br>• Manage agents and system<br>• Navigate SintexOS<br><br>
<em style="color:var(--text3)">Type a question or command to begin.</em>`;
    body.appendChild(welcome);

    const send = async () => {
      const input = SOS.$('#copilot-ask');
      const text = input.value.trim(); if (!text) return; input.value = '';
      const um = SOS.h('div', { className: 'co-msg user' }); um.textContent = text; body.appendChild(um);
      const typing = SOS.h('div', { className: 'co-typing' });
      typing.innerHTML = '<span></span><span></span><span></span>'; body.appendChild(typing);
      body.scrollTop = body.scrollHeight;

      try {
        // Try multi-search first
        let result;
        try {
          const res = await fetch('/api/multi-search', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: text })
          });
          if (res.ok) result = await res.json();
        } catch {}

        // Fallback to legacy
        if (!result && typeof BitNetClient !== 'undefined') {
          result = await BitNetClient.search(text);
        }

        typing.remove();
        const am = SOS.h('div', { className: 'co-msg ai' });
        let html = (result?.answer || 'No response').replace(/\n/g, '<br>');
        // Provider badge
        if (result?.provider) {
          const prov = typeof result.provider === 'object' ? result.provider.llm : result.provider;
          html = `<div class="co-provider-badge">${prov}</div>` + html;
        }
        if (result?.sources?.length) {
          html += '<div class="co-sources">';
          result.sources.slice(0, 4).forEach((s, i) => {
            html += `<a href="${s.url || '#'}" target="_blank" class="co-source">[${i + 1}] ${s.title || 'Source'}</a>`;
          });
          html += '</div>';
        }
        am.innerHTML = html; body.appendChild(am);
      } catch {
        typing.remove();
        const em = SOS.h('div', { className: 'co-msg ai' });
        em.innerHTML = '<span style="color:var(--red)">Connection error. Retrying with local knowledge base.</span>';
        body.appendChild(em);
      }
      body.scrollTop = body.scrollHeight;
    };
    SOS.$('#copilot-send').onclick = send;
    SOS.$('#copilot-ask').onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } };
    SOS.$('#copilot-ask').oninput = function () { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 120) + 'px' };
  }

  function toggleCopilot(force) {
    const co = SOS.$('#copilot');
    const isOpen = !co.classList.contains('closed');
    const next = typeof force === 'boolean' ? force : !isOpen;
    co.classList.toggle('closed', !next);
    if (next) SOS.$('#copilot-ask').focus();
  }

  // ===== NOTIFICATION CENTER =====
  function initNotifyCenter() {
    SOS.on('notification', n => {
      const list = SOS.$('#nc-list'); if (!list) return;
      const el = SOS.h('div', { className: 'nc-item' });
      el.innerHTML = `<div class="nc-icon">${SOS.ICO[n.icon] || SOS.ICO.bell}</div>
        <div class="nc-content"><div class="nc-title">${n.title}</div><div class="nc-body">${n.body || ''}</div>
        <div class="nc-time">${n.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></div>
        <button class="nc-dismiss">×</button>`;
      el.querySelector('.nc-dismiss').onclick = () => el.remove();
      list.prepend(el);
    });
    const clearBtn = SOS.$('#nc-clear');
    if (clearBtn) clearBtn.onclick = () => { const l = SOS.$('#nc-list'); if (l) l.innerHTML = '' };
  }

  function toggleNotifyCenter() {
    const nc = SOS.$('#notify-center');
    if (nc) nc.classList.toggle('hidden');
    // Close others
    const ac = SOS.$('#action-center'); if (ac) ac.classList.add('hidden');
    const wg = SOS.$('#widgets-panel'); if (wg) wg.classList.add('hidden');
  }

  // ===== ACTION CENTER =====
  function initActionCenter() {
    const ac = SOS.$('#ac-toggles'); if (!ac) return;
    const toggles = [
      { name: 'Wi-Fi', icon: '📶', active: true },
      { name: 'Bluetooth', icon: '🔵', active: false },
      { name: 'Night Light', icon: '🌙', active: false },
      { name: 'Focus', icon: '🎯', active: false },
      { name: 'JARVIS', icon: '🤖', active: true },
      { name: 'BitNet', icon: '⚡', active: true },
    ];
    toggles.forEach(t => {
      const el = SOS.h('button', { className: `ac-toggle ${t.active ? 'on' : ''}` });
      el.innerHTML = `<span class="ac-icon">${t.icon}</span><span class="ac-name">${t.name}</span>`;
      el.onclick = () => {
        el.classList.toggle('on');
        if (t.name === 'Night Light') {
          document.body.classList.toggle('night-light', el.classList.contains('on'));
        }
      };
      ac.appendChild(el);
    });

    // Brightness slider
    const sliders = SOS.$('#ac-sliders'); if (!sliders) return;
    sliders.innerHTML = `
      <div class="ac-slider-row"><span>☀️</span><input type="range" min="50" max="100" value="100" class="ac-range" id="ac-brightness"><span>Brightness</span></div>
      <div class="ac-slider-row"><span>🔊</span><input type="range" min="0" max="100" value="75" class="ac-range" id="ac-volume"><span>Volume</span></div>`;
    const brightness = SOS.$('#ac-brightness');
    if (brightness) brightness.oninput = () => {
      document.body.style.filter = `brightness(${brightness.value / 100})`;
    };
  }

  function toggleActionCenter() {
    const ac = SOS.$('#action-center');
    if (ac) ac.classList.toggle('hidden');
    const nc = SOS.$('#notify-center'); if (nc) nc.classList.add('hidden');
    const wg = SOS.$('#widgets-panel'); if (wg) wg.classList.add('hidden');
  }

  // ===== WIDGETS PANEL =====
  function initWidgets() {
    const panel = SOS.$('#widgets-panel'); if (!panel) return;
    const content = SOS.$('#widgets-content'); if (!content) return;

    // Clock widget
    const clockW = SOS.h('div', { className: 'widget widget-clock' });
    const clockCanvas = SOS.h('canvas', { width: 140, height: 140 });
    clockW.innerHTML = '<div class="widget-title">Clock</div>';
    clockW.appendChild(clockCanvas);
    content.appendChild(clockW);

    function drawClock() {
      const ctx = clockCanvas.getContext('2d');
      const w = 140, h = 140, cx = w / 2, cy = h / 2, r = 55;
      ctx.clearRect(0, 0, w, h);
      // Face
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(96,205,255,.3)'; ctx.lineWidth = 2; ctx.stroke();
      // Ticks
      for (let i = 0; i < 12; i++) {
        const a = (Math.PI * 2 / 12) * i - Math.PI / 2;
        const len = i % 3 === 0 ? 8 : 4;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * (r - len), cy + Math.sin(a) * (r - len));
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = i % 3 === 0 ? 2 : 1; ctx.stroke();
      }
      const now = new Date();
      const hr = now.getHours() % 12, mn = now.getMinutes(), sc = now.getSeconds();
      // Hour hand
      const ha = (Math.PI * 2 / 12) * (hr + mn / 60) - Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ha) * 30, cy + Math.sin(ha) * 30);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke();
      // Minute hand
      const ma = (Math.PI * 2 / 60) * mn - Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ma) * 42, cy + Math.sin(ma) * 42);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      // Second hand
      const sa = (Math.PI * 2 / 60) * sc - Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sa) * 48, cy + Math.sin(sa) * 48);
      ctx.strokeStyle = 'var(--accent)'; ctx.lineWidth = 1; ctx.stroke();
      // Center dot
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fillStyle = '#60CDFF'; ctx.fill();
    }
    drawClock(); setInterval(drawClock, 1000);

    // System status widget
    const sysW = SOS.h('div', { className: 'widget widget-system' });
    sysW.innerHTML = `<div class="widget-title">System Status</div>
      <div class="ws-row"><span>CPU</span><div class="ws-bar"><div class="ws-fill" id="ws-cpu" style="width:12%"></div></div><span id="ws-cpu-val">12%</span></div>
      <div class="ws-row"><span>RAM</span><div class="ws-bar"><div class="ws-fill ws-purple" id="ws-ram" style="width:35%"></div></div><span id="ws-ram-val">35%</span></div>
      <div class="ws-row"><span>BitNet</span><div class="ws-bar"><div class="ws-fill ws-green" id="ws-bit" style="width:0%"></div></div><span id="ws-bit-val">IDLE</span></div>`;
    content.appendChild(sysW);
    setInterval(() => {
      const cpu = Math.round(8 + Math.random() * 20);
      const ram = Math.round(30 + Math.random() * 15);
      const bit = Math.round(Math.random() * 100);
      SOS.$('#ws-cpu').style.width = cpu + '%'; SOS.$('#ws-cpu-val').textContent = cpu + '%';
      SOS.$('#ws-ram').style.width = ram + '%'; SOS.$('#ws-ram-val').textContent = ram + '%';
      SOS.$('#ws-bit').style.width = bit + '%'; SOS.$('#ws-bit-val').textContent = bit + '%';
    }, 2000);

    // Agent status widget
    const agentW = SOS.h('div', { className: 'widget widget-agents' });
    agentW.innerHTML = `<div class="widget-title">Agents</div>
      <div class="wa-item"><span class="wa-dot green"></span>JARVIS <span class="wa-status">ONLINE</span></div>
      <div class="wa-item"><span class="wa-dot blue"></span>BitNet Search <span class="wa-status">READY</span></div>
      <div class="wa-item"><span class="wa-dot orange"></span>PicoClaw <span class="wa-status">STANDBY</span></div>`;
    content.appendChild(agentW);

    // Weather widget (fetches from wttr.in)
    const weatherW = SOS.h('div', { className: 'widget widget-weather' });
    weatherW.innerHTML = `<div class="widget-title">Weather</div><div id="widget-weather-body" class="ww-loading">Loading...</div>`;
    content.appendChild(weatherW);
    fetch('https://wttr.in/?format=j1')
      .then(r => r.json())
      .then(d => {
        const cur = d.current_condition?.[0] || {};
        const body = SOS.$('#widget-weather-body');
        if (body) body.innerHTML = `
          <div class="ww-temp">${cur.temp_C || '?'}°C</div>
          <div class="ww-desc">${cur.weatherDesc?.[0]?.value || 'Unknown'}</div>
          <div class="ww-detail">Humidity: ${cur.humidity || '?'}% | Wind: ${cur.windspeedKmph || '?'} km/h</div>`;
      })
      .catch(() => {
        const body = SOS.$('#widget-weather-body');
        if (body) body.innerHTML = '<div class="ww-desc">Weather unavailable</div>';
      });
  }

  function toggleWidgets() {
    const wg = SOS.$('#widgets-panel');
    if (wg) wg.classList.toggle('hidden');
    const nc = SOS.$('#notify-center'); if (nc) nc.classList.add('hidden');
    const ac = SOS.$('#action-center'); if (ac) ac.classList.add('hidden');
  }
})();
