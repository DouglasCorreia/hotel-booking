"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";
import { filterSchema } from "@/features/search/model";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Field,
  FieldSet,
  FieldLegend,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

export type FilterOptions = {
  min: number | null;
  max: number | null;
  hasAircon: boolean;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
};
const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function PriceFilter({ options }: { options: FilterOptions }) {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<z.input<typeof filterSchema>>();
  const [minPrice, maxPrice] = useWatch({
    control,
    name: ["minPrice", "maxPrice"],
  });
  const { min, max } = options;
  const hasRange = min !== null && max !== null;
  const clamp = (value: number | undefined, fallback: number) =>
    Number.isFinite(value) ? Math.min(max!, Math.max(min!, value!)) : fallback;
  const values = hasRange ? [clamp(minPrice, min), clamp(maxPrice, max)] : [];
  const inverted = values.length === 2 && values[0] > values[1];
  const sliderValues = inverted ? [values[1], values[1]] : values;
  const outside =
    hasRange &&
    [minPrice, maxPrice].some(
      (value) => Number.isFinite(value) && (value! < min || value! > max)
    );
  return (
    <FieldSet className="price-filter">
      <FieldLegend>Preço por noite</FieldLegend>
      <p
        id="price-format"
        className="m-0 text-muted-foreground text-[10px] leading-[1.6]"
      >
        Valores em reais, com até 2 casas decimais.
      </p>
      {options.isError ? (
        <div
          className="flex flex-col items-start gap-2 text-[11px] [&_p]:mb-0 [&_button]:h-auto [&_button]:whitespace-normal [&_button]:text-left"
          role="status"
        >
          <p>
            Não foi possível carregar a faixa de preço. Você pode digitar os
            valores.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={options.onRetry}
          >
            Recarregar faixa de preço
          </Button>
        </div>
      ) : options.isPending ? (
        <p
          className="m-0 text-muted-foreground text-[10px] leading-[1.6]"
          role="status"
        >
          Carregando faixa de preço…
        </p>
      ) : !hasRange ? (
        <p className="m-0 text-muted-foreground text-[10px] leading-[1.6]">
          Não há faixa de preço disponível neste destino.
        </p>
      ) : min === max ? (
        <p className="m-0 text-muted-foreground text-[10px] leading-[1.6]">
          Diária única no destino: {currency.format(min)}.
        </p>
      ) : (
        <div className="[padding:4px_10px_0] [&_[data-slot=slider]]:min-h-8">
          <Slider
            min={min}
            max={max}
            step={0.01}
            preserveThumbOrder
            value={sliderValues}
            aria-describedby="price-format price-scale-limits"
            onValueChange={(next) => {
              // preserveThumbOrder guarantees that only one bound changes.
              const index = next[0] !== sliderValues[0] ? 0 : 1;
              setValue(index === 0 ? "minPrice" : "maxPrice", next[index], {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            thumbProps={[
              "Preço mínimo por noite",
              "Preço máximo por noite",
            ].map((label, index) => ({
              "aria-label": label,
              "aria-valuetext": currency.format(
                (inverted ? values[1] : values[index]) ?? 0
              ),
            }))}
          />
          <div
            className="price-scale-limits flex justify-between gap-2 text-muted-foreground text-[10px] tabular-nums"
            id="price-scale-limits"
          >
            <span>{currency.format(min)}</span>
            <span>{currency.format(max)}</span>
          </div>
        </div>
      )}
      <div className="grid grid-cols-[1fr_1fr] gap-2.5 [&_input]:w-full [&_input]:min-w-0 [&_input]:text-[11px] [&_input]:px-2">
        {(["minPrice", "maxPrice"] as const).map((name) => (
          <Field key={name} data-invalid={!!errors[name]}>
            <FieldLabel htmlFor={name}>
              {name === "minPrice" ? "Mínimo (R$)" : "Máximo (R$)"}
            </FieldLabel>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              id={name}
              placeholder={name === "minPrice" ? "0" : "Sem limite"}
              {...register(name, {
                setValueAs: (value: string) =>
                  value === "" ? undefined : Number(value),
              })}
              aria-invalid={!!errors[name]}
              aria-describedby={errors[name] ? `${name}-error` : "price-format"}
            />
            {errors[name] && (
              <FieldError id={`${name}-error`}>
                {errors[name].message}
              </FieldError>
            )}
          </Field>
        ))}
      </div>
      {outside && (
        <p
          className="m-0 text-muted-foreground text-[10px] leading-[1.6]"
          role="status"
        >
          Valor fora da escala do destino. O valor digitado será mantido.
        </p>
      )}
    </FieldSet>
  );
}
