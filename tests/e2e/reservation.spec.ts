import { test, expect } from "@playwright/test";

test("busca, reserva, proteção de duplo clique e confirmação após refresh", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "Destino" }).fill("sao");
  await page.getByRole("option", { name: /São Paulo, SP/ }).click();
  const next = new Date();
  next.setDate(next.getDate() + 10);
  const date = (value: Date) =>
    `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  await page.getByLabel("Check-in", { exact: true }).fill(date(next));
  next.setDate(next.getDate() + 3);
  await page.getByLabel("Check-out", { exact: true }).fill(date(next));
  await page.getByRole("button", { name: "Buscar hotéis" }).click();
  await expect(page).toHaveURL(/\/search\?/);
  await expect(page.getByText(/14 hotéis encontrados/)).toBeVisible();
  await page.reload();
  await page
    .getByRole("link", { name: /Ver hotel/ })
    .nth(1)
    .click();
  await page
    .getByRole("button", { name: "Selecionar quarto" })
    .and(page.locator(":enabled"))
    .first()
    .click();
  await expect(page).toHaveURL(/\/checkout/);
  await page.reload();
  await page.getByLabel("Nome completo").fill("Maria Silva");
  await page.getByLabel("E-mail").fill("maria@example.com");
  await page.getByLabel("Telefone").fill("(11) 99999-1234");
  let creations = 0;
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().endsWith("/bookings"))
      creations += 1;
  });
  await page
    .getByRole("button", { name: "Confirmar reserva simulada" })
    .dblclick();
  await expect(page).toHaveURL(/\/confirmation\//);
  await expect(
    page.getByRole("heading", { name: "Sua próxima estadia está marcada." }),
  ).toBeVisible();
  expect(creations).toBe(1);
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await expect(page.getByText("Maria Silva")).toBeVisible();
});

test("destino vazio e hotel inexistente oferecem recuperação", async ({
  page,
}) => {
  const search = new URLSearchParams({
    destination: "Bonito, MS",
    checkIn: "2099-01-01",
    checkOut: "2099-01-03",
    adults: "2",
    children: "0",
    rooms: "1",
  });
  await page.goto(`/search?${search}`);
  await expect(
    page.getByRole("heading", { name: "Nenhum hotel por aqui ainda" }),
  ).toBeVisible();
  await page.goto("/hotel/99999");
  await expect(page.getByText("Hotel não encontrado")).toBeVisible();
});

test("mobile mantém a pesquisa sem rolagem horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Buscar hotéis" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("filtros e paginação se mantêm na URL e oferecem estado vazio", async ({
  page,
}) => {
  const params = new URLSearchParams({
    destination: "São Paulo, SP",
    checkIn: "2099-01-01",
    checkOut: "2099-01-03",
    adults: "2",
    children: "0",
    rooms: "1",
  });
  await page.goto(`/search?${params}`);
  await page.getByRole("link", { name: "Próxima" }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByText("Mostrando 11–14 de 14")).toBeVisible();
  await page.getByLabel("Mínimo (R$)").fill("4000");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page).toHaveURL(/page=1/);
  await expect(
    page.getByRole("heading", { name: "Nenhum hotel por aqui ainda" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Limpar filtros" }).click();
  await expect(page.getByText("14 hotéis encontrados")).toBeVisible();
});

test("autocomplete funciona por teclado e falha simulada permite recuperação", async ({
  page,
}) => {
  await page.goto("/");
  const destination = page.getByRole("combobox", { name: "Destino" });
  await destination.fill("florianop");
  await expect(
    page.getByRole("option", { name: /Florianópolis/ }),
  ).toBeVisible();
  await destination.press("ArrowDown");
  await destination.press("Enter");
  await expect(destination).toHaveValue("Florianópolis, SC");
  await page.route("http://localhost:3333/hotels/1", (route) =>
    route.continue({ url: `${route.request().url()}?_fail=1` }),
  );
  await page.goto("/hotel/1");
  await expect(
    page.getByRole("button", { name: "Tentar novamente" }),
  ).toBeVisible();
  await page.unroute("http://localhost:3333/hotels/1");
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(
    page.getByRole("heading", { name: "Hotel Copacabana Palace" }),
  ).toBeVisible();
});
