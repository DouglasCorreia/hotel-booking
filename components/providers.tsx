"use client";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ApiError } from "@/lib/api/client";
import { useBookingStore } from "@/features/booking/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30000,
            retry: (attempt, error) =>
              attempt < 2 &&
              !(
                error instanceof ApiError &&
                error.status >= 400 &&
                error.status < 500
              ),
            refetchOnWindowFocus: false,
          },
          mutations: { retry: false },
        },
      }),
  );
  useEffect(() => {
    Promise.resolve(useBookingStore.persist.rehydrate()).finally(() =>
      useBookingStore.getState().ready(),
    );
  }, []);
  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster richColors position="bottom-right" />
    </QueryClientProvider>
  );
}
