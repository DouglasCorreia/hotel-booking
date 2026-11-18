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
  search: Search,
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

export const guestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Informe seu nome completo.")
    .refine(
      (name) => name.split(/\s+/).length >= 2,
      "Informe nome e sobrenome.",
    ),
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
  })
  .refine(
    (booking) => {
      const nights = nightsBetween(booking.checkIn, booking.checkOut);
      return nights >= 1 && nights <= 30;
    },
    { message: "A reserva contém um período inválido.", path: ["checkOut"] },
  );
export type Booking = z.infer<typeof bookingSchema>;
export type BookingInput = Omit<Booking, "id">;
