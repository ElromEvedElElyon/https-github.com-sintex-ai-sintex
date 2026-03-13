/* SintexOS Apps — Core Applications */
(function () {
  const I = SOS.ICO;

  // Register all apps
  SOS.registerApp({ id: 'search', name: 'JARVIS Search', icon: I.search, pin: true, w: 920, h: 640, color: '#60CDFF', render: renderSearch });
  SOS.registerApp({ id: 'terminal', name: 'Terminal', icon: I.terminal, pin: true, w: 800, h: 500, color: '#6CCB5F', render: renderTerm });
  SOS.registerApp({ id: 'files', name: 'Explorer', icon: I.folder, pin: true, w: 820, h: 540, color: '#FCB900', render: renderExplorer });
  SOS.registerApp({ id: 'browser', name: 'Edge', icon: I.browser, pin: true, w: 960, h: 640, color: '#B4A0FF', render: renderBrowser });
  SOS.registerApp({ id: 'notepad', name: 'Notepad', icon: I.note, pin: false, w: 700, h: 480, color: '#60CDFF', render: renderNotepad });
  SOS.registerApp({ id: 'monitor', name: 'Task Manager', icon: I.monitor, pin: true, w: 620, h: 520, color: '#FF6B6B', render: renderMonitor });
  SOS.registerApp({ id: 'settings', name: 'Settings', icon: I.settings, pin: false, w: 820, h: 560, color: '#999', render: renderSettings });
  SOS.registerApp({ id: 'agents', name: 'JARVIS Hub', icon: I.jarvis, pin: true, w: 780, h: 560, color: '#60CDFF', render: renderAgents });

  // ===== JARVIS AI SEARCH =====
  function renderSearch() {
    const w = SOS.h('div', { className: 'app-search' });
    w.innerHTML = `
      <div class="srch-header">
        <div class="srch-logo"><div class="srch-arc">${I.jarvis}</div><span>JARVIS Search</span></div>
        <div class="srch-input-wrap">
          <input type="text" class="srch-input" placeholder="Search anything — powered by multi-AI agents..." autofocus>
          <button class="srch-send">${I.search}</button>
        </div>
        <div class="srch-chips" id="srch-chips">
          <button class="srch-chip">What is BitNet?</button>
          <button class="srch-chip">Bitcoin energy</button>
          <button class="srch-chip">STBTCx token</button>
          <button class="srch-chip">Sintex vs Perplexity</button>
          <button class="srch-chip">OpenClaw agents</button>
        </div>
      </div>
      <div class="srch-results" id="srch-results"></div>`;

    const input = w.querySelector('.srch-input');
    const results = w.querySelector('#srch-results');

    async function doSearch(query) {
      if (!query) return;
      results.innerHTML = `<div class="srch-loading"><div class="srch-spinner"></div><span>Searching with JARVIS multi-AI engine...</span></div>`;
      try {
        let data;
        try {
          const res = await fetch('/api/multi-search', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
          });
          if (res.ok) data = await res.json();
        } catch {}
        if (!data && typeof BitNetClient !== 'undefined') data = await BitNetClient.search(query);
        if (!data) throw new Error('No response');

        const prov = data.provider ? (typeof data.provider === 'object' ? `${data.provider.llm} + ${data.provider.web}` : data.provider) : 'cache';
        let html = `<div class="srch-answer">
          <div class="srch-provider-bar"><span class="srch-prov-badge">${prov.toUpperCase()}</span> <span class="srch-prov-label">Answer</span></div>
          <div class="srch-answer-text">${renderMd(data.answer || '')}</div>`;
        if (data.sources?.length) {
          html += '<div class="srch-sources"><div class="srch-sources-title">Sources</div>';
          data.sources.forEach((s, i) => {
            html += `<a href="${s.url}" target="_blank" class="srch-source-card">
              <span class="srch-source-num">${i + 1}</span>
              <div><div class="srch-source-t">${SOS.esc(s.title || 'Source')}</div>
              <div class="srch-source-u">${SOS.esc(s.url || '')}</div></div></a>`;
          });
          html += '</div>';
        }
        if (data.related?.length) {
          html += '<div class="srch-related"><div class="srch-sources-title">Related Questions</div>';
          data.related.forEach(q => {
            html += `<button class="srch-related-btn">${SOS.esc(q)}</button>`;
          });
          html += '</div>';
        }
        html += '</div>';
        results.innerHTML = html;

        // Wire related buttons
        results.querySelectorAll('.srch-related-btn').forEach(btn => {
          btn.onclick = () => { input.value = btn.textContent; doSearch(btn.textContent) };
        });
      } catch (e) {
        results.innerHTML = `<div class="srch-error">Search temporarily unavailable. Try again shortly.</div>`;
      }
    }

    w.querySelector('.srch-send').onclick = () => doSearch(input.value.trim());
    input.onkeydown = e => { if (e.key === 'Enter') doSearch(input.value.trim()) };
    w.querySelectorAll('.srch-chip').forEach(c => {
      c.onclick = () => { input.value = c.textContent; doSearch(c.textContent) };
    });
    return w;
  }

  function renderMd(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[(\d+)\]/g, '<sup class="cite">[$1]</sup>')
      .replace(/^### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^## (.+)$/gm, '<h3>$1</h3>')
      .replace(/^# (.+)$/gm, '<h2>$1</h2>')
      .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }

  // ===== TERMINAL =====
  function renderTerm() {
    const w = SOS.h('div', { className: 'app-term' });
    const tabs = SOS.h('div', { className: 'term-tabs' });
    tabs.innerHTML = '<div class="term-tab active">JARVIS Terminal</div>';
    const out = SOS.h('div', { className: 'term-out' });
    out.innerHTML = `<span class="t-info">SintexOS Terminal v2.0 — JARVIS Edition</span>\n<span class="t-dim">BitNet 1.58-bit Ternary Engine — {-1, 0, +1}</span>\n<span class="t-dim">Multi-AI: Groq + Gemini + Grok + Together</span>\n<span class="t-dim">Type </span><span class="t-cmd">help</span><span class="t-dim"> for commands</span>\n\n`;
    const hist = []; let hi = -1, cwd = '/home/sintex';
    const FS = {
      '/': ['boot', 'etc', 'home', 'usr', 'var', 'sys', 'opt'],
      '/home': ['sintex'], '/home/sintex': ['Desktop', 'Documents', 'Downloads', '.bitnet', '.openclaw', '.picoclaw'],
      '/home/sintex/.bitnet': ['models', 'config.json'], '/home/sintex/.bitnet/models': ['bitnet-b1.58-2B-4T.gguf', 'bitnet-b1.58-700M.gguf'],
      '/home/sintex/.openclaw': ['agents', 'workspace', 'node.json', 'skills'],
      '/home/sintex/.openclaw/agents': ['jarvis.json', 'skynet.json'],
      '/home/sintex/.openclaw/skills': ['search.md', 'deploy.md', 'tweet.md'],
      '/home/sintex/.picoclaw': ['config.json', 'workspace', 'skills'],
      '/home/sintex/.picoclaw/skills': ['web_search.md', 'memory.md', 'cron.md'],
      '/home/sintex/Documents': ['BitNet-Research.pdf', 'Sovereign-Stack.md', 'DeFi-Playbook.md', 'JARVIS-Manual.md'],
      '/home/sintex/Desktop': ['README.md'], '/home/sintex/Downloads': [],
      '/boot': ['vmlinuz-bitnet', 'initrd.img', 'jarvis-core.bin'],
      '/etc': ['hostname', 'fstab', 'sintexos-release', 'jarvis.conf'],
      '/usr': ['bin', 'lib'], '/usr/bin': ['bitnet', 'openclaw', 'picoclaw', 'node', 'python3', 'jarvis'],
      '/opt': ['groq-client', 'gemini-cli', 'grok-sdk'],
    };
    const resolve = p => {
      if (!p || p === '~') return '/home/sintex'; if (p === '/') return '/';
      if (p.startsWith('/')) return p.replace(/\/+$/, '') || '/';
      if (p === '..') { const pts = cwd.split('/').filter(Boolean); pts.pop(); return '/' + pts.join('/') || '/' }
      return (cwd === '/' ? '/' : cwd + '/') + p;
    };
    const CMDS = {
      help: () => `<span class="t-info">Commands:</span>  ls  cd  pwd  whoami  date  clear  neofetch  bitnet  openclaw  picoclaw  jarvis  echo  history  uname  free  top  cat  exit  search`,
      ls: a => { const p = a[0] ? resolve(a[0]) : cwd; const items = FS[p]; if (!items) return `<span class="t-err">ls: '${a[0] || p}': No such directory</span>`; return items.map(f => { const fp = p === '/' ? '/' + f : p + '/' + f; return FS[fp] ? `<span class="t-info">${f}/</span>` : f }).join('  ') },
      cd: a => { const p = resolve(a[0]); if (FS[p] !== undefined) { cwd = p; return null } return `<span class="t-err">cd: ${a[0]}: not found</span>` },
      pwd: () => cwd, whoami: () => 'elrom', date: () => new Date().toString(),
      clear: () => { out.innerHTML = ''; return null },
      neofetch: () => `<span class="t-info">
  ╔═══════════════════════════════╗
  ║   ███████╗ ██████╗ ███████╗  ║
  ║   ██╔════╝██╔═══██╗██╔════╝  ║
  ║   ███████╗██║   ██║███████╗  ║
  ║   ╚════██║██║   ██║╚════██║  ║
  ║   ███████║╚██████╔╝███████║  ║
  ║   ╚══════╝ ╚═════╝ ╚══════╝  ║
  ╚═══════════════════════════════╝</span>
  <span class="t-dim">OS</span>      SintexOS 2.0 x86_64 (JARVIS Edition)
  <span class="t-dim">Kernel</span>  BitNet 1.58-bit (ternary)
  <span class="t-dim">Shell</span>   jarvis-sh 2.0
  <span class="t-dim">Engine</span>  {-1, 0, +1} Multi-AI Matrix
  <span class="t-dim">CPU</span>     ${navigator.hardwareConcurrency || '?'}x cores
  <span class="t-dim">Memory</span>  ${navigator.deviceMemory || '?'} GB
  <span class="t-dim">Display</span> ${screen.width}x${screen.height}
  <span class="t-dim">Agent</span>   JARVIS (claude-opus-4-6)
  <span class="t-dim">Search</span>  Groq + Gemini + Grok + Together
  <span class="t-dim">Node</span>    OpenClaw + PicoClaw`,
      bitnet: () => `<span class="t-info">BitNet Engine</span>  <span class="t-prompt">ONLINE</span>
  Model     bitnet-b1.58-2B-4T
  Weights   {-1, 0, +1} ternary
  Speedup   6.17x vs FP16
  Energy    -82% reduction
  Fallback  Groq → Together → Gemini → Cache`,
      openclaw: () => `<span class="t-info">OpenClaw Agent Hub</span>
  Agent     JARVIS <span class="t-dim">(claude-opus-4-6)</span>
  Gateway   ws://127.0.0.1:18789
  Status    <span class="t-prompt">ONLINE</span>
  Browser   CDP :18800
  Backup    */30 auto-backup <span class="t-prompt">ACTIVE</span>`,
      picoclaw: () => `<span class="t-info">PicoClaw (Ultra-Lightweight)</span>
  Binary    Single Go binary
  Memory    <span class="t-prompt"><10 MB</span> (vs 1GB+ OpenClaw)
  Startup   <span class="t-prompt"><1s</span> (vs 500s OpenClaw)
  Gateway   127.0.0.1:18790
  Status    <span class="t-warn">STANDBY</span>
  Tools     web_search, web_fetch, spawn, cron, memory
  Platforms Telegram, Discord, Slack, WhatsApp`,
      jarvis: a => {
        if (!a[0]) return `<span class="t-info">J.A.R.V.I.S — Just A Rather Very Intelligent System</span>
  Status    <span class="t-prompt">OPERATIONAL</span>
  Model     claude-opus-4-6 (Primary)
  Search    Multi-AI (Groq + Gemini + Grok + Google)
  Skills    Search, Deploy, Tweet, Monitor, Code
  <span class="t-dim">Usage: jarvis [search|status|skills|help]</span>`;
        if (a[0] === 'status') return `All systems <span class="t-prompt">NOMINAL</span>. ${navigator.hardwareConcurrency} cores, ${navigator.deviceMemory || '?'}GB RAM.`;
        if (a[0] === 'skills') return `Installed skills:\n  • search — Multi-AI web search\n  • deploy — Netlify deployment\n  • tweet — X/Twitter automation\n  • monitor — System monitoring\n  • code — Code generation`;
        return `<span class="t-err">jarvis: unknown command '${SOS.esc(a[0])}'</span>`;
      },
      search: a => {
        if (!a.length) return '<span class="t-dim">Usage: search [query]</span>';
        SOS.emit('openApp', 'search');
        return `<span class="t-info">Opening JARVIS Search for: ${SOS.esc(a.join(' '))}</span>`;
      },
      echo: a => SOS.esc(a.join(' ')),
      history: () => hist.map((c, i) => `  ${i + 1}  ${c}`).join('\n'),
      uname: a => a[0] === '-a' ? 'SintexOS 2.0 bitnet-1.58 x86_64 JARVIS' : 'SintexOS',
      free: () => `              total    used     free\nMem:          ${navigator.deviceMemory || 8}G       2.1G     ${((navigator.deviceMemory || 8) - 2.1).toFixed(1)}G\nBitNet:       ∞        1.4G     ∞\nSwap:         4G       0.2G     3.8G`,
      top: () => `  PID  CPU%  MEM%  COMMAND\n    1   0.1   0.5  jarvis-kernel\n   42   2.3   1.2  sintex-compositor\n  128   1.1   0.8  multi-ai-search\n  256   0.4   0.3  openclaw-agent\n  512   0.2   0.1  picoclaw-gateway\n  768   1.5   0.6  bitnet-inference`,
      cat: a => {
        if (!a[0]) return '<span class="t-err">cat: missing file</span>';
        if (a[0].includes('release')) return 'SintexOS 2.0.0 (JARVIS Edition)';
        if (a[0].includes('hostname')) return 'jarvis-os';
        if (a[0].includes('jarvis.conf')) return '[agent]\nname = JARVIS\nmodel = claude-opus-4-6\nsearch = multi-ai\n\n[providers]\ngroq = enabled\ngemini = enabled\ngrok = enabled\ntogether = enabled';
        return `<span class="t-err">cat: ${SOS.esc(a[0])}: No such file</span>`;
      },
      exit: () => null
    };
    function exec(cmdStr) {
      const [cmd, ...args] = cmdStr.trim().split(/\s+/);
      out.innerHTML += `<span class="t-prompt"><span class="t-user">elrom</span>@jarvis</span>:<span class="t-path">${cwd}</span>$ <span class="t-cmd">${SOS.esc(cmdStr)}</span>\n`;
      if (cmd === 'exit') { /* close window handled by WM */ return }
      const fn = CMDS[cmd];
      const r = fn ? fn(args) : `<span class="t-err">${SOS.esc(cmd)}: command not found. Type 'help' for available commands.</span>`;
      if (r !== null && r !== undefined) out.innerHTML += r + '\n';
      out.scrollTop = out.scrollHeight;
    }
    const inRow = SOS.h('div', { className: 'term-in' });
    const prompt = SOS.h('span');
    prompt.innerHTML = `<span class="t-prompt"><span class="t-user">elrom</span>@jarvis</span>:<span class="t-path">${cwd}</span>$`;
    const input = SOS.h('input'); input.type = 'text'; input.autocomplete = 'off'; input.spellcheck = false;
    input.onkeydown = e => {
      if (e.key === 'Enter') { const c = input.value.trim(); if (!c) return; hist.unshift(c); hi = -1; input.value = ''; exec(c); prompt.innerHTML = `<span class="t-prompt"><span class="t-user">elrom</span>@jarvis</span>:<span class="t-path">${cwd}</span>$` }
      else if (e.key === 'ArrowUp') { e.preventDefault(); hi = Math.min(hi + 1, hist.length - 1); if (hi >= 0) input.value = hist[hi] }
      else if (e.key === 'ArrowDown') { e.preventDefault(); hi = Math.max(hi - 1, -1); input.value = hi >= 0 ? hist[hi] : '' }
      else if (e.key === 'Tab') { e.preventDefault(); const p = input.value; const m = Object.keys(CMDS).filter(c => c.startsWith(p)); if (m.length === 1) input.value = m[0] + ' ' }
      else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = '' }
    };
    inRow.append(prompt, input);
    w.append(tabs, out, inRow);
    w.onclick = () => input.focus();
    setTimeout(() => input.focus(), 100);
    return w;
  }

  // ===== EXPLORER =====
  function renderExplorer() {
    const w = SOS.h('div', { className: 'app-explorer' });
    let cwd = '/home/sintex';
    const FS = {
      '/': { 'boot': 'd', 'etc': 'd', 'home': 'd', 'usr': 'd', 'opt': 'd' }, '/home': { 'sintex': 'd' },
      '/home/sintex': { 'Desktop': 'd', 'Documents': 'd', 'Downloads': 'd', '.bitnet': 'd', '.openclaw': 'd', '.picoclaw': 'd' },
      '/home/sintex/Desktop': { 'README.md': 'f' },
      '/home/sintex/Documents': { 'BitNet-Research.pdf': 'f', 'Sovereign-Stack.md': 'f', 'DeFi-Playbook.md': 'f', 'JARVIS-Manual.md': 'f' },
      '/home/sintex/Downloads': {},
      '/home/sintex/.bitnet': { 'models': 'd', 'config.json': 'f' },
      '/home/sintex/.bitnet/models': { 'bitnet-b1.58-2B-4T.gguf': 'f' },
      '/home/sintex/.openclaw': { 'agents': 'd', 'workspace': 'd', 'node.json': 'f', 'skills': 'd' },
      '/home/sintex/.openclaw/agents': { 'jarvis.json': 'f' },
      '/home/sintex/.openclaw/workspace': { 'MEMORY.md': 'f', 'HEARTBEAT.md': 'f' },
      '/home/sintex/.openclaw/skills': { 'search.md': 'f', 'deploy.md': 'f' },
      '/home/sintex/.picoclaw': { 'config.json': 'f', 'workspace': 'd', 'skills': 'd' },
      '/home/sintex/.picoclaw/skills': { 'web_search.md': 'f', 'memory.md': 'f', 'cron.md': 'f' },
      '/opt': { 'groq-client': 'd', 'gemini-cli': 'd', 'grok-sdk': 'd' },
    };
    const toolbar = SOS.h('div', { className: 'exp-toolbar' });
    const backBtn = SOS.h('button', { className: 'exp-btn', textContent: '←' });
    const homeBtn = SOS.h('button', { className: 'exp-btn', textContent: '⌂' });
    const pathEl = SOS.h('div', { className: 'exp-path' });
    toolbar.append(backBtn, homeBtn, pathEl);
    const body = SOS.h('div', { className: 'exp-body' });
    const sidebar = SOS.h('div', { className: 'exp-sidebar' });
    const navItems = [
      { name: '🏠 Home', path: '/home/sintex' }, { name: '🖥️ Desktop', path: '/home/sintex/Desktop' },
      { name: '📁 Documents', path: '/home/sintex/Documents' }, { name: '📥 Downloads', path: '/home/sintex/Downloads' },
      { name: '⚡ .bitnet', path: '/home/sintex/.bitnet' }, { name: '🤖 .openclaw', path: '/home/sintex/.openclaw' },
      { name: '🐾 .picoclaw', path: '/home/sintex/.picoclaw' },
    ];
    navItems.forEach(n => {
      const el = SOS.h('div', { className: 'exp-nav', textContent: n.name });
      el.onclick = () => { cwd = n.path; render() };
      sidebar.appendChild(el);
    });
    const grid = SOS.h('div', { className: 'exp-grid' });
    const status = SOS.h('div', { className: 'exp-status' });
    body.append(sidebar, grid); w.append(toolbar, body, status);
    backBtn.onclick = () => { if (cwd !== '/') { cwd = cwd.split('/').slice(0, -1).join('/') || '/'; render() } };
    homeBtn.onclick = () => { cwd = '/home/sintex'; render() };
    function render() {
      pathEl.textContent = cwd; grid.innerHTML = '';
      const dir = FS[cwd] || {};
      if (cwd !== '/') {
        const up = SOS.h('div', { className: 'exp-item' }); up.innerHTML = `${I.folderFill}<div class="exp-item-name">..</div>`;
        up.ondblclick = () => { cwd = cwd.split('/').slice(0, -1).join('/') || '/'; render() }; grid.appendChild(up);
      }
      const entries = Object.entries(dir).sort(([, a], [, b]) => a === 'd' && b !== 'd' ? -1 : 1);
      entries.forEach(([name, type]) => {
        const el = SOS.h('div', { className: 'exp-item' });
        el.innerHTML = `${type === 'd' ? I.folderFill : I.fileFill}<div class="exp-item-name">${name}</div>`;
        el.onclick = () => { SOS.$$('.exp-item').forEach(x => x.classList.remove('sel')); el.classList.add('sel') };
        if (type === 'd') el.ondblclick = () => { cwd = cwd === '/' ? '/' + name : cwd + '/' + name; render() };
        grid.appendChild(el);
      });
      status.textContent = `${entries.length} items — ${cwd}`;
      SOS.$$('.exp-nav').forEach((n, i) => n.classList.toggle('active', navItems[i]?.path === cwd));
    }
    render(); return w;
  }

  // ===== BROWSER =====
  function renderBrowser() {
    const w = SOS.h('div', { className: 'app-browser' });
    const bar = SOS.h('div', { className: 'br-bar' });
    const back = SOS.h('button', { className: 'br-btn', textContent: '←' });
    const fwd = SOS.h('button', { className: 'br-btn', textContent: '→' });
    const ref = SOS.h('button', { className: 'br-btn', textContent: '↻' });
    const url = SOS.h('input', { className: 'br-url', value: 'https://sintex.ai' });
    const frame = SOS.h('iframe', { className: 'br-frame', src: 'https://sintex.ai' });
    frame.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups';
    url.onkeydown = e => { if (e.key === 'Enter') { let u = url.value.trim(); if (!u.startsWith('http') && !u.startsWith('/')) u = 'https://' + u; frame.src = u } };
    back.onclick = () => { try { frame.contentWindow.history.back() } catch {} };
    fwd.onclick = () => { try { frame.contentWindow.history.forward() } catch {} };
    ref.onclick = () => { frame.src = frame.src };
    bar.append(back, fwd, ref, url); w.append(bar, frame); return w;
  }

  // ===== NOTEPAD =====
  function renderNotepad() {
    const w = SOS.h('div', { className: 'app-notepad' });
    const tb = SOS.h('div', { className: 'np-toolbar' });
    const newBtn = SOS.h('button', { textContent: 'New' });
    const st = SOS.h('span', { className: 'np-status', textContent: 'Ready' });
    tb.append(newBtn, st);
    const area = SOS.h('textarea', { className: 'np-area', spellcheck: true, placeholder: 'Start typing here...\n\nYour notes auto-save to this browser.' });
    area.value = SOS.load('notepad') || '';
    let timer; area.oninput = () => { st.textContent = 'Editing...'; clearTimeout(timer); timer = setTimeout(() => { SOS.save('notepad', area.value); st.textContent = `Saved · ${area.value.length} chars` }, 500) };
    newBtn.onclick = () => { if (area.value && !confirm('Clear?')) return; area.value = ''; SOS.save('notepad', ''); st.textContent = 'New' };
    w.append(tb, area); setTimeout(() => area.focus(), 100); return w;
  }

  // ===== SYSTEM MONITOR =====
  function renderMonitor() {
    const w = SOS.h('div', { className: 'app-monitor' });
    const header = SOS.h('div', { className: 'mon-header', textContent: 'Performance' });
    const grid = SOS.h('div', { className: 'mon-grid' });
    const stats = { cpu: 12, mem: 35, gpu: 0, net: 1.5, ai: 0 };
    const hist = { cpu: [], mem: [], gpu: [], net: [], ai: [] };
    const cells = [
      { k: 'cpu', label: 'CPU', color: '#60CDFF', unit: '%' },
      { k: 'mem', label: 'Memory', color: '#B4A0FF', unit: '%' },
      { k: 'gpu', label: 'BitNet Engine', color: '#6CCB5F', unit: '%' },
      { k: 'net', label: 'Network', color: '#FCB900', unit: ' MB/s' },
      { k: 'ai', label: 'AI Agents', color: '#FF6B6B', unit: '%' },
    ];
    const els = {};
    cells.forEach(c => {
      const cell = SOS.h('div', { className: 'mon-cell' });
      cell.innerHTML = `<div class="mon-cell-title">${c.label}</div><div class="mon-cell-val" style="color:${c.color}">0${c.unit}</div><div class="mon-bar"><div class="mon-bar-fill" style="background:${c.color};width:0%"></div></div><canvas class="mon-spark" width="200" height="48"></canvas>`;
      grid.appendChild(cell);
      els[c.k] = { val: cell.querySelector('.mon-cell-val'), bar: cell.querySelector('.mon-bar-fill'), canvas: cell.querySelector('.mon-spark'), color: c.color, unit: c.unit };
    });
    function spark(cvs, data, color) {
      const ctx = cvs.getContext('2d'), w = cvs.width, ht = cvs.height;
      ctx.clearRect(0, 0, w, ht); if (data.length < 2) return;
      ctx.beginPath(); data.forEach((v, i) => { const x = i / (data.length - 1) * w, y = ht - v / 100 * ht; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y) });
      ctx.lineTo(w, ht); ctx.lineTo(0, ht); ctx.closePath(); ctx.fillStyle = color + '10'; ctx.fill();
      ctx.beginPath(); data.forEach((v, i) => { const x = i / (data.length - 1) * w, y = ht - v / 100 * ht; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y) });
      ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
    }
    function tick() {
      stats.cpu = Math.max(2, Math.min(98, stats.cpu + (Math.random() - .5) * 16));
      stats.mem = Math.max(20, Math.min(85, stats.mem + (Math.random() - .5) * 4));
      stats.gpu = Math.max(0, Math.min(100, stats.gpu + (Math.random() - .5) * 30));
      stats.net = Math.max(0, stats.net + (Math.random() - .5) * 5);
      stats.ai = Math.max(0, Math.min(100, stats.ai + (Math.random() - .5) * 25));
      cells.forEach(c => {
        const e = els[c.k], v = Math.round(stats[c.k] * 10) / 10;
        e.val.textContent = v + c.unit; e.bar.style.width = Math.min(stats[c.k], 100) + '%';
        hist[c.k].push(stats[c.k]); if (hist[c.k].length > 60) hist[c.k].shift();
        spark(e.canvas, hist[c.k], c.color);
      });
    }
    tick(); const iv = setInterval(tick, 1200);
    w.append(header, grid); w._cleanup = () => clearInterval(iv); return w;
  }

  // ===== SETTINGS =====
  function renderSettings() {
    const w = SOS.h('div', { className: 'app-settings' });
    const nav = SOS.h('div', { className: 'set-nav' });
    nav.innerHTML = '<div class="set-nav-title">Settings</div>';
    const sections = [
      { id: 'system', label: 'System', icon: I.monitor },
      { id: 'personalize', label: 'Personalization', icon: I.settings },
      { id: 'agents', label: 'AI Agents', icon: I.jarvis },
      { id: 'about', label: 'About', icon: I.jarvis },
    ];
    const body = SOS.h('div', { className: 'set-body' });
    function show(id) {
      SOS.$$('.set-nav-item').forEach(n => n.classList.toggle('active', n.dataset.s === id));
      if (id === 'system') {
        body.innerHTML = `<div class="set-section"><div class="set-title">System</div>
          <div class="set-card"><div class="set-row"><div><div class="set-label">Theme</div><div class="set-desc">Dark / Light mode</div></div>
            <button class="set-toggle ${SOS.state.cfg.theme === 'light' ? 'on' : ''}" id="s-theme"></button></div></div>
          <div class="set-card"><div class="set-row"><div><div class="set-label">BitNet Engine</div><div class="set-desc">1.58-bit ternary neural engine</div></div>
            <span style="color:var(--green);font-size:13px">ONLINE</span></div></div>
          <div class="set-card"><div class="set-row"><div><div class="set-label">Multi-AI Search</div><div class="set-desc">Groq + Gemini + Grok + Together</div></div>
            <span style="color:var(--green);font-size:13px">ACTIVE</span></div></div></div>`;
        const t = SOS.$('#s-theme');
        if (t) t.onclick = () => { SOS.state.cfg.theme = SOS.state.cfg.theme === 'dark' ? 'light' : 'dark'; SOS.save('cfg', SOS.state.cfg); document.body.classList.toggle('light-os', SOS.state.cfg.theme === 'light'); show('system') };
      } else if (id === 'personalize') {
        body.innerHTML = `<div class="set-section"><div class="set-title">Personalization</div>
          <div class="set-card"><div class="set-row"><div><div class="set-label">Accent Color</div></div>
            <div style="display:flex;gap:6px">${['#60CDFF', '#B4A0FF', '#6CCB5F', '#FF6B6B', '#FCB900', '#FF69B4'].map(c =>
              `<div style="width:24px;height:24px;border-radius:50%;background:${c};cursor:pointer;border:2px solid ${SOS.state.cfg.accent === c ? '#fff' : 'transparent'}" data-accent="${c}"></div>`
            ).join('')}</div></div></div></div>`;
        SOS.$$('[data-accent]').forEach(el => el.onclick = () => { SOS.state.cfg.accent = el.dataset.accent; SOS.save('cfg', SOS.state.cfg); document.documentElement.style.setProperty('--accent', el.dataset.accent); show('personalize') });
      } else if (id === 'agents') {
        body.innerHTML = `<div class="set-section"><div class="set-title">AI Agent Configuration</div>
          ${[{ n: 'Groq', m: 'llama-3.3-70b', s: 'Configured' }, { n: 'Gemini', m: 'gemini-2.0-flash', s: 'Free tier' }, { n: 'Grok (xAI)', m: 'grok-3-mini', s: 'Free tier' }, { n: 'Together', m: 'Llama-3.3-70B-Turbo', s: 'Configured' }, { n: 'Google Search', m: 'Custom Search API', s: '100/day free' }].map(a =>
            `<div class="set-card"><div class="set-row"><div><div class="set-label">${a.n}</div><div class="set-desc">${a.m}</div></div><span style="color:var(--green);font-size:12px">${a.s}</span></div></div>`
          ).join('')}</div>`;
      } else {
        body.innerHTML = `<div class="set-section"><div class="set-title">About SintexOS</div>
          <div class="set-card" style="line-height:2">
            <div style="font-size:22px;font-weight:600;margin-bottom:8px"><span style="color:var(--accent)">Sintex</span>OS <span style="font-size:12px;color:var(--text3)">JARVIS Edition</span></div>
            <span class="set-label">Version</span> <span>2.0.0 (Build JARVIS-158)</span><br>
            <span class="set-label">Engine</span> <span>BitNet 1.58-bit {-1, 0, +1}</span><br>
            <span class="set-label">Agent</span> <span>JARVIS (claude-opus-4-6)</span><br>
            <span class="set-label">Search</span> <span>Multi-AI (Groq + Gemini + Grok + Google)</span><br>
            <span class="set-label">Frameworks</span> <span>OpenClaw + PicoClaw</span><br>
            <span class="set-label">Platform</span> <span>${navigator.platform}</span><br>
            <span class="set-label">Display</span> <span>${screen.width}×${screen.height}</span></div></div>`;
      }
    }
    sections.forEach(s => {
      const el = SOS.h('div', { className: 'set-nav-item' }); el.dataset.s = s.id;
      el.innerHTML = `${s.icon}<span>${s.label}</span>`;
      el.onclick = () => show(s.id); nav.appendChild(el);
    });
    w.append(nav, body); show('system'); return w;
  }

  // ===== JARVIS AGENT HUB =====
  function renderAgents() {
    const w = SOS.h('div', { className: 'app-agents' });
    w.innerHTML = `
      <div class="ag-sidebar">
        <div class="ag-nav-item active" data-tab="chat">💬 Chat</div>
        <div class="ag-nav-item" data-tab="agents">🤖 Agents</div>
        <div class="ag-nav-item" data-tab="tasks">📋 Tasks</div>
        <div class="ag-nav-item" data-tab="memory">🧠 Memory</div>
        <div class="ag-nav-item" data-tab="skills">⚡ Skills</div>
      </div>
      <div class="ag-main">
        <div class="ag-tab active" id="ag-chat">
          <div class="ag-chat-header"><span class="ag-arc">${I.jarvis}</span><span>JARVIS Command Center</span></div>
          <div class="ag-chat-body" id="ag-chat-body">
            <div class="ag-msg ai"><strong>${SOS.getGreeting()}, sir.</strong><br>All systems are online. I'm connected to Groq, Gemini, Grok, and Google Search. How can I assist you?</div>
          </div>
          <div class="ag-chat-input">
            <input type="text" id="ag-chat-in" placeholder="Ask JARVIS anything...">
            <button id="ag-chat-send">${I.search}</button>
          </div>
        </div>
        <div class="ag-tab" id="ag-agents">
          <div class="ag-section-title">Active Agents</div>
          ${[
            { name: 'JARVIS', model: 'claude-opus-4-6', status: 'ONLINE', color: 'var(--green)', desc: 'Primary orchestrator. Multi-AI search, task execution, code generation.' },
            { name: 'BitNet Search', model: 'bitnet-1.58', status: 'READY', color: 'var(--accent)', desc: 'AI search engine. Fallback chain: Groq → Together → Gemini → Cache.' },
            { name: 'PicoClaw', model: 'multi-model', status: 'STANDBY', color: 'var(--orange)', desc: 'Ultra-lightweight Go agent. <10MB RAM, <1s startup. web_search, spawn, cron.' },
          ].map(a => `<div class="ag-card">
            <div class="ag-card-top"><span class="ag-name">${a.name}</span><span class="ag-status" style="color:${a.color}">${a.status}</span></div>
            <div class="ag-model">${a.model}</div>
            <div class="ag-desc">${a.desc}</div>
          </div>`).join('')}
          <div class="ag-section-title" style="margin-top:16px">AI Providers</div>
          ${['Groq (Llama 3.3 70B)', 'Google Gemini (2.0 Flash)', 'xAI Grok (grok-3-mini)', 'Together AI (Llama 3.3 70B)', 'Google Custom Search'].map(p =>
            `<div class="ag-provider"><span class="wa-dot green"></span>${p}</div>`
          ).join('')}
        </div>
        <div class="ag-tab" id="ag-tasks">
          <div class="ag-section-title">Task Queue</div>
          <div class="ag-task completed"><span class="ag-task-status">✓</span>System boot sequence</div>
          <div class="ag-task completed"><span class="ag-task-status">✓</span>Multi-AI search initialized</div>
          <div class="ag-task active"><span class="ag-task-status spin">⟳</span>Monitoring agent status</div>
          <div class="ag-task pending"><span class="ag-task-status">○</span>Daily bounty scan</div>
          <div class="ag-task pending"><span class="ag-task-status">○</span>Content generation queue</div>
        </div>
        <div class="ag-tab" id="ag-memory">
          <div class="ag-section-title">Agent Memory</div>
          <div class="ag-memory-card"><strong>User:</strong> Elrom Eved El Elyon</div>
          <div class="ag-memory-card"><strong>Company:</strong> Padrao Bitcoin</div>
          <div class="ag-memory-card"><strong>Sites:</strong> sintex.ai, standardbitcoin.io, bitcoinbrasil.org</div>
          <div class="ag-memory-card"><strong>Token:</strong> STBTCx (Solana SPL)</div>
          <div class="ag-memory-card"><strong>Agent:</strong> JARVIS (claude-opus-4-6)</div>
          <div class="ag-memory-card"><strong>Frameworks:</strong> OpenClaw + PicoClaw</div>
        </div>
        <div class="ag-tab" id="ag-skills">
          <div class="ag-section-title">Installed Skills</div>
          ${[
            { n: 'Multi-AI Search', d: 'Search web via Google + synthesize with Groq/Gemini/Grok', cat: 'Search' },
            { n: 'Web Fetch', d: 'Retrieve and analyze web page content', cat: 'Research' },
            { n: 'Deploy', d: 'Deploy to Netlify automatically', cat: 'DevOps' },
            { n: 'Tweet', d: 'Post to X/Twitter via browser CDP', cat: 'Social' },
            { n: 'Cron', d: 'Schedule recurring tasks and reminders', cat: 'System' },
            { n: 'Memory', d: 'Persistent knowledge across sessions', cat: 'Core' },
            { n: 'Spawn', d: 'Delegate tasks to sub-agents', cat: 'Core' },
          ].map(s => `<div class="ag-skill"><div class="ag-skill-top"><span>${s.n}</span><span class="ag-skill-cat">${s.cat}</span></div><div class="ag-skill-desc">${s.d}</div></div>`).join('')}
        </div>
      </div>`;

    // Tab switching
    setTimeout(() => {
      w.querySelectorAll('.ag-nav-item').forEach(nav => {
        nav.onclick = () => {
          w.querySelectorAll('.ag-nav-item').forEach(n => n.classList.remove('active'));
          w.querySelectorAll('.ag-tab').forEach(t => t.classList.remove('active'));
          nav.classList.add('active');
          const tab = w.querySelector(`#ag-${nav.dataset.tab}`);
          if (tab) tab.classList.add('active');
        };
      });

      // Chat functionality
      const chatSend = async () => {
        const input = w.querySelector('#ag-chat-in');
        const body = w.querySelector('#ag-chat-body');
        const text = input.value.trim(); if (!text) return; input.value = '';
        body.innerHTML += `<div class="ag-msg user">${SOS.esc(text)}</div>`;
        body.innerHTML += `<div class="ag-msg ai ag-typing"><span></span><span></span><span></span></div>`;
        body.scrollTop = body.scrollHeight;
        try {
          const res = await fetch('/api/multi-search', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: text })
          });
          const data = res.ok ? await res.json() : null;
          const typing = body.querySelector('.ag-typing');
          if (typing) typing.remove();
          const answer = data?.answer || 'I apologize, sir. My connection to the AI providers is temporarily disrupted.';
          body.innerHTML += `<div class="ag-msg ai">${renderMd(answer)}</div>`;
        } catch {
          const typing = body.querySelector('.ag-typing');
          if (typing) typing.remove();
          body.innerHTML += `<div class="ag-msg ai" style="color:var(--red)">Connection error. Retrying...</div>`;
        }
        body.scrollTop = body.scrollHeight;
      };
      const sendBtn = w.querySelector('#ag-chat-send');
      const chatIn = w.querySelector('#ag-chat-in');
      if (sendBtn) sendBtn.onclick = chatSend;
      if (chatIn) chatIn.onkeydown = e => { if (e.key === 'Enter') chatSend() };
    }, 50);

    return w;
  }
})();
