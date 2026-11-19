"use client";

import { useLocale } from "@/lib/i18n/client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { MouseEventHandler } from "react";

export function HeaderLinks({
  className,
  native = false,
  onClick,
}: {
  className: string;
  native?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  const { t, href } = useLocale();
  const Anchor = native ? "a" : Link;

  return (
    <>
      <Anchor href={href("/#buscar")} className={className} onClick={onClick}>
        {t("Encontrar uma estadia")}
      </Anchor>
      <Anchor
        href={href("/#inspiracao")}
        className={className}
        onClick={onClick}
      >
        {t("Inspire-se")} <ArrowUpRight size={14} aria-hidden="true" />
      </Anchor>
    </>
  );
}
