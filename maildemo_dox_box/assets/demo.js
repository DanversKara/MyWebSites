/* BearerMail demo — harmless client-side helpers only.
   This site is a static demonstration: no data is saved and nothing is sent anywhere. */
(function () {
  'use strict';

  // Toast
  let toastEl;
  function toast(msg, icon) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = (icon ? '<i class="bi ' + icon + '"></i>' : '') + '<span></span>';
    toastEl.querySelector('span').textContent = msg;
    requestAnimationFrame(() => toastEl.classList.add('show'));
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }
  window.demoToast = toast;

  // Copy to clipboard (this really copies — it demonstrates the feature and is harmless)
  window.demoCopy = function (text, btn, label) {
    const done = () => {
      if (btn) {
        const orig = btn.innerHTML;
        btn.classList.add('copied');
        btn.innerHTML = '<i class="bi bi-check2 me-1"></i>Copied';
        setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('copied'); }, 1800);
      }
      toast('Copied ' + (label || text), 'bi-clipboard-check');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, done);
    } else { done(); }
  };

  // Simple modal open/close by id
  window.demoModal = function (id, open) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('open', open !== false);
  };
  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-modal]');
    if (openBtn) { demoModal(openBtn.getAttribute('data-modal'), true); }
    if (e.target.closest('[data-close]')) {
      const m = e.target.closest('.modal-backdrop'); if (m) m.classList.remove('open');
    }
    if (e.target.classList && e.target.classList.contains('modal-backdrop')) {
      e.target.classList.remove('open');
    }
    // Any button explicitly marked demo-only shows a gentle note instead of acting
    const noop = e.target.closest('[data-demo-noop]');
    if (noop) {
      e.preventDefault();
      toast(noop.getAttribute('data-demo-noop') || 'Demo only — no changes are made', 'bi-info-circle');
    }
  });

  // Fake "add to calendar" flow used on the mail page
  window.demoAddToCalendar = function (title) {
    toast('Added “' + title + '” to your calendar', 'bi-calendar-check');
  };
})();
