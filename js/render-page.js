/**
 * Shared page renderer — one layout for /solar and /den-led
 * Content & colors come from SiteThemes[id]
 */
const PageRender = (() => {
  const ICONS = {
    survey: '<svg width="32" height="32" viewBox="0 0 48 48" fill="none"><rect x="6" y="22" width="22" height="16" rx="1.5" stroke="currentColor" stroke-width="2"/><path d="M6 30h22M17 22v16" stroke="currentColor" stroke-width="2"/><circle cx="34" cy="16" r="7" stroke="currentColor" stroke-width="2"/><path d="M34 11v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    shield: '<svg width="32" height="32" viewBox="0 0 48 48" fill="none"><path d="M24 6l14 6v10c0 9.5-6.2 16.4-14 20-7.8-3.6-14-10.5-14-20V12l14-6z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M17 24l5 5 9-10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    worker: '<svg width="32" height="32" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="16" r="7" stroke="currentColor" stroke-width="2"/><path d="M10 40c2.5-7 8-11 14-11s11.5 4 14 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16 14h-3l1 5h4M32 12l4 2-2 5h-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    warranty: '<svg width="32" height="32" viewBox="0 0 48 48" fill="none"><path d="M18 28v6a4 4 0 0 0 4 4h2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M14 20a10 10 0 0 1 20 0v6a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4v-6z" stroke="currentColor" stroke-width="2"/><circle cx="34" cy="18" r="3" fill="currentColor"/></svg>',
    search: '<svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="22" cy="22" r="10"/><path d="M30 30l10 10" stroke-linecap="round"/><path d="M18 22h8M22 18v8" stroke-linecap="round"/></svg>',
    design: '<svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 38l8-22 6 10 6-16 8 28" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 38h32" stroke-linecap="round"/><circle cx="18" cy="16" r="2" fill="currentColor"/><circle cx="30" cy="12" r="2" fill="currentColor"/></svg>',
    build: '<svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 34V22l10-6 10 6v12" stroke-linejoin="round"/><path d="M20 34v-8h8v8"/><path d="M12 18l4-6h16l4 6" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 38h32" stroke-linecap="round"/></svg>',
    check: '<svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 24l7 7 13-14" stroke-linecap="round" stroke-linejoin="round"/><circle cx="24" cy="24" r="16"/></svg>',
    maintain: '<svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M24 10v8M24 30v8M10 24h8M30 24h8" stroke-linecap="round"/><circle cx="24" cy="24" r="6"/><circle cx="24" cy="24" r="14"/></svg>',
    monitor: '<svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="10" width="32" height="22" rx="2"/><path d="M18 40h12M24 32v8" stroke-linecap="round"/><path d="M14 28l6-8 5 5 7-10" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    support: '<svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 34v-4a8 8 0 0 1 16 0v4"/><circle cx="24" cy="16" r="6"/><path d="M10 38h28" stroke-linecap="round"/><path d="M34 22l6-2v8l-6-2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    sunMark: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" fill="currentColor"/><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="7.05" y2="7.05"/><line x1="16.95" y1="16.95" x2="19.07" y2="19.07"/><line x1="4.93" y1="19.07" x2="7.05" y2="16.95"/><line x1="16.95" y1="7.05" x2="19.07" y2="4.93"/></g></svg>',
    sun: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.5" fill="#fff"/><g stroke="#fff" stroke-width="1.6" stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="7.05" y2="7.05"/><line x1="16.95" y1="16.95" x2="19.07" y2="19.07"/><line x1="4.93" y1="19.07" x2="7.05" y2="16.95"/><line x1="16.95" y1="7.05" x2="19.07" y2="4.93"/></g></svg>',
    bulb: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.7"><path d="M9 18h6M10 21h4" stroke-linecap="round"/><path d="M12 3a6 6 0 0 0-3.2 10.9c.5.4.9 1 1 1.6h4.4c.1-.6.5-1.2 1-1.6A6 6 0 0 0 12 3z" stroke-linejoin="round"/></svg>',
    save: '<svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M24 8v8M18 14h12" stroke-linecap="round"/><path d="M16 22h16l-2 18H18l-2-18z" stroke-linejoin="round"/><path d="M20 28h8M21 34h6" stroke-linecap="round"/></svg>',
    bolt: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/></svg>',
    lamp: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 21h4"/><path d="M12 2a6 6 0 0 0-3.2 10.9c.5.4.9 1 1 1.6h4.4c.1-.6.5-1.2 1-1.6A6 6 0 0 0 12 2z"/></svg>',
    pin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    arrow: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ext: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M7 7h10v10"/></svg>',
    area: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 12h16M12 4v16" stroke-linecap="round"/></svg>',
    system: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" stroke-linecap="round"/></svg>',
    cart: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M3 4h2l2.4 11h10.2l2-8H7"/></svg>',
    calendar: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18" stroke-linecap="round"/></svg>',
    phone: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  };

  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isPlaceholderSocial(url) {
    if (!url) return true;
    const u = String(url).trim().toLowerCase().replace(/\/$/, '');
    const banned = [
      'https://facebook.com',
      'https://www.facebook.com',
      'http://facebook.com',
      'https://youtube.com',
      'https://www.youtube.com',
      'http://youtube.com',
      'https://linkedin.com',
      'https://www.linkedin.com',
    ];
    return banned.includes(u);
  }

  function socialLinksHtml(c) {
    const items = [];
    const fb = c.socials && c.socials.facebook;
    const yt = c.socials && c.socials.youtube;
    const zalo = (c.socials && c.socials.zalo) || c.zalo;
    if (fb && !isPlaceholderSocial(fb)) {
      items.push(`<li><a href="${esc(fb)}" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z"/></svg></a></li>`);
    }
    if (zalo) {
      items.push(`<li><a href="${esc(zalo)}" target="_blank" rel="noopener noreferrer" aria-label="Zalo"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 5.6 2 10c0 2.9 1.9 5.5 4.7 6.9-.2.8-.8 2.8-.9 3.2-.1.5.2.5.4.4.2-.1 2.7-1.8 3.7-2.5.7.1 1.4.1 2.1.1 5.5 0 10-3.6 10-8S17.5 2 12 2z"/></svg></a></li>`);
    }
    if (yt && !isPlaceholderSocial(yt)) {
      items.push(`<li><a href="${esc(yt)}" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23 12.2s0-3.2-.4-4.7c-.2-.9-.9-1.6-1.8-1.8C18.4 5.2 12 5.2 12 5.2s-6.4 0-8.8.5c-.9.2-1.6.9-1.8 1.8C1 9 1 12.2 1 12.2s0 3.2.4 4.7c.2.9.9 1.6 1.8 1.8 2.4.5 8.8.5 8.8.5s6.4 0 8.8-.5c.9-.2 1.6-.9 1.8-1.8.4-1.5.4-4.7.4-4.7zM9.8 15.5v-6.6l5.7 3.3-5.7 3.3z"/></svg></a></li>`);
    }
    if (!items.length) return '';
    return `<ul class="contact-social" aria-label="Mạng xã hội">${items.join('')}</ul>`;
  }

  function footerSocialHtml(c) {
    const items = [];
    const fb = c.socials && c.socials.facebook;
    const yt = c.socials && c.socials.youtube;
    const zalo = (c.socials && c.socials.zalo) || c.zalo;
    if (fb && !isPlaceholderSocial(fb)) {
      items.push(`<li><a href="${esc(fb)}" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z"/></svg></a></li>`);
    }
    if (zalo) {
      items.push(`<li><a href="${esc(zalo)}" target="_blank" rel="noopener noreferrer" aria-label="Zalo"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 5.6 2 10c0 2.9 1.9 5.5 4.7 6.9-.2.8-.8 2.8-.9 3.2-.1.5.2.5.4.4.2-.1 2.7-1.8 3.7-2.5.7.1 1.4.1 2.1.1 5.5 0 10-3.6 10-8S17.5 2 12 2z"/></svg></a></li>`);
    }
    if (yt && !isPlaceholderSocial(yt)) {
      items.push(`<li><a href="${esc(yt)}" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23 12.2s0-3.2-.4-4.7c-.2-.9-.9-1.6-1.8-1.8C18.4 5.2 12 5.2 12 5.2s-6.4 0-8.8.5c-.9.2-1.6.9-1.8 1.8C1 9 1 12.2 1 12.2s0 3.2.4 4.7c.2.9.9 1.6 1.8 1.8 2.4.5 8.8.5 8.8.5s6.4 0 8.8-.5c.9-.2 1.6-.9 1.8-1.8.4-1.5.4-4.7.4-4.7zM9.8 15.5v-6.6l5.7 3.3-5.7 3.3z"/></svg></a></li>`);
    }
    if (!items.length) return '';
    return `<ul class="footer-social" aria-label="Mạng xã hội">${items.join('')}</ul>`;
  }

  function titleHtml(parts, accentIndex) {
    return parts.map((p, i) => (i === accentIndex ? `<span class="text-primary">${esc(p)}</span>` : esc(p))).join('');
  }

  function titleLinesHtml(lines, accentIndex) {
    return lines.map((p, i) => {
      const content = i === accentIndex ? `<span class="text-primary">${esc(p)}</span>` : esc(p);
      return i < lines.length - 1 ? `${content}<br />` : content;
    }).join('');
  }

  /** Multi-layer section atmosphere: photo → gradient → overlay → pattern → noise */
  function sectionBg(bg, soft = true) {
    if (!bg?.src) return '';
    const overlay = typeof bg.overlay === 'number' ? bg.overlay : 0.92;
    const tone = bg.tone || 'white';
    const pattern = bg.pattern || 'solar-grid';
    const softCls = soft ? ' section-bg--soft' : '';
    return `
      <div class="section-bg section-bg--tone-${esc(tone)} section-bg--pattern-${esc(pattern)}${softCls}" style="--section-overlay:${overlay}" aria-hidden="true">
        <div class="section-bg__media" style="background-image:url('${esc(bg.src)}')"></div>
        <div class="section-bg__gradient"></div>
        <div class="section-bg__overlay"></div>
        <div class="section-bg__pattern"></div>
        <div class="section-bg__noise"></div>
        <div class="section-bg__tint"></div>
        <div class="section-bg__edge"></div>
      </div>`;
  }

  function render(theme) {
    const c = theme.contact;
    const nav = [
      ['01', 'Trang chủ'],
      ['02', 'Giới thiệu'],
      ['03', 'Sản phẩm'],
      ['04', 'Dịch vụ'],
      ['05', 'Dự án'],
      ['06', 'Khách hàng'],
      ['07', 'Tin tức'],
      ['08', 'Liên hệ'],
    ];

    const slides = theme.hero.slides.map((s, i) => `
      <div class="hero-slide${i === 0 ? ' is-active' : ''}" data-index="${i}">
        <img src="${esc(s.src)}" alt="${esc(s.alt)}" class="hero-slide__img"${i === 0 ? ' fetchpriority="high" decoding="async"' : ' loading="lazy" decoding="async"'} />
      </div>`).join('');

    const heroTitle = theme.hero.title.map((line, i) => {
      const cls = i === theme.hero.titleAccentIndex ? ' class="text-primary"' : '';
      return `<span${cls}>${esc(line)}</span>`;
    }).join('<br />');

    const brandIconKey = theme.brandIcon || 'sun';
    const brandIcon = ICONS[brandIconKey] || ICONS.sun;
    const projectMetaIcon = theme.id === 'led' ? ICONS.lamp : ICONS.bolt;
    const hasPages = theme.id === 'solar' || theme.id === 'led';
    const firstProjectSlug = (theme.projects.items[0] && theme.projects.items[0].slug) || '';
    const projectMetaLabel = theme.projectMetaLabel || 'Công suất';

    function navHref(id) {
      if (!hasPages) return `#section-${id}`;
      if (id === '01') return './';
      if (id === '02') return 'gioi-thieu/';
      if (id === '03') return 'san-pham/';
      if (id === '04') return 'dich-vu/';
      if (id === '05') return 'du-an/';
      if (id === '06') return 'khach-hang/';
      if (id === '07') return 'tin-tuc/';
      return `#section-${id}`;
    }

    const productCats = ((theme.products && theme.products.categories) || []).filter((c) => c.id && c.id !== 'all');
    const productItems = (theme.products && theme.products.items) || [];

    const productsDropdown = hasPages
      ? `<div class="nav-drop" role="menu">
          <a href="san-pham/" class="nav-drop__all">Tất cả sản phẩm</a>
          <ul class="nav-drop__list">
            ${productCats.map((cat) => {
              const kids = productItems.filter((p) => p.category === cat.id).slice(0, 6);
              return `<li class="nav-drop__item">
                <a href="san-pham/?cat=${esc(cat.id)}" class="nav-drop__cat">${esc(cat.label)}</a>
                ${kids.length ? `<ul class="nav-drop__sub">
                  ${kids.map((p) => `<li><a href="san-pham/${esc(p.slug)}/">${esc(p.name)}</a></li>`).join('')}
                  <li><a class="nav-drop__more" href="san-pham/?cat=${esc(cat.id)}">Xem tất cả →</a></li>
                </ul>` : ''}
              </li>`;
            }).join('')}
          </ul>
        </div>`
      : '';

    const projectItems = (theme.projects && theme.projects.items) || [];
    const projectsDropdown = hasPages
      ? `<div class="nav-drop" role="menu">
          <a href="du-an/" class="nav-drop__all">Tất cả dự án</a>
          <ul class="nav-drop__list">
            ${projectItems.map((p) => `
              <li class="nav-drop__item">
                <a href="du-an/${esc(p.slug)}/" class="nav-drop__cat">${esc(p.title)}</a>
              </li>`).join('')}
          </ul>
        </div>`
      : '';

    const navLinks = nav.map(([id, label], i) => {
      const href = navHref(id);
      if (id === '03' && hasPages) {
        return `<div class="nav-item nav-item--products">
          <a href="${href}" class="nav-link nav-link--drop${i === 0 ? ' is-active' : ''}" data-section="${id}" aria-haspopup="true">${esc(label)}</a>
          ${productsDropdown}
        </div>`;
      }
      if (id === '05' && hasPages) {
        return `<div class="nav-item nav-item--products">
          <a href="${href}" class="nav-link nav-link--drop${i === 0 ? ' is-active' : ''}" data-section="${id}" aria-haspopup="true">${esc(label)}</a>
          ${projectsDropdown}
        </div>`;
      }
      return `<a href="${href}" class="nav-link${i === 0 ? ' is-active' : ''}" data-section="${id}">${esc(label)}</a>`;
    }).join('');

    const sideLinks = nav.map(([id, label]) => {
      const href = navHref(id);
      if (id === '03' && hasPages) {
        return `<div class="side-menu-group">
          <a href="${href}" class="side-menu-link" data-section="${id}">${esc(label)}</a>
          <ul class="side-menu-sub">
            ${productCats.map((cat) => `<li><a href="san-pham/?cat=${esc(cat.id)}">${esc(cat.label)}</a></li>`).join('')}
          </ul>
        </div>`;
      }
      if (id === '05' && hasPages) {
        return `<div class="side-menu-group">
          <a href="${href}" class="side-menu-link" data-section="${id}">${esc(label)}</a>
          <ul class="side-menu-sub">
            ${projectItems.map((p) => `<li><a href="du-an/${esc(p.slug)}/">${esc(p.title)}</a></li>`).join('')}
          </ul>
        </div>`;
      }
      return `<a href="${href}" class="side-menu-link" data-section="${id}">${esc(label)}</a>`;
    }).join('');

    const aboutAccent = theme.about.titleAccentIndex ?? 1;
    const aboutTitleLines = (theme.about.titleLines || []).map((line, i) => {
      const accentCls = i === aboutAccent ? ' about-title__line--accent' : '';
      return `<span class="about-title__line${accentCls}" data-typing="${esc(line)}"></span>`;
    }).join('');

    const aboutHighlight = theme.about.highlight
      ? `<p class="about-highlight">${esc(theme.about.highlight)}</p>`
      : '';

    const features = (theme.about.features || []).map((f) => `
      <li class="about-feature">
        <span class="about-feature__icon" aria-hidden="true">${ICONS[f.icon] || ICONS.survey}</span>
        <h3 class="about-feature__title">${esc(f.title)}</h3>
      </li>`).join('');

    const aboutFeatures = features
      ? `<ul class="about-features">${features}</ul>`
      : '';

    const aboutCta = theme.about.cta
      ? `<a href="${esc(theme.about.ctaHref || 'gioi-thieu/')}" class="about-cta"><span>${esc(theme.about.cta)}</span><span class="about-cta__arrow" aria-hidden="true">→</span></a>`
      : '';

    const cartIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/><path d="M9 11h6"/></svg>';

    const products = theme.products.items.map((p) => {
      const slug = p.slug || String(p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const detailHref = hasPages
        ? `san-pham/${esc(slug)}/`
        : (theme.products.catalogHref || 'san-pham/');
      const price = Number(p.price) || 0;
      const fmt = (n) => `${new Intl.NumberFormat('vi-VN').format(n)}<span class="product-card__currency">₫</span>`;
      const code = p.code || slug;
      const cat = p.category || '';
      const wattFromName = (String(p.name || '').match(/(\d+\s*W)\b/i) || [])[1] || '';
      const watt = (p.specs && p.specs[0]) || wattFromName;
      const modelParts = [code, watt].filter(Boolean);
      const modelLine = p.model || (modelParts.length ? modelParts.join(' ') : '');
      let titleLine = p.title || p.name || '';
      if (!p.title) {
        let t = String(p.name || '');
        if (code) t = t.replace(new RegExp(code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '');
        if (watt) t = t.replace(new RegExp(String(watt).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '');
        titleLine = t.replace(/\s{2,}/g, ' ').trim() || p.name || '';
      }
      const cartBtn = hasPages ? `
          <button type="button" class="product-card__cart" data-cart-add
            data-id="${esc(slug)}"
            data-name="${esc(p.name)}"
            data-brand="${esc(p.brand || '')}"
            data-code="${esc(code)}"
            data-price="${price}"
            data-image="${esc(p.image)}"
            aria-label="Thêm ${esc(p.name)} vào giỏ">${cartIcon}</button>` : '';
      return `
      <li data-category="${esc(cat)}">
        <article class="product-card" data-product-slug="${esc(slug)}">
          <a href="${detailHref}" class="product-card__link" aria-label="${esc(p.name)}">
            <div class="product-card__media">
              <img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" />
            </div>
            <div class="product-card__body">
              <h3 class="product-card__name">${esc(titleLine)}</h3>
              ${modelLine ? `<p class="product-card__model">${esc(modelLine)}</p>` : ''}
            </div>
          </a>
          <div class="product-card__row">
            ${price ? `<p class="product-card__price">${fmt(price)}</p>` : '<span></span>'}
            ${cartBtn}
          </div>
        </article>
      </li>`;
    }).join('');

    const productCatsHtml = (theme.products.categories || []).map((c, i) =>
      `<button type="button" class="products-cat${i === 0 ? ' is-active' : ''}" data-category="${esc(c.id)}">${esc(c.label)}</button>`
    ).join('');

    const projects = theme.projects.items.map((p) => {
      const slug = p.slug || String(p.title || '').toLowerCase().replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+/gi, '-').replace(/^-|-$/g, '');
      const href = hasPages ? `du-an/${esc(slug)}/` : '#section-05';
      const metaBits = [p.place, p.power, p.year].filter(Boolean);
      const metaLine = metaBits.length ? metaBits.map(esc).join(' · ') : '';
      return `
      <li class="pj-slide">
        <article class="pj-card">
          <div class="pj-card__media">
            <img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" />
            <span class="pj-card__overlay" aria-hidden="true"></span>
          </div>
          <div class="pj-card__bar">
            <h3 class="pj-card__title">${esc(p.title)}</h3>
            <a href="${href}" class="pj-card__cta" data-project-link>Chi tiết <span aria-hidden="true">→</span></a>
          </div>
        </article>
      </li>`;
    }).join('');

    const pjTitleA = esc((theme.projects.title && theme.projects.title[0]) || 'DỰ ÁN ');
    const pjTitleB = esc((theme.projects.title && theme.projects.title[1]) || 'ĐÃ THỰC HIỆN');
    const pjDesc = esc(theme.projects.desc || '');

    const serviceItems = (theme.services.steps || []).slice(0, 4);
    const services = serviceItems.map((s) => {
      const slug = s.slug || String(s.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const href = hasPages ? `dich-vu/${esc(slug)}/` : '#section-04';
      const img = s.image || 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1200&q=85';
      return `
      <li class="svc-slide">
        <article class="svc-card">
          <a href="${href}" class="svc-card__link" aria-label="${esc(s.title)}">
            <div class="svc-card__media">
              <img src="${esc(img)}" alt="${esc(s.title)}" loading="lazy" />
              <span class="svc-card__overlay" aria-hidden="true"></span>
            </div>
            <div class="svc-card__body">
              <span class="svc-card__icon" aria-hidden="true">${ICONS[s.icon] || ICONS.search}</span>
              <h3 class="svc-card__title">${esc(s.title)}</h3>
              <span class="svc-card__line" aria-hidden="true"></span>
            </div>
          </a>
        </article>
      </li>`;
    }).join('');

    const svcTitleA = esc((theme.services.title && theme.services.title[0]) || 'DỊCH VỤ HỆ THỐNG ');
    const svcTitleB = esc((theme.services.title && theme.services.title[1]) || 'ĐIỆN MẶT TRỜI');
    const svcDesc = esc(theme.services.desc || '');

    const newsItems = theme.news.items || [];
    const newsFeatured = newsItems.find((n) => n.featured) || newsItems[0];
    const newsSide = newsItems.filter((n) => n !== newsFeatured).slice(0, 3);

    function newsHref(n) {
      const slug = n.slug || String(n.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return hasPages ? `tin-tuc/${esc(slug)}/` : '#section-07';
    }

    const calIcon = ICONS.calendar || '';
    const newsFeaturedHtml = newsFeatured ? `
      <a href="${newsHref(newsFeatured)}" class="news-featured" data-news-link aria-label="${esc(newsFeatured.title)}">
        <div class="news-featured__media">
          <img src="${esc(newsFeatured.image)}" alt="${esc(newsFeatured.title)}" loading="lazy" />
          <span class="news-featured__overlay" aria-hidden="true"></span>
        </div>
        <span class="news-featured__badge">${esc(newsFeatured.cat || 'NỔI BẬT')}</span>
        <div class="news-featured__content">
          <time class="news-featured__date" datetime="${esc(newsFeatured.datetime || '')}">
            <span class="news-featured__date-icon" aria-hidden="true">${calIcon}</span>
            ${esc(newsFeatured.date || '')}
          </time>
          <h3 class="news-featured__title">${esc(newsFeatured.title)}</h3>
          ${newsFeatured.excerpt ? `<p class="news-featured__excerpt">${esc(newsFeatured.excerpt)}</p>` : ''}
          <span class="news-featured__more">Đọc chi tiết <span aria-hidden="true">→</span></span>
        </div>
      </a>` : '';

    const newsSideHtml = newsSide.map((n) => `
      <a href="${newsHref(n)}" class="news-item" data-news-link aria-label="${esc(n.title)}">
        <div class="news-item__media">
          <img src="${esc(n.image)}" alt="" loading="lazy" />
        </div>
        <div class="news-item__body">
          <time class="news-item__date" datetime="${esc(n.datetime || '')}">
            <span class="news-item__date-icon" aria-hidden="true">${calIcon}</span>
            ${esc(n.date || '')}
          </time>
          <h3 class="news-item__title">${esc(n.title)}</h3>
          <span class="news-item__more">Đọc thêm <span aria-hidden="true">→</span></span>
        </div>
      </a>`).join('');

    const newsTitleA = esc((theme.news.title && theme.news.title[0]) || 'TIN ');
    const newsTitleB = esc((theme.news.title && theme.news.title[1]) || 'TỨC');
    const newsDesc = esc(theme.news.desc || '');

    const tm = theme.testimonials || { items: [] };
    const tmItems = (tm.items || []).map((t) => {
      const stars = '★'.repeat(Math.max(1, Math.min(5, t.rating || 5)));
      return `
      <li class="tm-slide">
        <article class="tm-card">
          <div class="tm-card__media">
            <img src="${esc(t.image)}" alt="" loading="lazy" />
          </div>
          <div class="tm-card__body">
            <div class="tm-stars" aria-label="${t.rating || 5} sao">${stars}</div>
            <p class="tm-quote">${esc(t.quote)}</p>
            <div class="tm-card__foot">
              <img class="tm-avatar" src="${esc(t.avatar)}" alt="${esc(t.name)}" loading="lazy" width="42" height="42" />
              <div class="tm-person">
                <p class="tm-name">${esc(t.name)}</p>
                <p class="tm-role">${esc(t.role)}</p>
              </div>
            </div>
          </div>
        </article>
      </li>`;
    }).join('');

    const footer = theme.footer || {};
    const footerProductExtras = (footer.productLinks || []).slice(0, 4).map((l) => {
      if (typeof l === 'object' && l.href) return `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`;
      return `<li><a href="san-pham/">${esc(l)}</a></li>`;
    }).join('');
    const footerProducts = `<li><a href="san-pham/">Danh mục sản phẩm</a></li>
         <li><a href="gio-hang/">Giỏ hàng</a></li>
         ${footerProductExtras}
         <li><a href="san-pham/">Xem tất cả sản phẩm</a></li>`;

    const footerMidTitle = 'Dịch vụ';
    const footerServiceLinks = footer.serviceLinks || [];
    const footerMidLinks = footerServiceLinks.length
      ? `<li><a href="dich-vu/">Tất cả dịch vụ</a></li>
         ${footerServiceLinks.slice(0, 4).map((l) => {
           if (typeof l === 'object' && l.href) return `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`;
           return `<li><a href="dich-vu/">${esc(l)}</a></li>`;
         }).join('')}
         <li><a href="tin-tuc/">Tin tức</a></li>`
      : `<li><a href="dich-vu/">Tất cả dịch vụ</a></li>
         <li><a href="tin-tuc/">Tin tức</a></li>`;

    const heroPrimaryHref = theme.hero.ctaPrimaryHref || c.zalo;
    const heroPrimaryExternal = /^https?:/i.test(heroPrimaryHref);
    const heroSecondaryHref = theme.hero.ctaSecondaryHref || (hasPages ? 'san-pham/' : '#section-03');

    return `
  <a class="skip-link" href="#fullpage">Bỏ qua điều hướng</a>
  <header id="site-header" class="site-header fixed top-0 left-0 right-0 z-50">
    <div class="header-inner mx-auto max-w-[1600px] px-5 lg:px-10">
      <a href="../" class="header-logo flex shrink-0 items-center gap-3.5" aria-label="Hợp Nhất Energy - Về cổng chọn lĩnh vực">
        <span class="logo-mark flex items-center justify-center rounded-full bg-primary">${brandIcon}</span>
        <span class="logo-text leading-tight">
          <span class="logo-text__main">${esc(theme.brand.name)}</span>
          <span class="logo-text__sub">${esc(theme.brand.sub)}</span>
        </span>
      </a>
      <nav id="header-nav" class="header-nav" aria-label="Menu chính">${navLinks}</nav>
      <div class="header-actions flex items-center gap-4 lg:gap-5">
        <div class="header-tools">
          <a href="tel:${esc(c.phoneTel)}" class="header-phone hidden items-center gap-3 sm:flex" aria-label="Gọi ${esc(c.phone)}">
            <span class="phone-icon flex items-center justify-center rounded-full border border-white/30">${ICONS.phone}</span>
            <span class="header-phone__num">${esc(c.phone)}</span>
          </a>
          ${hasPages ? `
          <button type="button" id="header-cart-btn" class="header-cart" aria-label="Giỏ hàng" aria-expanded="false" aria-controls="mini-cart">
            <svg class="header-cart__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/><path d="M9 11h6"/>
            </svg>
            <span class="header-cart__badge" hidden>0</span>
          </button>` : ''}
        </div>
        <button type="button" id="mobile-menu-toggle" class="menu-toggle flex h-10 items-center justify-center gap-2.5 lg:hidden" aria-label="Mở menu" aria-expanded="false">
          <span class="menu-toggle-bars" aria-hidden="true"><span></span><span></span><span></span></span>
        </button>
      </div>
    </div>
  </header>

  <div id="side-menu-overlay" class="side-menu-overlay" aria-hidden="true"></div>
  <aside id="side-menu" class="side-menu" aria-hidden="true">
    <button type="button" id="side-menu-close" class="side-menu-close" aria-label="Đóng menu">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <nav class="side-menu-nav" aria-label="Menu chính">${sideLinks}</nav>
    <div class="side-menu-footer">
      <a href="${esc(c.zalo)}" target="_blank" rel="noopener noreferrer" class="side-menu-zalo">Liên hệ Zalo</a>
      <a href="tel:${esc(c.phoneTel)}" class="side-menu-phone">${esc(c.phone)}</a>
    </div>
  </aside>

  <main id="fullpage" class="fullpage">
    <section id="section-01" class="fp-section hero is-active" data-section="01" aria-label="Hero">
      <div class="hero-slideshow" id="hero-slideshow" aria-hidden="true">
        ${slides}
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content">
        <div class="hero-content__inner">
          <h1 class="hero-title anim-fade-up">${heroTitle}</h1>
          <p class="hero-desc anim-fade-up anim-delay-1">${esc(theme.hero.desc)}</p>
          <div class="hero-actions anim-fade-up anim-delay-2">
            <a href="${esc(heroPrimaryHref)}"${heroPrimaryExternal ? ' target="_blank" rel="noopener noreferrer"' : ''} class="btn btn-primary">${esc(theme.hero.ctaPrimary)}</a>
            <a href="${esc(heroSecondaryHref)}" class="btn btn-outline">${esc(theme.hero.ctaSecondary)}</a>
          </div>
        </div>
      </div>
      <a href="#section-02" class="scroll-hint anim-fade-up anim-delay-3" aria-label="Cuộn xuống">
        <span class="scroll-hint__mouse" aria-hidden="true"><span class="scroll-hint__wheel"></span></span>
        <span class="scroll-hint__label">CUỘN XUỐNG</span>
      </a>
    </section>

    <section id="section-02" class="fp-section about" data-section="02" data-theme="light" aria-label="Giới thiệu">
      <div class="about-decor" aria-hidden="true">
        <span class="about-decor__dots"></span>
        <span class="about-decor__circuit"></span>
      </div>
      <div class="about-inner">
        <div class="about-copy">
          <p class="about-label">${esc(theme.about.label)}</p>
          <h2 class="about-title" aria-label="${esc((theme.about.titleLines || []).join(''))}">
            ${aboutTitleLines}
          </h2>
          <p class="about-desc">${esc(theme.about.desc)}</p>
          ${aboutHighlight}
          ${aboutFeatures}
          ${aboutCta}
        </div>
        <div class="about-media">
          <img src="${esc(theme.about.image)}" alt="${esc(theme.about.imageAlt)}" class="about-media__img" loading="lazy" decoding="async" />
        </div>
      </div>
    </section>

    <section id="section-03" class="fp-section products" data-section="03" data-theme="light" aria-label="Sản phẩm">
      ${sectionBg(theme.products.bg, true)}
      <div class="products-inner">
        <header class="products-head">
          <h2 class="products-title"><span class="products-title__a">SẢN</span> <span class="products-title__b">PHẨM</span></h2>
          <span class="products-ornament" aria-hidden="true"></span>
          ${productCatsHtml ? `<div class="products-cats" role="tablist" aria-label="Danh mục sản phẩm">${productCatsHtml}</div>` : ''}
        </header>
        <ul class="products-grid" id="products-grid">${products}</ul>
        <div class="products-foot">
          <nav class="products-pagination" aria-label="Phân trang sản phẩm"></nav>
          <a href="${esc(theme.products.catalogHref || 'san-pham/')}" class="products-all">XEM TẤT CẢ <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>

    <section id="section-04" class="fp-section services" data-section="04" data-theme="light" aria-label="Dịch vụ">
      ${sectionBg(theme.services.bg, true)}
      <div class="services-inner">
        <header class="services-head">
          <span class="services-sun" aria-hidden="true">${ICONS.sunMark}</span>
          <h2 class="services-title">
            <span class="services-title__a">${svcTitleA}</span><span class="services-title__b">${svcTitleB}</span>
          </h2>
          <span class="services-rule" aria-hidden="true"></span>
          ${svcDesc ? `<p class="services-desc">${svcDesc}</p>` : ''}
        </header>

        <div class="services-slider" data-services-slider>
          <button type="button" class="services-nav-btn services-nav-btn--prev" data-svc-prev aria-label="Trước">←</button>
          <div class="services-slider__viewport">
            <ul class="services-slider__track">${services}</ul>
          </div>
          <button type="button" class="services-nav-btn services-nav-btn--next" data-svc-next aria-label="Sau">→</button>
        </div>

        <div class="services-foot">
          <div class="services-dots" data-svc-dots></div>
          <a href="${esc(theme.services.catalogHref || 'dich-vu/')}" class="services-all">XEM TẤT CẢ DỊCH VỤ <span aria-hidden="true">→</span></a>
        </div>
      </div>
      <a href="#section-05" class="scroll-hint scroll-hint--dark scroll-hint--left" aria-label="Cuộn xuống">
        <span class="scroll-hint__mouse" aria-hidden="true"><span class="scroll-hint__wheel"></span></span>
        <span class="scroll-hint__label">CUỘN XUỐNG</span>
      </a>
    </section>

    <section id="section-05" class="fp-section projects" data-section="05" data-theme="light" aria-label="Dự án tiêu biểu">
      ${sectionBg(theme.projects.bg, true)}
      <div class="projects-inner">
        <header class="projects-head">
          <h2 class="projects-title">
            <span class="projects-title__a">${pjTitleA}</span><span class="projects-title__b">${pjTitleB}</span>
          </h2>
          ${pjDesc ? `<p class="projects-desc">${pjDesc}</p>` : ''}
        </header>

        <div class="projects-slider" data-projects-slider>
          <button type="button" class="projects-nav-btn projects-nav-btn--prev" data-pj-prev aria-label="Trước">←</button>
          <div class="projects-slider__viewport">
            <ul class="projects-slider__track">${projects}</ul>
          </div>
          <button type="button" class="projects-nav-btn projects-nav-btn--next" data-pj-next aria-label="Sau">→</button>
        </div>

        <div class="projects-foot">
          <div class="projects-dots" data-pj-dots></div>
          <a href="${esc(theme.projects.catalogHref || 'du-an/')}" class="projects-all">XEM TẤT CẢ DỰ ÁN <span aria-hidden="true">→</span></a>
        </div>
      </div>
      <a href="#section-06" class="scroll-hint scroll-hint--dark scroll-hint--left" aria-label="Cuộn xuống">
        <span class="scroll-hint__mouse" aria-hidden="true"><span class="scroll-hint__wheel"></span></span>
        <span class="scroll-hint__label">CUỘN XUỐNG</span>
      </a>
    </section>

    <section id="section-06" class="fp-section testimonials" data-section="06" data-theme="light" aria-label="Khách hàng nói gì">
      ${sectionBg(tm.bg || theme.projects?.bg, true)}
      <div class="tm-inner">
        <header class="tm-head">
          <h2 class="tm-title">
            <span>${esc(tm.titleBefore || 'KHÁCH HÀNG ')}</span><span class="tm-title__accent">${esc(tm.titleAccent || 'NÓI GÌ')}</span><span>${esc(tm.titleAfter || ' VỀ CHÚNG TÔI')}</span>
          </h2>
          <div class="tm-rule" aria-hidden="true"><span></span></div>
        </header>
        <div class="tm-slider" data-tm-slider>
          <button type="button" class="tm-nav-btn tm-nav-btn--prev" data-tm-prev aria-label="Trước">‹</button>
          <div class="tm-slider__viewport">
            <ul class="tm-slider__track">${tmItems}</ul>
          </div>
          <button type="button" class="tm-nav-btn tm-nav-btn--next" data-tm-next aria-label="Sau">›</button>
        </div>
        <div class="tm-dots" data-tm-dots></div>
      </div>
      <a href="#section-07" class="scroll-hint scroll-hint--dark scroll-hint--left" aria-label="Cuộn xuống">
        <span class="scroll-hint__mouse" aria-hidden="true"><span class="scroll-hint__wheel"></span></span>
        <span class="scroll-hint__label">CUỘN XUỐNG</span>
      </a>
    </section>

    <section id="section-07" class="fp-section news" data-section="07" data-theme="light" aria-label="Tin tức">
      ${sectionBg(theme.news.bg, true)}
      <div class="news-inner">
        <header class="news-head">
          <h2 class="news-title">
            <span class="news-title__a">${newsTitleA}</span><span class="news-title__b">${newsTitleB}</span>
          </h2>
          ${newsDesc ? `<p class="news-desc">${newsDesc}</p>` : ''}
        </header>
        <div class="news-layout">
          <div class="news-layout__featured">${newsFeaturedHtml}</div>
          <div class="news-layout__list">${newsSideHtml}</div>
        </div>
        <div class="news-foot">
          <a href="${esc(theme.news.catalogHref || 'tin-tuc/')}" class="news-all">XEM TẤT CẢ TIN TỨC <span aria-hidden="true">→</span></a>
        </div>
      </div>
      <a href="#section-08" class="scroll-hint scroll-hint--dark scroll-hint--left" aria-label="Cuộn xuống">
        <span class="scroll-hint__mouse" aria-hidden="true"><span class="scroll-hint__wheel"></span></span>
        <span class="scroll-hint__label">CUỘN XUỐNG</span>
      </a>
    </section>

    <section id="section-08" class="fp-section contact" data-section="08" data-theme="light" aria-label="Liên hệ">
      <div class="contact-inner">
        <div class="contact-copy">
          <p class="contact-label">${esc(theme.contact.label)}</p>
          <h2 class="contact-title">${titleLinesHtml(theme.contact.title, -1)}</h2>
          <p class="contact-desc">${esc(theme.contact.desc)}</p>

          <dl class="contact-lines">
            <div class="contact-line">
              <dt>Hotline</dt>
              <dd><a href="tel:${esc(c.phoneTel)}">${esc(c.phone)}</a></dd>
            </div>
            <div class="contact-line">
              <dt>Email</dt>
              <dd><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></dd>
            </div>
            <div class="contact-line">
              <dt>Địa chỉ</dt>
              <dd>${esc(c.address)}</dd>
            </div>
            <div class="contact-line">
              <dt>Giờ làm việc</dt>
              <dd>${esc(c.hours || 'Thứ 2 – Thứ 7: 8:00 – 17:30')}</dd>
            </div>
          </dl>

          <div class="contact-actions">
            <a class="contact-actions__primary" href="tel:${esc(c.phoneTel)}">Gọi ${esc(c.phone)}</a>
            <a class="contact-actions__ghost" href="${esc(c.zalo)}" target="_blank" rel="noopener noreferrer">Chat Zalo</a>
          </div>
        </div>

        <div class="contact-panel">
          <form class="contact-form" data-contact-form novalidate>
            <h3 class="contact-form__title">${esc((c.form && c.form.title) || 'Đăng ký nhận tư vấn')}</h3>
            <p class="contact-form__hint">Để lại thông tin, chúng tôi sẽ liên hệ trong ngày làm việc.</p>
            <div class="contact-form__fields">
              <div class="contact-form__field">
                <label for="contact-name">Họ và tên <span>*</span></label>
                <input id="contact-name" name="name" type="text" required autocomplete="name" placeholder="Nguyễn Văn A" />
                <p class="contact-form__error" data-error-for="name"></p>
              </div>
              <div class="contact-form__field">
                <label for="contact-phone">Số điện thoại <span>*</span></label>
                <input id="contact-phone" name="phone" type="tel" required autocomplete="tel" placeholder="09xx xxx xxx" />
                <p class="contact-form__error" data-error-for="phone"></p>
              </div>
              <div class="contact-form__field">
                <label for="contact-email">Email</label>
                <input id="contact-email" name="email" type="email" autocomplete="email" placeholder="email@domain.com" />
                <p class="contact-form__error" data-error-for="email"></p>
              </div>
              <div class="contact-form__field">
                <label for="contact-address">Địa chỉ công trình</label>
                <input id="contact-address" name="address" type="text" autocomplete="street-address" placeholder="Quận / Tỉnh thành" />
              </div>
              <div class="contact-form__field contact-form__field--half">
                <label for="contact-project-type">Loại công trình</label>
                <select id="contact-project-type" name="projectType">
                  <option value="">Chọn…</option>
                  ${((c.form && c.form.projectTypes) || []).map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}
                </select>
              </div>
              <div class="contact-form__field contact-form__field--half">
                <label for="contact-need">Nhu cầu</label>
                <select id="contact-need" name="need">
                  <option value="">Chọn…</option>
                  ${((c.form && c.form.needs) || []).map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}
                </select>
              </div>
              <div class="contact-form__field contact-form__field--full">
                <label for="contact-message">Nội dung</label>
                <textarea id="contact-message" name="message" rows="3" placeholder="Mô tả ngắn nhu cầu của bạn"></textarea>
              </div>
              <div class="contact-form__field contact-form__field--full contact-form__consent">
                <label>
                  <input type="checkbox" name="consent" required />
                  <span>${esc((c.form && c.form.consent) || 'Tôi đồng ý để Hợp Nhất Energy liên hệ tư vấn.')}</span>
                </label>
                <p class="contact-form__error" data-error-for="consent"></p>
              </div>
            </div>
            <button type="submit" class="contact-form__submit">${esc((c.form && c.form.submit) || 'Gửi yêu cầu tư vấn')}</button>
          </form>
          <div class="contact-success" data-contact-success hidden>
            <h3 class="contact-success__title">${esc((c.form && c.form.successTitle) || 'Cảm ơn Quý khách.')}</h3>
            <p class="contact-success__desc">${esc((c.form && c.form.successDesc) || 'Hợp Nhất Energy sẽ liên hệ trong thời gian sớm nhất.')}</p>
          </div>
        </div>
      </div>
    </section>

    <footer id="section-09" class="fp-section site-footer" data-section="09" aria-label="Footer">
      <div class="footer-bg" aria-hidden="true">
        <div class="footer-bg__gradient"></div>
        <div class="footer-bg__noise"></div>
      </div>
      <div class="site-footer__inner">
        <div class="site-footer__grid">
          <div class="footer-col footer-col--brand">
            <a href="../" class="footer-brand" aria-label="Hợp Nhất Energy">
              <span class="footer-brand__mark" aria-hidden="true">${brandIcon.replace('width="34"', 'width="28"').replace('height="34"', 'height="28"')}</span>
              <span class="footer-brand__text">
                <span class="footer-brand__main">${esc(theme.brand.name)}</span>
                <span class="footer-brand__sub">${esc(theme.brand.sub)}</span>
              </span>
            </a>
            <p class="footer-about">${esc(theme.footer.about)}</p>
            ${footerSocialHtml(c)}
          </div>
          <div class="footer-col">
            <h3 class="footer-col__title">${esc(footerMidTitle)}</h3>
            <ul class="footer-links">
              ${footerMidLinks}
            </ul>
          </div>
          <div class="footer-col">
            <h3 class="footer-col__title">Sản phẩm</h3>
            <ul class="footer-links">${footerProducts}</ul>
          </div>
          <div class="footer-col">
            <h3 class="footer-col__title">Liên hệ</h3>
            <ul class="footer-contact">
              <li><span class="footer-contact__icon" aria-hidden="true">${ICONS.pin.replace('width="14"', 'width="20"').replace('height="14"', 'height="20"')}</span><span>${esc(c.address)}</span></li>
              <li><span class="footer-contact__icon" aria-hidden="true">${ICONS.phone.replace('width="22"', 'width="20"').replace('height="22"', 'height="20"')}</span><a href="tel:${esc(c.phoneTel)}">${esc(c.phone)}</a></li>
              <li><span class="footer-contact__icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></svg></span><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>
              <li><span class="footer-contact__icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.8 3.8 6 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-6-3.8-9s1.3-6.2 3.8-9z"/></svg></span><a href="../">${esc(c.website)}</a></li>
            </ul>
          </div>
        </div>
        <div class="site-footer__bottom">
          <p class="footer-copy">© 2026 Hợp Nhất Energy. All Rights Reserved.</p>
          <p class="footer-credit">Thiết kế &amp; Phát triển bởi <span>Bứt Phá Marketing</span></p>
        </div>
      </div>
    </footer>
  </main>`;
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme.id);
    root.style.setProperty('--primary', theme.colors.primary);
    root.style.setProperty('--primary-hover', theme.colors.primaryHover);
    root.style.setProperty('--secondary', theme.colors.secondary);
    root.style.setProperty('--accent', theme.colors.accent);
    root.style.setProperty('--dark', theme.colors.secondary);

    if (theme.id === 'led') {
      root.style.setProperty('--bg-tint', '#f5f8fc');
      root.style.setProperty('--bg-tint-mid', '#f0f5fb');
      root.style.setProperty('--primary-rgb', '11, 61, 145');
      root.style.setProperty('--flare', 'rgba(34, 211, 238, 0.16)');
    } else {
      root.style.setProperty('--bg-tint', '#fffaf5');
      root.style.setProperty('--bg-tint-mid', '#fffaf6');
      root.style.setProperty('--primary-rgb', '249, 115, 22');
      root.style.setProperty('--flare', 'rgba(249, 115, 22, 0.18)');
    }

    document.title = theme.meta.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', theme.meta.description);
  }

  function mount(themeId) {
    const theme = window.SiteThemes?.[themeId];
    if (!theme) {
      console.error(`[SolarMN] Theme "${themeId}" not found`);
      return null;
    }
    applyTheme(theme);
    const app = document.getElementById('app');
    if (!app) return null;
    app.innerHTML = render(theme);
    window.SolarMNTheme = theme;
    return theme;
  }

  return { mount, render, applyTheme };
})();
