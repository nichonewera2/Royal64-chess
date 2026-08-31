import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google';
import { ToastViewport } from '@/components/ui/Toast';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';
import { NamePromptModal } from '@/components/ui/NamePromptModal';
import './globals.css';
import './fonts.css';

const display = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700', '800']
});

const body = Inter({ subsets: ['latin'], variable: '--font-body' });

const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Royal64 — Setiap Langkah Menjadi Sejarah.',
  description:
    'Royal64 adalah platform catur premium: main lawan teman secara real-time, tantang Royal64 AI, dan rasakan klub catur digital bertema kayu klasik. Dibuat oleh Nicholas.ofc.',
  applicationName: 'Royal64',
  authors: [{ name: 'Nicholas.ofc' }],
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png'
  },
  openGraph: {
    title: 'Royal64 — Setiap Langkah Menjadi Sejarah.',
    description: 'Klub catur premium untuk zaman modern.',
    type: 'website'
  }
};

export const viewport: Viewport = {
  themeColor: '#0f0a06',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-body">
        {children}
        <ToastViewport />
        <ServiceWorkerRegister />
        <NamePromptModal />
      </body>
    </html>
  );
}
