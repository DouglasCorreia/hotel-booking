import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header, Footer } from "@/components/shell";

export const metadata: Metadata = {
  title: {
    default: "Lumina Hotels — Encontre sua próxima estadia",
    template: "%s | Lumina Hotels",
  },
  description:
    "Explore destinos do Brasil, compare hotéis e experimente uma jornada simples de reserva. Projeto demonstrativo, sem cobrança.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body>
        <Providers>
          <a
            href="#conteudo"
            className="fixed left-5 -top-20 z-[100] [padding:12px_20px] bg-primary text-white [&:focus]:top-3"
          >
            Pular para o conteúdo
          </a>
          <Header />
          <main id="conteudo">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
