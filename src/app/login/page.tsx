"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
    const { user, login, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user && !loading) {
            router.push("/");
        }
    }, [user, loading, router]);

    const handleLogin = async () => {
        try {
            await login();
            router.push("/");
        } catch (error) {
            console.error("Login failed:", error);
            alert("ログインに失敗しました。");
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-bg-main">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-main" />
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex items-center justify-center bg-bg-main relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[50vh] h-[50vh] bg-main/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-[50vh] h-[50vh] bg-bg-sub/50 rounded-full blur-3xl -ml-20 -mb-20"></div>

            <div className="bg-white p-12 w-[400px] border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)] relative z-10 flex flex-col items-center">
                <h1 className="text-3xl font-bold text-main mb-8 tracking-widest">NANTS</h1>

                <p className="text-text-secondary mb-8 text-center text-sm">
                    コミュニティに参加して、<br />
                    新しい体験を見つけよう。
                </p>

                <button
                    onClick={handleLogin}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-text-primary border-2 border-text-primary font-bold shadow-[4px_4px_0_0_rgba(242,128,191,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(242,128,191,1)] transition-all cursor-pointer active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                >
                    {/* Google Icon SVG */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Googleでログイン
                </button>
            </div>
        </div>
    );
}
