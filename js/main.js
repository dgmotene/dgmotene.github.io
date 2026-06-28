/* ═══════════════════════════════════════════════════════════
   DALTON MOTENE — Portfolio JS
   main.js · v2
═══════════════════════════════════════════════════════════ */

'use strict';

/* ── 1. PARTICLE CANVAS ──────────────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, nodes, mouse = { x: -999, y: -999 };
  const NODE_COUNT = 70;
  const CONNECT_DIST = 160;
  const MOUSE_DIST   = 200;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Node() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.35;
    this.vy = (Math.random() - 0.5) * 0.35;
    this.r  = Math.random() * 1.5 + 0.5;
  }

  function init() {
    resize();
    nodes = Array.from({ length: NODE_COUNT }, () => new Node());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // update positions
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    }

    // draw edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * 0.3;
          ctx.strokeStyle = `rgba(0,212,170,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // mouse attraction lines
      const mx = nodes[i].x - mouse.x, my = nodes[i].y - mouse.y;
      const md = Math.sqrt(mx * mx + my * my);
      if (md < MOUSE_DIST) {
        const alpha = (1 - md / MOUSE_DIST) * 0.5;
        ctx.strokeStyle = `rgba(77,159,255,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }

    // draw nodes
    for (const n of nodes) {
      ctx.fillStyle = 'rgba(0,212,170,0.6)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  init();
  draw();
})();


/* ── 2. CUSTOM CURSOR ────────────────────────────────────── */
(function initCursor() {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring || window.matchMedia('(hover: none)').matches) return;

  let rX = 0, rY = 0, dX = 0, dY = 0;
  let raf;

  document.addEventListener('mousemove', e => {
    dX = e.clientX; dY = e.clientY;
    dot.style.left = dX + 'px';
    dot.style.top  = dY + 'px';
    if (!raf) raf = requestAnimationFrame(moveRing);
  });

  function moveRing() {
    rX += (dX - rX) * 0.14;
    rY += (dY - rY) * 0.14;
    ring.style.left = rX + 'px';
    ring.style.top  = rY + 'px';
    raf = requestAnimationFrame(moveRing);
  }

  // grow on interactive elements
  const hoverEls = 'a, button, .tech-pill, .project-card, .skill-bar-item';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverEls)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverEls)) document.body.classList.remove('cursor-hover');
  });
})();


/* ── 3. NAV SCROLL BEHAVIOUR ─────────────────────────────── */
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();


/* ── 4. SCROLL PROGRESS BAR ──────────────────────────────── */
(function initProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
})();


/* ── 5. MOBILE DRAWER ────────────────────────────────────── */
(function initDrawer() {
  const btn    = document.getElementById('hamburger');
  const drawer = document.getElementById('mobile-drawer');
  if (!btn || !drawer) return;

  btn.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });

  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      drawer.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    });
  });
})();


/* ── 6. INTERSECTION OBSERVER (reveal, stagger) ──────────── */
(function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger').forEach(el => io.observe(el));
})();


/* ── 7. SKILL BARS (animate on visible) ──────────────────── */
(function initSkillBars() {
  const fills = document.querySelectorAll('.skill-bar-fill');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.pct + '%';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach(f => io.observe(f));
})();


/* ── 8. COUNTER ANIMATION ────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const dur    = 1400;
      const start  = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / dur, 1);
        const ease     = 1 - Math.pow(1 - progress, 3);
        const val      = target * ease;
        el.textContent = (Number.isInteger(target) ? Math.floor(val) : val.toFixed(1)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => io.observe(c));
})();


/* ── 9. TYPING ANIMATION (hero code card) ────────────────── */
(function initTyping() {
  const target = document.getElementById('type-target');
  if (!target) return;

  const lines = [
    { parts: [
      { cls: 'cm', t: '// Dalton Motene · Backend Engineer' }
    ]},
    { parts: [] },
    { parts: [
      { cls: 'kw', t: '@RestController' }
    ]},
    { parts: [
      { cls: 'kw', t: 'public class ' },
      { cls: 'cl', t: 'DaltonMotene' },
      { cls: '', t: ' {' }
    ]},
    { parts: [
      { cls: 'kw', t: '  private final ' },
      { cls: 'cl', t: 'Stack' },
      { cls: '', t: '<' },
      { cls: 'cl', t: 'String' },
      { cls: '', t: '> skills;' }
    ]},
    { parts: [] },
    { parts: [
      { cls: 'kw', t: '  @GetMapping' },
      { cls: '', t: '(' },
      { cls: 'str', t: '"/hire"' },
      { cls: '', t: ')' }
    ]},
    { parts: [
      { cls: 'fn', t: '  String' },
      { cls: '', t: ' hire() {' }
    ]},
    { parts: [
      { cls: 'kw', t: '    return ' },
      { cls: 'str', t: '"Ready to build"' },
      { cls: '', t: ';' }
    ]},
    { parts: [{ cls: '', t: '  }' }]},
    { parts: [{ cls: '', t: '}' }]},
  ];

  let li = 0, ci = 0, pi = 0;
  let rendered = [];

  function renderLines() {
    target.innerHTML = rendered.map((line, i) => {
      const num = i + 1;
      return `<div class="code-line">
        <span class="ln">${num}</span>
        <span>${line}</span>
      </div>`;
    }).join('') +
    `<div class="code-line">
      <span class="ln">${rendered.length + 1}</span>
      <span id="current-line"></span><span class="type-cursor"></span>
    </div>`;
  }

  function type() {
    if (li >= lines.length) return;
    const line = lines[li];

    if (line.parts.length === 0) {
      rendered.push('');
      li++; pi = 0; ci = 0;
      renderLines();
      setTimeout(type, 80);
      return;
    }

    if (pi >= line.parts.length) {
      // finish line
      const fullLine = line.parts.map(p =>
        p.cls ? `<span class="${p.cls}">${p.t}</span>` : p.t
      ).join('');
      rendered.push(fullLine);
      li++; pi = 0; ci = 0;
      renderLines();
      setTimeout(type, 100);
      return;
    }

    const part = line.parts[pi];
    const currentLineEl = document.getElementById('current-line');
    if (!currentLineEl) return;

    if (ci < part.t.length) {
      const built = line.parts.slice(0, pi).map(p =>
        p.cls ? `<span class="${p.cls}">${p.t}</span>` : p.t
      ).join('') +
      (part.cls
        ? `<span class="${part.cls}">${part.t.slice(0, ci + 1)}</span>`
        : part.t.slice(0, ci + 1));
      currentLineEl.innerHTML = built;
      ci++;
      setTimeout(type, 28 + Math.random() * 18);
    } else {
      pi++;
      ci = 0;
      setTimeout(type, 20);
    }
  }

  renderLines();
  setTimeout(type, 900);
})();


/* ── 10. ACTIVE NAV LINK ─────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a');

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });

  sections.forEach(s => io.observe(s));
})();


/* ── 11. TILT ON PROJECT CARDS ───────────────────────────── */
(function initTilt() {
  if (window.matchMedia('(hover: none)').matches) return;
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${x * 6}deg) rotateX(${-y * 4}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();