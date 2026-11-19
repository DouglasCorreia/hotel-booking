"use client";
import { useLocale } from "@/lib/i18n/client";
import { localizeCatalogText } from "@/lib/i18n/messages";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, MapPin, Star, Clock3, Check } from "lucide-react";
import { useHotel, useRooms } from "@/features/hotels/hooks";
import { amenityLabels, cancellationLabels } from "@/features/hotels/model";
import {
  parseSearch,
  searchParamsFor,
  defaultSearch,
} from "@/features/search/model";
import { useBookingStore } from "@/features/booking/store";
import { SearchForm } from "@/features/search/_components/search-form";
import { LoadingCards, Feedback, QueryError } from "@/components/feedback";
import { ApiError } from "@/lib/api/client";
import { Gallery } from "./gallery";
import { RoomCard } from "./room-card";

export function HotelContent({ hotelId }: { hotelId: string }) {
  const { locale, catalog, href, t, number, displayTime, quantity } =
    useLocale();
  const id = /^\d+$/.test(hotelId) ? Number(hotelId) : -1;
  const hotel = useHotel(id);
  const rooms = useRooms(id);
  const params = useSearchParams();
  const router = useRouter();
  const select = useBookingStore((state) => state.select);
  if (hotel.isPending) return <LoadingCards />;
  if (hotel.isError)
    return hotel.error instanceof ApiError && hotel.error.status === 404 ? (
      <Feedback title={t("Hotel não encontrado")}>
        {t(
          "Este hotel não está no catálogo. Volte à busca para encontrar outra opção."
        )}
      </Feedback>
    ) : (
      <QueryError error={hotel.error} onRetry={() => hotel.refetch()} />
    );
  const item = hotel.data;
  const description = localizeCatalogText(item.description, locale, catalog);
  const parsed = parseSearch(params);
  const search = parsed?.destination === item.destination ? parsed : null;
  return (
    <>
      <Link
        href={href(search ? `/search?${params}` : "/#buscar")}
        className="inline-flex items-center gap-[7px] text-[11px] text-muted-foreground mb-[25px] [&:hover]:text-primary"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        {t("Voltar à busca")}
      </Link>
      <div className="flex gap-7.5 justify-between items-center mb-7 [&_h1]:text-[36px] [&_h1]:mb-3 [&_.location]:flex [&_.location]:gap-1.5 [&_.location]:items-center [&_.location]:text-[11px] [&_.location]:mb-0 max-[760.01px]:flex-col max-[760.01px]:items-start max-[760.01px]:gap-[15px] max-[760.01px]:[&_h1]:text-[28px]">
        <div>
          <p className="eyebrow text-primary text-[11px] font-[650] tracking-[0.1em] uppercase mb-3">
            {item.destination}
          </p>
          <h1>{item.name}</h1>
          <p className="muted text-muted-foreground location">
            <MapPin size={15} aria-hidden="true" />
            {item.address}
          </p>
        </div>
        <div className="shrink-0 text-right [&_strong]:flex [&_strong]:items-center [&_strong]:justify-end [&_strong]:gap-2 [&_strong]:text-[23px] [&_strong_>_svg]:text-amber [&_small]:text-[12px] [&_small]:font-[450] [&_small]:text-muted-foreground [&_>_span]:text-[10px] [&_>_span]:text-muted-foreground max-[760.01px]:flex max-[760.01px]:gap-[15px] max-[760.01px]:items-center max-[760.01px]:[&_strong]:text-[17px]">
          <strong>
            <Star size={17} fill="currentColor" aria-hidden="true" />
            {number(item.rating)}
            <small>/ 5</small>
          </strong>
          <span>
            {quantity(
              item.reviewCount,
              "{count} avaliação",
              "{count} avaliações"
            )}
          </span>
        </div>
      </div>
      <Gallery images={item.images} name={item.name} />
      <div className="grid grid-cols-[1.6fr_1fr] gap-20 py-[45px] border-b border-b-border [&_h2]:text-[24px] max-[1200.01px]:gap-[35px] max-[760.01px]:grid-cols-[1fr] max-[760.01px]:gap-[25px] max-[760.01px]:py-7.5">
        <section>
          <p className="eyebrow text-primary text-[11px] font-[650] tracking-[0.1em] uppercase mb-3">
            {t("Conheça sua estadia")}
          </p>
          <h2>{t("Um pouco sobre este lugar.")}</h2>
          <p
            lang={description.lang}
            className="text-[13px] leading-[1.9] text-muted-foreground"
          >
            {description.text}
          </p>
          <div className="grid grid-cols-[repeat(3,_1fr)] gap-[15px] mt-7 [&_>_span]:flex [&_>_span]:items-center [&_>_span]:gap-[7px] [&_>_span]:text-[11px] [&_svg]:text-primary [&_svg]:shrink-0 max-[1000.01px]:grid-cols-[1fr_1fr] max-[760.01px]:gap-[15px_10px] max-[760.01px]:[&_>_span]:text-[10px]">
            {item.amenities.map((amenity) => (
              <span key={amenity}>
                <Check size={16} aria-hidden="true" />
                {t(amenityLabels[amenity] ?? amenity)}
              </span>
            ))}
          </div>
        </section>
        <aside className="p-6 border border-border rounded-[8px] self-start bg-white [&_h3]:text-[15px] [&_h3]:mb-[19px] [&_p]:flex [&_p]:gap-2.5 [&_p]:items-center [&_p]:text-[11px] [&_p]:mb-[15px] [&_svg]:text-primary [&_svg]:shrink-0 [&_small]:block [&_small]:border-t [&_small]:border-t-border [&_small]:pt-[15px] [&_small]:text-[10px] [&_small]:text-muted-foreground">
          <h3>{t("Bom saber antes de ir")}</h3>
          <p>
            <Clock3 size={16} aria-hidden="true" />
            <span>
              {t("Check-in a partir das") + " "}
              <strong>{displayTime(item.checkInTime)}</strong>
            </span>
          </p>
          <p>
            <Clock3 size={16} aria-hidden="true" />
            <span>
              {t("Check-out até as") + " "}
              <strong>{displayTime(item.checkOutTime)}</strong>
            </span>
          </p>
          <p>
            <Check size={16} aria-hidden="true" />
            {t(cancellationLabels[item.cancellationPolicy])}
          </p>
          <small>
            {t(
              "Consulte as condições apresentadas antes de confirmar sua reserva simulada."
            )}
          </small>
        </aside>
      </div>
      <section className="pt-10 max-[760.01px]:pt-7.5">
        <div className="flex justify-between gap-6 items-end mb-7 [&_h2]:mb-0 [&_p]:mb-0 [&_.eyebrow]:mb-[9px] [&_>_span]:text-[12px] [&_>_span]:pb-[5px] max-[760.01px]:flex-col max-[760.01px]:items-start max-[760.01px]:gap-3 max-[760.01px]:mb-5.5 max-[760.01px]:[&_h2]:text-[25px] max-[760.01px]:[&_>_span]:text-[10px]">
          <div>
            <p className="eyebrow text-primary text-[11px] font-[650] tracking-[0.1em] uppercase mb-3">
              {t("Do seu jeito")}
            </p>
            <h2>{t("Escolha onde descansar.")}</h2>
          </div>
          <span className="muted text-muted-foreground">
            {t("Um tipo de quarto por reserva")}
          </span>
        </div>
        {!search ? (
          <div className="mb-[25px] [&_>_p]:text-[12px] [&_>_p]:text-muted-foreground">
            <p>
              {t(
                "Informe destino, datas e hóspedes para selecionar sua acomodação."
              )}
            </p>
            <SearchForm
              initial={{ ...defaultSearch(), destination: item.destination }}
              onSearch={(values) =>
                router.replace(
                  href(`/hotel/${item.id}?${searchParamsFor(values)}`)
                )
              }
            />
          </div>
        ) : (
          <div className="flex justify-between gap-5 [padding:15px_20px] border border-border rounded-[7px] mb-5.5 text-[11px] [&_a]:text-primary [&_a]:font-semibold max-[760.01px]:p-3 max-[760.01px]:text-[10px]">
            <span>
              {quantity(search.rooms, "{count} quarto", "{count} quartos")} ·{" "}
              {quantity(search.adults, "{count} adulto", "{count} adultos")}
              {search.children > 0 &&
                ` · ${quantity(search.children, "{count} criança", "{count} crianças")}`}
            </span>
            <Link href={href(`/search?${searchParamsFor(search)}`)}>
              {t("Alterar busca")}
            </Link>
          </div>
        )}
        {rooms.isPending ? (
          <LoadingCards count={2} />
        ) : rooms.isError ? (
          <QueryError
            error={rooms.error}
            onRetry={() => rooms.refetch()}
            title={t("Não foi possível carregar os quartos")}
          />
        ) : rooms.data.length === 0 ? (
          <Feedback title={t("Sem quartos disponíveis")} isEmpty>
            {t("Encontre outra hospedagem na busca.")}
          </Feedback>
        ) : (
          rooms.data.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              hotelId={item.id}
              search={search}
              onSelect={() => {
                if (!search) return;
                select({
                  hotelId: item.id,
                  roomId: room.id,
                  search,
                  pricePerNight: room.pricePerNight,
                });
                router.push(href("/checkout"));
              }}
            />
          ))
        )}
      </section>
    </>
  );
}
