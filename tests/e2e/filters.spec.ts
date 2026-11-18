import { test, expect } from "@playwright/test";
import seed from "../../mock-api/db.seed.json";
import { recordMotion } from "./motion";

const query = new URLSearchParams({
  destination: "São Paulo, SP",
  checkIn: "2099-01-01",
  checkOut: "2099-01-03",
  adults: "2",
  children: "0",
  rooms: "1",
});
const url = `/search?${query}`;

test("menu mobile de filtros abre, preserva o rascunho e devolve o foco", async ({
  page,
}) => {
  await recordMotion(page);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(url);
  await expect(page.getByText("Mostrando 1–10 de 14")).toBeVisible();
  const open = page.getByRole("button", { name: "Abrir filtros" });
  const panel = page.getByRole("dialog", { name: "Filtros" });
  const close = panel.getByRole("button", { name: "Fechar filtros" });
  const price = panel.getByLabel("Mínimo (R$)");
  await expect(open).toBeVisible();
  await expect(panel).toBeHidden();
  await expect(page.getByLabel("Mínimo (R$)")).toBeHidden();

  const transforms = await open.evaluate((button: HTMLButtonElement) => {
    button.click();
    const animation = document
      .getElementById("mobile-filters")
      ?.getAnimations()[0];
    return (animation?.effect as KeyframeEffect | undefined)
      ?.getKeyframes()
      .map((frame) => frame.transform);
  });
  expect(transforms).toEqual(["translateX(-100%)", "translateX(0px)"]);
  await expect(page.locator("html")).toHaveAttribute("data-motion-240", "1");
  await expect(close).toBeFocused();
  expect(
    await page.evaluate(() => document.documentElement.style.overflow)
  ).toBe("hidden");
  await price.fill("250");
  await close.click();
  await expect(panel).toBeHidden();
  await expect(open).toBeFocused();
  await expect(page).toHaveURL(url);

  await open.press("Enter");
  await expect(price).toHaveValue("250");
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(open).toBeFocused();
  expect(
    await page.evaluate(() => document.documentElement.style.overflow)
  ).toBe("");

  await page
    .getByRole("link", { name: /Ver hotel/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/hotel\//);
  await page.getByRole("link", { name: "Voltar à busca" }).click();
  await open.click();
  await expect(panel).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/hotel\//);
  await expect(panel).toBeHidden();
  expect(
    await page.evaluate(() => document.documentElement.style.overflow)
  ).toBe("");
});

test("menu de filtros aplica, limpa e se adapta ao desktop com movimento reduzido", async ({
  page,
}) => {
  await recordMotion(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(`${url}&page=2`);

  const open = page.getByRole("button", { name: "Abrir filtros" });
  const panel = page.getByRole("dialog", { name: "Filtros" });
  const close = panel.getByRole("button", { name: "Fechar filtros" });
  const apply = panel.getByRole("button", { name: "Aplicar filtros" });
  await open.click();
  await expect(close).toBeFocused();
  expect(await page.locator("html").getAttribute("data-motion-240")).toBeNull();
  const initialClose = await close.boundingBox();
  await panel.getByLabel("Mínimo (R$)").fill("300");
  const max = panel.getByLabel("Máximo (R$)");
  await max.fill("200");
  await apply.click();
  await expect(
    panel.getByText("O preço máximo deve ser maior ou igual ao mínimo.")
  ).toBeVisible();
  await expect(page).toHaveURL(/page=2/);
  await max.fill("");
  await apply.scrollIntoViewIfNeeded();
  expect(await close.boundingBox()).toEqual(initialClose);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true);
  expect(
    await panel.evaluate(
      (element) => element.scrollWidth <= element.clientWidth
    )
  ).toBe(true);
  await apply.click();
  await expect(panel).toBeHidden();
  await expect(open).toBeFocused();
  await expect(page).toHaveURL(/minPrice=300/);
  await expect(page).toHaveURL(/page=1/);

  await open.click();
  await panel.getByRole("link", { name: "Limpar filtros" }).click();
  await expect(panel).toBeHidden();
  await expect(page).toHaveURL(url);
  await expect(page.getByText("Mostrando 1–10 de 14")).toBeVisible();

  await open.click();
  await panel.getByLabel("Mínimo (R$)").fill("250");
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(panel).toBeHidden();
  await expect(open).toBeHidden();
  await expect(
    page.getByRole("complementary", { name: "Encontre seu ideal" })
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.style.overflow)
  ).toBe("");
  await expect(page.getByLabel("Mínimo (R$)")).toHaveValue("250");
  await page.setViewportSize({ width: 375, height: 667 });
  await open.click();
  await expect(panel.getByLabel("Mínimo (R$)")).toHaveValue("250");
});

test("anima apenas mudanças visíveis nos cartões do catálogo", async ({
  page,
}) => {
  await recordMotion(page);
  await page.goto(url);
  const count = () => page.locator("html").getAttribute("data-motion-180");
  await expect(page.getByText("Mostrando 1–10 de 14")).toBeVisible();
  expect(await count()).toBeNull();

  await page.getByLabel("Ordenar por").selectOption("price-desc");
  expect(await count()).toBeNull();
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect.poll(count).toBe("1");

  await page.getByRole("link", { name: "Próxima" }).click();
  await expect(page.getByText("Mostrando 11–14 de 14")).toBeVisible();
  await expect.poll(count).toBe("2");

  await page.getByLabel("Mínimo (R$)").fill("99999");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page.getByText("Nenhum hotel por aqui ainda")).toBeVisible();
  expect(await count()).toBe("2");
  await page.getByRole("link", { name: "Limpar filtros" }).click();
  await expect.poll(count).toBe("3");

  await page.getByLabel("Mínimo (R$)").fill("1");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page).toHaveURL(/minPrice=1/);
  await expect(page.getByText("Mostrando 1–10 de 14")).toBeVisible();
  expect(await count()).toBe("3");

  const nextPage = (url: URL) =>
    url.pathname === "/hotels" && url.searchParams.get("_page") === "2";
  await page.route(nextPage, (route) =>
    route.fulfill({ status: 403, json: { error: "Falha de teste" } })
  );
  await page.getByRole("link", { name: "Próxima" }).click();
  const retry = page.getByRole("button", { name: "Tentar novamente" });
  await expect(retry).toBeVisible();
  expect(await count()).toBe("3");
  await page.unroute(nextPage);
  await retry.click();
  await expect(page.getByText("Mostrando 11–14 de 14")).toBeVisible();
  await expect.poll(count).toBe("4");
});

