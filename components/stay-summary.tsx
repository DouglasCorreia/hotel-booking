import { useLocale } from "@/lib/i18n/client";
import { CalendarDays, Users, BedDouble, Check } from "lucide-react";
import { Photo } from "@/components/photo";
import { localizeCatalogText } from "@/lib/i18n/messages";
import { cancellationLabels } from "@/features/hotels/model";
import {
  nightsBetween,
  calculateTotal,
  type PriceBreakdown,
} from "@/features/booking/model";

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
  /** Total salvo para uso quando a reserva não tem composição de preço detalhada. */
  totalPrice?: number;
};
export function StaySummary({
  stay,
  pricing,
}: {
  /** Dados da estadia. O total salvo vem antes do cálculo por diária, noites e quartos. */
  stay: StaySummaryData;
  /** Composição da revisão ou da reserva confirmada. Quando presente, define o total exibido. */
  pricing?: PriceBreakdown;
}) {
  const { t, locale, catalog, money, displayDate, quantity } = useLocale();
  const roomName = localizeCatalogText(stay.roomName, locale, catalog);
  const knownPolicy = Object.values(cancellationLabels).some(
    (label) => label === stay.cancellationPolicy
  );
  const policy = knownPolicy
    ? t(stay.cancellationPolicy)
    : stay.cancellationPolicy;
  const nights = nightsBetween(stay.checkIn, stay.checkOut);
  const total =
    pricing?.total ??
    stay.totalPrice ??
    calculateTotal(stay.pricePerNight, nights, stay.rooms);
  return (
    <aside className="stay-summary bg-white border border-border rounded-[10px] overflow-hidden [&_>_.photo]:h-[190px]">
      <Photo
        src={stay.hotelImage}
        alt={stay.hotelName}
        sizes="(max-width: 900px) 100vw, 400px"
      />
      <div className="p-[25px] [&_h2]:text-[20px] [&_h2]:mb-2 [&_.eyebrow]:text-[9px] [&_.eyebrow]:mb-2 max-[1000.01px]:p-5">
        <p className="eyebrow text-primary text-[11px] font-[650] tracking-[0.1em] uppercase mb-3">
          {t("Sua estadia")}
        </p>
        <h2>{stay.hotelName}</h2>
        <p className="muted text-muted-foreground text-[10px] mb-5.5">
          {stay.hotelAddress}
        </p>
        <div className="grid grid-cols-[1fr_1fr] gap-4.5 bg-secondary rounded-[6px] p-[15px] mb-5.5 [&_span]:block [&_span]:text-[9px] [&_span]:text-muted-foreground [&_span]:mb-[3px] [&_strong]:text-[11px] [&_strong]:font-semibold">
          <div>
            <span>Check-in</span>
            <strong>{displayDate(stay.checkIn)}</strong>
          </div>
          <div>
            <span>Check-out</span>
            <strong>{displayDate(stay.checkOut)}</strong>
          </div>
        </div>
        <p className="flex items-center gap-2.5 text-[11px] mb-3.5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
          <CalendarDays size={17} aria-hidden="true" />
          {quantity(nights, "{count} noite", "{count} noites")}
        </p>
        <p className="flex items-center gap-2.5 text-[11px] mb-3.5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
          <BedDouble size={17} aria-hidden="true" />
          {quantity(stay.rooms, "{count} quarto", "{count} quartos")} ·{" "}
          <span lang={roomName.lang}>{roomName.text}</span>
        </p>
        <p className="flex items-center gap-2.5 text-[11px] mb-3.5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
          <Users size={17} aria-hidden="true" />
          {quantity(stay.adults, "{count} adulto", "{count} adultos")}
          {stay.children > 0 &&
            ` · ${quantity(stay.children, "{count} criança", "{count} crianças")}`}
        </p>
        <p className="flex items-center gap-2 text-[10px] text-positive my-[23px]">
          <Check size={17} aria-hidden="true" />
          <span lang={knownPolicy ? locale : "pt-BR"}>{policy}</span>
        </p>
        <div className="flex justify-between gap-2.5 border-t border-t-border pt-5 text-[10px] text-muted-foreground [&_strong]:text-foreground [&_strong]:font-[550] [&_strong]:whitespace-nowrap">
          <span>
            {pricing && (
              <span className="block font-semibold text-foreground">
                {t("Subtotal da hospedagem")}
              </span>
            )}
            {money(stay.pricePerNight)} ×{" "}
            {quantity(nights, "{count} noite", "{count} noites")} ×{" "}
            {quantity(stay.rooms, "{count} quarto", "{count} quartos")}
          </span>
          <strong>{money(pricing?.subtotal ?? total)}</strong>
        </div>
        {pricing && (
          <dl className="mt-3 space-y-2 text-xs [&>div]:flex [&>div]:justify-between [&>div]:gap-2 [&_dd]:font-semibold">
            <div>
              <dt>
                {t("Desconto")}
                {pricing.coupon && ` (${pricing.coupon})`}
              </dt>
              <dd>
                {pricing.discount ? `−${money(pricing.discount)}` : money(0)}
              </dd>
            </div>
            <div>
              <dt>{t("Taxa de serviço simulada")}</dt>
              <dd>{money(pricing.serviceFee)}</dd>
            </div>
            <div>
              <dt>{t("Imposto simulado")}</dt>
              <dd>{money(pricing.tax)}</dd>
            </div>
          </dl>
        )}
        <div className="flex justify-between items-center gap-[15px] mt-5.5 [&_>_span]:text-[12px] [&_>_span]:font-semibold [&_>_strong]:text-primary [&_>_strong]:text-[24px] [&_>_strong]:font-[750] [&_>_strong]:tracking-[-0.04em] [&_>_strong]:whitespace-nowrap max-[1000.01px]:[&_>_strong]:text-[21px] max-[760.01px]:[&_>_strong]:text-[26px] max-[360.01px]:[&_>_strong]:text-[22px]">
          <span>{t("Total da estadia")}</span>
          <strong>{money(total)}</strong>
        </div>
        <p className="text-[9px] text-muted-foreground text-right [margin:5px_0_0]">
          {t("Reserva demonstrativa. Nenhum valor será cobrado.")}
        </p>
      </div>
    </aside>
  );
}
