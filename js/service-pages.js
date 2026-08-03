/**
 * Catalog + service detail pages — theme from data-theme
 */
window.SolarServicePages = (() => {
  function themeId() {
    return document.documentElement.getAttribute('data-theme') || 'solar';
  }

  function theme() {
    return window.SiteThemes && window.SiteThemes[themeId()];
  }

  function steps() {
    return (theme() && theme().services && theme().services.steps) || [];
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
    const grid = document.getElementById('sv-grid');
    if (!grid) return;

    const list = steps();
    grid.innerHTML = list.map((s) => `
      <li class="sv-card">
        <a href="${esc(s.slug)}/">
          <div class="sv-card__media">
            <img src="${esc(s.image)}" alt="${esc(s.title)}" loading="lazy" />
          </div>
          <div class="sv-card__body">
            <span class="sv-card__num">${esc(s.num || '')}</span>
            <h2 class="sv-card__title">${esc(s.title)}</h2>
            <p class="sv-card__text">${esc(s.text || '')}</p>
            <span class="sv-card__cta">XEM CHI TIẾT →</span>
          </div>
        </a>
      </li>`).join('') || '<li class="sv-empty">Chưa có dịch vụ.</li>';
  }

  function slugFromPath() {
    const parts = location.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('dich-vu');
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    return parts[parts.length - 1] || '';
  }

  function mountDetail() {
    const root = document.getElementById('sv-detail');
    if (!root) return;

    const slug = slugFromPath();
    const item = steps().find((s) => s.slug === slug);
    const c = contact();

    if (!item) {
      root.innerHTML = `<p class="sv-empty">Không tìm thấy dịch vụ. <a href="../">Quay lại danh mục</a></p>`;
      return;
    }

    document.title = `${item.title} | Solar Miền Nam`;

    const process = (item.process || [])
      .map((p, i) => `
        <li class="sv-process__item">
          <span class="sv-process__num">${String(i + 1).padStart(2, '0')}</span>
          <span class="sv-process__label">${esc(p)}</span>
        </li>`)
      .join('');

    const advantages = (item.advantages || [])
      .map((a) => `<li>${esc(a)}</li>`)
      .join('');

    const gallery = [item.image, item.image, item.image]
      .map((src, i) => `<figure class="sv-gallery__item"><img src="${esc(src)}" alt="${esc(item.title)} ${i + 1}" loading="lazy" /></figure>`)
      .join('');

    const phone = c.phoneTel || '0938961012';
    const zalo = c.zalo || `https://zalo.me/${phone}`;

    root.innerHTML = `
      <section class="sv-hero">
        <img class="sv-hero__img" src="${esc(item.image)}" alt="${esc(item.title)}" />
        <div class="sv-hero__overlay"></div>
        <div class="sv-hero__content">
          <p class="sv-label">Dịch vụ</p>
          <h1 class="sv-hero__title">${esc(item.title)}</h1>
          <p class="sv-hero__desc">${esc(item.text || '')}</p>
        </div>
      </section>

      <section class="sv-section">
        <h2 class="sv-section__title">Nội dung dịch vụ</h2>
        <p class="sv-section__text">${esc(item.text || '')} Đội ngũ kỹ thuật Solar Miền Nam thực hiện theo quy trình chuẩn, đảm bảo chất lượng và tiến độ cho từng công trình.</p>
      </section>

      ${process ? `
      <section class="sv-section">
        <h2 class="sv-section__title">Quy trình thực hiện</h2>
        <ol class="sv-process">${process}</ol>
      </section>` : ''}

      ${advantages ? `
      <section class="sv-section">
        <h2 class="sv-section__title">Ưu điểm</h2>
        <ul class="sv-advantages">${advantages}</ul>
      </section>` : ''}

      <section class="sv-section">
        <h2 class="sv-section__title">Hình ảnh</h2>
        <div class="sv-gallery">${gallery}</div>
      </section>

      <section class="sv-cta">
        <h2 class="sv-cta__title">Cần tư vấn về ${esc(item.title.toLowerCase())}?</h2>
        <p class="sv-cta__desc">Liên hệ Solar Miền Nam để được khảo sát và báo giá miễn phí.</p>
        <div class="sv-cta__actions">
          <a class="sv-btn sv-btn--primary" href="${esc(zalo)}" target="_blank" rel="noopener noreferrer">Nhận tư vấn Zalo</a>
          <a class="sv-btn sv-btn--ghost" href="tel:${esc(phone)}">Gọi ngay</a>
        </div>
      </section>`;
  }

  return { mountCatalog, mountDetail };
})();
