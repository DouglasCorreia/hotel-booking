import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  searchSchema,
  parseSearch,
  searchParamsFor,
  filterSchema,
} from "@/features/search/model";
import {
  nightsBetween,
  calculateTotal,
  selectionProblem,
  guestSchema,
} from "@/features/booking/model";

const search = {
  destination: "São Paulo, SP",
  checkIn: "2026-12-01",
  checkOut: "2026-12-04",
  adults: 2,
  children: 0,
  rooms: 1,
};

describe("datas e ocupação", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 16, 12));
  });
  afterEach(() => vi.useRealTimers());
  it("aceita de uma a trinta noites e rejeita passado, datas impossíveis e período invertido", () => {
    expect(searchSchema.safeParse(search).success).toBe(true);
    expect(
      searchSchema.safeParse({ ...search, checkOut: "2026-12-31" }).success,
    ).toBe(true);
    for (const changes of [
      { checkOut: "2027-01-01" },
      { checkOut: search.checkIn },
      { checkIn: "2026-11-15" },
      { checkIn: "2026-02-30" },
    ]) {
      expect(searchSchema.safeParse({ ...search, ...changes }).success).toBe(
        false,
      );
    }
  });
  it("exige quantidades inteiras e pelo menos um adulto por quarto", () => {
    for (const changes of [
      { rooms: 0 },
      { adults: 1, rooms: 2 },
      { children: -1 },
      { adults: 2.5 },
    ]) {
      expect(searchSchema.safeParse({ ...search, ...changes }).success).toBe(
        false,
      );
    }
  });
  it("preserva dias de calendário mesmo atravessando horário de verão", () => {
    expect(nightsBetween("2027-03-13", "2027-03-15")).toBe(2);
    expect(calculateTotal(200, 3, 2)).toBe(1200);
    expect(calculateTotal(180.15, 3, 2)).toBe(1080.9);
  });
  it("reconstrói uma busca compartilhada sem perder acentos e rejeita parâmetros ausentes", () => {
    expect(parseSearch(searchParamsFor(search))).toEqual(search);
    expect(parseSearch(new URLSearchParams())).toBeNull();
    expect(
      parseSearch(new URLSearchParams("destination=x&adults=wat")),
    ).toBeNull();
  });
  it("rejeita filtros e páginas incoerentes", () => {
    expect(
      filterSchema.safeParse({ minPrice: 500, maxPrice: 200 }).success,
    ).toBe(false);
    expect(filterSchema.safeParse({ rating: 6 }).success).toBe(false);
    expect(filterSchema.safeParse({ page: 0 }).success).toBe(false);
    expect(filterSchema.safeParse({ sort: "distance" }).success).toBe(false);
  });
  it("valida estoque, vínculo e capacidade incluindo crianças", () => {
    const room = { hotelId: 1, maxGuests: 2, available: 2 };
    expect(selectionProblem(room, 1, search)).toBeNull();
    expect(selectionProblem(room, 2, search)).toBeTruthy();
    expect(selectionProblem({ ...room, available: 0 }, 1, search)).toBeTruthy();
    expect(selectionProblem(room, 1, { ...search, children: 1 })).toBeTruthy();
    expect(
      selectionProblem(room, 1, { ...search, rooms: 3, adults: 3 }),
    ).toBeTruthy();
    expect(
      selectionProblem(room, 1, {
        ...search,
        rooms: 2,
        adults: 2,
        children: 2,
      }),
    ).toBeNull();
  });
  it("aceita telefone brasileiro formatado, sem exigir CPF", () => {
    expect(
      guestSchema.safeParse({
        name: "Maria Silva",
        email: "maria@example.com",
        phone: "+55 (11) 99999-1234",
      }).success,
    ).toBe(true);
    expect(
      guestSchema.safeParse({ name: "M", email: "inválido", phone: "123" })
        .success,
    ).toBe(false);
  });
});
