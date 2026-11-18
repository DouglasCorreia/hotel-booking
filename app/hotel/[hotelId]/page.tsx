import { Suspense } from "react";
import { HotelContent } from "./_components/content";
import { LoadingCards } from "@/components/feedback";
export const metadata = { title: "Conheça sua próxima estadia" };
type HotelPageProps = {
  params: Promise<{ hotelId: string }>;
};

async function HotelDetails({ params }: HotelPageProps) {
  const { hotelId } = await params;
  return <HotelContent hotelId={hotelId} />;
}

export default function HotelPage({ params }: HotelPageProps) {
  return (
    <div className="container hotel-page">
      <Suspense fallback={<LoadingCards />}>
        <HotelDetails params={params} />
      </Suspense>
    </div>
  );
}
