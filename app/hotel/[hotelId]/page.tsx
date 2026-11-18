import { Suspense } from "react";
import { HotelContent } from "./_components/content";
import { LoadingCards } from "@/components/feedback";
export const metadata = { title: "Conheça sua próxima estadia" };
export default async function HotelPage({
  params,
}: {
  params: Promise<{ hotelId: string }>;
}) {
  const { hotelId } = await params;
  return (
    <div className="container hotel-page">
      <Suspense fallback={<LoadingCards />}>
        <HotelContent hotelId={hotelId} />
      </Suspense>
    </div>
  );
}
