/**
 * Section 05 — circular coverflow (infinite loop)
 * 1 → 2 → 3 → … → 1 …
 */
const Projects = (() => {
  const SECTION_ID = 'section-05';
  const AUTO_MS = 5000;
  let played = false;

  function section() {
    return document.getElementById(SECTION_ID);
  }

  function prefersReducedMotion() {
    return window.SolarMotion?.prefersReduced?.() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Shortest signed distance on a ring of size n */
  function ringDist(i, index, n) {
    let d = ((i - index) % n + n) % n;
    if (d > n / 2) d -= n;
    return d;
  }

  function createSlider(root) {
    const slider = root.querySelector('[data-projects-slider]');
    if (!slider) return null;

    const viewport = slider.querySelector('.projects-slider__viewport');
    const track = slider.querySelector('.projects-slider__track');
    const slides = Array.from(slider.querySelectorAll('.pj-slide'));
    const prevBtn = slider.querySelector('[data-pj-prev]');
    const nextBtn = slider.querySelector('[data-pj-next]');
    const dotsWrap = root.querySelector('[data-pj-dots]');
    if (!viewport || !track || !slides.length) return null;

    const n = slides.length;
    let index = 0;
    let timer = null;

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `projects-dot${i === index ? ' is-active' : ''}`;
        btn.setAttribute('aria-label', `Dự án ${i + 1}`);
        btn.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(btn);
      });
    }

    function stepSize() {
      const cs = getComputedStyle(slider);
      const gapRaw = cs.getPropertyValue('--pj-gap').trim();
      const gap = parseFloat(gapRaw) || 20;
      const w = slides[0].offsetWidth || parseFloat(cs.getPropertyValue('--pj-w')) || 200;
      return w + gap;
    }

    function update() {
      const step = stepSize();

      slides.forEach((s, i) => {
        const dist = ringDist(i, index, n);
        const abs = Math.abs(dist);
        const prev = s.dataset.dist !== undefined ? Number(s.dataset.dist) : dist;
        const jumped = Math.abs(dist - prev) > 1;

        if (jumped) s.classList.add('is-jumping');

        s.classList.toggle('is-active', dist === 0);
        s.classList.toggle('is-near', abs === 1);
        s.classList.toggle('is-far', abs >= 2);
        s.style.zIndex = String(40 - abs);
        s.style.transform = `translate3d(${dist * step}px, -50%, 0)`;
        s.dataset.dist = String(dist);

        if (jumped) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => s.classList.remove('is-jumping'));
          });
        }
      });

      if (dotsWrap) {
        const dots = dotsWrap.querySelectorAll('.projects-dot');
        if (dots.length !== n) buildDots();
        else dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
      }
    }

    function goTo(i) {
      index = ((i % n) + n) % n;
      update();
      restart();
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();
      if (prefersReducedMotion() || n <= 1) return;
      timer = window.setInterval(next, AUTO_MS);
    }

    function restart() {
      stop();
      start();
    }

    prevBtn && prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      prev();
    });
    nextBtn && nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      next();
    });

    slides.forEach((s, i) => {
      s.addEventListener('click', (e) => {
        if (i === index) return;
        if (e.target.closest('a')) e.preventDefault();
        goTo(i);
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin', stop);
    slider.addEventListener('focusout', start);

    let startX = 0;
    let deltaX = 0;
    viewport.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      deltaX = 0;
      stop();
    }, { passive: true });
    viewport.addEventListener('touchmove', (e) => {
      deltaX = e.touches[0].clientX - startX;
    }, { passive: true });
    viewport.addEventListener('touchend', () => {
      if (Math.abs(deltaX) > 40) {
        if (deltaX < 0) next();
        else prev();
      } else start();
    });

    window.addEventListener('resize', update);

    buildDots();
    update();
    requestAnimationFrame(update);
    start();

    return { next, prev, goTo, update, start, stop };
  }

  function revealInstant(root) {
    root.classList.add('is-head-title', 'is-slider-in', 'is-foot-in');
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
      root.classList.add('is-head-title');
      window.setTimeout(() => root.classList.add('is-slider-in'), 120);
      window.setTimeout(() => root.classList.add('is-foot-in'), 200);
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
