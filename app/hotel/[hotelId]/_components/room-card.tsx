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
  /** Tipo de quarto exibido, incluindo diária, capacidade e unidades disponíveis. */
  room: Room;
  /** Hotel aberto na rota, usado para validar o vínculo do quarto. */
  hotelId: number;
  /** Contexto de datas e ocupação. `null` permite ver o quarto e impede selecioná-lo. */
  search: Search | null;
  /** Acionado pelo botão de seleção quando o quarto atende ao contexto da busca. */
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
    <article className="grid grid-cols-[240px_minmax(0,_1fr)_235px] bg-white border border-border rounded-[9px] overflow-hidden mt-4.5 [&_>_.photo]:min-h-[250px] max-[1200.01px]:grid-cols-[190px_minmax(0,_1fr)_210px] max-[1000.01px]:grid-cols-[190px_minmax(0,_1fr)] max-[1000.01px]:[&_>_.photo]:row-[span_2] max-[760.01px]:grid-cols-[1fr] max-[760.01px]:[&_>_.photo]:row-auto max-[760.01px]:[&_>_.photo]:h-50 max-[760.01px]:[&_>_.photo]:min-h-0">
      <Photo
        src={room.images[0]}
        alt={room.name}
        sizes="(max-width: 700px) 100vw, 250px"
      />
      <div className="p-6 [&_h3]:mb-3 [&_>_p]:text-[11px] [&_>_p]:text-muted-foreground [&_>_p]:leading-[1.8] max-[760.01px]:p-5.5">
        <h3>{room.name}</h3>
        <div className="flex flex-wrap gap-3 mb-[15px] [&_span]:flex [&_span]:items-center [&_span]:gap-[5px] [&_span]:text-[10px] [&_span]:text-muted-foreground">
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
                (bed) => `${bed.quantity} ${bedLabels[bed.type] ?? bed.type}`
              )
              .join(" · ")}
          </span>
        </div>
        <p>{room.description}</p>
        <div className="flex flex-wrap gap-1.5 [&_>_*]:text-[9px] [&_>_*]:font-[450] [&_>_*]:[padding:3px_7px] [&_>_*]:rounded-[4px] [&_>_*]:shadow-none">
          {room.amenities.slice(0, 5).map((amenity) => (
            <Badge variant="secondary" key={amenity}>
              {amenityLabels[amenity] ?? amenity}
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-end justify-center text-right border-l border-l-border my-[23px] px-[23px] [&_>_strong]:text-[22px] [&_>_strong]:tracking-[-0.04em] [&_>_small]:text-[9px] [&_>_small]:text-muted-foreground [&_>_p]:text-[12px] [&_>_p]:font-[650] [&_>_p]:mt-4.5 [&_>_p]:mb-4.5 [&_>_p_small]:text-[9px] [&_>_p_small]:block [&_>_p_small]:font-[450] [&_>_p_small]:text-muted-foreground [&_>_button]:w-full [&_>_button]:text-[11px] [&_>_button]:mt-1.5 [&_.room-problem]:mt-2.5 [&_.room-problem]:leading-[1.6] max-[1000.01px]:col-[2] max-[1000.01px]:items-start max-[1000.01px]:text-left max-[1000.01px]:border-0 max-[1000.01px]:mt-0 max-[1000.01px]:[&_>_button]:w-auto max-[1000.01px]:[&_>_p]:my-2 max-[760.01px]:col-auto max-[760.01px]:[padding:0_22px_22px] max-[760.01px]:m-0 max-[760.01px]:[&_>_button]:w-full max-[760.01px]:[&_>_button]:mt-3">
        <strong>{money(room.pricePerNight)}</strong>
        <small>por noite · por quarto</small>
        {search && (
          <p>
            {money(
              calculateTotal(
                room.pricePerNight,
                nightsBetween(search.checkIn, search.checkOut),
                search.rooms
              )
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
