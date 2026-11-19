import { LoadingCards } from "@/components/feedback";
export default function Loading() {
  return (
    <div className="container w-[min(1280px,_calc(100%_-_80px))] mx-auto max-[1200.01px]:w-[calc(100%_-_56px)] max-[760.01px]:w-[calc(100%_-_36px)] max-[360.01px]:w-[calc(100%_-_28px)] py-17.5 max-[760.01px]:py-[45px]">
      <LoadingCards />
    </div>
  );
}
