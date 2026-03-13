/* SintexOS Core — Namespace, Boot, Wallpaper, Utilities */
window.SOS = {
  $: s => document.querySelector(s),
  $$: s => [...document.querySelectorAll(s)],
  h: (t, a = {}) => { const e = document.createElement(t); Object.assign(e, a); return e },
  state: {
    wins: new Map(), zi: 20, focused: null, startOpen: false, searchOpen: false,
    cfg: null, isMob: innerWidth <= 768, notifications: [], wpRAF: null
  },
  apps: [], events: {},
  registerApp(def) {
    const idx = this.apps.findIndex(a => a.id === def.id);
    if (idx >= 0) this.apps[idx] = def; else this.apps.push(def);
  },
  emit(ev, data) { (this.events[ev] || []).forEach(fn => fn(data)) },
  on(ev, fn) { (this.events[ev] || (this.events[ev] = [])).push(fn) },
  load(k) { try { return JSON.parse(localStorage.getItem('sos-' + k)) } catch { return null } },
  save(k, v) { localStorage.setItem('sos-' + k, JSON.stringify(v)) },
  esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML },
  notify(title, body, icon) {
    const n = { id: Date.now(), title, body, icon: icon || 'info', time: new Date() };
    this.state.notifications.unshift(n);
    if (this.state.notifications.length > 50) this.state.notifications.pop();
    this.emit('notification', n);
    this.toast(title);
  },
  toast(msg, dur) {
    const el = this.$('#toast');
    if (!el) return;
    el.textContent = msg; el.classList.remove('hidden');
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.add('hidden'), dur || 3500);
  },
  getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }
};

// Config
SOS.state.cfg = SOS.load('cfg') || { theme: 'dark', wp: 'mesh', accent: '#60CDFF' };

