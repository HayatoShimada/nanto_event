import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EventNewContent from "@/components/events/EventNewContent";

export default function EventNewPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="mb-8 text-2xl font-bold">イベント作成</h1>
        <EventNewContent />
      </main>
      <Footer />
    </>
  );
}
