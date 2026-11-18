"use client";

import Link from "next/link";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingCards, Feedback, QueryError } from "@/components/feedback";
import { StaySummary } from "@/components/stay-summary";
import { cancellationLabels } from "@/features/hotels/model";
import { searchParamsFor } from "@/features/search/model";
import { useCheckout } from "@/features/booking/use-checkout";
import { useBookingStore } from "@/features/booking/store";
import {
  approvedCard,
  declinedCard,
  guestsStepSchema,
  maskPhone,
  paymentSchema,
  type CheckoutDraft,
  type GuestsStep,
  type PaymentFields,
} from "@/features/booking/checkout-model";
import {
  couponCode,
  nightsBetween,
  priceBreakdown,
  type Selection,
} from "@/features/booking/model";
import { CheckoutField, GuestFields, PaymentFieldsForm } from "./fields";
import { Terms } from "./terms";

const steps = [
  { id: "guests", label: "Hóspedes" },
  { id: "payment", label: "Pagamento simulado" },
  { id: "review", label: "Revisão e confirmação" },
] as const;

export function CheckoutContent() {
  const checkout = useCheckout();
  const { selection, query } = checkout;
  if (
    !checkout.isReady ||
    (selection && query.isPending) ||
    checkout.mutation.isSuccess
  )
    return <LoadingCards count={2} />;
  if (!selection)
    return (
      <Feedback title="Escolha sua acomodação">
        Você será levado à busca para selecionar um quarto.
      </Feedback>
    );
  if (!query.data && query.error)
    return (
      <QueryError
        error={query.error}
        onRetry={() => query.refetch()}
        title="Não foi possível verificar sua seleção"
      />
    );
  if (!query.data) return <LoadingCards count={2} />;

  const key = `${selection.hotelId}:${selection.roomId}:${searchParamsFor(selection.search)}`;
  return (
    <CheckoutWizard
      key={key}
      checkout={checkout}
      selection={selection}
      details={query.data}
    />
  );
}

