"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, LoaderCircle, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { LoadingCards, Feedback, QueryError } from "@/components/feedback";
import { StaySummary } from "@/components/stay-summary";
import { guestSchema, type Guest } from "@/features/booking/model";
import { useCheckout } from "@/features/booking/use-checkout";
import { searchParamsFor } from "@/features/search/model";
import { cancellationLabels } from "@/features/hotels/model";

export function CheckoutContent() {
  const checkout = useCheckout();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Guest>({
    resolver: zodResolver(guestSchema),
    defaultValues: { name: "", email: "", phone: "" },
  });
  if (!checkout.isReady || (checkout.selection && checkout.query.isPending))
    return <LoadingCards count={2} />;
  if (!checkout.selection)
    return (
      <Feedback title="Escolha sua acomodação">
        Você será levado à busca para selecionar um quarto.
      </Feedback>
    );
  const back = `/hotel/${checkout.selection.hotelId}?${searchParamsFor(checkout.selection.search)}`;
  if (checkout.query.isError)
    return (
      <QueryError
        error={checkout.query.error}
        onRetry={() => checkout.query.refetch()}
        title="Não foi possível verificar sua seleção"
      />
    );
  if (!checkout.query.data) return <LoadingCards count={2} />;
  const { hotel, room } = checkout.query.data;
  return (
    <>
      <Link className="back-link" href={back}>
        <ArrowLeft size={15} aria-hidden="true" />
        Voltar para os quartos
      </Link>
      <ol className="booking-steps" aria-label="Etapas da reserva">
        <li className="completed">
          <Check size={13} aria-hidden="true" />
          Escolha
        </li>
        <li className="current" aria-current="step">
          <span>2</span>Seus dados
        </li>
        <li>
          <span>3</span>Confirmação
        </li>
      </ol>
      <div className="page-heading">
        <p className="eyebrow">Falta pouco</p>
        <h1>
          Sua próxima pausa
          <br />
          está quase aqui.
        </h1>
        <p className="muted">
          Confira sua estadia e informe os dados do titular.
        </p>
      </div>
      <div className="checkout-layout">
        <section className="checkout-form-panel">
          <h2>
            <UserRound size={21} aria-hidden="true" />
            Quem vai fazer o check-in?
          </h2>
          <p className="muted">
            Precisamos apenas dos dados do titular da reserva.
          </p>
          {checkout.problem && (
            <Feedback
              title="Sua seleção precisa ser atualizada"
              href={back}
              linkLabel="Escolher outro quarto"
            >
              {checkout.problem}
            </Feedback>
          )}
          {checkout.priceChanged && (
            <Alert>
              <AlertTitle>O preço desta acomodação mudou</AlertTitle>
              <AlertDescription>
                <p>
                  O resumo já apresenta o novo total. Aceite a atualização para
                  continuar.
                </p>
                <Button type="button" onClick={checkout.acceptPrice}>
                  Aceitar novo preço
                </Button>
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit(checkout.submit)} noValidate>
            <FieldGroup>
              {(
                [
                  [
                    "name",
                    "Nome completo",
                    "text",
                    "name",
                    "Como consta no seu documento",
                  ],
                  ["email", "E-mail", "email", "email", "voce@exemplo.com"],
                  ["phone", "Telefone", "tel", "tel", "(11) 99999-9999"],
                ] as const
              ).map(([name, label, type, autoComplete, placeholder]) => (
                <Field key={name} data-invalid={!!errors[name]}>
                  <FieldLabel htmlFor={name}>{label}</FieldLabel>
                  <Input
                    id={name}
                    type={type}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    {...register(name)}
                    aria-invalid={!!errors[name]}
                    aria-describedby={
                      errors[name] ? `${name}-error` : undefined
                    }
                    disabled={checkout.mutation.isPending}
                  />
                  {errors[name] && (
                    <FieldError id={`${name}-error`}>
                      {errors[name].message}
                    </FieldError>
                  )}
                </Field>
              ))}
              {checkout.issue && (
                <Alert variant="destructive" role="alert">
                  <AlertTitle>
                    {checkout.issue.uncertain
                      ? "O resultado do envio não pôde ser confirmado"
                      : "Não foi possível concluir"}
                  </AlertTitle>
                  <AlertDescription>
                    {checkout.issue.message}
                    {checkout.issue.uncertain && (
                      <p>
                        A reserva pode ter sido criada. Uma nova tentativa pode
                        gerar duplicidade.
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              <div className="demo-notice">
                <strong>Uma experiência de demonstração</strong>
                <p>
                  Esta reserva é simulada. Não haverá cobrança, bloqueio real de
                  acomodação ou envio de e-mail.
                </p>
              </div>
              <Button
                className="checkout-submit"
                type="submit"
                disabled={
                  checkout.mutation.isPending ||
                  !!checkout.problem ||
                  checkout.priceChanged
                }
              >
                {checkout.mutation.isPending ? (
                  <>
                    <LoaderCircle className="spin" aria-hidden="true" />
                    Confirmando…
                  </>
                ) : (
                  "Confirmar reserva simulada"
                )}
              </Button>
            </FieldGroup>
          </form>
        </section>
        <StaySummary
          stay={{
            hotelName: hotel.name,
            hotelImage: hotel.thumbnail,
            hotelAddress: hotel.address,
            roomName: room.name,
            pricePerNight: room.pricePerNight,
            cancellationPolicy: cancellationLabels[hotel.cancellationPolicy],
            ...checkout.selection.search,
          }}
        />
      </div>
    </>
  );
}
