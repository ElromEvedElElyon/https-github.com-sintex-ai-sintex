/* SintexOS Claude Terminal — The Core AI Interface
   A real Claude Code-like terminal that talks to Claude API via proxy.
   Supports: conversation, markdown, code blocks, tools, connectors, MCP, memory. */
(function () {
  const I = SOS.ICO;

  // Persistent state
  const getKey = () => SOS.load('claude-api-key') || '';
  const setKey = (k) => SOS.save('claude-api-key', k);
  const getModel = () => SOS.load('claude-model') || 'claude-sonnet-4-20250514';
  const setModel = (m) => SOS.save('claude-model', m);
  const getMemory = () => SOS.load('claude-memory') || [];
  const setMemory = (m) => SOS.save('claude-memory', m);
  const getSoul = () => SOS.load('claude-soul') || 'You are JARVIS, an advanced AI assistant inside SintexOS. You have access to tools, connectors, and memory. Be helpful, precise, and use markdown formatting. You can write and analyze code in any language.';
  const setSoul = (s) => SOS.save('claude-soul', s);

  const MODELS = [
    { id: 'claude-opus-4-20250514', name: 'Claude Opus 4.6', desc: 'Most powerful — deep reasoning', tier: 'opus' },
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4.6', desc: 'Fast & capable', tier: 'sonnet' },
    { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', desc: 'Fastest, lightweight', tier: 'haiku' },
  ];

  const TOOLS_DEF = [
    { name: 'web_search', desc: 'Search the web for real-time information', icon: '🔍' },
    { name: 'web_fetch', desc: 'Fetch and read web page content', icon: '🌐' },
    { name: 'code_exec', desc: 'Execute code snippets (Python, JS)', icon: '⚡' },
    { name: 'file_read', desc: 'Read files from the system', icon: '📄' },
    { name: 'file_write', desc: 'Write files to the system', icon: '💾' },
    { name: 'memory', desc: 'Store and recall persistent memory', icon: '🧠' },
    { name: 'deploy', desc: 'Deploy to Netlify or GitHub', icon: '🚀' },
    { name: 'shell', desc: 'Execute shell commands', icon: '💻' },
  ];

  const CONNECTORS = [
    { name: 'Puter.js (Free Claude)', status: () => window.puter?.ai ? 'on' : 'off', color: '#d4a574' },
    { name: 'Anthropic Claude API', status: () => getKey() ? 'on' : 'off', color: '#cc7744' },
    { name: 'DeepSeek V3.2 (671B)', status: 'on', color: '#a855f7' },
    { name: 'Groq (Llama 3.3 70B)', status: 'on', color: '#f55036' },
    { name: 'xAI Grok 3', status: 'off', color: '#fff' },
    { name: 'Google Gemini 2.0', status: () => SOS.auth.isConnected('gemini') ? 'on' : 'off', color: '#4285F4' },
    { name: 'OpenRouter (28 models)', status: 'off', color: '#22c55e' },
    { name: 'OpenClaw WS', status: () => SOS.openclaw?.status?.() === 'connected' ? 'on' : 'off', color: '#00ff88' },
  ];

  let conversation = [];
  let isStreaming = false;

  function renderClaude() {
    const el = SOS.h('div', { className: 'claude-app' });
    el.innerHTML = `
      <div class="cl-sidebar" id="cl-sidebar">
        <div class="cl-side-header">
          <div class="cl-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" stroke="#d4a574" stroke-width="1.5"/>
              <circle cx="12" cy="12" r="6" stroke="#d4a574" stroke-width="1" opacity=".5"/>
              <circle cx="12" cy="12" r="2" fill="#d4a574"/>
            </svg>
            <span>Claude Terminal</span>
          </div>
          <button class="cl-new-chat" id="cl-new-chat" title="New chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
        <div class="cl-side-tabs">
          <button class="cl-tab active" data-tab="connectors">Connectors</button>
          <button class="cl-tab" data-tab="tools">Tools</button>
          <button class="cl-tab" data-tab="memory">Memory</button>
          <button class="cl-tab" data-tab="soul">Soul</button>
          <button class="cl-tab" data-tab="settings">API Key</button>
        </div>
        <div class="cl-side-body" id="cl-side-content"></div>
      </div>
      <div class="cl-main">
        <div class="cl-topbar">
          <button class="cl-toggle-side" id="cl-toggle-side">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <select class="cl-model-select" id="cl-model-select"></select>
          <div class="cl-topbar-status" id="cl-status">
            <span class="cl-status-dot" id="cl-status-dot"></span>
            <span id="cl-status-text">Ready</span>
          </div>
          <div class="cl-token-count" id="cl-tokens"></div>
        </div>
        <div class="cl-chat" id="cl-chat">
          <div class="cl-welcome" id="cl-welcome">
            <div class="cl-welcome-logo">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke="#d4a574" stroke-width="2"/>
                <circle cx="24" cy="24" r="14" stroke="#d4a574" stroke-width="1" opacity=".4"/>
                <circle cx="24" cy="24" r="6" stroke="#d4a574" stroke-width="1" opacity=".3"/>
                <circle cx="24" cy="24" r="3" fill="#d4a574"/>
              </svg>
            </div>
            <h2>Claude Terminal</h2>
            <p>Powered by Claude Opus 4.6 — The world's most advanced AI model</p>
            <div class="cl-welcome-grid">
              <div class="cl-welcome-card" data-q="Analyze this codebase and suggest improvements">💻 Code Analysis</div>
              <div class="cl-welcome-card" data-q="Help me debug this error">🔧 Debug Assistant</div>
              <div class="cl-welcome-card" data-q="Write a complete web application">🚀 App Builder</div>
              <div class="cl-welcome-card" data-q="Explain quantum computing in simple terms">🧠 Knowledge</div>
            </div>
            <div class="cl-welcome-keys" id="cl-key-warning" style="display:none">
              <div class="cl-key-alert">⚠️ No API key configured</div>
              <p>Enter your Anthropic API key in the sidebar → API Key tab</p>
              <input type="password" class="cl-key-input-inline" id="cl-key-inline" placeholder="sk-ant-api03-...">
              <button class="cl-key-save-inline" id="cl-key-save-inline">Connect</button>
            </div>
          </div>
        </div>
        <div class="cl-input-area">
          <div class="cl-input-wrap">
            <textarea class="cl-input" id="cl-input" placeholder="Message Claude..." rows="1"></textarea>
            <div class="cl-input-actions">
              <button class="cl-attach" title="Attach file (paste code)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              </button>
              <button class="cl-send" id="cl-send" title="Send (Enter)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </div>
          <div class="cl-input-info">
            <span id="cl-model-label">Claude Sonnet 4.6</span> · <span id="cl-cost-est">~$0.003/msg</span>
          </div>
        </div>
      </div>`;

    setTimeout(() => initClaude(el), 50);
    return el;
  }

  function initClaude(el) {
    // Model selector
    const sel = el.querySelector('#cl-model-select');
    MODELS.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id; opt.textContent = m.name;
      if (m.id === getModel()) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.onchange = () => {
      setModel(sel.value);
      const m = MODELS.find(x => x.id === sel.value);
      el.querySelector('#cl-model-label').textContent = m?.name || sel.value;
      updateCost(el);
    };

    // Check API key / Puter.js availability
    if (!getKey()) {
      if (window.puter && window.puter.ai) {
        updateStatus(el, 'Free AI Active', 'green');
      } else {
        el.querySelector('#cl-key-warning').style.display = '';
        updateStatus(el, 'Loading AI...', 'orange');
        // Puter.js loads async, recheck
        setTimeout(() => {
          if (window.puter && window.puter.ai) {
            el.querySelector('#cl-key-warning').style.display = 'none';
            updateStatus(el, 'Free AI Active', 'green');
          } else {
            updateStatus(el, 'No API Key', 'red');
          }
        }, 3000);
      }
    } else {
      updateStatus(el, 'Ready', 'green');
    }

    // Inline key save
    const inlineBtn = el.querySelector('#cl-key-save-inline');
    if (inlineBtn) {
      inlineBtn.onclick = () => {
        const k = el.querySelector('#cl-key-inline').value.trim();
        if (k) {
          setKey(k);
          el.querySelector('#cl-key-warning').style.display = 'none';
          updateStatus(el, 'Connected', 'green');
          SOS.toast('API key saved!');
          SOS.sound('connect');
        }
      };
    }

    // Sidebar tabs
    el.querySelectorAll('.cl-tab').forEach(tab => {
      tab.onclick = () => {
        el.querySelectorAll('.cl-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderSidePanel(el, tab.dataset.tab);
      };
    });
    renderSidePanel(el, 'connectors');

    // Toggle sidebar
    el.querySelector('#cl-toggle-side').onclick = () => {
      el.querySelector('#cl-sidebar').classList.toggle('collapsed');
    };

    // New chat
    el.querySelector('#cl-new-chat').onclick = () => {
      conversation = [];
      const chat = el.querySelector('#cl-chat');
      chat.innerHTML = '';
      chat.appendChild(createWelcome(el));
      updateTokens(el);
    };

    // Send
    const input = el.querySelector('#cl-input');
    const sendBtn = el.querySelector('#cl-send');

    sendBtn.onclick = () => sendMessage(el);
    input.onkeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(el); }
    };
    input.oninput = () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 200) + 'px';
    };

    // Welcome cards
    el.querySelectorAll('.cl-welcome-card').forEach(c => {
      c.onclick = () => {
        input.value = c.dataset.q;
        sendMessage(el);
      };
    });

    updateCost(el);
  }

  function createWelcome(el) {
    const w = SOS.h('div', { className: 'cl-welcome', id: 'cl-welcome' });
    w.innerHTML = `
      <div class="cl-welcome-logo">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" stroke="#d4a574" stroke-width="2"/>
          <circle cx="24" cy="24" r="14" stroke="#d4a574" stroke-width="1" opacity=".4"/>
          <circle cx="24" cy="24" r="3" fill="#d4a574"/>
        </svg>
      </div>
      <h2>Claude Terminal</h2>
      <p>Powered by Claude Opus 4.6</p>`;
    return w;
  }

  function renderSidePanel(el, tab) {
    const body = el.querySelector('#cl-side-content');
    body.innerHTML = '';

    if (tab === 'connectors') {
      CONNECTORS.forEach(c => {
        const item = SOS.h('div', { className: 'cl-connector' });
        const st = typeof c.status === 'function' ? c.status() : c.status;
        const dotColor = st === 'on' ? '#00ff88' : st === 'check' ? (getKey() ? '#00ff88' : '#ff4444') : '#666';
        item.innerHTML = `<span class="cl-conn-dot" style="background:${dotColor}"></span>
          <span class="cl-conn-name">${c.name}</span>
          <span class="cl-conn-status">${st === 'on' || (st === 'check' && getKey()) ? 'Connected' : 'Off'}</span>`;
        body.appendChild(item);
      });
    }

    if (tab === 'tools') {
      TOOLS_DEF.forEach(t => {
        const item = SOS.h('div', { className: 'cl-tool-item' });
        item.innerHTML = `<span class="cl-tool-icon">${t.icon}</span>
          <div class="cl-tool-info"><div class="cl-tool-name">${t.name}</div><div class="cl-tool-desc">${t.desc}</div></div>`;
        body.appendChild(item);
      });
    }

    if (tab === 'memory') {
      const mem = getMemory();
      const addBtn = SOS.h('button', { className: 'cl-mem-add' });
      addBtn.textContent = '+ Add Memory';
      addBtn.onclick = () => {
        const text = prompt('Enter memory item:');
        if (text) { mem.push(text); setMemory(mem); renderSidePanel(el, 'memory'); }
      };
      body.appendChild(addBtn);
      mem.forEach((m, i) => {
        const item = SOS.h('div', { className: 'cl-mem-item' });
        item.innerHTML = `<span class="cl-mem-text">${SOS.esc(m)}</span>
          <button class="cl-mem-del" data-i="${i}">×</button>`;
        item.querySelector('.cl-mem-del').onclick = () => { mem.splice(i, 1); setMemory(mem); renderSidePanel(el, 'memory'); };
        body.appendChild(item);
      });
    }

    if (tab === 'soul') {
      const ta = SOS.h('textarea', { className: 'cl-soul-ta', rows: 12 });
      ta.value = getSoul();
      ta.oninput = () => setSoul(ta.value);
      const label = SOS.h('div', { className: 'cl-soul-label' });
      label.textContent = 'System prompt (personality & instructions):';
      body.appendChild(label);
      body.appendChild(ta);
    }

    if (tab === 'settings') {
      const wrap = SOS.h('div', { className: 'cl-settings-panel' });
      wrap.innerHTML = `
        <div class="cl-set-title">Anthropic API Key</div>
        <p class="cl-set-desc">Your key is stored locally in your browser. Never sent to our servers — goes directly to Anthropic's API.</p>
        <input type="password" class="cl-set-key" id="cl-set-key" placeholder="sk-ant-api03-..." value="${getKey() ? '••••••••••••' + getKey().slice(-6) : ''}">
        <button class="cl-set-save" id="cl-set-save">Save Key</button>
        <button class="cl-set-clear" id="cl-set-clear">Clear Key</button>
        <div class="cl-set-title" style="margin-top:16px">Model</div>
        <select class="cl-set-model" id="cl-set-model">
          ${MODELS.map(m => `<option value="${m.id}" ${m.id === getModel() ? 'selected' : ''}>${m.name} — ${m.desc}</option>`).join('')}
        </select>
        <div class="cl-set-info">
          <div><strong>Opus 4.6:</strong> $15/M input, $75/M output — Best for complex reasoning</div>
          <div><strong>Sonnet 4.6:</strong> $3/M input, $15/M output — Best balance</div>
          <div><strong>Haiku 4.5:</strong> $0.80/M input, $4/M output — Fastest</div>
        </div>`;
      body.appendChild(wrap);

      setTimeout(() => {
        const saveBtn = body.querySelector('#cl-set-save');
        const clearBtn = body.querySelector('#cl-set-clear');
        const keyInput = body.querySelector('#cl-set-key');
        const modelSel = body.querySelector('#cl-set-model');

        if (saveBtn) saveBtn.onclick = () => {
          const k = keyInput.value.trim();
          if (k && !k.startsWith('••')) {
            setKey(k);
            keyInput.value = '••••••••••••' + k.slice(-6);
            updateStatus(el, 'Connected', 'green');
            SOS.toast('API key saved!');
            SOS.sound('connect');
            const w = el.querySelector('#cl-key-warning');
            if (w) w.style.display = 'none';
            renderSidePanel(el, 'connectors');
          }
        };
        if (clearBtn) clearBtn.onclick = () => {
          setKey('');
          keyInput.value = '';
          updateStatus(el, 'No API Key', 'red');
          SOS.toast('API key removed');
        };
        if (modelSel) modelSel.onchange = () => {
          setModel(modelSel.value);
          el.querySelector('#cl-model-select').value = modelSel.value;
          const m = MODELS.find(x => x.id === modelSel.value);
          el.querySelector('#cl-model-label').textContent = m?.name || modelSel.value;
          updateCost(el);
        };
      }, 50);
    }
  }

  async function sendMessage(el) {
    const input = el.querySelector('#cl-input');
    const text = input.value.trim();
    if (!text || isStreaming) return;

    const key = getKey();
    const hasPuter = !!(window.puter && window.puter.ai);
    if (!key && !hasPuter) {
      SOS.toast('Loading AI engine... Please wait.');
      // Try loading Puter.js dynamically
      if (!document.querySelector('script[src*="puter.com"]')) {
        const s = document.createElement('script');
        s.src = 'https://js.puter.com/v2/';
        s.onload = () => SOS.toast('AI engine loaded! Try again.');
        document.head.appendChild(s);
      }
      return;
    }

    input.value = '';
    input.style.height = 'auto';

    // Remove welcome
    const welcome = el.querySelector('#cl-welcome');
    if (welcome) welcome.remove();

    const chat = el.querySelector('#cl-chat');

    // User message
    addMessage(chat, 'user', text);
    conversation.push({ role: 'user', content: text });

    // Thinking indicator
    const thinking = SOS.h('div', { className: 'cl-msg cl-msg-ai cl-thinking' });
    thinking.innerHTML = `<div class="cl-msg-avatar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#d4a574" stroke-width="1.5"/><circle cx="12" cy="12" r="2" fill="#d4a574"/></svg></div>
      <div class="cl-msg-body"><div class="cl-typing"><span></span><span></span><span></span></div></div>`;
    chat.appendChild(thinking);
    chat.scrollTop = chat.scrollHeight;

    isStreaming = true;
    updateStatus(el, 'Thinking...', 'orange');

    try {
      // Build system prompt with memory
      const mem = getMemory();
      let sys = getSoul();
      if (mem.length) sys += '\n\nUser Memory:\n' + mem.map((m, i) => `${i + 1}. ${m}`).join('\n');

      let data = null;

      if (key) {
        // Path 1: Direct Anthropic API via proxy
        const res = await fetch('/api/claude', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: key,
            model: getModel(),
            system: sys,
            messages: conversation.slice(-20),
            max_tokens: 4096,
            temperature: 0.7,
          })
        });
        data = await res.json();
      } else if (window.puter && window.puter.ai) {
        // Path 2: Puter.js — FREE unlimited Claude/DeepSeek/Qwen
        try {
          const puterModel = getModel().includes('opus') ? 'claude-opus-4-6' :
                            getModel().includes('haiku') ? 'claude-haiku-4-5' : 'claude-sonnet-4-6';
          const puterMsgs = [{ role: 'system', content: sys }, ...conversation.slice(-20)];
          const puterRes = await puter.ai.chat(puterMsgs, { model: puterModel });
          const aiContent = puterRes?.message?.content;
          const aiText = Array.isArray(aiContent) ? aiContent.map(b => b.text || '').join('') :
                        typeof aiContent === 'string' ? aiContent : puterRes?.toString() || '';
          data = { text: aiText, model: puterModel + ' (via Puter)', usage: null };
        } catch (puterErr) {
          // Puter failed, try server-side fallback
          const res = await fetch('/api/ws-relay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agent: 'jarvis', message: text, systemPrompt: sys })
          });
          const relayData = await res.json();
          data = { text: relayData.content || 'AI temporarily unavailable.', model: relayData.provider || 'fallback' };
        }
      } else {
        // Path 3: Server-side relay (Groq/Together/DeepSeek)
        const res = await fetch('/api/ws-relay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agent: 'jarvis', message: text, systemPrompt: sys })
        });
        const relayData = await res.json();
        data = { text: relayData.content || 'AI temporarily unavailable.', model: relayData.provider || 'fallback' };
      }

      thinking.remove();

      if (data.error) {
        if (data.needsKey) {
          addMessage(chat, 'system', '⚠️ API key invalid. Using free AI engine instead.');
          // Auto-fallback to Puter
          if (window.puter && window.puter.ai) {
            try {
              const puterRes = await puter.ai.chat([{ role: 'user', content: text }], { model: 'claude-sonnet-4-6' });
              const aiContent = puterRes?.message?.content;
              data = { text: Array.isArray(aiContent) ? aiContent.map(b => b.text || '').join('') : String(aiContent || ''), model: 'claude-sonnet-4-6 (free)' };
            } catch { /* fall through */ }
          }
          if (data.error) {
            updateStatus(el, 'Auth Error', 'red');
          }
        } else {
          addMessage(chat, 'system', '⚠️ ' + data.message);
          updateStatus(el, 'Error', 'red');
        }
      }

      if (!data.error) {
        const aiText = data.text || 'No response.';
        conversation.push({ role: 'assistant', content: aiText });

        // Streaming simulation
        const msgEl = addMessage(chat, 'ai', '', data.model);
        const bodyEl = msgEl.querySelector('.cl-msg-text');
        await streamText(bodyEl, aiText, chat);

        // Usage info
        if (data.usage) {
          const usage = SOS.h('div', { className: 'cl-usage' });
          usage.textContent = `${data.usage.input_tokens} in / ${data.usage.output_tokens} out tokens · ${data.model || getModel()}`;
          msgEl.querySelector('.cl-msg-body').appendChild(usage);
        }

        updateStatus(el, 'Ready', 'green');
        updateTokens(el, data.usage);
      }
    } catch (e) {
      thinking.remove();
      addMessage(chat, 'system', '⚠️ Network error: ' + e.message);
      updateStatus(el, 'Offline', 'red');
    }

    isStreaming = false;
    chat.scrollTop = chat.scrollHeight;
  }

  function addMessage(chat, role, text, model) {
    const msg = SOS.h('div', { className: `cl-msg cl-msg-${role}` });

    if (role === 'user') {
      msg.innerHTML = `<div class="cl-msg-body"><div class="cl-msg-text">${SOS.esc(text)}</div></div>
        <div class="cl-msg-avatar cl-user-avatar">E</div>`;
    } else if (role === 'ai') {
      msg.innerHTML = `<div class="cl-msg-avatar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#d4a574" stroke-width="1.5"/><circle cx="12" cy="12" r="2" fill="#d4a574"/></svg></div>
        <div class="cl-msg-body">
          ${model ? `<div class="cl-msg-model">${model}</div>` : ''}
          <div class="cl-msg-text"></div>
        </div>`;
    } else {
      msg.innerHTML = `<div class="cl-msg-body cl-system-msg"><div class="cl-msg-text">${text}</div></div>`;
    }

    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
    return msg;
  }

  async function streamText(el, text, chat) {
    // Render markdown progressively
    const words = text.split(/(\s+)/);
    let buffer = '';
    for (let i = 0; i < words.length; i++) {
      buffer += words[i];
      if (i % 3 === 0 || i === words.length - 1) {
        el.innerHTML = renderMarkdown(buffer);
        chat.scrollTop = chat.scrollHeight;
        await new Promise(r => setTimeout(r, 12));
      }
    }
    el.innerHTML = renderMarkdown(text);
    // Highlight code blocks
    el.querySelectorAll('pre code').forEach(block => {
      block.classList.add('cl-code-rendered');
    });
  }

  function renderMarkdown(text) {
    let html = SOS.esc(text);
    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre class="cl-pre"><div class="cl-code-header"><span>${lang || 'code'}</span><button class="cl-copy-btn" onclick="navigator.clipboard.writeText(this.closest('pre').querySelector('code').textContent)">Copy</button></div><code class="cl-code">${code}</code></pre>`;
    });
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="cl-inline-code">$1</code>');
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Headers
    html = html.replace(/^### (.+)$/gm, '<h4 class="cl-h">$1</h4>');
    html = html.replace(/^## (.+)$/gm, '<h3 class="cl-h">$1</h3>');
    html = html.replace(/^# (.+)$/gm, '<h2 class="cl-h">$1</h2>');
    // Lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="cl-link">$1</a>');
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    return '<p>' + html + '</p>';
  }

  function updateStatus(el, text, color) {
    const dot = el.querySelector('#cl-status-dot');
    const txt = el.querySelector('#cl-status-text');
    if (dot) dot.style.background = color === 'green' ? '#00ff88' : color === 'red' ? '#ff4444' : color === 'orange' ? '#ffa500' : '#666';
    if (txt) txt.textContent = text;
  }

  function updateTokens(el, usage) {
    const t = el.querySelector('#cl-tokens');
    if (!t) return;
    if (usage) {
      t.textContent = `${usage.input_tokens + usage.output_tokens} tokens`;
    } else {
      const total = conversation.reduce((a, m) => a + (m.content?.length || 0), 0);
      t.textContent = total ? `~${Math.round(total / 4)} tokens` : '';
    }
  }

  function updateCost(el) {
    const c = el.querySelector('#cl-cost-est');
    if (!c) return;
    const m = getModel();
    if (m.includes('opus')) c.textContent = '~$0.09/msg';
    else if (m.includes('haiku')) c.textContent = '~$0.001/msg';
    else c.textContent = '~$0.003/msg';
  }

  // Register as the PRIMARY app
  SOS.registerApp({
    id: 'claude',
    name: 'Claude Terminal',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#d4a574" stroke-width="1.5"/><circle cx="12" cy="12" r="6" stroke="#d4a574" stroke-width="1" opacity=".5"/><circle cx="12" cy="12" r="2" fill="#d4a574"/></svg>`,
    pin: true,
    w: 960, h: 640,
    color: '#d4a574',
    render: renderClaude
  });

  // Auto-open Claude Terminal on desktop init
  SOS.on('initShell', () => {
    setTimeout(() => SOS.emit('openApp', 'claude'), 1200);
  });

  // CSS injection
  if (!SOS.$('#sos-claude-css')) {
    const s = document.createElement('style'); s.id = 'sos-claude-css';
    s.textContent = `
.claude-app{display:flex;height:100%;background:#1a1a1a;color:#e0e0e0;font-family:Inter,sans-serif;overflow:hidden}
.cl-sidebar{width:280px;background:#141414;border-right:1px solid rgba(255,255,255,.06);display:flex;flex-direction:column;transition:width .2s,opacity .2s}
.cl-sidebar.collapsed{width:0;overflow:hidden;opacity:0;border:none}
.cl-side-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.06)}
.cl-logo{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:#d4a574}
.cl-new-chat{background:none;border:1px solid rgba(255,255,255,.1);color:#aaa;width:30px;height:30px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center}
.cl-new-chat:hover{background:rgba(255,255,255,.05);color:#fff}
.cl-side-tabs{display:flex;flex-wrap:wrap;gap:4px;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.06)}
.cl-tab{background:none;border:1px solid rgba(255,255,255,.08);color:#888;padding:5px 10px;border-radius:6px;font-size:11px;cursor:pointer;transition:all .15s}
.cl-tab.active{background:rgba(212,165,116,.15);color:#d4a574;border-color:rgba(212,165,116,.3)}
.cl-tab:hover{color:#ccc}
.cl-side-body{flex:1;overflow-y:auto;padding:12px}
.cl-connector{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:6px;font-size:12px;margin-bottom:4px}
.cl-connector:hover{background:rgba(255,255,255,.03)}
.cl-conn-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.cl-conn-name{flex:1;color:#ccc}
.cl-conn-status{font-size:10px;color:#666}
.cl-tool-item{display:flex;align-items:start;gap:8px;padding:8px 10px;border-radius:6px;margin-bottom:4px}
.cl-tool-item:hover{background:rgba(255,255,255,.03)}
.cl-tool-icon{font-size:16px;line-height:1}
.cl-tool-name{font-size:12px;font-weight:600;color:#ccc}
.cl-tool-desc{font-size:10px;color:#666;margin-top:2px}
.cl-mem-add{width:100%;padding:8px;background:rgba(255,255,255,.04);border:1px dashed rgba(255,255,255,.1);color:#888;border-radius:6px;cursor:pointer;font-size:12px;margin-bottom:8px}
.cl-mem-add:hover{background:rgba(255,255,255,.06);color:#ccc}
.cl-mem-item{display:flex;align-items:center;gap:6px;padding:6px 8px;background:rgba(255,255,255,.03);border-radius:6px;margin-bottom:4px;font-size:11px}
.cl-mem-text{flex:1;color:#aaa}
.cl-mem-del{background:none;border:none;color:#666;cursor:pointer;font-size:14px}
.cl-mem-del:hover{color:#ff4444}
.cl-soul-label{font-size:12px;color:#888;margin-bottom:6px}
.cl-soul-ta{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:#ccc;border-radius:8px;padding:10px;font-size:12px;font-family:'JetBrains Mono',monospace;resize:vertical;min-height:150px}
.cl-settings-panel{display:flex;flex-direction:column;gap:8px}
.cl-set-title{font-size:13px;font-weight:600;color:#ccc}
.cl-set-desc{font-size:11px;color:#666;margin:0}
.cl-set-key{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:#ccc;border-radius:6px;padding:8px 10px;font-size:12px;font-family:'JetBrains Mono',monospace}
.cl-set-save{padding:8px 16px;background:#d4a574;color:#000;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer}
.cl-set-save:hover{opacity:.85}
.cl-set-clear{padding:8px 16px;background:rgba(255,68,68,.15);color:#ff4444;border:none;border-radius:6px;font-size:12px;cursor:pointer}
.cl-set-model{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:#ccc;border-radius:6px;padding:8px;font-size:12px}
.cl-set-info{font-size:10px;color:#555;display:flex;flex-direction:column;gap:3px;margin-top:4px}
.cl-main{flex:1;display:flex;flex-direction:column;min-width:0}
.cl-topbar{display:flex;align-items:center;gap:10px;padding:8px 16px;border-bottom:1px solid rgba(255,255,255,.06);background:#1a1a1a}
.cl-toggle-side{background:none;border:none;color:#888;cursor:pointer;padding:4px}
.cl-toggle-side:hover{color:#fff}
.cl-model-select{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:#ccc;border-radius:6px;padding:4px 8px;font-size:12px}
.cl-topbar-status{display:flex;align-items:center;gap:6px;margin-left:auto;font-size:12px;color:#888}
.cl-status-dot{width:8px;height:8px;border-radius:50%;background:#666}
.cl-token-count{font-size:11px;color:#555;font-family:'JetBrains Mono',monospace}
.cl-chat{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:16px}
.cl-welcome{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:12px;text-align:center;padding:40px 20px}
.cl-welcome h2{font-size:24px;font-weight:600;color:#e0e0e0;margin:0}
.cl-welcome p{font-size:14px;color:#666;margin:0}
.cl-welcome-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px;max-width:400px;width:100%}
.cl-welcome-card{padding:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;font-size:13px;cursor:pointer;text-align:left;transition:all .15s;color:#aaa}
.cl-welcome-card:hover{background:rgba(212,165,116,.08);border-color:rgba(212,165,116,.2);color:#d4a574}
.cl-welcome-keys{margin-top:20px;display:flex;flex-direction:column;align-items:center;gap:8px}
.cl-key-alert{color:#ffa500;font-weight:600;font-size:14px}
.cl-welcome-keys p{color:#666;font-size:12px;margin:0}
.cl-key-input-inline{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:#ccc;border-radius:8px;padding:10px 14px;font-size:13px;width:320px;font-family:'JetBrains Mono',monospace;text-align:center}
.cl-key-save-inline{padding:10px 24px;background:#d4a574;color:#000;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
.cl-msg{display:flex;gap:10px;animation:slideUp .2s ease}
.cl-msg-user{flex-direction:row-reverse}
.cl-msg-user .cl-msg-body{background:rgba(212,165,116,.1);border:1px solid rgba(212,165,116,.15);align-items:flex-end}
.cl-msg-ai .cl-msg-body{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05)}
.cl-msg-avatar{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:rgba(255,255,255,.05)}
.cl-user-avatar{background:rgba(212,165,116,.2);color:#d4a574;font-weight:700;font-size:14px}
.cl-msg-body{max-width:80%;border-radius:12px;padding:12px 16px;display:flex;flex-direction:column;gap:4px}
.cl-msg-model{font-size:10px;color:#666;font-family:'JetBrains Mono',monospace}
.cl-msg-text{font-size:14px;line-height:1.6;color:#ddd;word-wrap:break-word}
.cl-msg-text p{margin:0 0 8px}
.cl-msg-text p:last-child{margin:0}
.cl-msg-text h2,.cl-msg-text h3,.cl-msg-text h4{color:#e8e8e8;margin:12px 0 6px;font-size:inherit}
.cl-msg-text h2{font-size:18px}
.cl-msg-text h3{font-size:16px}
.cl-msg-text li{margin-left:16px;margin-bottom:4px}
.cl-msg-text strong{color:#e8e8e8}
.cl-link{color:#d4a574;text-decoration:none}
.cl-link:hover{text-decoration:underline}
.cl-inline-code{background:rgba(255,255,255,.08);padding:2px 6px;border-radius:4px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#d4a574}
.cl-pre{background:#0d0d0d;border:1px solid rgba(255,255,255,.06);border-radius:8px;overflow:hidden;margin:8px 0}
.cl-code-header{display:flex;justify-content:space-between;align-items:center;padding:6px 12px;background:rgba(255,255,255,.03);font-size:11px;color:#666}
.cl-copy-btn{background:none;border:1px solid rgba(255,255,255,.1);color:#888;padding:2px 8px;border-radius:4px;font-size:10px;cursor:pointer}
.cl-copy-btn:hover{color:#fff;border-color:rgba(255,255,255,.2)}
.cl-code{display:block;padding:12px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#ccc;overflow-x:auto;white-space:pre}
.cl-system-msg{background:rgba(255,165,0,.08);border:1px solid rgba(255,165,0,.15);border-radius:8px;padding:10px 14px}
.cl-system-msg .cl-msg-text{color:#ffa500;font-size:13px}
.cl-usage{font-size:10px;color:#555;font-family:'JetBrains Mono',monospace;margin-top:4px}
.cl-typing{display:flex;gap:4px;padding:8px 0}
.cl-typing span{width:6px;height:6px;border-radius:50%;background:#d4a574;animation:clBounce .6s infinite}
.cl-typing span:nth-child(2){animation-delay:.1s}
.cl-typing span:nth-child(3){animation-delay:.2s}
@keyframes clBounce{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}
.cl-input-area{padding:12px 20px;border-top:1px solid rgba(255,255,255,.06);background:#1a1a1a}
.cl-input-wrap{display:flex;align-items:flex-end;gap:8px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:8px 12px}
.cl-input-wrap:focus-within{border-color:rgba(212,165,116,.4)}
.cl-input{flex:1;background:none;border:none;color:#e0e0e0;font-size:14px;resize:none;outline:none;font-family:Inter,sans-serif;max-height:200px;line-height:1.5}
.cl-input::placeholder{color:#555}
.cl-input-actions{display:flex;gap:4px}
.cl-attach,.cl-send{background:none;border:none;color:#666;cursor:pointer;padding:4px;border-radius:6px}
.cl-attach:hover,.cl-send:hover{color:#d4a574;background:rgba(212,165,116,.1)}
.cl-input-info{font-size:10px;color:#444;margin-top:6px;text-align:center}
.cl-chat::-webkit-scrollbar{width:6px}
.cl-chat::-webkit-scrollbar-track{background:transparent}
.cl-chat::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:3px}
.cl-side-body::-webkit-scrollbar{width:5px}
.cl-side-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:3px}
@media(max-width:768px){.cl-sidebar{position:absolute;z-index:10;height:100%;width:280px}.cl-sidebar.collapsed{width:0}}
@keyframes slideUp{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}
    `;
    document.head.appendChild(s);
  }
})();
