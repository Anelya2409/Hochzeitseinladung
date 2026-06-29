/* ===================================================================
   HOCHZEITS-LANDINGPAGE — script.js
   Logik: Umschlag → Blütenblätter/Partikel → Reveal-Animationen →
          Countdown → RSVP-Formular → Musik → Sprachumschaltung
   =================================================================== */

/* ---------------------------------------------------------------
   0. SPRACHUMSCHALTUNG (DE / Kasachisch)
   Liest ?lang=de oder ?lang=kk aus der URL (Standard: de) und
   ersetzt bei jedem Element mit data-de/data-kk den Textinhalt.
   Läuft so früh wie möglich, damit kein falscher Text aufblitzt.
--------------------------------------------------------------- */
(function applyLanguage() {
  const lang = window.__weddingLang === 'kk' ? 'kk' : 'de';

  function setTextWhenReady() {
    // Textinhalte über data-de / data-kk
    document.querySelectorAll('[data-de]').forEach(el => {
      const text = lang === 'kk' ? el.getAttribute('data-kk') : el.getAttribute('data-de');
      if (text !== null) el.innerHTML = text;
    });

    // aria-label über data-de-aria / data-kk-aria
    document.querySelectorAll('[data-de-aria]').forEach(el => {
      const text = lang === 'kk' ? el.getAttribute('data-kk-aria') : el.getAttribute('data-de-aria');
      if (text !== null) el.setAttribute('aria-label', text);
    });

    // alt-Texte über data-de-alt / data-kk-alt
    document.querySelectorAll('[data-de-alt]').forEach(el => {
      const text = lang === 'kk' ? el.getAttribute('data-kk-alt') : el.getAttribute('data-de-alt');
      if (text !== null) el.setAttribute('alt', text);
    });

    // aktiven Sprachlink markieren
    document.querySelectorAll('.lang-link').forEach(link => {
      link.classList.toggle('is-active', link.dataset.lang === lang);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setTextWhenReady);
  } else {
    setTextWhenReady();
  }
})();

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------------
     1. UMSCHLAG MIT WACHSSIEGEL
     Klick/Tap auf das Siegel → Riss → Umschlag öffnet sich →
     Umschlagbildschirm verschwindet → Hauptinhalt erscheint.
  --------------------------------------------------------------- */
  const envelopeScreen = document.getElementById('envelope-screen');
  const envelope = document.getElementById('envelope');
  const sealButton = document.getElementById('seal-button');
  const mainContent = document.getElementById('main-content');

  function openInvitation() {
    if (envelope.classList.contains('is-open')) return;

    // Schritt 1: Siegel reißt
    envelope.classList.add('is-breaking');

    // Schritt 2: nach der Riss-Animation öffnet sich die Klappe
    setTimeout(() => {
      envelope.classList.add('is-open');
    }, 480);

    // Schritt 3: Umschlag verschwindet, Hauptseite erscheint,
    // sanfter Scroll zum Anfang wird ausgelöst
    setTimeout(() => {
      envelopeScreen.classList.add('is-closed');
      mainContent.classList.add('is-visible');
      document.body.classList.add('is-open');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      startAmbientEffects();
      revealOnScroll(); // erste Prüfung bereits sichtbarer Blöcke
    }, 1500);
  }

  sealButton.addEventListener('click', openInvitation);
  sealButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openInvitation();
    }
  });

  /* ---------------------------------------------------------------
     2. EINBLENDEN DER BLÖCKE BEIM SCROLLEN (reveal)
  --------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-shown');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  function revealOnScroll() {
    // Sicherheitsaufruf direkt nach dem Öffnen des Umschlags,
    // falls obere Blöcke bereits im Sichtbereich sind
    revealEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add('is-shown');
      }
    });
  }

  /* ---------------------------------------------------------------
     3. LEICHTER PARALLAX-EFFEKT FÜR DEKO-ELEMENTE
  --------------------------------------------------------------- */
  const parallaxEls = document.querySelectorAll('.floating-peony, .cover-lily');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    parallaxEls.forEach((el, i) => {
      const speed = 0.04 + (i % 3) * 0.02;
      el.style.transform = `translateY(${y * speed}px) ${el.classList.contains('cover-lily--left') ? 'rotate(-12deg)' : ''}`;
    });
  }, { passive: true });

  /* ---------------------------------------------------------------
     4. FLIEGENDE BLÜTENBLÄTTER UND LICHTPARTIKEL
     Starten erst nach dem Öffnen des Umschlags, um das Intro
     nicht zu stören.
  --------------------------------------------------------------- */
  const petalsLayer = document.getElementById('petals-layer');
  const sparklesLayer = document.getElementById('sparkles-layer');
  let ambientInterval = null;

  function spawnPetal() {
    const petal = document.createElement('img');
    petal.src = 'images/petal.svg';
    petal.className = 'petal';
    petal.alt = '';

    const startLeft = Math.random() * 100;
    const duration = 9 + Math.random() * 7;
    const drift = (Math.random() - 0.5) * 160;
    const size = 14 + Math.random() * 14;

    petal.style.left = startLeft + 'vw';
    petal.style.width = size + 'px';
    petal.style.height = size + 'px';
    petal.style.setProperty('--drift', drift + 'px');
    petal.style.animationDuration = duration + 's';

    petalsLayer.appendChild(petal);
    setTimeout(() => petal.remove(), duration * 1000 + 200);
  }

  function spawnSparkle() {
    const sparkle = document.createElement('span');
    sparkle.className = 'sparkle';
    sparkle.style.left = Math.random() * 100 + 'vw';
    sparkle.style.top = Math.random() * 100 + 'vh';
    sparkle.style.animationDelay = (Math.random() * 1.5) + 's';
    sparklesLayer.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 4500);
  }

  function startAmbientEffects() {
    if (ambientInterval) return;
    // auf Mobilgeräten seltener, um die Leistung zu schonen
    const isMobile = window.innerWidth < 560;
    const petalRate = isMobile ? 1800 : 1100;
    const sparkleRate = isMobile ? 1500 : 900;

    for (let i = 0; i < 3; i++) setTimeout(spawnPetal, i * 400);

    ambientInterval = setInterval(spawnPetal, petalRate);
    setInterval(spawnSparkle, sparkleRate);
  }

  /* ---------------------------------------------------------------
     5. MUSIK — Ein-/Ausschalt-Button
  --------------------------------------------------------------- */
  const musicToggle = document.getElementById('music-toggle');
  const bgMusic = document.getElementById('bg-music');
  let isPlaying = false;

  musicToggle.addEventListener('click', () => {
    if (!isPlaying) {
      bgMusic.play().catch(() => {
        // falls Autoplay blockiert ist oder keine Musikdatei hinterlegt wurde — einfach ignorieren
      });
      musicToggle.setAttribute('aria-pressed', 'true');
      musicToggle.querySelector('.music-icon').textContent = '♫';
    } else {
      bgMusic.pause();
      musicToggle.setAttribute('aria-pressed', 'false');
      musicToggle.querySelector('.music-icon').textContent = '♪';
    }
    isPlaying = !isPlaying;
  });

  /* ---------------------------------------------------------------
     6. COUNTDOWN BIS ZUR HOCHZEIT
  --------------------------------------------------------------- */
  const countdownGrid = document.getElementById('countdown-grid');
  const weddingDate = new Date(countdownGrid.dataset.weddingDate).getTime();

  const elDays = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMinutes = document.getElementById('cd-minutes');
  const elSeconds = document.getElementById('cd-seconds');

  function pad(n) { return String(n).padStart(2, '0'); }

  function updateCountdown() {
    const now = Date.now();
    const diff = weddingDate - now;

    if (diff <= 0) {
      elDays.textContent = '00';
      elHours.textContent = '00';
      elMinutes.textContent = '00';
      elSeconds.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMinutes.textContent = pad(minutes);
    elSeconds.textContent = pad(seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------------------------------------------------------------
     7. RSVP-FORMULAR
     Die Antworten werden per fetch() an ein Google Apps Script
     gesendet, das jede Antwort als neue Zeile in einem Google
     Sheet speichert. Einrichtung siehe google-apps-script.gs
     und die Anleitung in der README.
  --------------------------------------------------------------- */
  const rsvpForm = document.getElementById('rsvp-form');
  const rsvpSubmitButton = rsvpForm.querySelector('.submit-button');
  const rsvpErrorMsg = document.getElementById('form-error');

  // Hier die eigene Web-App-URL aus Google Apps Script eintragen
  // (siehe google-apps-script.gs, Schritt 7).
  const GOOGLE_SHEETS_URL = 'DEINE_APPS_SCRIPT_URL_HIER_EINFÜGEN';

  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('rsvp-name').value.trim();
    if (!name) {
      document.getElementById('rsvp-name').focus();
      return;
    }

    const formData = {
      name,
      attending: rsvpForm.querySelector('input[name="attending"]:checked').value,
      guests: document.getElementById('rsvp-guests').value,
      comment: document.getElementById('rsvp-comment').value.trim()
    };

    rsvpErrorMsg.classList.remove('is-shown');
    rsvpSubmitButton.disabled = true;
    rsvpSubmitButton.classList.add('is-loading');

    // Google Apps Script erfordert 'no-cors' für einfache POST-Requests
    // ohne vorherige OPTIONS-Preflight-Probleme. Die Antwort selbst ist
    // dadurch nicht auslesbar — das ist bei Apps-Script-Webhooks normal
    // und kein Fehler; wir gehen bei erfolgreichem Senden vom Erfolg aus.
    fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(formData)
    })
      .then(() => {
        rsvpForm.classList.add('is-sent');
      })
      .catch(() => {
        rsvpErrorMsg.classList.add('is-shown');
      })
      .finally(() => {
        rsvpSubmitButton.disabled = false;
        rsvpSubmitButton.classList.remove('is-loading');
      });
  });

});
