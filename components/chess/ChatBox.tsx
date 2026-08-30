'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import type { ChatMessagePayload, RealtimeProvider } from '@/lib/realtime/provider';
import { playChatSound } from '@/lib/audio/sfx';

interface ChatBoxProps {
  provider: RealtimeProvider;
  gameId: string;
  senderId: string;
  senderName: string;
  /** Spectators can read chat but are also allowed to send in this build. */
  disabled?: boolean;
}

export function ChatBox({ provider, gameId, senderId, senderName, disabled }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessagePayload[]>([]);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = provider.onChat((msg) => {
      setMessages((prev) => [...prev, msg]);
      if (msg.senderId !== senderId) playChatSound();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const msg: ChatMessagePayload = {
      id: `${senderId}-${Date.now()}`,
      gameId,
      senderId,
      senderName,
      text: text.slice(0, 280),
      timestamp: Date.now()
    };

    const sent = await provider.sendChat(msg);
    if (sent) {
      setMessages((prev) => [...prev, msg]);
      setDraft('');
    }
  }

  return (
    <div className="flex flex-col bg-[url('/textures/wood-grain.svg')] bg-cover border-2 border-gold-500/30 rounded-xl overflow-hidden shadow-panel">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-espresso-950/70 border-b border-gold-500/20">
        <MessageCircle size={15} className="text-gold-400" />
        <h3 className="font-display text-sm text-parchment-100 tracking-wide">Meja Bincang</h3>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 min-h-[140px] max-h-56 overflow-y-auto px-3 py-2 flex flex-col gap-1.5 bg-espresso-950/30"
      >
        {messages.length === 0 ? (
          <p className="text-parchment-300/50 text-xs italic text-center mt-6">
            Belum ada obrolan — sapa lawanmu.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-lg px-3 py-1.5 text-sm ${
                m.senderId === senderId
                  ? 'self-end bg-mahogany-600/70 text-ivory'
                  : 'self-start bg-walnut-700/70 text-parchment-100'
              }`}
            >
              <span className="font-player text-gold-300 text-base mr-1.5 align-middle">
                {m.senderName}
              </span>
              <span className="align-middle">{m.text}</span>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-3 py-2 bg-espresso-950/70 border-t border-gold-500/20"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={280}
          disabled={disabled}
          placeholder={disabled ? 'Menonton — sambungan belum siap' : 'Tulis pesan…'}
          className="flex-1 bg-espresso-900 border border-walnut-700 focus:border-gold-500 rounded-full px-4 py-2 text-sm text-parchment-100 outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !draft.trim()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gold-500 hover:bg-gold-400 disabled:opacity-40 disabled:hover:bg-gold-500 text-espresso-950 transition-colors"
          aria-label="Kirim pesan"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
