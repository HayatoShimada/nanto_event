import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold">ABOUT</h1>

        <section className="mb-12 space-y-4">
          <h2 className="text-2xl font-bold">ひだっち</h2>
          <p className="text-gray-700">
            南砺市を中心に活動する地域コミュニティ。イベントの企画・運営を通じて、地域の魅力を発信しています。
          </p>
          <a
            href="https://note.com/nantofam710"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-primary hover:underline"
          >
            ひだっちのnoteを見る →
          </a>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">85-Store</h2>
          <p className="text-gray-700">
            地域の特産品やオリジナルグッズを取り扱うショップ。南砺市の魅力を詰め込んだアイテムを提供しています。
          </p>
          <a
            href="https://85-store.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-primary hover:underline"
          >
            85-Storeを見る →
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
