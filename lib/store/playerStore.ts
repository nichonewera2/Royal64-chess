'use client';

import { create } from 'zustand';

const STORAGE_KEY = 'royal64:player-name';
const ID_KEY = 'royal64:player-id';

function readStoredName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

function readOrCreatePlayerId(): string {
  if (typeof window === 'undefined') return 'player-ssr';
  let id = localStorage.getItem(ID_KEY);
  if (!id) {
    id = `player-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(ID_KEY, id);
  }
  return id;
}

interface PlayerStoreState {
  name: string | null;
  playerId: string;
  hydrated: boolean;
  hydrate: () => void;
  setName: (name: string) => void;
}

export const usePlayerStore = create<PlayerStoreState>((set) => ({
  name: null,
  playerId: 'player-ssr',
  hydrated: false,
  hydrate: () =>
    set({
      name: readStoredName(),
      playerId: readOrCreatePlayerId(),
      hydrated: true
    }),
  setName: (name) => {
    const trimmed = name.trim().slice(0, 24);
    if (!trimmed) return;
    localStorage.setItem(STORAGE_KEY, trimmed);
    set({ name: trimmed });
  }
}));
