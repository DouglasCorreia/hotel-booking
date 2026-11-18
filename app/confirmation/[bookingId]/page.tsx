import { Suspense } from "react";
import { LoadingCards } from "@/components/feedback";
import { ConfirmationContent } from "./_components/content";

export const metadata = {
  title: "Confirmação da reserva simulada",
  robots: { index: false, follow: false },
};

type ConfirmationPageProps = PageProps<"/confirmation/[bookingId]">;

async function ConfirmationDetails({
  params,
}: Pick<ConfirmationPageProps, "params">) {
  const { bookingId } = await params;
  return <ConfirmationContent bookingId={bookingId} />;
}

export default function ConfirmationPage({ params }: ConfirmationPageProps) {
  return (
    <div className="container w-[min(1280px,_calc(100%_-_80px))] mx-auto max-[1200.01px]:w-[calc(100%_-_56px)] max-[760.01px]:w-[calc(100%_-_36px)] max-[360.01px]:w-[calc(100%_-_28px)] pt-7.5 pb-17.5 max-[760.01px]:pt-5.5 max-[760.01px]:pb-[45px]">
      <Suspense fallback={<LoadingCards count={2} />}>
        <ConfirmationDetails params={params} />
      </Suspense>
    </div>
  );
}
