import { request } from "@/lib/api/client";
import { bookingSchema, type BookingInput } from "./model";
export const createBooking = async (booking: BookingInput) =>
  (
    await request("/bookings", bookingSchema, {
      method: "POST",
      body: JSON.stringify(booking),
    })
  ).data;
export const getBooking = async (id: string, signal?: AbortSignal) =>
  (
    await request(`/bookings/${encodeURIComponent(id)}`, bookingSchema, {
      signal,
    })
  ).data;
