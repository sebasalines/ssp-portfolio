import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'shots';
mkdirSync(OUT, { recursive: true });

const url = process.env.URL || 'http://localhost:3000/';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForFunction(() => {
  const c = document.querySelector('canvas#targetCanvas');
  return !!c && c.width > 0 && c.height > 0;
}, { timeout: 10000 });
await page.waitForTimeout(800);

const probe = async (label) => {
  // sample some non-empty pixels from the background canvas to confirm it draws
  const data = await page.evaluate(() => {
    const c = document.getElementById('targetCanvas');
    if (!c) return null;
    const r = c.getBoundingClientRect();
    return {
      cssW: Math.round(r.width),
      cssH: Math.round(r.height),
      bufW: c.width,
      bufH: c.height,
    };
  });
  console.log(label, data);
};

await probe('initial 1440x900');
await page.screenshot({ path: join(OUT, 'resize-1-initial.png') });

const sizes = [
  { w: 1024, h: 768, label: 'tablet-land' },
  { w: 768, h: 1024, label: 'tablet-port' },
  { w: 1920, h: 1080, label: 'desktop' },
  { w: 375, h: 812, label: 'mobile' },
  { w: 1440, h: 900, label: 'back-to-start' },
];

for (const s of sizes) {
  await page.setViewportSize({ width: s.w, height: s.h });
  // wait for ResizeObserver + 120ms debounce + a few frames of paper.js animation
  await page.waitForTimeout(900);
  await probe(`resized ${s.label} ${s.w}x${s.h}`);
  await page.screenshot({ path: join(OUT, `resize-${s.label}.png`) });
}

await browser.close();
