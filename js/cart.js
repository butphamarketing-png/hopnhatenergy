/**
 * Solar Miền Nam — Lead Generation Cart
 * Shopping experience → Gửi yêu cầu báo giá (không thanh toán online)
 */
window.SolarCart = (() => {
  const listeners = new Set();
  let toastTimer = null;
  let eventsBound = false;

  const BAG_ICON = `<svg class="header-cart__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/><path d="M9 11h6"/></svg>`;

  const PROJECT_TYPES = ['Nhà ở', 'Nhà xưởng', 'Doanh nghiệp', 'Khách sạn', 'Resort'];

  function formatMoney(n) {
    const v = Number(n) || 0;
    return `${new Intl.NumberFormat('vi-VN').format(v)}₫`;
  }

  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function siteRootMarker() {
    const path = location.pathname.replace(/\\/g, '/');
    if (path.includes('/den-led')) return '/den-led/';
    return '/solar/';
  }

  function storageKey() {
    return document.documentElement.getAttribute('data-theme') === 'led' ? 'led-mn-cart' : 'solar-mn-cart';
  }

  function quoteStorageKey() {
    return document.documentElement.getAttribute('data-theme') === 'led' ? 'led-mn-quotes' : 'solar-mn-quotes';
  }

  function solarBase() {
    const forced = document.documentElement.getAttribute('data-solar-base');
    if (forced != null) return forced;
    const path = location.pathname.replace(/\\/g, '/');
    const marker = siteRootMarker();
    const idx = path.indexOf(marker);
    if (idx === -1) {
      const root = marker.replace(/\/$/, '');
      if (path.endsWith(root) || path.endsWith(root + '/') || path.includes(root + '/index.html')) return '';
      return '';
    }
    const after = path.slice(idx + marker.length);
    const parts = after.split('/').filter(Boolean);
    if (parts.length && /\.html?$/i.test(parts[parts.length - 1])) parts.pop();
    return parts.length ? '../'.repeat(parts.length) : '';
  }

  function href(path) {
    return `${solarBase()}${path.replace(/^\//, '')}`;
  }

  function read() {
    try {
      const raw = localStorage.getItem(storageKey());
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function write(items) {
    localStorage.setItem(storageKey(), JSON.stringify(items));
    listeners.forEach((fn) => {
      try { fn(items); } catch (_) { /* ignore */ }
    });
    syncUI();
  }

  function getItems() {
    return read();
  }

  function getCount() {
    return read().reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
  }

  function getSubtotal() {
    return read().reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function add(product, qty = 1) {
    if (!product || !product.id) return;
    const items = read();
    const q = Math.max(1, Number(qty) || 1);
    const existing = items.find((i) => i.id === product.id);
    if (existing) {
      existing.qty = (Number(existing.qty) || 0) + q;
      if (product.code) existing.code = product.code;
    } else {
      items.push({
        id: String(product.id),
        name: product.name || '',
        brand: product.brand || '',
        code: product.code || product.id || '',
        price: Number(product.price) || 0,
        image: product.image || '',
        qty: q,
      });
    }
    write(items);
  }

  function setQty(id, qty) {
    const items = read();
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const q = Math.floor(Number(qty) || 0);
    if (q <= 0) {
      write(items.filter((i) => i.id !== id));
      return;
    }
    item.qty = q;
    write(items);
  }

  function remove(id) {
    write(read().filter((i) => i.id !== id));
  }

  function clear() {
    write([]);
  }

  function ensureShell() {
    if (document.getElementById('mini-cart')) return;

    const overlay = document.createElement('div');
    overlay.id = 'mini-cart-overlay';
    overlay.className = 'mini-cart-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    const panel = document.createElement('aside');
    panel.id = 'mini-cart';
    panel.className = 'mini-cart';
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Giỏ hàng — Yêu cầu báo giá');
    panel.innerHTML = `
      <div class="mini-cart__header">
        <h2 class="mini-cart__title">GIỎ HÀNG</h2>
        <button type="button" class="mini-cart__close" id="mini-cart-close" aria-label="Đóng giỏ hàng">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="mini-cart__body" id="mini-cart-body"></div>
      <div class="mini-cart__footer" id="mini-cart-footer"></div>`;

    const toast = document.createElement('div');
    toast.id = 'cart-toast';
    toast.className = 'cart-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    document.body.appendChild(toast);

    overlay.addEventListener('click', closeMini);
    document.getElementById('mini-cart-close').addEventListener('click', closeMini);

    panel.addEventListener('click', (e) => {
      const t = e.target.closest('[data-cart-action]');
      if (!t) return;
      const id = t.getAttribute('data-id');
      const action = t.getAttribute('data-cart-action');
      if (action === 'inc') setQty(id, (read().find((i) => i.id === id)?.qty || 0) + 1);
      if (action === 'dec') setQty(id, (read().find((i) => i.id === id)?.qty || 0) - 1);
      if (action === 'remove') remove(id);
    });

    toast.addEventListener('click', (e) => {
      if (e.target.closest('[data-toast-continue]')) {
        hideToast();
        return;
      }
      if (e.target.closest('[data-toast-cart]')) {
        hideToast();
        closeMini();
        location.href = href('gio-hang/');
      }
    });
  }

  function renderMiniBody() {
    const body = document.getElementById('mini-cart-body');
    const footer = document.getElementById('mini-cart-footer');
    if (!body || !footer) return;

    const items = read();
    if (!items.length) {
      body.innerHTML = `
        <div class="mini-cart__empty">
          <p>Giỏ hàng trống.</p>
          <p class="mini-cart__hint">Thêm sản phẩm quan tâm để gửi yêu cầu báo giá.</p>
          <a href="${href('danh-muc-san-pham/')}" class="mini-cart__link">Xem sản phẩm</a>
        </div>`;
      footer.innerHTML = '';
      footer.hidden = true;
      return;
    }

    footer.hidden = false;
    body.innerHTML = `<ul class="mini-cart__list">${items.map((item) => {
      const line = (Number(item.price) || 0) * (Number(item.qty) || 0);
      const code = item.code || item.id || '';
      return `
        <li class="mini-cart__item" data-id="${esc(item.id)}">
          <div class="mini-cart__thumb">
            <img src="${esc(item.image)}" alt="" width="80" height="80" loading="lazy" />
          </div>
          <div class="mini-cart__info">
            <p class="mini-cart__name">${esc(item.name)}</p>
            ${code ? `<p class="mini-cart__code">Mã: ${esc(code)}</p>` : ''}
            <div class="mini-cart__qty" role="group" aria-label="Số lượng">
              <button type="button" data-cart-action="dec" data-id="${esc(item.id)}" aria-label="Giảm">−</button>
              <span>${esc(item.qty)}</span>
              <button type="button" data-cart-action="inc" data-id="${esc(item.id)}" aria-label="Tăng">+</button>
            </div>
            <button type="button" class="mini-cart__remove" data-cart-action="remove" data-id="${esc(item.id)}">Xóa</button>
            <div class="mini-cart__prices">
              <span class="mini-cart__unit-label">Thành tiền</span>
              <span class="mini-cart__line">${formatMoney(line)}</span>
            </div>
          </div>
        </li>`;
    }).join('')}</ul>`;

    const count = getCount();
    footer.innerHTML = `
      <div class="mini-cart__totals">
        <div class="mini-cart__row mini-cart__row--total">
          <span>Tổng sản phẩm</span>
          <strong>${count}</strong>
        </div>
        <p class="mini-cart__footnote">Giá tham khảo — báo giá chính thức sau khảo sát kỹ thuật.</p>
      </div>
      <div class="mini-cart__actions">
        <a href="${href('gio-hang/')}" class="cart-btn cart-btn--ghost">XEM GIỎ HÀNG</a>
        <a href="${href('gio-hang/#bao-gia')}" class="cart-btn cart-btn--primary">GỬI YÊU CẦU BÁO GIÁ</a>
      </div>`;
  }

  function syncBadges() {
    const count = getCount();
    document.querySelectorAll('.header-cart__badge').forEach((badge) => {
      if (count > 0) {
        const prev = badge.textContent;
        badge.hidden = false;
        badge.textContent = String(count > 99 ? '99+' : count);
        if (prev !== badge.textContent) {
          badge.classList.remove('is-bump');
          void badge.offsetWidth;
          badge.classList.add('is-bump');
        }
      } else {
        badge.hidden = true;
        badge.textContent = '0';
      }
    });

    document.querySelectorAll('.header-cart').forEach((btn) => {
      btn.setAttribute('aria-label', count ? `Giỏ hàng (${count} sản phẩm)` : 'Giỏ hàng');
    });
  }

  function syncUI() {
    renderMiniBody();
    syncBadges();
  }

  function openMini() {
    ensureShell();
    renderMiniBody();
    const overlay = document.getElementById('mini-cart-overlay');
    const panel = document.getElementById('mini-cart');
    if (!overlay || !panel) return;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('mini-cart-open');
    document.querySelectorAll('.header-cart').forEach((b) => b.setAttribute('aria-expanded', 'true'));
  }

  function closeMini() {
    const overlay = document.getElementById('mini-cart-overlay');
    const panel = document.getElementById('mini-cart');
    if (!overlay || !panel) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('mini-cart-open');
    document.querySelectorAll('.header-cart').forEach((b) => b.setAttribute('aria-expanded', 'false'));
  }

  function toggleMini() {
    const panel = document.getElementById('mini-cart');
    if (panel && panel.classList.contains('is-open')) closeMini();
    else openMini();
  }

  function hideToast() {
    const el = document.getElementById('cart-toast');
    if (!el) return;
    el.classList.remove('is-show');
    clearTimeout(toastTimer);
  }

  function toast(message) {
    ensureShell();
    const el = document.getElementById('cart-toast');
    if (!el) return;
    el.innerHTML = `<span class="cart-toast__msg">${esc(message)}</span>`;
    el.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 2500);
  }

  /** PNJ-style toast with actions */
  function toastAdded() {
    ensureShell();
    const el = document.getElementById('cart-toast');
    if (!el) return;
    el.innerHTML = `
      <div class="cart-toast__card">
        <p class="cart-toast__title"><span class="cart-toast__check" aria-hidden="true">✓</span> Đã thêm vào giỏ hàng.</p>
        <div class="cart-toast__actions">
          <button type="button" class="cart-toast__btn cart-toast__btn--ghost" data-toast-continue>TIẾP TỤC XEM</button>
          <button type="button" class="cart-toast__btn cart-toast__btn--primary" data-toast-cart>XEM GIỎ HÀNG</button>
        </div>
      </div>`;
    el.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 5000);
  }

  function flyToCart(fromEl) {
    const target = document.querySelector('.header-cart');
    if (!fromEl || !target) return;

    const img = fromEl.matches('img') ? fromEl : fromEl.querySelector('img');
    const src = img && img.src;
    if (!src) return;

    const from = (img || fromEl).getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const flyer = document.createElement('img');
    flyer.className = 'cart-flyer';
    flyer.src = src;
    flyer.alt = '';
    flyer.style.left = `${from.left + from.width / 2 - 40}px`;
    flyer.style.top = `${from.top + from.height / 2 - 40}px`;
    document.body.appendChild(flyer);

    requestAnimationFrame(() => {
      flyer.style.transform = `translate(${to.left + to.width / 2 - (from.left + from.width / 2)}px, ${to.top + to.height / 2 - (from.top + from.height / 2)}px) scale(0.2)`;
      flyer.style.opacity = '0.35';
    });

    setTimeout(() => flyer.remove(), 700);
  }

  function productFromDataset(el) {
    return {
      id: el.getAttribute('data-id') || el.getAttribute('data-slug'),
      name: el.getAttribute('data-name'),
      brand: el.getAttribute('data-brand') || '',
      code: el.getAttribute('data-code') || '',
      price: Number(el.getAttribute('data-price')) || 0,
      image: el.getAttribute('data-image') || '',
    };
  }

  function handleAddClick(btn, event) {
    event.preventDefault();
    event.stopPropagation();
    const product = productFromDataset(btn);
    if (!product.id) return;

    const card = btn.closest('.product-card, .pp-card, .pp-detail, article');
    flyToCart(card || btn);
    add(product, 1);
    toastAdded();
  }

  function bindTriggers() {
    if (eventsBound) return;
    eventsBound = true;

    document.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-cart-add]');
      if (addBtn) {
        handleAddClick(addBtn, e);
        return;
      }
      const cartBtn = e.target.closest('.header-cart, [data-cart-open]');
      if (cartBtn) {
        e.preventDefault();
        toggleMini();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideToast();
        closeMini();
      }
    });
  }

  function mountHeaderButton(container, variant) {
    if (!container) return null;
    if (container.querySelector('.header-cart')) return container.querySelector('.header-cart');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `header-cart${variant === 'light' ? ' header-cart--on-light' : ''}`;
    if (container.id === 'header-cart-slot' || !document.getElementById('header-cart-btn')) {
      btn.id = 'header-cart-btn';
    }
    btn.setAttribute('aria-label', 'Giỏ hàng');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'mini-cart');
    btn.innerHTML = `${BAG_ICON}<span class="header-cart__badge" hidden>0</span>`;
    container.appendChild(btn);
    return btn;
  }

  function init() {
    ensureShell();
    bindTriggers();

    document.querySelectorAll('[data-cart-mount]').forEach((slot) => {
      mountHeaderButton(slot, slot.getAttribute('data-cart-mount') || 'light');
    });

    const ppHeader = document.querySelector('.pp-header');
    if (ppHeader && !ppHeader.querySelector('.header-cart') && !ppHeader.querySelector('[data-cart-mount]')) {
      let slot = ppHeader.querySelector('.pp-header__cart');
      if (!slot) {
        slot = document.createElement('div');
        slot.className = 'pp-header__cart';
        slot.setAttribute('data-cart-mount', 'light');
        ppHeader.appendChild(slot);
      }
      mountHeaderButton(slot, 'light');
    }

    syncUI();
    return { openMini, closeMini, syncUI };
  }

  function quoteFormHTML(idPrefix) {
    const types = PROJECT_TYPES.map((t) =>
      `<label class="quote-type"><input type="radio" name="projectType" value="${esc(t)}" ${t === 'Nhà ở' ? 'checked' : ''}/><span>${esc(t)}</span></label>`
    ).join('');

    return `
      <form class="quote-form" id="${idPrefix}-form" novalidate>
        <h2 class="cart-summary__title" id="bao-gia">Thông tin khách hàng</h2>
        <p class="quote-form__lead">Điền thông tin để nhận báo giá &amp; tư vấn kỹ thuật. Không thanh toán trực tuyến.</p>
        <label>Họ và tên *
          <input type="text" name="name" required autocomplete="name" />
        </label>
        <label>Số điện thoại *
          <input type="tel" name="phone" required autocomplete="tel" />
        </label>
        <label>Email
          <input type="email" name="email" autocomplete="email" />
        </label>
        <label>Địa chỉ *
          <textarea name="address" rows="2" required autocomplete="street-address"></textarea>
        </label>
        <label>Tên công trình
          <input type="text" name="projectName" placeholder="VD: Biệt thự Bình Dương" />
        </label>
        <fieldset class="quote-form__types">
          <legend>Loại công trình</legend>
          <div class="quote-types">${types}</div>
        </fieldset>
        <label>Nội dung
          <textarea name="message" rows="4" placeholder="Nhu cầu công suất, thời gian lắp đặt, ghi chú…"></textarea>
        </label>
        <button type="submit" class="cart-btn cart-btn--primary cart-btn--block">GỬI YÊU CẦU BÁO GIÁ</button>
      </form>`;
  }

  function saveQuote(payload) {
    console.log('[SolarMN] Quote request', payload);
    try {
      const prev = JSON.parse(localStorage.getItem(quoteStorageKey()) || '[]');
      prev.push(payload);
      localStorage.setItem(quoteStorageKey(), JSON.stringify(prev));
    } catch (_) { /* ignore */ }
    if (typeof window.SolarQuoteAPI === 'function') {
      try { window.SolarQuoteAPI(payload); } catch (_) { /* ignore */ }
    }
  }

  function bindQuoteForm(form, onSuccess) {
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!getItems().length) {
        toast('Giỏ hàng đang trống. Vui lòng chọn sản phẩm.');
        return;
      }
      const fd = new FormData(form);
      const name = String(fd.get('name') || '').trim();
      const phone = String(fd.get('phone') || '').trim();
      const address = String(fd.get('address') || '').trim();
      if (!name || !phone || !address) {
        toast('Vui lòng điền Họ tên, SĐT và Địa chỉ.');
        return;
      }
      const payload = {
        at: new Date().toISOString(),
        type: 'quote',
        customer: {
          name,
          phone,
          email: String(fd.get('email') || '').trim(),
          address,
          projectName: String(fd.get('projectName') || '').trim(),
          projectType: String(fd.get('projectType') || '').trim(),
          message: String(fd.get('message') || '').trim(),
        },
        items: getItems(),
        itemCount: getCount(),
        estimateTotal: getSubtotal(),
      };
      saveQuote(payload);
      clear();
      onSuccess();
    });
  }

  /* ---------- Cart page: list + quote form ---------- */
  function mountCartPage() {
    init();
    const root = document.getElementById('cart-page');
    if (!root) return;

    let submitted = false;

    function renderSuccess() {
      root.innerHTML = `
        <div class="quote-success">
          <div class="quote-success__icon" aria-hidden="true">✓</div>
          <h1>Cảm ơn Quý khách.</h1>
          <p>Solar Miền Nam đã nhận được yêu cầu.</p>
          <p class="quote-success__sub">Chuyên viên sẽ liên hệ trong vòng <strong>30 phút</strong>.</p>
          <a href="${href('danh-muc-san-pham/')}" class="cart-btn cart-btn--primary">Tiếp tục xem sản phẩm</a>
        </div>`;
    }

    function render() {
      if (submitted) {
        renderSuccess();
        return;
      }

      const items = getItems();

      if (!items.length) {
        root.innerHTML = `
          <div class="cart-page__empty">
            <h1>Giỏ hàng</h1>
            <p>Chưa có sản phẩm nào. Thêm sản phẩm quan tâm để gửi yêu cầu báo giá.</p>
            <a class="cart-btn cart-btn--primary" href="${href('danh-muc-san-pham/')}">Xem danh mục sản phẩm</a>
          </div>`;
        return;
      }

      const count = getCount();
      root.innerHTML = `
        <div class="cart-page__head">
          <h1 class="cart-page__title">Giỏ hàng</h1>
          <p class="cart-page__subtitle">Danh sách sản phẩm quan tâm · Gửi yêu cầu báo giá (không thanh toán online)</p>
        </div>
        <div class="cart-page__layout cart-page__layout--quote">
          <div class="cart-page__list">
            ${items.map((item) => {
              const line = (Number(item.price) || 0) * (Number(item.qty) || 0);
              const code = item.code || item.id || '';
              return `
              <article class="cart-line" data-id="${esc(item.id)}">
                <div class="cart-line__media">
                  <img src="${esc(item.image)}" alt="${esc(item.name)}" width="96" height="96" />
                </div>
                <div class="cart-line__main">
                  <h2 class="cart-line__name">${esc(item.name)}</h2>
                  ${code ? `<p class="cart-line__code">Mã: ${esc(code)}</p>` : ''}
                  ${item.brand ? `<p class="cart-line__brand">${esc(item.brand)}</p>` : ''}
                  <div class="cart-line__controls">
                    <div class="mini-cart__qty" role="group" aria-label="Số lượng">
                      <button type="button" data-page-qty="-1" data-id="${esc(item.id)}" aria-label="Giảm">−</button>
                      <span>${esc(item.qty)}</span>
                      <button type="button" data-page-qty="1" data-id="${esc(item.id)}" aria-label="Tăng">+</button>
                    </div>
                    <button type="button" class="cart-line__remove" data-page-remove="${esc(item.id)}">Xóa</button>
                  </div>
                </div>
                <div class="cart-line__total">
                  <span class="cart-line__total-label">Thành tiền</span>
                  ${formatMoney(line)}
                </div>
              </article>`;
            }).join('')}
            <div class="cart-page__meta">
              <span>Tổng sản phẩm: <strong>${count}</strong></span>
              <a href="${href('danh-muc-san-pham/')}" class="cart-page__continue">← Tiếp tục xem sản phẩm</a>
            </div>
          </div>
          <aside class="cart-summary cart-summary--quote" id="quote-panel">
            ${quoteFormHTML('quote')}
          </aside>
        </div>`;

      bindQuoteForm(document.getElementById('quote-form'), () => {
        submitted = true;
        renderSuccess();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      if (location.hash === '#bao-gia') {
        requestAnimationFrame(() => {
          document.getElementById('bao-gia')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    }

    root.addEventListener('click', (e) => {
      const rem = e.target.closest('[data-page-remove]');
      if (rem) {
        remove(rem.getAttribute('data-page-remove'));
        return;
      }
      const qtyBtn = e.target.closest('[data-page-qty]');
      if (qtyBtn) {
        const id = qtyBtn.getAttribute('data-id');
        const delta = Number(qtyBtn.getAttribute('data-page-qty')) || 0;
        const cur = read().find((i) => i.id === id);
        if (cur) setQty(id, (Number(cur.qty) || 0) + delta);
      }
    });

    subscribe(() => {
      if (!submitted) render();
    });
    render();
  }

  /** Legacy URL /thanh-toan → redirect to quote cart */
  function mountCheckoutPage() {
    location.replace(href('gio-hang/'));
  }

  return {
    formatMoney,
    getItems,
    getCount,
    getSubtotal,
    add,
    setQty,
    remove,
    clear,
    subscribe,
    openMini,
    closeMini,
    toast,
    toastAdded,
    flyToCart,
    init,
    mountCartPage,
    mountCheckoutPage,
    solarBase,
    href,
  };
})();
