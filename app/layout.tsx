import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google';
import { ToastViewport } from '@/components/ui/Toast';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';
import './globals.css';

const display = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700', '800']
});

const body = Inter({ subsets: ['latin'], variable: '--font-body' });

const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Royal64 — Where Every Move Becomes History.',
  description:
    'Royal64 is a premium chess platform: play a friend in real time, challenge the Royal64 AI, and step into a classic chocolate-toned digital chess club. Built by Nicholas.ofc.',
  applicationName: 'Royal64',
  authors: [{ name: 'Nicholas.ofc' }],
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/icon-192.svg',
    apple: '/icons/icon-192.svg'
  },
  openGraph: {
    title: 'Royal64 — Where Every Move Becomes History.',
    description: 'A premium chess club for the modern age.',
    type: 'website'
  }
};

export const viewport: Viewport = {
  themeColor: '#241a12',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-body">
        {children}
        <ToastViewport />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
