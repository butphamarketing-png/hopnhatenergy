/**
 * Catalog + product detail pages for /solar
 */
window.SolarProductPages = (() => {
  function themeId() {
    return document.documentElement.getAttribute('data-theme') || 'solar';
  }

  function theme() {
    return window.SiteThemes && window.SiteThemes[themeId()];
  }

  function items() {
    return (theme() && theme().products && theme().products.items) || [];
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

  function money(n) {
    if (window.SolarCart && window.SolarCart.formatMoney) {
      return window.SolarCart.formatMoney(n).replace('₫', 'đ');
    }
    return `${new Intl.NumberFormat('vi-VN').format(Number(n) || 0)}đ`;
  }

  function priceBlock(p, classPrefix) {
    const price = Number(p.price) || 0;
    if (!price) return '';
    const compareAt = Number(p.compareAt) || 0;
    const discount = p.discount || (compareAt > price ? Math.round((1 - price / compareAt) * 100) : 0);
    const pre = classPrefix || 'pp-card';
    return `
      <div class="${pre}__price-block">
        ${compareAt > price ? `<span class="${pre}__price-old">${money(compareAt)}</span>` : ''}
        <span class="${pre}__price-new">${money(price)}</span>
        ${discount > 0 ? `<span class="${pre}__discount">Giảm ${discount}%</span>` : ''}
      </div>`;
  }

  function addBtnAttrs(p) {
    const code = p.code || p.slug || '';
    return `data-cart-add data-id="${esc(p.slug)}" data-name="${esc(p.name)}" data-brand="${esc(p.brand)}" data-code="${esc(code)}" data-price="${Number(p.price) || 0}" data-image="${esc(p.image)}"`;
  }

  function mountCatalog() {
    const all = items();
    const grid = document.getElementById('pp-grid');
    const pager = document.getElementById('pp-pager');
    const search = document.getElementById('pp-search');
    const filter = document.getElementById('pp-filter');
    if (!grid) return;

    const brands = [...new Set(all.map((p) => p.brand).filter(Boolean))];
    if (filter) {
      brands.forEach((b) => {
        const opt = document.createElement('option');
        opt.value = b;
        opt.textContent = b;
        filter.appendChild(opt);
      });
    }

    const PER = 6;
    let page = 1;

    function filtered() {
      const q = (search && search.value.trim().toLowerCase()) || '';
      const brand = (filter && filter.value) || '';
      return all.filter((p) => {
        const hay = `${p.brand} ${p.name} ${p.summary || ''}`.toLowerCase();
        const okQ = !q || hay.includes(q);
        const okB = !brand || p.brand === brand;
        return okQ && okB;
      });
    }

    function render() {
      const list = filtered();
      const pages = Math.max(1, Math.ceil(list.length / PER));
      page = Math.min(page, pages);
      const start = (page - 1) * PER;
      const slice = list.slice(start, start + PER);

      grid.innerHTML = slice.map((p) => `
        <li class="pp-card">
          <a href="../san-pham/${esc(p.slug)}/">
            <div class="pp-card__media"><img src="${esc(p.image)}" alt="${esc(p.name)}" /></div>
            <div class="pp-card__body">
              <p class="pp-card__brand">${esc(p.brand)}</p>
              <h2 class="pp-card__name">${esc(p.name)}</h2>
              ${priceBlock(p, 'pp-card')}
              <span class="pp-card__cta">Xem chi tiết →</span>
            </div>
          </a>
          <div class="pp-card__actions">
            <button type="button" class="product-add-btn" ${addBtnAttrs(p)}>THÊM VÀO GIỎ</button>
          </div>
        </li>`).join('') || '<li class="pp-empty">Không tìm thấy sản phẩm phù hợp.</li>';

      if (pager) {
        let html = '';
        for (let i = 1; i <= pages; i += 1) {
          html += `<button type="button" data-page="${i}" class="${i === page ? 'is-active' : ''}">${i}</button>`;
        }
        pager.innerHTML = html;
        pager.querySelectorAll('button').forEach((btn) => {
          btn.addEventListener('click', () => {
            page = Number(btn.dataset.page) || 1;
            render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        });
      }
    }

    search && search.addEventListener('input', () => { page = 1; render(); });
    filter && filter.addEventListener('change', () => { page = 1; render(); });
    render();
  }

  function slugFromPath() {
    const parts = location.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('san-pham');
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    return parts[parts.length - 1] || '';
  }

  function mountDetail() {
    const root = document.getElementById('pp-detail');
    if (!root) return;
    const slug = slugFromPath();
    const product = items().find((p) => p.slug === slug);
    const c = contact();

    if (!product) {
      root.innerHTML = `<p class="pp-empty">Không tìm thấy sản phẩm. <a href="../../danh-muc-san-pham/">Quay lại danh mục</a></p>`;
      return;
    }

    document.title = `${product.name} | Solar Miền Nam`;

    const specs = (product.specs || []).map((s) => `<li>${esc(s)}</li>`).join('');
    const advantages = (product.advantages || []).map((s) => `<li>${esc(s)}</li>`).join('');
    const apps = (product.applications || []).map((s) => `<li>${esc(s)}</li>`).join('');
    const zalo = c.zalo || '../../#section-07';

    root.innerHTML = `
      <div class="pp-detail__media">
        <img src="${esc(product.image)}" alt="${esc(product.name)}" />
      </div>
      <div class="pp-detail__copy">
        <p class="pp-detail__brand">${esc(product.brand)}</p>
        ${product.code ? `<p class="pp-detail__code">Mã: ${esc(product.code)}</p>` : ''}
        <h1 class="pp-detail__name">${esc(product.name)}</h1>
        <p class="pp-detail__summary">${esc(product.summary || '')}</p>
        ${priceBlock(product, 'pp-detail')}
        ${specs ? `<div class="pp-block"><h2>Thông số</h2><ul>${specs}</ul></div>` : ''}
        ${advantages ? `<div class="pp-block"><h2>Ưu điểm</h2><ul>${advantages}</ul></div>` : ''}
        ${apps ? `<div class="pp-block"><h2>Ứng dụng</h2><ul>${apps}</ul></div>` : ''}
        <div class="pp-detail__actions">
          <button type="button" class="product-add-btn product-add-btn--lg product-add-btn--primary" ${addBtnAttrs(product)}>THÊM VÀO GIỎ</button>
          <a class="pp-cta pp-cta--outline" href="${esc(zalo)}" target="_blank" rel="noopener noreferrer">NHẬN TƯ VẤN</a>
        </div>
      </div>`;
  }

  return { mountCatalog, mountDetail };
})();
