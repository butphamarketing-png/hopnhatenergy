/**
 * Section 07 — News (featured + side list)
 */
const News = (() => {
  const SECTION_ID = 'section-07';
  let played = false;

  function section() {
    return document.getElementById(SECTION_ID);
  }

  function prefersReducedMotion() {
    return window.SolarMotion?.prefersReduced?.() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function bindPageFade(root) {
    root.querySelectorAll('[data-news-link]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || prefersReducedMotion()) return;
        e.preventDefault();
        document.body.classList.add('is-page-leaving');
        window.setTimeout(() => {
          window.location.href = href;
        }, 250);
      });
    });
  }

  function revealInstant(root) {
    root.classList.add('is-head-in', 'is-layout-in', 'is-foot-in');
  }

  function playSequence(root) {
    if (played) return;
    played = true;
    if (prefersReducedMotion()) {
      revealInstant(root);
      return;
    }
    const delay = window.SolarMotion?.TIMING?.entranceDelay ?? 120;
    window.setTimeout(() => {
      root.classList.add('is-head-in');
      window.setTimeout(() => root.classList.add('is-layout-in'), 120);
      window.setTimeout(() => root.classList.add('is-foot-in'), 220);
    }, delay);
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
    bindPageFade(root);
    const mo = new MutationObserver(() => tryPlay());
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
    tryPlay();
    return { play: tryPlay };
  }

  return { init };
})();
