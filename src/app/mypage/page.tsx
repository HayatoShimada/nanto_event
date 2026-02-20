"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { getOrganizedEvents } from "@/lib/firebase/firestore";
import type { Event as EventType } from "@/types";
import { format } from "date-fns";

export default function MyPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [organizedEvents, setOrganizedEvents] = useState<EventType[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && user && profile) {
      if (profile.role === "auth") {
        setLoadingEvents(true);
        getOrganizedEvents(user.uid).then(events => {
          setOrganizedEvents(events);
          setLoadingEvents(false);
        }).catch(err => {
          console.error("Failed to load organized events:", err);
          setLoadingEvents(false);
        });
      }
    }
  }, [user, profile, loading, router]);

  if (loading || !profile) {
    return (
      <div className="h-dvh w-full flex items-center justify-center bg-bg-main">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-main" />
      </div>
    );
  }

  return (
    <div className="h-dvh w-screen flex flex-col bg-bg-main overflow-hidden text-text-primary font-sans">
      <Header />

      <main className="flex-1 w-full flex items-center justify-center p-4 pt-[calc(4rem+env(safe-area-inset-top))]">
        {/* Profile Card */}
        <div className="w-full max-w-md bg-white border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)] p-8 flex flex-col items-center relative">

          {/* Avatar */}
          <div className="w-24 h-24 rounded-full border-2 border-text-primary overflow-hidden mb-6 shadow-md relative">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-main/20 flex items-center justify-center text-main font-bold text-3xl">
                {profile.username[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-2 tracking-widest">{profile.username}</h1>
          <p className="text-text-secondary text-sm mb-6">{profile.mail}</p>

          <div className="w-full space-y-4 mb-8">
            <div className="border-b border-text-primary/20 pb-2">
              <span className="text-xs font-bold text-main block mb-1">ROLE</span>
              <span className="text-sm">{profile.role.toUpperCase()}</span>
            </div>
            <div className="border-b border-text-primary/20 pb-2">
              <span className="text-xs font-bold text-main block mb-1">POSTAL CODE</span>
              <span className="text-sm">{profile.postalcode || "未登録"}</span>
            </div>
            <div className="border-b border-text-primary/20 pb-2">
              <span className="text-xs font-bold text-main block mb-1">ADDRESS</span>
              <span className="text-sm">{profile.address || "未登録"}</span>
            </div>
            {profile.snsAccounts && profile.snsAccounts.length > 0 && (
              <div className="border-b border-text-primary/20 pb-2">
                <span className="text-xs font-bold text-main block mb-1">SNS ACCOUNTS</span>
                <div className="flex flex-col gap-1">
                  {profile.snsAccounts.map((url, index) => (
                    <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                      {url}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link href="/mypage/edit" className="w-full bg-main text-white font-bold py-3 text-center border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(51,51,51,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all">
            EDIT PROFILE
          </Link>

          <div className="w-full flex justify-center mt-4">
            <Link href="/events/create" className="w-full bg-white text-main font-bold py-2 text-sm text-center border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] hover:shadow-[2px_2px_0_0_rgba(51,51,51,1)] active:shadow-none transition-all">
              CREATE EVENT
            </Link>
          </div>

          <Link href="/" className="mt-6 text-sm font-bold text-text-secondary hover:text-main transition-colors border-b border-transparent hover:border-main">
            BACK TO HOME
          </Link>

        </div>

        {/* Organizer Dashboard */}
        {profile && profile.role === "auth" && (
          <div className="w-full max-w-md bg-white border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)] p-6 md:p-8 flex flex-col relative">
            <h2 className="text-xl font-bold mb-4 tracking-widest text-main border-b-2 border-main pb-2">YOUR EVENTS</h2>

            {loadingEvents ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-main" />
              </div>
            ) : organizedEvents.length > 0 ? (
              <div className="flex flex-col gap-4">
                {organizedEvents.map(event => (
                  <div key={event.id} className="border-2 border-text-primary p-4 flex flex-col gap-2 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm leading-tight text-text-primary">{event.name}</h3>
                      <span className="text-[10px] items-center px-2 py-0.5 font-bold bg-main/10 text-main border border-main shrink-0">
                        {event.startDate ? format(event.startDate.toDate(), "yyyy.MM.dd") : ""}
                      </span>
                    </div>

                    <div className="flex justify-between items-end mt-2">
                      <div className="flex gap-4 text-xs font-bold text-text-secondary">
                        <span className="flex items-center gap-1">👀 <span className="text-main font-mono">{event.pageViews || 0}</span></span>
                        <span className="flex items-center gap-1">🖱️ <span className="text-main font-mono">{event.participationClicks || 0}</span></span>
                      </div>
                      <Link href={`/events/edit?id=${event.id}`} className="text-xs bg-text-primary text-white px-3 py-1 font-bold hover:opacity-80 transition-opacity">
                        EDIT
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm font-bold text-text-secondary bg-gray-50 border-2 border-dashed border-gray-300">
                まだ主催イベントがありません。
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
