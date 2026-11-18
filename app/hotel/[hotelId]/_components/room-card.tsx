import { BedDouble, Users, Ruler, ArrowRight } from "lucide-react";
import { Photo } from "@/components/photo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { amenityLabels, type Room } from "@/features/hotels/model";
import { money } from "@/lib/format";
import {
  nightsBetween,
  calculateTotal,
  selectionProblem,
} from "@/features/booking/model";
import type { Search } from "@/features/search/model";

export function RoomCard({
  room,
  hotelId,
  search,
  onSelect,
}: {
  room: Room;
  hotelId: number;
  search: Search | null;
  onSelect: () => void;
}) {
  const problem = search
    ? selectionProblem(room, hotelId, search)
    : "Informe datas e hóspedes para selecionar.";
  const bedLabels: Record<string, string> = {
    king: "king",
    queen: "queen",
    single: "solteiro",
    double: "casal",
    twin: "solteiro",
    sofa_bed: "sofá-cama",
  };
  return (
    <article className="room-card">
      <Photo
        src={room.images[0]}
        alt={room.name}
        sizes="(max-width: 700px) 100vw, 250px"
      />
      <div className="room-info">
        <h3>{room.name}</h3>
        <div className="room-facts">
          <span>
            <Users size={14} aria-hidden="true" />
            Até {room.maxGuests} hóspedes
          </span>
          <span>
            <Ruler size={14} aria-hidden="true" />
            {room.size} m²
          </span>
          <span>
            <BedDouble size={14} aria-hidden="true" />
            {room.beds
              .map(
                (bed) => `${bed.quantity} ${bedLabels[bed.type] ?? bed.type}`,
              )
              .join(" · ")}
          </span>
        </div>
        <p>{room.description}</p>
        <div className="amenity-list">
          {room.amenities.slice(0, 5).map((amenity) => (
            <Badge variant="secondary" key={amenity}>
              {amenityLabels[amenity] ?? amenity}
            </Badge>
          ))}
        </div>
      </div>
      <div className="room-price">
        <strong>{money(room.pricePerNight)}</strong>
        <small>por noite · por quarto</small>
        {search && (
          <p>
            {money(
              calculateTotal(
                room.pricePerNight,
                nightsBetween(search.checkIn, search.checkOut),
                search.rooms,
              ),
            )}
            <small> total para {search.rooms} quarto(s)</small>
          </p>
        )}
        <Button disabled={!!problem} onClick={onSelect}>
          Selecionar quarto
          <ArrowRight aria-hidden="true" />
        </Button>
        {problem && <small className="room-problem">{problem}</small>}
      </div>
    </article>
  );
}
