/* ===== EUROPEA - Cookie consent & third-party embed gating =====
 *
 * The site itself sets no cookies and runs no analytics. The only thing that
 * needs consent is the embedded Google Map, which contacts Google and can set
 * cookies in the visitor's browser.
 *
 * So the map iframe ships WITHOUT a src attribute (the URL sits in data-src).
 * Nothing reaches Google until the visitor opts in — consent is asked for
 * before the request, not after it.
 */

(function () {
  'use strict';

  var KEY = 'europea-consent-v1';
  var texts = document.documentElement.lang === 'en'
    ? {
        title: 'Cookies and embedded maps',
        body: 'This site sets no cookies of its own and uses no analytics. We only ask before loading the embedded Google Map, which contacts Google and may set cookies. See our <a href="/en/cookie-policy.html">Cookie Policy</a> and <a href="/en/privacy-policy.html">Privacy Policy</a>.',
        accept: 'Allow map',
        reject: 'Decline',
        placeholder: 'The map is not loaded. Loading it contacts Google, which may set cookies and process your IP address.',
        button: 'Load map',
        openMaps: 'Or open in Google Maps'
      }
    : {
        title: 'Cookies a vložené mapy',
        body: 'Táto stránka nenastavuje vlastné cookies a nepoužíva analytiku. Pýtame sa len pred načítaním vloženej mapy Google, ktorá kontaktuje Google a môže nastaviť cookies. Pozrite si <a href="/zasady-cookie/">Zásady používania cookies</a> a <a href="/ochrana-sukromia/">Ochranu osobných údajov</a>.',
        accept: 'Povoliť mapu',
        reject: 'Odmietnuť',
        placeholder: 'Mapa nie je načítaná. Jej načítaním sa kontaktuje Google, ktorý môže nastaviť cookies a spracovať vašu IP adresu.',
        button: 'Načítať mapu',
        openMaps: 'Alebo otvoriť v Google Maps'
      };

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }

  function write(value) {
    // Storage can throw (private mode, blocked site data). Consent still applies
    // for this page view; it just won't be remembered on the next one.
    try { localStorage.setItem(KEY, JSON.stringify({ maps: value, ts: Date.now() })); } catch (e) {}
  }

  /* --- Load the gated map iframes --- */
  function loadMaps() {
    document.querySelectorAll('[data-consent-src]').forEach(function (slot) {
      if (slot.dataset.loaded) return;
      var iframe = document.createElement('iframe');
      iframe.src = slot.dataset.consentSrc;
      iframe.title = slot.dataset.consentTitle || 'Google Maps';
      iframe.loading = 'lazy';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      slot.textContent = '';
      slot.appendChild(iframe);
      slot.dataset.loaded = '1';
      slot.classList.remove('map-consent');
    });
  }

  /* --- Placeholder shown while the map is not loaded --- */
  function renderPlaceholders() {
    document.querySelectorAll('[data-consent-src]').forEach(function (slot) {
      if (slot.dataset.loaded) return;
      slot.classList.add('map-consent');
      var icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12,2A8,8,0,0,0,4,10c0,5.4,7.05,11.5,7.35,11.76a1,1,0,0,0,1.3,0C12.95,21.5,20,15.4,20,10A8,8,0,0,0,12,2Zm0,17.65C10.1,17.87,6,13.66,6,10a6,6,0,0,1,12,0C18,13.66,13.9,17.87,12,19.65ZM12,6a4,4,0,1,0,4,4A4,4,0,0,0,12,6Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,12,12Z"/></svg>';
      slot.innerHTML = icon +
        '<p>' + texts.placeholder + '</p>' +
        '<button type="button" class="btn btn-primary" data-consent-load>' + texts.button + '</button>' +
        '<p><a href="https://www.google.com/maps/place/EUROPEA+group+s.r.o." target="_blank" rel="noopener noreferrer">' + texts.openMaps + ' &#8599;</a></p>';
    });
  }

  /* --- Banner --- */
  function showBanner() {
    if (document.getElementById('cookieBanner')) return;
    var el = document.createElement('div');
    el.className = 'cookie-banner';
    el.id = 'cookieBanner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-label', texts.title);
    el.innerHTML =
      '<h2>' + texts.title + '</h2>' +
      '<p>' + texts.body + '</p>' +
      '<div class="cookie-actions">' +
        '<button type="button" class="cookie-accept" data-consent="allow">' + texts.accept + '</button>' +
        '<button type="button" class="cookie-reject" data-consent="deny">' + texts.reject + '</button>' +
      '</div>';
    document.body.appendChild(el);
  }

  function hideBanner() {
    var el = document.getElementById('cookieBanner');
    if (el) el.remove();
  }

  /* --- Wire up --- */
  var stored = read();
  renderPlaceholders();

  if (stored && stored.maps === true) {
    loadMaps();
  } else if (!stored) {
    // Only ask if there is actually something to consent to on this page.
    if (document.querySelector('[data-consent-src]')) showBanner();
  }

  document.addEventListener('click', function (e) {
    var choice = e.target.closest('[data-consent]');
    if (choice) {
      var allow = choice.getAttribute('data-consent') === 'allow';
      write(allow);
      hideBanner();
      if (allow) loadMaps();
      return;
    }

    // Per-map "load anyway" button: consent for this view only, not stored.
    if (e.target.closest('[data-consent-load]')) {
      loadMaps();
      hideBanner();
      return;
    }

    // Footer "cookie settings" link re-opens the choice at any time, which is
    // how a visitor withdraws consent they gave earlier.
    if (e.target.closest('[data-consent-settings]')) {
      e.preventDefault();
      try { localStorage.removeItem(KEY); } catch (err) {}
      document.querySelectorAll('[data-consent-src]').forEach(function (slot) {
        slot.dataset.loaded = '';
        slot.innerHTML = '';
      });
      renderPlaceholders();
      showBanner();
    }
  });
})();
