/* own-pbx docs — docs.ownpbx.org */
(function () {
  var root = document.documentElement;
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---- theme toggle (initial theme is set inline in <head>) ---- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('.theme-btn');
    if (!t) return;
    var dark = root.getAttribute('data-theme') === 'dark' ||
      (!root.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    var next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    store('ownpbx-theme', next);
  });

  /* ---- mobile nav ---- */
  document.addEventListener('click', function (e) {
    if (e.target.closest('.menu-btn')) { document.body.classList.toggle('nav-open'); return; }
    if (e.target.closest('.scrim') || (document.body.classList.contains('nav-open') && e.target.closest('.sidebar a'))) {
      document.body.classList.remove('nav-open');
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    /* keep the active sidebar item in view */
    var act = document.querySelector('.sidebar a.active');
    if (act && act.scrollIntoView) { var sb = document.querySelector('.sidebar'); if (act.offsetTop > sb.clientHeight - 80) sb.scrollTop = act.offsetTop - 120; }

    /* ---- "On this page" scroll tracking ---- */
    var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc ol a'));
    if (tocLinks.length) {
      var heads = tocLinks.map(function (a) { return document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))); });
      var ticking = false;
      function spy() {
        ticking = false;
        var y = window.scrollY + 110, idx = -1;
        for (var i = 0; i < heads.length; i++) { if (heads[i] && heads[i].offsetTop <= y) idx = i; }
        if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) idx = heads.length - 1;
        tocLinks.forEach(function (a, i) { a.classList.toggle('on', i === idx); });
      }
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
      spy();
    }

    /* ---- copy buttons on code blocks ---- */
    document.querySelectorAll('.content pre').forEach(function (pre) {
      var btn = document.createElement('button');
      btn.className = 'copy-btn'; btn.type = 'button'; btn.textContent = 'Copy';
      btn.addEventListener('click', function () {
        var code = pre.querySelector('code');
        var text = (code || pre).innerText.replace(/\n?Copy$/, '');
        var done = function () { btn.textContent = 'Copied'; btn.classList.add('done'); setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('done'); }, 1500); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
        else { var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) {} ta.remove(); }
      });
      pre.appendChild(btn);
    });

    /* ---- external links open in a new tab ---- */
    document.querySelectorAll('a[href^="http://"], a[href^="https://"]').forEach(function (a) {
      if (a.hostname === location.hostname) return;
      a.target = '_blank'; a.rel = 'noopener noreferrer';
    });
  });

  /* ---- search ---- */
  var modal, input, list, items = [], sel = 0, loaded = false;
  var BASE = document.documentElement.getAttribute('data-base') || '';
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hl(s, terms) {
    var out = esc(s);
    terms.forEach(function (t) { if (t.length < 2) return; out = out.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>'); });
    return out;
  }
  function snippet(text, terms) {
    var lo = text.toLowerCase(), at = -1;
    for (var i = 0; i < terms.length && at < 0; i++) at = lo.indexOf(terms[i]);
    if (at < 0) return text.slice(0, 150);
    var s = Math.max(0, at - 50);
    return (s > 0 ? '… ' : '') + text.slice(s, s + 170);
  }
  function run() {
    var q = input.value.trim().toLowerCase();
    if (!loaded) { list.innerHTML = '<div class="search-empty">Loading…</div>'; return; }
    if (!q) { list.innerHTML = '<div class="search-empty">Search pages, sections, commands and settings.</div>'; items = []; return; }
    var terms = q.split(/\s+/).filter(Boolean);
    var res = [];
    (window.OWNPBX_SEARCH || []).forEach(function (d) {
      var title = d.t.toLowerCase(), page = d.p.toLowerCase(), body = d.x.toLowerCase(), score = 0, ok = true;
      terms.forEach(function (t) {
        var s = 0;
        if (title.indexOf(t) >= 0) s += title.indexOf(t) === 0 ? 14 : 9;
        if (page.indexOf(t) >= 0) s += 3;
        var n = body.split(t).length - 1; if (n) s += Math.min(n, 6);
        if (!s) ok = false; score += s;
      });
      if (title === q) score += 20;
      if (ok) res.push({ d: d, s: score + (d.h ? 0 : 1) });
    });
    res.sort(function (a, b) { return b.s - a.s; });
    res = res.slice(0, 30);
    sel = 0;
    if (!res.length) { list.innerHTML = '<div class="search-empty">No results for “' + esc(input.value.trim()) + '”.</div>'; items = []; return; }
    list.innerHTML = res.map(function (r, i) {
      var d = r.d;
      return '<a href="' + BASE + d.u + '"' + (i === 0 ? ' class="sel"' : '') + '><span class="p">' + esc(d.p) + '</span><div class="t">' + hl(d.t, terms) + '</div><span class="s">' + hl(snippet(d.x, terms), terms) + '</span></a>';
    }).join('');
    items = Array.prototype.slice.call(list.querySelectorAll('a'));
  }
  function move(d) {
    if (!items.length) return;
    items[sel].classList.remove('sel');
    sel = (sel + d + items.length) % items.length;
    items[sel].classList.add('sel');
    items[sel].scrollIntoView({ block: 'nearest' });
  }
  function openSearch() {
    if (!modal) {
      modal = document.querySelector('.search-modal');
      input = modal.querySelector('input'); list = modal.querySelector('.search-results');
      input.addEventListener('input', run);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
        else if (e.key === 'Enter' && items[sel]) { e.preventDefault(); items[sel].click(); }
      });
      modal.addEventListener('click', function (e) { if (e.target === modal) closeSearch(); if (e.target.closest('.search-results a')) closeSearch(); });
    }
    if (!loaded && !document.getElementById('search-index')) {
      var s = document.createElement('script');
      s.id = 'search-index'; s.src = BASE + 'assets/search-index.js';
      s.onload = function () { loaded = true; run(); };
      document.head.appendChild(s);
    }
    modal.classList.add('open'); document.body.classList.add('modal-open');
    run(); input.focus(); input.select();
  }
  function closeSearch() { if (modal) { modal.classList.remove('open'); document.body.classList.remove('modal-open'); } }
  document.addEventListener('click', function (e) { if (e.target.closest('.search-btn')) { e.preventDefault(); openSearch(); } });
  document.addEventListener('keydown', function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || '')) || e.target.isContentEditable;
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); openSearch(); }
    else if (e.key === '/' && !typing) { e.preventDefault(); openSearch(); }
    else if (e.key === 'Escape' && modal && modal.classList.contains('open')) closeSearch();
  });
})();