test("anima somente a consulta atual em mudanças rápidas de ordenação", async ({
  page,
}) => {
  await recordMotion(page);
  const slowSort = (url: URL) =>
    url.pathname === "/hotels" &&
    url.searchParams.get("_sort") === "pricePerNight" &&
    url.searchParams.get("_order") === "desc";
  const { promise: release, resolve: releaseSlowSort } =
    Promise.withResolvers<void>();
  const { promise: slowResponse, resolve: receiveSlowResponse } =
    Promise.withResolvers<void>();
  await page.route(slowSort, async (route) => {
    const response = await route.fetch();
    receiveSlowResponse();
    await release;
    await route.fulfill({ response });
  });
  await page.goto(url);
  await expect(page.getByText("Mostrando 1–10 de 14")).toBeVisible();
  const sort = page.getByLabel("Ordenar por");
  const apply = page.getByRole("button", { name: "Aplicar filtros" });
  await sort.selectOption("price-desc");
  await apply.click();
  await slowResponse;
  await sort.selectOption("rating");
  await apply.click();
  const first = seed.hotels
    .filter((hotel) => hotel.destination === "São Paulo, SP")
    .sort((a, b) => b.rating - a.rating)[0];
  const firstCard = page.getByRole("article").first();
  await expect(firstCard.getByRole("heading")).toHaveText(first.name);
  releaseSlowSort();
  await page.unrouteAll({ behavior: "wait" });
  await expect(firstCard.getByRole("heading")).toHaveText(first.name);
  await expect(page.locator("html")).toHaveAttribute("data-motion-180", "1");
});

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
  const open = page.getByRole("button", { name: "Abrir filtros" });
  await open.click();
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
  await open.click();
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
