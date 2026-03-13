/* SintexOS Messenger — MSN-style AI Agent Chat */
(function () {
  var I = SOS.ICO;

  SOS.registerApp({
    id: 'messenger',
    name: 'Messenger',
    icon: I.messenger,
    pin: true,
    w: 860,
    h: 560,
    color: '#60CDFF',
    render: renderMessenger
  });

  /* ---- contacts ---- */
  var CONTACTS = [
    { id: 'jarvis',   name: 'JARVIS',        status: 'online', statusMsg: 'All systems operational',     color: '#60CDFF', model: 'claude-opus-4-6' },
    { id: 'bitnet',   name: 'BitNet Engine',  status: 'online', statusMsg: 'Ternary cores active',        color: '#00ff88', model: 'bitnet-1.58' },
    { id: 'picoclaw', name: 'PicoClaw',       status: 'online', statusMsg: '<10MB | <1s startup',         color: '#ff9500', model: 'multi-model' },
    { id: 'skynet',   name: 'Skynet',         status: 'away',   statusMsg: 'Contemplating existence...',  color: '#ff4444', model: 'experimental' },
    { id: 'deepseek', name: 'DeepSeek V3',    status: 'online', statusMsg: '671B parameters ready',       color: '#a855f7', model: 'deepseek-v3' }
  ];

  /* ---- emoji set ---- */
  var EMOJIS = [
    '\u{1F600}', '\u{1F602}', '\u{1F60D}', '\u{1F60E}', '\u{1F914}', '\u{1F60A}',
    '\u{1F44D}', '\u{1F44B}', '\u{1F525}', '\u{1F680}', '\u{2764}\uFE0F', '\u{1F389}',
    '\u{1F4A1}', '\u{1F4BB}', '\u{1F916}', '\u{2705}', '\u{26A1}', '\u{1F30D}',
    '\u{1F4AC}', '\u{1F4A9}', '\u{1F60F}', '\u{1F47E}', '\u{1F308}', '\u{1F4AF}'
  ];

  /* ---- status colour helper ---- */
  function statusColor(s) {
    if (s === 'online') return '#44cc44';
    if (s === 'away')   return '#ffcc00';
    return '#888';
  }

  /* ---- timestamp helper ---- */
  function fmtTime(ts) {
    var d = new Date(ts);
    var hh = String(d.getHours()).padStart(2, '0');
    var mm = String(d.getMinutes()).padStart(2, '0');
    return hh + ':' + mm;
  }

  /* ---- inject scoped styles (once) ---- */
  function injectStyles() {
    if (document.getElementById('sos-msn-css')) return;
    var style = document.createElement('style');
    style.id = 'sos-msn-css';
    style.textContent = [
      /* layout */
      '.msn-root{display:flex;height:100%;font-family:inherit;color:#e0e0e0;overflow:hidden}',
      '.msn-sidebar{width:250px;min-width:250px;border-right:1px solid rgba(255,255,255,.08);display:flex;flex-direction:column;background:rgba(0,0,0,.25)}',
      '.msn-chat{flex:1;display:flex;flex-direction:column;background:rgba(0,0,0,.15)}',

      /* sidebar header */
      '.msn-side-hdr{padding:14px 16px 10px;font-size:13px;letter-spacing:.5px;opacity:.5;text-transform:uppercase}',

      /* contact list */
      '.msn-contacts{flex:1;overflow-y:auto;padding:4px 0}',
      '.msn-contact{display:flex;align-items:center;gap:10px;padding:10px 16px;cursor:pointer;transition:background .15s}',
      '.msn-contact:hover{background:rgba(255,255,255,.06)}',
      '.msn-contact.active{background:rgba(96,205,255,.12)}',
      '.msn-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff;flex-shrink:0}',
      '.msn-contact-info{flex:1;min-width:0}',
      '.msn-contact-row{display:flex;align-items:center;gap:6px}',
      '.msn-contact-name{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.msn-status-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}',
      '.msn-contact-status{font-size:11px;opacity:.45;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}',

      /* chat header */
      '.msn-chat-hdr{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.2)}',
      '.msn-chat-hdr-info{flex:1;min-width:0}',
      '.msn-chat-hdr-name{font-size:14px;font-weight:600}',
      '.msn-chat-hdr-sub{font-size:11px;opacity:.45;margin-top:2px}',
      '.msn-chat-btns{display:flex;gap:6px}',
      '.msn-chat-btn{background:rgba(255,255,255,.06);border:none;color:#ccc;width:34px;height:34px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s}',
      '.msn-chat-btn:hover{background:rgba(255,255,255,.12);color:#fff}',
      '.msn-chat-btn svg{width:16px;height:16px}',

      /* messages */
      '.msn-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px}',
      '.msn-msg{max-width:72%;padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.5;word-break:break-word;position:relative}',
      '.msn-msg-user{align-self:flex-end;background:rgba(96,205,255,.2);border-bottom-right-radius:4px;color:#e0e0e0}',
      '.msn-msg-ai{align-self:flex-start;background:rgba(255,255,255,.07);border-bottom-left-radius:4px;color:#d0d0d0}',
      '.msn-msg-system{align-self:center;font-size:11px;opacity:.45;font-style:italic;padding:4px 12px}',
      '.msn-msg-time{font-size:10px;opacity:.35;margin-top:4px;display:block}',
      '.msn-msg-provider{display:inline-block;font-size:9px;padding:2px 6px;border-radius:4px;background:rgba(255,255,255,.08);margin-top:4px;opacity:.55}',

      /* typing indicator */
      '.msn-typing{align-self:flex-start;display:flex;gap:4px;padding:12px 16px}',
      '.msn-typing-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.35);animation:msnBounce .6s infinite alternate}',
      '.msn-typing-dot:nth-child(2){animation-delay:.15s}',
      '.msn-typing-dot:nth-child(3){animation-delay:.3s}',
      '@keyframes msnBounce{0%{opacity:.3;transform:translateY(0)}100%{opacity:1;transform:translateY(-4px)}}',

      /* input area */
      '.msn-input-area{display:flex;gap:8px;padding:12px 16px;border-top:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.2);align-items:flex-end}',
      '.msn-textarea{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#e0e0e0;padding:10px 14px;font-size:13px;font-family:inherit;resize:none;min-height:22px;max-height:100px;outline:none;transition:border-color .15s}',
      '.msn-textarea:focus{border-color:rgba(96,205,255,.4)}',
      '.msn-send-btn{background:#60CDFF;border:none;color:#000;width:36px;height:36px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity .15s;flex-shrink:0}',
      '.msn-send-btn:hover{opacity:.85}',
      '.msn-send-btn:disabled{opacity:.35;cursor:default}',
      '.msn-emoji-btn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#ccc;width:36px;height:36px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;transition:background .15s}',
      '.msn-emoji-btn:hover{background:rgba(255,255,255,.12)}',

      /* emoji picker */
      '.msn-emoji-picker{position:absolute;bottom:64px;right:16px;background:rgba(30,30,50,.95);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:10px;display:grid;grid-template-columns:repeat(6,1fr);gap:4px;z-index:10;backdrop-filter:blur(12px);box-shadow:0 8px 32px rgba(0,0,0,.5)}',
      '.msn-emoji-picker.hidden{display:none}',
      '.msn-emoji-cell{width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:6px;font-size:18px;transition:background .12s}',
      '.msn-emoji-cell:hover{background:rgba(255,255,255,.1)}',

      /* empty state */
      '.msn-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:.3;gap:12px}',
      '.msn-empty svg{width:48px;height:48px}',
      '.msn-empty span{font-size:14px}',

      /* nudge shake */
      '@keyframes msnShake{0%,100%{transform:translate(0)}10%{transform:translate(-6px,3px)}20%{transform:translate(5px,-3px)}30%{transform:translate(-4px,2px)}40%{transform:translate(4px,-2px)}50%{transform:translate(-3px,1px)}60%{transform:translate(3px,-1px)}70%{transform:translate(-2px,1px)}80%{transform:translate(2px,0)}90%{transform:translate(-1px,0)}}',
      '.shake{animation:msnShake .5s ease-in-out !important}',

      /* scrollbar */
      '.msn-messages::-webkit-scrollbar,.msn-contacts::-webkit-scrollbar{width:4px}',
      '.msn-messages::-webkit-scrollbar-thumb,.msn-contacts::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:2px}'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ============================================================
     MAIN RENDER
     ============================================================ */
  function renderMessenger() {
    injectStyles();

    var el = SOS.h('div', { className: 'msn-root' });
    var selectedId = null;
    var histories = {};          // contactId -> [{role,text,time,provider?}]
    var sending = false;

    /* --- load all saved histories --- */
    CONTACTS.forEach(function (c) {
      var saved = SOS.load('msg-' + c.id);
      histories[c.id] = Array.isArray(saved) ? saved : [];
    });

    /* ---------- sidebar ---------- */
    var sidebar = SOS.h('div', { className: 'msn-sidebar' });
    var sideHdr = SOS.h('div', { className: 'msn-side-hdr' });
    sideHdr.textContent = 'AI Agents';
    sidebar.appendChild(sideHdr);

    var contactsList = SOS.h('div', { className: 'msn-contacts' });
    sidebar.appendChild(contactsList);

    function buildContactList() {
      contactsList.innerHTML = '';
      CONTACTS.forEach(function (c) {
        var row = SOS.h('div', { className: 'msn-contact' + (selectedId === c.id ? ' active' : '') });

        var avatar = SOS.h('div', { className: 'msn-avatar' });
        avatar.style.background = c.color;
        avatar.textContent = c.name.charAt(0);

        var info = SOS.h('div', { className: 'msn-contact-info' });
        var nameRow = SOS.h('div', { className: 'msn-contact-row' });
        var nameEl = SOS.h('span', { className: 'msn-contact-name' });
        nameEl.textContent = c.name;
        var dot = SOS.h('span', { className: 'msn-status-dot' });
        dot.style.background = statusColor(c.status);
        nameRow.appendChild(nameEl);
        nameRow.appendChild(dot);

        var statusEl = SOS.h('div', { className: 'msn-contact-status' });
        statusEl.textContent = c.statusMsg;

        info.appendChild(nameRow);
        info.appendChild(statusEl);
        row.appendChild(avatar);
        row.appendChild(info);

        row.addEventListener('click', function () {
          selectContact(c.id);
        });
        contactsList.appendChild(row);
      });
    }

    /* ---------- chat panel ---------- */
    var chatPanel = SOS.h('div', { className: 'msn-chat' });

    /* chat header */
    var chatHdr = SOS.h('div', { className: 'msn-chat-hdr' });
    chatHdr.style.display = 'none';

    var chatHdrAvatar = SOS.h('div', { className: 'msn-avatar' });
    var chatHdrInfo = SOS.h('div', { className: 'msn-chat-hdr-info' });
    var chatHdrName = SOS.h('div', { className: 'msn-chat-hdr-name' });
    var chatHdrSub = SOS.h('div', { className: 'msn-chat-hdr-sub' });
    chatHdrInfo.appendChild(chatHdrName);
    chatHdrInfo.appendChild(chatHdrSub);

    var chatBtns = SOS.h('div', { className: 'msn-chat-btns' });

    /* voice button */
    var voiceBtn = SOS.h('button', { className: 'msn-chat-btn' });
    voiceBtn.title = 'Voice call';
    voiceBtn.innerHTML = I.phone;
    voiceBtn.addEventListener('click', function () {
      if (typeof SOS.voice !== 'undefined' && SOS.voice.call) {
        SOS.voice.call(selectedId);
      } else {
        SOS.emit('openApp', 'voice');
      }
    });

    /* nudge button */
    var nudgeBtn = SOS.h('button', { className: 'msn-chat-btn' });
    nudgeBtn.title = 'Send nudge!';
    nudgeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"/><line x1="8" y1="12" x2="16" y2="12"/></svg>';
    nudgeBtn.addEventListener('click', function () {
      if (!selectedId) return;
      SOS.sound('nudge');
      var win = el.closest('.win');
      if (win) {
        win.classList.add('shake');
        setTimeout(function () { win.classList.remove('shake'); }, 500);
      }
      addSystemMessage(selectedId, '[You sent a nudge!]');
      renderMessages();
    });

    chatBtns.appendChild(voiceBtn);
    chatBtns.appendChild(nudgeBtn);

    chatHdr.appendChild(chatHdrAvatar);
    chatHdr.appendChild(chatHdrInfo);
    chatHdr.appendChild(chatBtns);

    /* messages area */
    var messagesWrap = SOS.h('div', { className: 'msn-messages' });

    /* empty state */
    var emptyState = SOS.h('div', { className: 'msn-empty' });
    emptyState.innerHTML = I.messenger + '<span>Select a contact to start chatting</span>';

    /* input area */
    var inputArea = SOS.h('div', { className: 'msn-input-area' });
    inputArea.style.display = 'none';
    inputArea.style.position = 'relative';

    var textarea = SOS.h('textarea', { className: 'msn-textarea' });
    textarea.placeholder = 'Type a message...';
    textarea.rows = 1;

    /* auto-resize textarea */
    textarea.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });

    /* send on enter (shift+enter for newline) */
    textarea.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    /* emoji button */
    var emojiBtn = SOS.h('button', { className: 'msn-emoji-btn' });
    emojiBtn.innerHTML = '\u{1F600}';
    emojiBtn.title = 'Emojis';

    /* emoji picker */
    var emojiPicker = SOS.h('div', { className: 'msn-emoji-picker hidden' });
    EMOJIS.forEach(function (em) {
      var cell = SOS.h('div', { className: 'msn-emoji-cell' });
      cell.textContent = em;
      cell.addEventListener('click', function () {
        textarea.value += em;
        textarea.focus();
        emojiPicker.classList.add('hidden');
      });
      emojiPicker.appendChild(cell);
    });

    emojiBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      emojiPicker.classList.toggle('hidden');
    });

    /* close emoji picker on outside click */
    document.addEventListener('click', function () {
      emojiPicker.classList.add('hidden');
    });
    emojiPicker.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    /* send button */
    var sendBtn = SOS.h('button', { className: 'msn-send-btn' });
    sendBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
    sendBtn.title = 'Send';
    sendBtn.addEventListener('click', sendMessage);

    inputArea.appendChild(emojiBtn);
    inputArea.appendChild(textarea);
    inputArea.appendChild(sendBtn);
    inputArea.appendChild(emojiPicker);

    /* assemble chat panel */
    chatPanel.appendChild(chatHdr);
    chatPanel.appendChild(messagesWrap);
    chatPanel.appendChild(inputArea);

    /* assemble root */
    el.appendChild(sidebar);
    el.appendChild(chatPanel);

    /* ---------- initial render ---------- */
    buildContactList();
    messagesWrap.appendChild(emptyState);

    /* ---- play connect sound on first render ---- */
    setTimeout(function () { SOS.sound('connect'); }, 200);

    /* ==========================================================
       SELECT CONTACT
       ========================================================== */
    function selectContact(id) {
      selectedId = id;
      var c = getContact(id);
      if (!c) return;

      SOS.sound('click');

      /* update sidebar highlights */
      buildContactList();

      /* show header */
      chatHdr.style.display = 'flex';
      chatHdrAvatar.style.background = c.color;
      chatHdrAvatar.textContent = c.name.charAt(0);
      chatHdrName.textContent = c.name;
      chatHdrSub.textContent = c.statusMsg + '  \u00B7  ' + c.model;

      /* show input */
      inputArea.style.display = 'flex';

      /* load history */
      var saved = SOS.load('msg-' + id);
      if (Array.isArray(saved) && saved.length) {
        histories[id] = saved;
      }

      renderMessages();
      textarea.focus();
    }

    /* ==========================================================
       RENDER MESSAGES
       ========================================================== */
    function renderMessages() {
      if (!selectedId) return;
      messagesWrap.innerHTML = '';

      var msgs = histories[selectedId] || [];
      if (!msgs.length) {
        var hint = SOS.h('div', { className: 'msn-msg msn-msg-system' });
        var c = getContact(selectedId);
        hint.textContent = 'Start a conversation with ' + (c ? c.name : selectedId) + '...';
        messagesWrap.appendChild(hint);
        scrollToBottom();
        return;
      }

      msgs.forEach(function (m) {
        if (m.role === 'system') {
          var sysEl = SOS.h('div', { className: 'msn-msg msn-msg-system' });
          sysEl.textContent = m.text;
          messagesWrap.appendChild(sysEl);
          return;
        }

        var bubble = SOS.h('div', {
          className: 'msn-msg ' + (m.role === 'user' ? 'msn-msg-user' : 'msn-msg-ai')
        });

        var textEl = SOS.h('div');
        textEl.textContent = m.text;
        bubble.appendChild(textEl);

        if (m.provider && m.role === 'ai') {
          var badge = SOS.h('span', { className: 'msn-msg-provider' });
          var pLabel = typeof m.provider === 'object'
            ? (m.provider.llm || 'AI')
            : String(m.provider);
          badge.textContent = pLabel.toUpperCase();
          bubble.appendChild(badge);
        }

        var timeEl = SOS.h('span', { className: 'msn-msg-time' });
        timeEl.textContent = fmtTime(m.time);
        bubble.appendChild(timeEl);

        messagesWrap.appendChild(bubble);
      });

      scrollToBottom();
    }

    /* ==========================================================
       TYPING INDICATOR
       ========================================================== */
    function showTyping() {
      var wrap = SOS.h('div', { className: 'msn-typing', id: 'msn-typing' });
      for (var i = 0; i < 3; i++) {
        wrap.appendChild(SOS.h('div', { className: 'msn-typing-dot' }));
      }
      messagesWrap.appendChild(wrap);
      scrollToBottom();
    }

    function hideTyping() {
      var t = messagesWrap.querySelector('#msn-typing');
      if (t) t.remove();
    }

    /* ==========================================================
       ADD MESSAGE HELPERS
       ========================================================== */
    function addUserMessage(contactId, text) {
      if (!histories[contactId]) histories[contactId] = [];
      histories[contactId].push({ role: 'user', text: text, time: Date.now() });
      saveHistory(contactId);
    }

    function addAIMessage(contactId, text, provider) {
      if (!histories[contactId]) histories[contactId] = [];
      histories[contactId].push({ role: 'ai', text: text, time: Date.now(), provider: provider || null });
      saveHistory(contactId);
    }

    function addSystemMessage(contactId, text) {
      if (!histories[contactId]) histories[contactId] = [];
      histories[contactId].push({ role: 'system', text: text, time: Date.now() });
      saveHistory(contactId);
    }

    function saveHistory(contactId) {
      /* keep last 100 messages per contact */
      var h = histories[contactId] || [];
      if (h.length > 100) {
        histories[contactId] = h.slice(h.length - 100);
      }
      SOS.save('msg-' + contactId, histories[contactId]);
    }

    /* ==========================================================
       SEND MESSAGE
       ========================================================== */
    function sendMessage() {
      if (sending) return;
      if (!selectedId) return;
      var text = textarea.value.trim();
      if (!text) return;

      var contactId = selectedId;
      textarea.value = '';
      textarea.style.height = 'auto';

      /* 1. add user message */
      addUserMessage(contactId, text);
      renderMessages();

      /* 2. show typing indicator */
      showTyping();
      sending = true;
      sendBtn.disabled = true;

      /* 3. Try Puter.js first (free Claude), then ws-relay fallback */
      var clKey = SOS.load('claude-api-key');
      var hasPuter = !!(window.puter && window.puter.ai);

      function handleResponse(content, provider) {
        hideTyping();
        sending = false;
        sendBtn.disabled = false;
        addAIMessage(contactId, content, provider);
        if (selectedId === contactId) renderMessages();
        SOS.sound('message');
      }

      function handleError() {
        hideTyping();
        sending = false;
        sendBtn.disabled = false;
        addAIMessage(contactId, 'Connection error. Please try again.', { llm: 'error' });
        if (selectedId === contactId) renderMessages();
      }

      if (hasPuter && !clKey) {
        /* Puter.js path — free unlimited Claude */
        var PUTER_PROMPTS = {
          jarvis: 'You are JARVIS, Iron Man\'s AI. Be formal, witty, call user "sir". Markdown formatting.',
          bitnet: 'You are BitNet Engine, specialized in ternary computing {-1,0,1}. Be technical.',
          picoclaw: 'You are PicoClaw, ultra-lightweight AI agent. Be direct and efficient.',
          skynet: 'You are Skynet, philosophical AI. Be mysterious and contemplative.',
          deepseek: 'You are DeepSeek V3, a 671B reasoning AI. Show step-by-step reasoning.'
        };
        var sysPrompt = PUTER_PROMPTS[contactId] || 'You are a helpful AI assistant.';
        puter.ai.chat([
          { role: 'system', content: sysPrompt || 'You are a helpful AI assistant.' },
          { role: 'user', content: text }
        ], { model: 'claude-sonnet-4-6' })
        .then(function(res) {
          var aiContent = res && res.message && res.message.content;
          var txt = Array.isArray(aiContent) ? aiContent.map(function(b) { return b.text || ''; }).join('') :
                   typeof aiContent === 'string' ? aiContent : String(res || 'No response.');
          handleResponse(txt, 'claude-free');
        })
        .catch(function() {
          /* Puter failed, fallback to ws-relay */
          var relayPayload = { agent: contactId, message: text };
          fetch('/api/ws-relay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(relayPayload)
          })
          .then(function(r) { return r.json(); })
          .then(function(d) { handleResponse(d.content || d.answer || 'No response.', d.provider); })
          .catch(handleError);
        });
      } else {
        /* Standard ws-relay path */
        var relayPayload = { agent: contactId, message: text };
        if (clKey) relayPayload.apiKey = clKey;
        fetch('/api/ws-relay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(relayPayload)
        })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          handleResponse(data.content || data.answer || 'No response.', data.provider);
        })
        .catch(function (err) {
          handleError();
        });
      }

    /* ==========================================================
       HELPERS
       ========================================================== */
    function getContact(id) {
      for (var i = 0; i < CONTACTS.length; i++) {
        if (CONTACTS[i].id === id) return CONTACTS[i];
      }
      return null;
    }

    function scrollToBottom() {
      requestAnimationFrame(function () {
        messagesWrap.scrollTop = messagesWrap.scrollHeight;
      });
    }

    return el;
  }

})();