function CheckoutWizard({
  checkout,
  selection,
  details,
}: {
  checkout: ReturnType<typeof useCheckout>;
  selection: Selection;
  details: NonNullable<ReturnType<typeof useCheckout>["query"]["data"]>;
}) {
  const [draft] = useState(() => useBookingStore.getState().draft);
  // Each new mount needs the CPF again, even when the saved step was later.
  const [step, setStep] = useState<CheckoutDraft["step"]>("guests");
  const [coupon, setCoupon] = useState(draft?.coupon ?? null);
  const [couponEntry, setCouponEntry] = useState("");
  const [couponError, setCouponError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const { adults, children } = selection.search;
  const guests = useForm<GuestsStep>({
    resolver: zodResolver(guestsStepSchema),
    defaultValues: {
      guest: {
        name: draft?.guest.name ?? "",
        email: draft?.guest.email ?? "",
        phone: maskPhone(draft?.guest.phone ?? ""),
      },
      companions:
        draft?.companions ??
        Array.from({ length: adults + children - 1 }, () => ""),
      cpf: "",
    },
  });
  const payment = useForm<PaymentFields>({
    resolver: zodResolver(paymentSchema()),
    defaultValues: { number: "", expiry: "", code: "" },
  });
  const { getValues, subscribe } = guests;
  useEffect(() => {
    function save() {
      const { guest, companions } = getValues();
      useBookingStore.getState().saveDraft({ guest, companions, coupon, step });
    }
    save();
    return subscribe({ formState: { values: true }, callback: save });
  }, [coupon, getValues, step, subscribe]);
  useEffect(() => {
    heading.current?.focus();
  }, [step]);

  const { hotel, room } = details;
  const policy = cancellationLabels[hotel.cancellationPolicy];
  const pricing = priceBreakdown(
    room.pricePerNight,
    nightsBetween(selection.search.checkIn, selection.search.checkOut),
    selection.search.rooms,
    coupon
  );
  const back = `/hotel/${selection.hotelId}?${searchParamsFor(selection.search)}`;
  const activeStep = steps.findIndex(({ id }) => id === step);
  const pending = checkout.mutation.isPending;

  function simulate(fields: PaymentFields) {
    const number = fields.number.replace(/ /g, "");
    if (number === declinedCard) {
      payment.setError("root", {
        message:
          "Pagamento simulado recusado. Use o cartão de aprovação para continuar.",
      });
    } else if (number !== approvedCard) {
      payment.setError(
        "number",
        { message: "Use um dos números de teste exibidos.", type: "validate" },
        { shouldFocus: true }
      );
    } else {
      setTermsAccepted(false);
      setStep("review");
    }
  }

  function applyCoupon() {
    if (couponEntry.trim().toUpperCase() !== couponCode) {
      setCouponError("Cupom inválido. Confira o código e tente novamente.");
      return;
    }
    if (coupon !== couponCode) setTermsAccepted(false);
    setCoupon(couponCode);
    setCouponEntry("");
    setCouponError("");
  }

  function removeCoupon() {
    setCoupon(null);
    setCouponError("");
    setTermsAccepted(false);
  }

  function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!termsAccepted || pending || checkout.priceChanged || checkout.problem)
      return;
    const personal = guestsStepSchema.safeParse(getValues());
    if (!personal.success) {
      setStep("guests");
      return;
    }
    if (!paymentSchema().safeParse(payment.getValues()).success) {
      setStep("payment");
      return;
    }
    return checkout.submit({
      guest: personal.data.guest,
      companions: personal.data.companions,
      coupon,
      termsAccepted,
    });
  }

  return (
    <>
      <Link
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        href={back}
      >
        <ArrowLeft size={15} aria-hidden="true" /> Voltar para os quartos
      </Link>
      <h1 className="mb-3">Finalize sua reserva</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Use apenas dados fictícios. Nenhum valor será cobrado.
      </p>
      <ol
        aria-label="Etapas da reserva"
        className="mb-7 grid list-none grid-cols-3 gap-2 text-xs sm:gap-3 sm:text-sm"
      >
        {steps.map(({ id, label }, index) => (
          <li
            key={id}
            aria-current={step === id ? "step" : undefined}
            className={`flex flex-wrap items-center gap-2 rounded-md border px-2 py-2 sm:px-3 ${step === id ? "border-primary bg-secondary font-semibold text-primary" : "border-border text-muted-foreground"}`}
          >
            <span className="font-semibold">{index + 1}</span> {label}
          </li>
        ))}
      </ol>
      <div className="grid items-start gap-6 min-[900px]:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
        <section className="min-w-0 space-y-5 rounded-xl border border-border bg-white p-5 sm:p-7">
          <h2 ref={heading} tabIndex={-1} className="text-xl">
            {steps[activeStep].label}
          </h2>
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
                  Confira o novo total no resumo e aceite a atualização para
                  continuar.
                </p>
                <Button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setTermsAccepted(false);
                    checkout.acceptPrice();
                  }}
                >
                  Aceitar novo preço
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {step === "guests" && (
            <form
              key="guests"
              noValidate
              className="space-y-6"
              onSubmit={guests.handleSubmit(() => setStep("payment"))}
            >
              <GuestFields
                form={guests}
                adults={adults}
                childCount={children}
              />
              <Button type="submit">Ir para pagamento</Button>
            </form>
          )}
          {step === "payment" && (
            <form
              key="payment"
              noValidate
              className="space-y-4"
              onSubmit={payment.handleSubmit(simulate)}
              onChange={() => payment.clearErrors("root")}
            >
              <PaymentFieldsForm form={payment} />
              {payment.formState.errors.root?.message && (
                <p role="alert" className="text-sm text-destructive">
                  {payment.formState.errors.root.message}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("guests")}
                >
                  Voltar para hóspedes
                </Button>
                <Button type="submit">Simular pagamento</Button>
              </div>
            </form>
          )}
          {step === "review" && (
            <form
              key="review"
              className="space-y-5"
              noValidate
              onSubmit={confirm}
            >
              <div className="space-y-2">
                <p className="font-semibold text-positive">
                  Pagamento simulado aprovado
                </p>
                <h3 className="text-sm font-semibold">Hóspedes da reserva</h3>
                <ul className="space-y-1 break-words text-sm">
                  <li>{getValues("guest.name")} · Titular</li>
                  {getValues("companions").map((name, index) => (
                    <li key={index}>{name}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2 border-y border-border py-4">
                <div className="flex flex-wrap items-start gap-2">
                  <div className="min-w-32 flex-1 text-sm">
                    <CheckoutField
                      label="Código do cupom"
                      error={couponError}
                      value={couponEntry}
                      disabled={pending}
                      onChange={(event) => {
                        setCouponEntry(event.target.value);
                        setCouponError("");
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          applyCoupon();
                        }
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    className="mt-7"
                    variant="outline"
                    disabled={pending}
                    onClick={applyCoupon}
                  >
                    Aplicar cupom
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use LUMINA10 para 10% de desconto na hospedagem.
                </p>
                {coupon && (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span role="status" className="font-semibold text-positive">
                      Cupom {coupon} aplicado
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={pending}
                      onClick={removeCoupon}
                    >
                      Remover cupom
                    </Button>
                  </div>
                )}
              </div>
              <Terms policy={policy} />
              <div className="flex items-center gap-2 text-sm">
                <Checkbox
                  id="checkout-terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) =>
                    setTermsAccepted(checked === true)
                  }
                  disabled={pending || checkout.priceChanged}
                />
                <label htmlFor="checkout-terms">
                  Aceito os termos da reserva
                </label>
              </div>
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
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() => setStep("payment")}
                >
                  Voltar ao pagamento
                </Button>
                <Button
                  type="submit"
                  disabled={
                    pending ||
                    !termsAccepted ||
                    !!checkout.problem ||
                    checkout.priceChanged
                  }
                >
                  {pending ? (
                    <>
                      <LoaderCircle
                        className="animate-spin"
                        aria-hidden="true"
                      />{" "}
                      Confirmando…
                    </>
                  ) : (
                    "Confirmar reserva simulada"
                  )}
                </Button>
              </div>
            </form>
          )}
        </section>
        <StaySummary
          pricing={pricing}
          stay={{
            ...selection.search,
            hotelName: hotel.name,
            hotelImage: hotel.thumbnail,
            hotelAddress: hotel.address,
            roomName: room.name,
            pricePerNight: room.pricePerNight,
            cancellationPolicy: policy,
          }}
        />
      </div>
    </>
  );
}
