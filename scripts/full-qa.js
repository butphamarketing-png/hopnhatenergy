/**
 * Full-site QA: overflow, one-screen fit, a11y basics, links, focus targets
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const URL = process.env.AUDIT_URL || 'http://127.0.0.1:5500/solar/';
const WIDTHS = [320,360,375,390,393,412,414,430,480,540,576,600,640,720,768,800,820,834,912,1024,1080,1200,1280,1366,1400,1440,1536,1600,1680,1728,1920,2048,2560,3440,3840];
const HEIGHTS = {
  short: 720,
  normal: 900,
  tall: 1080,
};

async function activateAllStates(page, id) {
  await page.evaluate((sid) => {
    document.querySelectorAll('.fp-section').forEach((s) => {
      s.classList.remove('is-active');
      s.style.cssText = '';
    });
    const el = document.getElementById(sid);
    if (!el) return;
    el.classList.add(
      'is-active', 'is-bg-in', 'is-glass-in', 'is-panel-in', 'is-fields-in', 'is-btn-in',
      'is-copy-in', 'is-slider-in', 'is-head-label', 'is-head-title', 'is-head-desc', 'is-cta-in',
      'is-media-in', 'is-label-in', 'is-title-in', 'is-desc-in', 'is-actions-in', 'is-info-in', 'is-aside-in'
    );
    el.querySelectorAll('.product-card,.project-card,.news-card,.svc-slide .svc-card').forEach((c) => c.classList.add('is-in'));
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('visibility', 'visible', 'important');
    el.style.setProperty('pointer-events', 'auto', 'important');
    el.style.setProperty('transform', 'none', 'important');
  }, id);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const report = { widths: [], a11y: [], links: [], summary: {} };

  // Base load + a11y/link audit once at 1440
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(600);

  const a11y = await page.evaluate(() => {
    const issues = [];
    // Images without alt
    document.querySelectorAll('img').forEach((img) => {
      if (!img.hasAttribute('alt')) issues.push({ type: 'img-missing-alt', src: (img.getAttribute('src') || '').slice(0, 80) });
    });
    // Buttons without accessible name
    document.querySelectorAll('button').forEach((btn) => {
      const name = (btn.getAttribute('aria-label') || btn.textContent || '').trim();
      if (!name) issues.push({ type: 'button-no-name', cls: (btn.className || '').toString().slice(0, 60) });
    });
    // Links without href or #
    document.querySelectorAll('a').forEach((a) => {
      const href = a.getAttribute('href');
      if (href == null || href === '' || href === '#') {
        issues.push({ type: 'dead-or-empty-link', text: (a.textContent || '').trim().slice(0, 40), cls: (a.className || '').toString().slice(0, 40) });
      }
    });
    // Interactive without cursor/keyboard - check tabindex on clickable cards
    document.querySelectorAll('[onclick]').forEach((el) => {
      if (!el.matches('a,button,input,select,textarea') && el.getAttribute('tabindex') == null) {
        issues.push({ type: 'onclick-not-keyboard', cls: (el.className || '').toString().slice(0, 40) });
      }
    });
    // Form labels
    document.querySelectorAll('input,select,textarea').forEach((el) => {
      const id = el.id;
      if (!id) return;
      const label = document.querySelector(`label[for="${id}"]`);
      const wrapped = el.closest('label');
      if (!label && !wrapped && el.type !== 'hidden') {
        issues.push({ type: 'input-no-label', id });
      }
    });
    // Focusable with outline none and no focus-visible alternative - count only
    let outlineNone = 0;
    document.querySelectorAll('a,button,input,select,textarea').forEach((el) => {
      const o = getComputedStyle(el).outlineStyle;
      if (o === 'none') outlineNone += 1;
    });
    if (outlineNone > 0) issues.push({ type: 'outline-none-count', count: outlineNone });
    return issues;
  });
  report.a11y = a11y;

  // Sample widths for overflow + fit
  const sample = WIDTHS.filter((w, i) => i % 2 === 0 || [320,375,768,1024,1366,1440,1920,2560,3840].includes(w));
  for (const width of sample) {
    const height = width <= 767 ? 740 : (width >= 1920 ? 1080 : 900);
    await page.setViewportSize({ width, height });
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(350);

    const issues = [];
    const doc = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    if (doc.sw > doc.cw + 1) issues.push({ type: 'page-overflow-x', delta: doc.sw - doc.cw });

    if (width >= 1200) {
      for (const id of ['section-02','section-03','section-04','section-05','section-06','section-07']) {
        await activateAllStates(page, id);
        const fit = await page.evaluate((sid) => {
          const el = document.getElementById(sid);
          const inner = el && el.querySelector('.about-inner,.products-inner,.projects-inner,.services-inner,.news-inner,.contact-inner');
          if (!inner) return { ok: true, need: 0 };
          const need = inner.scrollHeight - inner.clientHeight;
          return { ok: need <= 28, need: Math.round(need) };
        }, id);
        if (!fit.ok) issues.push({ type: 'one-screen-fit', section: id, need: fit.need });
      }
    }

    // Equal card heights in products grid
    if (width >= 1100) {
      await activateAllStates(page, 'section-03');
      const cards = await page.evaluate(() => {
        const nodes = [...document.querySelectorAll('#section-03 .product-card')];
        const hs = nodes.map((n) => Math.round(n.getBoundingClientRect().height));
        const min = Math.min(...hs);
        const max = Math.max(...hs);
        return { min, max, delta: max - min, count: hs.length };
      });
      if (cards.count >= 2 && cards.delta > 24) {
        issues.push({ type: 'uneven-product-cards', ...cards });
      }
    }

    report.widths.push({ width, height, ok: issues.length === 0, issues });
    if (issues.length) console.log(width, JSON.stringify(issues));
    else process.stdout.write('.');
  }

  // Zoom checks at 1366
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  for (const zoom of [0.8, 0.9, 1, 1.1, 1.25]) {
    await page.evaluate((z) => { document.body.style.zoom = String(z); }, zoom);
    await page.waitForTimeout(200);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (sw > 2) {
      report.widths.push({ width: 1366, zoom, ok: false, issues: [{ type: 'zoom-overflow-x', delta: sw }] });
      console.log('\nzoom', zoom, 'overflow', sw);
    }
  }
  await page.evaluate(() => { document.body.style.zoom = ''; });

  // Landscape phone
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  const land = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (land > 2) report.widths.push({ width: 844, height: 390, ok: false, issues: [{ type: 'landscape-overflow', delta: land }] });

  const badA11y = a11y.filter((i) => i.type !== 'outline-none-count');
  const badWidths = report.widths.filter((w) => !w.ok);
  report.summary = {
    widthSamples: report.widths.length,
    widthFails: badWidths.length,
    a11yIssues: badA11y.length,
    outlineNoneNote: a11y.find((i) => i.type === 'outline-none-count') || null,
  };

  fs.writeFileSync(path.join(__dirname, 'full-qa-report.json'), JSON.stringify(report, null, 2));
  console.log('\nSUMMARY', report.summary);
  console.log('A11Y', JSON.stringify(badA11y.slice(0, 30), null, 2));
  await browser.close();
  process.exit(badWidths.length || badA11y.length ? 1 : 0);
})();
