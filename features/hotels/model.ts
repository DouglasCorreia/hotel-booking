import { z } from "zod";

export const suggestionSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  country: z.string(),
  searchName: z.string(),
});
export const hotelSchema = z.object({
  id: z.number(),
  name: z.string(),
  destination: z.string(),
  description: z.string(),
  rating: z.number(),
  reviewCount: z.number(),
  pricePerNight: z.number().nonnegative(),
  currency: z.literal("BRL"),
  propertyType: z.enum(["hotel", "pousada", "resort"]),
  address: z.string(),
  images: z.array(z.string()),
  thumbnail: z.string(),
  amenities: z.array(z.string()),
  checkInTime: z.string(),
  checkOutTime: z.string(),
  cancellationPolicy: z.enum(["free", "moderate", "strict"]),
  availableRooms: z.number().int().nonnegative(),
  featured: z.boolean(),
});
export const roomSchema = z.object({
  id: z.number(),
  hotelId: z.number(),
  name: z.string(),
  description: z.string(),
  size: z.number(),
  maxGuests: z.number().int().positive(),
  beds: z.array(z.object({ type: z.string(), quantity: z.number().int() })),
  pricePerNight: z.number().nonnegative(),
  amenities: z.array(z.string()),
  images: z.array(z.string()),
  available: z.number().int().nonnegative(),
});
export type Hotel = z.infer<typeof hotelSchema>;
export type Room = z.infer<typeof roomSchema>;
export type Suggestion = z.infer<typeof suggestionSchema>;

export const amenityLabels: Record<string, string> = {
  wifi: "Wi-Fi",
  breakfast: "Café da manhã",
  pool: "Piscina",
  spa: "Spa",
  restaurant: "Restaurante",
  gym: "Academia",
  parking: "Estacionamento",
  bar: "Bar",
  room_service: "Serviço de quarto",
  beach_access: "Acesso à praia",
  kids_club: "Espaço infantil",
  business_center: "Centro de negócios",
  concierge: "Concierge",
  valet: "Manobrista",
  lounge_access: "Lounge",
  ocean_view: "Vista para o mar",
  city_view: "Vista para a cidade",
  garden_view: "Vista para o jardim",
  balcony: "Varanda",
  terrace: "Terraço",
  bathtub: "Banheira",
  minibar: "Frigobar",
  safe: "Cofre",
  aircon: "Ar-condicionado",
  desk: "Mesa de trabalho",
  kitchen: "Cozinha",
  living_room: "Sala de estar",
  sound_system: "Sistema de som",
  butler: "Mordomo",
  pool_access: "Acesso à piscina",
  garden: "Jardim",
};
export const cancellationLabels = {
  free: "Cancelamento gratuito",
  moderate: "Política de cancelamento moderada",
  strict: "Política de cancelamento restrita",
};
