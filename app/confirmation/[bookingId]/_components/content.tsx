"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, CalendarDays, UserRound } from "lucide-react";
import { getBooking } from "@/features/booking/api";
import { useBookingStore } from "@/features/booking/store";
import { StaySummary } from "@/components/stay-summary";
import { Button } from "@/components/ui/button";
import { LoadingCards, Feedback, QueryError } from "@/components/feedback";
import { ApiError } from "@/lib/api/client";

export function ConfirmationContent({ bookingId }: { bookingId: string }) {
  const booking = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: ({ signal }) => getBooking(bookingId, signal),
    staleTime: 0,
    refetchOnMount: "always",
    gcTime: 0,
  });
  useEffect(() => {
    if (booking.isSuccess) useBookingStore.getState().clear();
  }, [booking.isSuccess]);
  if (booking.isPending) return <LoadingCards count={2} />;
  if (booking.isError)
    return booking.error instanceof ApiError && booking.error.status === 404 ? (
      <Feedback title="Reserva não encontrada">
        Não encontramos esta reserva. As reservas demonstrativas deixam de
        existir quando o serviço é reiniciado.
      </Feedback>
    ) : (
      <QueryError
        error={booking.error}
        onRetry={() => booking.refetch()}
        title="Não foi possível consultar sua reserva"
      />
    );
  const item = booking.data;
  return (
    <>
      <div className="confirmation-heading">
        <span className="success-mark">
          <Check size={34} aria-hidden="true" />
        </span>
        <p className="eyebrow">Reserva simulada confirmada</p>
        <h1>Sua próxima estadia está marcada.</h1>
        <p className="muted">
          Tudo certo com sua demonstração. Confira os detalhes abaixo.
        </p>
      </div>
      <div className="confirmation-layout">
        <section className="confirmation-details">
          <div className="booking-reference">
            <span>Número da reserva</span>
            <strong>#{item.id}</strong>
            <span className="confirmed-badge">
              <Check size={14} aria-hidden="true" />
              Confirmada · simulação
            </span>
          </div>
          <div className="confirmation-person">
            <h2>
              <UserRound size={20} aria-hidden="true" />
              Titular da reserva
            </h2>
            <strong>{item.guests[0].name}</strong>
            <p>{item.guests[0].email}</p>
            <p>{item.guests[0].phone}</p>
          </div>
          <div className="confirmation-times">
            <h2>
              <CalendarDays size={20} aria-hidden="true" />
              Na hora de chegar
            </h2>
            <p>
              Check-in a partir das <strong>{item.snapshot.checkInTime}</strong>
              .
            </p>
            <p>
              Check-out até as <strong>{item.snapshot.checkOutTime}</strong>.
            </p>
          </div>
          <div className="demo-notice">
            <strong>Sem cobrança. Sem reserva real.</strong>
            <p>
              Este é um projeto demonstrativo. Nenhum quarto foi bloqueado e
              nenhum e-mail será enviado. A confirmação fica disponível enquanto
              esta reserva existir na demonstração.
            </p>
          </div>
          <Button asChild>
            <Link href="/#buscar">
              Planejar outra estadia
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </section>
        <StaySummary stay={{ ...item.snapshot, ...item }} />
      </div>
    </>
  );
}
