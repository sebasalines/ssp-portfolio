'use client';

import { useEffect } from 'react';
import Paper from 'paper';

import { FrameEvent } from '../drawings/types';
import { MetaBlob } from '../drawings/MetaBlob/MetaBlob';
import { GlitchFace } from '../drawings/GlitchFace/GlitchFace';
import BlobButton from './BlobButton';

const GithubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width="30"
    height="30"
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M256 32C132.3 32 32 134.9 32 261.7c0 101.5 64.2 187.5 153.2 217.9a17.56 17.56 0 0 0 3.8.4c8.3 0 11.5-6.1 11.5-11.4c0-5.5-.2-19.9-.3-39.1a102.4 102.4 0 0 1-22.6 2.7c-43.1 0-52.9-33.5-52.9-33.5c-10.2-26.5-24.9-33.6-24.9-33.6c-19.5-13.7-.1-14.1 1.4-14.1h.1c22.5 2 34.3 23.8 34.3 23.8c11.2 19.6 26.2 25.1 39.6 25.1a63 63 0 0 0 25.6-6c2-14.8 7.8-24.9 14.2-30.7c-49.7-5.8-102-25.5-102-113.5c0-25.1 8.7-45.6 23-61.6c-2.3-5.8-10-29.2 2.2-60.8a18.64 18.64 0 0 1 5-.5c8.1 0 26.4 3.1 56.6 24.1a208.21 208.21 0 0 1 112.2 0c30.2-21 48.5-24.1 56.6-24.1a18.64 18.64 0 0 1 5 .5c12.2 31.6 4.5 55 2.2 60.8c14.3 16.1 23 36.6 23 61.6c0 88.2-52.4 107.6-102.3 113.3c8 7.1 15.2 21.1 15.2 42.5c0 30.7-.3 55.5-.3 63c0 5.4 3.1 11.5 11.4 11.5a19.35 19.35 0 0 0 4-.4C415.9 449.2 480 363.1 480 261.7C480 134.9 379.7 32 256 32"
    />
  </svg>
);

const LinkedinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width="30"
    height="30"
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M444.17 32H70.28C49.85 32 32 46.7 32 66.89v374.72C32 461.91 49.85 480 70.28 480h373.78c20.54 0 35.94-18.21 35.94-38.39V66.89C480.12 46.7 464.6 32 444.17 32m-273.3 373.43h-64.18V205.88h64.18zM141 175.54h-.46c-20.54 0-33.84-15.29-33.84-34.43c0-19.49 13.65-34.42 34.65-34.42s33.85 14.82 34.31 34.42c0 19.14-13.31 34.43-34.66 34.43m264.43 229.89h-64.18V296.32c0-26.14-9.34-44-32.56-44c-17.74 0-28.24 12-32.91 23.69c-1.75 4.2-2.22 9.92-2.22 15.76v113.66h-64.18V205.88h64.18v27.77c9.34-13.3 23.93-32.44 57.88-32.44c42.13 0 74 27.77 74 87.64z"
    />
  </svg>
);

const AtIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width="30"
    height="30"
    aria-hidden="true"
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeMiterlimit="10"
      strokeWidth="32"
      d="M315.16 360.55c-16.31 11.16-39.36 17.45-63.16 17.45c-52.94 0-96-40.36-96-90s43.06-90 96-90c41.79 0 73.7 24.51 73.7 60.66c0 32.36-23.601 49.34-43.701 49.34c-15.7 0-22.299-8.99-22.299-21.97v-69.59"
    />
    <path
      fill="none"
      stroke="currentColor"
      strokeMiterlimit="10"
      strokeWidth="32"
      d="M256 286c0 23.2 16.8 42 39.5 42c25.8 0 46.5-18.8 46.5-49.4"
    />
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="32"
      d="M461.55 357.06C435.13 410.92 391 445.71 332.39 460.55C297.55 469.37 264 467.71 232.83 460c-50.91-12.62-93.7-47.32-119.16-94.07a201.66 201.66 0 0 1-23.27-72.41c-3.55-30.83 0-60.81 11.5-89.93c14.21-36 37.46-65.93 67.86-87.43A206.18 206.18 0 0 1 256 80h2.3a209.39 209.39 0 0 1 121.6 41.04c34.07 25 59.43 60.97 70.93 102.1c11 39.21 9.46 81.06-5.28 117.92"
    />
  </svg>
);

