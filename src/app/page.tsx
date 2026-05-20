'use client';

import dynamic from 'next/dynamic';

const Picture = dynamic(() => import('../components/Picture'), {
  ssr: false,
});

export default function Home() {
  return <Picture />;
}
