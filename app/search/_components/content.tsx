"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Copy } from "lucide-react";
import { toast } from "sonner";
import { SearchForm } from "@/features/search/_components/search-form";
import {
  parseSearch,
  parseFilters,
  searchParamsFor,
} from "@/features/search/model";
import { useCatalog } from "@/features/hotels/hooks";
import { animateEntrance } from "@/lib/animate-entrance";
import { Feedback, LoadingCards, QueryError } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { FiltersForm } from "./filters";
import { HotelCard } from "./hotel-card";

export function SearchContent() {
  const params = useSearchParams();
  const router = useRouter();
  const search = parseSearch(params);
  const parsedFilters = parseFilters(params);
  const filters = parsedFilters.success ? parsedFilters.data : null;
  const { hotels, destination, isDestinationValid, options } = useCatalog(
    search,
    filters
  );
  const destinationPrices =
    options.data
      ?.filter((hotel) => hotel.destination === search?.destination)
      .map((hotel) => hotel.pricePerNight) ?? [];
  const pageCount = Math.max(1, Math.ceil((hotels.data?.total ?? 0) / 10));
  const cards = useRef<HTMLDivElement>(null);
  const displayed = useRef<{ search: string; query: string; hotels: string }>(
    null
  );
  const searchKey = search ? searchParamsFor(search).toString() : "";
  const catalogKey =
    search && filters ? searchParamsFor(search, filters).toString() : "";
  const hotelOrder =
    destination.isSuccess &&
    isDestinationValid &&
    hotels.isSuccess &&
    filters &&
    filters.page <= pageCount
      ? hotels.data.data.map(({ id }) => id).join(",")
      : null;

  useLayoutEffect(() => {
    if (displayed.current?.search !== searchKey) displayed.current = null;
    if (hotelOrder === null) return;

    const previous = displayed.current;
    displayed.current = {
      search: searchKey,
      query: catalogKey,
      hotels: hotelOrder,
    };
    // Preserve the last settled result through loading so an applied change
    // can be compared when its own query resolves.
    if (
      hotelOrder &&
      previous &&
      previous.query !== catalogKey &&
      previous.hotels !== hotelOrder
    )
      return animateEntrance(cards.current, { opacity: [0.8, 1] }, 0.18);
  }, [searchKey, catalogKey, hotelOrder]);

  useEffect(() => {
    if (search && filters && hotels.isSuccess && filters.page > pageCount)
      router.replace(
        `/search?${searchParamsFor(search, { ...filters, page: 1 })}`
      );
  }, [search, filters, hotels.isSuccess, pageCount, router]);
  if (!search)
    return (
      <>
        <div className="[padding-block:38px_30px] [&_h1]:mb-2.5 [&_>_p:last-child]:mb-0 [&_>_div_>_p:last-child]:mb-0 max-[760.01px]:[padding-block:30px_25px] max-[760.01px]:[&_h1]:text-[33px] max-[760.01px]:[&_>_.muted]:text-[12px]">
          <p className="eyebrow text-primary text-[11px] font-[650] tracking-[0.1em] uppercase mb-3">
            Vamos começar
          </p>
          <h1>Encontre sua próxima estadia.</h1>
          <p className="muted text-muted-foreground">
            Preencha ou corrija destino, datas e hóspedes para pesquisar.
          </p>
        </div>
        <SearchForm key={params.toString()} />
      </>
    );
  return (
    <>
      <div className="mb-1">
        <SearchForm initial={search} compact key={searchKey} />
      </div>
      <div className="[padding-block:38px_30px] [&_h1]:mb-2.5 [&_>_p:last-child]:mb-0 [&_>_div_>_p:last-child]:mb-0 max-[760.01px]:[padding-block:30px_25px] max-[760.01px]:[&_h1]:text-[33px] max-[760.01px]:[&_>_.muted]:text-[12px] flex items-center justify-between gap-6 [&_h1]:text-[34px] [&_>_button]:bg-transparent [&_>_button]:text-[11px] max-[760.01px]:items-start max-[760.01px]:gap-5 max-[760.01px]:[padding-block:30px_22px] max-[760.01px]:[&_h1]:text-[27px] max-[760.01px]:[&_>_button]:w-9 max-[760.01px]:[&_>_button]:min-w-9 max-[760.01px]:[&_>_button]:p-2 max-[760.01px]:[&_>_button]:text-[0px] max-[760.01px]:[&_>_button]:flex-wrap max-[760.01px]:[&_>_button_svg]:w-4 max-[760.01px]:[&_>_button_svg]:h-4 max-[760.01px]:[&_.muted]:text-[11px]">
        <div>
          <p className="eyebrow text-primary text-[11px] font-[650] tracking-[0.1em] uppercase mb-3">
            Seu próximo destino
          </p>
          <h1>{search.destination}</h1>
          <p className="muted text-muted-foreground">
            {hotels.data
              ? `${hotels.data.total} hotéis encontrados`
              : "Encontre um lugar para chamar de seu por alguns dias."}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(window.location.href);
              toast.success("Link da busca copiado.");
            } catch {
              toast.error(
                "Copie o endereço da barra do navegador para compartilhar."
              );
            }
          }}
        >
          <Copy aria-hidden="true" />
          Compartilhar busca
        </Button>
      </div>
      {!filters ? (
        <Feedback
          title="Revise os filtros da busca"
          href={`/search?${searchParamsFor(search)}`}
          linkLabel="Remover filtros inválidos"
        >
          Há preços, comodidades, tipos de propriedade, avaliação, ordenação ou
          página inválidos no endereço.
        </Feedback>
      ) : (
        <div className="grid grid-cols-[250px_minmax(0,_1fr)] gap-7 items-start max-[1200.01px]:grid-cols-[220px_minmax(0,_1fr)] max-[1200.01px]:gap-5 max-[760.01px]:grid-cols-[1fr] max-[760.01px]:gap-5.5">
          <FiltersForm
            key={params.toString()}
            search={search}
            filters={filters}
            options={{
              min: destinationPrices.length
                ? Math.min(...destinationPrices)
                : null,
              max: destinationPrices.length
                ? Math.max(...destinationPrices)
                : null,
              hasAircon:
                options.data?.some((hotel) =>
                  hotel.amenities.includes("aircon")
                ) ?? false,
              isPending: options.isPending,
              isError: options.isError,
              onRetry: () => {
                void options.refetch();
              },
            }}
          />
          <div
            className="min-w-0 flex flex-col gap-4.5"
            aria-live="polite"
            aria-busy={hotels.isFetching}
          >
            {hotels.isFetching && (
              <p className="muted text-muted-foreground" role="status">
                Atualizando hospedagens…
              </p>
            )}
            {destination.isError ? (
              <QueryError
                error={destination.error}
                onRetry={() => destination.refetch()}
              />
            ) : destination.isPending ? (
              <LoadingCards />
            ) : !isDestinationValid ? (
              <Feedback title="Destino não encontrado">
                Selecione um destino válido nas sugestões da busca.
              </Feedback>
            ) : hotels.isPending ? (
              <LoadingCards />
            ) : hotels.isError ? (
              <QueryError
                error={hotels.error}
                onRetry={() => hotels.refetch()}
              />
            ) : hotels.data.total === 0 ? (
              <Feedback title="Nenhum hotel por aqui ainda" isEmpty>
                Experimente outro destino ou remova os filtros para encontrar
                mais opções.
              </Feedback>
            ) : (
              <>
                <div className="flex justify-between text-muted-foreground text-[10px] px-0.5">
                  <span>
                    Mostrando {(filters.page - 1) * 10 + 1}–
                    {Math.min(filters.page * 10, hotels.data.total)} de{" "}
                    {hotels.data.total}
                  </span>
                  <span>Valores em reais</span>
                </div>
                <div className="flex flex-col gap-4.5" ref={cards}>
                  {hotels.data.data.map((hotel) => (
                    <HotelCard
                      key={hotel.id}
                      hotel={hotel}
                      query={params.toString()}
                    />
                  ))}
                </div>
                {pageCount > 1 && (
                  <nav
                    className="flex items-center justify-center gap-5.5 mt-4 [&_>_span]:text-[11px] [&_>_span]:text-muted-foreground [&_[aria-disabled=true]]:opacity-[0.4] [&_[aria-disabled=true]]:pointer-events-none max-[760.01px]:gap-3 max-[760.01px]:[&_>_span]:text-[9px] max-[760.01px]:[&_>_a]:text-[10px]"
                    aria-label="Paginação dos hotéis"
                  >
                    <Button
                      variant="outline"
                      asChild
                      disabled={filters.page <= 1}
                    >
                      <Link
                        aria-disabled={filters.page <= 1}
                        tabIndex={filters.page <= 1 ? -1 : undefined}
                        href={`/search?${searchParamsFor(search, { ...filters, page: Math.max(1, filters.page - 1) })}`}
                      >
                        <ArrowLeft aria-hidden="true" />
                        Anterior
                      </Link>
                    </Button>
                    <span>
                      Página {filters.page} de {pageCount}
                    </span>
                    <Button
                      variant="outline"
                      asChild
                      disabled={filters.page >= pageCount}
                    >
                      <Link
                        aria-disabled={filters.page >= pageCount}
                        tabIndex={filters.page >= pageCount ? -1 : undefined}
                        href={`/search?${searchParamsFor(search, { ...filters, page: Math.min(pageCount, filters.page + 1) })}`}
                      >
                        Próxima
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
