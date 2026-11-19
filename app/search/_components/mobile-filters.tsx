"use client";
import { useLocale } from "@/lib/i18n/client";

import { useLayoutEffect, useRef, type ComponentProps } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { animateEntrance } from "@/lib/animate-entrance";
import { FiltersForm } from "./filters";

export function MobileFilters(
  formProps: Omit<ComponentProps<typeof FiltersForm>, "onCommit">
) {
  const { t } = useLocale();
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const release = useRef<() => void>(undefined);

  // Also runs when the App Router hides this screen for history navigation.
  useLayoutEffect(() => () => release.current?.(), []);

  function openFilters() {
    const panel = dialog.current;
    if (!panel || panel.open) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    panel.showModal();
    closeButton.current?.focus({ preventScroll: true });
    root.style.overflow = "hidden";
    const cancel = animateEntrance(
      panel,
      { transform: ["translateX(-100%)", "translateX(0)"] },
      0.24
    );

    release.current = () => {
      cancel?.();
      panel.close();
      root.style.overflow = previousOverflow;
      release.current = undefined;
    };
  }

  function closeFilters() {
    release.current?.();
    trigger.current?.focus({ preventScroll: true });
  }

  return (
    <>
      <Button
        ref={trigger}
        type="button"
        variant="outline"
        size="icon"
        className="size-11"
        aria-label={t("Abrir filtros")}
        aria-haspopup="dialog"
        aria-controls="mobile-filters"
        onClick={openFilters}
      >
        <SlidersHorizontal aria-hidden="true" />
      </Button>
      <dialog
        ref={dialog}
        id="mobile-filters"
        aria-labelledby="mobile-filters-heading"
        className="fixed inset-y-0 left-0 right-auto m-0 h-dvh max-h-none w-[min(22rem,_calc(100vw_-_2.75rem))] max-w-none overflow-hidden border-0 bg-background p-0 text-foreground shadow-lg backdrop:bg-black/45"
        onCancel={(event) => {
          event.preventDefault();
          closeFilters();
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 items-center justify-between gap-3 p-4">
            <h2 id="mobile-filters-heading" className="m-0 text-xl">
              {t("Filtros")}
            </h2>
            <Button
              ref={closeButton}
              type="button"
              variant="outline"
              size="icon"
              className="size-11"
              aria-label={t("Fechar filtros")}
              onClick={closeFilters}
            >
              <X aria-hidden="true" />
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 [&_aside>h2]:sr-only">
            <FiltersForm {...formProps} onCommit={closeFilters} />
          </div>
        </div>
      </dialog>
    </>
  );
}
