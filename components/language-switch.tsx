"use client";

import { useId, useRef } from "react";
import { Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookingStore } from "@/features/booking/store";
import { useLocale } from "@/lib/i18n/client";
import {
  localeCache,
  localeCacheKey,
  localeCookie,
  switchLocaleHref,
  type Locale,
} from "@/lib/i18n/routing";

const languageName = { "pt-BR": "Português (Brasil)", "en-US": "English (US)" };

async function chooseLocale(locale: Locale) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  try {
    document.cookie = `${localeCookie}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
  } catch {
    // The explicit URL still selects the language when cookies are blocked.
  }
  if ("caches" in window) {
    try {
      const cache = await caches.open(localeCache);
      await cache.put(localeCacheKey, new Response(locale));
    } catch {
      // The URL and cookie also work without Cache Storage.
    }
  }
  window.location.assign(
    switchLocaleHref(new URL(window.location.href), locale)
  );
}

export function LanguageSwitch({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { locale, t } = useLocale();
  const other = locale === "pt-BR" ? "en-US" : "pt-BR";
  const canSwitch = useBookingStore(
    (state) => state.isReady && !state.isSubmitting
  );
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  const description = useId();

  function switchLanguage() {
    const { isReady, isSubmitting, selection } = useBookingStore.getState();
    if (!isReady || isSubmitting) return;
    if (
      /^(?:\/en-US)?\/checkout\/?$/.test(window.location.pathname) &&
      selection
    ) {
      dialog.current?.showModal();
    } else {
      void chooseLocale(other);
    }
  }

  return (
    <div role="group" aria-label={t("Idioma e moeda")} className={className}>
      <Globe2 size={15} aria-hidden="true" />
      <span lang={locale}>
        {compact ? locale.toUpperCase() : languageName[locale]}
      </span>
      <button
        type="button"
        lang={other}
        onClick={switchLanguage}
        disabled={!canSwitch}
        className="min-h-11 px-1.5 font-semibold text-primary underline underline-offset-4 disabled:opacity-50"
      >
        {languageName[other]}
      </button>
      <span>BRL</span>
      <dialog
        ref={dialog}
        aria-labelledby={title}
        aria-describedby={description}
        className="m-auto max-w-[min(28rem,calc(100%-2rem))] rounded-xl border border-border bg-background p-6 text-foreground backdrop:bg-black/50"
      >
        <h2 id={title} className="mb-3 text-lg font-semibold">
          {t("Alterar idioma?")}
        </h2>
        <p id={description} className="mb-4 text-sm whitespace-normal">
          {t(
            "Você voltará à etapa de hóspedes. A seleção, os nomes, o contato e o cupom serão mantidos. Preencha novamente o CPF e o cartão de teste e aceite os termos no novo idioma."
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => dialog.current?.close()}>
            {t("Continuar neste idioma")}
          </Button>
          <Button
            disabled={!canSwitch}
            onClick={() => void chooseLocale(other)}
          >
            {t("Alterar idioma")}
          </Button>
        </div>
      </dialog>
    </div>
  );
}
