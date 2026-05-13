import { create } from "zustand";

export type AuthMode = "login" | "register" | "forgot" | null;

interface AuthModalState {
  mode: AuthMode;
  open: (mode: Exclude<AuthMode, null>) => void;
  close: () => void;
}

export const useAuthModal = create<AuthModalState>((set) => ({
  mode: null,
  open: (mode) => set({ mode }),
  close: () => set({ mode: null }),
}));
