"use client";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import { Photo } from "@/components/photo";
import { Button } from "@/components/ui/button";

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState(0);
  function move(offset: number) {
    setCurrent((value) => (value + offset + images.length) % images.length);
  }
  return (
    <>
      <div className="gallery">
        {(images.length ? images.slice(0, 3) : [undefined]).map(
          (src, index) => (
            <button
              className={`gallery-item gallery-item-${index}`}
              type="button"
              key={src ?? index}
              aria-label={`Ampliar foto ${index + 1} de ${name}`}
              onClick={() => {
                if (src) {
                  setCurrent(index);
                  dialog.current?.showModal();
                }
              }}
              disabled={!src}
            >
              <Photo
                src={src}
                alt={`${name} — foto ${index + 1}`}
                preload={index === 0}
                sizes={index === 0 ? "(max-width: 700px) 100vw, 65vw" : "35vw"}
              />
              {index === 0 && (
                <span className="gallery-expand">
                  <Expand size={14} aria-hidden="true" />
                  Ver fotos
                </span>
              )}
            </button>
          ),
        )}
      </div>
      <dialog
        ref={dialog}
        className="lightbox"
        aria-labelledby="gallery-title"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") move(-1);
          if (event.key === "ArrowRight") move(1);
        }}
      >
        <div className="lightbox-top">
          <h2 id="gallery-title">{name}</h2>
          <Button
            variant="outline"
            size="icon"
            aria-label="Fechar galeria"
            onClick={() => dialog.current?.close()}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
        <Photo
          src={images[current]}
          alt={`${name} — foto ${current + 1}`}
          sizes="90vw"
        />
        <div className="lightbox-controls">
          <Button
            variant="outline"
            aria-label="Foto anterior"
            onClick={() => move(-1)}
          >
            <ArrowLeft aria-hidden="true" />
          </Button>
          <span>
            {current + 1} de {images.length}
          </span>
          <Button
            variant="outline"
            aria-label="Próxima foto"
            onClick={() => move(1)}
          >
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </dialog>
    </>
  );
}
