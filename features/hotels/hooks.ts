"use client";
import { useQuery } from "@tanstack/react-query";
import {
  getFeaturedHotels,
  getHotel,
  getHotels,
  getRooms,
  getSuggestions,
} from "./api";
import type { Filters, Search } from "@/features/search/model";
export function useSuggestions(text: string, enabled = true) {
  return useQuery({
    queryKey: ["suggestions", text],
    queryFn: ({ signal }) => getSuggestions(text, signal),
    enabled: enabled && text.trim().length > 0,
  });
}
export function useFeaturedHotels() {
  return useQuery({
    queryKey: ["featured-hotels"],
    queryFn: ({ signal }) => getFeaturedHotels(signal),
  });
}
export function useHotel(id: number) {
  return useQuery({
    queryKey: ["hotel", id],
    queryFn: ({ signal }) => getHotel(id, signal),
  });
}
export function useRooms(id: number) {
  return useQuery({
    queryKey: ["rooms", id],
    queryFn: ({ signal }) => getRooms(id, signal),
  });
}
export function useCatalog(search: Search | null, filters: Filters | null) {
  const destination = useSuggestions(search?.destination ?? "");
  const isDestinationValid =
    destination.data?.some((item) => item.name === search?.destination) ??
    false;
  const hotels = useQuery({
    queryKey: ["hotels", search, filters],
    queryFn: ({ signal }) => getHotels(search!, filters!, signal),
    enabled: !!search && !!filters && isDestinationValid,
  });
  return { hotels, destination, isDestinationValid };
}
