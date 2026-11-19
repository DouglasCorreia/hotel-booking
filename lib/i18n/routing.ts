export const locales = ["pt-BR", "en-US"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale = "pt-BR";
export const localeCookie = "lumina-locale";
export const localeCache = "lumina-locale";
export const localeCacheKey = "/.lumina-locale";

export function localizedHref(href: string, locale: Locale) {
  if (!href.startsWith("/") || href.startsWith("//")) return href;

  if (locale === "en-US")
    return `/en-US${href === "/" ? "" : href.replace(/^\/(?=[?#])/, "")}`;

  // Distinguish an intentional return to Portuguese from a fresh visit to /.
  const [path, hash] = href.split("#", 2);
  if (path !== "/" && !path.startsWith("/?")) return href;
  const url = new URL(path, "https://lumina.invalid");
  url.searchParams.set("lang", defaultLocale);
  return `${url.pathname}${url.search}${hash === undefined ? "" : `#${hash}`}`;
}

export function switchLocaleHref(current: URL, locale: Locale) {
  const unprefixed = current.pathname.replace(/^\/en-US(?=\/|$)/, "");
  const path = `/${unprefixed.replace(/^\/+/, "")}`;
  let search = current.search;
  if (path === "/" && current.searchParams.get("lang") === defaultLocale) {
    const query = new URLSearchParams(current.search);
    query.delete("lang");
    search = query.size ? `?${query}` : "";
  }
  return localizedHref(`${path}${search}${current.hash}`, locale);
}
