/**
 * Normal page scroll + scroll-spy (replaces fullpage snap)
 */
const SectionNav = (() => {
  const PLAY_MAP = {
    'section-02': 'about',
    'section-03': 'products',
    'section-04': 'services',
    'section-05': 'projects',
    'section-06': 'testimonials',
    'section-07': 'news',
    'section-08': 'contact',
    'section-09': 'footer',
  };

  let currentId = 'section-01';
  let spyLocked = false;
  let spyUnlockTimer = null;

  function getSections() {
    return Array.from(document.querySelectorAll('.fp-section'));
  }

  function getSectionIds() {
    return getSections().map((s) => s.id);
  }

  function headerOffset() {
    const header = document.getElementById('site-header');
    return header ? Math.round(header.getBoundingClientRect().height) : 72;
  }

  function applyTheme(sectionId) {
    const section = document.getElementById(sectionId);
    const isLight = section?.dataset.theme === 'light';
    document.body.classList.toggle('is-light-nav', isLight);

    if (window.SolarMN?.header?.setScrolled) {
      window.SolarMN.header.setScrolled(sectionId !== 'section-01');
    } else {
      document.getElementById('site-header')?.classList.toggle(
        'is-scrolled',
        sectionId !== 'section-01'
      );
    }

    if (window.SolarMN?.header?.setCompactState) {
      window.SolarMN.header.setCompactState();
    }
  }

  function revealSection(section) {
    if (!section || section.dataset.entered === '1') {
      section?.classList.add('is-ready', 'is-revealed');
      return;
    }
    section.dataset.entered = '1';
    section.classList.add('is-revealed');
    section.classList.remove('is-ready');
    requestAnimationFrame(() => {
      section.classList.add('is-ready');
    });

    const key = PLAY_MAP[section.id];
    const api = key && window.SolarMN?.[key];
    if (api && typeof api.play === 'function') {
      window.setTimeout(() => api.play(), 40);
    }
  }

  function setActive(sectionId, { reveal = true } = {}) {
    const next = document.getElementById(sectionId);
    if (!next) return false;

    getSections().forEach((s) => {
      s.classList.toggle('is-active', s.id === sectionId);
    });

    document.querySelectorAll('.section-nav__item').forEach((item) => {
      const isActive = item.dataset.target === sectionId;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    document.querySelectorAll('.nav-link, .mobile-link, .side-menu-link').forEach((link) => {
      const href = link.getAttribute('href') || '';
      const target = href.startsWith('#') ? href.slice(1) : '';
      link.classList.toggle('is-active', target === sectionId);
    });

    applyTheme(sectionId);
    if (reveal) revealSection(next);
    currentId = sectionId;
    return true;
  }

  function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (!target) {
      console.info(`[Solar] Section "${sectionId}" chưa sẵn sàng.`);
      return false;
    }

    spyLocked = true;
    if (spyUnlockTimer) clearTimeout(spyUnlockTimer);

    setActive(sectionId, { reveal: true });

    const top = window.scrollY + target.getBoundingClientRect().top - headerOffset() + 1;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });

    spyUnlockTimer = window.setTimeout(() => {
      spyLocked = false;
    }, 900);

    return true;
  }

  function goByOffset(offset) {
    const ids = getSectionIds();
    const index = ids.indexOf(currentId);
    if (index < 0) return;
    const next = ids[index + offset];
    if (next) scrollToSection(next);
  }

  function bindNav() {
    document.querySelectorAll('.section-nav__item').forEach((item) => {
      item.addEventListener('click', () => {
        if (item.disabled) return;
        scrollToSection(item.dataset.target);
      });
    });

    document.querySelectorAll('a[href^="#section-"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href').slice(1);
        if (!document.getElementById(id)) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        scrollToSection(id);
      });
    });
  }

  function bindScrollSpy() {
    const sections = getSections();
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) revealSection(entry.target);
        });

        if (spyLocked) return;

        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visible.length) {
          // Fallback: pick closest section to viewport center
          const mid = window.innerHeight * 0.35;
          let best = null;
          let bestDist = Infinity;
          sections.forEach((s) => {
            const r = s.getBoundingClientRect();
            const dist = Math.abs(r.top - mid);
            if (r.bottom > 0 && r.top < window.innerHeight && dist < bestDist) {
              bestDist = dist;
              best = s;
            }
          });
          if (best && best.id !== currentId) setActive(best.id, { reveal: false });
          return;
        }

        const top = visible[0].target;
        if (top.id !== currentId) setActive(top.id, { reveal: false });
      },
      {
        root: null,
        rootMargin: '-20% 0px -45% 0px',
        threshold: [0.08, 0.2, 0.4, 0.6],
      }
    );

    sections.forEach((s) => io.observe(s));

    // Also reveal near-viewport on load / hash
    const hash = (location.hash || '').replace('#', '');
    if (hash && document.getElementById(hash)) {
      window.setTimeout(() => scrollToSection(hash), 60);
    }
  }

  function enable(sectionId) {
    const item = document.querySelector(`.section-nav__item[data-target="${sectionId}"]`);
    if (item) item.disabled = false;
  }

  function init() {
    document.documentElement.classList.add('is-scroll-page');
    document.body.classList.add('is-scroll-page');

    bindNav();
    bindScrollSpy();

    setActive(currentId, { reveal: true });
    getSections().forEach((s) => enable(s.id));

    // Soft-open first paint of hero
    revealSection(document.getElementById('section-01'));

    return {
      setActive: (id) => scrollToSection(id),
      scrollToSection,
      enable,
      next: () => goByOffset(1),
      prev: () => goByOffset(-1),
      getCurrent: () => currentId,
    };
  }

  return { init };
})();
