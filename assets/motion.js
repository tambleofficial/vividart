(function () {
  if (window.__vividMotion) return; window.__vividMotion = true;
  var EASE = 'cubic-bezier(.22,.61,.36,1)';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { show(e.target.__rv || e.target); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  var zooms = [], pars = [], mice = [], grows = [], mags = [], pending = [];
  function prep(el) {
    var t = el.getAttribute('data-reveal'), s = el.style, d = (el.getAttribute('data-delay') || 0) + 'ms';
    el.__t0 = s.transform || '';
    s.transition = 'opacity 1.4s ' + EASE + ', transform 1.4s ' + EASE + ', filter 1.4s ' + EASE + ', clip-path 1.6s ' + EASE;
    s.transitionDelay = d;
    if (t === 'blur') { s.opacity = 0; s.filter = 'blur(18px)'; }
    else if (t === 'clip') { s.clipPath = 'inset(100% 0 0 0)'; }
    else if (t === 'mask') { s.transform = 'translateY(105%)'; }
    else if (t === 'scale') { s.opacity = 0; s.transform = 'scale(.92)'; s.transition = 'opacity 1.6s ' + EASE + ', transform 2.2s ' + EASE; s.transitionDelay = d; }
    else if (t === 'draw') { s.strokeDasharray = '1'; s.strokeDashoffset = '1'; s.transition = 'stroke-dashoffset 2s ' + EASE; s.transitionDelay = d; }
    else if (t === 'line') { s.transform = 'scaleX(0)'; s.transformOrigin = 'left center'; s.transition = 'transform 1.8s ' + EASE; s.transitionDelay = d; }
    else if (t === 'vline') { s.transform = 'scaleY(0)'; s.transformOrigin = 'top center'; s.transition = 'transform 1.8s ' + EASE; s.transitionDelay = d; }
    else if (t === 'fade') { s.opacity = 0; }
    else { s.opacity = 0; s.transform = 'translateY(28px)'; }
    var obs = el; if (t === 'mask' && el.parentElement) { obs = el.parentElement; obs.__rv = el; el.__obs = obs; }
    io.observe(obs); pending.push(el);
  }
  function show(el) {
    var t = el.getAttribute('data-reveal'), s = el.style;
    if (t === 'draw') { s.strokeDashoffset = '0'; return; }
    s.opacity = ''; s.filter = ''; s.clipPath = 'inset(0 0 0 0)';
    if (t === 'line') s.transform = 'scaleX(1)'; else if (t === 'vline') s.transform = 'scaleY(1)'; else if (t !== 'fade' && t !== 'blur' && t !== 'clip') s.transform = el.__t0 || 'none';
  }
  function checkPending() {
    var vh = innerHeight;
    pending = pending.filter(function (el) {
      if (!el.isConnected) return false;
      var r = (el.__obs || el).getBoundingClientRect();
      if (r.top < vh * 0.94 && r.bottom > 0) { show(el); io.unobserve(el.__obs || el); return false; }
      return true;
    });
  }
  function scan(root) {
    if (!root.querySelectorAll) return;
    var list = [root].concat([].slice.call(root.querySelectorAll('[data-reveal],[data-zoom],[data-parallax],[data-mouse],[data-breathe],[data-drift],[data-grow],[data-magnetic]')));
    list.forEach(function (el) {
      if (!el.getAttribute || el.__vm) return;
      var hit = false;
      if (el.hasAttribute('data-reveal')) { hit = true; if (!reduce) prep(el); }
      if (el.hasAttribute('data-zoom')) { hit = true; zooms.push(el); }
      if (el.hasAttribute('data-parallax')) { hit = true; pars.push(el); }
      if (el.hasAttribute('data-mouse')) { hit = true; mice.push(el); }
      if (el.hasAttribute('data-grow')) { hit = true; grows.push(el); }
      if (el.hasAttribute('data-magnetic')) { hit = true; mags.push(el); el.style.transition = (el.style.transition ? el.style.transition + ', ' : '') + 'translate .6s ' + EASE; }
      if (el.hasAttribute('data-breathe') && !reduce) {
        hit = true;
        var a = el.animate([{ transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 2600, easing: EASE, fill: 'forwards' });
        a.onfinish = function () { el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }], { duration: 14000, easing: 'ease-in-out', iterations: Infinity, direction: 'alternate' }); };
      }
      if (el.hasAttribute('data-drift') && !reduce) {
        hit = true;
        var dv = el.getAttribute('data-drift');
        if (dv === 'light') el.animate([{ transform: 'translate(-14%,-6%)' }, { transform: 'translate(14%,8%)' }], { duration: 7000, easing: 'ease-in-out', iterations: Infinity, direction: 'alternate' });
        else if (dv === 'light2') el.animate([{ transform: 'translate(10%,6%)' }, { transform: 'translate(-12%,-8%)' }], { duration: 9000, easing: 'ease-in-out', iterations: Infinity, direction: 'alternate' });
        else if (dv === 'light3') el.animate([{ transform: 'translate(12%,8%)' }, { transform: 'translate(-14%,-6%)' }], { duration: 10000, easing: 'ease-in-out', iterations: Infinity, direction: 'alternate' });
        else el.animate([{ transform: 'translate3d(-2%,0,0) scale(1.06)' }, { transform: 'translate3d(2%,-2%,0) scale(1.1)' }], { duration: 22000, easing: 'ease-in-out', iterations: Infinity, direction: 'alternate' });
      }
      if (hit) el.__vm = true;
    });
  }
  var mx = 0, my = 0, tick = false;
  function alive(el) { return el.isConnected; }
  function frame() {
    tick = false; var vh = innerHeight; checkPending();
    zooms = zooms.filter(alive); pars = pars.filter(alive); mice = mice.filter(alive); grows = grows.filter(alive); mags = mags.filter(alive);
    zooms.forEach(function (el) {
      var r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      el.style.transform = 'scale(' + (1 + 0.04 * p).toFixed(4) + ')';
    });
    pars.forEach(function (el) {
      var f = parseFloat(el.getAttribute('data-parallax')) || 0.2;
      var mf = parseFloat(el.getAttribute('data-mouse')) || 0;
      el.style.transform = 'translate3d(' + (mx * mf).toFixed(2) + 'px,' + (-scrollY * f + my * mf).toFixed(2) + 'px,0)';
    });
    mice.forEach(function (el) {
      if (el.hasAttribute('data-parallax')) return;
      var f = parseFloat(el.getAttribute('data-mouse')) || 10;
      el.style.translate = (mx * f).toFixed(2) + 'px ' + (my * f).toFixed(2) + 'px';
    });
    grows.forEach(function (el) {
      var f = parseFloat(el.getAttribute('data-grow')) || 0.16;
      el.style.transform = 'scale(' + (1 + Math.min(1, scrollY / vh) * f).toFixed(4) + ')';
    });
  }
  function req() { if (!tick) { tick = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', function () { checkPending(); req(); }, { passive: true });
  addEventListener('resize', req);
  addEventListener('mousemove', function (e) {
    mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; req();
    mags.forEach(function (el) {
      var r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var dx = e.clientX - cx, dy = e.clientY - cy;
      var near = Math.abs(dx) < r.width / 2 + 40 && Math.abs(dy) < r.height / 2 + 40;
      el.style.translate = near ? (dx * 0.18).toFixed(1) + 'px ' + (dy * 0.28).toFixed(1) + 'px' : '0px 0px';
    });
  });
  function start() {
    scan(document.body); setTimeout(function () { checkPending(); req(); }, 60);
    new MutationObserver(function (ms) { ms.forEach(function (m) { m.addedNodes.forEach(scan); }); setTimeout(function () { checkPending(); req(); }, 60); }).observe(document.body, { childList: true, subtree: true });
  }
  setInterval(checkPending, 300);
  document.body ? start() : addEventListener('DOMContentLoaded', start);
})();
