import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <div className="container section text-center">
      <p className="eyebrow">Página não encontrada</p>
      <h1>Vamos encontrar outro caminho.</h1>
      <p className="muted mb-8">
        O endereço que você procura não está disponível.
      </p>
      <Button asChild>
        <Link href="/">Voltar ao início</Link>
      </Button>
    </div>
  );
}
