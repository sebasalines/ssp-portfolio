import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const VIEWPORTS = [
  { name: 'desktop-1920', w: 1920, h: 1080 },
  { name: 'laptop-1440', w: 1440, h: 900 },
  { name: 'tablet-land-1024', w: 1024, h: 768 },
  { name: 'tablet-port-768', w: 768, h: 1024 },
  { name: 'mobile-414', w: 414, h: 896 },
  { name: 'mobile-375', w: 375, h: 812 },
  { name: 'mobile-360', w: 360, h: 640 },
];

const OUT_DIR = 'shots';
mkdirSync(OUT_DIR, { recursive: true });

const url = process.env.URL || 'http://localhost:3000/';

const browser = await chromium.launch();

const summary = [];

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => {
    const root = document.querySelector('.glitchFaceContainer');
    return !!root && root.querySelector('canvas');
  }, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(600);

  const m = await page.evaluate(() => {
    const get = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), bottom: Math.round(r.bottom) };
    };
    return {
      vh: window.innerHeight,
      vw: window.innerWidth,
      scrollH: document.documentElement.scrollHeight,
      vScroll: document.documentElement.scrollHeight > window.innerHeight + 1,
      hScroll: document.documentElement.scrollWidth > window.innerWidth + 1,
      face: get('.glitchFaceContainer'),
      canvas: get('.glitchFaceContainer canvas'),
      textBlock: get('.textBlock'),
      nav: get('.textBlock nav'),
    };
  });

  await page.screenshot({ path: join(OUT_DIR, `${vp.name}.png`), fullPage: false });

  const faceShareV = m.face ? (m.face.h / m.vh) * 100 : 0;
  const textAtBottom = m.textBlock && m.nav ? m.nav.bottom <= m.vh + 1 : false;
  const navGapFromBottom = m.nav ? m.vh - m.nav.bottom : null;

  const row = {
    name: vp.name,
    viewport: `${vp.w}x${vp.h}`,
    vScroll: m.vScroll,
    hScroll: m.hScroll,
    face_h: m.face?.h,
    canvas_h: m.canvas?.h,
    canvas_w: m.canvas?.w,
    text_y: m.textBlock?.y,
    text_h: m.textBlock?.h,
    nav_bottom: m.nav?.bottom,
    nav_gap_to_vp_bottom: navGapFromBottom,
    face_pct_of_vp: Math.round(faceShareV),
    textAtBottom,
  };
  summary.push(row);
  await ctx.close();
}

console.table(summary);
await browser.close();
