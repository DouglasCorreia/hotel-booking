import { test, expect } from "@playwright/test";
import seed from "../../mock-api/db.seed.json";

const query = new URLSearchParams({
  destination: "São Paulo, SP",
  checkIn: "2099-01-01",
  checkOut: "2099-01-03",
  adults: "2",
  children: "0",
  rooms: "1",
});
const url = `/search?${query}`;

test("combina filtros, preserva escala, restaura URL, histórico e retorno dos detalhes", async ({
  page,
}) => {
  await page.goto(`${url}&page=2`);
  await expect(page.getByText("Mostrando 11–14 de 14")).toBeVisible();
  const scale = page.locator(".price-scale-limits");
  await expect(scale).toBeVisible();
  const limits = await scale.textContent();
  for (const name of ["Wi-Fi", "Piscina", "Hotel", "Pousada"])
    await page.getByRole("checkbox", { name, exact: true }).check();
  await page.getByLabel("Mínimo (R$)").fill("200");
  await page.getByLabel("Avaliação mínima").selectOption("3");
  await expect(page.getByText("Alterações não aplicadas")).toBeVisible();
  await expect(page).toHaveURL(/page=2/);
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page).toHaveURL(/page=1/);
  const applied = page.url();
  const expected = seed.hotels
    .filter(
      (h) =>
        h.destination === "São Paulo, SP" &&
        h.amenities.includes("wifi") &&
        h.amenities.includes("pool") &&
        ["hotel", "pousada"].includes(h.propertyType) &&
        h.pricePerNight >= 200 &&
        h.rating >= 3
    )
    .sort((a, b) => a.pricePerNight - b.pricePerNight);
  await expect(
    page.getByText(`${expected.length} hotéis encontrados`, { exact: true })
  ).toBeVisible();
  for (const hotel of expected.slice(0, 10))
    await expect(
      page.getByRole("heading", { name: hotel.name, exact: true })
    ).toBeVisible();
  await expect(scale).toHaveText(limits!);
  await page.reload();
  for (const name of ["Wi-Fi", "Piscina", "Hotel", "Pousada"])
    await expect(
      page.getByRole("checkbox", { name, exact: true })
    ).toBeChecked();
  await page
    .getByRole("link", { name: /Ver hotel/ })
    .first()
    .click();
  await page.getByRole("link", { name: "Voltar à busca" }).click();
  await expect(page).toHaveURL(applied);
  await page.getByRole("link", { name: "Limpar filtros" }).click();
  await expect(
    page.getByText("14 hotéis encontrados", { exact: true })
  ).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(applied);
  await expect(
    page.getByRole("checkbox", { name: "Piscina", exact: true })
  ).toBeChecked();
});

test("slider por teclado e toque preserva limite intocado e funciona no mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);
  const min = page.getByRole("slider", { name: "Preço mínimo por noite" });
  await expect(min).toBeVisible();
  const initial = Number(await min.getAttribute("aria-valuenow"));
  await min.focus();
  await min.press("ArrowRight");
  await expect(page.getByLabel("Mínimo (R$)")).toHaveValue(
    (initial + 0.01).toFixed(2)
  );
  await expect(page.getByLabel("Máximo (R$)")).toHaveValue("");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page).toHaveURL(/minPrice=/);
  expect(new URL(page.url()).searchParams.has("maxPrice")).toBe(false);
  await expect(page.getByText("Alterações não aplicadas")).not.toBeVisible();
  const slider = page.locator('[data-slot="slider"]');
  await slider.scrollIntoViewIfNeeded();
  const box = (await slider.boundingBox())!;
  await page.mouse.click(box.x + box.width * 0.8, box.y + box.height / 2);
  await expect(page.getByLabel("Máximo (R$)")).not.toHaveValue("");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
});

test("falha da escala mantém os resultados e permite filtrar por campo numérico", async ({
  page,
}) => {
  await page.route(
    (u) => u.pathname === "/hotels" && u.search === "",
    (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: "{}",
      })
  );
  await page.goto(url);
  await expect(
    page.getByText("14 hotéis encontrados", { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Recarregar faixa de preço" })
  ).toBeVisible();
  await page.getByLabel("Mínimo (R$)").fill("4000");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(
    page.getByRole("heading", { name: "Nenhum hotel por aqui ainda" })
  ).toBeVisible();
  await expect(page.getByLabel("Mínimo (R$)")).toHaveValue("4000");
  await page.unrouteAll();
  await page.getByRole("button", { name: "Recarregar faixa de preço" }).click();
  await expect(
    page.getByRole("slider", { name: "Preço mínimo por noite" })
  ).toBeVisible();
});
