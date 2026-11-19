import { Suspense } from "react";
import { SearchForm } from "@/features/search/_components/search-form";
import { HomeContent } from "@/app/_components/home-content";
import { getTranslator } from "@/lib/i18n/server";

export default async function Home() {
  const t = await getTranslator();
  return (
    <>
      <section className="flex justify-between items-end pt-[65px] pb-8 [&_h1]:text-[clamp(44px,_4.8vw,_66px)] [&_h1]:font-[750] [&_h1]:mb-5 [&_h1]:leading-[1.04] min-[1500px]:pt-[75px] max-[760.01px]:pt-9.5 max-[760.01px]:pb-7 max-[760.01px]:[&_h1]:text-[44px] max-[360.01px]:[&_h1]:text-[38px] container w-[min(1280px,_calc(100%_-_80px))] mx-auto max-[1200.01px]:w-[calc(100%_-_56px)] max-[760.01px]:w-[calc(100%_-_36px)] max-[360.01px]:w-[calc(100%_-_28px)]">
        <div className="[&_>_p:last-child]:text-[14px] [&_>_p:last-child]:text-muted-foreground [&_>_p:last-child]:leading-[1.8] [&_>_p:last-child]:mb-0 max-[760.01px]:[&_>_p:last-child]:text-[12px]">
          <p className="eyebrow text-primary text-[11px] font-[650] tracking-[0.1em] uppercase mb-3">
            {t("Sua viagem, no seu tempo")}
          </p>
          <h1>
            {t("Encontre seu")}
            <br />
            {t("próximo lugar.")}
          </h1>
          <p>
            {t("Da energia da cidade à tranquilidade da serra.")}
            <br className="max-[760.01px]:hidden!" />
            {" " + t("Uma boa estadia faz parte da viagem.")}
          </p>
        </div>
        <span className="text-[12px] leading-[1.8] text-muted-foreground border-l border-l-border pl-5 mb-[5px] max-[760.01px]:hidden!">
          {t("Novos lugares.")}
          <br />
          {t("Boas histórias.")}
        </span>
      </section>
      <div
        id="buscar"
        className="container w-[min(1280px,_calc(100%_-_80px))] mx-auto max-[1200.01px]:w-[calc(100%_-_56px)] max-[760.01px]:w-[calc(100%_-_36px)] max-[360.01px]:w-[calc(100%_-_28px)] home-search"
      >
        <Suspense>
          <SearchForm />
        </Suspense>
        <p className="text-muted-foreground text-[10px] [margin:12px_2px_25px] max-[760.01px]:text-[9px] max-[760.01px]:mb-5.5">
          {t(
            "Escolha seu destino, encontre sua acomodação e experimente uma reserva sem cobrança."
          )}
        </p>
      </div>
      <div id="inspiracao">
        <HomeContent />
      </div>
    </>
  );
}
