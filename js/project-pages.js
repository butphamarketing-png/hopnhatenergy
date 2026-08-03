/**
 * Project catalog + article-style detail pages
 */
window.SolarProjectPages = (() => {
  function themeId() {
    return document.documentElement.getAttribute('data-theme') || 'solar';
  }

  function theme() {
    return window.SiteThemes && window.SiteThemes[themeId()];
  }

  function items() {
    return (theme() && theme().projects && theme().projects.items) || [];
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

  function slugFromPath() {
    const parts = location.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('du-an');
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    return parts[parts.length - 1] || '';
  }

  function mountCatalog() {
    const grid = document.getElementById('pj-grid');
    if (!grid) return;
    const list = items();
    grid.innerHTML = list.map((p) => `
      <li class="pj-card">
        <a href="${esc(p.slug)}/">
          <div class="pj-card__media"><img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" /></div>
          <div class="pj-card__body">
            <p class="pj-card__cat">${esc(p.cat || '')}</p>
            <h2 class="pj-card__title">${esc(p.title)}</h2>
            <p class="pj-card__meta">${esc([p.power, p.place, p.year].filter(Boolean).join(' · '))}</p>
            <span class="pj-card__cta">Đọc bài viết →</span>
          </div>
        </a>
      </li>`).join('') || '<li class="pj-empty">Chưa có dự án.</li>';
  }

  function mountDetail() {
    const root = document.getElementById('pj-detail');
    if (!root) return;

    const slug = slugFromPath();
    const list = items();
    const project = list.find((p) => p.slug === slug);
    const c = contact();

    if (!project) {
      root.innerHTML = `<p class="pj-empty">Không tìm thấy dự án. <a href="../">Quay lại danh sách</a></p>`;
      return;
    }

    document.title = `${project.title} | Solar Miền Nam`;

    const gallery = (project.gallery || [project.image]).filter(Boolean).map((src) =>
      `<figure class="pj-gallery__item"><img src="${esc(src)}" alt="${esc(project.title)}" loading="lazy" /></figure>`
    ).join('');

    const process = (project.process || []).map((step, i) =>
      `<li><span class="pj-step__num">${String(i + 1).padStart(2, '0')}</span><span>${esc(step)}</span></li>`
    ).join('');

    const specs = (project.specs || []).map((s) => `<li>${esc(s)}</li>`).join('');

    const related = list
      .filter((p) => p.slug !== project.slug)
      .slice(0, 3)
      .map((p) => `
        <a class="pj-related__card" href="../${esc(p.slug)}/">
          <img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" />
          <span>${esc(p.title)}</span>
        </a>`).join('');

    const zalo = c.zalo || '../../#section-08';
    const metaBits = [project.place, project.year, project.power].filter(Boolean);

    root.innerHTML = `
      <header class="pj-hero" style="background-image:url('${esc(project.image)}')">
        <div class="pj-hero__overlay"></div>
        <div class="pj-hero__content">
          <p class="pj-label">${esc(project.cat || 'Dự án')}</p>
          <h1>${esc(project.title)}</h1>
          ${metaBits.length ? `<p class="pj-hero__meta">${esc(metaBits.join(' · '))}</p>` : ''}
          <p class="pj-hero__summary">${esc(project.summary || '')}</p>
        </div>
      </header>

      <div class="pj-wrap pj-article__body">
        <div class="pj-overview">
          ${project.power ? `<div class="pj-stat"><span>Công suất</span><strong>${esc(project.power)}</strong></div>` : ''}
          ${project.place ? `<div class="pj-stat"><span>Địa điểm</span><strong>${esc(project.place)}</strong></div>` : ''}
          ${project.area ? `<div class="pj-stat"><span>Diện tích</span><strong>${esc(project.area)}</strong></div>` : ''}
          ${project.system ? `<div class="pj-stat"><span>Hệ thống</span><strong>${esc(project.system)}</strong></div>` : ''}
          ${project.year ? `<div class="pj-stat"><span>Năm</span><strong>${esc(project.year)}</strong></div>` : ''}
        </div>

        <section class="pj-article__section">
          <h2 class="pj-h2">Tổng quan dự án</h2>
          <p class="pj-article__lead">${esc(project.summary || 'Dự án được Solar Miền Nam khảo sát, thiết kế và thi công theo tiêu chuẩn kỹ thuật.')}</p>
          ${project.content ? `<div class="pj-article__content">${[].concat(project.content).map((p) => `<p>${esc(p)}</p>`).join('')}</div>` : `
          <div class="pj-article__content">
            <p>Công trình <strong>${esc(project.title)}</strong> tại <strong>${esc(project.place || 'khu vực triển khai')}</strong>
            được triển khai với công suất <strong>${esc(project.power || 'tối ưu')}</strong>${project.system ? `, hệ thống <strong>${esc(project.system)}</strong>` : ''}.</p>
            <p>Đội ngũ kỹ thuật đồng hành từ khảo sát hiện trạng, thiết kế phương án đến thi công lắp đặt và nghiệm thu bàn giao.</p>
          </div>`}
        </section>

        ${gallery ? `<section class="pj-article__section"><h2 class="pj-h2">Thư viện ảnh</h2><div class="pj-gallery">${gallery}</div></section>` : ''}

        ${process ? `<section class="pj-article__section"><h2 class="pj-h2">Quy trình thi công</h2><ol class="pj-process">${process}</ol></section>` : ''}

        ${specs ? `<section class="pj-article__section"><h2 class="pj-h2">Thông số kỹ thuật</h2><ul class="pj-specs">${specs}</ul></section>` : ''}

        ${project.video ? `<section class="pj-article__section"><h2 class="pj-h2">Video</h2><div class="pj-video"><iframe src="${esc(project.video)}" title="Video dự án" allowfullscreen loading="lazy"></iframe></div></section>` : ''}

        ${related ? `<section class="pj-article__section"><h2 class="pj-h2">Dự án liên quan</h2><div class="pj-related">${related}</div></section>` : ''}

        <div class="pj-cta-block">
          <h2>Bạn muốn triển khai dự án tương tự?</h2>
          <p>Đội ngũ Solar Miền Nam sẵn sàng khảo sát và tư vấn giải pháp phù hợp.</p>
          <a class="pj-cta" href="${esc(zalo)}" target="_blank" rel="noopener noreferrer">Nhận tư vấn</a>
        </div>
      </div>`;
  }

  return { mountCatalog, mountDetail };
})();
