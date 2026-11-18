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
    <div className={cn("photo", className)}>
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
        <span className="photo-fallback">
          <ImageOff aria-hidden="true" />
          <span>Imagem indisponível</span>
        </span>
      )}
    </div>
  );
}
