/**
 * Generate project detail pages for all theme items.
 */
const fs = require('fs');
const path = require('path');

function loadTheme(file) {
  const code = fs.readFileSync(file, 'utf8');
  const window = { SiteThemes: {} };
  // eslint-disable-next-line no-new-func
  new Function('window', code)(window);
  const key = Object.keys(window.SiteThemes)[0];
  return window.SiteThemes[key];
}

function detailHtml(themeId) {
  const themeScript = themeId === 'led' ? 'led.js' : 'solar.js';
  const ledCss = themeId === 'led' ? '\n  <link rel="stylesheet" href="../../../css/led.css" />' : '';
  return `<!DOCTYPE html>
<html lang="vi" data-theme="${themeId}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Chi tiết dự án — Solar Miền Nam." />
  <title>Dự án | Solar Miền Nam</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <script src="../../../js/themes/${themeScript}"></script>
  <link rel="stylesheet" href="../../../css/tokens.css" />
  <link rel="stylesheet" href="../../../css/project-pages.css" />${ledCss}
</head>
<body>
  <header class="pj-top">
    <a href="../../">← Trang chủ</a>
    <a href="../">Tất cả dự án</a>
  </header>
  <article id="pj-detail" class="pj-article"></article>
  <script src="../../../js/project-pages.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function () {
      window.SolarProjectPages && window.SolarProjectPages.mountDetail();
    });
  </script>
</body>
</html>
`;
}

function generate(themeId, rootDir) {
  const file = themeId === 'led' ? 'led.js' : 'solar.js';
  const theme = loadTheme(path.join('js', 'themes', file));
  const items = (theme.projects && theme.projects.items) || [];
  const base = path.join(rootDir, 'du-an');
  let n = 0;
  items.forEach((item) => {
    if (!item.slug) return;
    const dir = path.join(base, item.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), detailHtml(themeId), 'utf8');
    n += 1;
  });
  console.log(`${themeId}: wrote ${n} project pages under ${base}`);
}

generate('solar', 'solar');
generate('led', 'den-led');
