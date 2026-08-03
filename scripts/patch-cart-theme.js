const fs = require('fs');
const p = 'c:/Users/Admin/Downloads/Solar/js/cart.js';
let t = fs.readFileSync(p, 'utf8');

const oldBase = `  function solarBase() {
    const forced = document.documentElement.getAttribute('data-solar-base');
    if (forced != null) return forced;
    const path = location.pathname.replace(/\\\\/g, '/');
    const marker = '/solar/';
    const idx = path.indexOf(marker);
    if (idx === -1) {
      if (/\\\\/solar\\\\/?$/.test(path) || /\\\\/solar\\\\/index\\\\.html$/i.test(path)) return '';
      return '';
    }
    const after = path.slice(idx + marker.length);
    const parts = after.split('/').filter(Boolean);
    if (parts.length && /\\\\.html?$/i.test(parts[parts.length - 1])) parts.pop();
    return parts.length ? '../'.repeat(parts.length) : '';
  }`;

// Read actual file content for solarBase - use simpler replace
const start = t.indexOf('  function solarBase() {');
const end = t.indexOf('  function href(path)', start);
if (start < 0 || end < 0) {
  console.error('solarBase not found', start, end);
  process.exit(1);
}

const neu = `  function siteRootMarker() {
    const path = location.pathname.replace(/\\\\/g, '/');
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
    const path = location.pathname.replace(/\\\\/g, '/');
    const marker = siteRootMarker();
    const idx = path.indexOf(marker);
    if (idx === -1) {
      const root = marker.replace(/\\\\/$/, '');
      if (path.endsWith(root) || path.endsWith(root + '/') || path.includes(root + '/index.html')) return '';
      return '';
    }
    const after = path.slice(idx + marker.length);
    const parts = after.split('/').filter(Boolean);
    if (parts.length && /\\\\.html?$/i.test(parts[parts.length - 1])) parts.pop();
    return parts.length ? '../'.repeat(parts.length) : '';
  }

`;

t = t.slice(0, start) + neu + t.slice(end);
t = t.replace(/localStorage\.getItem\(STORAGE_KEY\)/g, 'localStorage.getItem(storageKey())');
t = t.replace(/localStorage\.setItem\(STORAGE_KEY,/g, 'localStorage.setItem(storageKey(),');
t = t.replace(/localStorage\.getItem\(QUOTE_KEY\)/g, 'localStorage.getItem(quoteStorageKey())');
t = t.replace(/localStorage\.setItem\(QUOTE_KEY,/g, 'localStorage.setItem(quoteStorageKey(),');

fs.writeFileSync(p, t);
console.log('cart patched');
