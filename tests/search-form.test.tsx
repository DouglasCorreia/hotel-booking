import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SearchForm } from "@/features/search/_components/search-form";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/features/hotels/hooks", () => ({
  useSuggestions: (text: string) => ({
    data: [{ id: 1, name: text, country: "Brasil" }],
    isFetching: false,
    isError: false,
  }),
}));
afterEach(cleanup);

it("não permite selecionar sugestões da consulta anterior durante o debounce", () => {
  render(
    <SearchForm
      initial={{
        destination: "Rio de Janeiro, RJ",
        checkIn: "2099-01-01",
        checkOut: "2099-01-04",
        adults: 2,
        children: 0,
        rooms: 1,
      }}
    />,
  );
  const input = screen.getByRole("combobox", { name: "Destino" });
  fireEvent.focus(input);
  expect(
    screen.getByRole("option", { name: /Rio de Janeiro/ }),
  ).toBeInTheDocument();
  fireEvent.change(input, { target: { value: "sao" } });
  expect(
    screen.queryByRole("option", { name: /Rio de Janeiro/ }),
  ).not.toBeInTheDocument();
});
