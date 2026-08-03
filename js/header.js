/**
 * Site Header — horizontal nav + mobile drawer
 */
const Header = (() => {
  const header = () => document.getElementById('site-header');
  const mobileToggle = () => document.getElementById('mobile-menu-toggle');
  const sideMenu = () => document.getElementById('side-menu');
  const sideMenuOverlay = () => document.getElementById('side-menu-overlay');
  const sideMenuClose = () => document.getElementById('side-menu-close');

  function setCompactState() {
    const el = header();
    if (!el) return;

    const activeSection = document.querySelector('.fp-section.is-active');
    const sectionId = activeSection && activeSection.dataset.section;
    const isPastHero = sectionId && sectionId !== '01';
    const onDark = sectionId === '07' || sectionId === '08';

    el.classList.toggle('is-compact', Boolean(isPastHero));
    el.classList.toggle('is-on-dark', Boolean(onDark));
  }

  function setScrolled(force) {
    const el = header();
    if (!el) return;
    const shouldScroll = typeof force === 'boolean'
      ? force
      : window.scrollY > 24 || document.body.classList.contains('side-menu-open');
    el.classList.toggle('is-scrolled', shouldScroll);
  }

  function openSideMenu() {
    const menu = sideMenu();
    const overlay = sideMenuOverlay();
    if (!menu || !overlay) return;

    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('side-menu-open');

    const btn = mobileToggle();
    if (btn) {
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Đóng menu');
    }
  }

  function closeSideMenu() {
    const menu = sideMenu();
    const overlay = sideMenuOverlay();
    if (!menu || !overlay) return;

    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('side-menu-open');

    const btn = mobileToggle();
    if (btn) {
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Mở menu');
    }
  }

  function toggleSideMenu() {
    if (document.body.classList.contains('side-menu-open')) closeSideMenu();
    else openSideMenu();
  }

  function init() {
    const el = header();
    if (!el) return;

    requestAnimationFrame(() => {
      el.classList.add('is-ready');
    });

    setCompactState();
    setScrolled();

    const observer = new MutationObserver(() => {
      setCompactState();
    });

    document.querySelectorAll('.fp-section').forEach((section) => {
      observer.observe(section, { attributes: true, attributeFilter: ['class'] });
    });

    window.addEventListener('scroll', () => setScrolled(), { passive: true });

    const mobileBtn = mobileToggle();
    if (mobileBtn) {
      mobileBtn.addEventListener('click', toggleSideMenu);
    }

    const closeBtn = sideMenuClose();
    if (closeBtn) {
      closeBtn.addEventListener('click', closeSideMenu);
    }

    const overlay = sideMenuOverlay();
    if (overlay) {
      overlay.addEventListener('click', closeSideMenu);
    }

    document.querySelectorAll('.side-menu-link').forEach((link) => {
      link.addEventListener('click', closeSideMenu);
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSideMenu();
    });

    return {
      setScrolled,
      setCompactState,
      openSideMenu,
      closeSideMenu,
    };
  }

  return { init };
})();
