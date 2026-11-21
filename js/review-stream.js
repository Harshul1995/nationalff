/* "Loved by our customers": the Google rating panel stays solid in the middle while real reviews
   glide continuously behind it (desktop: one row, phones: a row above and a row below).
   Reviews come from data/reviews.json. Only a few cards exist in the page at any time: cards that
   leave the screen are recycled with the next review, so hundreds of reviews cost almost nothing.
   Pauses on hover / touch / keyboard focus, via the pause button, when the tab is hidden or the
   section is off screen; people who prefer reduced motion get a plain swipeable row. ES5 on purpose. */
(function () {
  'use strict';
  var stage = document.getElementById('nrh-stage');
  if (!stage) return;
  var rowEls = stage.querySelectorAll('.nrh-mq'), toggle = stage.querySelector('.nrh-mq-toggle');
  var reviews = [], rows = [], userPaused = false, hoverH = false, touchH = false, focusH = false;
  var inView = true, raf = null, last = 0, resizeT, lastW = 0, lastMobile = null;
  var COLORS = ['#1a73e8', '#188038', '#d93025', '#e37400', '#9334e6', '#00796b', '#c2185b', '#5f6368'];
  var rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (f) { return setTimeout(function () { f(new Date().getTime()); }, 16); };
  var cAF = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || clearTimeout;

  function mk(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function vw() { return window.innerWidth || document.documentElement.clientWidth || 1000; }
  function mobile() { return vw() < 768; }
  function cfg() { return mobile() ? { w: 270, gap: 14, speed: 26 } : { w: 330, gap: 20, speed: 40 }; }
  function reduced() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function hue(name) { var h = 0, i; for (i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997; return COLORS[h % COLORS.length]; }
  function lang(t) { if (/[\u0A80-\u0AFF]/.test(t)) return 'gu'; if (/[\u0900-\u097F]/.test(t)) return 'hi'; return 'en'; }
  function visible(el) { return el.offsetParent !== null; }

  var G_SVG = '<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true" focusable="false"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
  function makeCard(r) {
    var n = r.text.length, c = mk('article', 'nrh-mq-card ' + (n < 70 ? 'is-s' : (n < 170 ? 'is-m' : 'is-l'))), by = mk('div', 'nrh-mq-by'), who = mk('span', 'nrh-mq-who'), av, g, t;
    g = mk('span', 'nrh-mq-g'); g.innerHTML = G_SVG; c.appendChild(g);
    c.appendChild(mk('div', 'nrh-mq-stars', '\u2605\u2605\u2605\u2605\u2605'));
    t = mk('p', 'nrh-mq-text', r.text); t.setAttribute('lang', lang(r.text)); c.appendChild(t);
    av = mk('span', 'nrh-mq-av', r.name.charAt(0).toUpperCase()); av.style.background = hue(r.name);
    who.appendChild(mk('b', 'nrh-mq-name', r.name)); who.appendChild(mk('small', 'nrh-mq-when', (r.when ? r.when + ' \u00b7 ' : '') + 'Google review'));
    by.appendChild(av); by.appendChild(who); c.appendChild(by);
    return c;
  }

  function Row(el, dir, start) { this.el = el; this.dir = dir; this.first = start; this.track = el.querySelector('.nrh-mq-track'); if (!this.track) { this.track = mk('div', 'nrh-mq-track'); el.appendChild(this.track); } }
  Row.prototype.card = function (idx) { var c = cfg(), e = makeCard(reviews[idx % reviews.length]); e.style.width = c.w + 'px'; e.style.marginRight = c.gap + 'px'; return e; };
  Row.prototype.apply = function () { var t = 'translate3d(' + this.off.toFixed(2) + 'px,0,0)'; this.track.style.webkitTransform = t; this.track.style.transform = t; };
  Row.prototype.build = function () {
    var c = cfg(), i, w;
    while (this.track.firstChild) this.track.removeChild(this.track.firstChild);
    if (!visible(this.el)) return;
    w = this.el.offsetWidth || vw();
    this.slot = c.w + c.gap; this.speed = c.speed * (this.dir > 0 ? 0.85 : 1); this.n = Math.ceil(w / this.slot) + 3;
    for (i = 0; i < this.n; i++) this.track.appendChild(this.card((this.first + i) % reviews.length));
    this.off = this.dir < 0 ? 0 : -this.slot; this.apply();
  };
  Row.prototype.step = function (dt) {
    var L = reviews.length, nxt;
    if (!this.slot || !visible(this.el)) return;
    this.off += this.dir * this.speed * dt;
    if (this.dir < 0) {                                     /* moving left: recycle the first card to the end */
      while (this.off <= -this.slot) {
        this.track.removeChild(this.track.firstChild);
        nxt = (this.first + this.n) % L; this.first = (this.first + 1) % L;
        this.track.appendChild(this.card(nxt)); this.off += this.slot;
      }
    } else {                                                 /* moving right: recycle the last card to the front */
      while (this.off >= 0) {
        this.track.removeChild(this.track.lastChild);
        this.first = (this.first - 1 + L) % L;
        this.track.insertBefore(this.card(this.first), this.track.firstChild); this.off -= this.slot;
      }
    }
    this.apply();
  };

  function paused() { return userPaused || hoverH || touchH || focusH || document.hidden || !inView; }
  function frame(t) {
    var dt, i;
    raf = rAF(frame);
    if (!last) last = t; dt = Math.min(0.05, Math.max(0, (t - last) / 1000)); last = t;
    if (paused()) return;
    for (i = 0; i < rows.length; i++) rows[i].step(dt);
  }
  function start() { if (!raf && !reduced()) { last = 0; raf = rAF(frame); } }
  function stop() { if (raf) { cAF(raf); raf = null; } }
  function buildAll() { var i; for (i = 0; i < rows.length; i++) rows[i].build(); lastW = vw(); lastMobile = mobile(); }

  function init() {
    var L = reviews.length, a, b;
    a = new Row(rowEls[0], -1, 0); rows.push(a);
    if (rowEls[1]) { b = new Row(rowEls[1], 1, Math.floor(L / 2)); rows.push(b); }
    if (stage.className.indexOf('has-stream') < 0) stage.className += ' has-stream';
    if (reduced()) stage.className += ' is-static';                          /* plain swipeable rows, no motion */
    buildAll();
    if (reduced()) return;
    if (toggle) {
      toggle.hidden = false; toggle.removeAttribute('hidden');
      toggle.addEventListener('click', function () {
        userPaused = !userPaused; toggle.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
        toggle.setAttribute('aria-label', userPaused ? 'Resume moving reviews' : 'Pause moving reviews'); toggle.textContent = userPaused ? '\u25B6' : '\u275A\u275A';
      });
    }
    stage.addEventListener('mouseenter', function () { hoverH = true; }); stage.addEventListener('mouseleave', function () { hoverH = false; });
    stage.addEventListener('touchstart', function () { touchH = true; }, { passive: true });
    stage.addEventListener('touchend', function () { touchH = false; }, { passive: true }); stage.addEventListener('touchcancel', function () { touchH = false; }, { passive: true });
    stage.addEventListener('focusin', function () { focusH = true; }); stage.addEventListener('focusout', function () { focusH = false; });
    window.addEventListener('resize', function () { clearTimeout(resizeT); resizeT = setTimeout(function () { if (mobile() !== lastMobile || Math.abs(vw() - lastW) > 40) buildAll(); }, 200); });
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (en) { inView = en[0].isIntersecting; }, { threshold: 0 }).observe(stage);
    }
    start();
  }

  function load(cb) {
    var x = new XMLHttpRequest();
    x.open('GET', 'data/reviews.json?' + Math.floor(new Date().getTime() / 3600000), true);
    x.onreadystatechange = function () {
      if (x.readyState !== 4) return;
      var d = null; try { if (x.status === 200 || x.status === 0) d = JSON.parse(x.responseText); } catch (e) { d = null; }
      cb(d);
    };
    try { x.send(); } catch (e) { cb(null); }
  }
  function fail() { stage.className = stage.className.replace(/\s*has-stream/, ''); }
  load(function (d) {
    var i, r;
    if (!d || !d.length) { fail(); return; }
    for (i = 0; i < d.length; i++) {
      r = d[i]; if (!r || typeof r.name !== 'string' || typeof r.text !== 'string') continue;
      if (r.rating !== undefined && Number(r.rating) < 5) continue;               /* only 5-star reviews */
      r = { name: r.name.replace(/^\s+|\s+$/g, ''), text: r.text.replace(/^\s+|\s+$/g, '').replace(/\n{2,}/g, '\n'), when: typeof r.when === 'string' ? r.when : '' };
      if (r.name && r.text) reviews.push(r);
    }
    if (reviews.length >= 4) init(); else fail();
  });
})();