// photo pop-out: gallery photos open in an overlay on the same page —
// the plain links used to take readers off the page to the bare image
// file. Close with the X button, a tap/click outside the photo, or Esc.
// The < > arrows (or Arrow keys, or a sideways swipe) move between the
// photos of the gallery you opened. Zoom: tap/click the photo
// (toggles), mouse wheel, or pinch; drag to pan while zoomed.
document.addEventListener('DOMContentLoaded', function () {
  var links = Array.prototype.slice.call(document.querySelectorAll(
    '.shots a[href], main a[href$=".png"], main a[href$=".jpg"], main a[href$=".jpeg"], main a[href$=".webp"]'));
  if (!links.length) return;

  // group links by their gallery so the arrows stay inside it
  var groups = [], byLink = new Map();
  links.forEach(function (a) {
    var g = a.closest('.shots');
    var grp = null;
    groups.forEach(function (x) { if (x.el === g) grp = x; });
    if (!grp) { grp = { el: g, items: [] }; groups.push(grp); }
    byLink.set(a, { grp: grp, idx: grp.items.length });
    grp.items.push(a);
  });

  var box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Photo viewer');
  box.innerHTML = '<span class="lightbox-count"></span>' +
    '<button class="lightbox-close" type="button" aria-label="Close photo">&times;</button>' +
    '<button class="lightbox-nav lightbox-prev" type="button" aria-label="Previous photo">&#8249;</button>' +
    '<figure><img alt=""><figcaption></figcaption></figure>' +
    '<button class="lightbox-nav lightbox-next" type="button" aria-label="Next photo">&#8250;</button>' +
    '<div class="lightbox-hint">&#8249; &#8250; arrows or swipe to browse &middot; tap the photo to zoom &middot; tap outside to close</div>';
  document.body.appendChild(box);
  var img = box.querySelector('img');
  var cap = box.querySelector('figcaption');
  var count = box.querySelector('.lightbox-count');
  var closeBtn = box.querySelector('.lightbox-close');
  var prevBtn = box.querySelector('.lightbox-prev');
  var nextBtn = box.querySelector('.lightbox-next');
  var cur = null, curIdx = 0;
  var scale = 1, tx = 0, ty = 0;

  function apply() {
    img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
    img.classList.toggle('zoomed', scale > 1);
  }
  function show() {
    var a = cur.items[curIdx];
    var thumb = a.querySelector('img');
    img.src = a.getAttribute('href');
    img.alt = thumb ? thumb.alt : '';
    var fig = a.closest('figure');
    cap.textContent = (fig && fig.querySelector('figcaption')) ? fig.querySelector('figcaption').textContent : img.alt;
    count.textContent = (curIdx + 1) + ' / ' + cur.items.length;
    var multi = cur.items.length > 1;
    prevBtn.style.display = multi ? '' : 'none';
    nextBtn.style.display = multi ? '' : 'none';
    scale = 1; tx = 0; ty = 0; apply();
  }
  function step(d) {
    if (!cur || cur.items.length < 2) return;
    curIdx = (curIdx + d + cur.items.length) % cur.items.length;
    show();
  }
  function open(a) {
    var info = byLink.get(a);
    cur = info.grp; curIdx = info.idx;
    show();
    box.classList.add('open');
    document.body.classList.add('lightbox-open');
    closeBtn.focus();
  }
  function close() {
    box.classList.remove('open');
    document.body.classList.remove('lightbox-open');
    img.removeAttribute('src');
    cur = null;
  }
  links.forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); open(a); });
  });
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
  nextBtn.addEventListener('click', function (e) { e.stopPropagation(); step(1); });
  // anything in the overlay that isn't the photo itself closes it
  box.addEventListener('click', function (e) { if (e.target !== img) close(); });
  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  });
  img.addEventListener('dragstart', function (e) { e.preventDefault(); });
  img.addEventListener('dblclick', function (e) { e.preventDefault(); });

  var pointers = new Map(), pinchD = 0;
  var dragId = null, lastX = 0, lastY = 0, downX = 0, downY = 0, downAt = 0;
  img.addEventListener('pointerdown', function (e) {
    img.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      var p = Array.from(pointers.values());
      pinchD = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      dragId = null;
    } else {
      dragId = e.pointerId;
      lastX = downX = e.clientX; lastY = downY = e.clientY; downAt = Date.now();
    }
  });
  img.addEventListener('pointermove', function (e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      var p = Array.from(pointers.values());
      var d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      if (pinchD > 0) scale = Math.min(4, Math.max(1, scale * d / pinchD));
      pinchD = d;
      if (scale === 1) { tx = 0; ty = 0; }
      apply();
    } else if (dragId === e.pointerId && scale > 1) {
      tx += e.clientX - lastX; ty += e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY; apply();
    }
  });
  function endPointer(e) {
    var wasDrag = dragId === e.pointerId;
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchD = 0;
    if (wasDrag) {
      dragId = null;
      var dx = e.clientX - downX, dy = e.clientY - downY;
      if (Date.now() - downAt < 300 && Math.hypot(dx, dy) < 8) {
        // a quick tap that didn't move toggles the zoom
        scale = scale > 1 ? 1 : 2.5;
        if (scale === 1) { tx = 0; ty = 0; }
        apply();
      } else if (scale === 1 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        // a sideways swipe at normal size moves between photos
        step(dx < 0 ? 1 : -1);
      }
    }
  }
  img.addEventListener('pointerup', endPointer);
  img.addEventListener('pointercancel', endPointer);
  img.addEventListener('wheel', function (e) {
    e.preventDefault();
    scale = Math.min(4, Math.max(1, scale * (e.deltaY < 0 ? 1.15 : 0.87)));
    if (scale === 1) { tx = 0; ty = 0; }
    apply();
  }, { passive: false });
});

