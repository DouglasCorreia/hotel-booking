import { useLocale } from "@/lib/i18n/client";
import { useId, useRef } from "react";
import { Button } from "@/components/ui/button";

export function Terms({ policy }: { policy: string }) {
  const { t } = useLocale();
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => dialog.current?.showModal()}
      >
        {t("Ler os termos da reserva")}
      </Button>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        className="m-auto max-h-[85dvh] w-[min(32rem,calc(100%-2rem))] overflow-y-auto rounded-xl border border-border bg-background p-6 text-foreground backdrop:bg-black/50"
      >
        <div className="space-y-4 text-sm leading-relaxed">
          <h2 id={titleId} className="text-xl font-semibold">
            {t("Termos da reserva simulada")}
          </h2>
          <p>
            {t(
              "A Lumina Hotels é uma demonstração. Nenhum valor será cobrado, nenhum quarto será bloqueado e nenhum e-mail será enviado."
            )}
          </p>
          <p>
            {t(
              "Use dados fictícios. Nomes e contato são registrados na mock API e ficam disponíveis no endereço da confirmação enquanto a reserva existir."
            )}
          </p>
          <p>
            {t(
              "O valor apresentado considera as datas, a ocupação, a diária, o cupom e os encargos simulados. A política exibida para esta hospedagem é"
            ) + " "}
            <strong>{policy}</strong>.
          </p>
          <p>
            {t("O aceite se refere à seleção e ao total exibidos na revisão.")}
          </p>
          <Button type="button" onClick={() => dialog.current?.close()}>
            {t("Fechar termos")}
          </Button>
        </div>
      </dialog>
    </>
  );
}
