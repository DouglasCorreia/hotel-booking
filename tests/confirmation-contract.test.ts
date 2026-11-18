import { describe, expect, it } from "vitest";
import { bookingSchema } from "@/features/booking/model";

const reservation = {
  id: 1,
  hotelId: 1,
  roomId: 1,
  checkIn: "2000-01-01",
  checkOut: "2000-01-04",
  rooms: 1,
  adults: 2,
  children: 0,
  guests: [
    { name: "Maria Silva", email: "maria@example.com", phone: "11999991234" },
  ],
  totalPrice: 600,
  createdAt: "1999-12-01T12:00:00Z",
  snapshot: {
    hotelName: "Hotel",
    hotelImage: "",
    hotelAddress: "Endereço",
    roomName: "Quarto",
    pricePerNight: 200,
    cancellationPolicy: "Cancelamento gratuito",
    checkInTime: "15:00",
    checkOutTime: "12:00",
  },
};
describe("contrato da confirmação", () => {
  it("mantém reservas passadas consultáveis", () => {
    expect(bookingSchema.safeParse(reservation).success).toBe(true);
  });
  it.each([
    { checkIn: "" },
    { checkIn: "não é uma data" },
    { checkIn: "2000-02-30" },
    { checkOut: "1999-12-31" },
    { checkOut: "2000-01-01" },
    { checkOut: "2000-02-01" },
  ])(
    "recusa datas ou duração inválidas antes de exibir a reserva: %o",
    (changes) => {
      expect(
        bookingSchema.safeParse({ ...reservation, ...changes }).success,
      ).toBe(false);
    },
  );
});
