/**
 * Section 05 — Services carousel (4 cards desktop, side arrows + pill dots)
 */
const Services = (() => {
  const SECTION_ID = 'section-04';
  const AUTO_MS = 5000;
  let played = false;

  function section() {
    return document.getElementById(SECTION_ID);
  }

  function prefersReducedMotion() {
    return window.SolarMotion?.prefersReduced?.() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function visibleCount() {
    const w = window.innerWidth;
    if (w <= 767) return 1;
    if (w <= 1100) return 2;
    return 4;
  }

  function createSlider(root) {
    const slider = root.querySelector('[data-services-slider]');
    if (!slider) return null;

    const track = slider.querySelector('.services-slider__track');
    const slides = Array.from(slider.querySelectorAll('.svc-slide'));
    const prevBtn = slider.querySelector('[data-svc-prev]');
    const nextBtn = slider.querySelector('[data-svc-next]');
    const dotsWrap = root.querySelector('[data-svc-dots]');
    if (!track || !slides.length) return null;

    let index = 0;
    let timer = null;
    let perView = visibleCount();
    let maxIndex = Math.max(0, slides.length - perView);

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      // Prefer one pill per slide when a full page fits (matches mock 4 cards / 4 dots)
      const count = maxIndex <= 0 ? slides.length : (maxIndex + 1);
      for (let i = 0; i < count; i += 1) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `services-dot${i === index ? ' is-active' : ''}`;
        btn.setAttribute('aria-label', `Trang ${i + 1}`);
        btn.addEventListener('click', () => {
          if (maxIndex <= 0) {
            index = i;
            dotsWrap.querySelectorAll('.services-dot').forEach((d, di) => {
              d.classList.toggle('is-active', di === i);
            });
            restart();
            return;
          }
          goTo(i);
        });
        dotsWrap.appendChild(btn);
      }
    }

    function update() {
      perView = visibleCount();
      maxIndex = Math.max(0, slides.length - perView);
      if (index > maxIndex) index = maxIndex;

      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap) || 16;
      const slideW = slides[0].getBoundingClientRect().width;
      const offset = index * (slideW + gap);
      track.style.transform = `translate3d(-${offset}px, 0, 0)`;

      if (prevBtn) prevBtn.disabled = index <= 0 && maxIndex > 0 ? false : index <= 0;
      if (nextBtn) nextBtn.disabled = index >= maxIndex;

      // loop-friendly: never hard-disable if multiple pages
      if (maxIndex > 0) {
        if (prevBtn) prevBtn.disabled = false;
        if (nextBtn) nextBtn.disabled = false;
      }

      if (dotsWrap) {
        const dots = dotsWrap.querySelectorAll('.services-dot');
        const expected = maxIndex <= 0 ? slides.length : (maxIndex + 1);
        if (dots.length !== expected) buildDots();
        else {
          const activeIdx = maxIndex <= 0 ? Math.min(index, slides.length - 1) : index;
          dots.forEach((d, i) => d.classList.toggle('is-active', i === activeIdx));
        }
      }
    }

    function goTo(i) {
      index = Math.max(0, Math.min(i, maxIndex));
      update();
      restart();
    }

    function next() {
      goTo(index >= maxIndex ? 0 : index + 1);
    }

    function prev() {
      goTo(index <= 0 ? maxIndex : index - 1);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();
      if (prefersReducedMotion()) return;
      if (maxIndex <= 0 && slides.length <= 1) return;
      timer = window.setInterval(() => {
        if (maxIndex <= 0) {
          index = (index + 1) % slides.length;
          if (dotsWrap) {
            dotsWrap.querySelectorAll('.services-dot').forEach((d, i) => {
              d.classList.toggle('is-active', i === index);
            });
          }
          return;
        }
        next();
      }, AUTO_MS);
    }

    function restart() {
      stop();
      start();
    }

    prevBtn && prevBtn.addEventListener('click', prev);
    nextBtn && nextBtn.addEventListener('click', next);

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin', stop);
    slider.addEventListener('focusout', start);

    let startX = 0;
    let deltaX = 0;
    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      deltaX = 0;
      stop();
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      deltaX = e.touches[0].clientX - startX;
    }, { passive: true });

    track.addEventListener('touchend', () => {
      if (Math.abs(deltaX) > 40) {
        if (deltaX < 0) next();
        else prev();
      } else {
        start();
      }
    });

    window.addEventListener('resize', () => {
      update();
      buildDots();
    });

    buildDots();
    update();
    start();

    return { next, prev, goTo, update, start, stop };
  }

  function revealInstant(root) {
    root.classList.add('is-copy-in', 'is-slider-in');
  }

  function playSequence(root) {
    if (played) return;
    played = true;

    if (prefersReducedMotion()) {
      revealInstant(root);
      return;
    }

    const delay = window.SolarMotion?.TIMING?.entranceDelay ?? 180;
    window.setTimeout(() => {
      root.classList.add('is-copy-in');
      window.setTimeout(() => root.classList.add('is-slider-in'), 180);
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

    const slider = createSlider(root);

    const mo = new MutationObserver(() => tryPlay());
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
    tryPlay();

    return { play: tryPlay, slider };
  }

  return { init };
})();
