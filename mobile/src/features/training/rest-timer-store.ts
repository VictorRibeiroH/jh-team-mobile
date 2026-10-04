import { create } from 'zustand';
type Timer = {
  endsAt: number | null;
  startedAt: number | null;
  owner: string | null;
  start: (owner: string, seconds: number) => void;
  stop: () => void;
};
export const useRestTimer = create<Timer>((set) => ({
  endsAt: null,
  startedAt: null,
  owner: null,
  start: (owner, seconds) => {
    const now = Date.now();
    set({ startedAt: now, endsAt: now + seconds * 1000, owner });
  },
  stop: () => set({ endsAt: null }),
}));
