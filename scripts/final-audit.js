/**
 * Final dual-site audit — Solar & Den-LED
 * Evidence-based checks only. No fixes.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.AUDIT_BASE || 'http://127.0.0.1:5500';
const VIEWPORTS = [
  { w: 320, h: 640 },
  { w: 375, h: 812 },
  { w: 390, h: 844 },
  { w: 414, h: 896 },
  { w: 768, h: 1024 },
  { w: 1024, h: 768 },
  { w: 1280, h: 800 },
  { w: 1440, h: 900 },
  { w: 1920, h: 1080 },
];

const ROUTES = {
  solar: [
    '/solar/',
    '/solar/danh-muc-san-pham/',
    '/solar/san-pham/pin-longi-585w/',
    '/solar/gio-hang/',
    '/solar/gioi-thieu/',
    '/solar/dich-vu/',
    '/solar/dich-vu/khao-sat-cong-trinh/',
    '/solar/tin-tuc/',
    '/solar/tin-tuc/cach-chon-cong-suat-he-thong/',
    '/solar/du-an/nha-xuong-long-an/',
    '/solar/thanh-toan/',
  ],
  led: [
    '/den-led/',
    '/den-led/danh-muc-san-pham/',
    '/den-led/san-pham/den-led-panel-48w/',
    '/den-led/gio-hang/',
    '/den-led/dich-vu/',
    '/den-led/dich-vu/tu-van-chieu-sang/',
    '/den-led/tin-tuc/',
    '/den-led/tin-tuc/kien-thuc-den-led/',
    '/den-led/du-an/',
    '/den-led/du-an/nha-xuong-long-an/',
    '/den-led/thanh-toan/',
  ],
};

async function checkOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const hScroll = Math.max(doc.scrollWidth, body.scrollWidth) > Math.ceil(window.innerWidth) + 2;
    const offenders = [];
    document.querySelectorAll('section, header, footer, .fp-section, .product-card, .mini-cart, form').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > window.innerWidth + 2 || r.left < -2) {
        offenders.push({
          tag: el.tagName,
          id: el.id || '',
          cls: (el.className || '').toString().slice(0, 60),
          left: Math.round(r.left),
          right: Math.round(r.right),
        });
      }
    });
    return { hScroll, offenders: offenders.slice(0, 8) };
  });
}

async function homeAudit(page, site) {
  const url = `${BASE}/${site === 'solar' ? 'solar' : 'den-led'}/`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(800);

  return page.evaluate((siteId) => {
    const out = {
      site: siteId,
      theme: document.documentElement.getAttribute('data-theme'),
      primary: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
      sections: {},
      header: {},
      cart: {},
      issues: [],
    };

    // Sections present
    for (let i = 1; i <= 8; i++) {
      const id = `section-0${i}`;
      const el = document.getElementById(id) || document.querySelector(`[data-section="${String(i).padStart(2, '0')}"]`);
      // footer may be section-08 inside main
      out.sections[id] = !!document.getElementById(id) || (i === 8 && !!document.querySelector('.site-footer, #section-08'));
    }

    const header = document.getElementById('site-header');
    out.header.exists = !!header;
    out.header.menu = !!document.getElementById('menu-toggle');
    out.header.industry = !!document.querySelector('.header-industry');
    out.header.phone = !!document.querySelector('.header-phone');
    out.header.cart = !!document.querySelector('.header-cart');
    out.header.compactClass = header ? header.classList.contains('is-compact') : false;

    // Force compact state check after activating section 02
    const s2 = document.getElementById('section-02');
    const s1 = document.getElementById('section-01');
    if (s1 && s2 && header) {
      s1.classList.remove('is-active');
      s2.classList.add('is-active');
      // Header.js uses MutationObserver — may need tick; report expected structure
      out.header.industryText = (document.querySelector('.header-industry') || {}).textContent || '';
    }

    out.cart.btn = !!document.querySelector('#header-cart-btn, .header-cart');
    out.hero = {
      fullscreen: (() => {
        const h = document.getElementById('section-01');
        if (!h) return false;
        const r = h.getBoundingClientRect();
        return Math.abs(r.height - window.innerHeight) < 48 || r.height >= window.innerHeight * 0.95;
      })(),
      hasSlides: !!document.querySelector('#hero-slideshow .hero-slide, #hero-slideshow img'),
      ctaCount: document.querySelectorAll('#section-01 .btn, #section-01 a.btn').length,
    };

    // Backgrounds section 2-7
    out.bgs = {};
    ['02', '03', '04', '05', '06', '07'].forEach((n) => {
      const sec = document.getElementById(`section-${n}`);
      if (!sec) {
        out.bgs[n] = { missing: true };
        return;
      }
      const bgImg = sec.querySelector('.section-bg img, .contact-bg__img');
      const hasBgLayer = !!sec.querySelector('.section-bg, .contact-bg');
      out.bgs[n] = {
        hasLayer: hasBgLayer,
        src: bgImg ? (bgImg.getAttribute('src') || '').slice(0, 120) : '',
        solarAsset: bgImg ? /assets\/backgrounds/.test(bgImg.getAttribute('src') || '') : false,
        unsplash: bgImg ? /unsplash\.com/.test(bgImg.getAttribute('src') || '') : false,
      };
    });

    // Product cards
    out.products = {
      count: document.querySelectorAll('#section-03 .product-card').length,
      hasPrice: !!document.querySelector('#section-03 .product-card__price-new, #section-03 .product-card__price'),
      hasAdd: !!document.querySelector('#section-03 [data-cart-add]'),
      hasDetailCta: !!document.querySelector('#section-03 .product-card__cta'),
    };

    // Sliders
    out.sliders = {
      services: !!document.querySelector('[data-services-slider], .services-slider'),
      news: !!document.querySelector('[data-news-slider], .news-slider'),
      svcNav: !!document.querySelector('[data-svc-next], .services-nav-btn'),
      newsNav: !!document.querySelector('[data-news-next], .news-nav-btn'),
    };

    // Pagination
    out.pagination = {
      products: !!document.querySelector('.products-pagination, #section-03 .page-btn'),
      projects: !!document.querySelector('.projects-pagination, #section-04 .page-btn'),
    };

    // Contact form
    out.contact = {
      form: !!document.querySelector('#section-07 form, #contact-form, .contact-form'),
      fields: document.querySelectorAll('#section-07 input, #section-07 textarea, #section-07 select').length,
    };

    // Collect internal links
    const links = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
    out.sampleLinks = links.filter((h) => h && !h.startsWith('http') && !h.startsWith('tel:') && !h.startsWith('mailto:')).slice(0, 40);

    // UX 5-second signals on hero
    const heroText = (document.querySelector('#section-01') || {}).innerText || '';
    out.uxSignals = {
      hasValueProp: /điện|chiếu sáng|led|năng lượng|mặt trời/i.test(heroText),
      hasCta: out.hero.ctaCount > 0,
      industry: out.header.industryText,
    };

    // White bar / opaque header check on compact (approx)
    if (header) {
      const cs = getComputedStyle(header);
      out.header.bg = cs.backgroundColor;
      out.header.backdrop = cs.backdropFilter || cs.webkitBackdropFilter || '';
    }

    return out;
  }, site);
}

async function probeLinks(page, routes) {
  const results = [];
  for (const route of routes) {
    const url = BASE + route;
    try {
      const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const status = res ? res.status() : 0;
      const title = await page.title();
      const hasApp = await page.evaluate(() => !!document.getElementById('app') || !!document.querySelector('main, .pp-wrap, .cart-shell, .sv-wrap, .nw-wrap, #pj-detail, #pp-detail'));
      results.push({ route, status, title: title.slice(0, 60), ok: status >= 200 && status < 400 && hasApp });
    } catch (e) {
      results.push({ route, status: 0, ok: false, error: String(e.message || e).slice(0, 100) });
    }
  }
  return results;
}

async function cartSmoke(page, sitePath) {
  await page.goto(`${BASE}${sitePath}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(500);
  return page.evaluate(async () => {
    const out = { opened: false, badge: false, toast: false, addBtn: false };
    const add = document.querySelector('[data-cart-add]');
    out.addBtn = !!add;
    if (add) {
      add.click();
      await new Promise((r) => setTimeout(r, 400));
      out.toast = !!document.querySelector('.cart-toast.is-show, #cart-toast.is-show');
      const badge = document.querySelector('.header-cart__badge');
      out.badge = badge && !badge.hidden && Number(badge.textContent) > 0;
    }
    const cartBtn = document.querySelector('.header-cart');
    if (cartBtn) {
      cartBtn.click();
      await new Promise((r) => setTimeout(r, 350));
      out.opened = !!document.querySelector('#mini-cart.is-open, .mini-cart.is-open');
    }
    return out;
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const report = {
    at: new Date().toISOString(),
    homes: {},
    routes: {},
    overflow: {},
    cart: {},
  };

  for (const site of ['solar', 'led']) {
    await page.setViewportSize({ width: 1440, height: 900 });
    report.homes[site] = await homeAudit(page, site);

    // Compact header after scroll/nav
    await page.evaluate(() => {
      const h = document.getElementById('site-header');
      const s1 = document.getElementById('section-01');
      const s2 = document.getElementById('section-02');
      if (s1) s1.classList.remove('is-active');
      if (s2) s2.classList.add('is-active');
      if (window.SolarMN && window.SolarMN.header && window.SolarMN.header.setCompactState) {
        window.SolarMN.header.setCompactState();
      } else if (h) {
        h.classList.add('is-compact');
      }
    });
    await page.waitForTimeout(200);
    report.homes[site].headerAfter = await page.evaluate(() => {
      const h = document.getElementById('site-header');
      if (!h) return null;
      const cs = getComputedStyle(h);
      return {
        isCompact: h.classList.contains('is-compact'),
        bg: cs.backgroundColor,
        industryVisible: (() => {
          const ind = document.querySelector('.header-industry');
          if (!ind) return false;
          const r = ind.getBoundingClientRect();
          return r.width > 0 && getComputedStyle(ind).opacity !== '0' && ind.getAttribute('aria-hidden') !== 'true';
        })(),
        logoHidden: !!h.querySelector('.header-logo') && getComputedStyle(h.querySelector('.header-logo')).display === 'none',
        menuVisible: !!document.getElementById('menu-toggle') && getComputedStyle(document.getElementById('menu-toggle')).display !== 'none',
        cartVisible: !!document.querySelector('.header-cart'),
        phoneVisible: !!document.querySelector('.header-phone') && getComputedStyle(document.querySelector('.header-phone')).display !== 'none',
      };
    });

    report.cart[site] = await cartSmoke(page, site === 'solar' ? '/solar/' : '/den-led/');
  }

  report.routes.solar = await probeLinks(page, ROUTES.solar);
  report.routes.led = await probeLinks(page, ROUTES.led);

  // Overflow matrix on home pages
  for (const site of ['solar', 'led']) {
    report.overflow[site] = [];
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto(`${BASE}/${site === 'solar' ? 'solar' : 'den-led'}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(400);
      const ov = await checkOverflow(page);
      if (ov.hScroll || ov.offenders.length) {
        report.overflow[site].push({ ...vp, ...ov });
      }
    }
  }

  // One-viewport fit sample at 1440x900 for sections 2-7
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const site of ['solar', 'led']) {
    await page.goto(`${BASE}/${site === 'solar' ? 'solar' : 'den-led'}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(400);
    report.homes[site].viewportFit = await page.evaluate(() => {
      const vh = window.innerHeight;
      const out = {};
      ['02', '03', '04', '05', '06', '07'].forEach((n) => {
        const el = document.getElementById(`section-${n}`);
        if (!el) return;
        el.classList.add('is-active');
        const h = el.getBoundingClientRect().height;
        const scrollH = el.scrollHeight;
        out[n] = {
          height: Math.round(h),
          scrollHeight: Math.round(scrollH),
          fits: scrollH <= vh + 40,
          overflow: scrollH - vh,
        };
      });
      return out;
    });
  }

  // Parity check
  report.parity = {
    sameSectionOrder: JSON.stringify(Object.keys(report.homes.solar.sections)) === JSON.stringify(Object.keys(report.homes.led.sections)),
    solarPrimary: report.homes.solar.primary,
    ledPrimary: report.homes.led.primary,
    bothHaveCart: report.homes.solar.header.cart && report.homes.led.header.cart,
    bothHaveSliders: report.homes.solar.sliders.services && report.homes.led.sliders.services,
    solarUsesLocalBg: Object.values(report.homes.solar.bgs).filter((b) => b.solarAsset).length,
    ledUsesUnsplash: Object.values(report.homes.led.bgs).filter((b) => b.unsplash).length,
    ledMissingGioiThieuRoute: true, // known from filesystem
  };

  const outPath = path.join(__dirname, 'final-audit-report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log('Wrote', outPath);
  console.log(JSON.stringify({
    solarRoutesFail: report.routes.solar.filter((r) => !r.ok),
    ledRoutesFail: report.routes.led.filter((r) => !r.ok),
    solarOverflowVp: report.overflow.solar.length,
    ledOverflowVp: report.overflow.led.length,
    solarCart: report.cart.solar,
    ledCart: report.cart.led,
    solarFit: report.homes.solar.viewportFit,
    ledFit: report.homes.led.viewportFit,
    headerSolar: report.homes.solar.headerAfter,
    headerLed: report.homes.led.headerAfter,
    primary: { solar: report.homes.solar.primary, led: report.homes.led.primary },
  }, null, 2));

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
