import { z } from "zod";

export function localToday(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

export const calendarDate = z
  .string()
  .refine(isCalendarDate, "Informe uma data válida.");
export const searchSchema = z
  .object({
    destination: z
      .string()
      .trim()
      .min(1, "Selecione um destino nas sugestões."),
    checkIn: calendarDate,
    checkOut: calendarDate,
    adults: z
      .number({ error: "Informe pelo menos um adulto." })
      .int("Informe um número inteiro.")
      .positive("Informe pelo menos um adulto."),
    children: z
      .number({ error: "Informe um número inteiro." })
      .int("Informe um número inteiro.")
      .nonnegative("A quantidade não pode ser negativa."),
    rooms: z
      .number({ error: "Informe pelo menos um quarto." })
      .int("Informe um número inteiro.")
      .positive("Informe pelo menos um quarto."),
  })
  .superRefine((value, context) => {
    if (value.checkIn < localToday())
      context.addIssue({
        code: "custom",
        path: ["checkIn"],
        message: "O check-in não pode estar no passado.",
      });
    if (isCalendarDate(value.checkIn) && isCalendarDate(value.checkOut)) {
      const nights =
        (Date.parse(value.checkOut) - Date.parse(value.checkIn)) / 86400000;
      if (nights < 1 || nights > 30)
        context.addIssue({
          code: "custom",
          path: ["checkOut"],
          message: "Escolha uma estadia de 1 a 30 noites.",
        });
    }
    if (value.adults < value.rooms)
      context.addIssue({
        code: "custom",
        path: ["adults"],
        message: "É necessário pelo menos um adulto por quarto.",
      });
  });
export type Search = z.infer<typeof searchSchema>;

export const filterAmenities = [
  "wifi",
  "pool",
  "parking",
  "breakfast",
  "aircon",
  "gym",
  "spa",
  "restaurant",
] as const;
export const propertyTypes = ["hotel", "pousada", "resort"] as const;
const money = z
  .number({ error: "Informe um preço válido em reais." })
  .finite()
  .nonnegative("O preço não pode ser negativo.")
  .refine(
    (value) =>
      Number.isSafeInteger(Math.round(value * 100)) &&
      Math.abs(value * 100 - Math.round(value * 100)) < 1e-7,
    "Use um valor em reais com até duas casas decimais."
  );

export const filterSchema = z
  .object({
    minPrice: money.optional(),
    maxPrice: money.optional(),
    amenities: z
      .array(z.enum(filterAmenities))
      .default([])
      .transform((values) =>
        filterAmenities.filter((value) => values.includes(value))
      ),
    propertyTypes: z
      .array(z.enum(propertyTypes))
      .default([])
      .transform((values) =>
        propertyTypes.filter((value) => values.includes(value))
      ),
    rating: z.number().min(0).max(5).optional(),
    sort: z
      .enum(["price-asc", "price-desc", "rating", "popular"])
      .default("price-asc"),
    page: z.number().int().positive().default(1),
  })
  .refine(
    (value) =>
      value.minPrice === undefined ||
      value.maxPrice === undefined ||
      value.minPrice <= value.maxPrice,
    {
      message: "O preço máximo deve ser maior ou igual ao mínimo.",
      path: ["maxPrice"],
    }
  );
export type Filters = z.infer<typeof filterSchema>;

export function parseSearch(
  params: Pick<URLSearchParams, "get">
): Search | null {
  const result = searchSchema.safeParse({
    destination: params.get("destination"),
    checkIn: params.get("checkIn"),
    checkOut: params.get("checkOut"),
    adults: Number(params.get("adults")),
    children: Number(params.get("children")),
    rooms: Number(params.get("rooms")),
  });
  return result.success ? result.data : null;
}

export function parseFilters(params: Pick<URLSearchParams, "get" | "getAll">) {
  const number = (key: string) =>
    params.get(key) === null
      ? undefined
      : params.get(key)?.trim() === ""
        ? NaN
        : Number(params.get(key));
  return filterSchema.safeParse({
    minPrice: number("minPrice"),
    maxPrice: number("maxPrice"),
    rating: number("rating"),
    sort: params.get("sort") ?? undefined,
    page: number("page"),
    amenities: params.getAll("amenities"),
    propertyTypes: params.getAll("propertyTypes"),
  });
}

export function searchParamsFor(search: Search, filters?: Filters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search))
    params.set(key, String(value));
  if (filters)
    for (const [key, value] of Object.entries(filters))
      if (Array.isArray(value)) {
        for (const item of value) params.append(key, item);
      } else if (value !== undefined) params.set(key, String(value));
  return params;
}

export function defaultSearch(): Search {
  const arrival = new Date();
  arrival.setDate(arrival.getDate() + 7);
  const departure = new Date(arrival);
  departure.setDate(departure.getDate() + 3);
  return {
    destination: "",
    checkIn: localToday(arrival),
    checkOut: localToday(departure),
    adults: 2,
    children: 0,
    rooms: 1,
  };
}
