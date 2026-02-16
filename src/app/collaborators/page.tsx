import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CollaboratorsList from "@/components/collaborators/CollaboratorsList";

export default function CollaboratorsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold">COLLABORATOR</h1>
        <CollaboratorsList />
      </main>
      <Footer />
    </>
  );
}
