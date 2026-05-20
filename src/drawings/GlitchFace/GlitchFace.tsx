'use client';

import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { GlitchFilter } from 'pixi-filters';

const jarImages = [
  '/faces/jar-1.webp',
  '/faces/jar-2.webp',
  '/faces/jar-3.webp',
  '/faces/jar-4.webp',
  '/faces/jar-5.webp',
  '/faces/jar-6.webp',
];
const lidImages = [
  '/faces/lid-1.webp',
  '/faces/lid-2.webp',
  '/faces/lid-3.webp',
  '/faces/lid-4.webp',
  '/faces/lid-5.webp',
  '/faces/lid-6.webp',
];
const lightbulb = '/lightbulb.webp';

const ASPECT_RATIO = 3 / 4;
const CYCLE_MS = 3000;
const GLITCH_MS = 500;
const FALLBACK_WIDTH = 400;

function fitContain(containerW: number, containerH: number) {
  if (containerW <= 0 || containerH <= 0) {
    return { w: FALLBACK_WIDTH, h: FALLBACK_WIDTH / ASPECT_RATIO };
  }
  const widthForHeight = containerH * ASPECT_RATIO;
  const w = Math.min(containerW, widthForHeight);
  const h = w / ASPECT_RATIO;
  return { w, h };
}

export const GlitchFace = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      const allUrls = [...jarImages, ...lidImages, lightbulb];
      const loaded: Record<string, PIXI.Texture> = await PIXI.Assets.load(allUrls);
      if (cancelled || !containerRef.current) return;

      const jarTextures = jarImages.map((src) => loaded[src]);
      const lidTextures = lidImages.map((src) => loaded[src]);
      const bulbTexture = loaded[lightbulb];

      const initial = fitContain(container.clientWidth, container.clientHeight);

      const app = new PIXI.Application({
        width: initial.w,
        height: initial.h,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      const canvas = app.view as unknown as HTMLCanvasElement;
      canvas.style.display = 'block';
      canvas.style.background = 'transparent';
      canvas.style.position = 'absolute';
      canvas.style.top = '50%';
      canvas.style.left = '50%';
      canvas.style.transform = 'translate(-50%, -50%)';
      canvas.style.width = `${initial.w}px`;
      canvas.style.height = `${initial.h}px`;
      container.appendChild(canvas);

      const glitchFilter = new GlitchFilter({
        slices: 10,
        offset: 100,
        fillMode: 2,
        average: false,
        seed: 0.5,
        red: [10, 3],
        green: [0, 10],
        blue: [0, 0],
      });
      glitchFilter.enabled = false;

      const jar = new PIXI.Sprite(jarTextures[0]);
      jar.filters = [glitchFilter];
      jar.anchor.set(0.5, 0.48);

      const bulb = new PIXI.Sprite(bulbTexture);
      bulb.anchor.set(0.5);

      const lid = new PIXI.Sprite(lidTextures[0]);
      lid.anchor.set(0.5, 0.78);
      lid.filters = [glitchFilter];

      app.stage.addChild(lid, bulb, jar);

      const layout = (w: number, h: number) => {
        const cx = w / 2;
        const cy = h / 2;
        const textureHeight = jarTextures[0].height || h;
        const targetJarHeight = h * 0.8;
        const baseScale = targetJarHeight / textureHeight;
        jar.scale.set(baseScale);
        lid.scale.set(baseScale);
        bulb.scale.set(baseScale * 0.65);
        jar.x = cx;
        jar.y = cy;
        lid.x = cx;
        lid.y = cy - h * 0.15;
        bulb.x = cx;
        bulb.y = cy - h * 0.1;
      };

      layout(initial.w, initial.h);

      const tickerCallback = () => {
        const time = app.ticker.lastTime / 500;
        const h = app.renderer.height / (app.renderer.resolution || 1);
        const cy = h / 2;
        jar.y = cy + 10 * Math.sin(time);
        lid.y = cy - h * 0.15 + 10 * Math.sin(time + 1);
        bulb.y = cy - h * 0.1 + 10 * Math.sin(time + 2);
      };
      app.ticker.add(tickerCallback);

      let imageIndex = 0;
      let glitchTimeout: ReturnType<typeof setTimeout> | null = null;
      const cycleInterval = setInterval(() => {
        glitchFilter.enabled = true;
        imageIndex = (imageIndex + 1) % jarTextures.length;
        jar.texture = jarTextures[imageIndex];
        lid.texture = lidTextures[imageIndex];
        glitchTimeout = setTimeout(() => {
          glitchFilter.enabled = false;
        }, GLITCH_MS);
      }, CYCLE_MS);

      const resync = () => {
        const next = fitContain(container.clientWidth, container.clientHeight);
        if (next.w <= 0 || next.h <= 0) return;
        app.renderer.resize(next.w, next.h);
        canvas.style.width = `${next.w}px`;
        canvas.style.height = `${next.h}px`;
        layout(next.w, next.h);
      };

      const resizeObserver = new ResizeObserver(resync);
      resizeObserver.observe(container);
      window.addEventListener('resize', resync);

      cleanup = () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', resync);
        clearInterval(cycleInterval);
        if (glitchTimeout) clearTimeout(glitchTimeout);
        app.ticker.remove(tickerCallback);
        app.destroy(true, { children: true, texture: false, baseTexture: false });
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    />
  );
};
