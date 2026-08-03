/**
 * Hero Slideshow — fade transition + subtle zoom
 * Extensible: pass selector / options
 */
const Slideshow = (() => {
  const DEFAULTS = {
    interval: 5500,
    selector: '#hero-slideshow',
  };

  let timer = null;
  let current = 0;
  let slides = [];
  let options = { ...DEFAULTS };

  function resetZoom(slide) {
    const img = slide.querySelector('.hero-slide__img');
    if (!img) return;
    img.style.transition = 'none';
    img.style.transform = 'scale(1)';
    // Force reflow then restore transition for ken-burns (1 → 1.05 / 20s)
    void img.offsetWidth;
    img.style.transition = '';
    img.style.transform = '';
  }

  function goTo(index) {
    if (!slides.length) return;
    const next = ((index % slides.length) + slides.length) % slides.length;
    if (next === current && slides[current].classList.contains('is-active')) return;

    const prevSlide = slides[current];
    const nextSlide = slides[next];

    prevSlide.classList.remove('is-active');
    nextSlide.classList.add('is-active');

    // Restart zoom on newly active slide
    resetZoom(nextSlide);
    requestAnimationFrame(() => {
      nextSlide.classList.add('is-active');
    });

    current = next;
  }

  function next() {
    goTo(current + 1);
  }

  function start() {
    stop();
    timer = setInterval(next, options.interval);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function init(userOptions = {}) {
    options = { ...DEFAULTS, ...userOptions };
    const root = document.querySelector(options.selector);
    if (!root) return null;

    slides = Array.from(root.querySelectorAll('.hero-slide'));
    if (!slides.length) return null;

    current = slides.findIndex((s) => s.classList.contains('is-active'));
    if (current < 0) {
      current = 0;
      slides[0].classList.add('is-active');
    }

    // Pause when tab hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });

    start();

    return { goTo, next, start, stop, getCurrent: () => current };
  }

  return { init };
})();
