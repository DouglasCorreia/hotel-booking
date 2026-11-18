import { describe, expect, it } from "vitest";
import { couponCode, priceBreakdown } from "@/features/booking/model";
import {
  cpfSchema,
  paymentSchema,
  approvedCard,
  declinedCard,
  guestsStepSchema,
  maskPhone,
} from "@/features/booking/checkout-model";

describe("regras da demonstração", () => {
  it.each([
    ["11", "(11"],
    ["1132345678", "(11) 3234-5678"],
    ["11999991234", "(11) 99999-1234"],
    ["+55 11 99999 1234", "+55 (11) 99999-1234"],
    ["5511999991234", "+55 (11) 99999-1234"],
    ["(55) 99999-12345", "(55) 99999-1234"],
  ])("formata o telefone %s como %s", (input, formatted) => {
    expect(maskPhone(input)).toBe(formatted);
  });

  it("rejeita telefone incompleto com código de país no checkout", () => {
    const schema = guestsStepSchema.shape.guest.shape.phone;
    expect(schema.safeParse("+55 (11) 99999-12").success).toBe(false);
    expect(schema.safeParse("+55 (11) 99999-1234").success).toBe(true);
  });
  it("calcula desconto primeiro e arredonda cada encargo em centavos", () => {
    expect(priceBreakdown(200, 3, 1, couponCode)).toEqual({
      subtotal: 600,
      coupon: couponCode,
      discount: 60,
      serviceFee: 27,
      tax: 16.2,
      total: 583.2,
    });
    expect(priceBreakdown(10.1, 1, 1, null)).toEqual({
      subtotal: 10.1,
      coupon: null,
      discount: 0,
      serviceFee: 0.51,
      tax: 0.3,
      total: 10.91,
    });
  });

  it("valida os dígitos do CPF e rejeita sequências repetidas", () => {
    expect(cpfSchema.safeParse("529.982.247-25").success).toBe(true);
    expect(cpfSchema.safeParse("529.982.247-24").success).toBe(false);
    expect(cpfSchema.safeParse("111.111.111-11").success).toBe(false);
  });

  it("valida Luhn, validade até o fim do mês e código de segurança", () => {
    const schema = paymentSchema(new Date(2026, 10, 30, 23, 59));
    const valid = { number: approvedCard, expiry: "11/26", code: "123" };
    expect(schema.safeParse(valid).success).toBe(true);
    expect(schema.safeParse({ ...valid, number: declinedCard }).success).toBe(
      true
    );
    expect(
      schema.safeParse({ ...valid, number: "4242424242424241" }).success
    ).toBe(false);
    expect(schema.safeParse({ ...valid, expiry: "10/26" }).success).toBe(false);
    expect(schema.safeParse({ ...valid, code: "12" }).success).toBe(false);
  });
});
