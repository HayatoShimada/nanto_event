import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EventDetail from "@/components/events/EventDetail";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <EventDetail eventId={eventId} />
      </main>
      <Footer />
    </>
  );
}
