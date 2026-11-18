"use client";
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
  const id = /^\d+$/.test(hotelId) ? Number(hotelId) : -1;
  const hotel = useHotel(id);
  const rooms = useRooms(id);
  const params = useSearchParams();
  const router = useRouter();
  const select = useBookingStore((state) => state.select);
  if (hotel.isPending) return <LoadingCards />;
  if (hotel.isError)
    return hotel.error instanceof ApiError && hotel.error.status === 404 ? (
      <Feedback title="Hotel não encontrado">
        Este hotel não está no catálogo. Volte à busca para encontrar outra
        opção.
      </Feedback>
    ) : (
      <QueryError error={hotel.error} onRetry={() => hotel.refetch()} />
    );
  const item = hotel.data;
  const parsed = parseSearch(params);
  const search = parsed?.destination === item.destination ? parsed : null;
  return (
    <>
      <Link
        href={search ? `/search?${params}` : "/#buscar"}
        className="back-link"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Voltar à busca
      </Link>
      <div className="hotel-heading">
        <div>
          <p className="eyebrow">{item.destination}</p>
          <h1>{item.name}</h1>
          <p className="muted location">
            <MapPin size={15} aria-hidden="true" />
            {item.address}
          </p>
        </div>
        <div className="hotel-rating">
          <strong>
            <Star size={17} fill="currentColor" aria-hidden="true" />
            {item.rating.toLocaleString("pt-BR")}
            <small>/ 5</small>
          </strong>
          <span>{item.reviewCount.toLocaleString("pt-BR")} avaliações</span>
        </div>
      </div>
      <Gallery images={item.images} name={item.name} />
      <div className="hotel-overview">
        <section>
          <p className="eyebrow">Conheça sua estadia</p>
          <h2>Um pouco sobre este lugar.</h2>
          <p className="hotel-description">{item.description}</p>
          <div className="hotel-amenities">
            {item.amenities.map((amenity) => (
              <span key={amenity}>
                <Check size={16} aria-hidden="true" />
                {amenityLabels[amenity] ?? amenity}
              </span>
            ))}
          </div>
        </section>
        <aside className="conditions">
          <h3>Bom saber antes de ir</h3>
          <p>
            <Clock3 size={16} aria-hidden="true" />
            <span>
              Check-in a partir das <strong>{item.checkInTime}</strong>
            </span>
          </p>
          <p>
            <Clock3 size={16} aria-hidden="true" />
            <span>
              Check-out até as <strong>{item.checkOutTime}</strong>
            </span>
          </p>
          <p>
            <Check size={16} aria-hidden="true" />
            {cancellationLabels[item.cancellationPolicy]}
          </p>
          <small>
            Consulte as condições apresentadas antes de confirmar sua reserva
            simulada.
          </small>
        </aside>
      </div>
      <section className="rooms-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Do seu jeito</p>
            <h2>Escolha onde descansar.</h2>
          </div>
          <span className="muted">Um tipo de quarto por reserva</span>
        </div>
        {!search ? (
          <div className="detail-search">
            <p>
              Informe destino, datas e hóspedes para selecionar sua acomodação.
            </p>
            <SearchForm
              initial={{ ...defaultSearch(), destination: item.destination }}
              onSearch={(values) =>
                router.replace(`/hotel/${item.id}?${searchParamsFor(values)}`)
              }
            />
          </div>
        ) : (
          <div className="stay-context">
            <span>
              {search.rooms} quarto(s) · {search.adults} adulto(s)
              {search.children > 0 && ` · ${search.children} criança(s)`}
            </span>
            <Link href={`/search?${searchParamsFor(search)}`}>
              Alterar busca
            </Link>
          </div>
        )}
        {rooms.isPending ? (
          <LoadingCards count={2} />
        ) : rooms.isError ? (
          <QueryError
            error={rooms.error}
            onRetry={() => rooms.refetch()}
            title="Não foi possível carregar os quartos"
          />
        ) : rooms.data.length === 0 ? (
          <Feedback title="Sem quartos disponíveis" isEmpty>
            Encontre outra hospedagem na busca.
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
                router.push("/checkout");
              }}
            />
          ))
        )}
      </section>
    </>
  );
}
