import { chromium } from 'playwright';

const VIEWPORTS = [
  { name: 'desktop-1920', w: 1920, h: 1080 },
  { name: 'laptop-1440', w: 1440, h: 900 },
  { name: 'tablet-port-768', w: 768, h: 1024 },
  { name: 'mobile-414', w: 414, h: 896 },
  { name: 'mobile-360', w: 360, h: 640 },
];

const url = process.env.URL || 'http://localhost:3000/';
const browser = await chromium.launch();

const rows = [];

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const offsets = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('.blobContainer'));
    return buttons.map((btn, i) => {
      const br = btn.getBoundingClientRect();
      const svg = btn.querySelector('svg');
      if (!svg) return { i, error: 'no svg' };
      const sr = svg.getBoundingClientRect();
      const btnCenterX = br.left + br.width / 2;
      const btnCenterY = br.top + br.height / 2;
      const svgCenterX = sr.left + sr.width / 2;
      const svgCenterY = sr.top + sr.height / 2;
      return {
        i,
        btnW: Math.round(br.width),
        btnH: Math.round(br.height),
        svgW: Math.round(sr.width),
        svgH: Math.round(sr.height),
        dx: +(svgCenterX - btnCenterX).toFixed(2),
        dy: +(svgCenterY - btnCenterY).toFixed(2),
      };
    });
  });

  for (const o of offsets) rows.push({ viewport: vp.name, ...o });
  await ctx.close();
}

console.table(rows);
await browser.close();
