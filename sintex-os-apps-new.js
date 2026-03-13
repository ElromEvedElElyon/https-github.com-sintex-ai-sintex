/* SintexOS New Apps — Calculator, Paint, Weather, Clock, Store, Music */
(function () {
  const I = SOS.ICO;

  SOS.registerApp({ id: 'calc', name: 'Calculator', icon: I.calc, pin: false, w: 340, h: 500, render: renderCalc });
  SOS.registerApp({ id: 'paint', name: 'Paint', icon: I.paint, pin: false, w: 860, h: 580, render: renderPaint });
  SOS.registerApp({ id: 'weather', name: 'Weather', icon: I.weather, pin: false, w: 420, h: 520, render: renderWeather });
  SOS.registerApp({ id: 'clock', name: 'Clock', icon: I.clock, pin: false, w: 400, h: 460, render: renderClock });
  SOS.registerApp({ id: 'store', name: 'Store', icon: I.store, pin: false, w: 820, h: 560, render: renderStore });
  SOS.registerApp({ id: 'music', name: 'Music', icon: I.music, pin: false, w: 500, h: 440, render: renderMusic });

  // ===== CALCULATOR =====
  function renderCalc() {
    const w = SOS.h('div', { className: 'app-calc' });
    let display = '0', prev = '', op = '', fresh = true;
    w.innerHTML = `<div class="calc-display" id="calc-disp">0</div><div class="calc-prev" id="calc-prev"></div><div class="calc-grid"></div>`;
    const disp = () => w.querySelector('#calc-disp');
    const prevEl = () => w.querySelector('#calc-prev');
    const btns = [
      ['C', '⌫', '%', '÷'],
      ['7', '8', '9', '×'],
      ['4', '5', '6', '-'],
      ['1', '2', '3', '+'],
      ['±', '0', '.', '='],
    ];
    const grid = w.querySelector('.calc-grid');
    btns.forEach(row => row.forEach(b => {
      const btn = SOS.h('button', { className: `calc-btn ${b === '=' ? 'calc-eq' : ''} ${'+-×÷%'.includes(b) ? 'calc-op' : ''} ${b === 'C' || b === '⌫' ? 'calc-fn' : ''}` });
      btn.textContent = b;
      btn.onclick = () => {
        if (b >= '0' && b <= '9') { display = fresh ? b : display + b; fresh = false; }
        else if (b === '.') { if (!display.includes('.')) display += '.'; fresh = false; }
        else if (b === '±') { display = String(-parseFloat(display)); }
        else if (b === 'C') { display = '0'; prev = ''; op = ''; fresh = true; }
        else if (b === '⌫') { display = display.length > 1 ? display.slice(0, -1) : '0'; }
        else if (b === '=') {
          if (prev && op) {
            const a = parseFloat(prev), c = parseFloat(display);
            if (op === '+') display = String(a + c);
            else if (op === '-') display = String(a - c);
            else if (op === '×') display = String(a * c);
            else if (op === '÷') display = c !== 0 ? String(a / c) : 'Error';
            else if (op === '%') display = String(a % c);
            prev = ''; op = ''; fresh = true;
          }
        } else {
          if (prev && op && !fresh) {
            const a = parseFloat(prev), c = parseFloat(display);
            if (op === '+') display = String(a + c);
            else if (op === '-') display = String(a - c);
            else if (op === '×') display = String(a * c);
            else if (op === '÷') display = c !== 0 ? String(a / c) : 'Error';
          }
          prev = display; op = b; fresh = true;
        }
        const d = disp(); if (d) d.textContent = display;
        const p = prevEl(); if (p) p.textContent = prev ? `${prev} ${op}` : '';
      };
      grid.appendChild(btn);
    }));
    return w;
  }

  // ===== PAINT =====
  function renderPaint() {
    const w = SOS.h('div', { className: 'app-paint' });
    w.innerHTML = `
      <div class="paint-toolbar">
        <button class="paint-tool active" data-tool="pencil" title="Pencil">✏️</button>
        <button class="paint-tool" data-tool="eraser" title="Eraser">🧹</button>
        <button class="paint-tool" data-tool="rect" title="Rectangle">⬜</button>
        <button class="paint-tool" data-tool="circle" title="Circle">⭕</button>
        <span class="paint-sep"></span>
        <input type="color" class="paint-color" value="#60CDFF" title="Color">
        <input type="range" class="paint-size" min="1" max="20" value="3" title="Size">
        <span class="paint-sep"></span>
        <button class="paint-tool" data-tool="undo" title="Undo">↩️</button>
        <button class="paint-tool" data-tool="clear" title="Clear">🗑️</button>
      </div>
      <canvas class="paint-canvas"></canvas>`;

    setTimeout(() => {
      const canvas = w.querySelector('.paint-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width || 800;
      canvas.height = (rect.height || 540) - 48;
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let tool = 'pencil', color = '#60CDFF', size = 3, drawing = false, sx, sy;
      const history = [];
      const saveState = () => { if (history.length > 20) history.shift(); history.push(canvas.toDataURL()) };
      saveState();

      w.querySelectorAll('.paint-tool').forEach(b => {
        b.onclick = () => {
          const t = b.dataset.tool;
          if (t === 'undo') { if (history.length > 1) { history.pop(); const img = new Image(); img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0) }; img.src = history[history.length - 1] } return; }
          if (t === 'clear') { ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, 0, canvas.width, canvas.height); saveState(); return; }
          tool = t;
          w.querySelectorAll('.paint-tool').forEach(x => x.classList.remove('active'));
          b.classList.add('active');
        };
      });
      const colorPicker = w.querySelector('.paint-color');
      if (colorPicker) colorPicker.oninput = e => color = e.target.value;
      const sizeSlider = w.querySelector('.paint-size');
      if (sizeSlider) sizeSlider.oninput = e => size = +e.target.value;

      canvas.onpointerdown = e => {
        drawing = true; const r = canvas.getBoundingClientRect();
        sx = e.clientX - r.left; sy = e.clientY - r.top;
        if (tool === 'pencil' || tool === 'eraser') {
          ctx.beginPath(); ctx.moveTo(sx, sy);
        }
      };
      canvas.onpointermove = e => {
        if (!drawing) return; const r = canvas.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        if (tool === 'pencil') {
          ctx.strokeStyle = color; ctx.lineWidth = size; ctx.lineCap = 'round'; ctx.lineTo(x, y); ctx.stroke();
        } else if (tool === 'eraser') {
          ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth = size * 3; ctx.lineCap = 'round'; ctx.lineTo(x, y); ctx.stroke();
        }
      };
      canvas.onpointerup = e => {
        if (!drawing) return; drawing = false;
        const r = canvas.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        if (tool === 'rect') {
          ctx.strokeStyle = color; ctx.lineWidth = size;
          ctx.strokeRect(Math.min(sx, x), Math.min(sy, y), Math.abs(x - sx), Math.abs(y - sy));
        } else if (tool === 'circle') {
          ctx.strokeStyle = color; ctx.lineWidth = size;
          const rx = Math.abs(x - sx) / 2, ry = Math.abs(y - sy) / 2;
          ctx.beginPath(); ctx.ellipse(sx + (x - sx) / 2, sy + (y - sy) / 2, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
        }
        saveState();
      };
    }, 100);
    return w;
  }

  // ===== WEATHER =====
  function renderWeather() {
    const w = SOS.h('div', { className: 'app-weather' });
    w.innerHTML = `<div class="wth-loading">Loading weather data...</div>`;
    fetch('https://wttr.in/?format=j1')
      .then(r => r.json())
      .then(d => {
        const cur = d.current_condition?.[0] || {};
        const forecast = d.weather?.slice(0, 3) || [];
        w.innerHTML = `
          <div class="wth-current">
            <div class="wth-temp">${cur.temp_C || '?'}°</div>
            <div class="wth-info">
              <div class="wth-desc">${cur.weatherDesc?.[0]?.value || 'Unknown'}</div>
              <div class="wth-feels">Feels like ${cur.FeelsLikeC || '?'}°C</div>
              <div class="wth-detail">💧 ${cur.humidity || '?'}% | 💨 ${cur.windspeedKmph || '?'} km/h | ☁️ ${cur.cloudcover || '?'}%</div>
            </div>
          </div>
          <div class="wth-forecast">
            ${forecast.map(f => `<div class="wth-day">
              <div class="wth-day-name">${new Date(f.date).toLocaleDateString([], { weekday: 'short' })}</div>
              <div class="wth-day-temp">${f.maxtempC}° / ${f.mintempC}°</div>
              <div class="wth-day-desc">${f.hourly?.[4]?.weatherDesc?.[0]?.value || ''}</div>
            </div>`).join('')}
          </div>
          <div class="wth-footer">Data from wttr.in</div>`;
      })
      .catch(() => { w.innerHTML = '<div class="wth-loading">Weather service unavailable</div>' });
    return w;
  }

  // ===== CLOCK =====
  function renderClock() {
    const w = SOS.h('div', { className: 'app-clock' });
    const canvas = SOS.h('canvas', { width: 220, height: 220, className: 'clock-face' });
    const digital = SOS.h('div', { className: 'clock-digital' });
    const tabs = SOS.h('div', { className: 'clock-tabs' });
    tabs.innerHTML = '<button class="clock-tab active">Clock</button><button class="clock-tab">Timer</button><button class="clock-tab">Stopwatch</button>';

    const timerSection = SOS.h('div', { className: 'clock-section hidden', id: 'timer-section' });
    timerSection.innerHTML = '<div class="timer-display">00:00</div><div class="timer-btns"><button class="timer-btn" id="timer-start">Start (5min)</button><button class="timer-btn" id="timer-reset">Reset</button></div>';

    const swSection = SOS.h('div', { className: 'clock-section hidden', id: 'sw-section' });
    swSection.innerHTML = '<div class="sw-display">00:00.000</div><div class="timer-btns"><button class="timer-btn" id="sw-start">Start</button><button class="timer-btn" id="sw-reset">Reset</button></div>';

    w.append(tabs, canvas, digital, timerSection, swSection);

    // Clock drawing
    function drawClock() {
      const ctx = canvas.getContext('2d');
      const cw = 220, ch = 220, cx = cw / 2, cy = ch / 2, r = 90;
      ctx.clearRect(0, 0, cw, ch);
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(96,205,255,.25)'; ctx.lineWidth = 2; ctx.stroke();
      for (let i = 0; i < 60; i++) {
        const a = (Math.PI * 2 / 60) * i - Math.PI / 2;
        const len = i % 5 === 0 ? 10 : 4;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * (r - len), cy + Math.sin(a) * (r - len));
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        ctx.strokeStyle = i % 5 === 0 ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.2)';
        ctx.lineWidth = i % 5 === 0 ? 2 : 1; ctx.stroke();
      }
      const now = new Date();
      const hr = now.getHours() % 12, mn = now.getMinutes(), sc = now.getSeconds();
      // Hour
      const ha = (Math.PI * 2 / 12) * (hr + mn / 60) - Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ha) * 50, cy + Math.sin(ha) * 50);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke();
      // Minute
      const ma = (Math.PI * 2 / 60) * mn - Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ma) * 68, cy + Math.sin(ma) * 68);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.stroke();
      // Second
      const sa = (Math.PI * 2 / 60) * sc - Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(sa) * 78, cy + Math.sin(sa) * 78);
      ctx.strokeStyle = '#60CDFF'; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fillStyle = '#60CDFF'; ctx.fill();
      digital.textContent = now.toLocaleTimeString();
    }
    drawClock();
    const iv = setInterval(drawClock, 1000);
    w._cleanup = () => clearInterval(iv);

    // Tabs
    setTimeout(() => {
      const tabBtns = w.querySelectorAll('.clock-tab');
      tabBtns.forEach((t, i) => t.onclick = () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        t.classList.add('active');
        canvas.classList.toggle('hidden', i !== 0);
        digital.classList.toggle('hidden', i !== 0);
        timerSection.classList.toggle('hidden', i !== 1);
        swSection.classList.toggle('hidden', i !== 2);
      });

      // Timer
      let timerIv, timerSec = 300;
      const timerDisp = w.querySelector('.timer-display');
      w.querySelector('#timer-start').onclick = () => {
        if (timerIv) { clearInterval(timerIv); timerIv = null; return }
        timerIv = setInterval(() => {
          timerSec--; if (timerSec <= 0) { clearInterval(timerIv); timerIv = null; SOS.notify('Timer', 'Timer complete!'); }
          const m = Math.floor(timerSec / 60), s = timerSec % 60;
          if (timerDisp) timerDisp.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }, 1000);
      };
      w.querySelector('#timer-reset').onclick = () => { clearInterval(timerIv); timerIv = null; timerSec = 300; if (timerDisp) timerDisp.textContent = '05:00' };

      // Stopwatch
      let swIv, swMs = 0;
      const swDisp = w.querySelector('.sw-display');
      w.querySelector('#sw-start').onclick = () => {
        if (swIv) { clearInterval(swIv); swIv = null; return }
        swIv = setInterval(() => {
          swMs += 10;
          const m = Math.floor(swMs / 60000), s = Math.floor((swMs % 60000) / 1000), ms = swMs % 1000;
          if (swDisp) swDisp.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
        }, 10);
      };
      w.querySelector('#sw-reset').onclick = () => { clearInterval(swIv); swIv = null; swMs = 0; if (swDisp) swDisp.textContent = '00:00.000' };
    }, 50);
    return w;
  }

  // ===== STORE =====
  function renderStore() {
    const w = SOS.h('div', { className: 'app-store' });
    const apps = [
      { name: 'BitNet Research', desc: 'Technical deep-dive into 1.58-bit AI', cat: 'AI', url: '/bitnet-research.html', color: '#60CDFF' },
      { name: 'Binary Computing', desc: 'Interactive ternary visualization', cat: 'AI', url: '/binary-computing.html', color: '#6CCB5F' },
      { name: 'Standard Bitcoin', desc: 'Bitcoin DeFi platform', cat: 'Crypto', url: 'https://www.standardbitcoin.io', color: '#FCB900' },
      { name: 'Bitcoin Brasil', desc: 'Portuguese crypto community', cat: 'Crypto', url: 'https://bitcoinbrasil.org', color: '#FF6B6B' },
      { name: 'STBTCx on pump.fun', desc: 'Trade STBTCx token', cat: 'Crypto', url: 'https://pump.fun/coin/386JZJtkvf43yoNawAHmHHeEhZWUTZ4UuJJtxC9fpump', color: '#B4A0FF' },
      { name: 'Gemini CLI', desc: 'Free AI terminal agent by Google', cat: 'Tools', url: 'https://github.com/google-gemini/gemini-cli', color: '#4285F4' },
      { name: 'PicoClaw', desc: 'Ultra-lightweight AI assistant (<10MB)', cat: 'Tools', url: 'https://github.com/sipeed/picoclaw', color: '#6CCB5F' },
      { name: 'Claude Agent SDK', desc: 'Build custom AI agents', cat: 'Tools', url: 'https://github.com/anthropics/claude-agent-sdk-python', color: '#D4A574' },
      { name: 'MCP Protocol', desc: 'Universal AI tool protocol', cat: 'Tools', url: 'https://github.com/modelcontextprotocol/specification', color: '#60CDFF' },
    ];
    w.innerHTML = `
      <div class="store-header"><span style="font-size:20px;font-weight:600">Store</span><span style="color:var(--text3);font-size:12px">SintexOS App Catalog</span></div>
      <div class="store-cats">
        <button class="store-cat active" data-cat="all">All</button>
        <button class="store-cat" data-cat="AI">AI</button>
        <button class="store-cat" data-cat="Crypto">Crypto</button>
        <button class="store-cat" data-cat="Tools">Tools</button>
      </div>
      <div class="store-grid" id="store-grid">
        ${apps.map(a => `<a href="${a.url}" target="_blank" class="store-app" data-cat="${a.cat}">
          <div class="store-icon" style="background:${a.color}20;color:${a.color}">${a.name[0]}</div>
          <div class="store-info"><div class="store-name">${a.name}</div><div class="store-desc">${a.desc}</div>
          <span class="store-badge">${a.cat}</span></div></a>`).join('')}
      </div>`;
    setTimeout(() => {
      w.querySelectorAll('.store-cat').forEach(btn => {
        btn.onclick = () => {
          w.querySelectorAll('.store-cat').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const cat = btn.dataset.cat;
          w.querySelectorAll('.store-app').forEach(a => {
            a.style.display = cat === 'all' || a.dataset.cat === cat ? '' : 'none';
          });
        };
      });
    }, 50);
    return w;
  }

  // ===== MUSIC PLAYER =====
  function renderMusic() {
    const w = SOS.h('div', { className: 'app-music' });
    const tracks = [
      { title: 'Neural Cascade', artist: 'BitNet', dur: '3:42' },
      { title: 'Ternary Dreams', artist: 'Sintex.AI', dur: '4:18' },
      { title: 'Digital Frontier', artist: 'JARVIS', dur: '5:01' },
      { title: 'Quantum Echo', artist: 'OpenClaw', dur: '3:55' },
      { title: 'Binary Sunset', artist: 'PicoClaw', dur: '4:33' },
    ];
    let current = 0, playing = false;
    w.innerHTML = `
      <div class="mus-now">
        <canvas class="mus-viz" id="mus-viz" width="460" height="80"></canvas>
        <div class="mus-track-info">
          <div class="mus-title">${tracks[0].title}</div>
          <div class="mus-artist">${tracks[0].artist}</div>
        </div>
        <div class="mus-progress"><div class="mus-bar"><div class="mus-fill" id="mus-fill"></div></div><div class="mus-time"><span>0:00</span><span>${tracks[0].dur}</span></div></div>
        <div class="mus-controls">
          <button class="mus-btn" id="mus-prev">⏮</button>
          <button class="mus-btn mus-play" id="mus-play">▶</button>
          <button class="mus-btn" id="mus-next">⏭</button>
        </div>
      </div>
      <div class="mus-list">${tracks.map((t, i) => `<div class="mus-item ${i === 0 ? 'active' : ''}" data-i="${i}"><span class="mus-item-n">${i + 1}</span><div><div class="mus-item-t">${t.title}</div><div class="mus-item-a">${t.artist}</div></div><span class="mus-item-d">${t.dur}</span></div>`).join('')}</div>`;

    setTimeout(() => {
      const viz = w.querySelector('#mus-viz');
      const ctx = viz?.getContext('2d');
      let vizIv;

      function drawViz() {
        if (!ctx || !viz) return;
        ctx.clearRect(0, 0, viz.width, viz.height);
        const bars = 40;
        for (let i = 0; i < bars; i++) {
          const h = playing ? 10 + Math.random() * 60 : 5 + Math.sin(i * 0.3) * 3;
          ctx.fillStyle = `rgba(96,205,255,${playing ? 0.4 + Math.random() * 0.4 : 0.15})`;
          ctx.fillRect(i * (viz.width / bars) + 2, viz.height - h, viz.width / bars - 4, h);
        }
      }

      function setTrack(i) {
        current = i;
        const t = tracks[i];
        const title = w.querySelector('.mus-title'); if (title) title.textContent = t.title;
        const artist = w.querySelector('.mus-artist'); if (artist) artist.textContent = t.artist;
        w.querySelectorAll('.mus-item').forEach((el, j) => el.classList.toggle('active', j === i));
      }

      w.querySelector('#mus-play').onclick = () => {
        playing = !playing;
        const btn = w.querySelector('#mus-play');
        if (btn) btn.textContent = playing ? '⏸' : '▶';
        if (playing) { vizIv = setInterval(drawViz, 100) }
        else { clearInterval(vizIv); drawViz() }
      };
      w.querySelector('#mus-prev').onclick = () => setTrack((current - 1 + tracks.length) % tracks.length);
      w.querySelector('#mus-next').onclick = () => setTrack((current + 1) % tracks.length);
      w.querySelectorAll('.mus-item').forEach(el => {
        el.onclick = () => { setTrack(+el.dataset.i); playing = true; const btn = w.querySelector('#mus-play'); if (btn) btn.textContent = '⏸'; vizIv = setInterval(drawViz, 100) };
      });
      drawViz();
    }, 50);
    return w;
  }
})();
