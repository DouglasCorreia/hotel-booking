import { describe, expect, it } from "vitest";
import {
  filterSchema,
  parseFilters,
  searchParamsFor,
} from "@/features/search/model";

const search = {
  destination: "São Paulo, SP",
  checkIn: "2099-01-01",
  checkOut: "2099-01-03",
  adults: 2,
  children: 0,
  rooms: 1,
};

describe("contrato dos filtros múltiplos", () => {
  it("restaura múltiplas seleções e deduplica pela URL", () => {
    const filters = filterSchema.parse({
      amenities: ["wifi", "pool", "wifi"],
      propertyTypes: ["hotel", "pousada"],
      minPrice: 180.15,
      maxPrice: 180.15,
    });
    expect(filters).toMatchObject({
      amenities: ["wifi", "pool"],
      propertyTypes: ["hotel", "pousada"],
    });
    const params = searchParamsFor(search, filters);
    expect(params.getAll("amenities")).toEqual(["wifi", "pool"]);
    expect(params.getAll("propertyTypes")).toEqual(["hotel", "pousada"]);
    expect(parseFilters(params)).toEqual({ success: true, data: filters });
  });

  it("mantém URLs antigas sem restrições dos novos grupos", () => {
    expect(parseFilters(new URLSearchParams()).data).toMatchObject({
      amenities: [],
      propertyTypes: [],
      page: 1,
      sort: "price-asc",
    });
  });

  it("recusa opções desconhecidas, valores vazios explícitos e preços sem precisão monetária", () => {
    for (const query of [
      "amenities=wifi&amenities=unknown",
      "propertyTypes=apartment",
      "amenities=",
      "minPrice=",
      "minPrice=-1",
      "maxPrice=Infinity",
      "minPrice=10.001",
      "minPrice=500&maxPrice=200",
    ]) {
      expect(parseFilters(new URLSearchParams(query)).success, query).toBe(
        false
      );
    }
    expect(filterSchema.safeParse({ minPrice: 0, maxPrice: 0 }).success).toBe(
      true
    );
    expect(filterSchema.safeParse({ minPrice: 4000 }).success).toBe(true);
  });
});
