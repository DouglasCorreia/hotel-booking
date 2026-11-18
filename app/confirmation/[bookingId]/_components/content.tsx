"use client";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, CalendarDays, UserRound } from "lucide-react";
import { getBooking } from "@/features/booking/api";
import { StaySummary } from "@/components/stay-summary";
import { Button } from "@/components/ui/button";
import { LoadingCards, Feedback, QueryError } from "@/components/feedback";
import { ApiError } from "@/lib/api/client";
import { animateEntrance } from "@/lib/animate-entrance";

export function ConfirmationContent({ bookingId }: { bookingId: string }) {
  const booking = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: ({ signal }) => getBooking(bookingId, signal),
    staleTime: 0,
    refetchOnMount: "always",
    gcTime: 0,
  });
  const icon = useRef<HTMLSpanElement>(null);
  const playedThisVisit = useRef(false);
  const { isSuccess } = booking;

  // Next can hide this route and keep its refs alive for history navigation.
  useLayoutEffect(
    () => () => {
      playedThisVisit.current = false;
    },
    [bookingId]
  );

  useLayoutEffect(() => {
    if (!isSuccess || playedThisVisit.current) return;

    let active = true;
    let cancel: ReturnType<typeof animateEntrance>;
    // Let React finish the commit, including its development effect replay.
    queueMicrotask(() => {
      if (!active) return;
      playedThisVisit.current = true;
      cancel = animateEntrance(
        icon.current,
        { transform: ["scale(0.94)", "scale(1)"] },
        0.22
      );
    });
    return () => {
      active = false;
      cancel?.();
    };
  }, [bookingId, isSuccess]);

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
      <div className="text-center [padding-block:30px_45px] [&_h1]:text-[clamp(30px,_3vw,_42px)] [&_>_p:last-child]:text-[12px] [&_>_p:last-child]:mb-0 max-[760.01px]:[padding-block:20px_30px] max-[760.01px]:[&_h1]:text-[30px]">
        <span
          ref={icon}
          className="inline-flex w-[65px] h-[65px] items-center justify-center bg-[#e5f2eb] text-positive rounded-[50%] mb-6"
        >
          <Check size={34} aria-hidden="true" />
        </span>
        <p className="eyebrow text-primary text-[11px] font-[650] tracking-[0.1em] uppercase mb-3">
          Reserva simulada confirmada
        </p>
        <h1>Sua próxima estadia está marcada.</h1>
        <p className="muted text-muted-foreground">
          Tudo certo com sua demonstração. Confira os detalhes abaixo.
        </p>
      </div>
      <div className="grid grid-cols-[minmax(0,_1fr)_400px] gap-[45px] items-start max-w-255 mx-auto max-[1200.01px]:grid-cols-[minmax(0,_1fr)_360px] max-[1200.01px]:gap-7 max-[1000.01px]:grid-cols-[minmax(0,_1fr)_320px] max-[1000.01px]:gap-5.5 max-[760.01px]:grid-cols-[1fr] max-[760.01px]:gap-[25px] max-[760.01px]:[&_>_.stay-summary]:row-[1]">
        <section className="p-7.5 border border-border rounded-[10px] bg-white [&_>_a]:mt-[25px] max-[760.01px]:p-6">
          <div className="[border-bottom:1px_dashed_var(--border)] pb-[25px] mb-[25px] [&_>_span:first-child]:text-[11px] [&_>_span:first-child]:text-muted-foreground [&_>_span:first-child]:block [&_>_strong]:block [&_>_strong]:text-[35px] [&_>_strong]:leading-[1.3] [&_>_strong]:[margin-block:4px_12px] [&_>_strong]:tracking-[-0.04em]">
            <span>Número da reserva</span>
            <strong>#{item.id}</strong>
            <span className="inline-flex items-center gap-[5px] text-positive bg-[#eaf5ee] rounded-[4px] [padding:5px_9px] text-[9px]">
              <Check size={14} aria-hidden="true" />
              Confirmada · simulação
            </span>
          </div>
          <div className="[&_h2]:flex [&_h2]:items-center [&_h2]:gap-[9px] [&_h2]:text-[15px] [&_h2]:mb-[15px] [&_>_strong]:text-[13px] [&_>_p]:text-[11px] [&_>_p]:text-muted-foreground [&_>_p]:[margin:5px_0] [&_>_p]:[overflow-wrap:anywhere]">
            <h2>
              <UserRound size={20} aria-hidden="true" />
              Titular da reserva
            </h2>
            <strong>{item.guests[0].name}</strong>
            <p>{item.guests[0].email}</p>
            <p>{item.guests[0].phone}</p>
            {!!item.checkout?.companions.length && (
              <div className="mt-4 text-sm">
                <h3 className="font-semibold">Demais hóspedes</h3>
                <ul className="mt-1 space-y-1">
                  {item.checkout.companions.map((name, index) => (
                    <li key={index}>{name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="[&_h2]:flex [&_h2]:items-center [&_h2]:gap-[9px] [&_h2]:text-[15px] [&_h2]:mb-[15px] [&_>_p]:text-[11px] [&_>_p]:text-muted-foreground [&_>_p]:[margin:5px_0] [&_>_p]:[overflow-wrap:anywhere] my-7">
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
          <div className="bg-secondary border border-[#dce5fa] rounded-[7px] p-4.5 [&_strong]:block [&_strong]:text-[11px] [&_strong]:mb-1.5 [&_p]:text-[11px] [&_p]:text-muted-foreground [&_p]:leading-[1.8] [&_p]:mb-0">
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
        <StaySummary
          stay={{ ...item.snapshot, ...item }}
          pricing={item.checkout?.pricing}
        />
      </div>
    </>
  );
}
