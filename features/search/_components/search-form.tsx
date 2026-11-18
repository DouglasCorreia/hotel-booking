"use client";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MapPin,
  Search as SearchIcon,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { useSuggestions } from "@/features/hotels/hooks";
import { useDebounced } from "../use-debounced";
import {
  defaultSearch,
  localToday,
  searchSchema,
  searchParamsFor,
  type Search,
} from "../model";

export function SearchForm({
  initial,
  compact = false,
  onSearch,
}: {
  initial?: Search;
  compact?: boolean;
  onSearch?: (values: Search) => void;
}) {
  const router = useRouter();
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedName, setSelectedName] = useState(initial?.destination ?? "");
  const [active, setActive] = useState(-1);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<Search>({
    resolver: zodResolver(searchSchema),
    defaultValues: initial ?? defaultSearch(),
  });
  const destination = useWatch({ control, name: "destination" });
  const debouncedDestination = useDebounced(destination);
  const isWaiting = debouncedDestination !== destination;
  const suggestions = useSuggestions(debouncedDestination, isOpen);
  const items = isWaiting ? [] : (suggestions.data ?? []);
  function choose(name: string) {
    setValue("destination", name, { shouldValidate: true });
    setSelectedName(name);
    setIsOpen(false);
    setActive(-1);
    clearErrors("destination");
  }
  function handleSearch(values: Search) {
    if (selectedName !== values.destination) {
      setError("destination", {
        message: "Selecione um destino nas sugestões.",
      });
      setIsOpen(true);
      return;
    }
    setIsOpen(false);
    if (onSearch) onSearch(values);
    else router.push(`/search?${searchParamsFor(values)}`);
  }
  return (
    <form
      id="buscar"
      className={compact ? "search-panel compact" : "search-panel"}
      onSubmit={handleSubmit(handleSearch)}
      noValidate
    >
      <FieldGroup className="search-fields">
        <Field
          className="destination-field"
          data-invalid={!!errors.destination}
        >
          <FieldLabel htmlFor={`${id}-destination`}>
            <MapPin size={14} aria-hidden="true" />
            Destino
          </FieldLabel>
          <Input
            {...register("destination", {
              onChange: () => {
                setSelectedName("");
                setIsOpen(true);
                setActive(-1);
              },
            })}
            id={`${id}-destination`}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isOpen && destination.length > 0}
            aria-controls={`${id}-suggestions`}
            aria-activedescendant={
              active >= 0 && items[active] && isOpen
                ? `${id}-option-${active}`
                : undefined
            }
            aria-invalid={!!errors.destination}
            aria-describedby={
              errors.destination ? `${id}-destination-error` : undefined
            }
            placeholder="Para onde vamos?"
            autoComplete="off"
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setIsOpen(false);
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setIsOpen(true);
                setActive((current) => Math.min(current + 1, items.length - 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((current) => Math.max(current - 1, 0));
              }
              if (
                event.key === "Enter" &&
                isOpen &&
                active >= 0 &&
                items[active]
              ) {
                event.preventDefault();
                choose(items[active].name);
              }
            }}
          />
          {errors.destination && (
            <FieldError id={`${id}-destination-error`}>
              {errors.destination.message}
            </FieldError>
          )}
          {isOpen && destination.length > 0 && (
            <div className="suggestions-panel">
              <div
                id={`${id}-suggestions`}
                role="listbox"
                aria-label="Destinos sugeridos"
              >
                {(suggestions.isFetching || isWaiting) && (
                  <p role="status">
                    <LoaderCircle
                      className="spin"
                      size={15}
                      aria-hidden="true"
                    />
                    Buscando destinos…
                  </p>
                )}
                {!isWaiting &&
                  !suggestions.isFetching &&
                  suggestions.isError && (
                    <p role="status">
                      Não foi possível buscar. Edite o destino para tentar
                      novamente.
                    </p>
                  )}
                {!isWaiting &&
                  !suggestions.isFetching &&
                  !suggestions.isError &&
                  items.length === 0 && (
                    <p role="status">
                      Nenhum destino encontrado. Tente outro nome.
                    </p>
                  )}
                {items.map((item, index) => (
                  <button
                    type="button"
                    role="option"
                    tabIndex={-1}
                    aria-selected={active === index}
                    id={`${id}-option-${index}`}
                    key={item.id}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => choose(item.name)}
                  >
                    <MapPin size={18} aria-hidden="true" />
                    <span>
                      <strong>{item.name}</strong>
                      <small>{item.country}</small>
                    </span>
                    <ArrowRight size={15} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </Field>
        {(["checkIn", "checkOut"] as const).map((name) => (
          <Field key={name} data-invalid={!!errors[name]}>
            <FieldLabel htmlFor={`${id}-${name}`}>
              {name === "checkIn" ? "Check-in" : "Check-out"}
            </FieldLabel>
            <Input
              type="date"
              id={`${id}-${name}`}
              min={localToday()}
              {...register(name)}
              aria-invalid={!!errors[name]}
              aria-describedby={
                errors[name] ? `${id}-${name}-error` : undefined
              }
            />
            {errors[name] && (
              <FieldError id={`${id}-${name}-error`}>
                {errors[name].message}
              </FieldError>
            )}
          </Field>
        ))}
        <fieldset className="occupancy-fields">
          <legend className="sr-only">Hóspedes e quartos</legend>
          {(
            [
              ["adults", "Adultos", 1],
              ["children", "Crianças", 0],
              ["rooms", "Quartos", 1],
            ] as const
          ).map(([name, label, min]) => (
            <Field key={name} data-invalid={!!errors[name]}>
              <FieldLabel htmlFor={`${id}-${name}`}>{label}</FieldLabel>
              <Input
                type="number"
                min={min}
                step={1}
                id={`${id}-${name}`}
                {...register(name, { valueAsNumber: true })}
                aria-invalid={!!errors[name]}
                aria-describedby={
                  errors[name] ? `${id}-${name}-error` : undefined
                }
              />
              {errors[name] && (
                <FieldError id={`${id}-${name}-error`}>
                  {errors[name].message}
                </FieldError>
              )}
            </Field>
          ))}
        </fieldset>
        <Button type="submit" className="search-submit" disabled={isSubmitting}>
          <SearchIcon aria-hidden="true" />
          Buscar hotéis
        </Button>
      </FieldGroup>
    </form>
  );
}
