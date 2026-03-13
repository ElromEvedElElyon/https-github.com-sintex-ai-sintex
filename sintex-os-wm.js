/* SintexOS Window Manager — Drag, Resize, Snap Layouts */
(function () {
  let wid = 0;
  const S = SOS.state;

  SOS.on('initWM', () => {});
  SOS.on('openApp', id => openApp(id));

  function openApp(appId) {
    for (const [id, w] of S.wins) {
      if (w.appId === appId) { w.el.classList.remove('min'); focus(id); updateTB(); return }
    }
    const app = SOS.apps.find(a => a.id === appId); if (!app) return;
    const id = 'w' + (++wid);
    const el = SOS.h('div', { className: 'win', id });
    const mob = S.isMob;
    if (mob) {
      el.style.cssText = 'top:0;left:0;width:100vw;height:calc(100vh - var(--tb-h))';
    } else {
      const off = (S.wins.size % 5) * 24;
      const w = Math.min(app.w || 800, innerWidth - 60);
      const ht = Math.min(app.h || 520, innerHeight - 90);
      const x = Math.max(30, (innerWidth - w) / 2 + off);
      const y = Math.max(10, (innerHeight - ht - 48) / 2 + off);
      el.style.cssText = `width:${w}px;height:${ht}px;transform:translate(${x}px,${y}px)`;
    }

    el.innerHTML = `
      <div class="win-title">
        <div class="win-title-icon">${app.icon}</div>
        <div class="win-title-text">${app.name}</div>
        <div class="win-ctrls">
          <button class="win-ctrl-btn min-btn" title="Minimize"><svg width="12" height="12" viewBox="0 0 12 12"><line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" stroke-width="1.5"/></svg></button>
          <button class="win-ctrl-btn max-btn" title="Maximize"><svg width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/></svg></button>
          <button class="win-ctrl-btn close" title="Close"><svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>
        </div>
      </div>
      <div class="win-body"></div>
      <div class="win-resize"></div>`;

    const body = el.querySelector('.win-body');
    if (app.render) {
      const content = app.render();
      if (content) body.appendChild(content);
    }

    el.querySelector('.min-btn').onclick = e => { e.stopPropagation(); el.classList.add('min'); updateTB() };
    el.querySelector('.max-btn').onclick = e => { e.stopPropagation(); toggleMax(el) };
    el.querySelector('.close').onclick = e => { e.stopPropagation(); closeWin(id) };
    el.querySelector('.win-title').ondblclick = () => toggleMax(el);

    // Snap layout menu on hover over max button
    const maxBtn = el.querySelector('.max-btn');
    let snapTimer;
    maxBtn.onmouseenter = () => { snapTimer = setTimeout(() => showSnapMenu(el, maxBtn), 400) };
    maxBtn.onmouseleave = () => clearTimeout(snapTimer);

    el.onmousedown = () => focus(id);
    el.ontouchstart = () => focus(id);
    if (!mob) { initDrag(el, id); initResize(el) }
    SOS.$('#win-layer').appendChild(el);
    S.wins.set(id, { el, appId, icon: app.icon, name: app.name, cleanup: null });
    focus(id); updateTB();
  }

  function toggleMax(el) {
    if (el.classList.contains('snapped')) {
      el.classList.remove('snapped');
      el.removeAttribute('data-snap');
      if (el._preSnap) {
        el.style.cssText = el._preSnap;
        el._preSnap = null;
      }
    } else {
      el.classList.toggle('max');
    }
  }

  function closeWin(id) {
    const w = S.wins.get(id); if (!w) return;
    if (w.cleanup) w.cleanup();
    w.el.classList.add('closing');
    setTimeout(() => { w.el.remove(); S.wins.delete(id); if (S.focused === id) S.focused = null; updateTB(); }, 200);
  }

  function focus(id) {
    S.wins.forEach((w, k) => w.el.classList.toggle('focused', k === id));
    const w = S.wins.get(id);
    if (w) { w.el.style.zIndex = ++S.zi; S.focused = id }
    updateTB();
  }

  function updateTB() { SOS.emit('updateTB') }

  // ===== SNAP LAYOUTS MENU =====
  function showSnapMenu(winEl, anchor) {
    let menu = SOS.$('#snap-menu');
    if (!menu) {
      menu = SOS.h('div', { id: 'snap-menu', className: 'snap-menu' });
      document.body.appendChild(menu);
    }
    const layouts = [
      { label: '■', zones: [{ x: 0, y: 0, w: 100, h: 100 }] },
      { label: '◧', zones: [{ x: 0, y: 0, w: 50, h: 100 }] },
      { label: '◨', zones: [{ x: 50, y: 0, w: 50, h: 100 }] },
      { label: '◰', zones: [{ x: 0, y: 0, w: 50, h: 50 }] },
      { label: '◳', zones: [{ x: 50, y: 0, w: 50, h: 50 }] },
      { label: '◱', zones: [{ x: 0, y: 50, w: 50, h: 50 }] },
    ];
    menu.innerHTML = '';
    layouts.forEach(l => {
      const btn = SOS.h('button', { className: 'snap-opt' });
      // Visual preview
      const preview = SOS.h('div', { className: 'snap-preview' });
      l.zones.forEach(z => {
        const zone = SOS.h('div', { className: 'snap-zone-preview' });
        zone.style.cssText = `left:${z.x}%;top:${z.y}%;width:${z.w}%;height:${z.h}%`;
        preview.appendChild(zone);
      });
      btn.appendChild(preview);
      btn.onclick = () => { snapWindow(winEl, l.zones[0]); menu.classList.add('hidden') };
      menu.appendChild(btn);
    });
    const rect = anchor.getBoundingClientRect();
    menu.style.left = (rect.left - 100) + 'px';
    menu.style.top = (rect.bottom + 8) + 'px';
    menu.classList.remove('hidden');
    setTimeout(() => {
      const hide = e => { if (!menu.contains(e.target)) { menu.classList.add('hidden'); document.removeEventListener('click', hide) } };
      document.addEventListener('click', hide);
    }, 100);
  }

  function snapWindow(el, zone) {
    if (!el._preSnap) el._preSnap = el.style.cssText;
    const tbH = 48;
    const x = zone.x / 100 * innerWidth;
    const y = zone.y / 100 * (innerHeight - tbH);
    const w = zone.w / 100 * innerWidth;
    const h = zone.h / 100 * (innerHeight - tbH);
    el.style.cssText = `width:${w}px;height:${h}px;transform:translate(${x}px,${y}px);transition:all .3s var(--ease)`;
    el.classList.add('snapped');
    el.dataset.snap = `${zone.x},${zone.y},${zone.w},${zone.h}`;
    setTimeout(() => { el.style.transition = '' }, 350);
  }

  // ===== DRAG WITH SNAP DETECTION =====
  function initDrag(el, winId) {
    const bar = el.querySelector('.win-title');
    let drag = false, sx, sy, ox, oy;
    const getT = () => {
      const m = getComputedStyle(el).transform;
      if (m === 'none') return { x: 0, y: 0 };
      const v = m.match(/matrix.*\((.+)\)/);
      if (v) { const p = v[1].split(','); return { x: +p[4], y: +p[5] } }
      return { x: 0, y: 0 };
    };
    let snapZone = SOS.$('#snap-indicator');
    if (!snapZone) {
      snapZone = SOS.h('div', { id: 'snap-indicator', className: 'snap-indicator hidden' });
      document.body.appendChild(snapZone);
    }

    bar.onpointerdown = e => {
      if (e.target.closest('.win-ctrls') || el.classList.contains('max')) return;
      // Unsnap if snapped
      if (el.classList.contains('snapped')) {
        el.classList.remove('snapped');
        el.removeAttribute('data-snap');
        if (el._preSnap) { el.style.cssText = el._preSnap; el._preSnap = null }
      }
      drag = true; const p = getT(); ox = p.x; oy = p.y; sx = e.clientX; sy = e.clientY;
      el.style.willChange = 'transform';
      SOS.$$('iframe').forEach(f => f.style.pointerEvents = 'none');
      bar.setPointerCapture(e.pointerId);
    };

    bar.onpointermove = e => {
      if (!drag) return;
      const nx = ox + e.clientX - sx;
      const ny = oy + e.clientY - sy;
      el.style.transform = `translate(${nx}px,${ny}px)`;

      // Snap detection
      const tbH = 48;
      const snapMargin = 20;
      let zone = null;
      if (e.clientX < snapMargin) zone = { x: 0, y: 0, w: 50, h: 100 };
      else if (e.clientX > innerWidth - snapMargin) zone = { x: 50, y: 0, w: 50, h: 100 };
      else if (e.clientY < snapMargin) zone = { x: 0, y: 0, w: 100, h: 100 };
      // Corner snaps
      if (e.clientX < snapMargin && e.clientY < snapMargin) zone = { x: 0, y: 0, w: 50, h: 50 };
      if (e.clientX > innerWidth - snapMargin && e.clientY < snapMargin) zone = { x: 50, y: 0, w: 50, h: 50 };
      if (e.clientX < snapMargin && e.clientY > innerHeight - tbH - snapMargin) zone = { x: 0, y: 50, w: 50, h: 50 };
      if (e.clientX > innerWidth - snapMargin && e.clientY > innerHeight - tbH - snapMargin) zone = { x: 50, y: 50, w: 50, h: 50 };

      if (zone) {
        snapZone.style.cssText = `left:${zone.x}%;top:${zone.y}%;width:${zone.w}%;height:${zone.h / 100 * (innerHeight - tbH)}px`;
        snapZone.classList.remove('hidden');
        el._pendingSnap = zone;
      } else {
        snapZone.classList.add('hidden');
        el._pendingSnap = null;
      }
    };

    const stop = () => {
      drag = false; el.style.willChange = '';
      SOS.$$('iframe').forEach(f => f.style.pointerEvents = '');
      snapZone.classList.add('hidden');
      if (el._pendingSnap) {
        snapWindow(el, el._pendingSnap);
        el._pendingSnap = null;
      }
    };
    bar.onpointerup = stop;
    bar.onpointercancel = stop;
  }

  // ===== RESIZE =====
  function initResize(el) {
    const handle = el.querySelector('.win-resize');
    let rs = false, sx, sy, sw, sh;
    handle.onpointerdown = e => {
      if (el.classList.contains('max') || el.classList.contains('snapped')) return;
      rs = true; sx = e.clientX; sy = e.clientY; sw = el.offsetWidth; sh = el.offsetHeight;
      SOS.$$('iframe').forEach(f => f.style.pointerEvents = 'none');
      handle.setPointerCapture(e.pointerId); e.stopPropagation();
    };
    handle.onpointermove = e => {
      if (!rs) return;
      el.style.width = Math.max(360, sw + e.clientX - sx) + 'px';
      el.style.height = Math.max(240, sh + e.clientY - sy) + 'px';
    };
    const stop = () => { rs = false; SOS.$$('iframe').forEach(f => f.style.pointerEvents = '') };
    handle.onpointerup = stop;
    handle.onpointercancel = stop;
  }
})();