const Picture = () => {
  useEffect(() => {
    const targetCanvas = document.getElementById('targetCanvas') as HTMLCanvasElement | null;
    if (!targetCanvas) return;

    Paper.setup(targetCanvas);

    const sync = () => {
      const w = targetCanvas.clientWidth;
      const h = targetCanvas.clientHeight;
      if (w > 0 && h > 0) {
        Paper.view.viewSize = new Paper.Size(w, h);
      }
    };
    sync();

    let blobs: MetaBlob[] = [];
    let blobLayer: paper.Layer | null = null;

    const build = () => {
      if (blobLayer) blobLayer.remove();
      const center = new Paper.Point(Paper.view.center.x, Paper.view.center.y);
      const shared = {
        bounds: Paper.view.bounds,
        center,
        size: Paper.view.size,
        offsetXProportion: 0.328,
        offsetYProportion: 0.318,
        offsetXVariant: 1.5,
        offsetYVariant: 1.5,
        deltaModifierX: 210,
        deltaModifierY: 130,
        handle_len_rate: 7.2,
        blobDistanceFactor: 7.7,
        blobRadiusFactor: 2,
      };
      const mb1 = new MetaBlob({
        ...shared,
        color: '#18182D',
        radiusRandom: 430,
        radiusMin: 380,
        sinRandom: 455,
        sinMin: 322,
        sineVariant: 2.5,
      });
      const mb2 = new MetaBlob({
        ...shared,
        color: '#3F3F5C',
        radiusRandom: 310,
        radiusMin: 280,
        sinRandom: 255,
        sinMin: 122,
        sineVariant: 1.5,
      });
      const mb3 = new MetaBlob({
        ...shared,
        color: '#14141A',
        radiusRandom: 160,
        radiusMin: 90,
        sinRandom: 255,
        sinMin: 122,
        sineVariant: 2.5,
      });
      blobLayer = new Paper.Layer([mb1.group, mb2.group, mb3.group]);
      blobs = [mb1, mb2, mb3];
    };

    build();

    Paper.view.onFrame = (evt: FrameEvent) => {
      if (evt.count % 2 !== 0) return;
      for (const b of blobs) b.move(evt.count);
    };

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const ro = new ResizeObserver(() => {
      sync();
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        build();
      }, 120);
    });
    ro.observe(targetCanvas);

    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      ro.disconnect();
      Paper.view.onFrame = null;
      Paper.project.remove();
    };
  }, []);

  return (
    <div className="container">
      <canvas style={{ width: '100%', height: '100%' }} id="targetCanvas" />

      <section>
        <div className="glitchFaceContainer">
          <GlitchFace />
        </div>
        <div className="textBlock">
          <h1>
            SEBASTIAN<span>\n</span>SALINES
          </h1>
          <h2>Software Developer</h2>
          <p>
            I&apos;m a self-taught developer working (mostly on the web) since 2012.
            <br />
            You can check out some of my code on{' '}
            <a href="https://github.com/sebasalines" target="_blank" rel="noreferrer">
              github
            </a>{' '}
            and my aptitudes on{' '}
            <a
              href="https://www.linkedin.com/in/sebasalines/details/skills/"
              target="_blank"
              rel="noreferrer"
            >
              linkedin
            </a>
            .
          </p>
          <nav>
            <BlobButton href="https://github.com/sebasalines" icon={<GithubIcon />} />
            <BlobButton href="https://www.linkedin.com/in/sebasalines/" icon={<LinkedinIcon />} />
            <BlobButton href="mailto:seba@salines.dev" icon={<AtIcon />} />
          </nav>
        </div>
      </section>
    </div>
  );
};

export default Picture;
