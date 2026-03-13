(function () {
  "use strict";

  /* ───────────────────────── helpers ───────────────────────── */
  const h = SOS.h;
  const esc = SOS.esc;
  const ICO = SOS.ICO;

  const MODELS = [
    { id: "auto", label: "Auto (Best Available)" },
    { id: "groq-llama", label: "Groq / Llama 3.3 70B" },
    { id: "together-llama", label: "Together / Llama 3.3 70B" },
    { id: "gemini-2", label: "Gemini 2.0 Flash" },
    { id: "grok-3", label: "Grok 3" },
    { id: "deepseek-v3", label: "DeepSeek V3" },
  ];

  const CONNECTORS = [
    { name: "Google", status: "green" },
    { name: "Brave", status: "green" },
    { name: "SearX", status: "yellow" },
    { name: "BitNet Cache", status: "green" },
  ];

  const SKILLS = [
    "Multi-AI Search",
    "Web Fetch",
    "Deploy",
    "Tweet",
    "Monitor",
    "Code Analysis",
  ];

  const MCPS = [
    { name: "web_fetch", desc: "Fetch and parse any URL" },
    { name: "memory", desc: "Persistent key-value memory" },
    { name: "spawn", desc: "Spawn background agents" },
    { name: "cron", desc: "Schedule recurring tasks" },
    { name: "file_read", desc: "Read local filesystem files" },
    { name: "shell_exec", desc: "Execute shell commands" },
  ];

  const DEFAULT_SOUL =
    "You are JARVIS, an advanced AI assistant created by Elrom for Sintex.AI. " +
    "You are precise, knowledgeable, and proactive. You speak with confidence " +
    "and provide sources for your claims. You have access to multiple search " +
    "engines and AI models. Always be helpful and thorough.";

  /* ───────────────── ternary rain canvas ──────────────────── */
  function createTernaryRain(container) {
    const canvas = document.createElement("canvas");
    canvas.width = 120;
    canvas.height = 80;
    Object.assign(canvas.style, {
      position: "absolute",
      top: "8px",
      right: "8px",
      borderRadius: "8px",
      background: "rgba(0,0,0,0.6)",
      zIndex: "10",
      pointerEvents: "none",
      opacity: "0",
      transition: "opacity .4s",
    });
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const cols = 20;
    const drops = new Array(cols).fill(0);
    const chars = ["-1", " 0", "+1"];
    let raf = null;
    let active = false;

    function draw() {
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0f0";
      ctx.font = "10px monospace";
      for (let i = 0; i < cols; i++) {
        const ch = chars[Math.floor(Math.random() * 3)];
        ctx.fillStyle =
          ch === "+1" ? "#0f0" : ch === " 0" ? "#0a0" : "#f44";
        ctx.fillText(ch, i * 6, drops[i] * 10);
        if (drops[i] * 10 > canvas.height && Math.random() > 0.9) drops[i] = 0;
        drops[i]++;
      }
      if (active) raf = requestAnimationFrame(draw);
    }

    return {
      start() {
        if (active) return;
        active = true;
        canvas.style.opacity = "1";
        draw();
      },
      stop() {
        active = false;
        canvas.style.opacity = "0";
        if (raf) cancelAnimationFrame(raf);
        raf = null;
      },
    };
  }

  /* ───────────── markdown-lite renderer ───────────────────── */
  function renderMarkdown(text) {
    let s = esc(text);
    // code blocks
    s = s.replace(/```(\w*)\n([\s\S]*?)```/g, function (_, lang, code) {
      return '<pre class="sos-md-pre"><code>' + code + "</code></pre>";
    });
    // inline code
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    // bold
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // italic
    s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
    // headings
    s = s.replace(/^### (.+)$/gm, "<h4>$1</h4>");
    s = s.replace(/^## (.+)$/gm, "<h3>$1</h3>");
    s = s.replace(/^# (.+)$/gm, "<h2>$1</h2>");
    // links
    s = s.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>'
    );
    // citation refs
    s = s.replace(
      /\[(\d+)\]/g,
      '<sup class="sos-cite" title="Source $1">[$1]</sup>'
    );
    // line breaks
    s = s.replace(/\n/g, "<br>");
    return s;
  }

  /* ──────────────── streaming word display ─────────────────── */
  function streamWords(el, html, done) {
    const words = html.split(/(\s+)/);
    let idx = 0;
    el.innerHTML = "";
    function tick() {
      if (idx >= words.length) {
        if (done) done();
        return;
      }
      el.innerHTML += words[idx++];
      setTimeout(tick, 20);
    }
    tick();
  }

  /* ──────────── research step animations ──────────────────── */
  function animateSteps(container, model, cb) {
    const steps = [
      "Searching Google...",
      "Fetching web results...",
      "Analyzing sources...",
      "Synthesizing with " + (model === "auto" ? "best model" : model) + "...",
    ];
    let i = 0;
    const ul = document.createElement("ul");
    ul.className = "sos-search-steps";
    container.appendChild(ul);

    function next() {
      if (i >= steps.length) {
        if (cb) cb();
        return;
      }
      const li = document.createElement("li");
      li.textContent = steps[i];
      li.style.opacity = "0";
      ul.appendChild(li);
      requestAnimationFrame(function () {
        li.style.transition = "opacity .3s";
        li.style.opacity = "1";
      });
      i++;
      setTimeout(next, 600);
    }
    next();
  }

  /* ═══════════════════════ REGISTER APP ═══════════════════════ */
  SOS.registerApp({
    id: "search",
    name: "Sintex Search",
    icon: ICO.search || "🔍",
    pin: true,
    w: 920,
    h: 620,
    color: "#1a1a2e",

    render: function (win) {
      /* ---- state ---- */
      var conversation = [];
      var selectedModel = "auto";
      var sidebarOpen = true;
      var activeTab = "connectors";
      var rain = null;

      /* ---- styles ---- */
      var style = document.createElement("style");
      style.textContent = [
        ".sos-srch{display:flex;height:100%;font-family:system-ui,sans-serif;color:#e0e0e0;background:#0d0d1a;overflow:hidden}",
        ".sos-srch *{box-sizing:border-box}",
        /* sidebar */
        ".sos-side{display:flex;height:100%;flex-shrink:0;transition:width .25s}",
        ".sos-side.open{width:260px}",
        ".sos-side.closed{width:42px}",
        ".sos-side-icons{width:42px;background:#0a0a18;display:flex;flex-direction:column;align-items:center;padding-top:6px;gap:2px;border-right:1px solid #222}",
        ".sos-side-icons button{width:34px;height:34px;border:none;background:transparent;color:#888;border-radius:6px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:background .15s,color .15s}",
        ".sos-side-icons button:hover,.sos-side-icons button.act{background:#1e1e3a;color:#7df}",
        ".sos-side-panel{flex:1;overflow-y:auto;padding:10px;display:none;background:#10102a;border-right:1px solid #222}",
        ".sos-side-panel.vis{display:block}",
        ".sos-side-panel h3{margin:0 0 8px;font-size:13px;color:#7df;text-transform:uppercase;letter-spacing:.5px}",
        /* connectors */
        ".sos-conn{display:flex;align-items:center;gap:8px;padding:6px 4px;font-size:13px}",
        ".sos-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}",
        ".sos-dot.green{background:#0f0}",
        ".sos-dot.yellow{background:#ff0}",
        ".sos-dot.red{background:#f44}",
        /* skills / mcps */
        ".sos-skill{padding:5px 6px;font-size:12px;background:#161638;border-radius:5px;margin-bottom:4px}",
        ".sos-mcp{padding:5px 6px;font-size:12px;background:#161638;border-radius:5px;margin-bottom:4px}",
        ".sos-mcp .nm{color:#7df;font-weight:600}",
        ".sos-mcp .ds{color:#999;font-size:11px}",
        /* memory */
        ".sos-mem-item{display:flex;align-items:center;gap:4px;padding:4px;font-size:12px;background:#161638;border-radius:5px;margin-bottom:4px}",
        ".sos-mem-item span{flex:1;word-break:break-word}",
        ".sos-mem-item button{background:none;border:none;color:#f55;cursor:pointer;font-size:14px}",
        ".sos-mem-add{display:flex;gap:4px;margin-top:6px}",
        ".sos-mem-add input{flex:1;background:#0d0d22;border:1px solid #333;color:#ccc;border-radius:4px;padding:4px 6px;font-size:12px}",
        ".sos-mem-add button{background:#7df;color:#000;border:none;border-radius:4px;padding:4px 8px;font-size:12px;cursor:pointer}",
        /* soul */
        ".sos-soul-ta{width:100%;height:calc(100% - 40px);background:#0d0d22;border:1px solid #333;color:#ccc;border-radius:6px;padding:8px;font-size:12px;resize:none;font-family:inherit}",
        /* main area */
        ".sos-main{flex:1;display:flex;flex-direction:column;position:relative;min-width:0}",
        ".sos-topbar{display:flex;align-items:center;gap:8px;padding:6px 12px;background:#0e0e24;border-bottom:1px solid #222}",
        ".sos-topbar select{background:#161638;color:#ccc;border:1px solid #333;border-radius:5px;padding:4px 8px;font-size:12px;cursor:pointer}",
        ".sos-topbar .title{font-size:13px;font-weight:600;color:#7df;flex:1}",
        /* conversation */
        ".sos-conv{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:14px}",
        ".sos-conv:empty::before{content:'Ask anything. Powered by multiple AI models.';display:flex;align-items:center;justify-content:center;height:100%;color:#555;font-size:14px}",
        ".sos-msg{max-width:85%;padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.55;word-break:break-word}",
        ".sos-msg.user{align-self:flex-end;background:#2a4a8a;color:#e8efff;border-bottom-right-radius:3px}",
        ".sos-msg.ai{align-self:flex-start;background:#1a1a38;color:#ddd;border-bottom-left-radius:3px}",
        ".sos-msg.ai .badge{display:inline-block;font-size:10px;padding:2px 6px;border-radius:3px;background:#7df;color:#000;font-weight:700;margin-bottom:6px}",
        ".sos-msg.ai .body{min-height:12px}",
        /* research steps */
        ".sos-search-steps{list-style:none;padding:0;margin:6px 0}",
        ".sos-search-steps li{font-size:11px;color:#7df;padding:2px 0}",
        ".sos-search-steps li::before{content:'⟐ ';color:#5bf}",
        ".sos-steps-toggle{font-size:11px;color:#888;cursor:pointer;margin-top:6px;user-select:none}",
        ".sos-steps-toggle:hover{color:#aaa}",
        /* sources */
        ".sos-sources{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}",
        ".sos-src-card{display:flex;align-items:center;gap:6px;background:#161638;border-radius:6px;padding:5px 8px;font-size:11px;cursor:pointer;border:1px solid #222;transition:border-color .15s;max-width:200px;overflow:hidden}",
        ".sos-src-card:hover{border-color:#7df}",
        ".sos-src-card img{width:14px;height:14px;border-radius:2px;flex-shrink:0}",
        ".sos-src-card .stitle{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#aac}",
        /* related */
        ".sos-related{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}",
        ".sos-related button{background:#1a1a38;border:1px solid #333;color:#9bd;border-radius:16px;padding:4px 12px;font-size:11px;cursor:pointer;transition:border-color .15s}",
        ".sos-related button:hover{border-color:#7df;color:#bdf}",
        /* input bar */
        ".sos-input-bar{display:flex;align-items:flex-end;gap:6px;padding:8px 12px;background:#0e0e24;border-top:1px solid #222}",
        ".sos-input-bar textarea{flex:1;background:#161638;border:1px solid #333;color:#ddd;border-radius:8px;padding:8px 10px;font-size:13px;resize:none;max-height:120px;min-height:36px;font-family:inherit;line-height:1.4}",
        ".sos-input-bar textarea:focus{outline:none;border-color:#7df}",
        ".sos-input-bar button{width:34px;height:34px;border:none;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}",
        ".sos-send-btn{background:#7df;color:#000}",
        ".sos-send-btn:hover{background:#5cf}",
        ".sos-attach-btn{background:#222;color:#888}",
        ".sos-attach-btn:hover{background:#333;color:#aaa}",
        /* md */
        ".sos-md-pre{background:#0a0a1a;border:1px solid #333;border-radius:6px;padding:8px;overflow-x:auto;font-size:12px;margin:6px 0}",
        ".sos-md-pre code{color:#8f8}",
        "code{background:#1a1a3a;padding:1px 4px;border-radius:3px;font-size:12px;color:#f8c}",
        ".sos-cite{color:#7df;cursor:help}",
        "a{color:#7df}",
      ].join("\n");
      win.appendChild(style);

      /* ---- root ---- */
      var root = h("div", { className: "sos-srch" });
      win.appendChild(root);

      /* ============ SIDEBAR ============ */
      var side = h("div", { className: "sos-side open" });
      root.appendChild(side);

      var iconBar = h("div", { className: "sos-side-icons" });
      side.appendChild(iconBar);

      var panelWrap = h("div", {
        style: "flex:1;position:relative;overflow:hidden",
      });
      side.appendChild(panelWrap);

      var TABS = [
        { id: "connectors", icon: "⊙", tip: "Connectors" },
        { id: "skills", icon: "⚡", tip: "Skills" },
        { id: "mcps", icon: "⧫", tip: "MCPs" },
        { id: "memory", icon: "🧠", tip: "Memory" },
        { id: "soul", icon: "♾", tip: "Soul" },
      ];

      var panels = {};
      var tabBtns = {};

      TABS.forEach(function (t) {
        var btn = h("button", { title: t.tip });
        btn.textContent = t.icon;
        btn.onclick = function () {
          if (!sidebarOpen) {
            sidebarOpen = true;
            side.className = "sos-side open";
          }
          setActiveTab(t.id);
        };
        iconBar.appendChild(btn);
        tabBtns[t.id] = btn;

        var panel = h("div", { className: "sos-side-panel" });
        panelWrap.appendChild(panel);
        panels[t.id] = panel;
      });

      /* collapse toggle */
      var collapseBtn = h("button", { title: "Toggle sidebar" });
      collapseBtn.textContent = "◀";
      collapseBtn.onclick = function () {
        sidebarOpen = !sidebarOpen;
        side.className = sidebarOpen ? "sos-side open" : "sos-side closed";
        collapseBtn.textContent = sidebarOpen ? "◀" : "▶";
      };
      iconBar.appendChild(collapseBtn);

      function setActiveTab(id) {
        activeTab = id;
        TABS.forEach(function (t) {
          panels[t.id].className =
            "sos-side-panel" + (t.id === id ? " vis" : "");
          tabBtns[t.id].className = t.id === id ? "act" : "";
        });
      }

      /* --- connectors panel --- */
      (function () {
        var p = panels.connectors;
        p.innerHTML = "<h3>Connectors</h3>";
        CONNECTORS.forEach(function (c) {
          var row = h("div", { className: "sos-conn" });
          var dot = h("span", { className: "sos-dot " + c.status });
          var lbl = h("span", {});
          lbl.textContent = c.name;
          row.appendChild(dot);
          row.appendChild(lbl);
          p.appendChild(row);
        });
      })();

      /* --- skills panel --- */
      (function () {
        var p = panels.skills;
        p.innerHTML = "<h3>Skills</h3>";
        SKILLS.forEach(function (s) {
          var d = h("div", { className: "sos-skill" });
          d.textContent = s;
          p.appendChild(d);
        });
      })();

      /* --- mcps panel --- */
      (function () {
        var p = panels.mcps;
        p.innerHTML = "<h3>MCP Tools</h3>";
        MCPS.forEach(function (m) {
          var d = h("div", { className: "sos-mcp" });
          d.innerHTML =
            '<span class="nm">' +
            esc(m.name) +
            '</span><br><span class="ds">' +
            esc(m.desc) +
            "</span>";
          p.appendChild(d);
        });
      })();

      /* --- memory panel --- */
      (function () {
        var p = panels.memory;
        var KEY = "sos-search-memory";
        var items = SOS.load(KEY) || [];

        function rebuild() {
          p.innerHTML = "<h3>Memory</h3>";
          items.forEach(function (item, idx) {
            var row = h("div", { className: "sos-mem-item" });
            var sp = h("span", {});
            sp.textContent = item;
            var del = h("button", {});
            del.textContent = "×";
            del.onclick = function () {
              items.splice(idx, 1);
              SOS.save(KEY, items);
              rebuild();
            };
            row.appendChild(sp);
            row.appendChild(del);
            p.appendChild(row);
          });
          var addRow = h("div", { className: "sos-mem-add" });
          var inp = h("input", { placeholder: "Add memory item..." });
          var btn = h("button", {});
          btn.textContent = "+";
          btn.onclick = function () {
            var v = inp.value.trim();
            if (!v) return;
            items.push(v);
            SOS.save(KEY, items);
            rebuild();
          };
          inp.onkeydown = function (e) {
            if (e.key === "Enter") btn.onclick();
          };
          addRow.appendChild(inp);
          addRow.appendChild(btn);
          p.appendChild(addRow);
        }
        rebuild();
      })();

      /* --- soul panel --- */
      (function () {
        var p = panels.soul;
        var KEY = "sos-search-soul";
        p.innerHTML = "<h3>Soul / Personality</h3>";
        var ta = h("textarea", { className: "sos-soul-ta" });
        ta.value = SOS.load(KEY) || DEFAULT_SOUL;
        ta.oninput = function () {
          SOS.save(KEY, ta.value);
        };
        p.appendChild(ta);
      })();

      setActiveTab("connectors");

      /* ============ MAIN AREA ============ */
      var main = h("div", { className: "sos-main" });
      root.appendChild(main);

      /* --- topbar --- */
      var topbar = h("div", { className: "sos-topbar" });
      main.appendChild(topbar);

      var title = h("span", { className: "title" });
      title.textContent = "Sintex Search";
      topbar.appendChild(title);

      var modelSel = h("select", {});
      MODELS.forEach(function (m) {
        var opt = h("option", { value: m.id });
        opt.textContent = m.label;
        modelSel.appendChild(opt);
      });
      modelSel.onchange = function () {
        selectedModel = modelSel.value;
      };
      topbar.appendChild(modelSel);

      /* --- conversation --- */
      var convArea = h("div", { className: "sos-conv" });
      main.appendChild(convArea);

      /* --- BitNet HUD rain --- */
      rain = createTernaryRain(main);

      /* --- input bar --- */
      var inputBar = h("div", { className: "sos-input-bar" });
      main.appendChild(inputBar);

      var attachBtn = h("button", { className: "sos-attach-btn", title: "Attach file" });
      attachBtn.textContent = "📎";
      inputBar.appendChild(attachBtn);

      var textarea = h("textarea", {
        placeholder: "Ask anything...",
        rows: 1,
      });
      textarea.oninput = function () {
        textarea.style.height = "auto";
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
      };
      textarea.onkeydown = function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          doSend();
        }
      };
      inputBar.appendChild(textarea);

      var sendBtn = h("button", { className: "sos-send-btn", title: "Send" });
      sendBtn.textContent = "➤";
      sendBtn.onclick = doSend;
      inputBar.appendChild(sendBtn);

      /* ============ SEARCH LOGIC ============ */
      function addMessage(role, content, meta) {
        var div = h("div", { className: "sos-msg " + role });

        if (role === "ai") {
          var badge = h("span", { className: "badge" });
          badge.textContent = (meta && meta.provider) || "AI";
          div.appendChild(badge);

          /* research steps (collapsible) */
          if (meta && meta.stepsEl) {
            var stepsWrap = h("div", {});
            stepsWrap.appendChild(meta.stepsEl);
            var toggle = h("div", { className: "sos-steps-toggle" });
            toggle.textContent = "▸ Research steps";
            var visible = true;
            toggle.onclick = function () {
              visible = !visible;
              meta.stepsEl.style.display = visible ? "block" : "none";
              toggle.textContent = (visible ? "▾ " : "▸ ") + "Research steps";
            };
            div.appendChild(toggle);
            div.appendChild(stepsWrap);
          }

          var body = h("div", { className: "body" });
          div.appendChild(body);

          /* streaming sim */
          if (content) {
            var rendered = renderMarkdown(content);
            streamWords(body, rendered, function () {
              /* sources */
              if (meta && meta.sources && meta.sources.length) {
                var srcRow = h("div", { className: "sos-sources" });
                meta.sources.forEach(function (s) {
                  var card = h("div", { className: "sos-src-card" });
                  var domain = "";
                  try {
                    domain = new URL(s.url).hostname;
                  } catch (e) {
                    domain = s.url;
                  }
                  card.innerHTML =
                    '<img src="https://www.google.com/s2/favicons?sz=16&domain=' +
                    encodeURIComponent(domain) +
                    '" alt="">' +
                    '<span class="stitle">' +
                    esc(s.title || domain) +
                    "</span>";
                  card.title = s.url;
                  card.onclick = function () {
                    window.open(s.url, "_blank");
                  };
                  srcRow.appendChild(card);
                });
                div.appendChild(srcRow);
              }

              /* related questions */
              if (meta && meta.related && meta.related.length) {
                var relRow = h("div", { className: "sos-related" });
                meta.related.forEach(function (q) {
                  var btn = h("button", {});
                  btn.textContent = q;
                  btn.onclick = function () {
                    textarea.value = q;
                    doSend();
                  };
                  relRow.appendChild(btn);
                });
                div.appendChild(relRow);
              }
            });
          }

          return { el: div, body: body };
        } else {
          div.textContent = content;
        }
        convArea.appendChild(div);
        convArea.scrollTop = convArea.scrollHeight;
        return { el: div };
      }

      function getMemoryContext() {
        var items = SOS.load("sos-search-memory") || [];
        return items.length ? "\n[Memory: " + items.join("; ") + "]" : "";
      }

      function getSoul() {
        return SOS.load("sos-search-soul") || DEFAULT_SOUL;
      }

      function doSend() {
        var query = textarea.value.trim();
        if (!query) return;
        textarea.value = "";
        textarea.style.height = "auto";

        conversation.push({ role: "user", content: query });
        addMessage("user", query);

        /* start rain */
        rain.start();
        if (SOS.sound) SOS.sound("key");

        /* create AI placeholder */
        var aiDiv = h("div", { className: "sos-msg ai" });
        var badge = h("span", { className: "badge" });
        badge.textContent = "Researching...";
        aiDiv.appendChild(badge);

        var stepsEl = h("div", {});
        aiDiv.appendChild(stepsEl);

        var body = h("div", { className: "body" });
        body.innerHTML = '<span style="color:#7df">Thinking...</span>';
        aiDiv.appendChild(body);

        convArea.appendChild(aiDiv);
        convArea.scrollTop = convArea.scrollHeight;

        var modelLabel =
          MODELS.find(function (m) {
            return m.id === selectedModel;
          }).label || "Auto";

        animateSteps(stepsEl, modelLabel, function () {
          /* determine endpoint */
          var endpoint =
            selectedModel === "auto"
              ? "/api/multi-search"
              : "/api/ai-brain";
          var payload = { query: query, model: selectedModel };

          /* include soul + memory in system prompt hint */
          payload.system = getSoul() + getMemoryContext();

          fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
            .then(function (r) {
              return r.json();
            })
            .then(function (data) {
              rain.stop();
              var text =
                data.answer ||
                data.response ||
                data.result ||
                data.text ||
                "No response received.";
              var provider =
                data.provider || data.model || modelLabel;
              var sources = data.sources || data.citations || [];
              var related = data.related || data.followUp || [];

              badge.textContent = provider;

              /* add collapsible toggle for steps */
              var toggle = h("div", { className: "sos-steps-toggle" });
              var stepsVisible = true;
              toggle.textContent = "▾ Research steps";
              toggle.onclick = function () {
                stepsVisible = !stepsVisible;
                stepsEl.style.display = stepsVisible ? "block" : "none";
                toggle.textContent =
                  (stepsVisible ? "▾ " : "▸ ") + "Research steps";
              };
              aiDiv.insertBefore(toggle, stepsEl);

              /* render body with streaming */
              var rendered = renderMarkdown(text);
              streamWords(body, rendered, function () {
                /* sources */
                if (sources.length) {
                  var srcRow = h("div", { className: "sos-sources" });
                  sources.forEach(function (s) {
                    var url = typeof s === "string" ? s : s.url || "";
                    var stitle = typeof s === "string" ? s : s.title || "";
                    var domain = "";
                    try {
                      domain = new URL(url).hostname;
                    } catch (e) {
                      domain = url;
                    }
                    var card = h("div", { className: "sos-src-card" });
                    card.innerHTML =
                      '<img src="https://www.google.com/s2/favicons?sz=16&domain=' +
                      encodeURIComponent(domain) +
                      '" alt="">' +
                      '<span class="stitle">' +
                      esc(stitle || domain) +
                      "</span>";
                    card.title = url;
                    card.onclick = function () {
                      if (url) window.open(url, "_blank");
                    };
                    srcRow.appendChild(card);
                  });
                  aiDiv.appendChild(srcRow);
                }

                /* related questions */
                if (related.length) {
                  var relRow = h("div", { className: "sos-related" });
                  related.forEach(function (q) {
                    var btn = h("button", {});
                    btn.textContent = typeof q === "string" ? q : q.text || q.question || "";
                    btn.onclick = function () {
                      textarea.value = btn.textContent;
                      doSend();
                    };
                    relRow.appendChild(btn);
                  });
                  aiDiv.appendChild(relRow);
                }

                convArea.scrollTop = convArea.scrollHeight;
              });

              conversation.push({
                role: "ai",
                content: text,
                provider: provider,
              });
            })
            .catch(function (err) {
              rain.stop();
              badge.textContent = "Error";
              body.innerHTML =
                '<span style="color:#f66">' +
                esc("Request failed: " + err.message) +
                "</span><br>" +
                '<span style="color:#888;font-size:11px">Check that /api/ai-brain or /api/multi-search is reachable.</span>';
              convArea.scrollTop = convArea.scrollHeight;
            });
        });
      }

      /* focus textarea */
      setTimeout(function () {
        textarea.focus();
      }, 100);
    },
  });
})();
