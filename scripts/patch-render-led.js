const fs = require('fs');
const p = 'c:/Users/Admin/Downloads/Solar/js/render-page.js';
let t = fs.readFileSync(p, 'utf8');

// Normalize for matching
if (!t.includes("const projectMetaIcon = theme.id === 'led'")) {
  console.error('anchor missing');
  process.exit(1);
}

if (!t.includes('const hasPages =')) {
  t = t.replace(
    "const projectMetaIcon = theme.id === 'led' ? ICONS.lamp : ICONS.bolt;",
    "const projectMetaIcon = theme.id === 'led' ? ICONS.lamp : ICONS.bolt;\n    const hasPages = theme.id === 'solar' || theme.id === 'led';\n    const firstProjectSlug = (theme.projects.items[0] && theme.projects.items[0].slug) || '';"
  );
}

// Simple global-ish replacements for page links
const pairs = [
  ["theme.id === 'solar' ? `san-pham/${esc(slug)}/` : '#section-03'", "hasPages ? `san-pham/${esc(slug)}/` : '#section-03'"],
  ["const cartRow = theme.id === 'solar' ?", "const cartRow = hasPages ?"],
  ["theme.id === 'solar' ? `du-an/${esc(slug)}/` : '#section-04'", "hasPages ? `du-an/${esc(slug)}/` : '#section-04'"],
  ["theme.id === 'solar' ? `dich-vu/${esc(slug)}/` : '#section-05'", "hasPages ? `dich-vu/${esc(slug)}/` : '#section-05'"],
  ["theme.id === 'solar' ? `tin-tuc/${esc(slug)}/` : '#section-06'", "hasPages ? `tin-tuc/${esc(slug)}/` : '#section-06'"],
  ["${theme.id === 'solar' ? `", "${hasPages ? `"],
  ['href="du-an/nha-xuong-long-an/"', 'href="du-an/${esc(firstProjectSlug)}/"'],
];
for (const [a, b] of pairs) {
  const n = t.split(a).length - 1;
  console.log(n, a.slice(0, 55));
  t = t.split(a).join(b);
}

// Footer products: replace LED branch to support object links + shared chrome
t = t.replace(
  /: theme\.footer\.productLinks\.map\(\(l\) =>\s*`<li><a href="#section-03">\$\{esc\(l\)\}<\/a><\/li>`\s*\)\.join\(''\);/,
  `: (() => {
          const links = theme.footer.productLinks || [];
          const extras = links.slice(0, 4).map((l) => {
            if (typeof l === 'object' && l.href) return \`<li><a href="\${esc(l.href)}">\${esc(l.label)}</a></li>\`;
            return \`<li><a href="#section-03">\${esc(l)}</a></li>\`;
          }).join('');
          return \`<li><a href="danh-muc-san-pham/">Danh mục sản phẩm</a></li>
         <li><a href="gio-hang/">Giỏ hàng</a></li>
         \${extras}
         <li><a href="#section-03">Xem tất cả sản phẩm</a></li>\`;
        })();`
);

// Footer mid links for object form
t = t.replace(
  /\? theme\.footer\.serviceLinks\.map\(\(l\) => `<li><a href="#section-05">\$\{esc\(l\)\}<\/a><\/li>`\)\.join\(''\)/,
  `? linksObj(theme.footer.serviceLinks)`
);

// Inject helper near esc? Or inline differently.
// Simpler: replace the whole footerMidLinks ternary LED branch
t = t.replace(
  `: (theme.footer.serviceLinks?.length
        ? theme.footer.serviceLinks.map((l) => \`<li><a href="#section-05">\${esc(l)}</a></li>\`).join('')
        : nav.map(([id, label]) => \`<li><a href="#section-\${id}">\${label}</a></li>\`).join(''));`,
  `: (theme.footer.serviceLinks?.length
        ? theme.footer.serviceLinks.map((l) => {
            if (typeof l === 'object' && l.href) return \`<li><a href="\${esc(l.href)}">\${esc(l.label)}</a></li>\`;
            return \`<li><a href="#section-05">\${esc(l)}</a></li>\`;
          }).join('')
        : nav.map(([id, label]) => \`<li><a href="#section-\${id}">\${label}</a></li>\`).join(''));`
);

fs.writeFileSync(p, t);
console.log('done hasPages', (t.match(/hasPages/g) || []).length);
