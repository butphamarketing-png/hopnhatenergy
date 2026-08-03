/**
 * Shared motion helpers — entrance timing + reduced-motion
 * Durations tuned for ~60fps (transform/opacity only)
 */
window.SolarMotion = (() => {
  const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

  /** Canonical stagger — bg first, then label → title → copy → media → icons → cta */
  const TIMING = {
    bg: 0,
    label: 200,
    title: 380,
    desc: 540,
    media: 680,
    items: 800,
    itemStagger: 120,
    ctaGap: 220,
    sectionTransition: 1000,
    entranceDelay: 180,
  };

  function prefersReduced() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function after(ms, fn) {
    return window.setTimeout(fn, ms);
  }

  /** Run timed class adds: [{ at, className, el? }] */
  function schedule(root, steps) {
    const timers = [];
    steps.forEach(({ at, className, el, each }) => {
      timers.push(
        after(at, () => {
          if (each) {
            each();
            return;
          }
          (el || root).classList.add(className);
        })
      );
    });
    return () => timers.forEach(clearTimeout);
  }

  function itemsDoneAt(count, startAt = TIMING.items) {
    return startAt + Math.max(count, 1) * TIMING.itemStagger + TIMING.ctaGap;
  }

  return { EASE, TIMING, prefersReduced, after, schedule, itemsDoneAt };
})();
