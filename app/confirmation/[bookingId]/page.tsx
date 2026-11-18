import { ConfirmationContent } from "./_components/content";
export const metadata = {
  title: "Confirmação da reserva simulada",
  robots: { index: false, follow: false },
};
export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return (
    <div className="container confirmation-page">
      <ConfirmationContent bookingId={bookingId} />
    </div>
  );
}
