"use client";
import Link from "next/link";
import { CircleAlert, SearchX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";

export function Feedback({
  title,
  children,
  onRetry,
  href = "/#buscar",
  linkLabel = "Voltar à busca",
  isEmpty = false,
}: {
  title: string;
  children?: React.ReactNode;
  onRetry?: () => void;
  href?: string;
  linkLabel?: string;
  isEmpty?: boolean;
}) {
  const Icon = isEmpty ? SearchX : CircleAlert;
  return (
    <section
      className="[padding:50px_30px] border border-border rounded-[10px] bg-white text-center flex flex-col items-center gap-[15px] [&_h2]:text-[23px] [&_h2]:m-0 [&_>_svg]:text-primary [&_>_.muted]:max-w-120 [&_>_.muted]:text-[13px] max-[760.01px]:[padding:35px_20px] max-[760.01px]:[&_h2]:text-[21px]"
      role={isEmpty ? "status" : "alert"}
    >
      <Icon size={32} aria-hidden="true" />
      <h2>{title}</h2>
      <div className="muted text-muted-foreground">{children}</div>
      <div className="flex flex-wrap justify-center gap-3 mt-2 max-[760.01px]:flex-col max-[760.01px]:w-full">
        {onRetry && <Button onClick={onRetry}>Tentar novamente</Button>}
        <Button variant="outline" asChild>
          <Link href={href}>
            <ArrowLeft aria-hidden="true" />
            {linkLabel}
          </Link>
        </Button>
      </div>
    </section>
  );
}
export function QueryError({
  error,
  onRetry,
  title = "Não foi possível carregar",
}: {
  error: Error;
  onRetry: () => void;
  title?: string;
}) {
  return (
    <Feedback
      title={
        error instanceof ApiError && error.status === 404
          ? "Registro não encontrado"
          : title
      }
      onRetry={onRetry}
    >
      {error.message}
    </Feedback>
  );
}
export function LoadingCards({ count = 3 }: { count?: number }) {
  return (
    <div
      className="grid gap-5"
      aria-label="Carregando hospedagens"
      role="status"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          className="overflow-hidden border border-border rounded-[10px] bg-white"
          key={i}
        >
          <Skeleton className="h-48 w-full" />
          <div className="flex flex-col gap-3 p-6">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
