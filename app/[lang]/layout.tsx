import type { Metadata, Viewport } from "next";
import "../globals.css";
import { Providers } from "@/components/providers";
import { PwaStatus } from "@/components/pwa-status";
import { Header, Footer } from "@/components/shell";
import { LocaleProvider } from "@/lib/i18n/client";
import { createTranslator } from "@/lib/i18n/messages";
import { locales } from "@/lib/i18n/routing";
import {
  getCatalogMessages,
  getLocale,
  getMessages,
  getTranslator,
} from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([getLocale(), getTranslator()]);
  return {
    manifest:
      locale === "en-US"
        ? "/en-US/manifest.webmanifest"
        : "/manifest.webmanifest",
    title: {
      default: t("Lumina Hotels — Encontre sua próxima estadia"),
      template: "%s | Lumina Hotels",
    },
    description: t(
      "Explore destinos do Brasil, compare hotéis e experimente uma jornada simples de reserva. Projeto demonstrativo, sem cobrança."
    ),
  };
}

export const viewport: Viewport = {
  themeColor: "#0051d5",
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const [locale, messages, catalog] = await Promise.all([
    getLocale(),
    getMessages(),
    getCatalogMessages(),
  ]);
  const t = createTranslator(messages);
  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body>
        <LocaleProvider locale={locale} messages={messages} catalog={catalog}>
          <Providers>
            <a
              href="#conteudo"
              className="fixed left-5 -top-20 z-[100] [padding:12px_20px] bg-primary text-white [&:focus]:top-3"
            >
              {t("Pular para o conteúdo")}
            </a>
            <Header />
            <PwaStatus />
            <main id="conteudo">{children}</main>
            <Footer />
          </Providers>
        </LocaleProvider>
      </body>
    </html>
  );
}
