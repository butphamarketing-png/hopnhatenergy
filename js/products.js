/**
 * Products — Section 03: category filter + pagination (8 / page)
 */
const Products = (() => {
  const SECTION_ID = 'section-03';
  const PER_PAGE = 8;
  const CARD_DELAYS = [80, 140, 200, 260, 320, 380, 440, 500];
  let played = false;

  function section() {
    return document.getElementById(SECTION_ID);
  }

  function T() {
    return window.SolarMotion?.TIMING || {
      entranceDelay: 120,
    };
  }

  function prefersReducedMotion() {
    return window.SolarMotion?.prefersReduced?.() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function bindCatalog(root) {
    const grid = root.querySelector('#products-grid, .products-grid');
    const pager = root.querySelector('.products-pagination');
    const cats = Array.from(root.querySelectorAll('.products-cat'));
    if (!grid || !pager) return null;

    const allItems = Array.from(grid.children).filter((el) => el.matches('li'));
    let activeCat = cats[0]?.dataset.category || '';
    let current = 1;

    function filtered() {
      if (!activeCat || activeCat === 'all') return allItems;
      return allItems.filter((li) => li.dataset.category === activeCat);
    }

    function renderPager(total) {
      if (total <= 1) {
        pager.hidden = true;
        pager.innerHTML = '';
        return;
      }
      pager.hidden = false;
      let html = `<button type="button" class="page-btn" data-page="prev" aria-label="Trang trước" ${current <= 1 ? 'disabled' : ''}>‹</button>`;

      const pages = [];
      if (total <= 7) {
        for (let i = 1; i <= total; i += 1) pages.push(i);
      } else if (current <= 3) {
        pages.push(1, 2, 3, '…', total);
      } else if (current >= total - 2) {
        pages.push(1, '…', total - 2, total - 1, total);
      } else {
        pages.push(1, '…', current - 1, current, current + 1, '…', total);
      }

      pages.forEach((p) => {
        if (p === '…') {
          html += `<span class="page-ellipsis" aria-hidden="true">…</span>`;
          return;
        }
        html += `<button type="button" class="page-btn${p === current ? ' is-active' : ''}" data-page="${p}" aria-label="Trang ${p}">${p}</button>`;
      });

      html += `<button type="button" class="page-btn" data-page="next" aria-label="Trang sau" ${current >= total ? 'disabled' : ''}>›</button>`;
      pager.innerHTML = html;
    }

    function showPage(page) {
      const items = filtered();
      const total = Math.max(1, Math.ceil(items.length / PER_PAGE));
      current = Math.max(1, Math.min(page, total));
      const start = (current - 1) * PER_PAGE;
      const end = start + PER_PAGE;

      allItems.forEach((li) => {
        li.hidden = true;
        li.classList.add('is-page-hidden');
        li.style.display = 'none';
      });

      items.forEach((li, i) => {
        const on = i >= start && i < end;
        li.hidden = !on;
        li.classList.toggle('is-page-hidden', !on);
        li.style.display = on ? '' : 'none';
        if (on && played) {
          const card = li.querySelector('.product-card');
          if (card) card.classList.add('is-in');
        }
      });

      renderPager(total);
    }

    function setCategory(catId) {
      activeCat = catId;
      cats.forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.category === catId);
      });
      showPage(1);
    }

    cats.forEach((btn) => {
      btn.addEventListener('click', () => setCategory(btn.dataset.category || ''));
    });

    pager.addEventListener('click', (e) => {
      const btn = e.target.closest('.page-btn');
      if (!btn || btn.disabled) return;
      const page = btn.dataset.page;
      if (page === 'prev') showPage(current - 1);
      else if (page === 'next') showPage(current + 1);
      else showPage(Number(page) || current);
    });

    if (activeCat) setCategory(activeCat);
    else showPage(1);

    return { showPage, setCategory };
  }

  function revealInstant(root) {
    root.classList.add('is-head-label', 'is-head-title', 'is-head-desc', 'is-foot-in', 'is-cta-in');
    root.querySelectorAll('.product-card').forEach((c) => {
      if (!c.closest('li')?.hidden) c.classList.add('is-in');
    });
  }

  function playSequence(root) {
    if (played) return;
    played = true;
    const t = T();
    const cards = Array.from(root.querySelectorAll('.products-grid > li:not([hidden]) .product-card'));

    if (prefersReducedMotion()) {
      revealInstant(root);
      return;
    }

    const delay = t.entranceDelay || 0;
    window.setTimeout(() => {
      root.classList.add('is-head-label');
      window.setTimeout(() => root.classList.add('is-head-title'), 90);
      window.setTimeout(() => root.classList.add('is-head-desc'), 180);

      window.setTimeout(() => {
        cards.forEach((card, i) => {
          const at = CARD_DELAYS[i] ?? (80 + i * 60);
          window.setTimeout(() => card.classList.add('is-in'), at);
        });
      }, 260);

      const afterCards = 260 + 420;
      window.setTimeout(() => root.classList.add('is-foot-in'), afterCards);
      window.setTimeout(() => root.classList.add('is-cta-in'), afterCards + 100);
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

    const catalog = bindCatalog(root);

    const mo = new MutationObserver(() => tryPlay());
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });

    return { catalog, play: tryPlay };
  }

  return { init };
})();