// ===== SVG ICONS =====
SOS.ICO = {
  search: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  terminal: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
  folder: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="rgba(252,185,0,.15)"/></svg>`,
  browser: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  note: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  monitor: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  settings: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  jarvis: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6" stroke-dasharray="4 2"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>`,
  agent: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/><path d="M9 15c1 1 5 1 6 0"/></svg>`,
  calc: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><rect x="7" y="5" width="10" height="5" rx="1" fill="rgba(96,205,255,.15)"/><circle cx="8" cy="14" r="1" fill="currentColor"/><circle cx="12" cy="14" r="1" fill="currentColor"/><circle cx="16" cy="14" r="1" fill="currentColor"/><circle cx="8" cy="18" r="1" fill="currentColor"/><circle cx="12" cy="18" r="1" fill="currentColor"/><circle cx="16" cy="18" r="1" fill="currentColor"/></svg>`,
  paint: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`,
  weather: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`,
  clock: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  store: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  music: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  file: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  folderFill: `<svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(252,185,0,.2)" stroke="#FCB900" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  fileFill: `<svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(96,205,255,.08)" stroke="rgba(96,205,255,.5)" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  wifi: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/></svg>`,
  vol: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
  bell: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  messenger: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="12" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></svg>`,
  voice: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
  brain: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20" stroke-opacity=".3"/><circle cx="12" cy="8" r="2" fill="rgba(96,205,255,.3)"/><circle cx="8" cy="14" r="1.5" fill="rgba(0,255,136,.3)"/><circle cx="16" cy="14" r="1.5" fill="rgba(255,107,107,.3)"/><line x1="12" y1="8" x2="8" y2="14" stroke-opacity=".5"/><line x1="12" y1="8" x2="16" y2="14" stroke-opacity=".5"/><line x1="8" y1="14" x2="16" y2="14" stroke-opacity=".5"/></svg>`,
  key: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
  vpn: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>`,
  openclaw: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 9l2 2-2 2" stroke-width="2"/><path d="M14 9l2 2-2 2" stroke-width="2"/><path d="M7 16h10"/></svg>`,
  picoclaw: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="3" width="14" height="18" rx="3"/><circle cx="12" cy="10" r="3" stroke-dasharray="2 1"/><path d="M9 16h6"/><circle cx="12" cy="10" r="1" fill="currentColor"/></svg>`,
  phone: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
};

// ===== SOUND EFFECTS (Web Audio API) =====
SOS.sound = function (name) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    const presets = {
      nudge:   { freq: 400, type: 'sawtooth', dur: 0.5, vol: 0.15, mod: true },
      message: { freq: 800, type: 'sine', dur: 0.15, vol: 0.12, mod: false },
      call:    { freq: 600, type: 'sine', dur: 0.8, vol: 0.1, mod: true },
      error:   { freq: 200, type: 'square', dur: 0.3, vol: 0.08, mod: false },
      connect: { freq: 1000, type: 'sine', dur: 0.2, vol: 0.1, mod: false },
      click:   { freq: 1200, type: 'sine', dur: 0.05, vol: 0.06, mod: false },
    };
    const p = presets[name] || presets.click;
    osc.frequency.value = p.freq;
    osc.type = p.type;
    gain.gain.setValueAtTime(p.vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + p.dur);
    if (p.mod) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 12;
      lfoGain.gain.value = p.freq * 0.15;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(); lfo.stop(ctx.currentTime + p.dur);
    }
    osc.start(); osc.stop(ctx.currentTime + p.dur);
  } catch (e) { /* Web Audio not supported */ }
};

// ===== AUTH NAMESPACE =====
SOS.auth = {
  user: SOS.load('auth-user') || null,
  connections: SOS.load('auth-conn') || {},
  login(provider, data) {
    this.connections[provider] = { ...data, connected: true, time: Date.now() };
    SOS.save('auth-conn', this.connections);
    SOS.notify('Connected', `${provider} connected successfully.`, 'key');
  },
  logout(provider) {
    delete this.connections[provider];
    SOS.save('auth-conn', this.connections);
  },
  isConnected(provider) { return !!(this.connections[provider] && this.connections[provider].connected) },
  setUser(u) { this.user = u; SOS.save('auth-user', u) },
};

// ===== JARVIS BOOT SEQUENCE =====
SOS.boot = function () {
  const c = this.$('#boot-fx'), ctx = c.getContext('2d');
  c.width = innerWidth; c.height = innerHeight;
  const cx = c.width / 2, cy = c.height / 2;
  let t = 0;
  const msgs = [
    { t: 10, text: 'INITIALIZING NEURAL CORES...' },
    { t: 25, text: 'BITNET 1.58-BIT ENGINE: LOADING' },
    { t: 40, text: 'AGENT JARVIS: CONNECTING' },
    { t: 55, text: 'MULTI-AI SEARCH: ONLINE' },
    { t: 70, text: 'SINTEXOS: READY' },
  ];
  let msgIdx = 0;

  const draw = () => {
    t++;
    ctx.fillStyle = 'rgba(0,0,0,.08)';
    ctx.fillRect(0, 0, c.width, c.height);

    // Arc reactor rings
    for (let r = 0; r < 3; r++) {
      const radius = 40 + r * 28;
      const alpha = 0.15 + Math.sin(t * 0.05 + r) * 0.1;
      ctx.strokeStyle = `rgba(96,205,255,${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, t * 0.02 + r, t * 0.02 + r + Math.PI * 1.5);
      ctx.stroke();
    }

    // Center glow
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
    grd.addColorStop(0, `rgba(96,205,255,${0.3 + Math.sin(t * 0.08) * 0.15})`);
    grd.addColorStop(1, 'rgba(96,205,255,0)');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2); ctx.fill();

    // HUD lines radiating
    ctx.strokeStyle = 'rgba(96,205,255,0.06)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 12; i++) {
      const a = (Math.PI * 2 / 12) * i + t * 0.01;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 100, cy + Math.sin(a) * 100);
      ctx.lineTo(cx + Math.cos(a) * c.width, cy + Math.sin(a) * c.width);
      ctx.stroke();
    }

    // Boot messages
    if (msgIdx < msgs.length && t >= msgs[msgIdx].t) {
      const msg = msgs[msgIdx];
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillStyle = `rgba(96,205,255,${0.6 + Math.random() * 0.2})`;
      const y = c.height * 0.7 + msgIdx * 20;
      ctx.fillText('> ' + msg.text, cx - 160, y);
      msgIdx++;
    }

    // Floating particles
    for (let i = 0; i < 8; i++) {
      const px = cx + Math.sin(t * 0.03 + i * 1.7) * 150;
      const py = cy + Math.cos(t * 0.025 + i * 2.1) * 150;
      ctx.fillStyle = 'rgba(96,205,255,0.15)';
      ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
    }

    if (t < 85) requestAnimationFrame(draw);
  };
  draw();

  setTimeout(() => {
    this.$('#boot').classList.add('out');
    setTimeout(() => { this.$('#boot').remove(); SOS.showLock(); }, 600);
  }, 3200);
};

