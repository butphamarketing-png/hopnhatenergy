const fs = require('fs');
const path = require('path');
const root = 'c:/Users/Admin/Downloads/Solar/den-led';

const services = [
  'tu-van-chieu-sang',
  'thiet-ke-he-thong-den',
  'thi-cong-lap-dat',
  'bao-tri-he-thong',
  'nang-cap-den-led',
  'tiet-kiem-dien',
];
const news = [
  'kien-thuc-den-led',
  'so-sanh-den-led',
  'tiet-kiem-dien-voi-led',
  'thiet-ke-anh-sang',
  'chieu-sang-nha-xuong',
  'chieu-sang-dan-dung',
];
const projects = [
  'nha-xuong-long-an',
  'van-phong-quan-1',
  'truong-hoc-binh-duong',
  'benh-vien-dong-nai',
  'kcn-ba-ria',
  'khach-san-resort-nha-trang',
];

function write(file, html) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

write(path.join(root, 'dich-vu', 'index.html'), `<!DOCTYPE html>
<html lang="vi" data-theme="led">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dịch vụ chiếu sáng LED | Solar Miền Nam</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <script src="../../js/themes/led.js"></script>
  <link rel="stylesheet" href="../../css/tokens.css" />
  <link rel="stylesheet" href="../../css/services-pages.css" />
  <link rel="stylesheet" href="../../css/led.css" />
</head>
<body>
  <header class="sv-header">
    <a href="../" class="sv-back">← Trang chủ</a>
    <p class="sv-brand">Solar <span>Miền Nam</span> · LED</p>
  </header>
  <main class="sv-wrap">
    <p class="sv-label">Dịch vụ</p>
    <h1 class="sv-title">Đồng hành cùng khách hàng trong từng giai đoạn</h1>
    <p class="sv-desc">Từ tư vấn chiếu sáng đến bảo trì và nâng cấp LED.</p>
    <ul class="sv-grid" id="sv-grid"></ul>
  </main>
  <script src="../../js/service-pages.js"></script>
  <script>document.addEventListener('DOMContentLoaded',()=>window.SolarServicePages&&window.SolarServicePages.mountCatalog());</script>
</body>
</html>`);

const svcDetail = `<!DOCTYPE html>
<html lang="vi" data-theme="led">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dịch vụ LED | Solar Miền Nam</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <script src="../../../js/themes/led.js"></script>
  <link rel="stylesheet" href="../../../css/tokens.css" />
  <link rel="stylesheet" href="../../../css/services-pages.css" />
  <link rel="stylesheet" href="../../../css/led.css" />
</head>
<body>
  <header class="sv-header">
    <a href="../../" class="sv-back">← Trang chủ</a>
    <p class="sv-brand">Solar <span>Miền Nam</span> · LED</p>
  </header>
  <nav class="sv-detail-nav"><a class="sv-back" href="../">← Tất cả dịch vụ</a></nav>
  <main id="sv-detail" class="sv-detail"></main>
  <script src="../../../js/service-pages.js"></script>
  <script>document.addEventListener('DOMContentLoaded',()=>window.SolarServicePages&&window.SolarServicePages.mountDetail());</script>
</body>
</html>`;

services.forEach((s) => write(path.join(root, 'dich-vu', s, 'index.html'), svcDetail));

// News
write(path.join(root, 'tin-tuc', 'index.html'), `<!DOCTYPE html>
<html lang="vi" data-theme="led">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tin tức chiếu sáng LED | Solar Miền Nam</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <script src="../../js/themes/led.js"></script>
  <link rel="stylesheet" href="../../css/tokens.css" />
  <link rel="stylesheet" href="../../css/news-pages.css" />
  <link rel="stylesheet" href="../../css/led.css" />
</head>
<body>
  <header class="nw-header">
    <a href="../" class="nw-back">← Trang chủ</a>
    <p class="nw-brand">Solar <span>Miền Nam</span> · LED</p>
  </header>
  <main class="nw-wrap">
    <p class="nw-label">Tin tức</p>
    <h1 class="nw-title">Kiến thức chiếu sáng LED</h1>
    <div id="nw-grid" class="nw-grid"></div>
  </main>
  <script src="../../js/news-pages.js"></script>
  <script>document.addEventListener('DOMContentLoaded',()=>window.SolarNewsPages&&window.SolarNewsPages.mountCatalog());</script>
</body>
</html>`);

const newsDetail = `<!DOCTYPE html>
<html lang="vi" data-theme="led">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tin tức LED | Solar Miền Nam</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <script src="../../../js/themes/led.js"></script>
  <link rel="stylesheet" href="../../../css/tokens.css" />
  <link rel="stylesheet" href="../../../css/news-pages.css" />
  <link rel="stylesheet" href="../../../css/led.css" />
</head>
<body>
  <header class="nw-header">
    <a href="../../" class="nw-back">← Trang chủ</a>
    <p class="nw-brand">Solar <span>Miền Nam</span> · LED</p>
  </header>
  <main id="nw-detail" class="nw-detail"></main>
  <script src="../../../js/news-pages.js"></script>
  <script>document.addEventListener('DOMContentLoaded',()=>window.SolarNewsPages&&window.SolarNewsPages.mountDetail());</script>
</body>
</html>`;
news.forEach((s) => write(path.join(root, 'tin-tuc', s, 'index.html'), newsDetail));

// Projects
write(path.join(root, 'du-an', 'index.html'), `<!DOCTYPE html>
<html lang="vi" data-theme="led">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dự án chiếu sáng LED | Solar Miền Nam</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <script src="../../js/themes/led.js"></script>
  <link rel="stylesheet" href="../../css/tokens.css" />
  <link rel="stylesheet" href="../../css/projects-pages.css" />
  <link rel="stylesheet" href="../../css/led.css" />
</head>
<body>
  <header class="pj-header">
    <a href="../" class="pj-back">← Trang chủ</a>
    <p class="pj-brand">Solar <span>Miền Nam</span> · LED</p>
  </header>
  <main class="pj-wrap">
    <p class="pj-label">Dự án</p>
    <h1 class="pj-title">Dự án chiếu sáng tiêu biểu</h1>
    <ul class="pj-grid" id="pj-grid"></ul>
  </main>
  <script src="../../js/project-pages.js"></script>
  <script>document.addEventListener('DOMContentLoaded',()=>window.SolarProjectPages&&window.SolarProjectPages.mountCatalog());</script>
</body>
</html>`);

const projDetail = `<!DOCTYPE html>
<html lang="vi" data-theme="led">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dự án LED | Solar Miền Nam</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <script src="../../../js/themes/led.js"></script>
  <link rel="stylesheet" href="../../../css/tokens.css" />
  <link rel="stylesheet" href="../../../css/projects-pages.css" />
  <link rel="stylesheet" href="../../../css/led.css" />
</head>
<body>
  <header class="pj-header">
    <a href="../../" class="pj-back">← Trang chủ</a>
    <p class="pj-brand">Solar <span>Miền Nam</span> · LED</p>
  </header>
  <main id="pj-detail" class="pj-detail"></main>
  <script src="../../../js/project-pages.js"></script>
  <script>document.addEventListener('DOMContentLoaded',()=>window.SolarProjectPages&&window.SolarProjectPages.mountDetail());</script>
</body>
</html>`;
projects.forEach((s) => write(path.join(root, 'du-an', s, 'index.html'), projDetail));

console.log('scaffolded dich-vu, tin-tuc, du-an for den-led');
