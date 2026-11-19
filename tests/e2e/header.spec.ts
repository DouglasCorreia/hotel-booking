import { expect, test } from "@playwright/test";

test("menu mobile exibe navegação e idioma e fecha pelo teclado ou por toque externo", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Menu", exact: true });
  const navigation = page.getByRole("navigation", {
    name: "Navegação principal",
  });

  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(navigation).toBeHidden();
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(
    navigation.getByRole("link", { name: "Inspire-se" })
  ).toBeVisible();
  await expect(page.getByText("Português (Brasil)")).toBeVisible();
  await expect(page.getByText("BRL", { exact: true })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    navigation.getByRole("link", { name: "Encontrar uma estadia" })
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(navigation).toBeHidden();
  await expect(menu).toBeFocused();

  await menu.click();
  await page.mouse.click(5, 400);
  await expect(menu).toHaveAttribute("aria-expanded", "false");

  await menu.click();
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(menu).toBeHidden();
  await expect(
    navigation.getByRole("link", { name: "Inspire-se" })
  ).toBeVisible();
  await expect(page.getByText("PT-BR")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});

test("links do menu mobile fecham o painel e navegam às seções da home", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  const menu = page.getByRole("button", { name: "Menu", exact: true });
  const navigation = page.getByRole("navigation", {
    name: "Navegação principal",
  });
  const inspiration = page.locator("#inspiracao");
  let releaseFeaturedHotels!: () => void;
  const featuredHotels = new Promise<void>((resolve) => {
    releaseFeaturedHotels = resolve;
  });
  await page.route("**/hotels?featured=true&_limit=4", async (route) => {
    await featuredHotels;
    await route.continue();
  });

  try {
    await page.goto("/search");
    await menu.click();
    await navigation.getByRole("link", { name: "Inspire-se" }).click();
    await expect(page).toHaveURL(/\/#inspiracao$/);
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(inspiration).toBeInViewport();
  } finally {
    releaseFeaturedHotels();
  }
  await expect(
    inspiration.getByRole("link", { name: /^Conhecer / })
  ).toBeInViewport();

  await menu.click();
  await navigation.getByRole("link", { name: "Encontrar uma estadia" }).click();
  await expect(page).toHaveURL(/\/#buscar$/);
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#buscar")).toBeInViewport();
});
