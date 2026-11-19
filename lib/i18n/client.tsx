"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createTranslator, type Messages } from "./messages";
import { defaultLocale, localizedHref, type Locale } from "./routing";
import { createFormatters } from "@/lib/format";

const emptyMessages: Messages = {};

function localeContext(locale: Locale, messages: Messages, catalog: Messages) {
  const t = createTranslator(messages);
  const format = createFormatters(locale);
  return {
    locale,
    t,
    catalog,
    ...format,
    href: (path: string) => localizedHref(path, locale),
    quantity: (count: number, singular: string, plural: string) =>
      t(count === 1 ? singular : plural, { count: format.number(count) }),
  };
}

const LocaleContext = createContext(
  localeContext(defaultLocale, emptyMessages, emptyMessages)
);

export function LocaleProvider({
  locale,
  messages,
  catalog,
  children,
}: {
  locale: Locale;
  messages: Messages;
  catalog: Messages;
  children: ReactNode;
}) {
  const context = useMemo(
    () => localeContext(locale, messages, catalog),
    [locale, messages, catalog]
  );
  return (
    <LocaleContext.Provider value={context}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
