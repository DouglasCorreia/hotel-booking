"use client";
import { useLocale } from "@/lib/i18n/client";

import { useEffect, useId, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { HeaderLinks } from "./header-links";
import { LanguageSwitch } from "./language-switch";

export function MobileMenu() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const menu = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const desktop = window.matchMedia("(min-width: 760.01px)");

    function handleResize(event: MediaQueryListEvent) {
      if (event.matches) setOpen(false);
    }

    function handleOutsidePress(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !menu.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || menu.current?.querySelector("dialog[open]"))
        return;
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus({ preventScroll: true });
    }

    desktop.addEventListener("change", handleResize);
    document.addEventListener("pointerdown", handleOutsidePress);
    document.addEventListener("keydown", handleEscape);
    return () => {
      desktop.removeEventListener("change", handleResize);
      document.removeEventListener("pointerdown", handleOutsidePress);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div
      ref={menu}
      className="ml-auto hidden max-[760.01px]:block"
      onBlur={({ currentTarget, relatedTarget }) => {
        if (
          relatedTarget &&
          !currentTarget.contains(relatedTarget) &&
          !currentTarget.querySelector("dialog[open]")
        ) {
          setOpen(false);
        }
      }}
    >
      <Button
        ref={trigger}
        type="button"
        variant="outline"
        className="h-11 px-3 aria-expanded:bg-accent aria-expanded:text-accent-foreground [&_svg]:size-5"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((previous) => !previous)}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        Menu
      </Button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full z-20 max-h-[calc(100dvh-75px)] overflow-y-auto bg-card text-card-foreground shadow-md"
      >
        <div className="mx-auto w-[calc(100%_-_36px)] py-3 max-[360.01px]:w-[calc(100%_-_28px)]">
          <nav aria-label={t("Navegação principal")} className="flex flex-col">
            <HeaderLinks
              native
              className="flex min-h-12 items-center justify-between gap-3 rounded-md px-3 text-base font-semibold hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              onClick={(event) => {
                if (
                  event.altKey ||
                  event.ctrlKey ||
                  event.metaKey ||
                  event.shiftKey
                ) {
                  return;
                }
                setOpen(false);
                trigger.current?.focus({ preventScroll: true });
              }}
            />
          </nav>
          <Separator className="my-2" />
          <LanguageSwitch className="flex min-h-11 flex-wrap items-center gap-2.5 px-3 text-sm text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
