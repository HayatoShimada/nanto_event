import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EventEditContent from "@/components/events/EventEditContent";

export default async function EventEditPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="mb-8 text-2xl font-bold">イベント編集</h1>
        <EventEditContent eventId={eventId} />
      </main>
      <Footer />
    </>
  );
}
