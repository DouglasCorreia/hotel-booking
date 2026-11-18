import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeAll, expect, it, vi } from "vitest";
import type { ComponentProps } from "react";
import {
  FiltersForm as CatalogFiltersForm,
  useFiltersForm,
} from "@/app/search/_components/filters";
import { filterSchema } from "@/features/search/model";

function FiltersForm(
  props: Omit<ComponentProps<typeof CatalogFiltersForm>, "form">
) {
  const form = useFiltersForm(props.filters);
  return <CatalogFiltersForm {...props} form={form} />;
}

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});
afterEach(() => {
  cleanup();
  push.mockClear();
});
const search = {
  destination: "São Paulo, SP",
  checkIn: "2099-01-01",
  checkOut: "2099-01-03",
  adults: 2,
  children: 0,
  rooms: 1,
};
const options = {
  min: 180,
  max: 900,
  hasAircon: false,
  isPending: false,
  isError: false,
  onRetry: vi.fn(),
};

it("edita seleções sem aplicar e envia todos os critérios juntos", async () => {
  render(
    <FiltersForm
      search={search}
      filters={filterSchema.parse({ page: 2 })}
      options={options}
    />
  );
  expect(
    screen.queryByRole("checkbox", { name: "Ar-condicionado" })
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("checkbox", { name: "Wi-Fi" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Piscina" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Pousada" }));
  fireEvent.change(screen.getByLabelText("Mínimo (R$)"), {
    target: { value: "200.15" },
  });
  expect(push).not.toHaveBeenCalled();
  expect(screen.getByText(/Alterações não aplicadas/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Aplicar filtros" }));
  await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
  const params = new URL(push.mock.calls[0][0], "http://localhost")
    .searchParams;
  expect(params.getAll("amenities")).toEqual(["wifi", "pool"]);
  expect(params.getAll("propertyTypes")).toEqual(["pousada"]);
  expect(params.get("minPrice")).toBe("200.15");
  expect(params.get("maxPrice")).toBeNull();
  expect(params.get("page")).toBe("1");
});

it("sincroniza slider por teclado sem ativar o limite intocado", async () => {
  render(
    <FiltersForm
      search={search}
      filters={filterSchema.parse({})}
      options={options}
    />
  );
  const thumb = screen.getByRole("slider", { name: "Preço mínimo por noite" });
  thumb.focus();
  fireEvent.keyDown(thumb, { key: "ArrowRight" });
  expect(screen.getByLabelText("Mínimo (R$)")).toHaveValue(180.01);
  expect(screen.getByLabelText("Máximo (R$)")).toHaveValue(null);
  fireEvent.change(screen.getByLabelText("Máximo (R$)"), {
    target: { value: "500.25" },
  });
  expect(
    screen.getByRole("slider", { name: "Preço máximo por noite" })
  ).toHaveAttribute("aria-valuenow", "500.25");
  expect(push).not.toHaveBeenCalled();
});

it("preserva preço fora da escala e bloqueia faixa invertida sem perder seleções", async () => {
  render(
    <FiltersForm
      search={search}
      filters={filterSchema.parse({ amenities: ["wifi"] })}
      options={options}
    />
  );
  fireEvent.change(screen.getByLabelText("Mínimo (R$)"), {
    target: { value: "4000" },
  });
  expect(screen.getByText(/fora da escala/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Aplicar filtros" }));
  await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
  expect(push.mock.calls[0][0]).toContain("minPrice=4000");
  fireEvent.change(screen.getByLabelText("Máximo (R$)"), {
    target: { value: "200" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Aplicar filtros" }));
  await screen.findByText("O preço máximo deve ser maior ou igual ao mínimo.");
  expect(push).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("checkbox", { name: "Wi-Fi" })).toBeChecked();
});

it("mantém campos na falha da escala e em destino com preço único", () => {
  const { rerender } = render(
    <FiltersForm
      search={search}
      filters={filterSchema.parse({ amenities: ["aircon"] })}
      options={{ ...options, isError: true }}
    />
  );
  expect(screen.getByLabelText("Mínimo (R$)")).toBeEnabled();
  expect(
    screen.getByRole("checkbox", { name: "Ar-condicionado" })
  ).toBeChecked();
  fireEvent.click(
    screen.getByRole("button", { name: "Recarregar faixa de preço" })
  );
  expect(options.onRetry).toHaveBeenCalled();
  rerender(
    <FiltersForm
      search={search}
      filters={filterSchema.parse({})}
      options={{ ...options, max: 180 }}
    />
  );
  expect(screen.getByText(/Diária única/)).toBeInTheDocument();
  expect(screen.getByLabelText("Máximo (R$)")).toBeEnabled();
  expect(screen.queryByRole("slider")).not.toBeInTheDocument();
});

it("remove o aviso pendente ao reaplicar a mesma seleção em outra ordem", async () => {
  render(
    <FiltersForm
      search={search}
      filters={filterSchema.parse({ amenities: ["wifi", "pool"] })}
      options={options}
    />
  );
  fireEvent.click(screen.getByRole("checkbox", { name: "Wi-Fi" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Wi-Fi" }));
  fireEvent.click(screen.getByRole("button", { name: "Aplicar filtros" }));
  await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
  expect(
    screen.queryByText("Alterações não aplicadas")
  ).not.toBeInTheDocument();
});

it("não inventa escala em destino vazio e oferece ar-condicionado quando cadastrado", () => {
  render(
    <FiltersForm
      search={search}
      filters={filterSchema.parse({})}
      options={{ ...options, min: null, max: null, hasAircon: true }}
    />
  );
  expect(
    screen.getByText("Não há faixa de preço disponível neste destino.")
  ).toBeInTheDocument();
  expect(screen.queryByRole("slider")).not.toBeInTheDocument();
  expect(
    screen.getByRole("checkbox", { name: "Ar-condicionado" })
  ).toBeEnabled();
  expect(screen.getByLabelText("Mínimo (R$)")).toBeEnabled();
});
