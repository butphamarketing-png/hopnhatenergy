/**
 * Generate product detail pages for all theme items (avoids 404 on Live Server).
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
<html lang="vi" data-theme="${themeId}" data-solar-base="../../">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Chi tiết sản phẩm — Solar Miền Nam." />
  <title>Sản phẩm | Solar Miền Nam</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <script src="../../../js/themes/${themeScript}"></script>
  <link rel="stylesheet" href="../../../css/tokens.css" />
  <link rel="stylesheet" href="../../../css/products-pages.css" />
  <link rel="stylesheet" href="../../../css/cart.css" />${ledCss}
</head>
<body>
  <header class="pp-header">
    <a href="../../" class="pp-back">← Trang chủ</a>
    <p class="pp-brand">Solar <span>Miền Nam</span></p>
    <div class="pp-header__cart" data-cart-mount="light"></div>
  </header>

  <main class="pp-wrap">
    <p class="pp-label">Sản phẩm</p>
    <p style="margin:8px 0 0"><a class="pp-back" href="../">Danh mục sản phẩm</a></p>
    <div class="pp-detail" id="pp-detail"></div>
  </main>

  <script src="../../../js/cart.js"></script>
  <script src="../../../js/product-pages.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function () {
      window.SolarCart && window.SolarCart.init();
      window.SolarProductPages && window.SolarProductPages.mountDetail();
    });
  </script>
</body>
</html>
`;
}

function generate(themeId, rootDir) {
  const theme = loadTheme(path.join('js', 'themes', `${themeId === 'led' ? 'led' : 'solar'}.js`));
  const items = (theme.products && theme.products.items) || [];
  const base = path.join(rootDir, 'san-pham');
  let n = 0;
  items.forEach((item) => {
    if (!item.slug) return;
    const dir = path.join(base, item.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), detailHtml(themeId), 'utf8');
    n += 1;
  });
  console.log(`${themeId}: wrote ${n} detail pages under ${base}`);
}

generate('solar', 'solar');
generate('led', 'den-led');
