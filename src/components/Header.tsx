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
            <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md border-b-2 border-text-primary/10 z-50 flex justify-between items-center px-4 py-3 md:hidden shadow-sm transition-all duration-300">
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-10 h-10 flex flex-col justify-center gap-1.5 p-2 border-2 border-transparent hover:border-text-primary/20 rounded-lg active:scale-95 transition-all"
                    aria-label="Menu"
                >
                    <div className="w-6 h-0.5 bg-text-primary rounded-full"></div>
                    <div className="w-6 h-0.5 bg-text-primary rounded-full"></div>
                    <div className="w-6 h-0.5 bg-text-primary rounded-full"></div>
                </button>

                <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group">
                    <h1 className="text-xl font-bold text-main tracking-widest group-hover:scale-105 transition-transform">NANTS</h1>
                </Link>

                {user ? (
                    <Link href="/mypage" className="w-9 h-9 rounded-full border border-text-primary overflow-hidden shadow-sm active:scale-95 transition-transform">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-main/20 flex items-center justify-center text-main font-bold text-xs">
                                {user.displayName ? user.displayName[0].toUpperCase() : "U"}
                            </div>
                        )}
                    </Link>
                ) : (
                    <Link href="/login" className="text-xs font-bold text-text-primary border border-text-primary px-3 py-1.5 bg-white hover:bg-gray-50 transition-colors shadow-[2px_2px_0_0_rgba(51,51,51,0.2)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] rounded-sm">
                        LOGIN
                    </Link>
                )}
            </header>

            <MenuOverlay isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
