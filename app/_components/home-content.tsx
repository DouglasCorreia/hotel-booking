"use client";
import { useLocale } from "@/lib/i18n/client";
import Link from "next/link";
import { ArrowRight, MapPin, MoveUpRight } from "lucide-react";
import { Photo } from "@/components/photo";
import { LoadingCards, QueryError } from "@/components/feedback";
import { useFeaturedHotels } from "@/features/hotels/hooks";

export function HomeContent() {
  const { t, href, money } = useLocale();
  const hotels = useFeaturedHotels();
  if (hotels.isPending)
    return (
      <div className="container w-[min(1280px,_calc(100%_-_80px))] mx-auto max-[1200.01px]:w-[calc(100%_-_56px)] max-[760.01px]:w-[calc(100%_-_36px)] max-[360.01px]:w-[calc(100%_-_28px)]">
        <LoadingCards />
      </div>
    );
  if (hotels.isError)
    return (
      <div className="container w-[min(1280px,_calc(100%_-_80px))] mx-auto max-[1200.01px]:w-[calc(100%_-_56px)] max-[760.01px]:w-[calc(100%_-_36px)] max-[360.01px]:w-[calc(100%_-_28px)]">
        <QueryError error={hotels.error} onRetry={() => hotels.refetch()} />
      </div>
    );
  if (!hotels.data.length) return null;
  const first = hotels.data[0];
  return (
    <>
      <section className="container w-[min(1280px,_calc(100%_-_80px))] mx-auto max-[1200.01px]:w-[calc(100%_-_56px)] max-[760.01px]:w-[calc(100%_-_36px)] max-[360.01px]:w-[calc(100%_-_28px)] home-feature">
        <Link
          href={href(`/hotel/${first.id}`)}
          className="block relative h-105 overflow-hidden rounded-[12px] text-white [&_>_.photo]:absolute [&_>_.photo]:inset-0 max-[760.01px]:h-85 max-[760.01px]:rounded-[9px]"
          aria-label={t("Conhecer {name}", { name: first.name })}
        >
          <Photo
            src={first.images[0]}
            alt={first.name}
            sizes="(max-width: 1280px) 100vw, 1280px"
            preload
          />
          <div className="absolute inset-0 [background:linear-gradient(90deg,_#0c1426c9,_#0c142627_75%)]" />
          <div className="relative max-w-[630px] p-[45px] [&_h2]:text-[clamp(30px,_3.3vw,_44px)] [&_h2]:leading-[1.1] [&_h2]:font-bold [&_h2]:tracking-[-0.035em] [&_h2]:mb-4 [&_p]:text-[12px] [&_p]:text-[#f0f3ff] [&_p]:mb-7.5 max-[760.01px]:[padding:30px_25px] max-[760.01px]:[&_h2]:text-[34px] max-[760.01px]:[&_p]:max-w-60 max-[760.01px]:[&_p]:text-[11px]">
            <span className="inline-flex gap-[7px] items-center text-[11px] mb-7 max-[760.01px]:mb-5.5">
              <MapPin size={14} aria-hidden="true" />
              {first.destination}
            </span>
            <h2>
              {t("Um lugar para sair")}
              <br />
              {t("da rotina.")}
            </h2>
            <p>
              {t("Conheça") + " "}
              {first.name}.
            </p>
            <span className="inline-flex items-center gap-7 bg-white text-foreground font-semibold text-[11px] [padding:13px_20px] rounded-[5px]">
              {t("Explore esta estadia") + " "}
              <ArrowRight size={17} aria-hidden="true" />
            </span>
          </div>
          <span className="absolute right-[35px] bottom-[30px] [writing-mode:vertical-rl] text-[10px] tracking-[0.12em] max-[760.01px]:right-[18px] max-[760.01px]:bottom-[25px] max-[760.01px]:text-[8px]">
            {t("Uma nova perspectiva")}
          </span>
        </Link>
      </section>
      <section className="container w-[min(1280px,_calc(100%_-_80px))] mx-auto max-[1200.01px]:w-[calc(100%_-_56px)] max-[760.01px]:w-[calc(100%_-_36px)] max-[360.01px]:w-[calc(100%_-_28px)] py-17.5 max-[760.01px]:py-[45px]">
        <div className="flex justify-between gap-6 items-end mb-7 [&_h2]:mb-0 [&_p]:mb-0 [&_.eyebrow]:mb-[9px] [&_>_span]:text-[12px] [&_>_span]:pb-[5px] max-[760.01px]:flex-col max-[760.01px]:items-start max-[760.01px]:gap-3 max-[760.01px]:mb-5.5 max-[760.01px]:[&_h2]:text-[25px] max-[760.01px]:[&_>_span]:text-[10px]">
          <div>
            <p className="eyebrow text-primary text-[11px] font-[650] tracking-[0.1em] uppercase mb-3">
              {t("O próximo destino pode estar aqui")}
            </p>
            <h2>{t("Estadias que inspiram.")}</h2>
          </div>
          <span className="muted text-muted-foreground">
            {t("Hotéis em destaque no nosso catálogo")}
          </span>
        </div>
        <div className="grid grid-cols-[repeat(4,_minmax(0,_1fr))] gap-5.5 max-[1000.01px]:grid-cols-[repeat(2,_minmax(0,_1fr))] max-[760.01px]:gap-3.5 max-[360.01px]:grid-cols-[1fr]">
          {hotels.data.map((hotel) => (
            <Link
              className="bg-white border border-border rounded-[9px] overflow-hidden [&:hover_img]:[transform:scale(1.04)] [&_>_.photo]:aspect-[1.3] max-[1000.01px]:[&_>_.photo]:aspect-[1.65] max-[760.01px]:[&_>_.photo]:aspect-[1.15] max-[360.01px]:[&_>_.photo]:aspect-[1.7]"
              href={href(`/hotel/${hotel.id}`)}
              key={hotel.id}
            >
              <Photo
                src={hotel.thumbnail}
                alt={hotel.name}
                sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="p-5 [&_>_span]:text-[10px] [&_>_span]:text-muted-foreground [&_h3]:text-[15px] [&_h3]:mt-[5px] [&_h3]:min-h-11 [&_h3]:mb-5 [&_>_div]:flex [&_>_div]:items-center [&_>_div]:justify-between [&_>_div]:gap-3 [&_p]:text-[10px] [&_p]:m-0 [&_strong]:block [&_strong]:text-[16px] [&_strong]:mt-0.5 [&_small]:text-muted-foreground [&_svg]:text-primary [&_svg]:shrink-0 max-[1000.01px]:[&_h3]:min-h-auto max-[760.01px]:p-3.5 max-[760.01px]:[&_h3]:text-[12px] max-[760.01px]:[&_h3]:min-h-[50px] max-[760.01px]:[&_h3]:mb-3 max-[760.01px]:[&_>_span]:text-[8px] max-[760.01px]:[&_>_div]:items-end max-[760.01px]:[&_>_div]:gap-[3px] max-[760.01px]:[&_strong]:text-[14px] max-[760.01px]:[&_p]:text-[8px] max-[760.01px]:[&_small]:text-[8px] max-[760.01px]:[&_svg]:w-[14px] max-[360.01px]:[&_h3]:min-h-auto">
                <span>{hotel.destination}</span>
                <h3>{hotel.name}</h3>
                <div>
                  <p>
                    {t("A partir de") + " "}
                    <strong>{money(hotel.pricePerNight)}</strong>
                    <small>{" " + t("/ noite")}</small>
                  </p>
                  <MoveUpRight size={18} aria-hidden="true" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="bg-[#eaf0ff] py-15 max-[760.01px]:py-10">
        <div className="container w-[min(1280px,_calc(100%_-_80px))] mx-auto max-[1200.01px]:w-[calc(100%_-_56px)] max-[760.01px]:w-[calc(100%_-_36px)] max-[360.01px]:w-[calc(100%_-_28px)] grid grid-cols-[1fr_1fr] gap-20 items-center [&_>_p]:text-[clamp(27px,_3vw,_40px)] [&_>_p]:leading-[1.25] [&_>_p]:font-[450] [&_>_p]:tracking-[-0.04em] [&_>_p]:mb-0 [&_>_p_strong]:font-bold [&_h2]:text-[20px] [&_>_div_>_p]:text-muted-foreground [&_>_div_>_p]:text-[12px] [&_>_div_>_p]:max-w-115 [&_a]:inline-flex [&_a]:gap-5 [&_a]:items-center [&_a]:text-primary [&_a]:font-semibold [&_a]:text-[12px] [&_a]:mt-2 max-[760.01px]:grid-cols-[1fr] max-[760.01px]:gap-7.5 max-[760.01px]:[&_>_p]:text-[33px] max-[760.01px]:[&_h2]:text-[19px] max-[760.01px]:[&_h2]:max-w-[350px]">
          <p>
            {t("Menos pressa.")}
            <br />
            <strong>{t("Mais descobertas.")}</strong>
          </p>
          <div>
            <h2>{t("Seu próximo capítulo começa com uma escolha.")}</h2>
            <p>
              {t(
                "Explore os destinos disponíveis, encontre uma acomodação que combina com você e planeje sua próxima pausa."
              )}
            </p>
            <Link href="#buscar">
              {t("Encontre sua estadia") + " "}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
