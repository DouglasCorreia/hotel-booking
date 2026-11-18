import { CheckoutContent } from "./_components/content";
export const metadata = { title: "Finalize sua reserva simulada" };
export default function CheckoutPage() {
  return (
    <div className="container w-[min(1280px,_calc(100%_-_80px))] mx-auto max-[1200.01px]:w-[calc(100%_-_56px)] max-[760.01px]:w-[calc(100%_-_36px)] max-[360.01px]:w-[calc(100%_-_28px)] pt-7.5 pb-17.5 max-[760.01px]:pt-5.5 max-[760.01px]:pb-[45px]">
      <CheckoutContent />
    </div>
  );
}
