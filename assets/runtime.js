(function(){
var TPL = window.__TPL, SRC = window.__SRC;
function DCLogic(props){ this.props = props || {}; this.state = {}; }
DCLogic.prototype.setState = function(u){ var n = typeof u === 'function' ? u(this.state, this.props) : u; this.state = Object.assign({}, this.state, n); if (this.__update) this.__update(); };
DCLogic.prototype.forceUpdate = function(){ if (this.__update) this.__update(); };
DCLogic.prototype.renderVals = function(){ return {}; };
var classes = {}, parsed = {};
function getClass(n){ if (!classes[n]) { var src = SRC[n] || 'class Component extends DCLogic {}'; classes[n] = new Function('DCLogic','React', src + '\nreturn Component;')(DCLogic, { createElement: function(){ return null; } }); } return classes[n]; }
function getNodes(n){ if (!parsed[n]) { var t = document.createElement('template'); t.innerHTML = TPL[n]; parsed[n] = Array.prototype.slice.call(t.content.childNodes); } return parsed[n]; }
function lookup(p, scope){ p = p.trim(); if (p === 'true') return true; if (p === 'false') return false; if (p === 'null') return null; if (/^-?\d+(\.\d+)?$/.test(p)) return +p; var v = scope, ks = p.split('.'); for (var i = 0; i < ks.length; i++) { if (v == null) return undefined; v = v[ks[i]]; } return v; }
function interp(str, scope){ var m = str.match(/^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/); if (m) return lookup(m[1], scope); return str.replace(/\{\{\s*([^}]+?)\s*\}\}/g, function(_, p){ var v = lookup(p, scope); return v == null ? '' : String(v); }); }
var hoverCss = {}, hoverN = 0, sheet = document.createElement('style'); document.head.appendChild(sheet);
function hoverClass(kind, css){ var key = kind + '|' + css; if (!hoverCss[key]) { var c = 'dch' + (hoverN++); hoverCss[key] = c; var rules = css.split(';').filter(function(x){ return x.trim(); }).map(function(x){ return x.trim() + ' !important'; }).join(';'); var pseudo = kind === 'hover' ? ':hover' : kind === 'active' ? ':active' : kind === 'focus' ? ':focus' : kind === 'before' ? '::before' : '::after'; sheet.appendChild(document.createTextNode('.' + c + pseudo + '{' + rules + '}')); } return hoverCss[key]; }
function mapHref(v){ if (typeof v !== 'string') return v; if (/^(https?:|tel:|mailto:)/.test(v)) return v; var m = v.match(/^(\w+)\.dc\.html(?:\?id=(\w+))?(?:#(.+))?$/); if (m) { var pg = m[1].toLowerCase(); if (pg === 'case') return '#/case/' + (m[2] || '001'); return '#/' + pg + (m[3] ? '/' + m[3] : ''); } if (v.charAt(0) === '#' && v.charAt(1) !== '/') return '#/' + (window.__route ? window.__route.page : 'home') + '/' + v.slice(1); return v; }
function bindEvents(el, h){ el.__h = h || {}; el.__ev = el.__ev || {}; Object.keys(el.__h).forEach(function(e){ if (!el.__ev[e]) { el.__ev[e] = 1; el.addEventListener(e, function(ev){ var f = el.__h[e]; if (f) f(ev); }); } }); }
function placeholder(label){ var d = document.createElement('div'); d.setAttribute('style', 'position:absolute;inset:0;display:flex;align-items:flex-end;padding:14px;box-sizing:border-box;background:repeating-linear-gradient(135deg,rgba(40,38,36,.045) 0 1px,transparent 1px 10px);font:10px/1.5 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.06em;color:#85817D;'); d.textContent = label || 'IMAGE'; return d; }

var __slotDB = null; function slotDB(){ if (__slotDB) return __slotDB; __slotDB = new Promise(function(res){ try { var q = indexedDB.open('vivid-art-slots', 1); q.onupgradeneeded = function(){ q.result.createObjectStore('s'); }; q.onsuccess = function(){ res(q.result); }; q.onerror = function(){ res(null); }; } catch(e){ res(null); } }); return __slotDB; }
function slotGet(id){ return slotDB().then(function(db){ return db ? new Promise(function(res){ var t = db.transaction('s').objectStore('s').get(id); t.onsuccess = function(){ res(t.result || null); }; t.onerror = function(){ res(null); }; }) : null; }); }
function slotSet(id, v){ return slotDB().then(function(db){ if (!db) return; var st = db.transaction('s', 'readwrite').objectStore('s'); if (v) st.put(v, id); else st.delete(id); }); }
function uploadSlot(id, label, src){
  var __M = (window.__CMS && window.__CMS.media && window.__CMS.media.m) || {}; if (id && __M['slot:' + id]) src = __M['slot:' + id];
  var box = document.createElement('div'); box.style.cssText = 'position:absolute;inset:0;'; if (id) box.setAttribute('data-slot-id', id); box.__slot = (id || '') + '|' + (src || ''); var img;
  var img = document.createElement('img'); img.alt = ''; img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none'; img.draggable = false;
  var vid = document.createElement('video'); vid.muted = true; vid.loop = true; vid.autoplay = true; vid.playsInline = true; vid.setAttribute('playsinline', ''); vid.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none'; var ph = placeholder(label); ph.setAttribute('data-ph', '1'); var btns = document.createElement('div'); btns.style.cssText = 'position:absolute;right:10px;bottom:10px;display:none!important;gap:6px;z-index:2;opacity:0;transition:opacity .3s';
  function mk(t){ var b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.style.cssText = 'font:12px/1 Pretendard Variable,sans-serif;padding:9px 12px;border-radius:999px;border:1px solid #282624;background:rgba(255,255,255,.95);color:#282624;cursor:pointer'; return b; }
  var up = mk('＋ 이미지'), adj = mk('위치·크기'), del = mk('삭제'); adj.style.display = 'none'; del.style.display = 'none'; btns.appendChild(up); btns.appendChild(adj); btns.appendChild(del);
  var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*,video/*'; inp.style.display = 'none';
  box.appendChild(img); box.appendChild(vid); box.appendChild(ph); box.appendChild(btns); box.appendChild(inp);
  var pos = { x: 50, y: 50, s: 1 }, editing = false, hasMedia = false;
  var saveT = null; function applyPos(){ if (editing && id) { clearTimeout(saveT); saveT = setTimeout(function(){ slotSet(id + '#pos', JSON.stringify(pos)); }, 250); } [img, vid].forEach(function(m){ m.style.objectPosition = pos.x + '% ' + pos.y + '%'; m.style.transformOrigin = pos.x + '% ' + pos.y + '%'; m.style.transform = 'scale(' + pos.s + ')'; }); }
  var bar = document.createElement('div'); bar.style.cssText = 'position:absolute;left:8px;right:8px;bottom:8px;z-index:3;display:none;flex-wrap:wrap;align-items:center;gap:6px;padding:8px;border-radius:16px;background:rgba(255,255,255,.96);box-shadow:0 8px 24px -10px rgba(40,38,36,.4);font:12px/1 Pretendard Variable,sans-serif;color:#282624';
  var zl = document.createElement('span'); zl.textContent = '크기'; var zr = document.createElement('input'); zr.type = 'range'; zr.min = '1'; zr.max = '3'; zr.step = '0.01'; zr.style.cssText = 'flex:1;min-width:40px;accent-color:#B98A90';
  var rs = mk('초기화'), ok = mk('완료'); [rs, ok].forEach(function(b){ b.style.padding = '7px 10px'; }); ok.style.background = '#282624'; ok.style.color = '#FFFFFF';
  bar.appendChild(zl); bar.appendChild(zr); bar.appendChild(rs); bar.appendChild(ok); box.appendChild(bar);
  var hint = document.createElement('div'); hint.textContent = '드래그해서 위치 이동 · 휠/슬라이더로 크기'; hint.style.cssText = 'position:absolute;left:50%;top:12px;transform:translateX(-50%);z-index:3;display:none;white-space:nowrap;padding:7px 12px;border-radius:999px;background:rgba(40,38,36,.8);color:#FFFFFF;font:11.5px/1 Pretendard Variable,sans-serif;pointer-events:none'; box.appendChild(hint);
  function savePos(){ if (id) slotSet(id + '#pos', JSON.stringify(pos)); }
  function setEdit(on){ editing = on; bar.style.display = on ? 'flex' : 'none'; hint.style.display = on && box.clientWidth > 300 ? 'block' : 'none'; btns.style.display = on ? 'none' : 'flex'; box.style.outline = on ? '2px solid #B98A90' : ''; box.style.outlineOffset = on ? '-2px' : ''; box.style.cursor = on ? 'grab' : ''; box.style.zIndex = on ? '5' : ''; zr.value = pos.s; if (!on) savePos(); }
  function startEdit(e){ return; if (e) { e.preventDefault(); e.stopPropagation(); } setEdit(true); }
  adj.addEventListener('click', startEdit); box.addEventListener('dblclick', startEdit);
  box.addEventListener('click', function(e){ if (editing && !bar.contains(e.target)) { e.preventDefault(); e.stopPropagation(); } else if (editing) { e.preventDefault(); } }, true);
  ok.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); setEdit(false); });
  rs.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); pos = { x: 50, y: 50, s: 1 }; zr.value = 1; applyPos(); });
  zr.addEventListener('input', function(e){ e.stopPropagation(); pos.s = parseFloat(zr.value); applyPos(); }); zr.addEventListener('click', function(e){ e.stopPropagation(); e.preventDefault(); });
  box.addEventListener('wheel', function(e){ if (!editing) return; e.preventDefault(); pos.s = Math.min(3, Math.max(1, pos.s - e.deltaY * 0.002)); zr.value = pos.s; applyPos(); }, { passive: false });
  var drag = null; box.addEventListener('pointerdown', function(e){ if (!editing || e.target === zr || bar.contains(e.target)) return; e.preventDefault(); drag = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y }; box.style.cursor = 'grabbing'; try { box.setPointerCapture(e.pointerId); } catch(_){} });
  box.addEventListener('pointermove', function(e){ if (!drag) return; var r = box.getBoundingClientRect(); pos.x = Math.min(100, Math.max(0, drag.px - (e.clientX - drag.x) / r.width * 100 / pos.s * 1.6)); pos.y = Math.min(100, Math.max(0, drag.py - (e.clientY - drag.y) / r.height * 100 / pos.s * 1.6)); applyPos(); });
  box.addEventListener('pointerup', function(){ if (drag) { drag = null; box.style.cursor = 'grab'; } });
  document.addEventListener('keydown', function(e){ if (editing && e.key === 'Escape') setEdit(false); });
  function show(u, user){ hasMedia = !!u; adj.style.display = u ? '' : 'none'; var isV = u && /^data:video\//.test(u); if (u && isV) { vid.src = u; vid.style.display = 'block'; img.style.display = 'none'; img.removeAttribute('src'); ph.style.display = 'none'; try { vid.play(); } catch(e){} } else if (u) { img.src = u; img.style.display = 'block'; vid.style.display = 'none'; vid.removeAttribute('src'); ph.style.display = 'none'; } else { img.removeAttribute('src'); img.style.display = 'none'; vid.removeAttribute('src'); vid.style.display = 'none'; ph.style.display = 'flex'; } del.style.display = user ? '' : 'none'; btns.style.opacity = u ? '0' : '1'; }
  box.addEventListener('mouseenter', function(){ btns.style.opacity = '1'; }); box.addEventListener('mouseleave', function(){ if (img.style.display === 'block') btns.style.opacity = '0'; });
  function take(file){ return; if (!file || !/^(image|video)\//.test(file.type)) return; var fr = new FileReader(); fr.onload = function(){ show(fr.result, true); if (id) slotSet(id, fr.result); }; fr.readAsDataURL(file); }
  up.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); inp.click(); });
  del.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); if (id) slotSet(id, null); show(src || '', false); });
  inp.addEventListener('click', function(e){ e.stopPropagation(); }); inp.addEventListener('change', function(){ take(inp.files[0]); inp.value = ''; });
  
  box.addEventListener('dragleave', function(){ box.style.outline = ''; });
  box.addEventListener('drop', function(e){ e.preventDefault(); e.stopPropagation(); box.style.outline = ''; take(e.dataTransfer.files[0]); });
  show(src || '', false);
  return box;
}
function renderNode(n, scope, ctx){
  if (n.nodeType === 3) return [document.createTextNode(interp(n.data, scope) == null ? '' : String(interp(n.data, scope)))];
  if (n.nodeType !== 1) return [];
  var tag = n.localName, out = [], i;
  if (tag === 'sc-for') { var list = lookup((n.getAttribute('list') || '').replace(/[{}]/g, ''), scope) || []; var as = n.getAttribute('as') || 'item'; list.forEach(function(item, idx){ var s = Object.create(scope); s[as] = item; s.$index = idx; renderKids(n, s, ctx).forEach(function(x){ out.push(x); }); }); return out; }
  if (tag === 'sc-if') { var v = lookup((n.getAttribute('value') || '').replace(/[{}]/g, ''), scope); return v ? renderKids(n, scope, ctx) : []; }
  if (tag === 'dc-import') { var host = document.createElement('div'); host.setAttribute('style', 'display:contents'); host.__a = { style: 'display:contents' }; var idx2 = ctx.idx++; host.__childRef = idx2;
    if (ctx.first) { var props = {}; Array.prototype.forEach.call(n.attributes, function(a){ if (a.name === 'name' || a.name.indexOf('hint-') === 0) return; props[a.name.replace(/-([a-z])/g, function(_, c){ return c.toUpperCase(); })] = interp(a.value, scope); }); ctx.inst.__kids[idx2] = mountComp(n.getAttribute('name'), props, host); host.__child = true; }
    return [host]; }
  if (tag === 'image-slot') { var isrc = n.getAttribute('src') ? interp(n.getAttribute('src'), scope) : ''; var sid = n.getAttribute('id') ? interp(n.getAttribute('id'), scope) : ''; return [uploadSlot(sid ? String(sid) : '', interp(n.getAttribute('placeholder') || '', scope), isrc ? String(isrc) : '')]; }
  var el = n.namespaceURI && n.namespaceURI !== 'http://www.w3.org/1999/xhtml' ? document.createElementNS(n.namespaceURI, n.localName) : document.createElement(tag);
  var attrs = {}, h = {}, cls = [];
  Array.prototype.forEach.call(n.attributes, function(a){ var nm = a.name; if (nm.indexOf('hint-') === 0) return; var v = interp(a.value, scope);
    if (/^on[a-z]+$/.test(nm) && typeof v === 'function') { h[nm.slice(2)] = v; return; }
    if (/^style-(hover|active|focus|before|after)$/.test(nm)) { cls.push(hoverClass(nm.slice(6), String(v))); return; }
    if (v == null || v === false) return; if (nm === 'href') v = mapHref(v); attrs[nm] = v; });
  if (cls.length) attrs['class'] = ((attrs['class'] ? attrs['class'] + ' ' : '') + cls.join(' '));
  Object.keys(attrs).forEach(function(k){ el.setAttribute(k, attrs[k] === true ? '' : attrs[k]); });
  el.__a = attrs; bindEvents(el, h);
  renderKids(n, scope, ctx).forEach(function(x){ el.appendChild(x); });
  return [el];
}
function renderKids(n, scope, ctx){ var out = []; var kids = n.localName === 'template' ? n.content.childNodes : n.childNodes; Array.prototype.forEach.call(kids, function(c){ renderNode(c, scope, ctx).forEach(function(x){ out.push(x); }); }); return out; }
function morph(a, b){
  if (a.__child) return;
  if (a.__slot != null || b.__slot != null) { if (a.__slot !== b.__slot) a.parentNode.replaceChild(b, a); return; }
  if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName) { a.parentNode.replaceChild(b, a); return; }
  if (a.nodeType === 3) { if (a.data !== b.data) a.data = b.data; return; }
  var oa = a.__a || {}, nb = b.__a || {}, k;
  for (k in nb) if (oa[k] !== nb[k]) a.setAttribute(k, nb[k] === true ? '' : nb[k]);
  for (k in oa) if (!(k in nb)) a.removeAttribute(k);
  a.__a = nb; bindEvents(a, b.__h);
  morphKids(a, b);
}
function morphKids(a, b){ var ac = Array.prototype.slice.call(a.childNodes), bc = Array.prototype.slice.call(b.childNodes); for (var i = 0; i < bc.length; i++) { if (i < ac.length) morph(ac[i], bc[i]); else a.appendChild(bc[i]); } for (var j = bc.length; j < ac.length; j++) if (!ac[j].__child) ac[j].remove(); }
function mountComp(name, props, host){
  var C = getClass(name), inst = new C(props); inst.props = props; inst.__kids = [];
  function build(first){ var vals = inst.renderVals() || {}; var scope = Object.assign({}, inst.props, vals); var ctx = { inst: inst, first: first, idx: 0 }; var f = document.createElement('div'); getNodes(name).forEach(function(nd){ renderNode(nd, scope, ctx).forEach(function(x){ f.appendChild(x); }); }); return f; }
  var f = build(true); while (f.firstChild) host.appendChild(f.firstChild);
  inst.__update = function(){ if (inst.__dead) return; morphKids(host, build(false)); };
  if (inst.componentDidMount) inst.componentDidMount();
  return inst;
}
function unmount(inst){ if (!inst) return; inst.__kids.forEach(unmount); inst.__dead = true; if (inst.componentWillUnmount) inst.componentWillUnmount(); }
var ROUTES = { home: 'Home', brand: 'Brand', program: 'Program', work: 'Work', 'case': 'Case', journal: 'Journal', contact: 'Contact' };
var TITLES = { home: 'VIVID ART — Personal Design Studio', brand: 'BRAND — VIVID ART', program: 'PROGRAM — VIVID ART', work: 'WORK — VIVID ART', 'case': 'CASE — VIVID ART', journal: 'JOURNAL — VIVID ART', contact: 'CONTACT — VIVID ART' };
var app = document.getElementById('app'), cur = null;
function go(){
  var h = location.hash.replace(/^#\/?/, '').split('/'); var ps = location.pathname.replace(/^\/+|\/+$/g,'').split('/')[0].replace(/\.html$/,''); var page = ROUTES[h[0]] ? h[0] : (ROUTES[ps] ? ps : 'home'); var arg = h[1] || '';
  window.__route = { page: page, arg: arg };
  var key = page + (page === 'case' ? '/' + arg : ''), changed = !cur || cur.key !== key;
  if (changed) { var first = !cur; if (cur) unmount(cur.inst); app.style.transition = 'none'; app.style.opacity = first ? '1' : '0'; app.innerHTML = ''; cur = { key: key, inst: mountComp(ROUTES[page], {}, app) }; document.title = TITLES[page]; window.scrollTo({ top: 0, behavior: 'instant' }); if (!first) setTimeout(function(){ app.style.transition = 'opacity .7s cubic-bezier(.22,.61,.36,1)'; app.style.opacity = '1'; }, 30); }
  if (arg && page !== 'case') setTimeout(function(){ var el = document.getElementById(arg); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: changed ? 'instant' : 'smooth' }); }, changed ? 120 : 10);
}
window.addEventListener('hashchange', go);
go();
})();
