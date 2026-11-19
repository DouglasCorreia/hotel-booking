"use client";
import { useLocale } from "@/lib/i18n/client";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import { Photo } from "@/components/photo";
import { Button } from "@/components/ui/button";

type GalleryProps = {
  /** Fotos na ordem do catálogo. A primeira é o destaque e o modal percorre todas. */
  images: string[];
  /** Nome do hotel usado no título do modal e nos rótulos das imagens. */
  name: string;
};

export function Gallery({ images, name }: GalleryProps) {
  const { t, number } = useLocale();
  const dialog = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState(0);
  function move(offset: number) {
    setCurrent((value) => (value + offset + images.length) % images.length);
  }
  return (
    <>
      <div className="grid grid-cols-[1.7fr_1fr] grid-rows-[190px_190px] gap-3 rounded-[10px] overflow-hidden [&:has(>_:only-child)]:grid-cols-[1fr] max-[760.01px]:grid-rows-[230px_110px] max-[760.01px]:grid-cols-[1fr_1fr] max-[760.01px]:gap-2">
        {(images.length ? images.slice(0, 3) : [undefined]).map(
          (src, index) => (
            <button
              className={`border-0 p-0 relative overflow-hidden [&_.photo]:h-full [&:hover_img]:[transform:scale(1.025)] ${index === 0 ? "row-[span_2] max-[760.01px]:row-auto max-[760.01px]:col-[1_/_-1]" : ""}`}
              type="button"
              key={src ?? index}
              aria-label={t("Ampliar foto {index} de {name}", {
                index: number(index + 1),
                name,
              })}
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
                alt={t("Foto {index} de {name}", {
                  index: number(index + 1),
                  name,
                })}
                preload={index === 0}
                sizes={index === 0 ? "(max-width: 700px) 100vw, 65vw" : "35vw"}
              />
              {index === 0 && (
                <span className="absolute bottom-5 left-5 bg-white rounded-[5px] text-[10px] font-[550] [padding:9px_13px] flex items-center gap-[7px]">
                  <Expand size={14} aria-hidden="true" />
                  {t("Ver fotos")}
                </span>
              )}
            </button>
          )
        )}
      </div>
      <dialog
        ref={dialog}
        className="w-[min(1000px,_94vw)] max-h-[94vh] border-0 rounded-[10px] m-auto p-5 bg-white [&::backdrop]:bg-[#0c1426d9] [&_.photo]:h-[65vh]"
        aria-labelledby="gallery-title"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") move(-1);
          if (event.key === "ArrowRight") move(1);
        }}
      >
        <div className="flex items-center justify-between gap-5 mb-[15px] [&_h2]:text-[18px] [&_h2]:m-0">
          <h2 id="gallery-title">{name}</h2>
          <Button
            variant="outline"
            size="icon"
            aria-label={t("Fechar galeria")}
            onClick={() => dialog.current?.close()}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
        <Photo
          src={images[current]}
          alt={t("Foto {index} de {name}", {
            index: number(current + 1),
            name,
          })}
          sizes="90vw"
        />
        <div className="flex items-center justify-center gap-5 mt-[15px] text-[12px]">
          <Button
            variant="outline"
            aria-label={t("Foto anterior")}
            onClick={() => move(-1)}
          >
            <ArrowLeft aria-hidden="true" />
          </Button>
          <span>
            {t("{current} de {total}", {
              current: number(current + 1),
              total: number(images.length),
            })}
          </span>
          <Button
            variant="outline"
            aria-label={t("Próxima foto")}
            onClick={() => move(1)}
          >
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </dialog>
    </>
  );
}
