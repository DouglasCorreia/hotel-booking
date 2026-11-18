import { animate } from "framer-motion/dom/mini";

export function animateEntrance(
  element: HTMLElement | null,
  keyframes: { opacity: number[] } | { transform: string[] },
  duration: number
) {
  if (!element?.animate) return;
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (preference.matches) return;

  const animation = animate(element, keyframes, { duration, ease: "easeOut" });
  function reduceMotion(event: MediaQueryListEvent) {
    if (event.matches) animation.cancel();
  }
  preference.addEventListener("change", reduceMotion);
  return () => {
    preference.removeEventListener("change", reduceMotion);
    animation.cancel();
  };
}
