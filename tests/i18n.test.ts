import { describe, expect, it } from "vitest";
import { localizeCatalogText } from "@/lib/i18n/messages";
import { switchLocaleHref } from "@/lib/i18n/routing";
import catalog from "@/lib/i18n/catalog.en-US.json";
import catalogPt from "@/lib/i18n/catalog.pt-BR.json";
import seed from "../mock-api/db.seed.json";

describe("localização do catálogo", () => {
  it("cobre as descrições e os nomes de quartos de todo o catálogo demonstrativo", () => {
    const entries = [
      ...seed.hotels.map((hotel) => hotel.description),
      ...seed.rooms.flatMap((room) => [room.name, room.description]),
    ];
    for (const source of new Set(entries)) {
      expect(
        localizeCatalogText(source, "en-US", catalog),
        source
      ).toMatchObject({
        text: expect.any(String),
        lang: "en-US",
      });
    }
  });

  it("identifica o idioma de um texto novo ou histórico sem tradução", () => {
    expect(localizeCatalogText("Quarto histórico", "en-US", catalog)).toEqual({
      text: "Quarto histórico",
      lang: "pt-BR",
    });
  });

  it("localiza em português os tipos de quarto do catálogo que vieram em inglês", () => {
    expect(localizeCatalogText("Executive Room", "pt-BR", catalogPt)).toEqual({
      text: "Quarto Executivo",
      lang: "pt-BR",
    });
  });
});

describe("troca de idioma", () => {
  it("preserva a busca codificada com filtros repetidos e âncora", () => {
    const path =
      "/search?destination=S%C3%A3o%20Paulo&amenities=wifi&amenities=pool&page=2#results";
    const url = new URL(path, "https://lumina.invalid");
    expect(switchLocaleHref(url, "en-US")).toBe(`/en-US${path}`);
    expect(switchLocaleHref(new URL("/en-US" + path, url), "pt-BR")).toBe(path);
  });

  it("mantém o endereço no mesmo domínio ao receber barras repetidas", () => {
    const url = new URL("https://lumina.invalid/en-US//example.com");
    expect(switchLocaleHref(url, "pt-BR")).toBe("/example.com");
  });
});
