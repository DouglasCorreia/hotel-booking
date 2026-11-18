import Link from "next/link";
import { ArrowUpRight, Globe2, Sparkles } from "lucide-react";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Lumina Hotels — início">
      <Sparkles aria-hidden="true" strokeWidth={1.5} />
      <span>
        lumina<span className="brand-dot">.</span>
        <small>hotels</small>
      </span>
    </Link>
  );
}
export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <nav aria-label="Navegação principal">
          <Link href="/#buscar">Encontrar uma estadia</Link>
          <Link href="/#inspiracao" className="desktop-link">
            Inspire-se <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </nav>
        <span className="locale">
          <Globe2 size={15} aria-hidden="true" /> PT-BR <span>·</span> BRL
        </span>
      </div>
    </header>
  );
}
async function copyrightYear() {
  "use cache";
  return new Date().getFullYear();
}
export async function Footer() {
  const year = await copyrightYear();
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div>
          <Brand />
          <p>Um novo lugar. Uma nova perspectiva.</p>
        </div>
        <div>
          <strong>Explore com calma.</strong>
          <p>Encontre sua próxima estadia nos destinos do Brasil.</p>
          <Link href="/#buscar">
            Começar uma busca <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {year} Lumina Hotels</span>
        <span>Projeto demonstrativo · Sem cobrança ou reserva real.</span>
      </div>
    </footer>
  );
}
