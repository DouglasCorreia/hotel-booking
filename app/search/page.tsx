import { Suspense } from "react";
import { SearchContent } from "./_components/content";
import { LoadingCards } from "@/components/feedback";
export const metadata = { title: "Encontre sua estadia" };
export default function SearchPage() {
  return (
    <div className="container catalog-page">
      <Suspense fallback={<LoadingCards />}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
