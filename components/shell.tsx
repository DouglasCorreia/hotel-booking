import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { localizedHref } from "@/lib/i18n/routing";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { HeaderLinks } from "./header-links";
import { MobileMenu } from "./mobile-menu";
import { LanguageSwitch } from "./language-switch";

async function Brand() {
  const [locale, t] = await Promise.all([getLocale(), getTranslator()]);
  return (
    <Link
      href={localizedHref("/", locale)}
      className="brand inline-flex gap-2.5 items-center text-foreground [&_>_svg]:text-primary [&_>_svg]:w-8 [&_>_svg]:h-8 [&_>_span]:text-[32px] [&_>_span]:leading-[1] [&_>_span]:font-[750] [&_>_span]:tracking-[-0.075em] [&_small]:block [&_small]:text-[9px] [&_small]:font-[550] [&_small]:tracking-[0.35em] [&_small]:ml-0.5 [&_small]:mt-[5px] max-[760.01px]:[&_>_span]:text-[27px] max-[760.01px]:[&_>_svg]:w-[27px] max-[760.01px]:[&_>_svg]:h-[27px] max-[360.01px]:gap-[5px] max-[360.01px]:[&_>_span]:text-[23px]"
      aria-label={t("Lumina Hotels — início")}
    >
      <Sparkles aria-hidden="true" strokeWidth={1.5} />
      <span>
        lumina<span className="text-primary">.</span>
        <small>hotels</small>
      </span>
    </Link>
  );
}
export async function Header() {
  const t = await getTranslator();
  return (
    <header className="relative bg-white border-b border-b-border">
      <div className="container w-[min(1280px,_calc(100%_-_80px))] mx-auto max-[1200.01px]:w-[calc(100%_-_56px)] max-[760.01px]:w-[calc(100%_-_36px)] max-[360.01px]:w-[calc(100%_-_28px)] min-h-22 flex items-center gap-15 max-[760.01px]:min-h-[75px] max-[760.01px]:gap-5">
        <Brand />
        <nav
          aria-label={t("Navegação principal")}
          className="flex items-center gap-8 text-[12px] font-[550] max-[760.01px]:hidden"
        >
          <HeaderLinks className="flex items-center gap-1.5 hover:text-primary" />
        </nav>
        <LanguageSwitch
          compact
          className="ml-auto flex items-center gap-2 text-[11px] text-muted-foreground whitespace-nowrap max-[760.01px]:hidden!"
        />
        <MobileMenu />
      </div>
    </header>
  );
}
async function copyrightYear() {
  "use cache";
  return new Date().getFullYear();
}
export async function Footer() {
  const [locale, t, year] = await Promise.all([
    getLocale(),
    getTranslator(),
    copyrightYear(),
  ]);
  return (
    <footer className="bg-white">
      <div className="container w-[min(1280px,_calc(100%_-_80px))] mx-auto max-[1200.01px]:w-[calc(100%_-_56px)] max-[760.01px]:w-[calc(100%_-_36px)] max-[360.01px]:w-[calc(100%_-_28px)] py-12.5 flex justify-between gap-7.5 [&_p]:text-muted-foreground [&_p]:text-[11px] [&_p]:mt-[15px] [&_strong]:text-[14px] [&_a:not(.brand)]:inline-flex [&_a:not(.brand)]:items-center [&_a:not(.brand)]:gap-2.5 [&_a:not(.brand)]:text-primary [&_a:not(.brand)]:text-[11px] max-[760.01px]:flex-col max-[760.01px]:py-[35px]">
        <div>
          <Brand />
          <p>{t("Um novo lugar. Uma nova perspectiva.")}</p>
        </div>
        <div>
          <strong>{t("Explore com calma.")}</strong>
          <p>{t("Encontre sua próxima estadia nos destinos do Brasil.")}</p>
          <Link href={localizedHref("/#buscar", locale)}>
            {t("Começar uma busca")}{" "}
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="container w-[min(1280px,_calc(100%_-_80px))] mx-auto max-[1200.01px]:w-[calc(100%_-_56px)] max-[760.01px]:w-[calc(100%_-_36px)] max-[360.01px]:w-[calc(100%_-_28px)] border-t border-t-border py-5.5 text-muted-foreground flex justify-between gap-5 text-[10px] max-[760.01px]:flex-col max-[760.01px]:gap-2.5 max-[760.01px]:text-[9px]">
        <span>© {year} Lumina Hotels</span>
        <span>
          {t("Projeto demonstrativo · Sem cobrança ou reserva real.")}
        </span>
      </div>
    </footer>
  );
}