// ===== LOCK SCREEN =====
SOS.showLock = function () {
  const ls = this.$('#lockscreen');
  ls.classList.remove('hidden');
  const updateTime = () => {
    this.$('#lock-time').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.$('#lock-date').textContent = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };
  updateTime();
  const ti = setInterval(updateTime, 30000);
  const unlock = () => {
    ls.classList.add('hidden'); clearInterval(ti); SOS.initDesktop();
    ls.removeEventListener('click', unlock);
    document.removeEventListener('keydown', unlock);
  };
  ls.addEventListener('click', unlock);
  document.addEventListener('keydown', unlock);
};

// ===== DESKTOP INIT =====
SOS.initDesktop = function () {
  SOS.initWallpaper(); SOS.initIcons(); SOS.emit('initShell'); SOS.emit('initWM');
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) SOS.stopWP(); else SOS.initWallpaper();
  });
  setTimeout(() => {
    SOS.notify('JARVIS Online', `${SOS.getGreeting()}, sir. All systems operational.`, 'jarvis');
  }, 800);
};

// ===== WALLPAPER =====
SOS.initWallpaper = function () {
  const c = this.$('#wallpaper'), ctx = c.getContext('2d');
  c.width = innerWidth; c.height = innerHeight;
  window.addEventListener('resize', () => { c.width = innerWidth; c.height = innerHeight });
  let t = 0;
  const draw = () => {
    t += .003;
    const g = ctx.createRadialGradient(
      c.width * .5 + Math.sin(t) * c.width * .2, c.height * .4 + Math.cos(t * .7) * c.height * .2, c.width * .1,
      c.width * .5, c.height * .5, c.width * .7
    );
    g.addColorStop(0, '#0a1628'); g.addColorStop(.4, '#0d0d2b'); g.addColorStop(.7, '#1a0a2e'); g.addColorStop(1, '#000');
    ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = 'rgba(96,205,255,.015)';
    for (let i = 0; i < 30; i++) {
      const x = (Math.sin(t * 2 + i * 1.3) * 0.5 + 0.5) * c.width;
      const y = (Math.cos(t * 1.5 + i * 0.9) * 0.5 + 0.5) * c.height;
      ctx.beginPath(); ctx.arc(x, y, 1 + Math.sin(t + i) * 1, 0, Math.PI * 2); ctx.fill();
    }
    SOS.state.wpRAF = requestAnimationFrame(draw);
  };
  draw();
};
SOS.stopWP = function () { if (this.state.wpRAF) { cancelAnimationFrame(this.state.wpRAF); this.state.wpRAF = null } };

// ===== DESKTOP ICONS (GRID) =====
SOS.initIcons = function () {
  const el = this.$('#desk-icons'); el.innerHTML = '';
  const desk = ['claude', 'search', 'messenger', 'terminal', 'browser', 'agents', 'openclaw', 'brain', 'vpn', 'notepad'];
  desk.forEach(id => {
    const app = this.apps.find(a => a.id === id); if (!app) return;
    const d = this.h('div', { className: 'd-icon' });
    d.innerHTML = `<div class="d-icon-img">${app.icon}</div><div class="d-icon-name">${app.name}</div>`;
    d.ondblclick = () => SOS.emit('openApp', id);
    d.onclick = () => { this.$$('.d-icon').forEach(x => x.classList.remove('sel')); d.classList.add('sel') };
    if (this.state.isMob) d.onclick = () => SOS.emit('openApp', id);
    el.appendChild(d);
  });
};

// ===== KEYBOARD =====
document.addEventListener('keydown', e => {
  if (e.key === 'Meta' || (e.ctrlKey && e.key === ' ')) { e.preventDefault(); SOS.emit('toggleStart') }
  if (e.key === 'Escape') { SOS.emit('toggleStart', false); SOS.emit('toggleSearch', false) }
});

// ===== INIT =====
document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', () => SOS.boot())
  : SOS.boot();
