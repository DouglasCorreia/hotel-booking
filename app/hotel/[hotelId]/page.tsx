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
    <div className="container w-[min(1280px,_calc(100%_-_80px))] mx-auto max-[1200.01px]:w-[calc(100%_-_56px)] max-[760.01px]:w-[calc(100%_-_36px)] max-[360.01px]:w-[calc(100%_-_28px)] pt-7.5 pb-17.5 max-[760.01px]:pt-5.5 max-[760.01px]:pb-[45px]">
      <Suspense fallback={<LoadingCards />}>
        <HotelDetails params={params} />
      </Suspense>
    </div>
  );
}
