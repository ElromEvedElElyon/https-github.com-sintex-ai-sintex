(function () {
  "use strict";

  var h = SOS.h;
  var esc = SOS.esc;
  var ICO = SOS.ICO;

  var MAX_TABS = 8;
  var BM_KEY = "sos-browser-bookmarks";
  var DEFAULT_BOOKMARKS = [
    { title: "Sintex.AI", url: "https://sintex.ai" },
    { title: "GitHub", url: "https://github.com" },
    { title: "Google", url: "https://google.com" },
  ];

  var SPEED_DIAL = [
    { title: "Sintex.AI", url: "https://sintex.ai", color: "#7df" },
    { title: "Standard Bitcoin", url: "https://standardbitcoin.io", color: "#f7931a" },
    { title: "GitHub", url: "https://github.com", color: "#f0f6fc" },
    { title: "Google", url: "https://google.com", color: "#4285f4" },
    { title: "ChatGPT", url: "https://chat.openai.com", color: "#10a37f" },
    { title: "BitNet Research", url: "https://sintex.ai/bitnet-research.html", color: "#0f0" },
  ];

  var nextTabId = 1;

  SOS.registerApp({
    id: "browser",
    name: "Sintex Browser",
    icon: ICO.browser || "🌐",
    pin: true,
    w: 960,
    h: 640,
    color: "#111118",

    render: function (win) {
      /* ---- state ---- */
      var tabs = [];
      var activeIdx = 0;
      var bookmarks = SOS.load(BM_KEY) || DEFAULT_BOOKMARKS;

      /* ---- styles ---- */
      var style = document.createElement("style");
      style.textContent = [
        ".sos-brow{display:flex;flex-direction:column;height:100%;font-family:system-ui,sans-serif;color:#ddd;background:#111118;overflow:hidden}",
        ".sos-brow *{box-sizing:border-box}",
        /* tab bar */
        ".sos-tabs{display:flex;align-items:flex-end;background:#0a0a14;padding:0 4px;height:36px;gap:1px;overflow-x:auto;flex-shrink:0}",
        ".sos-tabs::-webkit-scrollbar{height:2px}",
        ".sos-tabs::-webkit-scrollbar-thumb{background:#333}",
        ".sos-tab{display:flex;align-items:center;gap:4px;height:30px;padding:0 10px;background:#181828;border-radius:8px 8px 0 0;font-size:12px;cursor:pointer;max-width:180px;min-width:60px;position:relative;user-select:none;transition:background .12s;flex-shrink:0}",
        ".sos-tab:hover{background:#222240}",
        ".sos-tab.active{background:#1a1a32;border-bottom:2px solid #7df}",
        ".sos-tab .ttl{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#bbb}",
        ".sos-tab.active .ttl{color:#eee}",
        ".sos-tab .cls{width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;color:#888;cursor:pointer;flex-shrink:0}",
        ".sos-tab .cls:hover{background:#444;color:#fff}",
        ".sos-tab-add{width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:transparent;border:none;color:#888;font-size:18px;cursor:pointer;border-radius:6px;margin-left:2px;flex-shrink:0}",
        ".sos-tab-add:hover{background:#222;color:#ccc}",
        /* toolbar */
        ".sos-toolbar{display:flex;align-items:center;gap:4px;padding:4px 8px;background:#131324;border-bottom:1px solid #222;flex-shrink:0}",
        ".sos-toolbar button{width:28px;height:28px;border:none;background:transparent;color:#999;border-radius:5px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center}",
        ".sos-toolbar button:hover:not(:disabled){background:#222;color:#ddd}",
        ".sos-toolbar button:disabled{opacity:.35;cursor:default}",
        ".sos-addr{flex:1;background:#0d0d1e;border:1px solid #333;border-radius:16px;padding:4px 12px;color:#ccc;font-size:12px;font-family:inherit;outline:none}",
        ".sos-addr:focus{border-color:#7df}",
        ".sos-star{font-size:16px !important}",
        ".sos-star.bookmarked{color:#f7d14c !important}",
        /* bookmark bar */
        ".sos-bm-bar{display:flex;align-items:center;gap:2px;padding:2px 8px;background:#0e0e22;border-bottom:1px solid #1a1a30;flex-shrink:0;overflow-x:auto;min-height:24px}",
        ".sos-bm-bar::-webkit-scrollbar{height:2px}",
        ".sos-bm-bar::-webkit-scrollbar-thumb{background:#333}",
        ".sos-bm-item{padding:3px 8px;font-size:11px;color:#99a;border-radius:4px;cursor:pointer;white-space:nowrap;flex-shrink:0}",
        ".sos-bm-item:hover{background:#1e1e3a;color:#cce}",
        /* content */
        ".sos-content{flex:1;position:relative;overflow:hidden}",
        ".sos-content iframe{width:100%;height:100%;border:none;background:#fff}",
        /* new tab page */
        ".sos-ntp{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:#0d0d1a;padding:40px}",
        ".sos-ntp h2{color:#7df;font-size:18px;margin-bottom:24px;font-weight:400}",
        ".sos-ntp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;max-width:420px;width:100%}",
        ".sos-ntp-card{display:flex;flex-direction:column;align-items:center;gap:8px;padding:18px 12px;background:#161630;border-radius:10px;cursor:pointer;border:1px solid #222;transition:border-color .15s,transform .15s}",
        ".sos-ntp-card:hover{border-color:#7df;transform:translateY(-2px)}",
        ".sos-ntp-card .ico{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#000}",
        ".sos-ntp-card .nm{font-size:12px;color:#aab;text-align:center}",
      ].join("\n");
      win.appendChild(style);

      var root = h("div", { className: "sos-brow" });
      win.appendChild(root);

      /* ============ TAB BAR ============ */
      var tabBar = h("div", { className: "sos-tabs" });
      root.appendChild(tabBar);

      var addTabBtn = h("button", { className: "sos-tab-add", title: "New tab" });
      addTabBtn.textContent = "+";
      addTabBtn.onclick = function () {
        addTab();
      };

      /* ============ TOOLBAR ============ */
      var toolbar = h("div", { className: "sos-toolbar" });
      root.appendChild(toolbar);

      var backBtn = h("button", { title: "Back" });
      backBtn.textContent = "◀";
      backBtn.onclick = function () {
        goBack();
      };
      toolbar.appendChild(backBtn);

      var fwdBtn = h("button", { title: "Forward" });
      fwdBtn.textContent = "▶";
      fwdBtn.onclick = function () {
        goForward();
      };
      toolbar.appendChild(fwdBtn);

      var reloadBtn = h("button", { title: "Reload" });
      reloadBtn.textContent = "⟳";
      reloadBtn.onclick = function () {
        doReload();
      };
      toolbar.appendChild(reloadBtn);

      var addrInput = h("input", {
        className: "sos-addr",
        placeholder: "Enter URL or search...",
      });
      addrInput.onkeydown = function (e) {
        if (e.key === "Enter") {
          var val = addrInput.value.trim();
          if (val) navigate(normalizeUrl(val));
        }
      };
      toolbar.appendChild(addrInput);

      var starBtn = h("button", { className: "sos-star", title: "Bookmark" });
      starBtn.textContent = "☆";
      starBtn.onclick = function () {
        toggleBookmark();
      };
      toolbar.appendChild(starBtn);

      var menuBtn = h("button", { title: "Menu" });
      menuBtn.textContent = "⋯";
      toolbar.appendChild(menuBtn);

      /* ============ BOOKMARK BAR ============ */
      var bmBar = h("div", { className: "sos-bm-bar" });
      root.appendChild(bmBar);

      function renderBookmarks() {
        bmBar.innerHTML = "";
        bookmarks.forEach(function (bm) {
          var item = h("span", { className: "sos-bm-item" });
          item.textContent = bm.title;
          item.title = bm.url;
          item.onclick = function () {
            navigate(bm.url);
          };
          bmBar.appendChild(item);
        });
      }
      renderBookmarks();

      /* ============ CONTENT AREA ============ */
      var contentArea = h("div", { className: "sos-content" });
      root.appendChild(contentArea);

      /* ============ URL HELPERS ============ */
      function normalizeUrl(input) {
        if (/^https?:\/\//i.test(input)) return input;
        if (/^[a-z0-9-]+\.[a-z]{2,}/i.test(input)) return "https://" + input;
        return "https://www.google.com/search?igu=1&q=" + encodeURIComponent(input);
      }

      function domainOf(url) {
        try {
          return new URL(url).hostname;
        } catch (e) {
          return url;
        }
      }

      /* ============ TAB MANAGEMENT ============ */
      function createTabState(url) {
        var id = nextTabId++;
        return {
          id: id,
          title: url ? domainOf(url) : "New Tab",
          url: url || "",
          history: url ? [url] : [],
          historyIdx: url ? 0 : -1,
        };
      }

      function addTab(url) {
        if (tabs.length >= MAX_TABS) return;
        var tab = createTabState(url || "");
        tabs.push(tab);
        activeIdx = tabs.length - 1;
        renderTabs();
        showTab(activeIdx);
      }

      function closeTab(id) {
        var idx = tabs.findIndex(function (t) {
          return t.id === id;
        });
        if (idx < 0) return;
        tabs.splice(idx, 1);
        if (tabs.length === 0) {
          addTab();
          return;
        }
        if (activeIdx >= tabs.length) activeIdx = tabs.length - 1;
        else if (activeIdx > idx) activeIdx--;
        renderTabs();
        showTab(activeIdx);
      }

      function selectTab(idx) {
        activeIdx = idx;
        renderTabs();
        showTab(idx);
      }

      function renderTabs() {
        tabBar.innerHTML = "";
        tabs.forEach(function (tab, idx) {
          var el = h("div", { className: "sos-tab" + (idx === activeIdx ? " active" : "") });

          var ttl = h("span", { className: "ttl" });
          ttl.textContent = tab.title || "New Tab";
          el.appendChild(ttl);

          var cls = h("span", { className: "cls" });
          cls.textContent = "×";
          cls.onclick = function (e) {
            e.stopPropagation();
            closeTab(tab.id);
          };
          el.appendChild(cls);

          el.onclick = function () {
            selectTab(idx);
          };

          tabBar.appendChild(el);
        });
        tabBar.appendChild(addTabBtn);
      }

      /* ============ CONTENT DISPLAY ============ */
      function showTab(idx) {
        var tab = tabs[idx];
        if (!tab) return;
        contentArea.innerHTML = "";
        addrInput.value = tab.url;
        updateNavButtons();
        updateStarBtn();

        if (!tab.url || tab.url === "about:newtab") {
          showNewTabPage();
        } else {
          showIframe(tab.url);
        }
      }

      function showIframe(url) {
        var iframe = h("iframe", {
          src: url,
          sandbox: "allow-scripts allow-same-origin allow-forms allow-popups",
        });
        iframe.onload = function () {
          try {
            var t = iframe.contentDocument.title;
            if (t) {
              tabs[activeIdx].title = t;
              renderTabs();
            }
          } catch (e) {
            /* cross-origin, ignore */
          }
        };
        contentArea.appendChild(iframe);
      }

      function showNewTabPage() {
        var ntp = h("div", { className: "sos-ntp" });

        var heading = h("h2", {});
        heading.textContent = "Sintex Browser";
        ntp.appendChild(heading);

        var grid = h("div", { className: "sos-ntp-grid" });
        SPEED_DIAL.forEach(function (item) {
          var card = h("div", { className: "sos-ntp-card" });
          var ico = h("div", { className: "ico" });
          ico.style.background = item.color;
          ico.textContent = item.title.charAt(0).toUpperCase();
          card.appendChild(ico);

          var nm = h("div", { className: "nm" });
          nm.textContent = item.title;
          card.appendChild(nm);

          card.onclick = function () {
            navigate(item.url);
          };
          grid.appendChild(card);
        });
        ntp.appendChild(grid);
        contentArea.appendChild(ntp);
      }

      /* ============ NAVIGATION ============ */
      function navigate(url) {
        var tab = tabs[activeIdx];
        if (!tab) return;

        tab.url = url;
        tab.title = domainOf(url);

        /* trim forward history */
        if (tab.historyIdx < tab.history.length - 1) {
          tab.history = tab.history.slice(0, tab.historyIdx + 1);
        }
        tab.history.push(url);
        tab.historyIdx = tab.history.length - 1;

        addrInput.value = url;
        updateNavButtons();
        updateStarBtn();
        renderTabs();

        contentArea.innerHTML = "";
        showIframe(url);
      }

      function goBack() {
        var tab = tabs[activeIdx];
        if (!tab || tab.historyIdx <= 0) return;
        tab.historyIdx--;
        var url = tab.history[tab.historyIdx];
        tab.url = url;
        tab.title = domainOf(url);
        addrInput.value = url;
        updateNavButtons();
        updateStarBtn();
        renderTabs();
        contentArea.innerHTML = "";
        showIframe(url);
      }

      function goForward() {
        var tab = tabs[activeIdx];
        if (!tab || tab.historyIdx >= tab.history.length - 1) return;
        tab.historyIdx++;
        var url = tab.history[tab.historyIdx];
        tab.url = url;
        tab.title = domainOf(url);
        addrInput.value = url;
        updateNavButtons();
        updateStarBtn();
        renderTabs();
        contentArea.innerHTML = "";
        showIframe(url);
      }

      function doReload() {
        var tab = tabs[activeIdx];
        if (!tab || !tab.url || tab.url === "about:newtab") return;
        contentArea.innerHTML = "";
        showIframe(tab.url);
      }

      function updateNavButtons() {
        var tab = tabs[activeIdx];
        backBtn.disabled = !tab || tab.historyIdx <= 0;
        fwdBtn.disabled = !tab || tab.historyIdx >= tab.history.length - 1;
      }

      /* ============ BOOKMARKS ============ */
      function isBookmarked(url) {
        return bookmarks.some(function (b) {
          return b.url === url;
        });
      }

      function updateStarBtn() {
        var tab = tabs[activeIdx];
        var url = tab ? tab.url : "";
        if (url && isBookmarked(url)) {
          starBtn.textContent = "★";
          starBtn.classList.add("bookmarked");
        } else {
          starBtn.textContent = "☆";
          starBtn.classList.remove("bookmarked");
        }
      }

      function toggleBookmark() {
        var tab = tabs[activeIdx];
        if (!tab || !tab.url || tab.url === "about:newtab") return;

        var idx = bookmarks.findIndex(function (b) {
          return b.url === tab.url;
        });
        if (idx >= 0) {
          bookmarks.splice(idx, 1);
        } else {
          bookmarks.push({ title: tab.title, url: tab.url });
        }
        SOS.save(BM_KEY, bookmarks);
        updateStarBtn();
        renderBookmarks();
      }

      /* ============ INIT ============ */
      addTab();
    },
  });
})();
