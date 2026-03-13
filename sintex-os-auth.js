/* SintexOS Auth & Platform Connections */
(function () {
  const I = SOS.ICO;

  // Platform definitions
  const PLATFORMS = [
    { id: 'openclaw', name: 'OpenClaw', icon: I.openclaw, desc: 'AI Agent Framework', type: 'ws', color: '#60CDFF' },
    { id: 'google', name: 'Google', icon: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>', desc: 'Gmail & Gemini', type: 'oauth', color: '#4285F4' },
    { id: 'apple', name: 'Apple', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>', desc: 'Apple ID', type: 'oauth', color: '#fff' },
    { id: 'twitter', name: 'X / Twitter', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>', desc: 'Tweets & DMs', type: 'oauth', color: '#1DA1F2' },
    { id: 'tiktok', name: 'TikTok', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13V9a6.34 6.34 0 1 0 5.44 6.29V9.76A8.19 8.19 0 0 0 20.59 11V7.5a4.85 4.85 0 0 1-1-0.81z"/></svg>', desc: 'Short Videos', type: 'oauth', color: '#ff0050' },
    { id: 'chatgpt', name: 'ChatGPT', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M22.2 14.8a5.2 5.2 0 0 0-.4-4.3 5.3 5.3 0 0 0-5.7-2.5 5.2 5.2 0 0 0-3.9-1.7 5.3 5.3 0 0 0-5 3.5 5.2 5.2 0 0 0-3.5 2.6 5.3 5.3 0 0 0 .6 5.9 5.2 5.2 0 0 0 .4 4.3A5.3 5.3 0 0 0 10.4 25a5.2 5.2 0 0 0 3.9 1.7 5.3 5.3 0 0 0 5-3.5 5.2 5.2 0 0 0 3.5-2.6 5.3 5.3 0 0 0-.6-5.8z"/></svg>', desc: 'OpenAI API Key', type: 'apikey', color: '#10a37f' },
    { id: 'gemini', name: 'Gemini', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#4285F4" stroke-width="1.5"/><path d="M12 6v12M6 12h12" stroke="#34A853" stroke-width="1.5"/><circle cx="12" cy="12" r="4" fill="rgba(66,133,244,.2)"/></svg>', desc: 'Google AI Studio Key', type: 'apikey', color: '#4285F4' },
  ];

  // Listen for OAuth popup messages
  window.addEventListener('message', (e) => {
    if (e.data?.type === 'oauth-success') {
      SOS.auth.login(e.data.provider, { user: e.data.user });
      SOS.emit('authChange', e.data.provider);
      rerenderConnections();
    }
    if (e.data?.type === 'oauth-error') {
      SOS.toast('Login failed: ' + (e.data.error || 'Unknown error'));
    }
  });

  function renderConnectionsPanel() {
    const el = SOS.h('div', { className: 'auth-panel' });

    // Header
    const header = SOS.h('div', { className: 'auth-header' });
    header.innerHTML = `
      <div class="auth-title">${I.key} <span>Platform Connections</span></div>
      <div class="auth-user-info" id="auth-user-display"></div>`;
    el.appendChild(header);

    // Platform cards
    const grid = SOS.h('div', { className: 'auth-grid' });
    PLATFORMS.forEach(p => {
      const card = SOS.h('div', { className: 'auth-card' });
      const connected = SOS.auth.isConnected(p.id);
      card.innerHTML = `
        <div class="auth-card-icon" style="color:${p.color}">${p.icon}</div>
        <div class="auth-card-info">
          <div class="auth-card-name">${p.name}</div>
          <div class="auth-card-desc">${p.desc}</div>
          <div class="auth-card-status ${connected ? 'connected' : ''}">
            <span class="status-dot"></span> ${connected ? 'Connected' : 'Not connected'}
          </div>
        </div>
        <div class="auth-card-actions" id="auth-actions-${p.id}"></div>`;
      grid.appendChild(card);

      // Action buttons
      const actions = card.querySelector(`#auth-actions-${p.id}`);
      if (connected) {
        const disc = SOS.h('button', { className: 'auth-btn disconnect' });
        disc.textContent = 'Disconnect';
        disc.onclick = () => { SOS.auth.logout(p.id); rerenderConnections(); SOS.emit('authChange', p.id); };
        actions.appendChild(disc);
        // Show user info if available
        const conn = SOS.auth.connections[p.id];
        if (conn?.user?.email) {
          const info = SOS.h('div', { className: 'auth-card-email' });
          info.textContent = conn.user.email;
          card.querySelector('.auth-card-status').after(info);
        }
      } else {
        if (p.type === 'oauth') {
          const btn = SOS.h('button', { className: 'auth-btn connect' });
          btn.textContent = 'Connect';
          btn.onclick = () => connectPlatform(p);
          actions.appendChild(btn);
        } else if (p.type === 'apikey') {
          const inp = SOS.h('input', { className: 'auth-key-input', type: 'password', placeholder: 'API Key...' });
          const btn = SOS.h('button', { className: 'auth-btn connect' });
          btn.textContent = 'Save';
          btn.onclick = () => {
            if (inp.value.trim()) {
              SOS.auth.login(p.id, { apiKey: inp.value.trim() });
              SOS.emit('authChange', p.id);
              rerenderConnections();
            }
          };
          actions.appendChild(inp);
          actions.appendChild(btn);
        } else if (p.type === 'ws') {
          const btn = SOS.h('button', { className: 'auth-btn connect' });
          btn.textContent = 'Connect';
          btn.onclick = () => {
            SOS.toast('Connecting to OpenClaw...');
            if (SOS.openclaw && typeof SOS.openclaw.status === 'function') {
              SOS.auth.login('openclaw', { status: SOS.openclaw.status() });
            } else {
              SOS.auth.login('openclaw', { status: 'relay' });
            }
            SOS.emit('authChange', 'openclaw');
            rerenderConnections();
          };
          actions.appendChild(btn);
        }
      }
    });
    el.appendChild(grid);

    // Connected summary
    const summary = SOS.h('div', { className: 'auth-summary' });
    const count = Object.keys(SOS.auth.connections).filter(k => SOS.auth.connections[k]?.connected).length;
    summary.innerHTML = `<span class="auth-summary-count">${count}</span> platform${count !== 1 ? 's' : ''} connected`;
    el.appendChild(summary);

    return el;
  }

  let currentPanel = null;
  function rerenderConnections() {
    if (currentPanel && currentPanel.parentNode) {
      const newPanel = renderConnectionsPanel();
      currentPanel.replaceWith(newPanel);
      currentPanel = newPanel;
    }
  }

  function connectPlatform(platform) {
    if (platform.id === 'google') {
      // Real OAuth via popup
      const popup = window.open('/api/auth/google', 'Google Login', 'width=500,height=600,left=200,top=100');
      if (!popup) SOS.toast('Popup blocked! Please allow popups.');
      return;
    }
    // Simulated for platforms that need developer accounts
    if (platform.id === 'apple') {
      SOS.toast('Apple Sign-In: Coming soon (requires Apple Developer Account)');
      // Simulate anyway for demo
      SOS.auth.login('apple', { user: { name: 'Elrom', email: 'elrom@icloud.com' } });
      SOS.emit('authChange', 'apple');
      rerenderConnections();
      return;
    }
    if (platform.id === 'twitter') {
      // Show username input dialog
      const name = prompt('Enter your X/Twitter username:');
      if (name) {
        SOS.auth.login('twitter', { user: { name: '@' + name.replace('@', ''), handle: name } });
        SOS.emit('authChange', 'twitter');
        rerenderConnections();
      }
      return;
    }
    if (platform.id === 'tiktok') {
      const name = prompt('Enter your TikTok username:');
      if (name) {
        SOS.auth.login('tiktok', { user: { name: '@' + name.replace('@', '') } });
        SOS.emit('authChange', 'tiktok');
        rerenderConnections();
      }
      return;
    }
  }

  // Register as app
  SOS.registerApp({
    id: 'connections',
    name: 'Connections',
    icon: I.key,
    pin: false,
    w: 700, h: 520,
    color: '#a855f7',
    render() {
      currentPanel = renderConnectionsPanel();
      return currentPanel;
    }
  });
})();
