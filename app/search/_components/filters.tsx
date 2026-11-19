"use client";
import { useLocale } from "@/lib/i18n/client";
import { useEffect } from "react";
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
const emptyFilters = filterSchema.parse({});

export function useFiltersForm(filters: Filters | null) {
  const form = useForm<z.input<typeof filterSchema>, unknown, Filters>({
    resolver: zodResolver(filterSchema),
    defaultValues: filters ?? emptyFilters,
  });
  const { reset } = form;
  useEffect(() => reset(filters ?? emptyFilters), [filters, reset]);
  return form;
}

export function FiltersForm({
  search,
  filters,
  options,
  form,
  onCommit,
}: {
  /** Destino, datas e ocupação preservados ao aplicar ou limpar filtros. */
  search: Search;
  /** Filtros aplicados na URL que inicializam a edição local. Aplicar volta à página 1. */
  filters: Filters;
  /** Escala de diárias do destino, disponibilidade de opções e recuperação de falhas. */
  options: FilterOptions;
  /** Mantém a mesma edição ao alternar entre a coluna e o painel de filtros. */
  form: ReturnType<typeof useFiltersForm>;
  /** Fecha o painel mobile após aplicar ou limpar os filtros. */
  onCommit?: () => void;
}) {
  const { t, href } = useLocale();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { isDirty },
  } = form;
  const number = (value: string) => (value === "" ? undefined : Number(value));
  return (
    <aside
      className="bg-white border border-border p-[23px] rounded-[9px] [&_h2]:text-[15px] [&_h2]:tracking-[-0.02em] [&_h2]:flex [&_h2]:gap-[9px] [&_h2]:items-center [&_h2]:mb-[25px] [&&_legend]:text-[12px] [&_legend]:font-semibold [&_legend]:mb-[13px] [&_label]:text-[10px] [&_[data-slot=field-group]]:gap-[23px] [&_.price-filter]:min-w-0 [&_.price-filter]:gap-2.5 [&_.filter-options-set]:min-w-0 [&_.filter-options-set]:gap-2.5 [&_[data-slot=field-legend]]:mb-0 [&_[data-slot=checkbox-group]]:flex [&_[data-slot=checkbox-group]]:flex-col [&_[data-slot=checkbox-group]]:gap-0.5 [&_.filter-option]:min-h-[34px] [&_.filter-option]:gap-2.5 max-[1200.01px]:p-4.5 max-[760.01px]:p-4.5 max-[760.01px]:[&_h2]:mb-[17px] max-[760.01px]:[&_[data-slot=field-group]]:grid max-[760.01px]:[&_[data-slot=field-group]]:grid-cols-[1fr_1fr] max-[760.01px]:[&_[data-slot=field-group]]:gap-[15px] max-[760.01px]:[&_fieldset]:col-[1_/_-1]"
      aria-labelledby="filters-heading"
    >
      <h2 id="filters-heading">
        <SlidersHorizontal size={17} aria-hidden="true" />
        {t("Encontre seu ideal")}
      </h2>
      <FormProvider {...form}>
        <form
          onSubmit={handleSubmit((values) => {
            const applied = { ...values, page: 1 };
            form.reset(applied);
            onCommit?.();
            router.push(href(`/search?${searchParamsFor(search, applied)}`));
          })}
          noValidate
        >
          <FieldGroup>
            <PriceFilter options={options} />
            <Field>
              <FieldLabel htmlFor="rating">{t("Avaliação mínima")}</FieldLabel>
              <select
                className="block w-full border border-input rounded-[6px] min-h-[38px] text-[11px] text-foreground bg-white p-2"
                id="rating"
                {...register("rating", { setValueAs: number })}
              >
                <option value="">{t("Todas as avaliações")}</option>
                <option value="3">{t("3 ou mais")}</option>
                <option value="4">{t("4 ou mais")}</option>
                <option value="4.5">{t("4,5 ou mais")}</option>
              </select>
            </Field>
            <FieldSet className="filter-options-set">
              <FieldLegend>{t("Comodidades")}</FieldLegend>
              <p
                className="m-0 text-muted-foreground text-[10px] leading-[1.6]"
                id="amenities-hint"
              >
                {t("A hospedagem deve oferecer todas as opções marcadas.")}
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
                          className="filter-option [&_[data-slot=field-label]]:min-h-[34px] [&_[data-slot=field-label]]:text-[11px] [&_[data-slot=field-label]]:cursor-pointer [&_[data-slot=field-label]]:items-center"
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
                            {t(amenityLabels[value])}
                          </FieldLabel>
                        </Field>
                      ))}
                  </FieldGroup>
                )}
              />
            </FieldSet>
            <FieldSet className="filter-options-set">
              <FieldLegend>{t("Tipo de propriedade")}</FieldLegend>
              <p
                className="m-0 text-muted-foreground text-[10px] leading-[1.6]"
                id="property-types-hint"
              >
                {t("Mostrar qualquer um dos tipos marcados.")}
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
                        className="filter-option [&_[data-slot=field-label]]:min-h-[34px] [&_[data-slot=field-label]]:text-[11px] [&_[data-slot=field-label]]:cursor-pointer [&_[data-slot=field-label]]:items-center"
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
                          {t(propertyLabels[value])}
                        </FieldLabel>
                      </Field>
                    ))}
                  </FieldGroup>
                )}
              />
            </FieldSet>
            <Field>
              <FieldLabel htmlFor="sort">{t("Ordenar por")}</FieldLabel>
              <select
                className="block w-full border border-input rounded-[6px] min-h-[38px] text-[11px] text-foreground bg-white p-2"
                id="sort"
                {...register("sort")}
              >
                <option value="price-asc">{t("Menor preço")}</option>
                <option value="price-desc">{t("Maior preço")}</option>
                <option value="rating">{t("Melhor avaliação")}</option>
                <option value="popular">{t("Mais avaliações")}</option>
              </select>
            </Field>
            <div className="flex flex-col gap-2.5 col-[1_/_-1]">
              <p
                className="min-h-4 m-0 text-muted-foreground text-[10px] leading-[1.6]"
                role="status"
              >
                {isDirty
                  ? t("Alterações não aplicadas")
                  : t("Ajuste suas preferências e aplique.")}
              </p>
              <Button type="submit">{t("Aplicar filtros")}</Button>
              <Button variant="ghost" asChild>
                <Link
                  href={href(`/search?${searchParamsFor(search)}`)}
                  onNavigate={() => {
                    form.reset(emptyFilters);
                    onCommit?.();
                  }}
                >
                  {t("Limpar filtros")}
                </Link>
              </Button>
            </div>
          </FieldGroup>
        </form>
      </FormProvider>
      <p className="border-t border-t-border pt-5.5 text-muted-foreground text-[10px] mt-[25px] mb-0 max-[760.01px]:hidden">
        {t(
          "A diária exibida é a partir do quarto mais econômico de cada hotel."
        )}
      </p>
    </aside>
  );
}
