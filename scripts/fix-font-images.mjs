import fs from 'fs';
import path from 'path';

function walk(d, acc = []) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    if (f.name === 'node_modules') continue;
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p, acc);
    else if (/\.(html|css)$/.test(f.name)) acc.push(p);
  }
  return acc;
}

let n = 0;
for (const f of walk('.')) {
  let t = fs.readFileSync(f, 'utf8');
  const o = t;
  t = t.replaceAll(
    'family=Poppins:wght@300;400;500;600;700',
    'family=Be+Vietnam+Pro:wght@400;500;600;700;800'
  );
  t = t.replaceAll('"Poppins"', '"Be Vietnam Pro"');
  t = t.replaceAll("'Poppins'", "'Be Vietnam Pro'");
  t = t.replaceAll('Poppins, system-ui', 'Be Vietnam Pro, system-ui');
  if (t !== o) {
    fs.writeFileSync(f, t);
    n += 1;
    console.log(f);
  }
}
console.log('updated', n);

// Fix broken Unsplash IDs in theme files
const map = {
  'photo-1565793298595-6a901a6979ea': 'photo-1581092160562-40aa08e78837',
  'photo-1497366811353-6870744d04b9': 'photo-1497366811353-6870744d04b2',
  'photo-1581094794329-c8bbaea7a0e4': 'photo-1504328345606-18bbc8c9d7d1',
};

for (const theme of ['js/themes/led.js', 'js/themes/solar.js']) {
  let t = fs.readFileSync(theme, 'utf8');
  const o = t;
  for (const [bad, good] of Object.entries(map)) {
    t = t.replaceAll(bad, good);
  }
  if (t !== o) {
    fs.writeFileSync(theme, t);
    console.log('fixed images', theme);
  }
}
