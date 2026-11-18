import { z } from "zod";
import { request } from "@/lib/api/client";
import { hotelSchema, roomSchema, suggestionSchema } from "./model";
import {
  filterSchema,
  type Search,
  type Filters,
} from "@/features/search/model";

export const getSuggestions = async (text: string, signal?: AbortSignal) =>
  (
    await request(
      `/suggestions?q=${encodeURIComponent(text)}`,
      z.array(suggestionSchema),
      { signal }
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
  signal?: AbortSignal
) {
  filters = filterSchema.parse(filters);
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
  for (const type of filters.propertyTypes) params.append("propertyType", type);
  if (filters.amenities.length) {
    // json-server matches the comma-separated array. Each lookahead requires an
    // exact token; values come exclusively from the validated closed allowlist.
    params.set(
      "amenities_like",
      `^${filters.amenities.map((value) => `(?=(?:[^,]+,)*${value}(?:,|$))`).join("")}`
    );
  }
  return request(`/hotels?${params}`, z.array(hotelSchema), { signal });
}

// The demonstrative catalog has 60 hotels. A separate cached query keeps the
// destination scale independent of filters, pagination and result failures.
export const getHotelFilterOptions = async (signal?: AbortSignal) =>
  (await request("/hotels", z.array(hotelSchema), { signal })).data;
export const getFeaturedHotels = async (signal?: AbortSignal) =>
  (
    await request("/hotels?featured=true&_limit=4", z.array(hotelSchema), {
      signal,
    })
  ).data;
