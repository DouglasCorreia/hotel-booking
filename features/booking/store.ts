"use client";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";
import { selectionSchema, type Selection } from "./model";
import { draftSchema, type CheckoutDraft } from "./checkout-model";

type BookingState = {
  selection: Selection | null;
  draft: CheckoutDraft | null;
  isReady: boolean;
  select: (selection: Selection) => void;
  acceptPrice: (pricePerNight: number) => void;
  saveDraft: (draft: CheckoutDraft) => void;
  complete: (selection: Selection) => void;
  ready: () => void;
};

const session: StateStorage = {
  getItem(name) {
    try {
      return sessionStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem(name, value) {
    try {
      sessionStorage.setItem(name, value);
    } catch {
      // The checkout can continue in memory when storage is unavailable.
    }
  },
  removeItem(name) {
    try {
      sessionStorage.removeItem(name);
    } catch {
      // The in-memory selection has already been updated.
    }
  },
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      selection: null,
      draft: null,
      isReady: false,
      select: (selection) => set({ selection, draft: null }),
      acceptPrice: (pricePerNight) =>
        set(({ selection }) => ({
          selection: selection && { ...selection, pricePerNight },
        })),
      saveDraft: (input) => {
        const draft = draftSchema.safeParse(input);
        if (draft.success)
          set((state) => (state.selection ? { draft: draft.data } : state));
      },
      complete: (selection) =>
        set((state) =>
          state.selection === selection
            ? { selection: null, draft: null }
            : state
        ),
      ready: () => set({ isReady: true }),
    }),
    {
      name: "lumina-selection-v1",
      storage: createJSONStorage(() => session),
      skipHydration: true,
      partialize: ({ selection, draft }) => ({ selection, draft }),
      merge: (persisted, current) => {
        const saved =
          persisted && typeof persisted === "object" && "selection" in persisted
            ? selectionSchema.safeParse(persisted.selection)
            : null;
        const draft =
          persisted && typeof persisted === "object" && "draft" in persisted
            ? draftSchema.safeParse(persisted.draft)
            : null;
        const selection = saved?.success ? saved.data : null;
        return {
          ...current,
          selection,
          draft:
            selection &&
            draft?.success &&
            draft.data.companions.length ===
              selection.search.adults + selection.search.children - 1
              ? draft.data
              : null,
        };
      },
    }
  )
);
