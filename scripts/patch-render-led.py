# -*- coding: utf-8 -*-
from pathlib import Path

p = Path(r"c:\Users\Admin\Downloads\Solar\js\render-page.js")
t = p.read_text(encoding="utf-8")

old = "    const projectMetaIcon = theme.id === 'led' ? ICONS.lamp : ICONS.bolt;"
new = """    const projectMetaIcon = theme.id === 'led' ? ICONS.lamp : ICONS.bolt;
    const hasPages = theme.id === 'solar' || theme.id === 'led';
    const firstProjectSlug = (theme.projects.items[0] && theme.projects.items[0].slug) || '';"""
if old not in t:
    raise SystemExit("projectMetaIcon not found")
t = t.replace(old, new, 1)

replacements = [
    ("theme.id === 'solar' ? `san-pham/${esc(slug)}/` : '#section-03'", "hasPages ? `san-pham/${esc(slug)}/` : '#section-03'"),
    ("const cartRow = theme.id === 'solar' ?", "const cartRow = hasPages ?"),
    ("theme.id === 'solar' ? `du-an/${esc(slug)}/` : '#section-04'", "hasPages ? `du-an/${esc(slug)}/` : '#section-04'"),
    ("theme.id === 'solar' ? `dich-vu/${esc(slug)}/` : '#section-05'", "hasPages ? `dich-vu/${esc(slug)}/` : '#section-05'"),
    ("theme.id === 'solar' ? `tin-tuc/${esc(slug)}/` : '#section-06'", "hasPages ? `tin-tuc/${esc(slug)}/` : '#section-06'"),
    ("${theme.id === 'solar' ? `", "${hasPages ? `"),
    ('href="du-an/nha-xuong-long-an/"', 'href="du-an/${esc(firstProjectSlug)}/"'),
]
for a, b in replacements:
    if a not in t:
        print("WARN missing:", a[:60])
    else:
        t = t.replace(a, b)

old_fp = """    const footerProducts = theme.id === 'solar'
      ? `<li><a href=\"danh-muc-san-pham/\">Danh mục sản phẩm</a></li>
         <li><a href=\"gio-hang/\">Giỏ hàng</a></li>
         <li><a href=\"san-pham/pin-longi-585w/\">Pin năng lượng mặt trời</a></li>
         <li><a href=\"san-pham/inverter-solis-5kw/\">Inverter</a></li>
         <li><a href=\"san-pham/pin-luu-tru-deye-5kwh/\">Pin lưu trữ</a></li>
         <li><a href=\"#section-03\">Xem tất cả sản phẩm</a></li>`
      : theme.footer.productLinks.map((l) =>
          `<li><a href=\"#section-03\">${esc(l)}</a></li>`
        ).join('');"""

new_fp = """    const footerProducts = (() => {
      const extras = (theme.footer.productLinks || []).slice(0, 4).map((l) => {
        if (typeof l === 'object' && l.href) return `<li><a href=\"${esc(l.href)}\">${esc(l.label)}</a></li>`;
        if (typeof l === 'string') return `<li><a href=\"#section-03\">${esc(l)}</a></li>`;
        return '';
      }).join('');
      const solarExtras = theme.id === 'solar'
        ? `<li><a href=\"san-pham/pin-longi-585w/\">Pin năng lượng mặt trời</a></li>
         <li><a href=\"san-pham/inverter-solis-5kw/\">Inverter</a></li>
         <li><a href=\"san-pham/pin-luu-tru-deye-5kwh/\">Pin lưu trữ</a></li>`
        : extras;
      return `<li><a href=\"danh-muc-san-pham/\">Danh mục sản phẩm</a></li>
         <li><a href=\"gio-hang/\">Giỏ hàng</a></li>
         ${solarExtras}
         <li><a href=\"#section-03\">Xem tất cả sản phẩm</a></li>`;
    })();"""

if old_fp not in t:
    raise SystemExit("footerProducts not found")
t = t.replace(old_fp, new_fp, 1)

old_fm = """    const footerMidTitle = theme.id === 'solar' ? 'Dịch vụ' : (theme.footer.serviceLinks?.length ? 'Dịch vụ' : 'Danh mục');
    const footerMidLinks = theme.id === 'solar'
      ? `<li><a href=\"dich-vu/\">Tất cả dịch vụ</a></li>
         <li><a href=\"dich-vu/khao-sat-cong-trinh/\">Khảo sát công trình</a></li>
         <li><a href=\"dich-vu/thiet-ke-he-thong/\">Thiết kế hệ thống</a></li>
         <li><a href=\"dich-vu/thi-cong-lap-dat/\">Thi công lắp đặt</a></li>
         <li><a href=\"tin-tuc/\">Tin tức</a></li>`
      : (theme.footer.serviceLinks?.length
        ? theme.footer.serviceLinks.map((l) => `<li><a href=\"#section-05\">${esc(l)}</a></li>`).join('')
        : nav.map(([id, label]) => `<li><a href=\"#section-${id}\">${label}</a></li>`).join(''));"""

new_fm = """    const footerMidTitle = 'Dịch vụ';
    const footerMidLinks = (() => {
      const links = theme.footer.serviceLinks || [];
      if (links.length && typeof links[0] === 'object') {
        return links.map((l) => `<li><a href=\"${esc(l.href)}\">${esc(l.label)}</a></li>`).join('');
      }
      if (theme.id === 'solar') {
        return `<li><a href=\"dich-vu/\">Tất cả dịch vụ</a></li>
         <li><a href=\"dich-vu/khao-sat-cong-trinh/\">Khảo sát công trình</a></li>
         <li><a href=\"dich-vu/thiet-ke-he-thong/\">Thiết kế hệ thống</a></li>
         <li><a href=\"dich-vu/thi-cong-lap-dat/\">Thi công lắp đặt</a></li>
         <li><a href=\"tin-tuc/\">Tin tức</a></li>`;
      }
      return links.map((l) => `<li><a href=\"#section-05\">${esc(l)}</a></li>`).join('')
        || nav.map(([id, label]) => `<li><a href=\"#section-${id}\">${label}</a></li>`).join('');
    })();"""

if old_fm not in t:
    raise SystemExit("footerMid not found")
t = t.replace(old_fm, new_fm, 1)

p.write_text(t, encoding="utf-8")
print("patched ok, hasPages=", t.count("hasPages"))
