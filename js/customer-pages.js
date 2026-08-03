/**
 * Customer / testimonials listing page
 */
window.SolarCustomerPages = (() => {
  function themeId() {
    return document.documentElement.getAttribute('data-theme') || 'solar';
  }

  function theme() {
    return window.SiteThemes && window.SiteThemes[themeId()];
  }

  function items() {
    return (theme() && theme().testimonials && theme().testimonials.items) || [];
  }

  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function stars(n) {
    const r = Math.max(0, Math.min(5, Number(n) || 5));
    return Array.from({ length: 5 }, (_, i) =>
      `<span class="kh-star${i < r ? ' is-on' : ''}" aria-hidden="true">★</span>`
    ).join('');
  }

  function mountCatalog() {
    const grid = document.getElementById('kh-grid');
    const count = document.getElementById('kh-count');
    if (!grid) return;

    const list = items();
    if (count) count.textContent = `${list.length} khách hàng`;

    grid.innerHTML = list.map((t) => `
      <li class="kh-card">
        <div class="kh-card__media">
          <img src="${esc(t.image)}" alt="" loading="lazy" />
        </div>
        <div class="kh-card__body">
          <div class="kh-card__stars" aria-label="${esc(t.rating || 5)} sao">${stars(t.rating)}</div>
          <blockquote class="kh-card__quote">${esc(t.quote || '')}</blockquote>
          <div class="kh-card__person">
            <img class="kh-card__avatar" src="${esc(t.avatar)}" alt="${esc(t.name)}" width="48" height="48" loading="lazy" />
            <div>
              <p class="kh-card__name">${esc(t.name)}</p>
              <p class="kh-card__role">${esc(t.role || '')}</p>
            </div>
          </div>
        </div>
      </li>`).join('') || '<li class="kh-empty">Chưa có khách hàng.</li>';
  }

  return { mountCatalog };
})();
