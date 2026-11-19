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
  const Anchor = native ? "a" : Link;

  return (
    <>
      <Anchor href="/#buscar" className={className} onClick={onClick}>
        Encontrar uma estadia
      </Anchor>
      <Anchor href="/#inspiracao" className={className} onClick={onClick}>
        Inspire-se <ArrowUpRight size={14} aria-hidden="true" />
      </Anchor>
    </>
  );
}
