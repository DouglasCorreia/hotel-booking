"use client";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getHotel, getRoom } from "@/features/hotels/api";
import { cancellationLabels } from "@/features/hotels/model";
import { ApiError } from "@/lib/api/client";
import { useBookingStore } from "./store";
import { createBooking } from "./api";
import {
  nightsBetween,
  priceBreakdown,
  selectionProblem,
  termsVersion,
} from "./model";
import {
  checkoutSubmissionSchema,
  type CheckoutSubmission,
} from "./checkout-model";

export function useCheckout() {
  const router = useRouter();
  const client = useQueryClient();
  const selection = useBookingStore((state) => state.selection);
  const isReady = useBookingStore((state) => state.isReady);
  const [issue, setIssue] = useState<{
    message: string;
    uncertain: boolean;
  } | null>(null);
  const lock = useRef(false);
  const queryKey = ["checkout", selection?.hotelId, selection?.roomId];
  const queryFn = async () => {
    const [hotel, room] = await Promise.all([
      getHotel(selection!.hotelId),
      getRoom(selection!.roomId),
    ]);
    return { hotel, room };
  };
  const query = useQuery({
    queryKey,
    queryFn,
    enabled: isReady && !!selection,
    staleTime: 0,
    refetchOnMount: "always",
  });
  useEffect(() => {
    if (isReady && !selection && !lock.current) router.replace("/#buscar");
  }, [isReady, selection, router]);
  const mutation = useMutation({
    mutationFn: async (input: CheckoutSubmission) => {
      if (!selection)
        throw new ApiError("Selecione uma acomodação antes de continuar.");
      if (!input.termsAccepted)
        throw new ApiError("Aceite os termos da reserva antes de continuar.");
      const { guest, companions, coupon } =
        checkoutSubmissionSchema.parse(input);
      if (
        companions.length !==
        selection.search.adults + selection.search.children - 1
      )
        throw new ApiError("Informe o nome de todos os hóspedes da reserva.");
      const { hotel, room } = await client.fetchQuery({
        queryKey,
        queryFn,
        staleTime: 0,
      });
      const problem = selectionProblem(room, hotel.id, selection.search);
      if (problem) throw new ApiError(problem);
      if (hotel.destination !== selection.search.destination)
        throw new ApiError("O destino da seleção mudou. Faça uma nova busca.");
      if (room.pricePerNight !== selection.pricePerNight)
        throw new ApiError(
          "O preço mudou. Confira o novo total e aceite a atualização antes de continuar."
        );
      const pricing = priceBreakdown(
        room.pricePerNight,
        nightsBetween(selection.search.checkIn, selection.search.checkOut),
        selection.search.rooms,
        coupon
      );
      const now = new Date().toISOString();
      return createBooking({
        hotelId: hotel.id,
        roomId: room.id,
        ...selection.search,
        guests: [guest],
        totalPrice: pricing.total,
        createdAt: now,
        checkout: {
          companions,
          pricing,
          terms: { version: termsVersion, acceptedAt: now },
        },
        snapshot: {
          hotelName: hotel.name,
          hotelImage: hotel.thumbnail,
          hotelAddress: hotel.address,
          roomName: room.name,
          pricePerNight: room.pricePerNight,
          cancellationPolicy: cancellationLabels[hotel.cancellationPolicy],
          checkInTime: hotel.checkInTime,
          checkOutTime: hotel.checkOutTime,
        },
      });
    },
  });
  async function submit(input: CheckoutSubmission) {
    if (lock.current || !selection) return;
    lock.current = true;
    setIssue(null);
    try {
      const booking = await mutation.mutateAsync(input);
      useBookingStore.getState().complete(selection);
      router.replace(`/confirmation/${encodeURIComponent(booking.id)}`);
    } catch (error) {
      setIssue({
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível criar a reserva.",
        uncertain: error instanceof ApiError && error.uncertain,
      });
      lock.current = false;
    }
  }
  const problem =
    query.data && selection
      ? (selectionProblem(
          query.data.room,
          query.data.hotel.id,
          selection.search
        ) ??
        (query.data.hotel.destination !== selection.search.destination
          ? "O destino da seleção não corresponde ao hotel."
          : null))
      : null;
  const priceChanged = !!(
    query.data &&
    selection &&
    query.data.room.pricePerNight !== selection.pricePerNight
  );
  function acceptPrice() {
    if (selection && query.data) {
      useBookingStore.getState().acceptPrice(query.data.room.pricePerNight);
      setIssue(null);
    }
  }
  return {
    selection,
    isReady,
    query,
    mutation,
    issue,
    submit,
    problem,
    priceChanged,
    acceptPrice,
  };
}
