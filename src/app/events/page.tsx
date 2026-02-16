import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EventListPageContent from "@/components/events/EventListPageContent";

export default function EventListPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold">EVENT LIST</h1>
        <EventListPageContent />
      </main>
      <Footer />
    </>
  );
}
