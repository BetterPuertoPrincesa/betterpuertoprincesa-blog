import type { Metadata, Viewport } from 'next';
import {
  Atkinson_Hyperlegible_Mono,
  Atkinson_Hyperlegible_Next,
  Young_Serif,
} from 'next/font/google';
import { Suspense } from 'react';
import Navbar, { NavbarWithPath } from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { site } from '@/lib/site';
import './globals.css';

// Same type pairing as the main portal: Young Serif for headings, Atkinson
// Hyperlegible (built by the Braille Institute for low-vision readers) for
// everything else.
const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  variable: '--font-atkinson',
});

const atkinsonMono = Atkinson_Hyperlegible_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-atkinson-mono',
});

const youngSerif = Young_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-young-serif',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `Blog | ${site.titleSuffix}`,
    template: `%s | ${site.titleSuffix}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': '/feed.xml' },
  },
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: site.locale,
    url: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#d94b7f',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${atkinson.variable} ${atkinsonMono.variable} ${youngSerif.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:font-bold"
        >
          Skip to content
        </a>
        <Suspense fallback={<Navbar />}>
          <NavbarWithPath />
        </Suspense>
        <main id="main" className="flex flex-1 flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
