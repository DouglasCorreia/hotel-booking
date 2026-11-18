import Link from "next/link";
import { ArrowRight, MapPin, Star, Check } from "lucide-react";
import { Photo } from "@/components/photo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { amenityLabels, type Hotel } from "@/features/hotels/model";
import { money } from "@/lib/format";

export function HotelCard({ hotel, query }: { hotel: Hotel; query: string }) {
  return (
    <article className="grid grid-cols-[230px_minmax(0,_1fr)_180px] bg-white border border-border rounded-[10px] overflow-hidden [&_h2]:text-[17px] [&_h2]:[margin:9px_0_8px] [&_h2]:leading-[1.35] max-[1200.01px]:grid-cols-[190px_minmax(0,_1fr)_155px] max-[1000.01px]:grid-cols-[180px_minmax(0,_1fr)] max-[760.01px]:grid-cols-[1fr] max-[760.01px]:[&_h2]:text-[20px]">
      <Link
        href={`/hotel/${hotel.id}?${query}`}
        className="min-h-[235px] [&_.photo]:h-full max-[1000.01px]:row-[span_2] max-[760.01px]:row-auto max-[760.01px]:h-[210px]"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Photo
          src={hotel.thumbnail}
          alt=""
          sizes="(max-width: 700px) 100vw, 280px"
        />
      </Link>
      <div className="p-5 max-[1200.01px]:p-4 max-[760.01px]:p-5">
        <div className="flex items-center justify-between gap-2.5">
          <span className="text-muted-foreground text-[10px]">
            {
              { hotel: "Hotel", pousada: "Pousada", resort: "Resort" }[
                hotel.propertyType
              ]
            }
          </span>
          <span className="text-amber flex items-center gap-1 text-[12px] font-bold [&_small]:text-muted-foreground [&_small]:font-[450] [&_small]:text-[9px]">
            <Star size={13} fill="currentColor" aria-hidden="true" />
            {hotel.rating.toLocaleString("pt-BR")}
            <small> / 5</small>
          </span>
        </div>
        <h2>{hotel.name}</h2>
        <p className="flex gap-[5px] items-center text-[10px] text-muted-foreground mb-[15px]">
          <MapPin size={13} aria-hidden="true" />
          {hotel.destination}
        </p>
        <div className="flex flex-wrap gap-1.5 [&_>_*]:text-[9px] [&_>_*]:font-[450] [&_>_*]:[padding:3px_7px] [&_>_*]:rounded-[4px] [&_>_*]:shadow-none">
          {hotel.amenities.slice(0, 4).map((amenity) => (
            <Badge variant="secondary" key={amenity}>
              {amenityLabels[amenity] ?? amenity}
            </Badge>
          ))}
        </div>
        <span className="block text-[9px] text-muted-foreground mt-[13px]">
          {hotel.reviewCount.toLocaleString("pt-BR")} avaliações
        </span>
        {hotel.availableRooms === 0 ? (
          <span className="block text-destructive text-[11px] font-semibold mt-1.5">
            Esgotado
          </span>
        ) : (
          hotel.cancellationPolicy === "free" && (
            <span className="inline-flex items-center gap-1 text-positive text-[10px] mt-1.5">
              <Check size={13} aria-hidden="true" />
              Cancelamento gratuito
            </span>
          )
        )}
      </div>
      <div className="flex flex-col justify-end items-end border-l border-l-border my-5 px-4.5 text-right [&_>_span]:text-[10px] [&_>_span]:text-muted-foreground [&_>_strong]:text-[21px] [&_>_strong]:tracking-[-0.04em] [&_>_strong]:[margin:2px_0] [&_>_small]:text-[9px] [&_>_small]:text-muted-foreground [&_>_a]:mt-5 [&_>_a]:w-full [&_>_a]:text-[11px] max-[1200.01px]:px-[13px] max-[1200.01px]:[&_>_strong]:text-[18px] max-[1000.01px]:col-[2] max-[1000.01px]:m-0 max-[1000.01px]:[padding:0_16px_18px] max-[1000.01px]:border-0 max-[1000.01px]:items-start max-[1000.01px]:text-left max-[1000.01px]:[&_>_a]:mt-3 max-[760.01px]:col-auto max-[760.01px]:[margin:0_20px] max-[760.01px]:[padding:18px_0] max-[760.01px]:border-t max-[760.01px]:border-t-border max-[760.01px]:grid max-[760.01px]:grid-cols-[1fr_auto] max-[760.01px]:gap-[2px_15px] max-[760.01px]:items-center max-[760.01px]:[&_>_span]:col-[1] max-[760.01px]:[&_>_strong]:col-[1] max-[760.01px]:[&_>_strong]:text-[23px] max-[760.01px]:[&_>_small]:col-[1] max-[760.01px]:[&_>_a]:col-[2] max-[760.01px]:[&_>_a]:row-[1_/_4] max-[760.01px]:[&_>_a]:m-0 max-[760.01px]:[&_>_a]:px-5">
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
