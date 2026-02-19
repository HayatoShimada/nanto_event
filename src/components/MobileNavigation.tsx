"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function MobileNavigation() {
    const { user } = useAuth();

    return (
        <nav className="fixed bottom-0 left-0 w-full bg-white border-t-2 border-text-primary z-50 flex justify-around items-center px-4 py-3 md:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
            <NavItem href="#all" label="ALL" icon="🏠" />
            <NavItem href="#news" label="NEWS" icon="📰" />
            <NavItem href="#events" label="EVENT" icon="🎉" />
            <NavItem href="#teams" label="TEAM" icon="👥" />
            <NavItem href={user ? "/mypage" : "/login"} label={user ? "MY" : "LOGIN"} icon="👤" />
        </nav>
    );
}

function NavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
    return (
        <Link href={href} className="flex flex-col items-center gap-1 text-text-primary hover:text-main transition-colors">
            <span className="text-xl">{icon}</span>
            <span className="text-[10px] font-bold tracking-wide">{label}</span>
        </Link>
    );
}
