/**
 * Catalog + product detail pages
 * Catalog supports hierarchical category tree (sổ cấp)
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

  function categories() {
    const cats = (theme() && theme().products && theme().products.categories) || [];
    return cats.filter((c) => c.id && c.id !== 'all');
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

  /** Theme images use paths relative to /solar or /den-led — rewrite for nested pages */
  function resolveImg(src) {
    if (!src || /^https?:\/\//i.test(src) || src.startsWith('data:') || src.startsWith('/')) return src;
    const base = document.documentElement.getAttribute('data-solar-base') || '../';
    const normalized = String(src).replace(/^\.\.\//, '');
    return `${base}${normalized}`;
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
    return `data-cart-add data-id="${esc(p.slug)}" data-name="${esc(p.name)}" data-brand="${esc(p.brand)}" data-code="${esc(code)}" data-price="${Number(p.price) || 0}" data-image="${esc(resolveImg(p.image))}"`;
  }

  function queryCat() {
    try {
      return new URLSearchParams(location.search).get('cat') || '';
    } catch {
      return '';
    }
  }

  function detailHref(slug) {
    // From /san-pham/ or /danh-muc-san-pham/
    const path = location.pathname.replace(/\\/g, '/');
    if (path.includes('/san-pham/') && !path.match(/\/san-pham\/[^/]+\/?$/)) {
      return `./${esc(slug)}/`;
    }
    if (path.includes('/danh-muc-san-pham')) {
      return `../san-pham/${esc(slug)}/`;
    }
    return `../san-pham/${esc(slug)}/`;
  }

  function mountCatalog() {
    const all = items();
    const cats = categories();
    const grid = document.getElementById('pp-grid');
    const pager = document.getElementById('pp-pager');
    const search = document.getElementById('pp-search');
    const filter = document.getElementById('pp-filter');
    const tree = document.getElementById('pp-tree');
    const heading = document.getElementById('pp-cat-heading');
    if (!grid) return;

    const brands = [...new Set(all.map((p) => p.brand).filter(Boolean))];
    if (filter && !filter.hidden) {
      brands.forEach((b) => {
        const opt = document.createElement('option');
        opt.value = b;
        opt.textContent = b;
        filter.appendChild(opt);
      });
    }

    const PER = 8;
    let page = 1;
    let activeCat = queryCat();
    if (activeCat === 'all') activeCat = '';

    function catLabel(id) {
      if (!id) return 'Tất cả sản phẩm';
      const found = cats.find((c) => c.id === id);
      return found ? found.label : id;
    }

    function itemsInCat(catId) {
      if (!catId) return all;
      return all.filter((p) => p.category === catId);
    }

    function renderTree() {
      if (!tree) return;
      const countAll = all.length;
      let html = `
        <details class="pp-tree__group" open>
          <summary class="pp-tree__summary">
            <button type="button" class="pp-tree__btn${!activeCat ? ' is-active' : ''}" data-cat="">
              Tất cả <span class="pp-tree__count">${countAll}</span>
            </button>
          </summary>
        </details>`;

      cats.forEach((cat) => {
        const kids = itemsInCat(cat.id);
        const open = activeCat === cat.id ? ' open' : '';
        const childLinks = kids.slice(0, 12).map((p) => `
          <li>
            <a class="pp-tree__product" href="${detailHref(p.slug)}">${esc(p.name)}</a>
          </li>`).join('');
        const more = kids.length > 12
          ? `<li><button type="button" class="pp-tree__more" data-cat="${esc(cat.id)}">+ ${kids.length - 12} sản phẩm khác</button></li>`
          : '';

        html += `
          <details class="pp-tree__group"${open}>
            <summary class="pp-tree__summary">
              <button type="button" class="pp-tree__btn${activeCat === cat.id ? ' is-active' : ''}" data-cat="${esc(cat.id)}">
                ${esc(cat.label)} <span class="pp-tree__count">${kids.length}</span>
              </button>
            </summary>
            <ul class="pp-tree__children">
              ${childLinks || '<li class="pp-tree__empty">Chưa có sản phẩm</li>'}
              ${more}
            </ul>
          </details>`;
      });

      tree.innerHTML = html;

      tree.querySelectorAll('[data-cat]').forEach((el) => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          activeCat = el.getAttribute('data-cat') || '';
          page = 1;
          const url = new URL(location.href);
          if (activeCat) url.searchParams.set('cat', activeCat);
          else url.searchParams.delete('cat');
          history.replaceState(null, '', url);
          renderTree();
          render();
        });
      });

      // Keep details open when clicking summary button without collapsing oddly
      tree.querySelectorAll('.pp-tree__summary').forEach((sum) => {
        sum.addEventListener('click', (e) => {
          if (e.target.closest('button')) e.preventDefault();
        });
      });
    }

    function filtered() {
      const q = (search && search.value.trim().toLowerCase()) || '';
      const brand = (filter && !filter.hidden && filter.value) || '';
      return itemsInCat(activeCat).filter((p) => {
        const hay = `${p.brand} ${p.name} ${p.summary || ''} ${p.code || ''}`.toLowerCase();
        const okQ = !q || hay.includes(q);
        const okB = !brand || p.brand === brand;
        return okQ && okB;
      });
    }

    function render() {
      if (heading) heading.textContent = catLabel(activeCat);
      const list = filtered();
      const pages = Math.max(1, Math.ceil(list.length / PER));
      page = Math.min(page, pages);
      const start = (page - 1) * PER;
      const slice = list.slice(start, start + PER);

      grid.innerHTML = slice.map((p) => `
        <li class="pp-card">
          <a href="${detailHref(p.slug)}">
            <div class="pp-card__media"><img src="${esc(resolveImg(p.image))}" alt="${esc(p.name)}" /></div>
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
    renderTree();
    render();
  }

  function slugFromPath() {
    const parts = location.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('san-pham');
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    return parts[parts.length - 1] || '';
  }

  function galleryFor(product) {
    const seen = new Set();
    const out = [];
    const push = (src) => {
      if (!src || seen.has(src)) return;
      seen.add(src);
      out.push(src);
    };
    push(product.image);
    (product.gallery || []).forEach(push);
    if (out.length < 4) {
      items()
        .filter((p) => p.category === product.category && p.slug !== product.slug)
        .slice(0, 4 - out.length)
        .forEach((p) => push(p.image));
    }
    return out;
  }

  function mountDetail() {
    const root = document.getElementById('pp-detail');
    if (!root) return;
    const slug = slugFromPath();
    const product = items().find((p) => p.slug === slug);
    const c = contact();
    const brand = (theme() && theme().brand) || {};
    const brandLabel = [brand.name, brand.sub].filter(Boolean).join(' ') || 'Hợp Nhất Energy';

    if (!product) {
      root.innerHTML = `<p class="pp-empty">Không tìm thấy sản phẩm. <a href="../">Quay lại danh mục</a></p>`;
      return;
    }

    document.title = `${product.name} | ${brandLabel}`;

    const gallery = galleryFor(product).map(resolveImg);
    const specs = (product.specs || []).map((s) => `<li>${esc(s)}</li>`).join('');
    const advantages = (product.advantages || []).map((s) => `<li>${esc(s)}</li>`).join('');
    const apps = (product.applications || []).map((s) => `<li>${esc(s)}</li>`).join('');
    const phone = (c.phone || '').replace(/\s/g, '');
    const phoneHref = phone ? `tel:${phone}` : '#';
    const zalo = c.zalo || '../../#section-08';
    const price = Number(product.price) || 0;
    const compareAt = Number(product.compareAt) || 0;
    const cartBase = document.documentElement.getAttribute('data-solar-base') || '../';
    const quoteHref = `${cartBase}gio-hang/#bao-gia`;
    const offerText = product.offer
      || 'Khảo sát miễn phí · Bảo hành chính hãng · Hỗ trợ kỹ thuật 24/7';

    const thumbs = gallery.map((src, i) => `
      <button type="button" class="pp-gallery__thumb${i === 0 ? ' is-active' : ''}" data-gallery-index="${i}" aria-label="Ảnh ${i + 1}">
        <img src="${esc(src)}" alt="" width="64" height="64" />
      </button>`).join('');

    root.innerHTML = `
      <div class="pp-detail__gallery">
        ${gallery.length > 1 ? `
        <div class="pp-gallery__rail">
          <button type="button" class="pp-gallery__nav" data-gallery-dir="-1" aria-label="Ảnh trước">▴</button>
          <div class="pp-gallery__thumbs" role="list">${thumbs}</div>
          <button type="button" class="pp-gallery__nav" data-gallery-dir="1" aria-label="Ảnh sau">▾</button>
        </div>` : ''}
        <div class="pp-gallery__main">
          ${product.badge || product.isNew ? `<span class="pp-gallery__badge">${esc(product.badge || 'NEW')}</span>` : ''}
          <img id="pp-gallery-main" src="${esc(gallery[0])}" alt="${esc(product.name)}" />
        </div>
      </div>
      <div class="pp-detail__copy">
        <h1 class="pp-detail__name">${esc(product.name)}</h1>
        <div class="pp-detail__meta">
          ${product.code ? `<span>Mã: ${esc(product.code)}</span>` : ''}
          ${product.brand ? `<span>${esc(product.brand)}</span>` : ''}
        </div>
        ${price ? `
        <div class="pp-detail__price-row">
          ${compareAt > price ? `<span class="pp-detail__price-old">${money(compareAt)}</span>` : ''}
          <span class="pp-detail__price-new">${money(price)}</span>
        </div>
        <p class="pp-detail__price-note">(Giá tham khảo — báo giá chính thức sau khảo sát)</p>` : ''}
        ${product.summary ? `<p class="pp-detail__summary">${esc(product.summary)}</p>` : ''}
        ${specs ? `
        <div class="pp-detail__options">
          <div class="pp-detail__options-head">
            <span>Thông số nổi bật</span>
          </div>
          <div class="pp-spec-chips">${(product.specs || []).map((s) => `<span class="pp-spec-chip">${esc(s)}</span>`).join('')}</div>
        </div>` : ''}
        <div class="pp-offer">
          <strong>Ưu đãi:</strong>
          <p><span class="pp-offer__check" aria-hidden="true">✓</span> ${esc(offerText)}</p>
        </div>
        <ul class="pp-perks">
          <li>
            <span class="pp-perks__icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 7h11v10H3V7zm11 3h4l3 3v4h-7V10z"/><circle cx="7" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/></svg>
            </span>
            <span>Giao hàng / lắp đặt</span>
          </li>
          <li>
            <span class="pp-perks__icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M2 14h4v4H2v-4zm16 0h4v4h-4v-4z"/><path d="M12 14v6"/></svg>
            </span>
            <span>Tư vấn 24/7</span>
          </li>
          <li>
            <span class="pp-perks__icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h12l4 4v6H4V7z"/><path d="M9 17h6"/><path d="M8 3v4"/></svg>
            </span>
            <span>Bảo hành chính hãng</span>
          </li>
        </ul>
        <div class="pp-detail__buy">
          <button type="button" class="pp-buy-primary" data-cart-buy ${addBtnAttrs(product)} data-quote-href="${esc(quoteHref)}">
            <span class="pp-buy-primary__label">Yêu cầu báo giá ngay</span>
            <span class="pp-buy-primary__sub">Thêm vào giỏ &amp; gửi thông tin — không thanh toán online</span>
          </button>
          <div class="pp-detail__buy-row">
            <button type="button" class="pp-buy-secondary" ${addBtnAttrs(product)}>Thêm vào giỏ hàng</button>
            <a class="pp-buy-call" href="${esc(phoneHref)}">Gọi ngay (Miễn phí)</a>
          </div>
          <a class="pp-detail__zalo" href="${esc(zalo)}" target="_blank" rel="noopener noreferrer">Chat Zalo tư vấn</a>
        </div>
        ${advantages ? `<div class="pp-block"><h2>Ưu điểm</h2><ul>${advantages}</ul></div>` : ''}
        ${apps ? `<div class="pp-block"><h2>Ứng dụng</h2><ul>${apps}</ul></div>` : ''}
      </div>`;

    let active = 0;
    const mainImg = root.querySelector('#pp-gallery-main');
    const thumbBtns = () => [...root.querySelectorAll('.pp-gallery__thumb')];

    function setActive(i) {
      if (!gallery.length) return;
      active = (i + gallery.length) % gallery.length;
      if (mainImg) {
        mainImg.src = gallery[active];
      }
      thumbBtns().forEach((btn, idx) => {
        btn.classList.toggle('is-active', idx === active);
      });
    }

    root.addEventListener('click', (e) => {
      const thumb = e.target.closest('[data-gallery-index]');
      if (thumb) {
        setActive(Number(thumb.getAttribute('data-gallery-index')) || 0);
        return;
      }
      const nav = e.target.closest('[data-gallery-dir]');
      if (nav) {
        setActive(active + (Number(nav.getAttribute('data-gallery-dir')) || 0));
      }
    });
  }

  return { mountCatalog, mountDetail };
})();
