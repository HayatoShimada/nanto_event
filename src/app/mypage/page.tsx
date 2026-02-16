import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MyPageContent from "@/components/mypage/MyPageContent";

export default function MyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold">MY PAGE</h1>
        <MyPageContent />
      </main>
      <Footer />
    </>
  );
}
