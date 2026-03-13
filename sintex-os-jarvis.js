/* SintexOS JARVIS — Cinema-Grade Holographic HUD v2.0
   Inspired by Prologue Films / Cantina Creative (Iron Man 1-3, Avengers)
   Color system: Warm amber/gold + cool white data + subtle cyan accents
   Design: Depth layers, organic motion, volumetric light, film grain */
(function () {
  'use strict';

  // ═══════════════════ COLOR PALETTE (Film-Accurate) ═══════════════════
  const C = {
    gold:    [212, 168, 68],   // #D4A844 — Arc reactor warmth
    amber:   [255, 196, 90],   // #FFC45A — Holographic warm
    white:   [224, 240, 255],  // #E0F0FF — Primary data (cool white)
    cyan:    [0, 212, 255],    // #00D4FF — Accent highlights only
    green:   [0, 255, 136],    // #00FF88 — Status OK
    red:     [255, 80, 80],    // #FF5050 — Warning
    dimGold: [139, 105, 20],   // #8B6914 — Depth gold
  };
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  // ═══════════════════ GOOGLE FONTS ═══════════════════
  if (!document.querySelector('link[href*="Orbitron"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Exo+2:wght@200;300;400;500&display=swap';
    document.head.appendChild(link);
  }

  // ═══════════════════ CSS INJECTION ═══════════════════
  const css = document.createElement('style');
  css.id = 'jarvis-hud-css';
  css.textContent = `
/* ═══ BOOT ═══ */
#boot{background:radial-gradient(ellipse at 50% 40%,#0a0f1a 0%,#040608 70%,#000 100%) !important}
#boot-center{gap:16px !important}
.jv-arc-wrap{position:relative;width:220px;height:220px}
.jv-arc-wrap canvas{width:220px;height:220px}
.jv-diag{position:absolute;bottom:32px;left:50%;transform:translateX(-50%);width:440px;max-width:92vw;
  font-family:'Exo 2','Inter',sans-serif;font-size:11px;color:${rgba(C.white,.55)};text-align:left;
  letter-spacing:1.5px;text-transform:uppercase}
.jv-diag-line{opacity:0;animation:jvReveal .4s cubic-bezier(.16,1,.3,1) forwards;margin-bottom:4px;
  white-space:nowrap;overflow:hidden;font-weight:300}
.jv-diag-line .ok{color:${rgba(C.green,.8)}}
.jv-diag-line .warn{color:${rgba(C.amber,.8)}}
.jv-diag-bar{height:1px;background:${rgba(C.gold,.08)};border-radius:1px;margin:8px 0;overflow:hidden}
.jv-diag-bar-fill{height:100%;border-radius:1px;width:0;
  background:linear-gradient(90deg,${rgba(C.gold,.6)},${rgba(C.amber,.4)},${rgba(C.cyan,.3)});
  animation:jvFill 1.4s cubic-bezier(.16,1,.3,1) forwards}
.jv-greeting{font-family:'Orbitron',sans-serif;font-size:18px;font-weight:400;letter-spacing:6px;
  text-transform:uppercase;text-align:center;margin-top:16px;
  color:${rgba(C.white,.75)};text-shadow:0 0 30px ${rgba(C.gold,.25)},0 0 80px ${rgba(C.gold,.08)};
  opacity:0;animation:jvFadeIn 1s ease 3.8s forwards}
@keyframes jvReveal{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
@keyframes jvFill{from{width:0}to{width:100%}}
@keyframes jvFadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}

/* ═══ FILM GRAIN OVERLAY ═══ */
#jv-grain{position:fixed;inset:0;z-index:9999;pointer-events:none;opacity:.025;
  mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size:128px 128px}

/* ═══ HUD OVERLAY ═══ */
#jv-hud{position:fixed;inset:0;z-index:2;pointer-events:none}
#jv-hud canvas{width:100%;height:100%}

/* ═══ WINDOW GLOW (Warm) ═══ */
.win.focused{
  box-shadow:
    0 0 1px ${rgba(C.gold,.2)},
    0 0 12px ${rgba(C.gold,.04)},
    0 8px 32px rgba(0,0,0,.45),
    0 2px 8px rgba(0,0,0,.3) !important;
  border-color:${rgba(C.gold,.12)} !important;
}
.win.focused .win-title{
  background:linear-gradient(180deg,${rgba(C.gold,.03)} 0%,transparent 100%) !important;
}
.win.focused .win-title-text{color:${rgba(C.white,.7)} !important}

/* ═══ TASKBAR ═══ */
#taskbar{
  background:rgba(6,8,14,.94) !important;
  border-top:1px solid ${rgba(C.gold,.06)} !important;
  box-shadow:0 -1px 20px ${rgba(C.gold,.02)};
}
.tb-btn.active::after{background:${rgba(C.gold,.7)} !important;box-shadow:0 0 6px ${rgba(C.gold,.4)}}
.tb-start:hover svg{filter:drop-shadow(0 0 4px ${rgba(C.gold,.3)})}
#tb-clock{color:${rgba(C.white,.5)} !important;font-family:'Exo 2',sans-serif !important;
  letter-spacing:1px !important;font-weight:300 !important}

/* ═══ LOCK SCREEN ═══ */
#lock-bg{
  background:radial-gradient(ellipse at 50% 35%,#0c1220 0%,#060a14 50%,#020408 100%) !important;
}
#lock-time{
  color:${rgba(C.white,.8)} !important;font-family:'Orbitron',sans-serif !important;
  font-weight:300 !important;letter-spacing:6px !important;
  text-shadow:0 0 40px ${rgba(C.gold,.2)},0 0 100px ${rgba(C.gold,.06)} !important;
}
#lock-date{color:${rgba(C.white,.3)} !important;font-family:'Exo 2',sans-serif !important;
  letter-spacing:2px !important;font-weight:300 !important;text-transform:uppercase !important}
#lock-hint{color:${rgba(C.white,.15)} !important;font-family:'Exo 2',sans-serif !important;
  letter-spacing:1.5px !important;text-transform:uppercase !important}

/* ═══ START MENU ═══ */
#start{
  background:rgba(6,8,14,.96) !important;
  border:1px solid ${rgba(C.gold,.06)} !important;
  box-shadow:0 0 40px ${rgba(C.gold,.03)},0 24px 80px rgba(0,0,0,.5) !important;
}
#start-search:focus{border-color:${rgba(C.gold,.25)} !important;
  box-shadow:0 0 10px ${rgba(C.gold,.06)}}

/* ═══ CONTEXT MENU ═══ */
#ctx{background:rgba(6,8,14,.96) !important;border:1px solid ${rgba(C.gold,.06)} !important}

/* ═══ TOAST / NOTIFICATION ═══ */
#toast{
  background:rgba(6,8,14,.96) !important;
  border:1px solid ${rgba(C.gold,.1)} !important;
  color:${rgba(C.white,.7)} !important;
  box-shadow:0 0 20px ${rgba(C.gold,.04)},0 8px 32px rgba(0,0,0,.4) !important;
  font-family:'Exo 2',sans-serif !important;letter-spacing:1px !important;
}

/* ═══ COPILOT SIDEBAR ═══ */
#copilot{background:rgba(6,8,14,.96) !important;border-left:1px solid ${rgba(C.gold,.06)} !important}

/* ═══ VIGNETTE ═══ */
#jv-vignette{position:fixed;inset:0;z-index:1;pointer-events:none;
  background:radial-gradient(ellipse at 50% 50%,transparent 55%,rgba(0,0,0,.35) 100%)}
  `;
  document.head.appendChild(css);

  // ═══════════════════ BOOT OVERRIDE ═══════════════════
  const origBoot = SOS.boot;
  SOS.boot = function () {
    const bootEl = SOS.$('#boot');
    const center = SOS.$('#boot-center');
    const fxCanvas = SOS.$('#boot-fx');
    center.innerHTML = '';
    fxCanvas.style.opacity = '1';

    // Arc Reactor Canvas
    const arcWrap = SOS.h('div', { className: 'jv-arc-wrap' });
    const arc = document.createElement('canvas');
    arc.width = 440; arc.height = 440;
    arc.style.cssText = 'width:220px;height:220px';
    arcWrap.appendChild(arc);
    center.appendChild(arcWrap);

    // Diagnostics
    const diag = SOS.h('div', { className: 'jv-diag' });
    center.appendChild(diag);

    // Background FX
    const bgCtx = fxCanvas.getContext('2d');
    fxCanvas.width = innerWidth; fxCanvas.height = innerHeight;

    const actx = arc.getContext('2d');
    const acx = 220, acy = 220;
    let t = 0;

    // Diagnostic lines (character-by-character reveal)
    const diagLines = [
      { delay: 300, text: 'INITIALIZING JARVIS CORE v4.6.0', status: '' },
      { delay: 700, text: 'NEURAL PROCESSING UNIT', status: 'ok', label: 'ONLINE' },
      { delay: 1100, text: 'BITNET 1.58-BIT TERNARY ENGINE', status: 'ok', label: 'LOADED' },
      { delay: 1500, text: 'MULTI-AI MATRIX: DEEPSEEK + GROQ + GEMINI', status: 'ok', label: '7 ACTIVE' },
      { delay: 1900, text: 'SOVEREIGN AGENT PROTOCOL', status: 'ok', label: 'STANDING BY' },
      { delay: 2300, text: 'ENCRYPTION LAYER: AES-256-GCM', status: 'ok', label: 'SECURE' },
      { delay: 2600, text: '', bar: true },
      { delay: 3200, text: 'ALL SYSTEMS NOMINAL', status: '' },
    ];

    diagLines.forEach(line => {
      setTimeout(() => {
        if (line.bar) {
          const bar = SOS.h('div', { className: 'jv-diag-bar' });
          bar.innerHTML = '<div class="jv-diag-bar-fill"></div>';
          diag.appendChild(bar);
        } else {
          const el = SOS.h('div', { className: 'jv-diag-line' });
          const statusHtml = line.status === 'ok' ? ` <span class="ok">${line.label}</span>` :
                            line.status === 'warn' ? ` <span class="warn">${line.label}</span>` : '';
          el.innerHTML = '› ' + line.text + statusHtml;
          diag.appendChild(el);
        }
      }, line.delay);
    });

    // Greeting
    setTimeout(() => {
      const g = SOS.h('div', { className: 'jv-greeting' });
      g.textContent = SOS.getGreeting() + ', Sir';
      center.appendChild(g);
    }, 3600);

    // ── Boot background animation ──
    const bgParticles = Array.from({ length: 25 }, () => ({
      x: Math.random() * fxCanvas.width,
      y: Math.random() * fxCanvas.height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      size: 0.5 + Math.random() * 1,
      alpha: 0.05 + Math.random() * 0.1
    }));

    const drawBoot = () => {
      t++;
      // Deep space clear
      bgCtx.fillStyle = 'rgba(4,6,8,.15)';
      bgCtx.fillRect(0, 0, fxCanvas.width, fxCanvas.height);

      // Warm ambient glow from center
      const ambG = bgCtx.createRadialGradient(
        fxCanvas.width / 2, fxCanvas.height * 0.4, 0,
        fxCanvas.width / 2, fxCanvas.height * 0.4, fxCanvas.width * 0.4
      );
      ambG.addColorStop(0, rgba(C.gold, 0.008 + Math.sin(t * 0.03) * 0.003));
      ambG.addColorStop(1, 'transparent');
      bgCtx.fillStyle = ambG;
      bgCtx.fillRect(0, 0, fxCanvas.width, fxCanvas.height);

      // Dust particles
      for (const p of bgParticles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = fxCanvas.width;
        if (p.x > fxCanvas.width) p.x = 0;
        if (p.y < 0) p.y = fxCanvas.height;
        if (p.y > fxCanvas.height) p.y = 0;
        bgCtx.fillStyle = rgba(C.gold, p.alpha * (0.7 + Math.sin(t * 0.02 + p.x) * 0.3));
        bgCtx.beginPath(); bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2); bgCtx.fill();
      }

      // ── Arc Reactor ──
      actx.clearRect(0, 0, 440, 440);

      // Outer atmospheric glow
      const outerGlow = actx.createRadialGradient(acx, acy, 60, acx, acy, 180);
      outerGlow.addColorStop(0, rgba(C.gold, 0.04 + Math.sin(t * 0.04) * 0.015));
      outerGlow.addColorStop(0.5, rgba(C.gold, 0.01));
      outerGlow.addColorStop(1, 'transparent');
      actx.fillStyle = outerGlow;
      actx.fillRect(0, 0, 440, 440);

      // Ring 3 (outer) — cool cyan, barely visible, slow CW
      drawRing(actx, acx, acy, 150, t * 0.005, Math.PI * 1.3, C.cyan, 0.06, 0.8, 36);

      // Ring 2 (mid) — warm amber, medium, CCW
      drawRing(actx, acx, acy, 110, -t * 0.012, Math.PI * 1.5, C.amber, 0.1, 1, 24);

      // Ring 1 (inner) — bright gold, thin, CW
      drawRing(actx, acx, acy, 70, t * 0.02, Math.PI * 1.7, C.gold, 0.2, 1.2, 18);

      // Core glow (warm)
      const coreG = actx.createRadialGradient(acx, acy, 0, acx, acy, 50);
      const pulse = 0.35 + Math.sin(t * 0.05) * 0.1;
      coreG.addColorStop(0, rgba(C.gold, pulse));
      coreG.addColorStop(0.3, rgba(C.amber, pulse * 0.4));
      coreG.addColorStop(0.7, rgba(C.gold, pulse * 0.08));
      coreG.addColorStop(1, 'transparent');
      actx.fillStyle = coreG;
      actx.beginPath(); actx.arc(acx, acy, 50, 0, Math.PI * 2); actx.fill();

      // Inner triangle
      actx.strokeStyle = rgba(C.gold, 0.25 + Math.sin(t * 0.06) * 0.08);
      actx.lineWidth = 1;
      actx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = (Math.PI * 2 / 3) * i - Math.PI / 2 + t * 0.008;
        const x = acx + Math.cos(a) * 22;
        const y = acy + Math.sin(a) * 22;
        i === 0 ? actx.moveTo(x, y) : actx.lineTo(x, y);
      }
      actx.closePath(); actx.stroke();

      // Center point
      actx.fillStyle = rgba(C.amber, 0.7 + Math.sin(t * 0.08) * 0.2);
      actx.beginPath(); actx.arc(acx, acy, 3, 0, Math.PI * 2); actx.fill();

      // Connecting spokes (very dim)
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i + t * 0.004;
        actx.strokeStyle = rgba(C.gold, 0.03);
        actx.lineWidth = 0.5;
        actx.beginPath();
        actx.moveTo(acx + Math.cos(a) * 55, acy + Math.sin(a) * 55);
        actx.lineTo(acx + Math.cos(a) * 160, acy + Math.sin(a) * 160);
        actx.stroke();
      }

      if (t < 150) requestAnimationFrame(drawBoot);
    };
    drawBoot();

    try { SOS.sound('connect'); } catch (e) {}

    // Transition to lock screen
    setTimeout(() => {
      bootEl.classList.add('out');
      setTimeout(() => { bootEl.remove(); SOS.showLock(); }, 700);
    }, 4800);
  };

  // Helper: Draw a ring with tick marks and multi-layer glow
  function drawRing(ctx, cx, cy, radius, startAngle, arcLen, color, alpha, lineW, ticks) {
    // Layer 1: Wide atmospheric glow
    ctx.strokeStyle = rgba(color, alpha * 0.15);
    ctx.lineWidth = lineW + 8;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, startAngle + arcLen);
    ctx.stroke();

    // Layer 2: Medium glow
    ctx.strokeStyle = rgba(color, alpha * 0.4);
    ctx.lineWidth = lineW + 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, startAngle + arcLen);
    ctx.stroke();

    // Layer 3: Core line
    ctx.strokeStyle = rgba(color, alpha);
    ctx.lineWidth = lineW;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, startAngle + arcLen);
    ctx.stroke();

    // Tick marks
    if (ticks) {
      for (let i = 0; i < ticks; i++) {
        const a = startAngle + (arcLen / ticks) * i;
        const inner = radius - 5;
        const outer = radius + 5;
        ctx.strokeStyle = rgba(color, alpha * 0.3);
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
        ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
        ctx.stroke();
      }
    }
  }

  // ═══════════════════ WALLPAPER OVERRIDE ═══════════════════
  const origWP = SOS.initWallpaper;
  SOS.initWallpaper = function () {
    const c = SOS.$('#wallpaper'), ctx = c.getContext('2d');
    c.width = innerWidth; c.height = innerHeight;

    let t = 0, mouseX = c.width / 2, mouseY = c.height / 2;
    const PARTICLE_COUNT = 35;
    let particles = initP();

    window.addEventListener('resize', () => { c.width = innerWidth; c.height = innerHeight; particles = initP(); });
    window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

    function initP() {
      return Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * c.width, y: Math.random() * c.height,
        vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
        size: 0.5 + Math.random() * 1.2, alpha: 0.04 + Math.random() * 0.12,
        pulse: Math.random() * Math.PI * 2,
        warm: Math.random() > 0.3 // 70% warm, 30% cool
      }));
    }

    const draw = () => {
      t += 0.002;

      // ── Background: deep space gradient with warm undertone ──
      const mx = (mouseX / c.width - 0.5) * 0.08;
      const my = (mouseY / c.height - 0.5) * 0.08;
      const gx = c.width * (0.5 + Math.sin(t) * 0.12 + mx);
      const gy = c.height * (0.38 + Math.cos(t * 0.7) * 0.1 + my);

      const g = ctx.createRadialGradient(gx, gy, c.width * 0.05, c.width * 0.5, c.height * 0.5, c.width * 0.75);
      g.addColorStop(0, '#0c1220');   // Slightly warm dark blue
      g.addColorStop(0.25, '#0a0f1a');
      g.addColorStop(0.5, '#080a14');
      g.addColorStop(0.75, '#0a0610'); // Warm purple undertone
      g.addColorStop(1, '#020408');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, c.width, c.height);

      // ── Nebula clouds (warm, subtle) ──
      const n1x = c.width * 0.3 + Math.sin(t * 1.5) * 60;
      const n1y = c.height * 0.35 + Math.cos(t) * 40;
      const neb1 = ctx.createRadialGradient(n1x, n1y, 0, n1x, n1y, c.width * 0.25);
      neb1.addColorStop(0, rgba(C.gold, 0.012));
      neb1.addColorStop(0.5, rgba(C.dimGold, 0.005));
      neb1.addColorStop(1, 'transparent');
      ctx.fillStyle = neb1;
      ctx.fillRect(0, 0, c.width, c.height);

      const n2x = c.width * 0.7 + Math.cos(t * 0.8) * 50;
      const n2y = c.height * 0.6 + Math.sin(t * 1.2) * 30;
      const neb2 = ctx.createRadialGradient(n2x, n2y, 0, n2x, n2y, c.width * 0.2);
      neb2.addColorStop(0, rgba(C.cyan, 0.006));
      neb2.addColorStop(0.5, rgba(C.cyan, 0.002));
      neb2.addColorStop(1, 'transparent');
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, c.width, c.height);

      // ── Particles ──
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.pulse += 0.015;
        if (p.x < -30) p.x = c.width + 30;
        if (p.x > c.width + 30) p.x = -30;
        if (p.y < -30) p.y = c.height + 30;
        if (p.y > c.height + 30) p.y = -30;

        const a = p.alpha * (0.6 + Math.sin(p.pulse) * 0.4);
        const col = p.warm ? C.gold : C.cyan;
        ctx.fillStyle = rgba(col, a);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();

        // Constellation lines (extremely faint)
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = dx * dx + dy * dy;
          if (dist < 22000) {
            ctx.strokeStyle = rgba(C.gold, (1 - dist / 22000) * 0.025);
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }

      // ── Central warm ambient glow ──
      const cg = ctx.createRadialGradient(c.width / 2, c.height / 2, 0, c.width / 2, c.height / 2, 250);
      const cp = 0.01 + Math.sin(t * 1.5) * 0.004;
      cg.addColorStop(0, rgba(C.gold, cp));
      cg.addColorStop(0.4, rgba(C.gold, cp * 0.3));
      cg.addColorStop(1, 'transparent');
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(c.width / 2, c.height / 2, 250, 0, Math.PI * 2); ctx.fill();

      // ── Corner data readouts (ultra dim) ──
      ctx.font = '300 9px "Exo 2", sans-serif';
      ctx.letterSpacing = '1.5px';
      const now = new Date();
      const txtAlpha = 0.06 + Math.sin(t * 2) * 0.01;

      // Top-left
      ctx.textAlign = 'left';
      ctx.fillStyle = rgba(C.white, txtAlpha);
      ctx.fillText('SINTEX//OS v3.0', 18, 22);
      ctx.fillStyle = rgba(C.gold, txtAlpha * 0.8);
      ctx.fillText('JARVIS CORE: ACTIVE', 18, 35);
      ctx.fillStyle = rgba(C.white, txtAlpha * 0.6);
      ctx.fillText(now.toLocaleTimeString('en-US', { hour12: false }), 18, 48);

      // Top-right
      ctx.textAlign = 'right';
      ctx.fillStyle = rgba(C.white, txtAlpha);
      ctx.fillText('NEURAL PROC: NOMINAL', c.width - 18, 22);
      ctx.fillStyle = rgba(C.green, txtAlpha * 0.7);
      ctx.fillText('ALL SYSTEMS ONLINE', c.width - 18, 35);

      // Bottom-left
      ctx.textAlign = 'left';
      ctx.fillStyle = rgba(C.white, txtAlpha * 0.5);
      ctx.fillText('ENCRYPTION: AES-256', 18, c.height - 56);

      ctx.textAlign = 'left'; // Reset
      SOS.state.wpRAF = requestAnimationFrame(draw);
    };
    draw();
  };

  // ═══════════════════ DESKTOP HUD OVERLAY ═══════════════════
  SOS.on('initShell', () => {
    // Film grain
    if (!document.getElementById('jv-grain')) {
      const grain = SOS.h('div', { id: 'jv-grain' });
      document.body.appendChild(grain);
    }

    // Vignette
    if (!document.getElementById('jv-vignette')) {
      const vig = SOS.h('div', { id: 'jv-vignette' });
      document.getElementById('desktop').appendChild(vig);
    }

    // HUD Canvas
    const hud = SOS.h('div', { id: 'jv-hud' });
    const hudCanvas = document.createElement('canvas');
    hud.appendChild(hudCanvas);
    document.getElementById('desktop').appendChild(hud);

    function resizeHUD() {
      hudCanvas.width = innerWidth;
      hudCanvas.height = innerHeight;
    }
    resizeHUD();
    window.addEventListener('resize', resizeHUD);

    const hctx = hudCanvas.getContext('2d');
    let ht = 0;

    function drawHUD() {
      ht++;
      hctx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
      const w = hudCanvas.width, h = hudCanvas.height;

      // ── Corner arcs (thin, warm, barely visible) ──
      const arcR = 60;
      const arcAlpha = 0.04 + Math.sin(ht * 0.008) * 0.01;

      // Top-left arc
      hctx.strokeStyle = rgba(C.gold, arcAlpha);
      hctx.lineWidth = 0.8;
      hctx.beginPath();
      hctx.arc(10 + arcR, 10 + arcR, arcR, Math.PI, Math.PI * 1.5);
      hctx.stroke();

      // Top-right arc
      hctx.beginPath();
      hctx.arc(w - 10 - arcR, 10 + arcR, arcR, Math.PI * 1.5, Math.PI * 2);
      hctx.stroke();

      // Bottom-left arc
      hctx.beginPath();
      hctx.arc(10 + arcR, h - 60 - arcR, arcR, Math.PI * 0.5, Math.PI);
      hctx.stroke();

      // Bottom-right arc
      hctx.beginPath();
      hctx.arc(w - 10 - arcR, h - 60 - arcR, arcR, 0, Math.PI * 0.5);
      hctx.stroke();

      // ── Small tick marks on arcs ──
      for (let corner = 0; corner < 4; corner++) {
        const cx = corner < 2 ? 10 + arcR : w - 10 - arcR;
        const cy = corner % 2 === 0 ? 10 + arcR : h - 60 - arcR;
        const startA = [Math.PI, Math.PI * 1.5, Math.PI * 0.5, 0][corner];
        for (let i = 0; i < 6; i++) {
          const a = startA + (Math.PI * 0.5 / 6) * i;
          hctx.strokeStyle = rgba(C.gold, arcAlpha * 0.5);
          hctx.lineWidth = 0.3;
          hctx.beginPath();
          hctx.moveTo(cx + Math.cos(a) * (arcR - 3), cy + Math.sin(a) * (arcR - 3));
          hctx.lineTo(cx + Math.cos(a) * (arcR + 3), cy + Math.sin(a) * (arcR + 3));
          hctx.stroke();
        }
      }

      // ── Periodic scanning sweep (very slow, very subtle) ──
      const sweepPeriod = 15; // 15 seconds
      const sweepY = ((ht * 0.001 * sweepPeriod) % 1) * (h - 48);
      const sweepG = hctx.createLinearGradient(0, sweepY - 50, 0, sweepY + 5);
      sweepG.addColorStop(0, 'transparent');
      sweepG.addColorStop(0.85, rgba(C.gold, 0.015));
      sweepG.addColorStop(1, 'transparent');
      hctx.fillStyle = sweepG;
      hctx.fillRect(0, sweepY - 50, w, 55);

      // ── Occasional data flash (appears every ~10 seconds, fades over 3 seconds) ──
      const flashCycle = ht % 600;
      if (flashCycle < 180) {
        const flashAlpha = flashCycle < 30 ? flashCycle / 30 * 0.06 :
                          flashCycle < 150 ? 0.06 :
                          (180 - flashCycle) / 30 * 0.06;
        hctx.font = '300 8px "Exo 2", sans-serif';
        hctx.fillStyle = rgba(C.gold, flashAlpha);
        hctx.textAlign = 'left';
        const dataTexts = [
          'PROCESSING NEURAL INFERENCE: 847ms',
          'AGENT SWARM: 7 ACTIVE NODES',
          'BITNET TERNARY: {-1, 0, +1} QUANTIZED',
          'LATENCY: 12ms | THROUGHPUT: 2.4K tok/s',
          'OPENCLAW GATEWAY: ws://127.0.0.1:18789'
        ];
        const dataIdx = Math.floor(ht / 600) % dataTexts.length;
        hctx.fillText(dataTexts[dataIdx], 20, h - 80);
      }

      requestAnimationFrame(drawHUD);
    }
    drawHUD();
  });

  // ═══════════════════ LOCK SCREEN OVERRIDE ═══════════════════
  const origShowLock = SOS.showLock;
  SOS.showLock = function () {
    const ls = SOS.$('#lockscreen');
    ls.classList.remove('hidden');

    // Add JARVIS branding
    const lockContent = SOS.$('#lock-content');
    if (!lockContent.querySelector('.jv-lock-brand')) {
      const brand = SOS.h('div', { className: 'jv-lock-brand' });
      brand.style.cssText = `font-family:'Orbitron',sans-serif;font-size:9px;color:${rgba(C.gold,.2)};
        margin-top:24px;letter-spacing:4px;text-transform:uppercase;font-weight:400`;
      brand.textContent = 'JARVIS AI · SintexOS';
      lockContent.appendChild(brand);
    }

    const updateTime = () => {
      SOS.$('#lock-time').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      SOS.$('#lock-date').textContent = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    };
    updateTime();
    const ti = setInterval(updateTime, 30000);
    const unlock = () => {
      SOS.sound('connect');
      ls.classList.add('hidden'); clearInterval(ti); SOS.initDesktop();
      ls.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
    };
    ls.addEventListener('click', unlock);
    document.addEventListener('keydown', unlock);
  };

  // ═══════════════════ JARVIS VOICE (TTS) ═══════════════════
  const origNotify = SOS.notify.bind(SOS);
  SOS.notify = function (title, body, icon) {
    origNotify(title, body, icon);
    if (title.includes('JARVIS') || title.includes('Error') || title.includes('Connected')) {
      try {
        if ('speechSynthesis' in window) {
          const utter = new SpeechSynthesisUtterance(body || title);
          utter.rate = 1.05; utter.pitch = 0.85; utter.volume = 0.25;
          const voices = speechSynthesis.getVoices();
          const british = voices.find(v => v.lang.includes('en-GB')) || voices.find(v => v.lang.includes('en'));
          if (british) utter.voice = british;
          speechSynthesis.speak(utter);
        }
      } catch (e) {}
    }
  };

  // ═══════════════════ WINDOW OPEN SOUND ═══════════════════
  SOS.on('openApp', () => { try { SOS.sound('click'); } catch (e) {} });

})();
