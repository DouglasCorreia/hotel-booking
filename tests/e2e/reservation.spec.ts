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
  await page.getByLabel("Crianças", { exact: true }).fill("1");
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
  const phone = page.getByLabel("Telefone");
  await phone.pressSequentially("119999912345");
  await expect(phone).toHaveValue("(11) 99999-1234");
  await phone.fill("+55 11 99999 1234");
  await expect(phone).toHaveValue("+55 (11) 99999-1234");
  await page.getByLabel("Nome do adulto 2").fill("João Silva");
  await page.getByLabel("Nome da criança 1").fill("Ana Silva");
  await page.getByLabel("CPF").fill("11111111111");
  await page.getByRole("button", { name: "Ir para pagamento" }).click();
  await expect(page.getByText("Informe um CPF válido.")).toBeVisible();
  await page.getByLabel("CPF").fill("52998224725");
  await expect(page.getByLabel("CPF")).toHaveValue("529.982.247-25");
  await page.getByRole("button", { name: "Ir para pagamento" }).click();
  await page.getByLabel("Número do cartão de teste").fill("4000000000000002");
  await page.getByLabel("Validade").fill("12/99");
  await page.getByLabel("Código de segurança").fill("123");
  await page.getByRole("button", { name: "Simular pagamento" }).click();
  await expect(page.getByText("Pagamento simulado recusado.")).toBeVisible();
  await page.getByLabel("Número do cartão de teste").fill("4242424242424242");
  await page.getByRole("button", { name: "Simular pagamento" }).click();
  await page.getByLabel("Código do cupom").fill(" lumina10 ");
  await page.getByRole("button", { name: "Aplicar cupom" }).click();
  await expect(page.getByText("Desconto (LUMINA10)")).toBeVisible();
  const saved = await page.evaluate(() =>
    sessionStorage.getItem("lumina-selection-v1")
  );
  expect(saved).toContain("Maria Silva");
  expect(saved).not.toContain("529.982.247-25");
  expect(saved).not.toContain("4242424242424242");
  await page.reload();
  await expect(page.getByLabel("Nome completo")).toHaveValue("Maria Silva");
  await expect(phone).toHaveValue("+55 (11) 99999-1234");
  await expect(page.getByLabel("Nome da criança 1")).toHaveValue("Ana Silva");
  await expect(page.getByLabel("CPF")).toHaveValue("");
  await page.getByLabel("CPF").fill("52998224725");
  await page.getByRole("button", { name: "Ir para pagamento" }).click();
  await expect(page.getByLabel("Número do cartão de teste")).toHaveValue("");
  await page.getByLabel("Número do cartão de teste").fill("4242424242424242");
  await page.getByLabel("Validade").fill("12/99");
  await page.getByLabel("Código de segurança").fill("123");
  await page.getByRole("button", { name: "Simular pagamento" }).click();
  await expect(page.getByText("Desconto (LUMINA10)")).toBeVisible();
  await page.getByLabel("Código do cupom").fill("inválido");
  await page.getByRole("button", { name: "Aplicar cupom" }).click();
  await expect(page.getByText("Cupom inválido.")).toBeVisible();
  await expect(page.getByText("Desconto (LUMINA10)")).toBeVisible();
  await page.getByRole("button", { name: "Remover cupom" }).click();
  await expect(page.getByText("Desconto (LUMINA10)")).toHaveCount(0);
  await page.getByLabel("Código do cupom").fill("LUMINA10");
  await page.getByRole("button", { name: "Aplicar cupom" }).click();
  const readTerms = page.getByRole("button", {
    name: "Ler os termos da reserva",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true);
  await readTerms.focus();
  await readTerms.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Fechar termos" })
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(readTerms).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Confirmar reserva simulada" })
  ).toBeDisabled();
  const acceptTerms = page.getByRole("checkbox", {
    name: "Aceito os termos da reserva",
  });
  const confirm = page.getByRole("button", {
    name: "Confirmar reserva simulada",
  });
  await acceptTerms.check();
  let creations = 0;
  let bookingPayload: string | null = null;
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().endsWith("/bookings")) {
      creations += 1;
      bookingPayload = request.postData();
    }
  });
  await page.route(/\/rooms\/\d+$/, async (route) => {
    const response = await route.fetch();
    const room = await response.json();
    await route.fulfill({
      response,
      json: { ...room, pricePerNight: room.pricePerNight + 25 },
    });
  });
  await confirm.click();
  await page.getByRole("button", { name: "Aceitar novo preço" }).click();
  expect(creations).toBe(0);
  await expect(acceptTerms).not.toBeChecked();
  await expect(confirm).toBeDisabled();
  await page.getByRole("button", { name: "Voltar ao pagamento" }).click();
  await page.getByRole("button", { name: "Voltar para hóspedes" }).click();
  await expect(page.getByLabel("Nome da criança 1")).toHaveValue("Ana Silva");
  await expect(page.getByLabel("CPF")).toHaveValue("529.982.247-25");
  await page.getByRole("button", { name: "Ir para pagamento" }).click();
  await page.getByRole("button", { name: "Simular pagamento" }).click();
  await acceptTerms.check();
  await confirm.dblclick();
  await expect(page).toHaveURL(/\/confirmation\//);
  await expect(
    page.getByRole("heading", { name: "Sua próxima estadia está marcada." })
  ).toBeVisible();
  expect(creations).toBe(1);
  expect(bookingPayload).toContain("Ana Silva");
  expect(bookingPayload).not.toContain("529.982.247-25");
  expect(bookingPayload).not.toContain("4242424242424242");
  expect(
    await page.evaluate(() => sessionStorage.getItem("lumina-selection-v1"))
  ).not.toContain("Maria Silva");
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await expect(page.getByText("Maria Silva")).toBeVisible();
  await expect(page.getByText("Ana Silva")).toBeVisible();
  await expect(page.getByText("Desconto (LUMINA10)")).toBeVisible();
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
    page.getByRole("heading", { name: "Nenhum hotel por aqui ainda" })
  ).toBeVisible();
  await page.goto("/hotel/99999");
  await expect(page.getByText("Hotel não encontrado")).toBeVisible();
});

test("mobile mantém a pesquisa sem rolagem horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Buscar hotéis" })
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
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
    page.getByRole("heading", { name: "Nenhum hotel por aqui ainda" })
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
    page.getByRole("option", { name: /Florianópolis/ })
  ).toBeVisible();
  await destination.press("ArrowDown");
  await destination.press("Enter");
  await expect(destination).toHaveValue("Florianópolis, SC");
  await page.route("http://localhost:3333/hotels/1", (route) =>
    route.continue({ url: `${route.request().url()}?_fail=1` })
  );
  await page.goto("/hotel/1");
  await expect(
    page.getByRole("button", { name: "Tentar novamente" })
  ).toBeVisible();
  await page.unroute("http://localhost:3333/hotels/1");
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(
    page.getByRole("heading", { name: "Hotel Copacabana Palace" })
  ).toBeVisible();
  await expect(page).toHaveTitle("Hotel Copacabana Palace | lumina hotels");
});
