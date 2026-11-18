import { z } from "zod";
import {
  calendarDate,
  searchSchema,
  type Search,
} from "@/features/search/model";

export function nightsBetween(checkIn: string, checkOut: string) {
  return (Date.parse(checkOut) - Date.parse(checkIn)) / 86400000;
}
export function calculateTotal(price: number, nights: number, rooms: number) {
  return (Math.round(price * 100) * nights * rooms) / 100;
}

export function selectionProblem(
  room: { hotelId: number; available: number; maxGuests: number },
  hotelId: number,
  search: Search
): string | null {
  if (!searchSchema.safeParse(search).success)
    return "Revise as datas e a ocupação da sua busca.";
  if (room.hotelId !== hotelId)
    return "Este quarto não pertence ao hotel selecionado.";
  if (room.available < search.rooms)
    return "Não há quartos suficientes deste tipo. Escolha outra acomodação.";
  if (search.adults + search.children > room.maxGuests * search.rooms)
    return "A capacidade deste tipo de quarto não atende a todos os hóspedes.";
  return null;
}

export const fullNameSchema = z
  .string()
  .trim()
  .min(3, "Informe seu nome completo.")
  .refine((name) => name.split(/\s+/).length >= 2, "Informe nome e sobrenome.");

export const guestSchema = z.object({
  name: fullNameSchema,
  email: z.email("Informe um e-mail válido."),
  phone: z.string().refine((value) => {
    const digits = value.replace(/\D/g, "");
    return (
      /^(?:\+?[\d\s().-]+)$/.test(value) &&
      (/^[1-9]{2}\d{8,9}$/.test(digits) || /^55[1-9]{2}\d{8,9}$/.test(digits))
    );
  }, "Informe um telefone com DDD (10 ou 11 dígitos)."),
});
export type Guest = z.infer<typeof guestSchema>;

export const couponCode = "LUMINA10";
export const couponSchema = z.literal(couponCode).nullable();

const priceLine = z.number().nonnegative();
const priceBreakdownSchema = z.object({
  subtotal: priceLine,
  coupon: couponSchema,
  discount: priceLine,
  serviceFee: priceLine,
  tax: priceLine,
  total: priceLine,
});
export type PriceBreakdown = z.infer<typeof priceBreakdownSchema>;

export function priceBreakdown(
  price: number,
  nights: number,
  rooms: number,
  coupon: PriceBreakdown["coupon"]
): PriceBreakdown {
  const subtotal = Math.round(price * 100) * nights * rooms;
  const discount = coupon ? Math.round((subtotal * 10) / 100) : 0;
  const base = subtotal - discount;
  const serviceFee = Math.round((base * 5) / 100);
  const tax = Math.round((base * 3) / 100);
  return {
    subtotal: subtotal / 100,
    coupon,
    discount: discount / 100,
    serviceFee: serviceFee / 100,
    tax: tax / 100,
    total: (base + serviceFee + tax) / 100,
  };
}

export const termsVersion = "1";
export const selectionSchema = z.object({
  hotelId: z.number().int().positive(),
  roomId: z.number().int().positive(),
  search: searchSchema,
  pricePerNight: z.number().nonnegative(),
});
export type Selection = z.infer<typeof selectionSchema>;

export const snapshotSchema = z.object({
  hotelName: z.string(),
  hotelImage: z.string(),
  hotelAddress: z.string(),
  roomName: z.string(),
  pricePerNight: z.number().nonnegative(),
  cancellationPolicy: z.string(),
  checkInTime: z.string(),
  checkOutTime: z.string(),
});
export const bookingSchema = z
  .object({
    id: z.union([z.number(), z.string()]),
    hotelId: z.number(),
    roomId: z.number(),
    checkIn: calendarDate,
    checkOut: calendarDate,
    rooms: z.number().int().positive(),
    adults: z.number().int().positive(),
    children: z.number().int().nonnegative(),
    guests: z.array(guestSchema).min(1),
    totalPrice: z.number().nonnegative(),
    createdAt: z.string(),
    snapshot: snapshotSchema,
    checkout: z
      .object({
        companions: z.array(fullNameSchema),
        pricing: priceBreakdownSchema,
        terms: z.object({
          version: z.string().min(1),
          acceptedAt: z.iso.datetime(),
        }),
      })
      .optional(),
  })
  .refine(
    (booking) => {
      const nights = nightsBetween(booking.checkIn, booking.checkOut);
      return nights >= 1 && nights <= 30;
    },
    { message: "A reserva contém um período inválido.", path: ["checkOut"] }
  )
  .refine(
    ({ checkout, adults, children, totalPrice }) =>
      !checkout ||
      (checkout.companions.length === adults + children - 1 &&
        checkout.pricing.total === totalPrice),
    { message: "O resumo da reserva é inconsistente.", path: ["checkout"] }
  );
export type Booking = z.infer<typeof bookingSchema>;
export type BookingInput = Omit<Booking, "id">;
