// mobile sidebar toggle
function toggleNav() {
  document.getElementById('sidebar').classList.toggle('open');
}
document.addEventListener('click', function (e) {
  var sb = document.getElementById('sidebar');
  if (sb && sb.classList.contains('open') && !sb.contains(e.target) && !e.target.closest('.menu-btn')) {
    sb.classList.remove('open');
  }
});

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

// copy buttons on code blocks
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('pre').forEach(function (pre) {
    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.addEventListener('click', function () {
      var code = pre.querySelector('code');
      var text = code ? code.innerText : pre.innerText;
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = 'Copied!';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
      });
    });
    pre.appendChild(btn);
  });
});

/* External links (demo, GitHub, voip.ms, ...) open in a new tab;
   internal docs links are relative and stay in this window. */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('a[href^="http://"], a[href^="https://"]').forEach(function (a) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });
});
