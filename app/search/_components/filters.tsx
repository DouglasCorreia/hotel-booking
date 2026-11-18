"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SlidersHorizontal } from "lucide-react";
import {
  filterSchema,
  filterAmenities,
  propertyTypes,
  searchParamsFor,
  type Filters,
  type Search,
} from "@/features/search/model";
import { amenityLabels } from "@/features/hotels/model";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { PriceFilter, type FilterOptions } from "./price-filter";

const propertyLabels = { hotel: "Hotel", pousada: "Pousada", resort: "Resort" };

export function FiltersForm({
  search,
  filters,
  options,
}: {
  search: Search;
  filters: Filters;
  options: FilterOptions;
}) {
  const router = useRouter();
  const form = useForm<z.input<typeof filterSchema>, unknown, Filters>({
    resolver: zodResolver(filterSchema),
    defaultValues: filters,
  });
  const {
    register,
    handleSubmit,
    control,
    formState: { isDirty },
  } = form;
  const number = (value: string) => (value === "" ? undefined : Number(value));
  return (
    <aside className="filters-panel" aria-labelledby="filters-heading">
      <h2 id="filters-heading">
        <SlidersHorizontal size={17} aria-hidden="true" />
        Encontre seu ideal
      </h2>
      <FormProvider {...form}>
        <form
          onSubmit={handleSubmit((values) => {
            const applied = { ...values, page: 1 };
            form.reset(applied);
            router.push(`/search?${searchParamsFor(search, applied)}`);
          })}
          noValidate
        >
          <FieldGroup>
            <PriceFilter options={options} />
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
            <FieldSet className="filter-options-set">
              <FieldLegend>Comodidades</FieldLegend>
              <p className="filter-hint" id="amenities-hint">
                A hospedagem deve oferecer todas as opções marcadas.
              </p>
              <Controller
                name="amenities"
                control={control}
                render={({ field }) => (
                  <FieldGroup data-slot="checkbox-group">
                    {filterAmenities
                      .filter(
                        (value) =>
                          value !== "aircon" ||
                          options.hasAircon ||
                          filters.amenities.includes(value)
                      )
                      .map((value) => (
                        <Field
                          key={value}
                          orientation="horizontal"
                          className="filter-option"
                        >
                          <Checkbox
                            id={`amenity-${value}`}
                            checked={field.value?.includes(value) ?? false}
                            onBlur={field.onBlur}
                            aria-describedby="amenities-hint"
                            onCheckedChange={(checked) =>
                              field.onChange(
                                checked
                                  ? [...(field.value ?? []), value]
                                  : field.value?.filter(
                                      (item) => item !== value
                                    )
                              )
                            }
                          />
                          <FieldLabel htmlFor={`amenity-${value}`}>
                            {amenityLabels[value]}
                          </FieldLabel>
                        </Field>
                      ))}
                  </FieldGroup>
                )}
              />
            </FieldSet>
            <FieldSet className="filter-options-set">
              <FieldLegend>Tipo de propriedade</FieldLegend>
              <p className="filter-hint" id="property-types-hint">
                Mostrar qualquer um dos tipos marcados.
              </p>
              <Controller
                name="propertyTypes"
                control={control}
                render={({ field }) => (
                  <FieldGroup data-slot="checkbox-group">
                    {propertyTypes.map((value) => (
                      <Field
                        key={value}
                        orientation="horizontal"
                        className="filter-option"
                      >
                        <Checkbox
                          id={`property-${value}`}
                          checked={field.value?.includes(value) ?? false}
                          onBlur={field.onBlur}
                          aria-describedby="property-types-hint"
                          onCheckedChange={(checked) =>
                            field.onChange(
                              checked
                                ? [...(field.value ?? []), value]
                                : field.value?.filter((item) => item !== value)
                            )
                          }
                        />
                        <FieldLabel htmlFor={`property-${value}`}>
                          {propertyLabels[value]}
                        </FieldLabel>
                      </Field>
                    ))}
                  </FieldGroup>
                )}
              />
            </FieldSet>
            <Field>
              <FieldLabel htmlFor="sort">Ordenar por</FieldLabel>
              <select className="select-input" id="sort" {...register("sort")}>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
                <option value="rating">Melhor avaliação</option>
                <option value="popular">Mais avaliações</option>
              </select>
            </Field>
            <div className="filter-actions">
              <p className="filter-pending" role="status">
                {isDirty
                  ? "Alterações não aplicadas"
                  : "Ajuste suas preferências e aplique."}
              </p>
              <Button type="submit">Aplicar filtros</Button>
              <Button variant="ghost" asChild>
                <Link
                  href={`/search?${searchParamsFor(search)}`}
                  onClick={() => form.reset(filterSchema.parse({}))}
                >
                  Limpar filtros
                </Link>
              </Button>
            </div>
          </FieldGroup>
        </form>
      </FormProvider>
      <p className="filter-note">
        A diária exibida é a partir do quarto mais econômico de cada hotel.
      </p>
    </aside>
  );
}
