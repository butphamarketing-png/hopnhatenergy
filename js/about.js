/**
 * Section 02 — About entrance
 * Order: label → title → desc/highlight → cta → image
 */
const About = (() => {
  const SECTION_ID = 'section-02';
  const CHAR_MS = 22;
  const BG_PAUSE = window.SolarMotion?.TIMING?.entranceDelay ?? 120;
  const LABEL_MS = 160;
  const FAILSAFE_MS = 3800;

  let played = false;
  let typingTimer = null;
  let failsafeTimer = null;

  function section() {
    return document.getElementById(SECTION_ID);
  }

  function prefersReducedMotion() {
    return window.SolarMotion?.prefersReduced?.() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function clearTyping() {
    if (typingTimer) {
      clearTimeout(typingTimer);
      typingTimer = null;
    }
  }

  function clearFailsafe() {
    if (failsafeTimer) {
      clearTimeout(failsafeTimer);
      failsafeTimer = null;
    }
  }

  function typeLines(lines, onDone) {
    let lineIndex = 0;
    let charIndex = 0;
    let cursor = null;

    function attachCursor(lineEl) {
      if (!cursor) {
        cursor = document.createElement('span');
        cursor.className = 'about-title__cursor';
        cursor.setAttribute('aria-hidden', 'true');
      }
      lineEl.appendChild(cursor);
    }

    function step() {
      if (lineIndex >= lines.length) {
        if (cursor && cursor.parentNode) cursor.parentNode.removeChild(cursor);
        onDone();
        return;
      }

      const line = lines[lineIndex];
      const full = line.getAttribute('data-typing') || line.dataset.typing || '';
      charIndex += 1;
      line.textContent = full.slice(0, charIndex);
      attachCursor(line);

      if (charIndex >= full.length) {
        lineIndex += 1;
        charIndex = 0;
        typingTimer = setTimeout(step, CHAR_MS + 28);
        return;
      }

      typingTimer = setTimeout(step, CHAR_MS);
    }

    lines.forEach((el) => {
      el.textContent = '';
    });
    step();
  }

  function revealInstant(root) {
    clearTyping();
    clearFailsafe();
    const title = root.querySelector('.about-title');
    const lines = Array.from(root.querySelectorAll('[data-typing]'));
    lines.forEach((el) => {
      el.textContent = el.getAttribute('data-typing') || el.dataset.typing || '';
    });
    title?.classList.add('is-typed');
    root.classList.add('is-revealed', 'is-desc-in', 'is-media-in', 'is-cta-in');
    root.querySelectorAll('.about-feature').forEach((f) => f.classList.add('is-in'));
  }

  function playSequence(root) {
    if (played) return;
    played = true;

    const title = root.querySelector('.about-title');
    const lines = Array.from(root.querySelectorAll('[data-typing]'));
    const features = Array.from(root.querySelectorAll('.about-feature'));

    failsafeTimer = window.setTimeout(() => {
      if (!root.classList.contains('is-media-in')) revealInstant(root);
    }, FAILSAFE_MS);

    if (prefersReducedMotion() || !lines.length) {
      revealInstant(root);
      return;
    }

    window.setTimeout(() => {
      root.classList.add('is-revealed');

      window.setTimeout(() => {
        typeLines(lines, () => {
          clearFailsafe();
          title?.classList.add('is-typed');
          root.classList.add('is-desc-in');

          window.setTimeout(() => {
            features.forEach((feature, i) => {
              window.setTimeout(() => feature.classList.add('is-in'), i * 120);
            });

            window.setTimeout(() => {
              root.classList.add('is-cta-in');
              window.setTimeout(() => root.classList.add('is-media-in'), 140);
            }, Math.max(180, features.length * 120));
          }, 180);
        });
      }, LABEL_MS);
    }, BG_PAUSE);
  }

  function tryPlay() {
    const root = section();
    if (!root || played) return;
    if (!root.classList.contains('is-active') && !root.classList.contains('is-revealed')) return;
    playSequence(root);
  }

  function init() {
    const root = section();
    if (!root) return null;

    root.querySelectorAll('[data-typing]').forEach((el) => {
      const text = el.getAttribute('data-typing') || el.textContent.trim();
      if (text) el.setAttribute('data-typing', text);
      el.textContent = '';
    });

    const mo = new MutationObserver(() => tryPlay());
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });

    return {
      play: tryPlay,
      replay: () => {
        played = false;
        clearTyping();
        clearFailsafe();
        const el = section();
        if (!el) return;
        el.classList.remove('is-revealed', 'is-desc-in', 'is-media-in', 'is-cta-in');
        el.querySelector('.about-title')?.classList.remove('is-typed');
        el.querySelectorAll('.about-feature').forEach((f) => f.classList.remove('is-in'));
        el.querySelectorAll('[data-typing]').forEach((line) => {
          line.textContent = '';
        });
        tryPlay();
      },
    };
  }

  return { init };
})();
