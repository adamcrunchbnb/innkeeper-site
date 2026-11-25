// The Innkeeper Agency, site-next. Small progressive enhancements; the page works fully without this file.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els = document.querySelectorAll('.reveal, .chart, .illus');
  if (!('IntersectionObserver' in window) || reduce) {
    els.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  // Phone action bar: appears once the hero button has scrolled away, hides again near the footer call card.
  var stick = document.querySelector('.stick');
  var heroBtn = document.querySelector('[data-cta="hero"]');
  var footer = document.querySelector('footer');
  if (stick && heroBtn && 'IntersectionObserver' in window) {
    var heroGone = false, footerIn = false;
    var update = function () { stick.classList.toggle('show', heroGone && !footerIn); };
    new IntersectionObserver(function (e) { heroGone = !e[0].isIntersecting; update(); }).observe(heroBtn);
    if (footer) new IntersectionObserver(function (e) { footerIn = e[0].isIntersecting; update(); }, { threshold: 0.15 }).observe(footer);
  } else if (stick) {
    stick.classList.add('show');
  }
})();

// Contact chooser. A mailto link does nothing on a computer with no mail app set up, so on a desktop
// the orange buttons open a small panel with Gmail, the mail app, a copy button and the phone number.
// On a phone, and without this file, the buttons stay plain email links.
(function () {
  if (!('HTMLDialogElement' in window)) return;
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
  var ADDRESS = 'adam@theinnkeeperagency.com';
  var dlg = null;
  function build() {
    dlg = document.createElement('dialog');
    dlg.className = 'reach';
    dlg.setAttribute('aria-labelledby', 'reach-title');
    dlg.innerHTML =
      '<button type="button" class="x" aria-label="Close">&times;</button>' +
      '<h2 id="reach-title"></h2>' +
      '<p>Your note goes straight to Adam, and he answers himself, usually the same day.</p>' +
      '<a class="btn" data-k="gmail" target="_blank" rel="noopener">Write it in Gmail</a>' +
      '<a class="opt" data-k="mail">Open my email app</a>' +
      '<button type="button" class="opt" data-k="copy">Copy ' + ADDRESS + '</button>' +
      '<a class="opt" href="tel:+17605825260">Or call (760) 582-5260</a>';
    document.body.appendChild(dlg);
    dlg.querySelector('.x').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.querySelector('[data-k="copy"]').addEventListener('click', function (e) {
      var b = e.currentTarget;
      var done = function () { b.textContent = 'Copied. Paste it into a new email.'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ADDRESS).then(done, function () { b.textContent = ADDRESS; });
      else b.textContent = ADDRESS;
    });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.btn[href^="mailto:"]');
    if (!a || (dlg && dlg.contains(a))) return;
    e.preventDefault();
    if (!dlg) build();
    var href = a.getAttribute('href');
    var q = href.indexOf('?') > -1 ? href.slice(href.indexOf('?') + 1) : '';
    var p = new URLSearchParams(q);
    dlg.querySelector('h2').textContent = a.textContent.trim();
    dlg.querySelector('[data-k="mail"]').setAttribute('href', href);
    dlg.querySelector('[data-k="gmail"]').setAttribute('href',
      'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(ADDRESS) +
      '&su=' + encodeURIComponent(p.get('subject') || '') + '&body=' + encodeURIComponent(p.get('body') || ''));
    dlg.querySelector('[data-k="copy"]').textContent = 'Copy ' + ADDRESS;
    dlg.showModal();
  });
})();
