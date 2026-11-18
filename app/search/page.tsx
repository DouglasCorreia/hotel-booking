import { Suspense } from "react";
import { SearchContent } from "./_components/content";
import { LoadingCards } from "@/components/feedback";
export const metadata = { title: "Encontre sua estadia" };
export default function SearchPage() {
  return (
    <div className="container w-[min(1280px,_calc(100%_-_80px))] mx-auto max-[1200.01px]:w-[calc(100%_-_56px)] max-[760.01px]:w-[calc(100%_-_36px)] max-[360.01px]:w-[calc(100%_-_28px)] pt-7.5 pb-17.5 max-[760.01px]:pt-5.5 max-[760.01px]:pb-[45px]">
      <Suspense fallback={<LoadingCards />}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
