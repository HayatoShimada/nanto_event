import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">新規登録</h1>
            <p className="mt-2 text-gray-600">
              南砺市イベントページに登録
            </p>
          </div>
          <RegisterForm />
          <p className="text-center text-sm text-gray-600">
            すでにアカウントをお持ちの方は
            <Link href="/auth/login" className="text-primary hover:underline">
              ログイン
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
