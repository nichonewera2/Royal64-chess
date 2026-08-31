'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Swords, Settings } from 'lucide-react';
import clsx from 'clsx';

const LINKS = [
  { href: '/dashboard', label: 'Lobi', icon: LayoutGrid },
  { href: '/game', label: 'Main', icon: Swords },
  { href: '/dashboard#settings', label: 'Pengaturan', icon: Settings }
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:flex flex-col w-56 shrink-0 border-r chrome-border chrome-bg-elevated bg-[url('/textures/wood-grain.svg')] bg-cover bg-blend-multiply px-4 py-6 gap-6 min-h-screen sticky top-0">
        <Link href="/" className="flex items-center gap-2 chrome-text">
          <img src="/icons/icon-192.png" alt="Royal64" className="w-7 h-7 rounded-full" />
          <span className="font-display text-lg">Royal64</span>
        </Link>
        <div className="flex flex-col gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                pathname === href
                  ? 'bg-mahogany-600/40 text-gold-400'
                  : 'chrome-text-muted chrome-hover-card'
              )}
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 chrome-bg-elevated border-t chrome-border backdrop-blur flex justify-around py-2">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex flex-col items-center gap-1 text-xs px-3 py-1',
              pathname === href ? 'text-gold-400' : 'chrome-text-muted'
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
