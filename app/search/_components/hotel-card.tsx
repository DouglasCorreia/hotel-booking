import Link from "next/link";
import { ArrowRight, MapPin, Star, Check } from "lucide-react";
import { Photo } from "@/components/photo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { amenityLabels, type Hotel } from "@/features/hotels/model";
import { money } from "@/lib/format";

export function HotelCard({ hotel, query }: { hotel: Hotel; query: string }) {
  return (
    <article className="hotel-card">
      <Link
        href={`/hotel/${hotel.id}?${query}`}
        className="hotel-photo-link"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Photo
          src={hotel.thumbnail}
          alt=""
          sizes="(max-width: 700px) 100vw, 280px"
        />
      </Link>
      <div className="hotel-card-info">
        <div className="hotel-card-top">
          <span className="property-label">
            {
              { hotel: "Hotel", pousada: "Pousada", resort: "Resort" }[
                hotel.propertyType
              ]
            }
          </span>
          <span className="rating">
            <Star size={13} fill="currentColor" aria-hidden="true" />
            {hotel.rating.toLocaleString("pt-BR")}
            <small> / 5</small>
          </span>
        </div>
        <h2>{hotel.name}</h2>
        <p className="hotel-location">
          <MapPin size={13} aria-hidden="true" />
          {hotel.destination}
        </p>
        <div className="amenity-list">
          {hotel.amenities.slice(0, 4).map((amenity) => (
            <Badge variant="secondary" key={amenity}>
              {amenityLabels[amenity] ?? amenity}
            </Badge>
          ))}
        </div>
        <span className="review-count">
          {hotel.reviewCount.toLocaleString("pt-BR")} avaliações
        </span>
        {hotel.availableRooms === 0 ? (
          <span className="unavailable">Esgotado</span>
        ) : (
          hotel.cancellationPolicy === "free" && (
            <span className="positive">
              <Check size={13} aria-hidden="true" />
              Cancelamento gratuito
            </span>
          )
        )}
      </div>
      <div className="hotel-card-price">
        <span>A partir de</span>
        <strong>{money(hotel.pricePerNight)}</strong>
        <small>por noite · por quarto</small>
        <Button asChild>
          <Link
            aria-label={`Ver hotel ${hotel.name}`}
            href={`/hotel/${hotel.id}?${query}`}
          >
            Ver hotel <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
