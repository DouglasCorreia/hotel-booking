import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { createTranslator } from "./messages";

export async function getLocale() {
  const locale = await lang();
  if (locale !== "pt-BR" && locale !== "en-US") notFound();
  return locale;
}

export async function getMessages() {
  return (await getLocale()) === "en-US"
    ? (await import("./en-US.json")).default
    : {};
}

export async function getTranslator() {
  return createTranslator(await getMessages());
}

export async function getCatalogMessages() {
  return (await getLocale()) === "en-US"
    ? (await import("./catalog.en-US.json")).default
    : (await import("./catalog.pt-BR.json")).default;
}
