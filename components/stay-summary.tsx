import { CalendarDays, Users, BedDouble, Check } from "lucide-react";
import { Photo } from "@/components/photo";
import { displayDate, money } from "@/lib/format";
import { nightsBetween, calculateTotal } from "@/features/booking/model";

export type StaySummaryData = {
  hotelName: string;
  hotelImage: string;
  hotelAddress: string;
  roomName: string;
  pricePerNight: number;
  cancellationPolicy: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  totalPrice?: number;
};
export function StaySummary({ stay }: { stay: StaySummaryData }) {
  const nights = nightsBetween(stay.checkIn, stay.checkOut);
  return (
    <aside className="stay-summary">
      <Photo
        src={stay.hotelImage}
        alt={stay.hotelName}
        sizes="(max-width: 900px) 100vw, 400px"
      />
      <div className="summary-content">
        <p className="eyebrow">Sua estadia</p>
        <h2>{stay.hotelName}</h2>
        <p className="muted summary-address">{stay.hotelAddress}</p>
        <div className="summary-dates">
          <div>
            <span>Check-in</span>
            <strong>{displayDate(stay.checkIn)}</strong>
          </div>
          <div>
            <span>Check-out</span>
            <strong>{displayDate(stay.checkOut)}</strong>
          </div>
        </div>
        <p className="summary-line">
          <CalendarDays size={17} aria-hidden="true" />
          {nights} {nights === 1 ? "noite" : "noites"}
        </p>
        <p className="summary-line">
          <BedDouble size={17} aria-hidden="true" />
          {stay.rooms} quarto(s) · {stay.roomName}
        </p>
        <p className="summary-line">
          <Users size={17} aria-hidden="true" />
          {stay.adults} adulto(s)
          {stay.children > 0 && ` · ${stay.children} criança(s)`}
        </p>
        <p className="summary-policy">
          <Check size={17} aria-hidden="true" />
          {stay.cancellationPolicy}
        </p>
        <div className="price-breakdown">
          <span>
            {money(stay.pricePerNight)} × {nights} noite(s) × {stay.rooms}{" "}
            quarto(s)
          </span>
          <strong>
            {money(
              stay.totalPrice ??
                calculateTotal(stay.pricePerNight, nights, stay.rooms),
            )}
          </strong>
        </div>
        <div className="summary-total">
          <span>Total da estadia</span>
          <strong>
            {money(
              stay.totalPrice ??
                calculateTotal(stay.pricePerNight, nights, stay.rooms),
            )}
          </strong>
        </div>
        <p className="summary-disclaimer">
          Reserva demonstrativa. Nenhum valor será cobrado.
        </p>
      </div>
    </aside>
  );
}
