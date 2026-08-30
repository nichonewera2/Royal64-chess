'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Crown, LayoutGrid, Swords, Settings } from 'lucide-react';
import clsx from 'clsx';

const LINKS = [
  { href: '/dashboard', label: 'Lobby', icon: LayoutGrid },
  { href: '/game', label: 'Play', icon: Swords },
  { href: '/dashboard#settings', label: 'Settings', icon: Settings }
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:flex flex-col w-56 shrink-0 border-r border-walnut-700 bg-espresso-950 bg-[url('/textures/wood-grain.svg')] bg-cover bg-blend-multiply px-4 py-6 gap-6 min-h-screen sticky top-0">
        <Link href="/" className="flex items-center gap-2 text-parchment-100">
          <Crown className="text-gold-400" size={22} />
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
                  : 'text-parchment-200 hover:bg-espresso-800'
              )}
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-espresso-950/95 border-t border-walnut-700 backdrop-blur flex justify-around py-2">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex flex-col items-center gap-1 text-xs px-3 py-1',
              pathname === href ? 'text-gold-400' : 'text-parchment-300/70'
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
