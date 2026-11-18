"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SlidersHorizontal } from "lucide-react";
import {
  filterSchema,
  searchParamsFor,
  type Filters,
  type Search,
} from "@/features/search/model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

export function FiltersForm({
  search,
  filters,
}: {
  search: Search;
  filters: Filters;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof filterSchema>, unknown, Filters>({
    resolver: zodResolver(filterSchema),
    defaultValues: filters,
  });
  const number = (value: string) => (value === "" ? undefined : Number(value));
  return (
    <aside className="filters-panel">
      <h2>
        <SlidersHorizontal size={17} aria-hidden="true" />
        Encontre seu ideal
      </h2>
      <form
        onSubmit={handleSubmit((values) =>
          router.push(
            `/search?${searchParamsFor(search, { ...values, page: 1 })}`,
          ),
        )}
        noValidate
      >
        <FieldGroup>
          <fieldset>
            <legend>Preço por noite</legend>
            <div className="price-inputs">
              {(["minPrice", "maxPrice"] as const).map((name) => (
                <Field key={name} data-invalid={!!errors[name]}>
                  <FieldLabel htmlFor={name}>
                    {name === "minPrice" ? "Mínimo (R$)" : "Máximo (R$)"}
                  </FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    id={name}
                    placeholder={name === "minPrice" ? "0" : "Sem limite"}
                    {...register(name, { setValueAs: number })}
                    aria-invalid={!!errors[name]}
                    aria-describedby={
                      errors[name] ? `${name}-error` : undefined
                    }
                  />
                  {errors[name] && (
                    <FieldError id={`${name}-error`}>
                      {errors[name].message}
                    </FieldError>
                  )}
                </Field>
              ))}
            </div>
          </fieldset>
          <Field>
            <FieldLabel htmlFor="rating">Avaliação mínima</FieldLabel>
            <select
              className="select-input"
              id="rating"
              {...register("rating", { setValueAs: number })}
            >
              <option value="">Todas as avaliações</option>
              <option value="3">3 ou mais</option>
              <option value="4">4 ou mais</option>
              <option value="4.5">4,5 ou mais</option>
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="sort">Ordenar por</FieldLabel>
            <select className="select-input" id="sort" {...register("sort")}>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="rating">Melhor avaliação</option>
              <option value="popular">Mais avaliações</option>
            </select>
          </Field>
          <Button type="submit">Aplicar filtros</Button>
          <Button variant="ghost" asChild>
            <Link href={`/search?${searchParamsFor(search)}`}>
              Limpar filtros
            </Link>
          </Button>
        </FieldGroup>
      </form>
      <p className="filter-note">
        A diária exibida é a partir do quarto mais econômico de cada hotel.
      </p>
    </aside>
  );
}
