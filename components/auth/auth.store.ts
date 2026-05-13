"use client";

import { create } from "zustand";

type AuthMode = "login" | "register" | null;

interface AuthStore {
  isOpen: boolean;
  mode: AuthMode;
  open: (mode: AuthMode) => void;
  close: () => void;
  switchMode: (mode: AuthMode) => void;
}

export const useAuthModal = create<AuthStore>((set) => ({
  isOpen: false,
  mode: null,

  open: (mode) =>
    set({
      isOpen: true,
      mode,
    }),

  close: () =>
    set({
      isOpen: false,
      mode: null,
    }),

  switchMode: (mode) =>
    set({
      mode,
      isOpen: true,
    }),
}));
