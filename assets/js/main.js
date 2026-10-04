(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ── Theme ─────────────────────────────────────────────────────────── */

  var toggle = document.querySelector('.theme-toggle');
  var toggleLabel = document.querySelector('.theme-toggle__label');

  function syncThemeLabel() {
    var dark = root.dataset.theme !== 'light';
    toggleLabel.textContent = dark ? 'dark mode' : 'lights on';
    document.querySelector('meta[name="theme-color"]').setAttribute('content', dark ? '#0c0b0a' : '#ece6d9');
  }
  syncThemeLabel();

  toggle.addEventListener('click', function () {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    syncThemeLabel();
    window.dispatchEvent(new CustomEvent('themechange'));
  });

  /* ── Clock & year ──────────────────────────────────────────────────── */

  var clock = document.querySelector('.clock');
  function tick() {
    clock.textContent = new Intl.DateTimeFormat('en-GB', {
      timeZone: clock.dataset.tz, hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date());
  }
  tick();
  setInterval(tick, 15000);
  document.querySelector('[data-year]').textContent = new Date().getFullYear();

  /* ── Workbench ─────────────────────────────────────────────────────── */

  var bench = document.querySelector('[data-bench]');
  var projects = window.WORKBENCH || [];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var statusLabel = { shipped: 'Shipped', tinkering: 'Tinkering', idea: 'Idea' };

  bench.innerHTML = projects.map(function (p, i) {
    var tags = (p.tags || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
    var links = (p.links || []).map(function (l) {
      return '<a href="' + esc(l.href) + '" target="_blank" rel="noopener">' + esc(l.label) + ' ↗</a>';
    }).join('');
    var num = String(projects.length - i).padStart(2, '0');
    return (
      '<li class="bench__item" data-status="' + esc(p.status) + '">' +
        '<div class="bench__head mono">' +
          '<span class="bench__num">№' + num + '</span>' +
          '<span>' + esc(p.year) + '</span>' +
          '<span class="status status--' + esc(p.status) + '">' + esc(statusLabel[p.status] || p.status) + '</span>' +
        '</div>' +
        (p.emoji ? '<div class="bench__emoji" aria-hidden="true">' + esc(p.emoji) + '</div>' : '') +
        '<h3 class="bench__title">' + esc(p.title) + '</h3>' +
        '<p class="bench__blurb">' + esc(p.blurb) + '</p>' +
        '<div class="bench__foot">' +
          (tags ? '<ul class="tags mono">' + tags + '</ul>' : '<span></span>') +
          (links ? '<div class="bench__links mono">' + links + '</div>' : '') +
        '</div>' +
      '</li>'
    );
  }).join('') +
    '<li class="bench__item bench__item--slot" data-status="slot">' +
      '<p class="mono" style="margin:0 0 18px;color:var(--muted)">№' + String(projects.length + 1).padStart(2, '0') + ' — reserved</p>' +
      '<h3 class="bench__title">Next one <span class="serif">goes here.</span></h3>' +
      '<p class="bench__blurb">Something is always on the bench. Check back soon.</p>' +
      '<code>assets/js/projects.js</code>' +
    '</li>';

  // Filter tabs with counts.
  var filterButtons = document.querySelectorAll('.filters button');
  filterButtons.forEach(function (btn) {
    var f = btn.dataset.filter;
    var n = f === 'all' ? projects.length : projects.filter(function (p) { return p.status === f; }).length;
    btn.querySelector('sup').textContent = n;
    if (f !== 'all' && n === 0) btn.hidden = true;

    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) { b.setAttribute('aria-selected', String(b === btn)); });
      var items = bench.querySelectorAll('.bench__item');
      items.forEach(function (el) {
        var show = f === 'all' || el.dataset.status === f || el.dataset.status === 'slot';
        el.hidden = !show;
      });
      if (window.gsap && !reduceMotion) {
        gsap.fromTo(bench.querySelectorAll('.bench__item:not([hidden])'),
          { y: 24, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.05, ease: 'power3.out' });
      }
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });

  /* ── Card spotlight ────────────────────────────────────────────────── */

  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ── Nav: solid after hero, hide on scroll down ────────────────────── */

  var nav = document.querySelector('.nav');
  var lastY = window.scrollY;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    nav.classList.toggle('is-solid', y > window.innerHeight * 0.6);
    nav.classList.toggle('is-hidden', y > lastY && y > window.innerHeight);
    lastY = y;
  }, { passive: true });

  /* ── Without GSAP: show everything and stop here ───────────────────── */

  if (!window.gsap) {
    root.classList.remove('js');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);

  /* ── Cursor ────────────────────────────────────────────────────────── */

  if (finePointer && !reduceMotion) {
    var cursor = document.querySelector('.cursor');
    var xTo = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
    var yTo = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
    window.addEventListener('pointermove', function (e) { xTo(e.clientX); yTo(e.clientY); });
    document.querySelectorAll('a, button').forEach(function (el) {
      el.addEventListener('pointerenter', function () { cursor.classList.add('is-hover'); });
      el.addEventListener('pointerleave', function () { cursor.classList.remove('is-hover'); });
    });
  }

  if (reduceMotion) {
    root.classList.remove('js');
    return;
  }

  // SplitText needs final glyph metrics, so wait for fonts (but not forever).
  var started = false;
  function start() { if (!started) { started = true; animate(); } }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(start);
    setTimeout(start, 1500);
  } else {
    start();
  }

  function animate() {
    /* ── Hero intro ────────────────────────────────────────────────────── */

    gsap.set('.hero__word, .hero__meta, .hero__lede', { visibility: 'visible' });

    var intro = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.15 });
    if (window.SplitText) {
      var split = SplitText.create('.hero__word', { type: 'chars' });
      intro.from(split.chars, { yPercent: 115, rotate: 6, duration: 1.4, stagger: 0.035 });
    } else {
      intro.from('.hero__word', { yPercent: 110, duration: 1.4, stagger: 0.12 });
    }
    intro
      .from('.hero__lede', { y: 24, autoAlpha: 0, duration: 1.1 }, '-=0.9')
      .from('.hero__meta', { y: 12, autoAlpha: 0, duration: 1, stagger: 0.1 }, '<0.1');

    // Title drifts and fades as you scroll past the hero.
    gsap.to('.hero__title', {
      yPercent: -18,
      autoAlpha: 0.15,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    /* ── Marquee: constant drift, nudged by scroll velocity ────────────── */

    var track = document.querySelector('.marquee__track');
    track.innerHTML += track.innerHTML; // seamless loop
    var loop = gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
    ScrollTrigger.create({
      onUpdate: function (self) {
        var v = self.getVelocity() / 300;
        var dir = self.direction;
        gsap.to(loop, { timeScale: dir * Math.max(1, Math.min(Math.abs(v), 6)), duration: 0.2, overwrite: true });
        gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.2 });
      }
    });

    /* ── About: words light up as you read ─────────────────────────────── */

    var statement = document.querySelector('[data-reveal-words]');
    if (window.SplitText) {
      var words = SplitText.create(statement, { type: 'words', wordsClass: 'word' });
      gsap.fromTo(words.words, { opacity: 0.14 }, {
        opacity: 1,
        stagger: 0.1,
        ease: 'none',
        scrollTrigger: { trigger: statement, start: 'top 80%', end: 'bottom 45%', scrub: true }
      });
    }

    document.querySelectorAll('[data-count]').forEach(function (el) {
      var end = +el.dataset.count;
      var start = end > 1000 ? end - 40 : 0;
      var obj = { v: start };
      gsap.to(obj, {
        v: end,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate: function () { el.textContent = Math.round(obj.v); },
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });

    /* ── Section reveals ───────────────────────────────────────────────── */

    gsap.utils.toArray('.section-head, .about__stats').forEach(function (el) {
      gsap.from(el, {
        y: 40, autoAlpha: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });

    ScrollTrigger.batch('.card, .bench__item, .row', {
      start: 'top 90%',
      onEnter: function (batch) {
        gsap.fromTo(batch,
          { y: 60, autoAlpha: 0, rotate: 1.5 },
          { y: 0, autoAlpha: 1, rotate: 0, duration: 1.1, stagger: 0.08, ease: 'power3.out', overwrite: true });
      }
    });
    gsap.set('.card, .bench__item, .row', { autoAlpha: 0 });

    gsap.from('.contact__line', {
      yPercent: 60, autoAlpha: 0, duration: 1.2, stagger: 0.12, ease: 'expo.out',
      scrollTrigger: { trigger: '.contact__big', start: 'top 85%' }
    });

    ScrollTrigger.refresh();
  }
})();
