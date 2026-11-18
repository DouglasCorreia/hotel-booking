import { z } from "zod";
import { couponSchema, fullNameSchema, guestSchema } from "./model";

export const approvedCard = "4242424242424242";
export const declinedCard = "4000000000000002";

export function maskPhone(value: string) {
  const input = value.trimStart();
  const digits = input.replace(/\D/g, "");
  const international =
    input.startsWith("+") || (input.startsWith("55") && digits.length >= 12);

  if (international && !digits.startsWith("55")) {
    return `+${digits.slice(0, 13)}`;
  }

  const local = (international ? digits.slice(2) : digits).slice(0, 11);
  const country = international ? "+55" : "";
  if (!local) return country;

  const area = local.slice(0, 2);
  const number = local.slice(2);
  const split = number.length === 9 ? 5 : 4;
  const subscriber =
    number.length > split
      ? `${number.slice(0, split)}-${number.slice(split)}`
      : number;
  const formatted = number ? `(${area}) ${subscriber}` : `(${area}`;
  return country ? `${country} ${formatted}` : formatted;
}

export function maskCpf(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3}\.\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3}\.\d{3}\.\d{3})(\d)/, "$1-$2");
}

export const cpfSchema = z.string().refine((value) => {
  const digits = value.replace(/[.-]/g, "");
  if (!/^\d{11}$/.test(digits) || /^(\d)\1+$/.test(digits)) return false;
  return [9, 10].every((length) => {
    const sum = [...digits.slice(0, length)].reduce(
      (total, digit, index) => total + Number(digit) * (length + 1 - index),
      0
    );
    return ((sum * 10) % 11) % 10 === Number(digits[length]);
  });
}, "Informe um CPF válido.");

export const guestsStepSchema = z.object({
  guest: guestSchema.extend({
    phone: guestSchema.shape.phone.refine((value) => {
      if (!value.startsWith("+")) return true;
      return /^55[1-9]{2}\d{8,9}$/.test(value.replace(/\D/g, ""));
    }, "Informe um telefone com DDD (10 ou 11 dígitos)."),
  }),
  cpf: cpfSchema,
  companions: z.array(fullNameSchema),
});
export type GuestsStep = z.infer<typeof guestsStepSchema>;

export function paymentSchema(now = new Date()) {
  return z.object({
    number: z.string().refine((value) => {
      const digits = value.replace(/ /g, "");
      if (!/^\d{16}$/.test(digits)) return false;
      const sum = [...digits].reduce((total, digit, index) => {
        const weighted = Number(digit) * (index % 2 === 0 ? 2 : 1);
        return total + (weighted > 9 ? weighted - 9 : weighted);
      }, 0);
      return sum % 10 === 0;
    }, "Informe um número de cartão de teste válido."),
    expiry: z.string().refine((value) => {
      const parts = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
      if (!parts) return false;
      const month = Number(parts[1]);
      const year = 2000 + Number(parts[2]);
      return year * 12 + month >= now.getFullYear() * 12 + now.getMonth() + 1;
    }, "Informe uma validade atual ou futura (MM/AA)."),
    code: z.string().regex(/^\d{3}$/, "Informe três dígitos."),
  });
}
export type PaymentFields = z.infer<ReturnType<typeof paymentSchema>>;

export const draftSchema = z.object({
  guest: z.object({ name: z.string(), email: z.string(), phone: z.string() }),
  companions: z.array(z.string()),
  coupon: couponSchema,
  step: z.enum(["guests", "payment", "review"]),
});
export type CheckoutDraft = z.infer<typeof draftSchema>;

export const checkoutSubmissionSchema = z.object({
  guest: guestSchema,
  companions: z.array(fullNameSchema),
  coupon: couponSchema,
  termsAccepted: z.literal(true),
});
export type CheckoutSubmission = Omit<
  z.input<typeof checkoutSubmissionSchema>,
  "termsAccepted"
> & {
  termsAccepted: boolean;
};
