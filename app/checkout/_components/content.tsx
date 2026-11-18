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
      <Link
        className="inline-flex items-center gap-[7px] text-[11px] text-muted-foreground mb-[25px] [&:hover]:text-primary"
        href={back}
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Voltar para os quartos
      </Link>
      <ol
        className="flex gap-7.5 p-0 [list-style:none] text-[10px] text-muted-foreground [margin:5px_0_5px] [&_li]:flex [&_li]:gap-2 [&_li]:items-center [&_li_>_span]:w-[23px] [&_li_>_span]:h-[23px] [&_li_>_span]:p-1 [&_li_>_span]:rounded-[50%] [&_li_>_span]:bg-[#e9edf5] [&_li_>_span]:text-center [&_li_>_span]:leading-[15px] [&_li_>_svg]:w-[23px] [&_li_>_svg]:h-[23px] [&_li_>_svg]:p-1 [&_li_>_svg]:rounded-[50%] [&_li_>_svg]:bg-[#e9edf5] [&_li_>_svg]:text-center [&_li_>_svg]:leading-[15px] [&_.completed_>_svg]:bg-foreground [&_.completed_>_svg]:text-white [&_.current]:text-primary [&_.current]:font-[650] [&_.current_>_span]:bg-primary [&_.current_>_span]:text-white max-[760.01px]:gap-5 max-[760.01px]:text-[9px]"
        aria-label="Etapas da reserva"
      >
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
      <div className="[padding-block:38px_30px] [&_h1]:mb-2.5 [&_>_p:last-child]:mb-0 [&_>_div_>_p:last-child]:mb-0 max-[760.01px]:[padding-block:30px_25px] max-[760.01px]:[&_h1]:text-[33px] max-[760.01px]:[&_>_.muted]:text-[12px]">
        <p className="eyebrow text-primary text-[11px] font-[650] tracking-[0.1em] uppercase mb-3">
          Falta pouco
        </p>
        <h1>
          Sua próxima pausa
          <br />
          está quase aqui.
        </h1>
        <p className="muted text-muted-foreground">
          Confira sua estadia e informe os dados do titular.
        </p>
      </div>
      <div className="grid grid-cols-[minmax(0,_1fr)_400px] gap-[45px] items-start max-[1200.01px]:grid-cols-[minmax(0,_1fr)_360px] max-[1200.01px]:gap-7 max-[1000.01px]:grid-cols-[minmax(0,_1fr)_320px] max-[1000.01px]:gap-5.5 max-[760.01px]:grid-cols-[1fr] max-[760.01px]:gap-[25px] max-[760.01px]:[&_>_.stay-summary]:row-[1] max-[760.01px]:[&_.stay-summary_>_.photo]:h-[150px]">
        <section className="bg-white border border-border rounded-[10px] p-[35px] [&_>_h2]:flex [&_>_h2]:items-center [&_>_h2]:gap-3 [&_>_h2]:text-[20px] [&_>_h2_svg]:text-primary [&_>_p]:text-[12px] [&_>_p]:mb-7.5 [&_label]:text-[12px] [&_input]:bg-background [&_input]:h-[46px] [&_input]:px-3.5 [&_input]:text-[13px] [&_form]:mt-[25px] [&_[role=alert]]:my-[15px] max-[1000.01px]:p-[25px] max-[1000.01px]:[&_>_h2]:text-[17px] max-[760.01px]:p-5.5">
          <h2>
            <UserRound size={21} aria-hidden="true" />
            Quem vai fazer o check-in?
          </h2>
          <p className="muted text-muted-foreground">
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
              <div className="bg-secondary border border-[#dce5fa] rounded-[7px] p-4.5 [&_strong]:block [&_strong]:text-[11px] [&_strong]:mb-1.5 [&_p]:text-[11px] [&_p]:text-muted-foreground [&_p]:leading-[1.8] [&_p]:mb-0">
                <strong>Uma experiência de demonstração</strong>
                <p>
                  Esta reserva é simulada. Não haverá cobrança, bloqueio real de
                  acomodação ou envio de e-mail.
                </p>
              </div>
              <Button
                className="w-full h-12 text-[12px]"
                type="submit"
                disabled={
                  checkout.mutation.isPending ||
                  !!checkout.problem ||
                  checkout.priceChanged
                }
              >
                {checkout.mutation.isPending ? (
                  <>
                    <LoaderCircle className="animate-spin" aria-hidden="true" />
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
