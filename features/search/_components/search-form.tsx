"use client";
import { useLocale } from "@/lib/i18n/client";
import { useId, useState, useSyncExternalStore } from "react";
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

function subscribeToHydration() {
  return () => {};
}

const clientReady = () => true;
const serverReady = () => false;

export function SearchForm({
  initial,
  compact = false,
  onSearch,
}: {
  /** Valores usados na montagem. Na ausência, o formulário usa a busca padrão. */
  initial?: Search;
  /** Usa a variante compacta do formulário. O padrão é `false`. */
  compact?: boolean;
  /** Recebe a busca validada e substitui a navegação padrão para `/search`. */
  onSearch?: (values: Search) => void;
}) {
  const { t, href } = useLocale();
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    clientReady,
    serverReady
  );
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
    else router.push(href(`/search?${searchParamsFor(values)}`));
  }
  return (
    <form
      className={
        compact
          ? "relative bg-white p-5.5 border border-border rounded-[12px] shadow-[0_8px_30px_#18376307] z-[5] [&_[data-slot=field]]:gap-[7px] [&_[data-slot=field]]:min-w-0 [&_label]:text-[10px] [&_label]:text-[#485670] [&_label]:font-semibold [&_label]:gap-1.5 [&_label_svg]:text-primary [&_input]:w-full [&_input]:h-[43px] [&_input]:bg-secondary [&_input]:border [&_input]:border-transparent [&_input]:shadow-none [&_input]:text-[12px] [&_input]:font-[550] [&_input]:px-[11px] [&_input:focus]:border-primary [&_input[type=date]]:px-[9px] max-[760.01px]:p-[17px] max-[760.01px]:rounded-[9px] compact"
          : "relative bg-white p-5.5 border border-border rounded-[12px] shadow-[0_8px_30px_#18376307] z-[5] [&_[data-slot=field]]:gap-[7px] [&_[data-slot=field]]:min-w-0 [&_label]:text-[10px] [&_label]:text-[#485670] [&_label]:font-semibold [&_label]:gap-1.5 [&_label_svg]:text-primary [&_input]:w-full [&_input]:h-[43px] [&_input]:bg-secondary [&_input]:border [&_input]:border-transparent [&_input]:shadow-none [&_input]:text-[12px] [&_input]:font-[550] [&_input]:px-[11px] [&_input:focus]:border-primary [&_input[type=date]]:px-[9px] max-[760.01px]:p-[17px] max-[760.01px]:rounded-[9px]"
      }
      onSubmit={handleSubmit(handleSearch)}
      noValidate
    >
      <FieldGroup className="grid grid-cols-[minmax(190px,_1.6fr)_minmax(145px,_1fr)_minmax(145px,_1fr)_minmax(200px,_1.3fr)_auto] gap-[15px] items-start max-[1200.01px]:grid-cols-[1.4fr_1fr_1fr] max-[760.01px]:grid-cols-[1fr_1fr] max-[760.01px]:gap-[16px_12px]">
        <Field
          className="relative max-[760.01px]:col-[1_/_-1]"
          data-invalid={!!errors.destination}
        >
          <FieldLabel htmlFor={`${id}-destination`}>
            <MapPin size={14} aria-hidden="true" />
            {t("Destino")}
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
            disabled={!isHydrated}
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
            placeholder={t("Para onde vamos?")}
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
              {t(
                errors.destination.message ??
                  "Selecione um destino nas sugestões."
              )}
            </FieldError>
          )}
          {isOpen && destination.length > 0 && (
            <div className="absolute top-[78px] left-[-10px] -right-15 bg-white border border-border rounded-[9px] p-[7px] shadow-[0_16px_40px_#131b2e20] z-[20] [&_button]:w-full [&_button]:flex [&_button]:items-center [&_button]:gap-3 [&_button]:text-left [&_button]:border-0 [&_button]:p-3 [&_button]:bg-transparent [&_button]:rounded-[5px] [&_button:hover]:bg-secondary [&_button[aria-selected=true]]:bg-secondary [&_button_>_svg:first-child]:text-primary [&_button_>_svg:last-child]:ml-auto [&_strong]:block [&_strong]:text-[12px] [&_strong]:font-semibold [&_small]:block [&_small]:text-[10px] [&_small]:text-muted-foreground [&_p]:p-3.5 [&_p]:m-0 [&_p]:flex [&_p]:items-center [&_p]:gap-2 [&_p]:text-[11px] max-[760.01px]:right-[-5px] max-[760.01px]:left-[-5px]">
              <div
                id={`${id}-suggestions`}
                role="listbox"
                aria-label={t("Destinos sugeridos")}
              >
                {(suggestions.isFetching || isWaiting) && (
                  <p role="status">
                    <LoaderCircle
                      className="animate-spin"
                      size={15}
                      aria-hidden="true"
                    />
                    {t("Buscando destinos…")}
                  </p>
                )}
                {!isWaiting &&
                  !suggestions.isFetching &&
                  suggestions.isError && (
                    <p role="status">
                      {t(
                        "Não foi possível buscar. Edite o destino para tentar novamente."
                      )}
                    </p>
                  )}
                {!isWaiting &&
                  !suggestions.isFetching &&
                  !suggestions.isError &&
                  items.length === 0 && (
                    <p role="status">
                      {t("Nenhum destino encontrado. Tente outro nome.")}
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
                      <small>{t(item.country)}</small>
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
                {t(errors[name].message ?? "Informe uma data válida.")}
              </FieldError>
            )}
          </Field>
        ))}
        <fieldset className="border-0 p-0 m-0 grid grid-cols-[repeat(3,_minmax(0,_1fr))] gap-[7px] max-[1200.01px]:col-[1_/_3] max-[760.01px]:col-[1_/_-1] max-[760.01px]:gap-3">
          <legend className="sr-only">{t("Hóspedes e quartos")}</legend>
          {(
            [
              ["adults", "Adultos", 1],
              ["children", "Crianças", 0],
              ["rooms", "Quartos", 1],
            ] as const
          ).map(([name, label, min]) => (
            <Field key={name} data-invalid={!!errors[name]}>
              <FieldLabel htmlFor={`${id}-${name}`}>{t(label)}</FieldLabel>
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
                  {t(errors[name].message ?? "Informe uma data válida.")}
                </FieldError>
              )}
            </Field>
          ))}
        </fieldset>
        <Button
          type="submit"
          className="h-[43px] mt-[21px] px-5 max-[1200.01px]:mt-5 max-[760.01px]:col-[1_/_-1] max-[760.01px]:mt-0 max-[760.01px]:w-full max-[760.01px]:h-[45px]"
          disabled={!isHydrated || isSubmitting}
        >
          <SearchIcon aria-hidden="true" />
          {t("Buscar hotéis")}
        </Button>
      </FieldGroup>
    </form>
  );
}
