"use client";
import Link from "next/link";
import { ArrowRight, MapPin, MoveUpRight } from "lucide-react";
import { Photo } from "@/components/photo";
import { LoadingCards, QueryError } from "@/components/feedback";
import { useFeaturedHotels } from "@/features/hotels/hooks";
import { money } from "@/lib/format";

export function HomeContent() {
  const hotels = useFeaturedHotels();
  if (hotels.isPending)
    return (
      <div className="container">
        <LoadingCards />
      </div>
    );
  if (hotels.isError)
    return (
      <div className="container">
        <QueryError error={hotels.error} onRetry={() => hotels.refetch()} />
      </div>
    );
  if (!hotels.data.length) return null;
  const first = hotels.data[0];
  return (
    <>
      <section className="container home-feature">
        <Link
          href={`/hotel/${first.id}`}
          className="feature-link"
          aria-label={`Conhecer ${first.name}`}
        >
          <Photo
            src={first.images[0]}
            alt={first.name}
            sizes="(max-width: 1280px) 100vw, 1280px"
            preload
          />
          <div className="feature-shade" />
          <div className="feature-copy">
            <span className="feature-kicker">
              <MapPin size={14} aria-hidden="true" />
              {first.destination}
            </span>
            <h2>
              Um lugar para sair
              <br />
              da rotina.
            </h2>
            <p>Conheça {first.name}.</p>
            <span className="feature-cta">
              Explore esta estadia <ArrowRight size={17} aria-hidden="true" />
            </span>
          </div>
          <span className="feature-number">Uma nova perspectiva</span>
        </Link>
      </section>
      <section className="container section" id="inspiracao">
        <div className="section-heading">
          <div>
            <p className="eyebrow">O próximo destino pode estar aqui</p>
            <h2>Estadias que inspiram.</h2>
          </div>
          <span className="muted">Hotéis em destaque no nosso catálogo</span>
        </div>
        <div className="inspiration-grid">
          {hotels.data.map((hotel) => (
            <Link
              className="inspiration-card"
              href={`/hotel/${hotel.id}`}
              key={hotel.id}
            >
              <Photo
                src={hotel.thumbnail}
                alt={hotel.name}
                sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="inspiration-info">
                <span>{hotel.destination}</span>
                <h3>{hotel.name}</h3>
                <div>
                  <p>
                    A partir de <strong>{money(hotel.pricePerNight)}</strong>
                    <small> / noite</small>
                  </p>
                  <MoveUpRight size={18} aria-hidden="true" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="travel-note">
        <div className="container travel-note-inner">
          <p>
            Menos pressa.
            <br />
            <strong>Mais descobertas.</strong>
          </p>
          <div>
            <h2>Seu próximo capítulo começa com uma escolha.</h2>
            <p>
              Explore os destinos disponíveis, encontre uma acomodação que
              combina com você e planeje sua próxima pausa.
            </p>
            <Link href="#buscar">
              Encontre sua estadia <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
