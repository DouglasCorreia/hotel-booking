import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <div className="container w-[min(1280px,_calc(100%_-_80px))] mx-auto max-[1200.01px]:w-[calc(100%_-_56px)] max-[760.01px]:w-[calc(100%_-_36px)] max-[360.01px]:w-[calc(100%_-_28px)] py-17.5 max-[760.01px]:py-[45px] text-center">
      <p className="eyebrow text-primary text-[11px] font-[650] tracking-[0.1em] uppercase mb-3">
        Página não encontrada
      </p>
      <h1>Vamos encontrar outro caminho.</h1>
      <p className="muted text-muted-foreground mb-8">
        O endereço que você procura não está disponível.
      </p>
      <Button asChild>
        <Link href="/">Voltar ao início</Link>
      </Button>
    </div>
  );
}
