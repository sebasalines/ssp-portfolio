'use client';

import React from 'react';
import Paper from 'paper';
import { MetaBlobScope } from '../drawings/MetaBlob/MetaBlobScope';
import { FrameEvent } from '../drawings/types';

type BlobButtonProps = {
  icon: React.ReactNode;
  href: string;
};

const BlobButton: React.FunctionComponent<BlobButtonProps> = (props) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scope = new Paper.PaperScope();
    scope.setup(canvas);

    const sync = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w > 0 && h > 0) {
        scope.view.viewSize = new scope.Size(w, h);
      }
    };
    sync();

    let blob: MetaBlobScope | null = null;

    const build = () => {
      if (blob) blob.group.remove();
      const W = scope.view.size.width;
      // All sizes scale with canvas so the blob stays inside the button at any viewport.
      // Bound math (with offsetVariant=2.5, bounds.height=1.5W):
      //   moon orbit amplitude = 0.3 * offsetProportion * W
      //   max blob extent from center = max(centerR, orbit + moonMax)
      //   constraint: extent <= W/2 - safety
      const centerR = W * 0.4;
      const moonMin = Math.max(2.5, W * 0.1);
      const moonRange = Math.max(1, W * 0.04);
      blob = new MetaBlobScope({
        scope,
        bounds: new scope.Rectangle(scope.view.center, scope.view.size.clone().multiply(1.5)),
        center: scope.view.center,
        size: scope.view.size,
        scalingMaxWidth: W * 1.5,
        color: 'white',
        radiusRandom: moonRange,
        radiusMin: moonMin,
        offsetXProportion: 0.22,
        offsetYProportion: 0.22,
        sinRandom: 315,
        sinMin: 255,
        offsetXVariant: 2.5,
        offsetYVariant: 2.5,
        sineVariant: 1.5,
        deltaModifierX: 20,
        deltaModifierY: 20,
        handle_len_rate: 7.2,
        blobDistanceFactor: 257.7,
        blobRadiusFactor: 2,
        centerRadius: centerR,
      });
    };

    build();

    scope.view.onFrame = (evt: FrameEvent) => {
      if (blob) blob.move(evt.count);
    };

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const ro = new ResizeObserver(() => {
      sync();
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 120);
    });
    ro.observe(canvas);

    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      ro.disconnect();
      scope.view.onFrame = null;
      scope.project.remove();
    };
  }, []);

  return (
    <div className="blobContainer button">
      <canvas ref={canvasRef} />
      <a href={props.href} target="_blank" rel="noreferrer">
        {props.icon}
      </a>
    </div>
  );
};

export default BlobButton;
