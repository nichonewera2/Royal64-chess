'use client';

import { useEffect, useState } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { useToastStore } from '@/components/ui/Toast';

const DISMISS_KEY = 'royal64:install-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallButton({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const push = useToastStore((s) => s.push);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(standalone);

    function handlePrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener('beforeinstallprompt', handlePrompt);

    function handleInstalled() {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  async function handleClick() {
    if (!deferredPrompt) {
      push(
        'Install unavailable in this browser — try Chrome/Edge on desktop or Android, or "Add to Home Screen" on iOS Safari.',
        'info'
      );
      return;
    }
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    localStorage.setItem(DISMISS_KEY, '1');
    if (choice.outcome === 'accepted') {
      push('Installing Royal64…', 'success');
    }
    setDeferredPrompt(null);
  }

  if (isInstalled) {
    return (
      <span className="flex items-center gap-2 text-emerald-400 text-sm">
        <CheckCircle2 size={16} /> Installed
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={
        variant === 'compact'
          ? 'flex items-center gap-2 text-parchment-200 hover:text-gold-400 text-sm'
          : 'flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-espresso-950 font-medium px-4 py-2.5 rounded-lg transition-colors'
      }
    >
      <Download size={16} /> Install Royal64
    </button>
  );
}
