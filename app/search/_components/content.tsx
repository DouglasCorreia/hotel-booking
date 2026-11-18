"use client";
import { useEffect } from "react";
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
  const { hotels, destination, isDestinationValid } = useCatalog(
    search,
    filters,
  );
  const pageCount = Math.max(1, Math.ceil((hotels.data?.total ?? 0) / 10));
  useEffect(() => {
    if (search && filters && hotels.isSuccess && filters.page > pageCount)
      router.replace(
        `/search?${searchParamsFor(search, { ...filters, page: 1 })}`,
      );
  }, [search, filters, hotels.isSuccess, pageCount, router]);
  if (!search)
    return (
      <>
        <div className="page-heading">
          <p className="eyebrow">Vamos começar</p>
          <h1>Encontre sua próxima estadia.</h1>
          <p className="muted">
            Preencha ou corrija destino, datas e hóspedes para pesquisar.
          </p>
        </div>
        <SearchForm key={params.toString()} />
      </>
    );
  return (
    <>
      <div className="catalog-search">
        <SearchForm
          initial={search}
          compact
          key={searchParamsFor(search).toString()}
        />
      </div>
      <div className="page-heading results-heading">
        <div>
          <p className="eyebrow">Seu próximo destino</p>
          <h1>{search.destination}</h1>
          <p className="muted">
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
                "Copie o endereço da barra do navegador para compartilhar.",
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
          Há preços, avaliação, ordenação ou página inválidos no endereço.
        </Feedback>
      ) : (
        <div className="catalog-layout">
          <FiltersForm
            key={params.toString()}
            search={search}
            filters={filters}
          />
          <div className="catalog-results" aria-live="polite">
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
                <div className="result-meta">
                  <span>
                    Mostrando {(filters.page - 1) * 10 + 1}–
                    {Math.min(filters.page * 10, hotels.data.total)} de{" "}
                    {hotels.data.total}
                  </span>
                  <span>Valores em reais</span>
                </div>
                {hotels.data.data.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    query={params.toString()}
                  />
                ))}
                {pageCount > 1 && (
                  <nav className="pagination" aria-label="Paginação dos hotéis">
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
