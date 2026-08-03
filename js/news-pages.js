/**
 * Catalog + news detail pages for /solar/tin-tuc
 */
window.SolarNewsPages = (() => {
  function themeId() {
    return document.documentElement.getAttribute('data-theme') || 'solar';
  }

  function theme() {
    return window.SiteThemes && window.SiteThemes[themeId()];
  }

  function items() {
    return (theme() && theme().news && theme().news.items) || [];
  }

  function contact() {
    return (theme() && theme().contact) || {};
  }

  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function mountCatalog() {
    const grid = document.getElementById('nw-grid');
    if (!grid) return;

    grid.innerHTML = items().map((n) => `
      <li class="nw-card">
        <a href="${esc(n.slug)}/" data-nw-link>
          <div class="nw-card__media">
            <img src="${esc(n.image)}" alt="${esc(n.title)}" loading="lazy" />
            <span class="nw-card__badge">${esc(n.cat)}</span>
          </div>
          <div class="nw-card__body">
            <time datetime="${esc(n.datetime)}">${esc(n.date)}</time>
            <h2>${esc(n.title)}</h2>
            <span class="nw-card__cta">ĐỌC TIẾP →</span>
          </div>
        </a>
      </li>`).join('') || '<li class="nw-empty">Chưa có bài viết.</li>';

    bindFadeLinks(grid);
  }

  function slugFromPath() {
    const parts = location.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('tin-tuc');
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    return parts[parts.length - 1] || '';
  }

  function bindFadeLinks(scope) {
    (scope || document).querySelectorAll('[data-nw-link]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#')) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        e.preventDefault();
        document.body.classList.add('is-page-leaving');
        window.setTimeout(() => {
          window.location.href = href;
        }, 250);
      });
    });
  }

  function mountDetail() {
    const root = document.getElementById('nw-detail');
    if (!root) return;

    const slug = slugFromPath();
    const all = items();
    const item = all.find((n) => n.slug === slug);
    const c = contact();

    if (!item) {
      root.innerHTML = `<p class="nw-empty">Không tìm thấy bài viết. <a href="../">Quay lại tin tức</a></p>`;
      return;
    }

    document.title = `${item.title} | Hợp Nhất Energy`;

    const paragraphs = (item.content || [item.excerpt || ''])
      .filter(Boolean)
      .map((p) => `<p>${esc(p)}</p>`)
      .join('');

    const related = all
      .filter((n) => n.slug !== item.slug)
      .slice(0, 3)
      .map((n) => `
        <li>
          <a href="../${esc(n.slug)}/" data-nw-link>
            <div class="nw-related__media"><img src="${esc(n.image)}" alt="${esc(n.title)}" loading="lazy" /></div>
            <div>
              <span class="nw-related__cat">${esc(n.cat)}</span>
              <h3>${esc(n.title)}</h3>
            </div>
          </a>
        </li>`)
      .join('');

    const phone = c.phoneTel || '0938961012';
    const zalo = c.zalo || `https://zalo.me/${phone}`;

    root.innerHTML = `
      <section class="nw-hero">
        <img class="nw-hero__img" src="${esc(item.image)}" alt="${esc(item.title)}" />
        <div class="nw-hero__overlay"></div>
      </section>

      <div class="nw-article">
        <nav class="nw-breadcrumb" aria-label="Breadcrumb">
          <a href="../../">Trang chủ</a>
          <span>/</span>
          <a href="../">Tin tức</a>
          <span>/</span>
          <span>${esc(item.cat)}</span>
        </nav>

        <h1 class="nw-article__title">${esc(item.title)}</h1>
        <div class="nw-article__meta">
          <time datetime="${esc(item.datetime)}">${esc(item.date)}</time>
          <span class="nw-article__cat">${esc(item.cat)}</span>
        </div>

        <div class="nw-article__content">${paragraphs}</div>

        <figure class="nw-article__figure">
          <img src="${esc(item.image)}" alt="${esc(item.title)}" />
        </figure>

        ${related ? `
        <section class="nw-related">
          <h2>Bài liên quan</h2>
          <ul>${related}</ul>
        </section>` : ''}

        <section class="nw-cta">
          <h2>Bạn cần tư vấn giải pháp điện mặt trời?</h2>
          <p>Liên hệ Hợp Nhất Energy để được khảo sát và báo giá miễn phí.</p>
          <div class="nw-cta__actions">
            <a class="nw-btn nw-btn--primary" href="${esc(zalo)}" target="_blank" rel="noopener noreferrer">Nhận tư vấn Zalo</a>
            <a class="nw-btn nw-btn--ghost" href="tel:${esc(phone)}">Gọi ngay</a>
          </div>
        </section>
      </div>`;

    bindFadeLinks(root);
  }

  return { mountCatalog, mountDetail };
})();
