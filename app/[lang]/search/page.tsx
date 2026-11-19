import { Suspense } from "react";
import { SearchContent } from "@/app/search/_components/content";
import { LoadingCards } from "@/components/feedback";
import { getTranslator } from "@/lib/i18n/server";

export async function generateMetadata() {
  const t = await getTranslator();
  return { title: t("Encontre sua estadia") };
}
export default function SearchPage() {
  return (
    <div className="container w-[min(1280px,_calc(100%_-_80px))] mx-auto max-[1200.01px]:w-[calc(100%_-_56px)] max-[760.01px]:w-[calc(100%_-_36px)] max-[360.01px]:w-[calc(100%_-_28px)] pt-7.5 pb-17.5 max-[760.01px]:pt-5.5 max-[760.01px]:pb-[45px]">
      <Suspense fallback={<LoadingCards />}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
