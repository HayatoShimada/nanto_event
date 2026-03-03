"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useState } from "react";
import MenuOverlay from "./MenuOverlay";

export default function Header() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md border-b-2 border-text-primary/10 z-50 flex justify-between items-center px-4 py-3 md:hidden shadow-sm transition-all duration-300 pt-[env(safe-area-inset-top)]">
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="w-10 h-10 flex flex-col justify-center gap-1.5 p-2 border-2 border-transparent hover:border-text-primary/20 rounded-lg active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-main"
                    aria-label="メニューを開く"
                >
                    <div className="w-6 h-0.5 bg-text-primary rounded-full"></div>
                    <div className="w-6 h-0.5 bg-text-primary rounded-full"></div>
                    <div className="w-6 h-0.5 bg-text-primary rounded-full"></div>
                </button>

                <Link href="/" aria-label="トップページへ" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-main p-1 rounded">
                    <h1 className="text-xl font-bold text-main tracking-widest group-hover:scale-105 transition-transform" aria-hidden="true">NANTS</h1>
                    <span className="text-[10px] font-bold bg-main text-white px-1.5 py-0.5 rounded-sm tracking-widest mt-0.5" aria-hidden="true">BETA</span>
                </Link>

                {user ? (
                    <Link href="/mypage" aria-label="マイページへ" className="w-9 h-9 rounded-full border border-text-primary overflow-hidden shadow-sm active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-main flex items-center justify-center">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt={`${user.displayName || "User"}のアイコン`} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-main/20 flex items-center justify-center text-main font-bold text-xs" aria-hidden="true">
                                {user.displayName ? user.displayName[0].toUpperCase() : "U"}
                            </div>

                        )}
                    </Link>
                ) : (
                    <Link href="/login" className="text-xs font-bold text-text-primary border border-text-primary px-3 py-1.5 bg-white hover:bg-gray-50 transition-colors shadow-[2px_2px_0_0_rgba(51,51,51,0.2)] active:shadow-none active:translate-x-px active:translate-y-px rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-main">
                        LOGIN
                    </Link>
                )}
            </header>

            <MenuOverlay isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
