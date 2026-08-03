const fs = require('fs');
const path = require('path');

const root = 'c:/Users/Admin/Downloads/Solar/den-led';

const catalog = `<!DOCTYPE html>
<html lang="vi" data-theme="led" data-solar-base="../">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Danh mục đèn LED — Hợp Nhất Energy." />
  <title>Danh mục đèn LED | Hợp Nhất Energy</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <script src="../../js/themes/led.js"></script>
  <link rel="stylesheet" href="../../css/tokens.css" />
  <link rel="stylesheet" href="../../css/products-pages.css" />
  <link rel="stylesheet" href="../../css/cart.css" />
  <link rel="stylesheet" href="../../css/led.css" />
</head>
<body>
  <header class="pp-header">
    <a href="../" class="pp-back">← Trang chủ</a>
    <p class="pp-brand">Solar <span>Miền Nam</span> · Đèn LED</p>
    <div class="pp-header__cart" data-cart-mount="light"></div>
  </header>
  <main class="pp-wrap">
    <p class="pp-label">Sản phẩm</p>
    <h1 class="pp-title">Danh mục đèn LED</h1>
    <p class="pp-desc">Đèn LED Panel, âm trần, nhà xưởng, pha, đường phố và năng lượng mặt trời.</p>
    <div class="pp-toolbar">
      <input type="search" id="pp-search" class="pp-search" placeholder="Tìm sản phẩm..." aria-label="Tìm kiếm" />
      <select id="pp-filter" class="pp-filter" aria-label="Lọc danh mục"><option value="">Tất cả danh mục</option></select>
    </div>
    <ul class="pp-grid" id="pp-grid"></ul>
    <nav class="pp-pager" id="pp-pager" aria-label="Phân trang"></nav>
  </main>
  <script src="../../js/cart.js"></script>
  <script src="../../js/product-pages.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function () {
      window.SolarCart && window.SolarCart.init();
      window.SolarProductPages && window.SolarProductPages.mountCatalog();
    });
  </script>
</body>
</html>
`;

const detail = `<!DOCTYPE html>
<html lang="vi" data-theme="led" data-solar-base="../../">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Chi tiết đèn LED — Hợp Nhất Energy." />
  <title>Sản phẩm LED | Hợp Nhất Energy</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <script src="../../../js/themes/led.js"></script>
  <link rel="stylesheet" href="../../../css/tokens.css" />
  <link rel="stylesheet" href="../../../css/products-pages.css" />
  <link rel="stylesheet" href="../../../css/cart.css" />
  <link rel="stylesheet" href="../../../css/led.css" />
</head>
<body>
  <header class="pp-header">
    <a href="../../" class="pp-back">← Trang chủ</a>
    <p class="pp-brand">Solar <span>Miền Nam</span> · Đèn LED</p>
    <div class="pp-header__cart" data-cart-mount="light"></div>
  </header>
  <main class="pp-wrap">
    <p class="pp-label">Sản phẩm</p>
    <p style="margin:8px 0 0"><a class="pp-back" href="../../danh-muc-san-pham/">Danh mục sản phẩm</a></p>
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

const cartPage = `<!DOCTYPE html>
<html lang="vi" data-theme="led" data-solar-base="../">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Giỏ hàng &amp; yêu cầu báo giá đèn LED — Hợp Nhất Energy." />
  <title>Giỏ hàng LED — Yêu cầu báo giá | Hợp Nhất Energy</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <script src="../../js/themes/led.js"></script>
  <link rel="stylesheet" href="../../css/tokens.css" />
  <link rel="stylesheet" href="../../css/cart.css" />
  <link rel="stylesheet" href="../../css/led.css" />
</head>
<body class="cart-shell">
  <header class="cart-shell__header">
    <a href="../" style="color:var(--primary);text-decoration:none;font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase">← Trang chủ</a>
    <p class="cart-shell__brand">Solar <span>Miền Nam</span> · LED</p>
    <div class="cart-shell__nav">
      <a href="../danh-muc-san-pham/">Sản phẩm</a>
      <div data-cart-mount="light"></div>
    </div>
  </header>
  <main class="cart-shell__main"><div id="cart-page"></div></main>
  <script src="../../js/cart.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function () {
      window.SolarCart && window.SolarCart.mountCartPage();
    });
  </script>
</body>
</html>
`;

const slugs = [
  'den-led-panel-48w',
  'den-led-am-tran-12w',
  'den-led-nha-xuong-150w',
  'den-led-pha-200w',
  'den-led-duong-120w',
  'den-led-nang-luong-mat-troi-60w',
];

fs.mkdirSync(path.join(root, 'danh-muc-san-pham'), { recursive: true });
fs.writeFileSync(path.join(root, 'danh-muc-san-pham', 'index.html'), catalog);
fs.mkdirSync(path.join(root, 'gio-hang'), { recursive: true });
fs.writeFileSync(path.join(root, 'gio-hang', 'index.html'), cartPage);
fs.mkdirSync(path.join(root, 'thanh-toan'), { recursive: true });
fs.writeFileSync(path.join(root, 'thanh-toan', 'index.html'), `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"/><meta http-equiv="refresh" content="0;url=../gio-hang/"/><script>location.replace('../gio-hang/');</script><title>Chuyển hướng…</title></head><body></body></html>`);

for (const slug of slugs) {
  const dir = path.join(root, 'san-pham', slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), detail);
}

console.log('Created den-led catalog, cart, and', slugs.length, 'product pages');
