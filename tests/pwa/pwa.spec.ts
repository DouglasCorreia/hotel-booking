import { chromium, expect, test } from "@playwright/test";

test("publica o manifesto, os ícones e o script de instalação", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const manifestLink = page.locator('link[rel="manifest"]');
  await expect(manifestLink).toHaveAttribute("href", "/manifest.webmanifest");
  const response = await request.get("/manifest.webmanifest");
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["content-type"]).toContain(
    "application/manifest+json"
  );
  const manifest = await response.json();
  expect(manifest).toMatchObject({
    name: "Lumina Hotels",
    lang: "pt-BR",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    icons: [
      { sizes: "192x192", type: "image/png" },
      { sizes: "512x512", type: "image/png", purpose: "any" },
      { sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  });

  const appleIcon = page.locator('link[rel="apple-touch-icon"]');
  await expect(appleIcon).toHaveAttribute("sizes", "180x180");
  const appleIconPath = await appleIcon.getAttribute("href");
  for (const { src, sizes } of [
    ...manifest.icons,
    { src: appleIconPath, sizes: "180x180" },
  ]) {
    const icon = await request.get(src);
    expect(icon.ok()).toBeTruthy();
    expect(icon.headers()["content-type"]).toContain("image/png");
    const png = await icon.body();
    expect(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`).toBe(sizes);
  }

  const worker = await request.get("/sw.js");
  expect(worker.ok()).toBeTruthy();
  expect(worker.headers()["content-type"]).toContain("javascript");
  expect(worker.headers()["cache-control"]).toContain("no-cache");

  await page.goto("/en-US");
  await expect(manifestLink).toHaveAttribute(
    "href",
    "/en-US/manifest.webmanifest"
  );
  const localizedManifest = await request.get("/en-US/manifest.webmanifest");
  expect(localizedManifest.ok()).toBeTruthy();
  expect(await localizedManifest.json()).toMatchObject({
    id: manifest.id,
    start_url: manifest.start_url,
    scope: manifest.scope,
    lang: "en-US",
    description: expect.stringContaining("Explore destinations in Brazil"),
  });
});

test("opens both locales on dynamic routes in production", async ({ page }) => {
  for (const [prefix, lang, missingBooking] of [
    ["", "pt-BR", "Reserva não encontrada"],
    ["/en-US", "en-US", "Booking not found"],
  ]) {
    await page.goto(`${prefix}/hotel/1`);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(
      page.getByRole("heading", { name: "Hotel Copacabana Palace" })
    ).toBeVisible();
    await page.goto(`${prefix}/confirmation/missing-production-booking`);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(
      page.getByRole("heading", { name: missingBooking })
    ).toBeVisible();
  }
});

test("Chrome reconhece o PWA como instalável", async ({
  baseURL,
  channel,
  headless,
}) => {
  // A temporary profile lets Chrome evaluate installability outside incognito.
  const context = await chromium.launchPersistentContext("", {
    baseURL,
    channel,
    headless,
  });
  try {
    const [page] = context.pages();
    await page.goto("/");
    await page.waitForFunction(
      () => navigator.serviceWorker.controller !== null
    );
    const session = await context.newCDPSession(page);
    const { installabilityErrors } = await session.send(
      "Page.getInstallabilityErrors"
    );
    expect(installabilityErrors).toEqual([]);
  } finally {
    await context.close();
  }
});

test("abre a tela offline e tenta novamente na URL original", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect
    .poll(() =>
      page.evaluate(() => navigator.serviceWorker.controller?.scriptURL)
    )
    .toMatch(/\/sw\.js$/);
  expect((await page.goto("/pwa-rota-inexistente"))?.status()).toBe(404);
  await page.goto("/");

  await context.setOffline(true);
  await expect(
    page.getByRole("status").filter({ hasText: "Você está sem conexão" })
  ).toBeVisible();
  const homeOffline = await page.reload();
  expect(homeOffline?.fromServiceWorker()).toBe(true);
  const offlineTitle = page.getByRole("heading", {
    name: "Você está sem conexão",
  });
  await expect(offlineTitle).toBeVisible();
  const original =
    "/search?destination=Salvador%2C+BA&checkIn=2099-01-01&checkOut=2099-01-04&adults=2&children=0&rooms=1&rating=4&sort=price-asc";
  expect((await page.goto(original))?.fromServiceWorker()).toBe(true);
  await expect(offlineTitle).toBeVisible();
  await expect(page).toHaveURL((url) => url.pathname + url.search === original);

  const cacheEntries = await page.evaluate(async () => {
    const entries: string[] = [];
    for (const cacheName of await caches.keys()) {
      const cache = await caches.open(cacheName);
      for (const request of await cache.keys()) {
        entries.push(new URL(request.url).pathname);
      }
    }
    return entries;
  });
  expect(cacheEntries).toEqual(["/offline.html"]);

  await context.setOffline(false);
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(offlineTitle).toHaveCount(0);
  await expect(page).toHaveURL((url) => url.pathname + url.search === original);
  await expect(
    page.getByRole("heading", { name: "Salvador, BA" })
  ).toBeVisible();
});

test("localizes offline navigation and preserves the last choice at the root", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.getByRole("button", { name: "English (US)" }).click();
  await expect(page).toHaveURL(/\/en-US$/);
  await context.setOffline(true);
  expect((await page.goto("/"))?.fromServiceWorker()).toBe(true);
  await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
  await expect(
    page.getByRole("heading", { name: "You're offline" })
  ).toBeVisible();
  expect((await page.goto("/search"))?.fromServiceWorker()).toBe(true);
  await expect(
    page.getByRole("heading", { name: "Você está sem conexão" })
  ).toBeVisible();
  const original =
    "/en-US/search?destination=Salvador%2C+BA&checkIn=2099-01-01&checkOut=2099-01-04&adults=2&children=0&rooms=1";
  expect((await page.goto(original))?.fromServiceWorker()).toBe(true);
  await expect(
    page.getByRole("heading", { name: "You're offline" })
  ).toBeVisible();
  await context.setOffline(false);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page).toHaveURL((url) => url.pathname + url.search === original);
  await expect(
    page.getByRole("heading", { name: "Salvador, BA" })
  ).toBeVisible();
});
