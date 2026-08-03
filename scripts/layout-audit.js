/**
 * Layout QA — document overflow + one-screen fit (desktop)
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const URL = process.env.AUDIT_URL || 'http://127.0.0.1:5500/solar/';
const WIDTHS = [320, 360, 375, 390, 414, 480, 576, 640, 768, 820, 912, 1024, 1200, 1280, 1366, 1440, 1536, 1600, 1680, 1920, 2560];

async function activate(page, id) {
  await page.evaluate((sid) => {
    document.querySelectorAll('.fp-section').forEach((s) => {
      s.classList.remove('is-active');
      s.style.cssText = '';
    });
    const el = document.getElementById(sid);
    if (!el) return;
    el.classList.add(
      'is-active', 'is-bg-in', 'is-glass-in', 'is-panel-in', 'is-fields-in', 'is-btn-in',
      'is-copy-in', 'is-slider-in', 'is-head-label', 'is-head-title', 'is-head-desc', 'is-cta-in'
    );
    el.querySelectorAll('.product-card,.project-card,.news-card').forEach((c) => c.classList.add('is-in'));
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('visibility', 'visible', 'important');
    el.style.setProperty('pointer-events', 'auto', 'important');
    el.style.setProperty('transform', 'none', 'important');
  }, id);
  await page.waitForTimeout(120);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const report = [];

  for (const width of WIDTHS) {
    const height = width <= 767 ? 740 : 900;
    await page.setViewportSize({ width, height });
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(400);

    const doc = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));

    const issues = [];
    if (doc.sw > doc.cw + 1) {
      issues.push({ type: 'page-overflow-x', delta: doc.sw - doc.cw });
    }

    // Header overlap check
    const headerIssue = await page.evaluate(() => {
      const h = document.querySelector('.site-header');
      if (!h) return null;
      const industry = h.querySelector('.header-industry');
      const toggle = h.querySelector('.header-menu-toggle');
      const actions = h.querySelector('.header-actions');
      if (!industry || getComputedStyle(industry).display === 'none') return null;
      const ir = industry.getBoundingClientRect();
      const tr = toggle?.getBoundingClientRect();
      const ar = actions?.getBoundingClientRect();
      if (tr && ir.left < tr.right - 2 && ir.right > tr.left + 2 && Math.abs(ir.top - tr.top) < 40) return 'toggle';
      if (ar && ir.left < ar.right - 2 && ir.right > ar.left + 2 && Math.abs(ir.top - ar.top) < 40) return 'actions';
      return null;
    });
    if (headerIssue) issues.push({ type: 'header-overlap', with: headerIssue });

    if (width >= 1200) {
      for (const id of ['section-02', 'section-03', 'section-04', 'section-05', 'section-06', 'section-07']) {
        await activate(page, id);
        const fit = await page.evaluate((sid) => {
          const el = document.getElementById(sid);
          const inner = el.querySelector('.about-inner,.products-inner,.projects-inner,.services-inner,.news-inner,.contact-inner');
          if (!inner) return { ok: true };
          const need = inner.scrollHeight - inner.clientHeight;
          return { ok: need <= 24, need: Math.round(need) };
        }, id);
        if (!fit.ok) issues.push({ type: 'one-screen-fit', section: id, need: fit.need });
      }
    }

    report.push({ width, ok: issues.length === 0, issues });
    console.log(`${width}: ${issues.length === 0 ? 'OK' : JSON.stringify(issues)}`);
  }

  fs.writeFileSync(path.join(__dirname, 'layout-audit-report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  const bad = report.filter((r) => !r.ok);
  console.log(`Done. ${bad.length}/${report.length} widths with issues`);
  process.exit(bad.length ? 1 : 0);
})();
