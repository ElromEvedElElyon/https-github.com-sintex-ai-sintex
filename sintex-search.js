/**
 * Sintex.AI Search Engine — Perplexity-like AI Search
 * Open Source • BitNet 1.58-bit Powered
 *
 * Features:
 * - Streaming word-by-word response display
 * - Markdown → HTML with inline citations [1][2]
 * - Source cards with favicons
 * - Animated research steps
 * - Follow-up suggestion buttons
 * - Dark/Light theme toggle
 * - Conversation history
 * - OS taskbar clock
 */

(function () {
  'use strict';

  // === DOM REFS ===
  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => [...(p || document).querySelectorAll(s)];

  const emptyState = $('#empty-state');
  const conversationEl = $('#conversation');
  const searchInput = $('#search-input');
  const sendBtn = $('#send-btn');
  const stickyWrap = $('#sticky-input');
  const searchInputSticky = $('#search-input-sticky');
  const sendBtnSticky = $('#send-btn-sticky');
  const themeToggle = $('#theme-toggle');
  const osClock = $('#os-clock');

  let isSearching = false;

  // === THEME ===
  function initTheme() {
    const saved = localStorage.getItem('sintex-theme');
    if (saved === 'light') document.body.classList.add('light-theme');
    updateThemeIcons();
  }

  function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('sintex-theme', isLight ? 'light' : 'dark');
    updateThemeIcons();
  }

  function updateThemeIcons() {
    const isLight = document.body.classList.contains('light-theme');
    const dark = $('#theme-icon-dark');
    const light = $('#theme-icon-light');
    if (dark) dark.style.display = isLight ? 'none' : 'block';
    if (light) light.style.display = isLight ? 'block' : 'none';
  }

  // === CLOCK ===
  function updateClock() {
    if (!osClock) return;
    const now = new Date();
    osClock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // === TEXTAREA AUTO-EXPAND ===
  function autoExpand(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }

  function setupTextarea(input, btn) {
    if (!input || !btn) return;
    input.addEventListener('input', () => autoExpand(input));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        doSearch(input.value.trim());
      }
    });
    btn.addEventListener('click', () => doSearch(input.value.trim()));
  }

  // === SUGGESTION CHIPS ===
  function setupChips() {
    $$('.s-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.getAttribute('data-q');
        if (q) doSearch(q);
      });
    });
  }

  // === MARKDOWN RENDERER ===
  function renderMarkdown(text, sources) {
    if (!text) return '';
    let html = text;

    // Code blocks (``` ... ```)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre><code class="${lang}">${escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    // Unordered lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Citation references [1], [2] etc
    if (sources && sources.length) {
      html = html.replace(/\[(\d+)\]/g, (match, num) => {
        const idx = parseInt(num) - 1;
        if (idx >= 0 && idx < sources.length) {
          return `<a class="s-cite" href="${escapeHtml(sources[idx].url)}" target="_blank" title="${escapeHtml(sources[idx].title)}">${num}</a>`;
        }
        return match;
      });
    }

    // Paragraphs — wrap loose lines
    html = html.split('\n\n').map(block => {
      block = block.trim();
      if (!block) return '';
      if (/^<(h[1-3]|ul|ol|pre|blockquote|li|table)/.test(block)) return block;
      if (!/^</.test(block)) return `<p>${block}</p>`;
      return block;
    }).join('\n');

    // Clean up single newlines within paragraphs
    html = html.replace(/([^>\n])\n([^<\n])/g, '$1<br>$2');

    return html;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // === SOURCE CARDS ===
  function renderSources(sources) {
    if (!sources || !sources.length) return '';
    const cards = sources.map((s, i) => {
      const domain = getDomain(s.url);
      const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
      return `<a class="s-source-card s-fadein" href="${escapeHtml(s.url)}" target="_blank" rel="noopener" style="animation-delay:${i * 0.05}s">
        <div class="s-source-favicon">
          <span class="s-source-num">${i + 1}</span>
          <img src="${favicon}" alt="" loading="lazy" onerror="this.style.display='none'">
          <span class="s-source-domain">${escapeHtml(domain)}</span>
        </div>
        <div class="s-source-title">${escapeHtml(s.title)}</div>
      </a>`;
    }).join('');

    return `<div class="s-sources s-fadein">
      <div class="s-sources-label">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        Sources
      </div>
      <div class="s-sources-grid">${cards}</div>
    </div>`;
  }

  function getDomain(url) {
    try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
  }

  // === RESEARCH STEPS ===
  function createResearchSteps() {
    const steps = [
      { phase: 'searching', text: 'Searching knowledge base...' },
      { phase: 'reading', text: 'Reading and analyzing sources...' },
      { phase: 'done', text: 'Generating response with BitNet 1.58-bit...' }
    ];
    return steps;
  }

  function renderStep(step, active) {
    const iconSvgs = {
      searching: '<svg class="s-spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>',
      reading: '<svg class="s-spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>',
      done: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>'
    };

    const iconClass = active ? step.phase : 'done';
    return `<div class="s-step s-fadein">
      <div class="s-step-icon ${iconClass}">${active ? iconSvgs[step.phase] : iconSvgs.done}</div>
      <div class="s-step-text">${step.text}</div>
    </div>`;
  }

  // === FOLLOW-UPS ===
  function renderFollowUps(related) {
    if (!related || !related.length) return '';
    const btns = related.map(q => {
      return `<button class="s-followup-btn" data-q="${escapeHtml(q)}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        ${escapeHtml(q)}
      </button>`;
    }).join('');
    return `<div class="s-followups s-fadein">${btns}</div>`;
  }

  // === STREAMING DISPLAY ===
  async function streamText(element, html) {
    // Parse into tokens preserving HTML tags
    const tokens = [];
    let i = 0;
    while (i < html.length) {
      if (html[i] === '<') {
        const end = html.indexOf('>', i);
        if (end !== -1) {
          tokens.push(html.substring(i, end + 1));
          i = end + 1;
          continue;
        }
      }
      // Collect word or whitespace
      let word = '';
      while (i < html.length && html[i] !== '<' && html[i] !== ' ') {
        word += html[i++];
      }
      if (word) tokens.push(word);
      if (i < html.length && html[i] === ' ') {
        tokens.push(' ');
        i++;
      }
    }

    element.classList.add('s-cursor');
    let accumulated = '';
    const batchSize = 3;
    for (let t = 0; t < tokens.length; t += batchSize) {
      const batch = tokens.slice(t, t + batchSize).join('');
      accumulated += batch;
      element.innerHTML = accumulated;
      if (!batch.startsWith('<')) {
        await sleep(20 + Math.random() * 15);
      }
    }
    element.classList.remove('s-cursor');
    element.innerHTML = accumulated;
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // === MAIN SEARCH ===
  async function doSearch(query) {
    if (!query || isSearching) return;
    isSearching = true;

    // Transition to conversation mode
    if (emptyState) emptyState.style.display = 'none';
    if (conversationEl) conversationEl.style.display = 'block';
    if (stickyWrap) stickyWrap.style.display = 'block';

    // Clear inputs
    [searchInput, searchInputSticky].forEach(el => {
      if (el) { el.value = ''; autoExpand(el); }
    });

    // Disable send buttons
    setSending(true);

    // Create message block
    const msgEl = document.createElement('div');
    msgEl.className = 's-message s-fadein';
    msgEl.innerHTML = `<div class="s-query">${escapeHtml(query)}</div>`;
    conversationEl.appendChild(msgEl);

    // Scroll to message
    msgEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Research steps container
    const researchEl = document.createElement('div');
    researchEl.className = 's-research';
    msgEl.appendChild(researchEl);

    // Animate research steps
    const steps = createResearchSteps();

    // Step 1: Searching
    researchEl.innerHTML = renderStep(steps[0], true);
    await sleep(600);

    // Step 2: Reading
    researchEl.innerHTML = renderStep(steps[0], false) + renderStep(steps[1], true);
    await sleep(800);

    // Actually search
    let result;
    try {
      result = await BitNetClient.search(query);
    } catch (e) {
      console.error('Search error:', e);
      result = {
        answer: `I encountered an error while searching. Please try again.\n\n**Error:** ${e.message || 'Unknown error'}`,
        sources: [],
        related: ['What is BitNet?', 'How does Sintex.AI work?']
      };
    }

    // Step 3: Done
    researchEl.innerHTML = renderStep(steps[0], false) + renderStep(steps[1], false) + renderStep(steps[2], false);

    // Render sources
    const sources = result.sources || [];
    if (sources.length) {
      const sourcesHTML = renderSources(sources);
      const sourcesEl = document.createElement('div');
      sourcesEl.innerHTML = sourcesHTML;
      msgEl.appendChild(sourcesEl.firstElementChild);
    }

    // Render answer with streaming
    const answerEl = document.createElement('div');
    answerEl.className = 's-answer';
    msgEl.appendChild(answerEl);

    const answerHTML = renderMarkdown(result.answer || '', sources);
    await streamText(answerEl, answerHTML);

    // Render follow-ups
    const related = result.related || [];
    if (related.length) {
      const fuEl = document.createElement('div');
      fuEl.innerHTML = renderFollowUps(related);
      const fuContainer = fuEl.firstElementChild;
      msgEl.appendChild(fuContainer);

      // Add click handlers to follow-up buttons
      $$('.s-followup-btn', fuContainer).forEach(btn => {
        btn.addEventListener('click', () => {
          const q = btn.getAttribute('data-q');
          if (q) doSearch(q);
        });
      });
    }

    // Save to history
    saveToHistory(query, result);

    isSearching = false;
    setSending(false);

    // Focus sticky input
    if (searchInputSticky) searchInputSticky.focus();
  }

  function setSending(sending) {
    [sendBtn, sendBtnSticky].forEach(btn => {
      if (btn) btn.disabled = sending;
    });
  }

  // === HISTORY ===
  function saveToHistory(query, result) {
    try {
      const history = JSON.parse(localStorage.getItem('sintex-history') || '[]');
      history.push({
        query,
        answer: (result.answer || '').substring(0, 200),
        time: Date.now()
      });
      // Keep last 50
      if (history.length > 50) history.splice(0, history.length - 50);
      localStorage.setItem('sintex-history', JSON.stringify(history));
    } catch (e) { /* ignore */ }
  }

  // === URL PARAMS ===
  function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      doSearch(q.trim());
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  // === GO HOME ===
  window.goHome = function () {
    if (conversationEl) conversationEl.style.display = 'none';
    if (emptyState) emptyState.style.display = 'flex';
    if (stickyWrap) stickyWrap.style.display = 'none';
    if (searchInput) searchInput.focus();
  };

  // === INIT ===
  function init() {
    initTheme();
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    setupTextarea(searchInput, sendBtn);
    setupTextarea(searchInputSticky, sendBtnSticky);
    setupChips();

    updateClock();
    setInterval(updateClock, 30000);

    checkUrlParams();

    // Focus search input
    if (searchInput && !new URLSearchParams(window.location.search).get('q')) {
      searchInput.focus();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
