"use client";
import { Feedback } from "@/components/feedback";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container section">
      <Feedback
        title="Esta página precisa de uma nova tentativa"
        onRetry={reset}
      >
        Não foi possível continuar. Tente carregar a página novamente.
      </Feedback>
    </div>
  );
}
