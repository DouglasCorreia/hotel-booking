import type { Locale } from "@/lib/i18n/routing";

export function createFormatters(locale: Locale) {
  const currency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BRL",
  });
  const number = new Intl.NumberFormat(locale);
  const date = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  const time = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: locale === "en-US",
    timeZone: "UTC",
  });
  return {
    money: currency.format,
    number: number.format,
    displayDate: (value: string) => date.format(new Date(`${value}T12:00:00Z`)),
    displayTime: (value: string) => {
      const parsed = new Date(`2000-01-01T${value}:00Z`);
      return Number.isNaN(parsed.getTime()) ? value : time.format(parsed);
    },
  };
}
