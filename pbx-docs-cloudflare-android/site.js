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
