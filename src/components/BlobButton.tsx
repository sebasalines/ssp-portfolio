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

    const blob = new MetaBlobScope({
      scope,
      bounds: new scope.Rectangle(scope.view.center, scope.view.size.clone().multiply(1.5)),
      center: scope.view.center,
      size: scope.view.size,
      scalingMaxWidth: 55,
      color: 'white',
      radiusRandom: 7,
      radiusMin: 5,
      offsetXProportion: 0.38,
      offsetYProportion: 0.38,
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
      centerRadius: 25,
    });

    scope.view.onFrame = (evt: FrameEvent) => {
      blob.move(evt.count);
    };

    const ro = new ResizeObserver(sync);
    ro.observe(canvas);

    return () => {
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
