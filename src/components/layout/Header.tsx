"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthContext } from "@/contexts/AuthContext";
import { logout } from "@/lib/firebase/auth";

const NAV_ITEMS = [
  { href: "/", label: "HOME" },
  { href: "/about", label: "ABOUT" },
  { href: "/collaborators", label: "COLLABORATOR" },
  { href: "/events", label: "EVENT LIST" },
  { href: "/contact", label: "CONTACT" },
];

export default function Header() {
  const { user, profile } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">
          南砺市イベント
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-medium tracking-widest text-muted uppercase hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/mypage"
                className="text-xs font-medium tracking-widest text-muted uppercase hover:text-primary"
              >
                MY PAGE
              </Link>
              {profile &&
                (profile.role === "admin" ||
                  profile.role === "collaborator") && (
                  <Link
                    href="/events/new"
                    className="rounded-full border border-primary bg-primary px-4 py-1.5 text-xs font-medium tracking-wide text-white hover:bg-primary-dark"
                  >
                    イベント作成
                  </Link>
                )}
              <button
                onClick={() => logout()}
                className="text-xs text-muted hover:text-primary"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-full border border-primary bg-primary px-5 py-1.5 text-xs font-medium tracking-wide text-white hover:bg-primary-dark"
            >
              ログイン
            </Link>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニュー"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="border-t border-gray-100 bg-white px-6 py-6 md:hidden">
          <div className="flex flex-col gap-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-xs font-medium tracking-widest text-muted uppercase hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/mypage"
                  onClick={() => setMenuOpen(false)}
                  className="text-xs font-medium tracking-widest text-muted uppercase hover:text-primary"
                >
                  MY PAGE
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="text-left text-xs text-muted hover:text-primary"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="text-xs font-medium tracking-widest text-primary uppercase"
              >
                ログイン
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
