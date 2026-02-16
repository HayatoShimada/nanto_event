import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">ログイン</h1>
            <p className="mt-2 text-gray-600">
              南砺市イベントページにログイン
            </p>
          </div>
          <LoginForm />
          <p className="text-center text-sm text-gray-600">
            アカウントをお持ちでない方は
            <Link
              href="/auth/register"
              className="text-primary hover:underline"
            >
              新規登録
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
