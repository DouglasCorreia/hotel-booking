import { z } from "zod";
import { request } from "@/lib/api/client";
import { hotelSchema, roomSchema, suggestionSchema } from "./model";
import type { Search, Filters } from "@/features/search/model";

export const getSuggestions = async (text: string, signal?: AbortSignal) =>
  (
    await request(
      `/suggestions?q=${encodeURIComponent(text)}`,
      z.array(suggestionSchema),
      { signal },
    )
  ).data;
export const getHotel = async (id: number, signal?: AbortSignal) =>
  (await request(`/hotels/${id}`, hotelSchema, { signal })).data;
export const getRoom = async (id: number, signal?: AbortSignal) =>
  (await request(`/rooms/${id}`, roomSchema, { signal })).data;
export const getRooms = async (hotelId: number, signal?: AbortSignal) =>
  (await request(`/rooms?hotelId=${hotelId}`, z.array(roomSchema), { signal }))
    .data;
export async function getHotels(
  search: Search,
  filters: Filters,
  signal?: AbortSignal,
) {
  const sorts = {
    "price-asc": ["pricePerNight", "asc"],
    "price-desc": ["pricePerNight", "desc"],
    rating: ["rating", "desc"],
    popular: ["reviewCount", "desc"],
  };
  const [sort, order] = sorts[filters.sort];
  const params = new URLSearchParams({
    destination: search.destination,
    _sort: sort,
    _order: order,
    _page: String(filters.page),
    _limit: "10",
  });
  if (filters.minPrice !== undefined)
    params.set("pricePerNight_gte", String(filters.minPrice));
  if (filters.maxPrice !== undefined)
    params.set("pricePerNight_lte", String(filters.maxPrice));
  if (filters.rating !== undefined)
    params.set("rating_gte", String(filters.rating));
  return request(`/hotels?${params}`, z.array(hotelSchema), { signal });
}
export const getFeaturedHotels = async (signal?: AbortSignal) =>
  (
    await request("/hotels?featured=true&_limit=4", z.array(hotelSchema), {
      signal,
    })
  ).data;
