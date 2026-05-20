import type { Metadata } from 'next';
import { Roboto_Mono } from 'next/font/google';
import './globals.css';

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sebastian Salines -- Software Developer',
  description:
    "Self-taught software developer working (mostly on the web) since 2012. Code on GitHub, aptitudes on LinkedIn.",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={robotoMono.className}>
      <body>{children}</body>
    </html>
  );
}
