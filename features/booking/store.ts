"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { selectionSchema, type Selection } from "./model";

type BookingState = {
  selection: Selection | null;
  isReady: boolean;
  select: (selection: Selection) => void;
  clear: () => void;
  ready: () => void;
};
export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      selection: null,
      isReady: false,
      select: (selection) => set({ selection }),
      clear: () => set({ selection: null }),
      ready: () => set({ isReady: true }),
    }),
    {
      name: "lumina-selection-v1",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      partialize: (state) => ({ selection: state.selection }),
      merge: (persisted, current) => {
        const saved =
          persisted && typeof persisted === "object" && "selection" in persisted
            ? selectionSchema.safeParse(persisted.selection)
            : null;
        return { ...current, selection: saved?.success ? saved.data : null };
      },
    },
  ),
);
