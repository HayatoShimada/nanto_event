import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactForm from "@/components/contact/ContactForm";

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold">CONTACT</h1>
        <p className="mb-6 text-gray-600">
          ご質問やお問い合わせはこちらのフォームからお送りください。
        </p>
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
