"use client";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Photo({
  src,
  alt,
  className,
  preload = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: {
  src?: string;
  alt: string;
  className?: string;
  preload?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState<string>();
  return (
    <div
      className={cn(
        "photo relative overflow-hidden bg-muted [&_img]:object-cover [&_img]:[transition:transform_400ms_ease]",
        className
      )}
    >
      {src && src !== failed ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          preload={preload}
          onError={() => setFailed(src)}
        />
      ) : (
        <span className="flex items-center justify-center flex-col gap-2 h-full min-h-25 text-muted-foreground text-[12px]">
          <ImageOff aria-hidden="true" />
          <span>Imagem indisponível</span>
        </span>
      )}
    </div>
  );
}
