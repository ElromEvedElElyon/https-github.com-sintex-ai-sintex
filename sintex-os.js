/* ============================================
   SintexOS — AI-Powered Operating System
   BitNet 1.58-bit Ternary Engine
   (c) Sintex.AI — Sovereign Computing
   ============================================ */
(function () {
  'use strict';

  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => [...(p || document).querySelectorAll(s)];
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ========== STORAGE ========== */
  const Storage = {
    get(k) { try { return JSON.parse(localStorage.getItem('sos-' + k)); } catch { return null; } },
    set(k, v) { localStorage.setItem('sos-' + k, JSON.stringify(v)); }
  };

  /* ========== STATE ========== */
  const State = {
    windows: new Map(),
    zIndex: 20,
    focusedWin: null,
    startOpen: false,
    settings: Storage.get('settings') || {
      theme: 'dark', wallpaper: 'rain', accentColor: '#24A0ED', animations: true
    },
    isMobile: window.innerWidth <= 480
  };

  /* ========== APP REGISTRY ========== */
  const APPS = [
    { id: 'sintex-ai', name: 'Sintex AI', icon: '🔍', desc: 'AI Search Engine', pin: true, w: 800, h: 560 },
    { id: 'terminal', name: 'Terminal', icon: '⬛', desc: 'System Shell', pin: true, w: 700, h: 450 },
    { id: 'files', name: 'Files', icon: '📁', desc: 'File Manager', pin: true, w: 700, h: 460 },
    { id: 'browser', name: 'Browser', icon: '🌐', desc: 'Web Browser', pin: true, w: 850, h: 560 },
    { id: 'notepad', name: 'Notepad', icon: '📝', desc: 'Text Editor', pin: false, w: 600, h: 420 },
    { id: 'monitor', name: 'System Monitor', icon: '📊', desc: 'Performance', pin: false, w: 520, h: 440 },
    { id: 'settings', name: 'Settings', icon: '⚙️', desc: 'System Settings', pin: false, w: 640, h: 460 },
    { id: 'openclaw', name: 'OpenClaw', icon: '🤖', desc: 'AI Agent Hub', pin: true, w: 750, h: 520 },
    { id: 'chatgpt', name: 'ChatGPT', icon: '💬', desc: 'AI Assistant', pin: false, w: 700, h: 520 }
  ];

  /* ========== BOOT SEQUENCE ========== */
  function boot() {
    const canvas = $('#boot-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = ['-1', ' 0', '+1'];
    const cols = Math.floor(canvas.width / 18);
    const drops = Array(cols).fill(0).map(() => Math.random() * -50);
    const statusEl = $('.boot-status');
    const msgs = ['Initializing kernel...', 'Loading BitNet 1.58-bit engine...', 'Mounting ternary filesystem...',
      'Starting window compositor...', 'Connecting OpenClaw agent...', 'System ready.'];
    let msgIdx = 0;

    const bootAnim = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '14px "JetBrains Mono", monospace';
      for (let i = 0; i < cols; i++) {
        const ch = chars[Math.floor(Math.random() * 3)];
        const alpha = 0.3 + Math.random() * 0.7;
        ctx.fillStyle = `rgba(36,160,237,${alpha})`;
        ctx.fillText(ch, i * 18, drops[i] * 18);
        if (drops[i] * 18 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.5 + Math.random() * 0.5;
      }
    };

    const bootInterval = setInterval(bootAnim, 40);
    const statusInterval = setInterval(() => {
      if (msgIdx < msgs.length) statusEl.textContent = msgs[msgIdx++];
    }, 380);

    setTimeout(() => {
      clearInterval(bootInterval);
      clearInterval(statusInterval);
      $('#os-boot').classList.add('fade-out');
      setTimeout(() => {
        $('#os-boot').remove();
        initDesktop();
      }, 800);
    }, 2600);
  }

  /* ========== WALLPAPER ========== */
  let wallpaperRAF = null;
  function initWallpaper() {
    const canvas = $('#os-wallpaper');
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    if (State.settings.wallpaper === 'rain') {
      const chars = ['-1', ' 0', '+1', '⚡', '█', '▓'];
      const cols = Math.floor(canvas.width / 20);
      const drops = Array(cols).fill(0).map(() => Math.random() * canvas.height / 20);
      const draw = () => {
        ctx.fillStyle = State.settings.theme === 'light' ? 'rgba(240,242,245,0.04)' : 'rgba(13,17,23,0.04)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '14px "JetBrains Mono", monospace';
        for (let i = 0; i < cols; i++) {
          const ch = chars[Math.floor(Math.random() * chars.length)];
          const a = 0.03 + Math.random() * 0.08;
          ctx.fillStyle = `rgba(36,160,237,${a})`;
          ctx.fillText(ch, i * 20, drops[i] * 20);
          if (drops[i] * 20 > canvas.height && Math.random() > 0.98) drops[i] = 0;
          drops[i] += 0.3;
        }
        wallpaperRAF = requestAnimationFrame(draw);
      };
      draw();
    } else if (State.settings.wallpaper === 'gradient') {
      const grd = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 100, canvas.width / 2, canvas.height / 2, canvas.width);
      grd.addColorStop(0, '#0a1628');
      grd.addColorStop(1, '#0d1117');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = State.settings.theme === 'light' ? '#f0f2f5' : '#0d1117';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  function stopWallpaper() { if (wallpaperRAF) { cancelAnimationFrame(wallpaperRAF); wallpaperRAF = null; } }

  /* ========== DESKTOP INIT ========== */
  function initDesktop() {
    if (State.settings.theme === 'light') document.body.classList.add('light-os');
    initWallpaper();
    createDesktopIcons();
    createPinnedIcons();
    initTaskbar();
    initStartMenu();
    initContextMenu();
    initClock();
    notify('SintexOS v1.0 — BitNet 1.58-bit Engine Online');

    // Pause wallpaper when tab hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopWallpaper();
      else if (State.settings.wallpaper === 'rain') initWallpaper();
    });
  }

  /* ========== DESKTOP ICONS ========== */
  function createDesktopIcons() {
    const container = $('#os-icons');
    container.innerHTML = '';
    const desktopApps = ['sintex-ai', 'terminal', 'files', 'browser', 'notepad', 'monitor', 'settings', 'openclaw', 'chatgpt'];
    desktopApps.forEach(id => {
      const app = APPS.find(a => a.id === id);
      if (!app) return;
      const el = document.createElement('div');
      el.className = 'desk-icon';
      el.innerHTML = `<div class="desk-icon-img">${app.icon}</div><div class="desk-icon-name">${app.name}</div>`;
      el.addEventListener('dblclick', () => openApp(id));
      el.addEventListener('click', () => {
        $$('.desk-icon').forEach(d => d.classList.remove('selected'));
        el.classList.add('selected');
      });
      // Mobile: single tap opens
      if (State.isMobile) el.addEventListener('click', () => openApp(id));
      container.appendChild(el);
    });
  }

  /* ========== PINNED ICONS ========== */
  function createPinnedIcons() {
    const container = $('#os-pinned');
    container.innerHTML = '';
    APPS.filter(a => a.pin).forEach(app => {
      const el = document.createElement('div');
      el.className = 'pinned-icon';
      el.title = app.name;
      el.textContent = app.icon;
      el.dataset.app = app.id;
      el.addEventListener('click', () => openApp(app.id));
      container.appendChild(el);
    });
  }

  /* ========== TASKBAR ========== */
  function initTaskbar() {
    $('#os-start-btn').addEventListener('click', toggleStart);
  }

  function updateTaskbar() {
    const container = $('#os-taskbar-windows');
    container.innerHTML = '';
    State.windows.forEach((win, id) => {
      const btn = document.createElement('button');
      btn.className = 'taskbar-win-btn' + (id === State.focusedWin ? ' active' : '');
      btn.innerHTML = `<span class="tw-icon">${win.icon}</span><span class="tw-title">${win.title}</span>`;
      btn.addEventListener('click', () => {
        const el = win.el;
        if (el.classList.contains('minimized')) {
          el.classList.remove('minimized');
          focusWindow(id);
        } else if (id === State.focusedWin) {
          el.classList.add('minimized');
          State.focusedWin = null;
        } else {
          focusWindow(id);
        }
        updateTaskbar();
      });
      container.appendChild(btn);
    });
    // Update pinned icons state
    $$('.pinned-icon').forEach(pin => {
      const appId = pin.dataset.app;
      const hasWindow = [...State.windows.entries()].some(([, w]) => w.appId === appId);
      const isFocused = [...State.windows.entries()].some(([id, w]) => w.appId === appId && id === State.focusedWin);
      pin.classList.toggle('running', hasWindow);
      pin.classList.toggle('active', isFocused);
    });
  }

  /* ========== START MENU ========== */
  function initStartMenu() {
    const grid = $('#start-grid');
    APPS.forEach(app => {
      const el = document.createElement('div');
      el.className = 'start-app';
      el.innerHTML = `<div class="start-app-icon">${app.icon}</div><div class="start-app-name">${app.name}</div><div class="start-app-desc">${app.desc}</div>`;
      el.addEventListener('click', () => { openApp(app.id); toggleStart(false); });
      grid.appendChild(el);
    });

    // Search filter
    $('#start-search').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      $$('.start-app').forEach((el, i) => {
        const app = APPS[i];
        el.style.display = (app.name.toLowerCase().includes(q) || app.desc.toLowerCase().includes(q)) ? '' : 'none';
      });
    });

    // Power buttons
    $$('.start-power-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'shutdown') window.location.href = '/';
        if (action === 'restart') window.location.reload();
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (State.startOpen && !$('#os-start').contains(e.target) && !$('#os-start-btn').contains(e.target)) {
        toggleStart(false);
      }
    });
  }

  function toggleStart(force) {
    State.startOpen = typeof force === 'boolean' ? force : !State.startOpen;
    $('#os-start').classList.toggle('hidden', !State.startOpen);
    $('#os-start-btn').classList.toggle('active', State.startOpen);
    if (State.startOpen) { $('#start-search').value = ''; $('#start-search').focus(); }
  }

  /* ========== CONTEXT MENU ========== */
  function initContextMenu() {
    const ctx = $('#os-ctx');
    $('#os-desktop').addEventListener('contextmenu', (e) => {
      e.preventDefault();
      ctx.classList.remove('hidden');
      const x = Math.min(e.clientX, window.innerWidth - 220);
      const y = Math.min(e.clientY, window.innerHeight - 200);
      ctx.style.left = x + 'px';
      ctx.style.top = y + 'px';
    });
    document.addEventListener('click', () => ctx.classList.add('hidden'));
    $$('.os-ctx-item').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        if (action === 'new-note') openApp('notepad');
        if (action === 'open-terminal') openApp('terminal');
        if (action === 'settings') openApp('settings');
        if (action === 'refresh') { stopWallpaper(); initWallpaper(); notify('Desktop refreshed'); }
        if (action === 'about') openApp('settings');
        ctx.classList.add('hidden');
      });
    });
  }

  /* ========== CLOCK ========== */
  function initClock() {
    const el = $('#os-clock');
    const update = () => {
      const now = new Date();
      const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const date = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
      el.innerHTML = `${time}<br>${date}`;
    };
    update();
    setInterval(update, 30000);
  }

  /* ========== NOTIFICATIONS ========== */
  function notify(msg, duration) {
    const el = $('#os-notify');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.add('hidden'), duration || 3000);
  }

  /* ========== WINDOW MANAGER ========== */
  let winIdCounter = 0;

  function openApp(appId) {
    // If already open, focus it
    for (const [id, w] of State.windows) {
      if (w.appId === appId) {
        w.el.classList.remove('minimized');
        focusWindow(id);
        updateTaskbar();
        return;
      }
    }
    const app = APPS.find(a => a.id === appId);
    if (!app) return;

    const winId = 'w' + (++winIdCounter);
    const el = document.createElement('div');
    el.className = 'os-win os-fadein';
    el.id = winId;

    // Position
    const isMobile = window.innerWidth <= 480;
    if (isMobile) {
      el.style.cssText = `top:0;left:0;width:100vw;height:calc(100vh - var(--os-taskbar-h));`;
    } else {
      const offset = (State.windows.size % 6) * 28;
      const w = Math.min(app.w, window.innerWidth - 40);
      const h = Math.min(app.h, window.innerHeight - 80);
      const x = Math.max(20, (window.innerWidth - w) / 2 + offset);
      const y = Math.max(10, (window.innerHeight - h - 48) / 2 + offset);
      el.style.cssText = `width:${w}px;height:${h}px;transform:translate(${x}px,${y}px);`;
    }

    // Title bar
    el.innerHTML = `
      <div class="os-win-title">
        <span class="os-win-icon">${app.icon}</span>
        <span class="os-win-name">${app.name}</span>
        <div class="os-win-btns">
          <button class="os-win-btn minimize" title="Minimize">─</button>
          <button class="os-win-btn maximize" title="Maximize">□</button>
          <button class="os-win-btn close" title="Close">✕</button>
        </div>
      </div>
      <div class="os-win-body"></div>
      <div class="os-win-resize"></div>
    `;

    const body = el.querySelector('.os-win-body');
    const content = renderApp(appId, body);
    if (content) body.appendChild(content);

    // Window controls
    el.querySelector('.minimize').addEventListener('click', (e) => {
      e.stopPropagation();
      el.classList.add('minimized');
      updateTaskbar();
    });
    el.querySelector('.maximize').addEventListener('click', (e) => {
      e.stopPropagation();
      el.classList.toggle('maximized');
    });
    el.querySelector('.close').addEventListener('click', (e) => {
      e.stopPropagation();
      closeWindow(winId);
    });

    // Title bar double-click = maximize
    el.querySelector('.os-win-title').addEventListener('dblclick', () => {
      el.classList.toggle('maximized');
    });

    // Focus on click
    el.addEventListener('mousedown', () => focusWindow(winId));
    el.addEventListener('touchstart', () => focusWindow(winId), { passive: true });

    // Drag
    if (!isMobile) initDrag(el, winId);
    // Resize
    if (!isMobile) initResize(el);

    $('#os-windows').appendChild(el);
    State.windows.set(winId, { el, appId, icon: app.icon, title: app.name, cleanup: content?._cleanup });
    focusWindow(winId);
    updateTaskbar();
  }

  function closeWindow(winId) {
    const win = State.windows.get(winId);
    if (!win) return;
    if (win.cleanup) win.cleanup();
    win.el.remove();
    State.windows.delete(winId);
    if (State.focusedWin === winId) State.focusedWin = null;
    updateTaskbar();
  }

  function focusWindow(winId) {
    State.windows.forEach((w, id) => w.el.classList.toggle('focused', id === winId));
    const win = State.windows.get(winId);
    if (win) { win.el.style.zIndex = ++State.zIndex; State.focusedWin = winId; }
    updateTaskbar();
  }

  /* ========== DRAG ========== */
  function initDrag(el, winId) {
    const titleBar = el.querySelector('.os-win-title');
    let dragging = false, startX, startY, origX, origY;

    const getTranslate = () => {
      const s = getComputedStyle(el).transform;
      if (s === 'none') return { x: el.offsetLeft, y: el.offsetTop };
      const m = s.match(/matrix.*\((.+)\)/);
      if (m) { const v = m[1].split(','); return { x: parseFloat(v[4]), y: parseFloat(v[5]) }; }
      return { x: 0, y: 0 };
    };

    titleBar.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.os-win-btns') || el.classList.contains('maximized')) return;
      dragging = true;
      const pos = getTranslate();
      origX = pos.x; origY = pos.y;
      startX = e.clientX; startY = e.clientY;
      el.style.willChange = 'transform';
      // Disable pointer events on iframes during drag
      $$('iframe').forEach(f => f.style.pointerEvents = 'none');
      titleBar.setPointerCapture(e.pointerId);
    });
    titleBar.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      el.style.transform = `translate(${origX + dx}px, ${origY + dy}px)`;
    });
    const stopDrag = () => {
      dragging = false;
      el.style.willChange = '';
      $$('iframe').forEach(f => f.style.pointerEvents = '');
    };
    titleBar.addEventListener('pointerup', stopDrag);
    titleBar.addEventListener('pointercancel', stopDrag);
  }

  /* ========== RESIZE ========== */
  function initResize(el) {
    const handle = el.querySelector('.os-win-resize');
    let resizing = false, startX, startY, startW, startH;

    handle.addEventListener('pointerdown', (e) => {
      if (el.classList.contains('maximized')) return;
      resizing = true;
      startX = e.clientX; startY = e.clientY;
      startW = el.offsetWidth; startH = el.offsetHeight;
      $$('iframe').forEach(f => f.style.pointerEvents = 'none');
      handle.setPointerCapture(e.pointerId);
      e.stopPropagation();
    });
    handle.addEventListener('pointermove', (e) => {
      if (!resizing) return;
      el.style.width = Math.max(320, startW + e.clientX - startX) + 'px';
      el.style.height = Math.max(200, startH + e.clientY - startY) + 'px';
    });
    const stopResize = () => {
      resizing = false;
      $$('iframe').forEach(f => f.style.pointerEvents = '');
    };
    handle.addEventListener('pointerup', stopResize);
    handle.addEventListener('pointercancel', stopResize);
  }

  /* ========== APP RENDERERS ========== */
  function renderApp(appId, container) {
    switch (appId) {
      case 'sintex-ai': return renderSintexAI();
      case 'terminal': return renderTerminal();
      case 'files': return renderFileManager();
      case 'settings': return renderSettings();
      case 'notepad': return renderNotepad();
      case 'monitor': return renderMonitor();
      case 'browser': return renderBrowser('https://sintex.ai/search.html');
      case 'openclaw': return renderOpenClaw();
      case 'chatgpt': return renderChatGPT();
      default: return null;
    }
  }

  /* --- SINTEX AI (iframe) --- */
  function renderSintexAI() {
    const iframe = document.createElement('iframe');
    iframe.src = '/search.html';
    iframe.className = 'browser-frame';
    iframe.style.cssText = 'width:100%;height:100%;border:none;';
    return iframe;
  }

  /* --- TERMINAL --- */
  function renderTerminal() {
    const wrap = document.createElement('div');
    wrap.className = 'app-terminal';

    const output = document.createElement('div');
    output.className = 'term-output';

    const welcome = `<span class="term-info">SintexOS Terminal v1.0.0</span>
<span class="term-info">BitNet 1.58-bit Ternary Engine — {-1, 0, +1}</span>
<span class="term-out">Type <span class="term-cmd">help</span> for available commands.</span>
`;
    output.innerHTML = welcome;

    const history = [];
    let histIdx = -1;
    let cwd = '/home/sintex';

    const FS = {
      '/': ['boot', 'etc', 'home', 'usr', 'var', 'proc', 'sys', 'opt'],
      '/home': ['sintex'],
      '/home/sintex': ['Desktop', 'Documents', 'Downloads', '.bitnet', '.config', '.openclaw'],
      '/home/sintex/.bitnet': ['models', 'config.json', 'README.md'],
      '/home/sintex/.bitnet/models': ['bitnet-b1.58-2B-4T.gguf', 'bitnet-b1.58-700M.gguf'],
      '/home/sintex/.openclaw': ['agents', 'workspace', 'node.json', 'gateway.pid'],
      '/home/sintex/.openclaw/agents': ['jarvis', 'skynet', 'openclaw-main'],
      '/home/sintex/Desktop': ['Sintex AI.lnk', 'Terminal.lnk', 'README.md'],
      '/home/sintex/Documents': ['BitNet-Research.pdf', 'Sovereign-Stack-Guide.md', 'zero-to-1m-book.md'],
      '/home/sintex/Downloads': [],
      '/boot': ['vmlinuz-bitnet', 'initrd-ternary.img', 'grub'],
      '/etc': ['sintexos-release', 'hostname', 'passwd', 'fstab'],
      '/usr': ['bin', 'lib', 'share'],
      '/usr/bin': ['bitnet', 'openclaw', 'sintex-search', 'node', 'python3'],
    };

    const CMDS = {
      help: () => `<span class="term-info">Available commands:</span>
  ls [path]       — List directory contents
  cd <path>       — Change directory
  pwd             — Print working directory
  cat <file>      — Display file contents
  whoami          — Current user
  date            — Current date/time
  clear           — Clear terminal
  neofetch        — System information
  bitnet          — BitNet engine status
  openclaw        — OpenClaw agent status
  echo <text>     — Print text
  history         — Command history
  uname -a        — Kernel information
  free            — Memory usage
  top             — Process list
  exit            — Close terminal`,

      ls: (args) => {
        const path = args[0] ? resolvePath(args[0]) : cwd;
        const items = FS[path];
        if (!items) return `<span class="term-err">ls: cannot access '${args[0] || path}': No such file or directory</span>`;
        if (items.length === 0) return '';
        return items.map(f => {
          const fullPath = path === '/' ? '/' + f : path + '/' + f;
          const isDir = FS[fullPath] !== undefined;
          return isDir ? `<span class="term-info">${f}/</span>` : `<span class="term-out">${f}</span>`;
        }).join('  ');
      },

      cd: (args) => {
        if (!args[0] || args[0] === '~') { cwd = '/home/sintex'; return null; }
        const path = resolvePath(args[0]);
        if (FS[path] !== undefined) { cwd = path; return null; }
        return `<span class="term-err">cd: ${args[0]}: No such directory</span>`;
      },

      pwd: () => cwd,
      whoami: () => 'sintex',
      date: () => new Date().toString(),
      clear: () => { output.innerHTML = ''; return null; },

      neofetch: () => `<span class="term-info">
       ____  _       _             ___  ____
      / ___|(_)_ __ | |_ _____  __/ _ \\/ ___|
      \\___ \\| | '_ \\| __/ _ \\ \\/ / | | \\___ \\
       ___) | | | | | ||  __/>  <| |_| |___) |
      |____/|_|_| |_|\\__\\___/_/\\_\\\\___/|____/
</span>
  <span class="term-out">OS:</span>       SintexOS 1.0.0 x86_64/arm64
  <span class="term-out">Kernel:</span>   BitNet 1.58-bit (ternary)
  <span class="term-out">Shell:</span>    sintex-sh 1.0
  <span class="term-out">Engine:</span>   {-1, 0, +1} Ternary Matrix
  <span class="term-out">CPU:</span>      ${navigator.hardwareConcurrency || '?'}x cores
  <span class="term-out">GPU:</span>      Canvas2D HW Accelerated
  <span class="term-out">Memory:</span>   ${navigator.deviceMemory || '?'} GB (BitNet compressed)
  <span class="term-out">Display:</span>  ${screen.width}x${screen.height}
  <span class="term-out">Theme:</span>    ${State.settings.theme}
  <span class="term-out">Agent:</span>    OpenClaw JARVIS v2.0
  <span class="term-out">Uptime:</span>   ${Math.floor((Date.now() - performance.timeOrigin) / 1000)}s`,

      bitnet: (args) => {
        if (args[0] === '--status' || !args[0]) return `<span class="term-info">BitNet 1.58-bit Engine Status</span>
  Status:     <span class="term-info">ONLINE</span>
  Model:      bitnet-b1.58-2B-4T
  Weights:    {-1, 0, +1} ternary
  Speedup:    6.17x vs FP16
  Energy:     -82% reduction
  Quantize:   1.58-bit (log₂3)
  Backend:    Groq → Together → Cache`;
        if (args[0] === '--version') return 'bitnet v1.58.0 (Microsoft Research / Sintex.AI)';
        if (args[0] === '--search') {
          const q = args.slice(1).join(' ');
          if (!q) return '<span class="term-err">Usage: bitnet --search "query"</span>';
          return `<span class="term-warn">Searching: "${q}"...</span>\n<span class="term-info">Use Sintex AI app for full search results.</span>`;
        }
        return 'Usage: bitnet [--status|--version|--search "query"|--help]';
      },

      openclaw: () => `<span class="term-info">OpenClaw Agent Hub</span>
  Agent:      JARVIS (main, claude-opus-4-6)
  Gateway:    ws://127.0.0.1:18789
  Status:     <span class="term-warn">STANDBY</span> (connect via sintex.ai)
  Browser:    CDP port 18800
  Agents:     1 registered (JARVIS)
  Backup:     */30 auto-backup.sh (ACTIVE)`,

      echo: (args) => args.join(' '),
      history: () => history.map((c, i) => `  ${i + 1}  ${c}`).join('\n'),

      'uname': (args) => {
        if (args[0] === '-a') return 'SintexOS 1.0.0 bitnet-1.58 #1 SMP PREEMPT_TERNARY x86_64 GNU/SintexOS';
        return 'SintexOS';
      },

      free: () => `              total       used       free     shared    buffers     cached
Mem:        ${navigator.deviceMemory || 8}G        2.1G       ${(navigator.deviceMemory || 8) - 2.1}G       128M       256M       1.2G
BitNet:     ∞ (compressed)    1.4G       ∞`,

      top: () => `  PID  USER     CPU%  MEM%  COMMAND
    1  root      0.1   0.5  [bitnet-kernel]
   42  sintex    2.3   1.2  sintex-compositor
  128  sintex    1.1   0.8  sintex-search
  256  sintex    0.4   0.3  openclaw-agent
  512  sintex    0.2   0.1  wallpaper-rain
 1024  sintex    0.1   0.1  clock-daemon`,

      exit: () => { /* will be handled in execute */ return null; }
    };

    function resolvePath(p) {
      if (p.startsWith('/')) return p.replace(/\/+$/, '') || '/';
      if (p === '..') {
        const parts = cwd.split('/').filter(Boolean);
        parts.pop();
        return '/' + parts.join('/') || '/';
      }
      if (p === '.') return cwd;
      if (p === '~') return '/home/sintex';
      return (cwd === '/' ? '/' : cwd + '/') + p;
    }

    function execute(cmdStr) {
      const parts = cmdStr.trim().split(/\s+/);
      const cmd = parts[0];
      const args = parts.slice(1);

      // Echo command
      const line = document.createElement('div');
      line.className = 'term-line';
      line.innerHTML = `<span class="term-prompt"><span class="term-prompt-user">sintex</span>@<span class="term-info">os</span>:<span class="term-prompt-path">${cwd}</span>$</span><span class="term-cmd"> ${escapeHtml(cmdStr)}</span>`;
      output.appendChild(line);

      if (cmd === 'exit') {
        // Find and close the terminal window
        for (const [id, w] of State.windows) {
          if (w.appId === 'terminal') { closeWindow(id); return; }
        }
        return;
      }

      const fn = CMDS[cmd];
      let result;
      if (fn) {
        result = fn(args);
      } else {
        result = `<span class="term-err">bash: ${escapeHtml(cmd)}: command not found</span>`;
      }

      if (result !== null && result !== undefined) {
        const out = document.createElement('div');
        out.className = 'term-line';
        out.innerHTML = result;
        output.appendChild(out);
      }
      output.scrollTop = output.scrollHeight;
    }

    const inputRow = document.createElement('div');
    inputRow.className = 'term-input-row';
    const promptEl = document.createElement('span');
    promptEl.className = 'term-prompt';
    const updatePrompt = () => {
      promptEl.innerHTML = `<span class="term-prompt-user">sintex</span>@<span class="term-info">os</span>:<span class="term-prompt-path">${cwd}</span>$`;
    };
    updatePrompt();

    const input = document.createElement('input');
    input.className = 'term-input';
    input.type = 'text';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.autofocus = true;

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        if (!cmd) return;
        history.unshift(cmd);
        histIdx = -1;
        input.value = '';
        execute(cmd);
        updatePrompt();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        histIdx = Math.min(histIdx + 1, history.length - 1);
        if (histIdx >= 0) input.value = history[histIdx];
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        histIdx = Math.max(histIdx - 1, -1);
        input.value = histIdx >= 0 ? history[histIdx] : '';
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // Tab completion for commands
        const partial = input.value.trim();
        if (partial) {
          const matches = Object.keys(CMDS).filter(c => c.startsWith(partial));
          if (matches.length === 1) input.value = matches[0] + ' ';
        }
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        output.innerHTML = '';
      }
    });

    inputRow.appendChild(promptEl);
    inputRow.appendChild(input);
    wrap.appendChild(output);
    wrap.appendChild(inputRow);

    // Focus input when clicking terminal
    wrap.addEventListener('click', () => input.focus());
    setTimeout(() => input.focus(), 100);

    return wrap;
  }

  /* --- FILE MANAGER --- */
  function renderFileManager() {
    const wrap = document.createElement('div');
    wrap.className = 'app-files';
    let cwd = '/home/sintex';

    const FS = {
      '/': { type: 'dir', children: { boot: 'dir', etc: 'dir', home: 'dir', usr: 'dir', opt: 'dir', proc: 'dir' } },
      '/home': { type: 'dir', children: { sintex: 'dir' } },
      '/home/sintex': { type: 'dir', children: {
        Desktop: 'dir', Documents: 'dir', Downloads: 'dir',
        '.bitnet': 'dir', '.openclaw': 'dir', '.config': 'dir'
      }},
      '/home/sintex/Desktop': { type: 'dir', children: { 'Sintex AI.lnk': 'file', 'Terminal.lnk': 'file', 'README.md': 'file' } },
      '/home/sintex/Documents': { type: 'dir', children: {
        'BitNet-Research.pdf': 'file', 'Sovereign-Stack.md': 'file',
        'zero-to-1m-book.md': 'file', 'DeFi-Playbook.md': 'file'
      }},
      '/home/sintex/Downloads': { type: 'dir', children: {} },
      '/home/sintex/.bitnet': { type: 'dir', children: {
        models: 'dir', 'config.json': 'file', 'README.md': 'file'
      }},
      '/home/sintex/.bitnet/models': { type: 'dir', children: {
        'bitnet-b1.58-2B-4T.gguf': 'file', 'bitnet-b1.58-700M.gguf': 'file'
      }},
      '/home/sintex/.openclaw': { type: 'dir', children: {
        agents: 'dir', workspace: 'dir', 'node.json': 'file'
      }},
      '/home/sintex/.openclaw/agents': { type: 'dir', children: { 'jarvis.json': 'file', 'config.json': 'file' } },
      '/home/sintex/.openclaw/workspace': { type: 'dir', children: {
        'MEMORY.md': 'file', 'HEARTBEAT.md': 'file', memory: 'dir', content: 'dir'
      }}
    };

    function getIcon(name, isDir) {
      if (isDir) return '📁';
      const ext = name.split('.').pop().toLowerCase();
      const icons = { md: '📄', pdf: '📕', json: '📋', txt: '📝', gguf: '🤖', lnk: '🔗', py: '🐍', js: '📜' };
      return icons[ext] || '📄';
    }

    function renderDir() {
      const dir = FS[cwd];
      if (!dir) return;
      pathEl.value = cwd;
      grid.innerHTML = '';

      // Parent directory
      if (cwd !== '/') {
        const parent = document.createElement('div');
        parent.className = 'file-item';
        parent.innerHTML = `<div class="file-icon">📁</div><div class="file-name">..</div>`;
        parent.addEventListener('dblclick', () => { cwd = cwd.split('/').slice(0, -1).join('/') || '/'; renderDir(); });
        grid.appendChild(parent);
      }

      const children = dir.children;
      const entries = Object.entries(children).sort((a, b) => {
        if (a[1] === 'dir' && b[1] !== 'dir') return -1;
        if (a[1] !== 'dir' && b[1] === 'dir') return 1;
        return a[0].localeCompare(b[0]);
      });

      entries.forEach(([name, type]) => {
        const el = document.createElement('div');
        el.className = 'file-item';
        el.innerHTML = `<div class="file-icon">${getIcon(name, type === 'dir')}</div><div class="file-name">${name}</div>`;
        el.addEventListener('click', () => {
          $$('.file-item', grid).forEach(f => f.classList.remove('selected'));
          el.classList.add('selected');
        });
        el.addEventListener('dblclick', () => {
          if (type === 'dir') {
            cwd = cwd === '/' ? '/' + name : cwd + '/' + name;
            renderDir();
          }
        });
        grid.appendChild(el);
      });

      statusBar.textContent = `${entries.length} items — ${cwd}`;
    }

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'files-toolbar';
    const backBtn = document.createElement('button');
    backBtn.className = 'files-btn';
    backBtn.textContent = '←';
    backBtn.addEventListener('click', () => { if (cwd !== '/') { cwd = cwd.split('/').slice(0, -1).join('/') || '/'; renderDir(); } });
    const homeBtn = document.createElement('button');
    homeBtn.className = 'files-btn';
    homeBtn.textContent = '🏠';
    homeBtn.addEventListener('click', () => { cwd = '/home/sintex'; renderDir(); });
    const pathEl = document.createElement('input');
    pathEl.className = 'files-path';
    pathEl.value = cwd;
    pathEl.readOnly = true;
    toolbar.append(backBtn, homeBtn, pathEl);

    const grid = document.createElement('div');
    grid.className = 'files-grid';
    const statusBar = document.createElement('div');
    statusBar.className = 'files-statusbar';

    wrap.append(toolbar, grid, statusBar);
    renderDir();
    return wrap;
  }

  /* --- SETTINGS --- */
  function renderSettings() {
    const wrap = document.createElement('div');
    wrap.className = 'app-settings';

    const sections = {
      appearance: `
        <div class="settings-section">
          <div class="settings-title">Appearance</div>
          <div class="settings-row">
            <span class="settings-label">Theme</span>
            <div style="display:flex;gap:8px">
              <button class="settings-toggle ${State.settings.theme === 'dark' ? '' : 'on'}" id="set-theme">
              </button>
              <span style="font-size:12px;color:var(--os-text3)">${State.settings.theme === 'light' ? 'Light' : 'Dark'}</span>
            </div>
          </div>
          <div class="settings-row">
            <span class="settings-label">Accent Color</span>
            <div class="settings-colors">
              <div class="settings-color ${State.settings.accentColor === '#24A0ED' ? 'active' : ''}" style="background:#24A0ED" data-color="#24A0ED"></div>
              <div class="settings-color ${State.settings.accentColor === '#a371f7' ? 'active' : ''}" style="background:#a371f7" data-color="#a371f7"></div>
              <div class="settings-color ${State.settings.accentColor === '#3fb950' ? 'active' : ''}" style="background:#3fb950" data-color="#3fb950"></div>
              <div class="settings-color ${State.settings.accentColor === '#f85149' ? 'active' : ''}" style="background:#f85149" data-color="#f85149"></div>
              <div class="settings-color ${State.settings.accentColor === '#d29922' ? 'active' : ''}" style="background:#d29922" data-color="#d29922"></div>
            </div>
          </div>
          <div class="settings-row">
            <span class="settings-label">Animations</span>
            <button class="settings-toggle ${State.settings.animations ? 'on' : ''}" id="set-anim"></button>
          </div>
        </div>`,
      wallpaper: `
        <div class="settings-section">
          <div class="settings-title">Wallpaper</div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:8px">
            <div class="file-item ${State.settings.wallpaper === 'rain' ? 'selected' : ''}" data-wp="rain" style="padding:20px">
              <div class="file-icon">🌧️</div><div class="file-name">Ternary Rain</div>
            </div>
            <div class="file-item ${State.settings.wallpaper === 'gradient' ? 'selected' : ''}" data-wp="gradient" style="padding:20px">
              <div class="file-icon">🌌</div><div class="file-name">Deep Space</div>
            </div>
            <div class="file-item ${State.settings.wallpaper === 'solid-dark' ? 'selected' : ''}" data-wp="solid-dark" style="padding:20px">
              <div class="file-icon">⬛</div><div class="file-name">Solid Dark</div>
            </div>
            <div class="file-item ${State.settings.wallpaper === 'solid-light' ? 'selected' : ''}" data-wp="solid-light" style="padding:20px">
              <div class="file-icon">⬜</div><div class="file-name">Solid Light</div>
            </div>
          </div>
        </div>`,
      about: `
        <div class="settings-section">
          <div class="settings-title">About SintexOS</div>
          <div style="padding:16px;background:var(--os-bg2);border-radius:var(--os-radius-sm);border:1px solid var(--os-border)">
            <div style="font-size:24px;font-weight:700;margin-bottom:8px">
              <span style="color:var(--os-accent)">S</span><span style="color:var(--os-text3)">.</span><span>OS</span>
            </div>
            <div style="font-size:13px;color:var(--os-text2);line-height:1.8">
              <strong>Version:</strong> 1.0.0 (Build 158-ternary)<br>
              <strong>Engine:</strong> BitNet 1.58-bit ({-1, 0, +1})<br>
              <strong>Platform:</strong> ${navigator.platform}<br>
              <strong>Screen:</strong> ${screen.width}x${screen.height}<br>
              <strong>Cores:</strong> ${navigator.hardwareConcurrency || 'N/A'}<br>
              <strong>Memory:</strong> ${navigator.deviceMemory || 'N/A'} GB<br>
              <strong>Agent:</strong> OpenClaw JARVIS (claude-opus-4-6)<br>
              <strong>Philosophy:</strong> Linux openness + Perplexity AI intelligence<br>
              <strong>License:</strong> Sovereign Open Source<br><br>
              <em style="color:var(--os-text3)">"Lightweight but powerful. Built for humans, powered by AI."</em>
            </div>
          </div>
        </div>`
    };

    // Nav
    const nav = document.createElement('div');
    nav.className = 'settings-nav';
    const navItems = [
      { id: 'appearance', label: '🎨 Appearance' },
      { id: 'wallpaper', label: '🖼️ Wallpaper' },
      { id: 'about', label: 'ℹ️ About' }
    ];

    const content = document.createElement('div');
    content.className = 'settings-content';

    function showSection(id) {
      content.innerHTML = sections[id];
      $$('.settings-nav-item', nav).forEach(n => n.classList.toggle('active', n.dataset.section === id));
      bindSettingsEvents();
    }

    navItems.forEach(item => {
      const el = document.createElement('div');
      el.className = 'settings-nav-item';
      el.dataset.section = item.id;
      el.textContent = item.label;
      el.addEventListener('click', () => showSection(item.id));
      nav.appendChild(el);
    });

    function bindSettingsEvents() {
      const themeBtn = $('#set-theme', content);
      if (themeBtn) themeBtn.addEventListener('click', () => {
        State.settings.theme = State.settings.theme === 'dark' ? 'light' : 'dark';
        document.body.classList.toggle('light-os', State.settings.theme === 'light');
        Storage.set('settings', State.settings);
        stopWallpaper(); initWallpaper();
        showSection('appearance');
      });

      const animBtn = $('#set-anim', content);
      if (animBtn) animBtn.addEventListener('click', () => {
        State.settings.animations = !State.settings.animations;
        Storage.set('settings', State.settings);
        showSection('appearance');
      });

      $$('.settings-color', content).forEach(c => {
        c.addEventListener('click', () => {
          State.settings.accentColor = c.dataset.color;
          document.documentElement.style.setProperty('--os-accent', c.dataset.color);
          Storage.set('settings', State.settings);
          showSection('appearance');
        });
      });

      $$('[data-wp]', content).forEach(wp => {
        wp.addEventListener('click', () => {
          State.settings.wallpaper = wp.dataset.wp;
          Storage.set('settings', State.settings);
          stopWallpaper(); initWallpaper();
          showSection('wallpaper');
        });
      });
    }

    wrap.append(nav, content);
    showSection('appearance');
    return wrap;
  }

  /* --- NOTEPAD --- */
  function renderNotepad() {
    const wrap = document.createElement('div');
    wrap.className = 'app-notepad';

    const toolbar = document.createElement('div');
    toolbar.className = 'notepad-toolbar';
    const newBtn = document.createElement('button');
    newBtn.className = 'files-btn';
    newBtn.textContent = '📄 New';
    const saveInfo = document.createElement('span');
    saveInfo.className = 'notepad-status';
    saveInfo.textContent = 'Ready';
    toolbar.append(newBtn, saveInfo);

    const textarea = document.createElement('textarea');
    textarea.className = 'notepad-area';
    textarea.placeholder = 'Start typing...\n\nTip: Your notes are saved automatically to localStorage.';
    textarea.value = Storage.get('notepad-content') || '';
    textarea.spellcheck = true;

    let saveTimer;
    textarea.addEventListener('input', () => {
      saveInfo.textContent = 'Editing...';
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        Storage.set('notepad-content', textarea.value);
        saveInfo.textContent = `Saved — ${textarea.value.length} chars`;
      }, 600);
    });

    newBtn.addEventListener('click', () => {
      if (textarea.value && !confirm('Clear current note?')) return;
      textarea.value = '';
      Storage.set('notepad-content', '');
      saveInfo.textContent = 'New note';
    });

    wrap.append(toolbar, textarea);
    setTimeout(() => textarea.focus(), 100);
    return wrap;
  }

  /* --- SYSTEM MONITOR --- */
  function renderMonitor() {
    const wrap = document.createElement('div');
    wrap.className = 'app-monitor';

    const stats = { cpu: 15, ram: 38, bitnet: 0, net: 2 };
    const histData = { cpu: [], ram: [], bitnet: [], net: [] };

    const cards = [
      { key: 'cpu', label: 'CPU', color: 'var(--os-accent)', unit: '%' },
      { key: 'ram', label: 'Memory', color: 'var(--os-purple)', unit: '%' },
      { key: 'bitnet', label: 'BitNet Engine', color: 'var(--os-green)', unit: '%' },
      { key: 'net', label: 'Network', color: 'var(--os-orange)', unit: ' MB/s' }
    ];

    const cardEls = {};

    cards.forEach(c => {
      const card = document.createElement('div');
      card.className = 'monitor-card';
      card.innerHTML = `
        <div class="monitor-card-header">
          <span class="monitor-card-label">${c.label}</span>
          <span class="monitor-card-value" style="color:${c.color}">0${c.unit}</span>
        </div>
        <div class="monitor-bar"><div class="monitor-bar-fill" style="width:0%;background:${c.color}"></div></div>
        <canvas class="monitor-spark" width="200" height="40"></canvas>
      `;
      wrap.appendChild(card);
      cardEls[c.key] = {
        value: card.querySelector('.monitor-card-value'),
        bar: card.querySelector('.monitor-bar-fill'),
        canvas: card.querySelector('.monitor-spark'),
        color: c.color,
        unit: c.unit
      };
    });

    function drawSparkline(canvas, data, color) {
      const ctx = canvas.getContext('2d');
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      if (data.length < 2) return;

      // Fill
      ctx.beginPath();
      data.forEach((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - (v / 100) * h;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      const style = getComputedStyle(document.documentElement);
      const rgb = color.startsWith('var') ? style.getPropertyValue(color.replace('var(', '').replace(')', '')).trim() : color;
      ctx.fillStyle = rgb + '15';
      ctx.fill();

      // Line
      ctx.beginPath();
      data.forEach((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - (v / 100) * h;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.strokeStyle = rgb;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    function tick() {
      const lerp = (a, b, t) => a + (b - a) * t;
      stats.cpu = Math.max(3, Math.min(95, lerp(stats.cpu, stats.cpu + (Math.random() - 0.5) * 20, 0.3)));
      stats.ram = Math.max(25, Math.min(85, lerp(stats.ram, stats.ram + (Math.random() - 0.5) * 6, 0.1)));
      stats.bitnet = Math.max(0, Math.min(100, lerp(stats.bitnet, 40 + (Math.random() - 0.5) * 60, 0.15)));
      stats.net = Math.max(0, Math.min(50, Math.abs(stats.net + (Math.random() - 0.5) * 8)));

      cards.forEach(c => {
        const el = cardEls[c.key];
        const val = Math.round(stats[c.key] * 10) / 10;
        el.value.textContent = val + c.unit;
        el.bar.style.width = Math.min(stats[c.key], 100) + '%';
        histData[c.key].push(stats[c.key]);
        if (histData[c.key].length > 60) histData[c.key].shift();
        drawSparkline(el.canvas, histData[c.key], c.color);
      });
    }

    // BitNet probe
    if (typeof BitNetClient !== 'undefined') {
      BitNetClient.search('status').then(() => {
        stats.bitnet = 85;
        cardEls.bitnet.value.textContent = 'ONLINE';
      }).catch(() => {
        cardEls.bitnet.value.textContent = 'LOCAL';
      });
    }

    tick();
    const interval = setInterval(tick, 1500);
    wrap._cleanup = () => clearInterval(interval);
    return wrap;
  }

  /* --- BROWSER --- */
  function renderBrowser(url) {
    const wrap = document.createElement('div');
    wrap.className = 'app-browser';

    const bar = document.createElement('div');
    bar.className = 'browser-bar';

    const backBtn = document.createElement('button');
    backBtn.className = 'browser-nav-btn';
    backBtn.textContent = '←';

    const fwdBtn = document.createElement('button');
    fwdBtn.className = 'browser-nav-btn';
    fwdBtn.textContent = '→';

    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'browser-nav-btn';
    refreshBtn.textContent = '↻';

    const urlInput = document.createElement('input');
    urlInput.className = 'browser-url';
    urlInput.value = url || 'https://sintex.ai';

    const iframe = document.createElement('iframe');
    iframe.className = 'browser-frame';
    iframe.src = url || 'https://sintex.ai';
    iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups';

    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        let u = urlInput.value.trim();
        if (u === 'sintex:search') u = '/search.html';
        else if (u === 'sintex:home') u = '/';
        else if (u === 'sintex:os') u = '/os.html';
        else if (!u.startsWith('http') && !u.startsWith('/')) u = 'https://' + u;
        iframe.src = u;
      }
    });

    backBtn.addEventListener('click', () => { try { iframe.contentWindow.history.back(); } catch {} });
    fwdBtn.addEventListener('click', () => { try { iframe.contentWindow.history.forward(); } catch {} });
    refreshBtn.addEventListener('click', () => { iframe.src = iframe.src; });

    bar.append(backBtn, fwdBtn, refreshBtn, urlInput);
    wrap.append(bar, iframe);
    return wrap;
  }

  /* --- OPENCLAW --- */
  function renderOpenClaw() {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'height:100%;display:flex;flex-direction:column;background:var(--os-bg);';

    const header = document.createElement('div');
    header.style.cssText = 'padding:20px;border-bottom:1px solid var(--os-border);background:var(--os-bg2);';
    header.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,var(--os-accent),var(--os-purple));display:flex;align-items:center;justify-content:center;font-size:24px">🤖</div>
        <div>
          <div style="font-size:18px;font-weight:600">OpenClaw Agent Hub</div>
          <div style="font-size:12px;color:var(--os-text3)">AI Agent Orchestration — Sovereign Computing</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
        <div style="padding:10px;background:var(--os-bg);border-radius:var(--os-radius-sm);border:1px solid var(--os-border);text-align:center">
          <div style="font-size:20px;font-weight:700;color:var(--os-green)">1</div>
          <div style="font-size:10px;color:var(--os-text3)">Active Agents</div>
        </div>
        <div style="padding:10px;background:var(--os-bg);border-radius:var(--os-radius-sm);border:1px solid var(--os-border);text-align:center">
          <div style="font-size:20px;font-weight:700;color:var(--os-accent)">JARVIS</div>
          <div style="font-size:10px;color:var(--os-text3)">Primary Agent</div>
        </div>
        <div style="padding:10px;background:var(--os-bg);border-radius:var(--os-radius-sm);border:1px solid var(--os-border);text-align:center">
          <div style="font-size:20px;font-weight:700;color:var(--os-orange)">⚡</div>
          <div style="font-size:10px;color:var(--os-text3)">BitNet Engine</div>
        </div>
      </div>
    `;

    const body = document.createElement('div');
    body.style.cssText = 'flex:1;padding:16px;overflow-y:auto;';

    const agents = [
      { name: 'JARVIS', model: 'claude-opus-4-6', status: 'standby', desc: 'Primary orchestrator agent. Handles task execution, memory management, and multi-agent coordination.' },
      { name: 'Skynet (Ethical)', model: 'swarm-mode', status: 'idle', desc: 'Ethical swarm intelligence for parallel task execution across bounties, content, and revenue streams.' },
      { name: 'BitNet Search', model: 'bitnet-1.58', status: 'online', desc: 'AI search engine powered by 1.58-bit ternary weights. Fallback: Groq → Together → Cache.' }
    ];

    agents.forEach(a => {
      const card = document.createElement('div');
      card.style.cssText = 'padding:14px;background:var(--os-bg2);border:1px solid var(--os-border);border-radius:var(--os-radius-sm);margin-bottom:8px;';
      const statusColor = a.status === 'online' ? 'var(--os-green)' : a.status === 'standby' ? 'var(--os-orange)' : 'var(--os-text3)';
      card.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <div style="font-size:14px;font-weight:600">${a.name}</div>
          <div style="font-size:11px;padding:2px 8px;border-radius:10px;background:${statusColor}20;color:${statusColor};font-weight:500">${a.status.toUpperCase()}</div>
        </div>
        <div style="font-size:11px;color:var(--os-text3);margin-bottom:4px">Model: ${a.model}</div>
        <div style="font-size:12px;color:var(--os-text2)">${a.desc}</div>
      `;
      body.appendChild(card);
    });

    const connectInfo = document.createElement('div');
    connectInfo.style.cssText = 'padding:12px;background:var(--os-accent-bg);border:1px solid rgba(36,160,237,0.2);border-radius:var(--os-radius-sm);margin-top:8px;';
    connectInfo.innerHTML = `
      <div style="font-size:12px;color:var(--os-accent);font-weight:500;margin-bottom:4px">🔗 Connection Info</div>
      <div style="font-size:11px;color:var(--os-text2);font-family:var(--os-mono);line-height:1.6">
        Gateway: ws://127.0.0.1:18789<br>
        Browser CDP: port 18800<br>
        Status: Connect your OpenClaw node to activate agents<br>
        <br>
        <em>Every user will soon have their own AI agent.<br>OpenClaw is the sovereign agent framework.</em>
      </div>
    `;
    body.appendChild(connectInfo);

    wrap.append(header, body);
    return wrap;
  }

  /* --- CHATGPT --- */
  function renderChatGPT() {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'height:100%;display:flex;flex-direction:column;background:var(--os-bg);';

    const header = document.createElement('div');
    header.style.cssText = 'padding:16px;border-bottom:1px solid var(--os-border);background:var(--os-bg2);display:flex;align-items:center;gap:12px;';
    header.innerHTML = `
      <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#10a37f,#1a7f64);display:flex;align-items:center;justify-content:center;font-size:18px">💬</div>
      <div>
        <div style="font-size:15px;font-weight:600">ChatGPT Integration</div>
        <div style="font-size:11px;color:var(--os-text3)">Connected via SintexOS Bridge</div>
      </div>
    `;

    const messages = document.createElement('div');
    messages.style.cssText = 'flex:1;padding:16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;';

    // Welcome message
    const welcomeMsg = document.createElement('div');
    welcomeMsg.style.cssText = 'padding:14px;background:var(--os-bg2);border-radius:var(--os-radius-sm);border:1px solid var(--os-border);';
    welcomeMsg.innerHTML = `
      <div style="font-size:13px;color:var(--os-text);line-height:1.6">
        Welcome to <strong>SintexOS ChatGPT Bridge</strong>. This interface connects to AI services through the BitNet 1.58-bit engine.<br><br>
        Type a message below to interact with the AI. The system uses the same fallback chain as Sintex AI Search:<br>
        <span style="color:var(--os-accent)">BitNet → Groq → Together → Local Cache</span>
      </div>
    `;
    messages.appendChild(welcomeMsg);

    const inputArea = document.createElement('div');
    inputArea.style.cssText = 'padding:12px;border-top:1px solid var(--os-border);background:var(--os-bg2);display:flex;gap:8px;';

    const chatInput = document.createElement('input');
    chatInput.type = 'text';
    chatInput.placeholder = 'Ask anything...';
    chatInput.style.cssText = 'flex:1;padding:10px 14px;background:var(--os-bg);border:1px solid var(--os-border);border-radius:20px;color:var(--os-text);font-size:13px;font-family:var(--os-font);outline:none;';

    const sendBtn = document.createElement('button');
    sendBtn.textContent = '→';
    sendBtn.style.cssText = 'width:36px;height:36px;border-radius:50%;background:var(--os-accent);border:none;color:#fff;font-size:16px;cursor:pointer;transition:background 0.15s;';

    async function sendMessage() {
      const text = chatInput.value.trim();
      if (!text) return;
      chatInput.value = '';

      // User message
      const userMsg = document.createElement('div');
      userMsg.style.cssText = 'padding:10px 14px;background:var(--os-accent);color:#fff;border-radius:16px 16px 4px 16px;align-self:flex-end;max-width:80%;font-size:13px;';
      userMsg.textContent = text;
      messages.appendChild(userMsg);

      // Thinking indicator
      const thinking = document.createElement('div');
      thinking.style.cssText = 'padding:10px 14px;background:var(--os-bg2);border:1px solid var(--os-border);border-radius:16px 16px 16px 4px;align-self:flex-start;font-size:12px;color:var(--os-text3);';
      thinking.textContent = 'Thinking...';
      messages.appendChild(thinking);
      messages.scrollTop = messages.scrollHeight;

      // Query BitNet
      try {
        const result = await (typeof BitNetClient !== 'undefined' ? BitNetClient.search(text) : Promise.resolve({ answer: 'BitNet client not loaded. Please refresh.' }));
        thinking.style.color = 'var(--os-text)';
        thinking.style.fontSize = '13px';
        thinking.innerHTML = result.answer ? result.answer.replace(/\n/g, '<br>').substring(0, 2000) : 'No response available.';
      } catch {
        thinking.innerHTML = '<span style="color:var(--os-red)">Error connecting to AI service.</span>';
      }
      messages.scrollTop = messages.scrollHeight;
    }

    chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
    sendBtn.addEventListener('click', sendMessage);

    inputArea.append(chatInput, sendBtn);
    wrap.append(header, messages, inputArea);
    setTimeout(() => chatInput.focus(), 100);
    return wrap;
  }

  /* ========== UTILITY ========== */
  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  /* ========== KEYBOARD SHORTCUTS ========== */
  document.addEventListener('keydown', (e) => {
    // Win key or Ctrl+Space = toggle start
    if (e.key === 'Meta' || (e.ctrlKey && e.key === ' ')) {
      e.preventDefault();
      toggleStart();
    }
    // Ctrl+T = new terminal
    if (e.ctrlKey && e.key === 't' && !e.shiftKey) {
      // Only if no focused input
      if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        openApp('terminal');
      }
    }
    // Ctrl+E = file manager
    if (e.ctrlKey && e.key === 'e') {
      if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        openApp('files');
      }
    }
    // Escape = close start menu
    if (e.key === 'Escape' && State.startOpen) {
      toggleStart(false);
    }
  });

  /* ========== WINDOW RESIZE ========== */
  let resizeDebounce;
  window.addEventListener('resize', () => {
    clearTimeout(resizeDebounce);
    resizeDebounce = setTimeout(() => {
      State.isMobile = window.innerWidth <= 480;
    }, 200);
  });

  /* ========== INIT ========== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
