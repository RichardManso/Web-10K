/* ============================================================
   Axiome — interactions
   Toutes les animations sont désactivées si l'utilisateur a
   demandé une réduction des animations au niveau du système.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ----------------------------------------------------------
     1. Titre du héros : découpe en lignes masquées
     ---------------------------------------------------------- */
  (function heroTitle() {
    var title = $('#heroTitle');
    if (!title) return;
    $$('.line', title).forEach(function (line, i) {
      var span = document.createElement('span');
      span.innerHTML = line.innerHTML;
      span.style.setProperty('--d', (i * 110) + 'ms');
      line.innerHTML = '';
      line.appendChild(span);
    });
  })();

  /* ----------------------------------------------------------
     2. Révélation au défilement
     ---------------------------------------------------------- */
  var revealTargets = $$('.reveal, .divider, #heroTitle, .case, .step');

  revealTargets.forEach(function (el) {
    var d = el.getAttribute('data-delay');
    if (d) el.style.setProperty('--d', d + 'ms');
  });

  if (reduced || !('IntersectionObserver' in window)) {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
    $$('.count').forEach(function (el) { el.textContent = finalValue(el); });
  } else {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        $$('.count', entry.target).forEach(runCount);
        if (entry.target.classList.contains('count')) runCount(entry.target);
        revealIO.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealTargets.forEach(function (el) { revealIO.observe(el); });
  }

  /* ----------------------------------------------------------
     3. Compteurs chiffrés
     ---------------------------------------------------------- */
  function finalValue(el) {
    return (el.getAttribute('data-prefix') || '') +
           (el.getAttribute('data-to') || '0') +
           (el.getAttribute('data-suffix') || '');
  }

  function runCount(el) {
    if (el.dataset.done === '1') return;
    el.dataset.done = '1';
    var to = parseFloat(el.getAttribute('data-to')) || 0;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1400;
    var start = null;

    function frame(now) {
      if (start === null) start = now;
      var t = clamp((now - start) / dur, 0, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var val = Math.round(to * eased);
      el.textContent = prefix + val.toLocaleString('fr-FR') + suffix;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + to.toLocaleString('fr-FR') + suffix;
    }
    requestAnimationFrame(frame);
  }

  /* ----------------------------------------------------------
     4. Navigation : état collé, lien actif, indicateur
     ---------------------------------------------------------- */
  var nav = $('#nav');
  var navLinks = $$('.nav__links a[data-nav]');
  var indicator = $('#navIndicator');
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function moveIndicator(link) {
    if (!indicator || !link) return;
    indicator.style.width = link.offsetWidth + 'px';
    indicator.style.transform = 'translateX(' + link.offsetLeft + 'px)';
    indicator.classList.add('is-on');
  }

  navLinks.forEach(function (link) {
    link.addEventListener('mouseenter', function () { moveIndicator(link); });
  });
  var navLinksWrap = $('.nav__links');
  if (navLinksWrap) {
    navLinksWrap.addEventListener('mouseleave', function () {
      var active = navLinks.filter(function (a) { return a.classList.contains('is-active'); })[0];
      if (active) moveIndicator(active);
      else if (indicator) indicator.classList.remove('is-on');
    });
  }

  function updateActiveLink() {
    var probe = window.scrollY + window.innerHeight * 0.32;
    var current = null;
    sections.forEach(function (sec, i) {
      if (sec.offsetTop <= probe) current = navLinks[i];
    });
    navLinks.forEach(function (a) { a.classList.toggle('is-active', a === current); });
    if (current && navLinksWrap && !navLinksWrap.matches(':hover')) moveIndicator(current);
    else if (!current && indicator) indicator.classList.remove('is-on');
  }

  /* ----------------------------------------------------------
     5. Menu mobile
     ---------------------------------------------------------- */
  var burger = $('#burger');
  var mobileMenu = $('#mobileMenu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      burger.setAttribute('aria-label', open ? 'Ouvrir le menu' : 'Fermer le menu');
      mobileMenu.hidden = open;
    });
    $$('a', mobileMenu).forEach(function (a) {
      a.addEventListener('click', function () {
        burger.setAttribute('aria-expanded', 'false');
        mobileMenu.hidden = true;
      });
    });
  }

  /* ----------------------------------------------------------
     6. Boucle de défilement : progression, nav, parallaxe, méthode
     ---------------------------------------------------------- */
  var progressBar = $('#progressBar');
  var parallaxItems = $$('[data-parallax]');
  var steps = $$('.step');
  var methodMeter = $('#methodMeter');
  var methodStep = $('#methodStep');
  var ticking = false;

  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var y = window.scrollY;

    if (progressBar) progressBar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    if (nav) nav.classList.toggle('is-stuck', y > 12);

    if (!reduced) {
      parallaxItems.forEach(function (el) {
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0;
        var rect = el.getBoundingClientRect();
        var offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -speed;
        el.style.transform = 'translate3d(0,' + offset.toFixed(2) + 'px,0)';
      });
    }

    // Étape de méthode courante
    if (steps.length) {
      var anchor = window.innerHeight * 0.42;
      var idx = -1;
      steps.forEach(function (s, i) {
        var r = s.getBoundingClientRect();
        if (r.top <= anchor) idx = i;
      });
      steps.forEach(function (s, i) { s.classList.toggle('is-current', i === idx); });
      var pct = idx < 0 ? 0 : ((idx + 1) / steps.length) * 100;
      if (methodMeter) methodMeter.style.width = pct + '%';
      if (methodStep) methodStep.textContent = '0' + Math.max(1, idx + 1);
    }

    updateActiveLink();
    ticking = false;
  }

  function requestScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }

  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll);
  window.addEventListener('load', requestScroll);
  onScroll();

  /* ----------------------------------------------------------
     7. Halo curseur + boutons magnétiques + inclinaison cartes
     ---------------------------------------------------------- */
  if (isFine && !reduced) {
    var glow = $('#cursorGlow');
    var gx = window.innerWidth / 2, gy = window.innerHeight / 2;
    var tx = gx, ty = gy;

    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (glow) glow.classList.add('is-on');
    });

    (function glowLoop() {
      gx = lerp(gx, tx, 0.12);
      gy = lerp(gy, ty, 0.12);
      if (glow) glow.style.transform = 'translate3d(' + gx.toFixed(1) + 'px,' + gy.toFixed(1) + 'px,0)';
      requestAnimationFrame(glowLoop);
    })();

    // Boutons magnétiques
    $$('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2;
        var my = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + (mx * 0.18).toFixed(2) + 'px,' + (my * 0.28).toFixed(2) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });

    // Légère inclinaison des cartes
    $$('.tilt').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', (px * 4).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-py * 4).toFixed(2) + 'deg');
      });
      el.addEventListener('mouseleave', function () {
        el.style.setProperty('--ry', '0deg');
        el.style.setProperty('--rx', '0deg');
      });
    });
  }

  /* ----------------------------------------------------------
     8. Registre temps réel (valeurs qui bougent)
     ---------------------------------------------------------- */
  (function ledgerTicker() {
    var rows = $$('#ledgerRows b[data-step]');
    if (!rows.length || reduced) return;
    var ledger = $('.ledger');

    setInterval(function () {
      if (document.hidden) return;
      if (ledger && ledger.getBoundingClientRect().bottom < 0) return;
      var cell = rows[Math.floor(Math.random() * rows.length)];
      var step = parseInt(cell.getAttribute('data-step'), 10) || 1;
      var unit = cell.getAttribute('data-unit') || '';
      var base = parseInt(cell.getAttribute('data-tick'), 10) || 0;
      var delta = Math.round((Math.random() * 2 - 0.6) * step);
      var next = Math.max(1, base + delta);
      cell.setAttribute('data-tick', String(next));
      cell.textContent = next.toLocaleString('fr-FR') + unit;
      cell.classList.add('is-bump');
      setTimeout(function () { cell.classList.remove('is-bump'); }, 420);
    }, 1600);
  })();

  /* ----------------------------------------------------------
     9. Accordéon FAQ : ouverture/fermeture fluide
     ---------------------------------------------------------- */
  $$('.acc').forEach(function (acc) {
    var summary = $('summary', acc);
    var body = $('.acc__body', acc);
    if (!summary || !body) return;

    summary.addEventListener('click', function (e) {
      if (reduced) return;
      e.preventDefault();

      if (acc.open) {
        body.style.height = body.scrollHeight + 'px';
        requestAnimationFrame(function () {
          body.style.transition = 'height .35s cubic-bezier(0.22,1,0.36,1)';
          body.style.height = '0px';
        });
        body.addEventListener('transitionend', function done() {
          body.removeEventListener('transitionend', done);
          acc.open = false;
          body.style.transition = '';
          body.style.height = '';
        });
      } else {
        // Une seule question ouverte à la fois
        $$('.acc[open]').forEach(function (other) {
          if (other !== acc) other.open = false;
        });
        acc.open = true;
        var h = body.scrollHeight;
        body.style.height = '0px';
        requestAnimationFrame(function () {
          body.style.transition = 'height .35s cubic-bezier(0.22,1,0.36,1)';
          body.style.height = h + 'px';
        });
        body.addEventListener('transitionend', function done() {
          body.removeEventListener('transitionend', done);
          body.style.transition = '';
          body.style.height = '';
        });
      }
    });
  });

  /* ----------------------------------------------------------
     10. Formulaire de contact (démonstration, sans envoi réseau)
     ---------------------------------------------------------- */
  var form = $('#contactForm');
  if (form) {
    var status = $('#formStatus');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#f-name');
      var email = $('#f-email');
      var invalid = null;

      [name, email].forEach(function (field) {
        var ok = field.value.trim() !== '' &&
                 (field.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value));
        field.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (!ok && !invalid) invalid = field;
      });

      if (invalid) {
        status.textContent = 'Merci de renseigner votre nom et un e-mail valide.';
        invalid.focus();
        return;
      }

      var btn = $('button[type="submit"]', form);
      btn.disabled = true;
      var label = btn.textContent;
      btn.textContent = 'Envoi…';
      status.textContent = '';

      setTimeout(function () {
        btn.disabled = false;
        btn.textContent = label;
        form.reset();
        status.textContent = 'Demande enregistrée. Un associé vous répond sous 48 heures ouvrées.';
      }, 900);
    });
  }

  /* ----------------------------------------------------------
     11. Année de copyright
     ---------------------------------------------------------- */
  var yearSlot = $('[data-year]');
  if (yearSlot) yearSlot.textContent = String(new Date().getFullYear());

})();
