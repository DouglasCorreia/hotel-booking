import { expect, test, type Page } from "@playwright/test";

test("switches locale without losing a shareable search", async ({ page }) => {
  const search =
    "/search?destination=S%C3%A3o+Paulo%2C+SP&checkIn=2099-01-01&checkOut=2099-01-04&adults=2&children=0&rooms=1&sort=popular&amenities=wifi&amenities=breakfast&page=1";
  await page.goto(`${search}#conteudo`);
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  const languageSwitch = page.getByRole("button", { name: "English (US)" });
  await expect(languageSwitch).toBeEnabled();
  await languageSwitch.press("Enter");
  await expect(page).toHaveURL(
    (url) => url.pathname + url.search + url.hash === `/en-US${search}#conteudo`
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
  await expect(
    page.getByRole("heading", { name: "São Paulo, SP", exact: true })
  ).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
  await page.goto("/");
  await expect(page).toHaveURL(/\/en-US$/);
  await page.goto(search);
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await page
    .getByRole("link", { name: "Lumina Hotels — início" })
    .first()
    .click();
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
});

test("renders English and missing pages on direct navigation", async ({
  page,
}) => {
  await page.goto("/en-US/hotel/1");
  await expect(
    page.getByRole("heading", { name: "Hotel Copacabana Palace" })
  ).toBeVisible();
  await expect(page.getByText(/Iconic luxury hotel/)).toBeVisible();
  await page.goto("/en-US/confirmation/missing");
  await expect(
    page.getByText("Booking not found", { exact: true })
  ).toBeVisible();
  expect((await page.goto("/en-US/missing-page"))?.status()).toBe(404);
  await expect(page.getByText("Page not found", { exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
});

async function simulatePayment(page: Page, card: string) {
  await page.getByLabel("Test card number").fill(card);
  await page.getByLabel("Expiration date").fill("12/99");
  await page.getByLabel("Security code").fill("123");
  await page.getByRole("button", { name: "Simulate payment" }).click();
}

test("resumes an English checkout after a language change and shares its confirmation", async ({
  page,
}) => {
  const stay =
    "destination=Rio+de+Janeiro%2C+RJ&checkIn=2099-01-01&checkOut=2099-01-04&adults=1&children=0&rooms=1";
  await page.goto(`/en-US/hotel/1?${stay}`);
  await page
    .getByRole("button", { name: "Select room" })
    .and(page.locator(":enabled"))
    .first()
    .click();
  await expect(page).toHaveURL(/\/en-US\/checkout$/);
  await page.getByLabel("Full name").fill("Maria Silva");
  await page.getByLabel("Email", { exact: true }).fill("maria@example.com");
  await page.getByLabel("Phone").fill("+55 11 99999 1234");
  await page.getByLabel("CPF").fill("11111111111");
  await page.getByRole("button", { name: "Continue to payment" }).click();
  await expect(page.getByText("Enter a valid CPF.")).toBeVisible();
  await page.getByLabel("CPF").fill("52998224725");
  await page.getByRole("button", { name: "Continue to payment" }).click();
  await simulatePayment(page, "4000000000000002");
  await expect(
    page.getByRole("alert").filter({ hasText: "Simulated payment declined." })
  ).toBeVisible();
  await simulatePayment(page, "4242424242424242");
  await page.getByLabel("Coupon code").fill("LUMINA10");
  await page.getByRole("button", { name: "Apply coupon" }).click();
  await page
    .getByRole("checkbox", { name: "I accept the booking terms" })
    .check();
  await page.getByRole("button", { name: "Português (Brasil)" }).click();
  const dialog = page.getByRole("dialog", { name: "Change language?" });
  await expect(dialog).toContainText("return to the guest details step");
  await dialog.getByRole("button", { name: "Keep this language" }).click();
  await expect(
    page.getByRole("checkbox", { name: "I accept the booking terms" })
  ).toBeChecked();
  await page.getByRole("button", { name: "Português (Brasil)" }).click();
  await dialog
    .getByRole("button", { name: "Change language", exact: true })
    .click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(page.getByLabel("Nome completo")).toHaveValue("Maria Silva");
  await expect(page.getByLabel("Telefone")).toHaveValue("+55 (11) 99999-1234");
  await expect(page.getByLabel("CPF")).toHaveValue("");
  await expect(page.getByText("Desconto (LUMINA10)")).toBeVisible();
  const draft = await page.evaluate(() =>
    sessionStorage.getItem("lumina-selection-v1")
  );
  expect(draft).toContain("Maria Silva");
  expect(draft).not.toContain("529.982.247-25");
  expect(draft).not.toContain("4242424242424242");

  await page.route(/\/rooms\/\d+$/, async (route) => {
    const response = await route.fetch();
    const room = await response.json();
    await route.fulfill({
      response,
      json: { ...room, pricePerNight: room.pricePerNight + 25 },
    });
  });
  await page.getByRole("button", { name: "English (US)" }).click();
  await page
    .getByRole("dialog", { name: "Alterar idioma?" })
    .getByRole("button", { name: "Alterar idioma", exact: true })
    .click();
  await expect(page.getByText("The room price changed")).toBeVisible();
  await page.getByRole("button", { name: "Accept new price" }).click();
  await page.getByLabel("CPF").fill("52998224725");
  await page.getByRole("button", { name: "Continue to payment" }).click();
  await expect(page.getByLabel("Test card number")).toHaveValue("");
  await simulatePayment(page, "4242424242424242");
  await expect(page.getByText("Coupon LUMINA10 applied")).toBeVisible();
  const terms = page.getByRole("checkbox", {
    name: "I accept the booking terms",
  });
  await expect(terms).not.toBeChecked();
  await terms.check();

  let releaseBooking!: () => void;
  const holdBooking = new Promise<void>((resolve) => {
    releaseBooking = resolve;
  });
  await page.route("**/bookings", async (route) => {
    if (route.request().method() === "POST") await holdBooking;
    await route.continue();
  });
  const bookingRequest = page.waitForRequest(
    (request) =>
      request.method() === "POST" && request.url().endsWith("/bookings")
  );
  try {
    await page
      .getByRole("button", { name: "Confirm simulated booking" })
      .click();
    const payload = (await bookingRequest).postDataJSON();
    expect(JSON.stringify(payload)).not.toContain("529.982.247-25");
    expect(JSON.stringify(payload)).not.toContain("4242424242424242");
    await expect(
      page.getByRole("button", { name: "Português (Brasil)" })
    ).toBeDisabled();
    releaseBooking();
    await expect(page).toHaveURL(/\/en-US\/confirmation\/[^/]+$/);
    const confirmation = new URL(page.url()).pathname;
    const amount = (locale: string) =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "BRL",
      }).format(payload.totalPrice);
    await expect(
      page
        .getByText("Stay total", { exact: true })
        .locator("..")
        .locator("strong")
    ).toHaveText(amount("en-US"));
    await page.getByRole("button", { name: "Português (Brasil)" }).click();
    await expect(page).toHaveURL(confirmation.replace("/en-US", ""));
    await expect(
      page
        .getByText("Total da estadia", { exact: true })
        .locator("..")
        .locator("strong")
    ).toHaveText(amount("pt-BR"));
  } finally {
    releaseBooking();
  }
});

test("shows the saved total and original text of a legacy booking", async ({
  page,
}) => {
  await page.route("**/bookings/legacy-booking", (route) =>
    route.fulfill({
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "content-type",
      },
      json: {
        id: "legacy-booking",
        hotelId: 1,
        roomId: 1,
        checkIn: "2000-01-01",
        checkOut: "2000-01-04",
        rooms: 1,
        adults: 1,
        children: 0,
        totalPrice: 600,
        guests: [
          {
            name: "Maria Silva",
            email: "maria@example.com",
            phone: "11999991234",
          },
        ],
        createdAt: "1999-12-01T12:00:00Z",
        snapshot: {
          hotelName: "Hotel",
          hotelImage: "",
          hotelAddress: "Endereço",
          roomName: "Quarto histórico",
          pricePerNight: 210,
          cancellationPolicy: "Cancelamento gratuito",
          checkInTime: "15:00",
          checkOutTime: "12:00",
        },
      },
    })
  );
  await page.goto("/en-US/confirmation/legacy-booking");
  await expect(
    page.getByText("Quarto histórico", { exact: true })
  ).toHaveAttribute("lang", "pt-BR");
  await expect(
    page.getByText("Free cancellation", { exact: true })
  ).toBeVisible();
  const total = page
    .getByText("Stay total", { exact: true })
    .locator("..")
    .locator("strong");
  await expect(total).toHaveText(
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BRL",
    }).format(600)
  );
});
