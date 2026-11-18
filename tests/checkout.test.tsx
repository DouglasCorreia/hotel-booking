import { act, renderHook, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCheckout } from "@/features/booking/use-checkout";
import { useBookingStore } from "@/features/booking/store";
import { hotelSchema, roomSchema } from "@/features/hotels/model";
import database from "@/mock-api/db.seed.json";
import { getHotel, getRoom } from "@/features/hotels/api";
import { createBooking } from "@/features/booking/api";
import { priceBreakdown } from "@/features/booking/model";
import { ApiError } from "@/lib/api/client";

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
const submission = {
  guest,
  companions: ["João Silva"],
  coupon: null,
  termsAccepted: true,
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
    draft: null,
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
      await result.current.submit(submission);
    });
    expect(createBooking).not.toHaveBeenCalled();
    act(() => result.current.acceptPrice());
    await act(async () => {
      await result.current.submit(submission);
    });
    expect(createBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        totalPrice: priceBreakdown(room.pricePerNight + 100, 3, 1, null).total,
        checkout: expect.objectContaining({
          companions: submission.companions,
          terms: expect.objectContaining({ version: "1" }),
        }),
        snapshot: expect.objectContaining({
          hotelName: hotel.name,
          roomName: room.name,
          pricePerNight: room.pricePerNight + 100,
        }),
      })
    );
    expect(replace).toHaveBeenCalledWith("/confirmation/42");
  });
  it("recusa quarto que ficou sem estoque entre a seleção e o envio", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    vi.mocked(getRoom).mockResolvedValue({ ...room, available: 0 });
    await act(async () => {
      await result.current.submit(submission);
    });
    expect(createBooking).not.toHaveBeenCalled();
    expect(result.current.issue?.message).toContain("quartos suficientes");
  });
  it("bloqueia duas submissões no mesmo instante", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    await act(async () => {
      await Promise.all([
        result.current.submit(submission),
        result.current.submit(submission),
      ]);
    });
    expect(createBooking).toHaveBeenCalledTimes(1);
  });
  it("exige aceite dos termos antes de enviar", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    await act(async () => {
      await result.current.submit({ ...submission, termsAccepted: false });
    });
    expect(createBooking).not.toHaveBeenCalled();
    expect(result.current.issue?.message).toContain("termos");
  });

  it("preserva o rascunho quando a criação falha e limpa após sucesso", async () => {
    useBookingStore.getState().saveDraft({ ...submission, step: "review" });
    vi.mocked(createBooking).mockRejectedValueOnce(
      new ApiError("Falha simulada", 0, true)
    );
    const { result } = setup();
    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    await act(async () => {
      await result.current.submit(submission);
    });
    expect(result.current.issue).toEqual({
      message: "Falha simulada",
      uncertain: true,
    });
    expect(createBooking).toHaveBeenCalledTimes(1);
    expect(useBookingStore.getState().draft?.guest).toEqual(guest);
    await act(async () => {
      await result.current.submit(submission);
    });
    expect(useBookingStore.getState().draft).toBeNull();
    const persisted = sessionStorage.getItem("lumina-selection-v1") ?? "";
    expect(persisted).not.toContain(guest.email);
    expect(persisted).not.toContain(guest.name);
    expect(persisted).not.toContain(guest.phone);
  });
});

describe("rascunho do checkout", () => {
  it("mantém o rascunho em memória quando a sessão não permite gravação", () => {
    const write = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException(
          "Armazenamento indisponível",
          "QuotaExceededError"
        );
      });
    try {
      useBookingStore.getState().saveDraft({ ...submission, step: "review" });
      expect(useBookingStore.getState().draft?.guest).toEqual(guest);
    } finally {
      write.mockRestore();
    }
  });

  it("descarta o rascunho inválido e conserva a acomodação na hidratação", async () => {
    const { selection } = useBookingStore.getState();
    sessionStorage.setItem(
      "lumina-selection-v1",
      JSON.stringify({
        state: {
          selection,
          draft: { guest, companions: [], coupon: "inválido", step: "payment" },
        },
        version: 0,
      })
    );
    await useBookingStore.persist.rehydrate();
    expect(useBookingStore.getState().selection).toEqual(selection);
    expect(useBookingStore.getState().draft).toBeNull();
  });

  it("preserva o rascunho ao aceitar preço e descarta ao selecionar outro quarto", () => {
    const state = useBookingStore.getState();
    state.saveDraft({ ...submission, step: "review" });
    state.acceptPrice(room.pricePerNight + 100);
    expect(useBookingStore.getState().draft?.guest).toEqual(guest);
    state.select({ ...state.selection!, roomId: room.id + 1 });
    expect(useBookingStore.getState().draft).toBeNull();
  });
});
