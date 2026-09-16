/* ===== EUROPEA - Main JavaScript ===== */

(function () {
  'use strict';

  // --- Mobile Menu ---
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  const navOverlay = document.getElementById('navOverlay');

  function toggleMenu() {
    const isOpen = nav.classList.toggle('open');
    hamburger.classList.toggle('active');
    navOverlay.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMenu() {
    nav.classList.remove('open');
    hamburger.classList.remove('active');
    navOverlay.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleMenu);
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
  }

  // Close menu when clicking nav links
  document.querySelectorAll('.nav a:not(.nav-eshop)').forEach(function (link) {
    if (!link.closest('.lang-switch')) {
      link.addEventListener('click', closeMenu);
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
    }
  });

  // --- Smooth Scroll ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // --- Sticky Header Shadow + Overlay-on-hero ---
  var header = document.getElementById('header');
  var scrollTopBtn = document.getElementById('scrollTop');
  // Pages with a .page-hero (the SK service subpages) get a transparent header
  // that floats over the hero's gradient, then swaps to solid white once scrolled.
  // Add body class "enable-header-overlay" to opt in a page that doesn't have
  // .page-hero (e.g. a homepage variant), or "no-header-overlay" to opt a
  // .page-hero page back out (e.g. a "previous design" comparison variant).
  var wantsHeaderOverlay =
    (!!document.querySelector('.page-hero') || document.body.classList.contains('enable-header-overlay')) &&
    !document.body.classList.contains('no-header-overlay');

  // The logo keeps its brand colors (red/white hex icon) in the overlay state;
  // only its src is swapped to logo-overlay.svg, a copy with just the "EUROPEA"
  // wordmark recolored white so it reads against the navy hero gradient.
  var headerLogo = header ? header.querySelector('.logo') : null;
  var headerLogoSrc = headerLogo ? headerLogo.getAttribute('src') : null;
  var headerLogoOverlaySrc = headerLogoSrc ? headerLogoSrc.replace('logo.svg', 'logo-overlay.svg') : null;

  function updateHeaderState() {
    var scrollY = window.scrollY || window.pageYOffset;

    if (header) {
      if (wantsHeaderOverlay && scrollY <= 10) {
        header.classList.add('header-overlay');
        header.style.boxShadow = 'none';
        if (headerLogo && headerLogoOverlaySrc) headerLogo.src = headerLogoOverlaySrc;
      } else {
        header.classList.remove('header-overlay');
        header.style.boxShadow = scrollY > 10
          ? '0 2px 20px rgba(0,0,0,0.12)'
          : '0 2px 16px rgba(0,0,0,0.08)';
        if (headerLogo && headerLogoSrc) headerLogo.src = headerLogoSrc;
      }
    }

    // Scroll to top button
    if (scrollTopBtn) {
      if (scrollY > 400) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }

    // Active nav link highlighting
    updateActiveNav();
  }

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState);

  // Scroll to top button
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Active Nav Link ---
  function updateActiveNav() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav a[href^="#"]');
    var scrollY = window.scrollY || window.pageYOffset;

    sections.forEach(function (section) {
      var top = section.offsetTop - 100;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // --- Hero Banner (rotating image, cross-fade) ---
  document.querySelectorAll('.hero-banner-slides').forEach(function (wrap) {
    var slides = wrap.querySelectorAll('.hero-banner-slide');
    if (slides.length < 2) return; // nothing to rotate yet

    var index = Array.prototype.findIndex.call(slides, function (slide) {
      return slide.classList.contains('active');
    });
    if (index < 0) index = 0;

    setInterval(function () {
      slides[index].classList.remove('active');
      index = (index + 1) % slides.length;
      slides[index].classList.add('active');
    }, 4500);
  });

  // --- Contact Form (mailto) ---
  var form = document.getElementById('quoteForm');

  if (form) {
    // Preselect service from ?service= query param (links from service pages)
    var params = new URLSearchParams(window.location.search);
    var preselect = params.get('service');
    var serviceSelect = form.querySelector('#service');

    if (preselect && serviceSelect) {
      var hasOption = Array.prototype.some.call(serviceSelect.options, function (opt) {
        return opt.value === preselect;
      });
      if (hasOption) {
        serviceSelect.value = preselect;
      }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Validate
      var isValid = true;
      var fields = form.querySelectorAll('[required]');

      fields.forEach(function (field) {
        field.classList.remove('invalid');

        if (!field.value.trim()) {
          field.classList.add('invalid');
          isValid = false;
        }

        // Email validation
        if (field.type === 'email' && field.value.trim()) {
          var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(field.value.trim())) {
            field.classList.add('invalid');
            isValid = false;
          }
        }
      });

      if (!isValid) return;

      // Build mailto link
      var name = form.querySelector('#name').value.trim();
      var email = form.querySelector('#email').value.trim();
      var phone = form.querySelector('#phone').value.trim();
      var service = form.querySelector('#service');
      var serviceText = service.options[service.selectedIndex].text;
      var message = form.querySelector('#message').value.trim();

      var subject = encodeURIComponent('Cenová ponuka – ' + serviceText);
      var body = encodeURIComponent(
        'Meno: ' + name + '\n' +
        'E-mail: ' + email + '\n' +
        'Telefón: ' + (phone || 'neuvedený') + '\n' +
        'Služba: ' + serviceText + '\n' +
        'Správa:\n' + message
      );

      var mailtoLink = 'mailto:info@europea.sk?subject=' + subject + '&body=' + body;

      window.location.href = mailtoLink;
    });

    // Clear invalid state on input
    form.querySelectorAll('[required]').forEach(function (field) {
      field.addEventListener('input', function () {
        this.classList.remove('invalid');
      });
      field.addEventListener('change', function () {
        this.classList.remove('invalid');
      });
    });
  }

  // --- Intersection Observer for Animations ---
  if ('IntersectionObserver' in window) {
    var animateElements = document.querySelectorAll(
      '.service-card, .benefit-item, .stat-item, .info-item'
    );

    var observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';

          // Once the reveal finishes, drop the inline transform/transition so
          // CSS regains control — otherwise these inline styles permanently
          // pin transform, silently blocking hover effects like the lift on
          // .service-card (inline styles always beat CSS, hover included).
          el.addEventListener('transitionend', function handler(e) {
            if (e.target !== el) return;
            el.style.transform = '';
            el.style.transition = '';
            el.removeEventListener('transitionend', handler);
          });

          observer.unobserve(el);
        }
      });
    }, observerOptions);

    animateElements.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }

})();
