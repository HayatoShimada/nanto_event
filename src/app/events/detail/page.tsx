"use client";

import { useEffect, useState, Suspense } from "react";
import { getEvent, incrementPageViews, incrementParticipationClick } from "@/lib/firebase/firestore";
import type { Event } from "@/types";
import Header from "@/components/Header";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";

function EventDetailsContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            if (!id) return;
            try {
                const data = await getEvent(id);
                if (data) {
                    setEvent(data as Event);
                    // Increment PV on load
                    incrementPageViews(id).catch(console.error);
                }
            } catch (error) {
                console.error("Failed to load event details", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-dvh flex items-center justify-center bg-bg-main">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-main" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-dvh bg-bg-main font-sans text-text-primary">
                <Header />
                <main className="max-w-3xl mx-auto p-4 pt-[calc(5rem+env(safe-area-inset-top))]">
                    <div className="bg-white p-8 text-center border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)]">
                        <h1 className="text-2xl font-bold mb-4">Event not found</h1>
                        <p>ご指定のイベントは見つかりませんでした。</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-bg-main font-sans text-text-primary">
            <Header />
            <main className="max-w-4xl mx-auto p-4 pt-[calc(5rem+env(safe-area-inset-top))] pb-20">
                <div className="bg-white border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)] overflow-hidden">
                    {event.imageURL && (
                        <div className="w-full h-64 md:h-96 relative border-b-2 border-text-primary">
                            <img src={event.imageURL} alt={event.name} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="p-6 md:p-8">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {event.categories.map(c => (
                                <span key={c} className="bg-main text-white px-2 py-1 text-xs font-bold">{c.toUpperCase()}</span>
                            ))}
                            {event.tags?.map(t => (
                                <span key={t} className="bg-bg-sub text-text-primary border border-text-primary/20 px-2 py-1 text-xs font-bold">{t}</span>
                            ))}
                        </div>

                        <h1 className="text-3xl font-bold mb-6">{event.name}</h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="border-2 border-text-primary p-4">
                                <span className="text-xs font-bold text-main block mb-1">START DATE</span>
                                <span className="font-bold">{event.startDate ? format(event.startDate.toDate(), "yyyy.MM.dd HH:mm") : "-"}</span>
                            </div>
                            <div className="border-2 border-text-primary p-4">
                                <span className="text-xs font-bold text-main block mb-1">FINISH DATE</span>
                                <span className="font-bold">{event.finishDate ? format(event.finishDate.toDate(), "yyyy.MM.dd HH:mm") : "-"}</span>
                            </div>
                            <div className="border-2 border-text-primary p-4 md:col-span-2">
                                <span className="text-xs font-bold text-main block mb-1">LOCATION</span>
                                <span className="font-bold">{event.location}</span>
                            </div>
                        </div>

                        <div className="mb-8">
                            <span className="text-xl font-bold border-b-2 border-main pb-2 mb-4 inline-block">DESCRIPTION</span>
                            <div className="prose prose-sm max-w-none mt-4" dangerouslySetInnerHTML={{ __html: event.description || "説明はありません。" }} />
                        </div>

                        {event.recruitmentUrl && (
                            <div className="mt-8 pt-8 border-t-2 border-text-primary/20 text-center">
                                <a
                                    href={event.recruitmentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                        requestAnimationFrame(() => {
                                            if (event.id) incrementParticipationClick(event.id).catch(console.error);
                                        });
                                    }}
                                    className="bg-main text-white font-bold py-4 px-12 text-lg border-2 border-text-primary inline-block shadow-[4px_4px_0_0_rgba(51,51,51,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] hover:shadow-[2px_2px_0_0_rgba(51,51,51,1)] active:shadow-none transition-all"
                                >
                                    JOIN EVENT / 参加申し込み
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function EventDetailsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-dvh flex items-center justify-center bg-bg-main">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-main" />
            </div>
        }>
            <EventDetailsContent />
        </Suspense>
    );
}
