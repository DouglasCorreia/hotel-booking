import type { Page } from "@playwright/test";

export async function recordMotion(page: Page) {
  await page.addInitScript(() => {
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (keyframes, options) {
      const duration = typeof options === "object" ? options.duration : options;
      if (
        duration === 160 ||
        duration === 180 ||
        duration === 220 ||
        duration === 240
      ) {
        const name = `data-motion-${duration}`;
        const root = document.documentElement;
        root.setAttribute(name, String(Number(root.getAttribute(name)) + 1));
      }
      return animate.call(this, keyframes, options);
    };
  });
}
