import { act, renderHook, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCheckout } from "@/features/booking/use-checkout";
import { useBookingStore } from "@/features/booking/store";
import { hotelSchema, roomSchema } from "@/features/hotels/model";
import database from "@/mock-api/db.seed.json";
import { getHotel, getRoom } from "@/features/hotels/api";
import { createBooking } from "@/features/booking/api";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("@/features/hotels/api", () => ({
  getHotel: vi.fn(),
  getRoom: vi.fn(),
}));
vi.mock("@/features/booking/api", () => ({ createBooking: vi.fn() }));
const hotel = hotelSchema.parse(database.hotels[0]);
const room = roomSchema.parse(database.rooms[0]);
const guest = {
  name: "Maria Silva",
  email: "maria@example.com",
  phone: "11999991234",
};
const search = {
  destination: hotel.destination,
  checkIn: "2099-01-01",
  checkOut: "2099-01-04",
  adults: 2,
  children: 0,
  rooms: 1,
};

function setup() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => useCheckout(), { wrapper });
}
beforeEach(() => {
  vi.clearAllMocks();
  useBookingStore.setState({
    selection: {
      hotelId: hotel.id,
      roomId: room.id,
      search,
      pricePerNight: room.pricePerNight,
    },
    isReady: true,
  });
  vi.mocked(getHotel).mockResolvedValue(hotel);
  vi.mocked(getRoom).mockResolvedValue(room);
  vi.mocked(createBooking).mockImplementation(async (value) => ({
    ...value,
    id: 42,
  }));
});
afterEach(() => {
  cleanup();
  sessionStorage.clear();
});

describe("checkout revalida a seleção antes da criação", () => {
  it("exige aceitar uma mudança de preço e conserva o resumo contratado", async () => {
    vi.mocked(getRoom).mockResolvedValue({
      ...room,
      pricePerNight: room.pricePerNight + 100,
    });
    const { result } = setup();
    await waitFor(() => expect(result.current.priceChanged).toBe(true));
    await act(async () => {
      await result.current.submit(guest);
    });
    expect(createBooking).not.toHaveBeenCalled();
    act(() => result.current.acceptPrice());
    await act(async () => {
      await result.current.submit(guest);
    });
    expect(createBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        totalPrice: (room.pricePerNight + 100) * 3,
        snapshot: expect.objectContaining({
          hotelName: hotel.name,
          roomName: room.name,
          pricePerNight: room.pricePerNight + 100,
        }),
      }),
    );
    expect(replace).toHaveBeenCalledWith("/confirmation/42");
  });
  it("recusa quarto que ficou sem estoque entre a seleção e o envio", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    vi.mocked(getRoom).mockResolvedValue({ ...room, available: 0 });
    await act(async () => {
      await result.current.submit(guest);
    });
    expect(createBooking).not.toHaveBeenCalled();
    expect(result.current.issue?.message).toContain("quartos suficientes");
  });
  it("bloqueia duas submissões no mesmo instante", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    await act(async () => {
      await Promise.all([
        result.current.submit(guest),
        result.current.submit(guest),
      ]);
    });
    expect(createBooking).toHaveBeenCalledTimes(1);
  });
  it("não persiste os dados do titular na sessão", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    await act(async () => {
      await result.current.submit(guest);
    });
    const persisted = sessionStorage.getItem("lumina-selection-v1") ?? "";
    expect(persisted).not.toContain(guest.email);
    expect(persisted).not.toContain(guest.name);
    expect(persisted).not.toContain(guest.phone);
  });
});
