"use client";

import Link from "next/link";
import { useUpcomingEvents } from "@/hooks/useEvents";
import EventCard from "@/components/events/EventCard";

export default function HomeContent() {
  const { events, loading } = useUpcomingEvents(6);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary px-6 py-28 text-center md:py-36">
        <div className="animate-fade-in-up relative z-10">
          <p className="mb-4 text-xs font-medium tracking-[0.3em] text-white/60 uppercase">
            Nanto City Events
          </p>
          <h1 className="text-5xl font-bold tracking-tight text-white md:text-7xl">
            南砺市
            <br />
            イベントページ
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-white/70">
            南砺市のイベント情報を一か所に。参加登録もかんたん。
          </p>
          <Link
            href="/events"
            className="mt-8 inline-block rounded-full border border-white/30 bg-white px-8 py-3 text-sm font-medium tracking-wide text-primary hover:bg-white/90"
          >
            イベント一覧を見る
          </Link>
        </div>
        {/* Background accent */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white" />
          <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-white" />
        </div>
      </section>

      {/* Latest events */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-medium tracking-[0.2em] text-muted uppercase">
              Upcoming
            </p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">最新イベント</h2>
          </div>
          <Link
            href="/events"
            className="hidden text-sm font-medium text-muted hover:text-primary md:block"
          >
            すべて見る &rarr;
          </Link>
        </div>
        {loading ? (
          <p className="text-muted">読み込み中...</p>
        ) : events.length === 0 ? (
          <p className="text-muted">現在予定されているイベントはありません</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
        <Link
          href="/events"
          className="mt-8 block text-center text-sm font-medium text-muted hover:text-primary md:hidden"
        >
          すべて見る &rarr;
        </Link>
      </section>
    </main>
  );
}
