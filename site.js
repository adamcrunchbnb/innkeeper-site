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

// Contact form, 2026-11-25. The orange buttons open one short form (name, property, email, phone) that is
// delivered to Adam's inbox by the form service. Without this file, or before a service key is set, the
// buttons stay plain email links, so the page never has a dead button.
(function () {
  var KEY = 'c7aec4b6-9ebe-4e32-985d-0bb2343d5713'; // Web3Forms access key (public by design); empty means the form is off and the email links stay
  var ENDPOINT = 'https://api.web3forms.com/submit';
  if (!KEY || !('HTMLDialogElement' in window) || !window.fetch) return;
  var broker = /brokers/.test(location.pathname);
  var dlg = null, opener = null;
  function field(name, label, type, auto, mode) {
    return '<label for="rf-' + name + '">' + label + '</label>' +
      '<input id="rf-' + name + '" name="' + name + '" type="' + type + '" autocomplete="' + auto + '"' +
      (mode ? ' inputmode="' + mode + '"' : '') + ' required>';
  }
  function build() {
    dlg = document.createElement('dialog');
    dlg.className = 'reach';
    dlg.setAttribute('aria-labelledby', 'reach-title');
    dlg.innerHTML =
      '<button type="button" class="x" aria-label="Close">&times;</button>' +
      '<div class="ask">' +
        '<h2 id="reach-title"></h2>' +
        '<p>' + (broker ? 'Tell Adam who you are and he will call you himself, usually the same day.'
                        : 'Tell Adam where to reach you and he will call you himself, usually the same day.') + '</p>' +
        '<form novalidate>' +
          field('name', 'Your name', 'text', 'name') +
          field('property', broker ? 'Brokerage, and the property if you have one in mind' : 'Property name and town', 'text', 'organization') +
          field('email', 'Email', 'email', 'email', 'email') +
          field('phone', 'Phone', 'tel', 'tel', 'tel') +
          '<input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
          '<p class="err" role="alert" hidden></p>' +
          '<button type="submit" class="btn">Send</button>' +
        '</form>' +
        '<p class="alt">Prefer to talk now? Call <a href="tel:+17605825260">(760) 582-5260</a>.</p>' +
      '</div>' +
      '<div class="done" hidden tabindex="-1">' +
        '<h2>Thank you.</h2>' +
        '<p>Your note is with Adam. He will reply himself, usually the same day.</p>' +
        '<button type="button" class="btn" data-k="close">Close</button>' +
      '</div>';
    document.body.appendChild(dlg);
    var form = dlg.querySelector('form'), err = dlg.querySelector('.err'), send = form.querySelector('.btn');
    dlg.querySelector('.x').addEventListener('click', function () { dlg.close(); });
    dlg.querySelector('[data-k="close"]').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () { if (opener && opener.focus) opener.focus(); });
    function fail(msg) { err.textContent = msg; err.hidden = false; }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      err.hidden = true;
      var bad = null;
      ['name', 'property', 'email', 'phone'].forEach(function (n) {
        var el = form.elements[n], ok = el.value.trim() !== '' && el.checkValidity();
        if (n === 'phone' && el.value.replace(/\D/g, '').length < 7) ok = false;
        el.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (!ok && !bad) bad = el;
      });
      if (bad) { fail('Please check the highlighted field.'); bad.focus(); return; }
      if (form.elements.botcheck.checked) { showDone(); return; }
      send.disabled = true; send.textContent = 'Sending';
      var v = function (n) { return form.elements[n].value.trim(); };
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: KEY,
          subject: (broker ? 'Broker inquiry: ' : 'Free consultation: ') + v('property'),
          from_name: 'The Innkeeper Agency website',
          name: v('name'), property: v('property'), email: v('email'), phone: v('phone'),
          page: broker ? 'For brokers' : 'Home',
          button: dlg.querySelector('#reach-title').textContent
        })
      }).then(function (r) { return r.json().then(function (j) { return r.ok && j && j.success; }); })
        .then(function (ok) { if (ok) showDone(); else throw new Error('not sent'); })
        .catch(function () {
          fail('That did not send. Please email adam@theinnkeeperagency.com or call (760) 582-5260.');
        })
        .then(function () { send.disabled = false; send.textContent = 'Send'; });
    });
    function showDone() {
      form.reset();
      dlg.querySelector('.ask').hidden = true;
      var d = dlg.querySelector('.done'); d.hidden = false; d.focus();
    }
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.btn[href^="mailto:"]');
    if (!a || (dlg && dlg.contains(a))) return;
    e.preventDefault();
    if (!dlg) build();
    opener = a;
    dlg.querySelector('.ask').hidden = false;
    dlg.querySelector('.done').hidden = true;
    dlg.querySelector('.err').hidden = true;
    dlg.querySelector('#reach-title').textContent = a.textContent.trim();
    dlg.showModal();
    dlg.querySelector('input').focus();
  });
})();
