"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

type MenuOverlayProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function MenuOverlay({ isOpen, onClose }: MenuOverlayProps) {
    const { user, logout } = useAuth();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setVisible(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!visible) return null;

    return (
        <div
            className={`fixed inset-0 z-[60] bg-white/95 backdrop-blur-md transition-opacity duration-300 flex flex-col justify-center items-center ${isOpen ? "opacity-100" : "opacity-0"
                } pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]`}
        >
            <button
                onClick={onClose}
                className="absolute top-[calc(1.5rem+env(safe-area-inset-top))] right-6 w-12 h-12 flex items-center justify-center border-2 border-text-primary rounded-full hover:bg-gray-100 transition-colors"
            >
                <span className="text-2xl font-bold">×</span>
            </button>

            <nav className="flex flex-col gap-8 text-center">
                <MenuLink href="#all" label="ALL" onClick={onClose} delay={0} />
                <MenuLink href="#news" label="NEWS" onClick={onClose} delay={100} />
                <MenuLink href="#events" label="EVENTS" onClick={onClose} delay={200} />
                <MenuLink href="#teams" label="TEAMS" onClick={onClose} delay={300} />

                <div className="h-px w-20 bg-text-primary/20 mx-auto my-4"></div>

                {user ? (
                    <>
                        <MenuLink href="/mypage" label="MY PAGE" onClick={onClose} delay={400} />
                        <button
                            onClick={() => {
                                if (confirm("ログアウトしますか？")) {
                                    logout();
                                    onClose();
                                }
                            }}
                            className="text-2xl font-bold text-text-secondary hover:text-main transition-colors animate-fade-in-up"
                            style={{ animationDelay: '500ms' }}
                        >
                            LOGOUT
                        </button>
                    </>
                ) : (
                    <MenuLink href="/login" label="LOGIN" onClick={onClose} delay={400} highlight />
                )}
            </nav>

            <div className="absolute bottom-8 text-xs text-text-secondary font-bold tracking-widest flex gap-4">
                <Link href="/privacy" onClick={onClose}>PRIVACY</Link>
                <span>|</span>
                <Link href="/terms" onClick={onClose}>TERMS</Link>
            </div>
        </div>
    );
}

function MenuLink({ href, label, onClick, delay, highlight = false }: { href: string; label: string; onClick: () => void; delay: number; highlight?: boolean }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`text-4xl font-bold tracking-widest transition-transform hover:scale-110 active:scale-95 block ${highlight ? "text-main" : "text-text-primary hover:text-main"
                } animate-fade-in-up`}
            style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
        >
            {label}
        </Link>
    );
}
