import { useId, type ComponentProps } from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { UseFormReturn } from "react-hook-form";
import {
  approvedCard,
  declinedCard,
  maskCpf,
  maskPhone,
  type GuestsStep,
  type PaymentFields,
} from "@/features/booking/checkout-model";

export function CheckoutField({
  label,
  description,
  error,
  "aria-describedby": describedBy,
  ...props
}: ComponentProps<typeof Input> & {
  /** Rótulo visível ligado ao campo pelo identificador gerado. */
  label: string;
  /** Dica opcional associada ao campo junto aos demais IDs de `aria-describedby`. */
  description?: string;
  /** Mensagem que marca o campo como inválido e entra na descrição acessível. */
  error?: string;
}) {
  const id = useId();
  const descriptionIds = [
    describedBy,
    description && `${id}-description`,
    error && `${id}-error`,
  ].filter(Boolean);
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        {...props}
        id={id}
        aria-invalid={!!error}
        aria-describedby={descriptionIds.join(" ") || undefined}
      />
      {description && (
        <FieldDescription id={`${id}-description`}>
          {description}
        </FieldDescription>
      )}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  );
}

export function GuestFields({
  form,
  adults,
  childCount,
}: {
  /** Formulário da etapa de hóspedes. O titular ocupa a primeira vaga adulta. */
  form: UseFormReturn<GuestsStep>;
  /** Total de adultos da seleção, incluindo o titular. */
  adults: number;
  /** Total de crianças da seleção, usado para montar os campos de acompanhantes. */
  childCount: number;
}) {
  const {
    register,
    setValue,
    formState: { errors },
  } = form;
  return (
    <>
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 font-semibold">
          Titular da reserva · Adulto 1
        </legend>
        <CheckoutField
          label="Nome completo"
          autoComplete="off"
          error={errors.guest?.name?.message}
          {...register("guest.name")}
        />
        <CheckoutField
          label="E-mail"
          autoComplete="off"
          type="email"
          error={errors.guest?.email?.message}
          {...register("guest.email")}
        />
        <CheckoutField
          label="Telefone"
          description="Informe o DDD. O código do país (+55) é opcional."
          autoComplete="off"
          type="tel"
          placeholder="(11) 99999-9999"
          error={errors.guest?.phone?.message}
          {...register("guest.phone")}
          onChange={(event) =>
            setValue("guest.phone", maskPhone(event.target.value), {
              shouldDirty: true,
              shouldValidate: !!errors.guest?.phone,
            })
          }
        />
        <CheckoutField
          label="CPF"
          inputMode="numeric"
          autoComplete="off"
          placeholder="000.000.000-00"
          error={errors.cpf?.message}
          {...register("cpf")}
          onChange={(event) =>
            setValue("cpf", maskCpf(event.target.value), {
              shouldDirty: true,
              shouldValidate: !!errors.cpf,
            })
          }
        />
      </fieldset>
      {adults + childCount > 1 && (
        <fieldset className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
          <legend className="pe-3 font-semibold">Demais hóspedes</legend>
          {Array.from({ length: adults + childCount - 1 }, (_, index) => (
            <CheckoutField
              key={index}
              label={
                index < adults - 1
                  ? `Nome do adulto ${index + 2}`
                  : `Nome da criança ${index - adults + 2}`
              }
              error={errors.companions?.[index]?.message}
              {...register(`companions.${index}`)}
            />
          ))}
        </fieldset>
      )}
    </>
  );
}

export function PaymentFieldsForm({
  form,
}: {
  /** Formulário dos dados de cartão fictício mantidos em memória durante o checkout. */
  form: UseFormReturn<PaymentFields>;
}) {
  const {
    register,
    setValue,
    formState: { errors },
  } = form;
  return (
    <>
      <div className="rounded-md bg-secondary p-4 text-sm leading-relaxed">
        <p className="font-semibold">Use um dos cartões de teste</p>
        <p>
          Aprovação: <code>{approvedCard.replace(/.{4}(?=.)/g, "$& ")}</code>
        </p>
        <p>
          Recusa: <code>{declinedCard.replace(/.{4}(?=.)/g, "$& ")}</code>
        </p>
        <p className="mt-1 text-muted-foreground">
          Informe o mês atual ou uma data futura e qualquer código de três
          dígitos.
        </p>
      </div>
      <CheckoutField
        label="Número do cartão de teste"
        inputMode="numeric"
        autoComplete="off"
        error={errors.number?.message}
        {...register("number")}
      />
      <div className="grid grid-cols-2 gap-4">
        <CheckoutField
          label="Validade"
          inputMode="numeric"
          placeholder="MM/AA"
          autoComplete="off"
          error={errors.expiry?.message}
          {...register("expiry")}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
            const value =
              digits.length > 2
                ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                : digits;
            setValue("expiry", value, {
              shouldDirty: true,
              shouldValidate: !!errors.expiry,
            });
          }}
        />
        <CheckoutField
          label="Código de segurança"
          inputMode="numeric"
          autoComplete="off"
          placeholder="123"
          error={errors.code?.message}
          {...register("code")}
        />
      </div>
    </>
  );
}
