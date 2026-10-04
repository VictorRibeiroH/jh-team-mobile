import { create } from 'zustand';

// Prévia interativa em memória. Reiniciar o app restaura os valores demonstrativos.
type HydrationState = {
  water: number;
  addWater: (ml: number) => void;
  reset: () => void;
};
export const useHydration = create<HydrationState>((set) => ({
  water: 1250,
  addWater: (ml) => set((state) => ({ water: state.water + ml })),
  reset: () => set({ water: 1250 }),
}));
