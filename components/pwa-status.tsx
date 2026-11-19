"use client";
import { useLocale } from "@/lib/i18n/client";

import { useEffect } from "react";
import { useOnline } from "@/lib/use-online";

export function PwaStatus() {
  const { t } = useLocale();
  const isOnline = useOnline();

  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !window.isSecureContext ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((error) => {
        console.warn(
          "Não foi possível ativar a tela offline da Lumina.",
          error
        );
      });
  }, []);

  return (
    <div role="status" aria-atomic="true">
      {!isOnline && (
        <p className="border-b border-border bg-secondary px-4 py-2 text-center text-sm text-secondary-foreground">
          {t(
            "Você está sem conexão. Reconecte-se para buscar hotéis ou confirmar sua reserva."
          )}
        </p>
      )}
    </div>
  );
}
