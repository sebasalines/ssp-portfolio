import { chromium } from 'playwright';

const VIEWPORTS = [
  { name: 'desktop-1920', w: 1920, h: 1080 },
  { name: 'tablet-port-768', w: 768, h: 1024 },
  { name: 'mobile-360', w: 360, h: 640 },
];

const url = process.env.URL || 'http://localhost:3000/';
const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // Sample edge pixels of each blob-button canvas over several animation frames.
  // The blob is drawn in white -- any alpha > 0 at the edge means it bled out.
  const result = await page.evaluate(async () => {
    const canvases = Array.from(document.querySelectorAll('.blobContainer canvas'));
    if (canvases.length === 0) return [];
    const out = canvases.map(() => ({ samples: 0, edgeHits: 0, maxAlpha: 0 }));

    const sample = () => {
      canvases.forEach((c, idx) => {
        const ctx = c.getContext('2d');
        if (!ctx) return;
        const w = c.width;
        const h = c.height;
        // 1px border ring around the canvas, sampled at corners + mid-edges
        const points = [
          [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1],
          [Math.floor(w / 2), 0],
          [Math.floor(w / 2), h - 1],
          [0, Math.floor(h / 2)],
          [w - 1, Math.floor(h / 2)],
        ];
        for (const [x, y] of points) {
          const d = ctx.getImageData(x, y, 1, 1).data;
          const a = d[3];
          out[idx].samples += 1;
          if (a > 5) out[idx].edgeHits += 1;
          if (a > out[idx].maxAlpha) out[idx].maxAlpha = a;
        }
      });
    };

    // Sample ~30 frames over ~2 seconds.
    for (let i = 0; i < 30; i++) {
      sample();
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => setTimeout(r, 60));
    }
    return out;
  });

  console.log(`\n${vp.name} (${vp.w}x${vp.h}) — per-button edge pixel sampling:`);
  result.forEach((r, i) => {
    const pct = r.samples > 0 ? ((r.edgeHits / r.samples) * 100).toFixed(1) : '0';
    console.log(`  button ${i}: ${r.edgeHits}/${r.samples} edge hits (${pct}%), max alpha=${r.maxAlpha}`);
  });

  await ctx.close();
}

await browser.close();
