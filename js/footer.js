/**
 * Section 08 — Footer entrance (once)
 * Columns stagger → bottom bar
 */
const SiteFooter = (() => {
  const SECTION_ID = 'section-09';
  let played = false;

  function section() {
    return document.getElementById(SECTION_ID);
  }

  function T() {
    return window.SolarMotion?.TIMING || { itemStagger: 130, ctaGap: 200 };
  }

  function prefersReducedMotion() {
    return window.SolarMotion?.prefersReduced?.() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function revealInstant(root) {
    root.querySelectorAll('.footer-col').forEach((col) => col.classList.add('is-in'));
    root.querySelector('.site-footer__bottom')?.classList.add('is-in');
  }

  function playSequence(root) {
    if (played) return;
    played = true;
    const t = T();
    const cols = Array.from(root.querySelectorAll('.footer-col'));
    const bottom = root.querySelector('.site-footer__bottom');

    if (prefersReducedMotion()) {
      revealInstant(root);
      return;
    }

    cols.forEach((col, i) => {
      window.setTimeout(() => col.classList.add('is-in'), i * t.itemStagger);
    });

    window.setTimeout(() => {
      bottom?.classList.add('is-in');
    }, cols.length * t.itemStagger + t.ctaGap);
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

    const mo = new MutationObserver(() => tryPlay());
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });

    return { play: tryPlay };
  }

  return { init };
})();
