/* ============================================================
   NIOBE BEAUTY — main.js
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     Nav: scroll shadow
  ---------------------------------------------------------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     Mobile menu
  ---------------------------------------------------------- */
  const toggle = document.querySelector('.nav__toggle');
  const mobile = document.querySelector('.nav__mobile');

  if (toggle && mobile) {
    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      mobile.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobile.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        mobile.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ----------------------------------------------------------
     Active nav link
  ---------------------------------------------------------- */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(l => {
    if (l.getAttribute('href') === page) l.classList.add('active');
  });

  /* ----------------------------------------------------------
     Announcement bar dismiss
  ---------------------------------------------------------- */
  const closeBtn = document.querySelector('.announce__close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const bar = closeBtn.closest('.announce');
      if (bar) {
        bar.style.display = 'none';
        sessionStorage.setItem('announce-dismissed', '1');
      }
    });
    // Re-hide if already dismissed this session
    if (sessionStorage.getItem('announce-dismissed')) {
      const bar = document.querySelector('.announce');
      if (bar) bar.style.display = 'none';
    }
  }

  /* ----------------------------------------------------------
     Intersection observer: fade-up / fade-in
  ---------------------------------------------------------- */
  const animated = document.querySelectorAll('.fade-up, .fade-in');
  if (animated.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    animated.forEach(el => obs.observe(el));
  } else {
    // Fallback: show everything if no IntersectionObserver
    animated.forEach(el => el.classList.add('in-view'));
  }

  /* ----------------------------------------------------------
     Smooth scroll for in-page anchors
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h')) || 72;
      window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - offset, behavior: 'smooth' });
    });
  });

  /* ----------------------------------------------------------
     Forms: client-side submit feedback
  ---------------------------------------------------------- */
  document.querySelectorAll('.form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      if (!btn) return;
      const orig = btn.textContent;
      btn.textContent = 'Sending\u2026';
      btn.disabled = true;
      // Replace with real fetch/API call in production
      setTimeout(() => {
        btn.textContent = 'Enquiry received';
        form.querySelectorAll('input, textarea, select').forEach(f => (f.value = ''));
        setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3000);
      }, 1200);
    });
  });

  /* ----------------------------------------------------------
     Gift card amount select: show custom field
  ---------------------------------------------------------- */
  const gcSelect = document.getElementById('gc-amount');
  const gcCustom = document.getElementById('gc-custom-wrap');
  if (gcSelect && gcCustom) {
    gcSelect.addEventListener('change', () => {
      gcCustom.style.display = gcSelect.value === 'custom' ? 'flex' : 'none';
    });
  }

})();

/* ============================================================
   BRANCH SELECTOR POPOVER
   ============================================================ */

(function () {
  'use strict';

  // Read locations from embedded JSON (present on treatments/packages pages)
  var locScript = document.getElementById('booking-locations');
  if (!locScript) return;

  var locations;
  try { locations = JSON.parse(locScript.textContent); } catch (e) { return; }
  if (!locations || !locations.length) return;

  // Build popover DOM
  var overlay = document.createElement('div');
  overlay.className = 'branch-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  var popover = document.createElement('div');
  popover.className = 'branch-popover';
  popover.setAttribute('role', 'dialog');
  popover.setAttribute('aria-label', 'Choose a location');
  popover.setAttribute('aria-modal', 'true');

  var header = document.createElement('div');
  header.className = 'branch-popover__header';
  header.textContent = 'Choose a location';
  popover.appendChild(header);

  locations.forEach(function (loc) {
    var a = document.createElement('a');
    a.className = 'branch-popover__item';
    a.href = loc.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    var city = document.createElement('span');
    city.className = 'branch-popover__city';
    city.textContent = loc.city;

    var name = document.createElement('span');
    name.className = 'branch-popover__name';
    name.textContent = loc.name;

    a.appendChild(city);
    a.appendChild(name);
    popover.appendChild(a);
  });

  document.body.appendChild(overlay);
  document.body.appendChild(popover);

  var activeBtn = null;

  function openPopover(btn) {
    activeBtn = btn;
    positionPopover(btn);
    popover.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Focus first item
    var first = popover.querySelector('.branch-popover__item');
    if (first) first.focus();
  }

  function closePopover() {
    popover.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    if (activeBtn) { activeBtn.focus(); activeBtn = null; }
  }

  function positionPopover(btn) {
    if (window.innerWidth <= 640) return; // Mobile: CSS handles fixed-bottom

    var rect = btn.getBoundingClientRect();
    var pw = popover.offsetWidth || 280;
    var ph = popover.offsetHeight || 240;
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    var top = rect.bottom + 8;
    var left = rect.left;

    // Flip up if not enough room below
    if (top + ph > vh - 16) top = rect.top - ph - 8;
    // Clamp horizontally
    if (left + pw > vw - 16) left = vw - pw - 16;
    if (left < 16) left = 16;

    popover.style.top  = top  + 'px';
    popover.style.left = left + 'px';
  }

  // Attach to all [data-book] triggers
  document.querySelectorAll('[data-book]').forEach(function (btn) {
    // Fallback href is /booking.html (set in template) — JS intercepts
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (popover.classList.contains('open') && activeBtn === btn) {
        closePopover();
      } else {
        openPopover(btn);
      }
    });
  });

  // Close on overlay click
  overlay.addEventListener('click', closePopover);

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && popover.classList.contains('open')) closePopover();
  });

  // Trap focus inside popover
  popover.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var items = Array.from(popover.querySelectorAll('.branch-popover__item'));
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

  // Reposition on resize
  window.addEventListener('resize', function () {
    if (popover.classList.contains('open') && activeBtn) positionPopover(activeBtn);
  }, { passive: true });

})();
