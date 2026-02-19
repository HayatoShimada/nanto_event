"use client";

import { useEffect, useState } from "react";

const SECTIONS = ["all", "news", "events", "teams"];

export default function VerticalNav() {
    const [activeSection, setActiveSection] = useState("all");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { threshold: 0.5 }
        );

        SECTIONS.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4 md:hidden">
            {SECTIONS.map((id) => (
                <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className="group flex items-center gap-2 outline-none"
                    aria-label={`Go to ${id}`}
                >
                    <span className={`text-[8px] font-bold tracking-tighter transition-all duration-300 ${
                        activeSection === id ? "opacity-100 translate-x-0 text-main" : "opacity-0 translate-x-2 pointer-events-none"
                    }`}>
                        {id.toUpperCase()}
                    </span>
                    <div
                        className={`w-2.5 h-2.5 rounded-full border-2 transition-all duration-300 ${
                            activeSection === id
                                ? "bg-main border-main scale-125 shadow-[0_0_8px_rgba(242,128,191,0.5)]"
                                : "bg-white border-text-primary/20 hover:border-text-primary/40"
                        }`}
                    />
                </button>
            ))}
        </nav>
    );
}
