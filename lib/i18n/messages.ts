import type { Locale } from "./routing";

export type Messages = Readonly<Record<string, string>>;
export type Translator = (
  message: string,
  values?: Record<string, string | number>
) => string;

export function createTranslator(messages: Messages): Translator {
  return (message, values) => {
    const text = Object.hasOwn(messages, message) ? messages[message] : message;
    return values
      ? text.replace(/\{(\w+)\}/g, (token, key: string) =>
          Object.hasOwn(values, key) ? String(values[key]) : token
        )
      : text;
  };
}

export function localizeCatalogText(
  source: string,
  locale: Locale,
  messages: Messages
): { text: string; lang: Locale } {
  if (Object.hasOwn(messages, source)) {
    return { text: messages[source], lang: locale };
  }
  return { text: source, lang: "pt-BR" };
}
