/**
 * Section 06 — Customer testimonials (3 cards, infinite loop)
 */
const Testimonials = (() => {
  const SECTION_ID = 'section-06';
  const AUTO_MS = 5500;
  let played = false;

  function section() {
    return document.getElementById(SECTION_ID);
  }

  function prefersReducedMotion() {
    return window.SolarMotion?.prefersReduced?.() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function perView() {
    const w = window.innerWidth;
    if (w <= 720) return 1;
    if (w <= 1024) return 2;
    return 3;
  }

  function createSlider(root) {
    const slider = root.querySelector('[data-tm-slider]');
    if (!slider) return null;

    const viewport = slider.querySelector('.tm-slider__viewport');
    const track = slider.querySelector('.tm-slider__track');
    const prevBtn = slider.querySelector('[data-tm-prev]');
    const nextBtn = slider.querySelector('[data-tm-next]');
    const dotsWrap = root.querySelector('[data-tm-dots]');
    if (!viewport || !track) return null;

    const originals = Array.from(track.querySelectorAll('.tm-slide:not(.is-clone)'));
    if (!originals.length) return null;

    const n = originals.length;
    let view = perView();
    let index = 0;
    let timer = null;
    let locked = false;

    function clearClones() {
      track.querySelectorAll('.tm-slide.is-clone').forEach((el) => el.remove());
    }

    function setupClones() {
      clearClones();
      view = perView();
      const head = originals.slice(0, view).map((s) => {
        const c = s.cloneNode(true);
        c.classList.add('is-clone');
        c.setAttribute('aria-hidden', 'true');
        return c;
      });
      const tail = originals.slice(-view).map((s) => {
        const c = s.cloneNode(true);
        c.classList.add('is-clone');
        c.setAttribute('aria-hidden', 'true');
        return c;
      });
      tail.reverse().forEach((c) => track.insertBefore(c, track.firstChild));
      head.forEach((c) => track.appendChild(c));
      index = view;
      jump(index);
    }

    function step() {
      const slide = track.querySelector('.tm-slide');
      if (!slide) return 0;
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      return slide.getBoundingClientRect().width + gap;
    }

    function jump(i) {
      track.classList.add('is-instant');
      track.style.transform = `translate3d(${-i * step()}px, 0, 0)`;
      void track.offsetWidth;
      track.classList.remove('is-instant');
    }

    function paint(i, animate = true) {
      if (!animate) jump(i);
      else track.style.transform = `translate3d(${-i * step()}px, 0, 0)`;
    }

    function logicalIndex() {
      let li = index - view;
      li = ((li % n) + n) % n;
      return li;
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      for (let i = 0; i < n; i += 1) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `tm-dot${i === logicalIndex() ? ' is-active' : ''}`;
        btn.setAttribute('aria-label', `Đánh giá ${i + 1}`);
        btn.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(btn);
      }
    }

    function syncDots() {
      if (!dotsWrap) return;
      const dots = dotsWrap.querySelectorAll('.tm-dot');
      const li = logicalIndex();
      if (dots.length !== n) buildDots();
      else dots.forEach((d, i) => d.classList.toggle('is-active', i === li));
    }

    function onTransitionEnd() {
      locked = false;
      if (index >= n + view) {
        index = view;
        jump(index);
      } else if (index < view) {
        index = n + view - 1;
        // when going prev past start: index becomes view-1, jump to n+view-1
        // Actually if we did index-- from view to view-1, jump to n + (view-1) = n+view-1? 
        // Clones at start are copies of last `view` items.
        // Real slides occupy indices view .. view+n-1
        // When index = view-1, we're on last clone of the prepended set → equivalent to n+view-1? 
        // prepended: indices 0..view-1 = originals[n-view]..originals[n-1]
        // So index view-1 shows originals[n-1], which is also at position view+n-1
        index = view + n - 1;
        jump(index);
      }
      syncDots();
    }

    function goToLogical(li) {
      if (locked) return;
      const target = view + (((li % n) + n) % n);
      locked = true;
      index = target;
      paint(index, true);
      syncDots();
      restart();
    }

    function goTo(li) {
      goToLogical(li);
    }

    function next() {
      if (locked) return;
      locked = true;
      index += 1;
      paint(index, true);
      syncDots();
      restart();
    }

    function prev() {
      if (locked) return;
      locked = true;
      index -= 1;
      paint(index, true);
      syncDots();
      restart();
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();
      if (prefersReducedMotion() || n <= view) return;
      timer = window.setInterval(next, AUTO_MS);
    }

    function restart() {
      stop();
      start();
    }

    track.addEventListener('transitionend', (e) => {
      if (e.target !== track || e.propertyName !== 'transform') return;
      onTransitionEnd();
    });

    prevBtn && prevBtn.addEventListener('click', prev);
    nextBtn && nextBtn.addEventListener('click', next);

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

    window.addEventListener('resize', () => {
      const nextView = perView();
      if (nextView !== view) setupClones();
      else jump(index);
      buildDots();
      syncDots();
    });

    setupClones();
    buildDots();
    syncDots();
    start();

    return { next, prev, goTo, start, stop };
  }

  function revealInstant(root) {
    root.classList.add('is-head-in', 'is-slider-in', 'is-foot-in');
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
      window.setTimeout(() => root.classList.add('is-slider-in'), 120);
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
    const slider = createSlider(root);
    const mo = new MutationObserver(() => tryPlay());
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
    tryPlay();
    return { play: tryPlay, slider };
  }

  return { init };
})();
