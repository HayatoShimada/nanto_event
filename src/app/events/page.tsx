"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase/config';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import type { Event as EventType, UserProfile } from '@/types';
import { EventCard } from '../page';
import UserModal from '@/components/UserModal';
import { TAG_EMOJIS, USER_TAGS } from '@/constants/tags';

export default function EventsPage() {
    const [allEvents, setAllEvents] = useState<EventType[]>([]);
    const [events, setEvents] = useState<EventType[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [selectedTag, setSelectedTag] = useState<string>("ALL");

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                // Fetch a large number of events for the "View All" page
                const snap = await getDocs(query(collection(db, "events"), orderBy("startDate", "asc"), limit(500)));
                const fetchedEvents = snap.docs.map(d => ({ id: d.id, ...d.data() } as EventType));
                setAllEvents(fetchedEvents);
            } catch (error) {
                console.error("Failed to fetch events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // Handle filtering by tag
    useEffect(() => {
        if (selectedTag === "ALL") {
            setEvents(allEvents);
        } else {
            setEvents(allEvents.filter(e => e.tags && e.tags.includes(selectedTag)));
        }
    }, [allEvents, selectedTag]);

    return (
        <div className="min-h-screen bg-bg-main font-sans text-text-primary">
            <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm z-50 border-b-2 border-text-primary shadow-[0_4px_0_0_rgba(51,51,51,1)]">
                <div className="w-full h-16 md:h-20 px-4 md:px-8 flex items-center justify-between">
                    <Link href="/#events" className="font-black text-base md:text-xl tracking-tighter text-text-primary hover:text-main transition-colors flex items-center gap-2 px-4 py-2 border-2 border-transparent hover:border-main bg-bg-sub shadow-[2px_2px_0_0_rgba(51,51,51,1)]">
                        ← BACK
                    </Link>
                    <h1 className="text-xl md:text-2xl font-black tracking-widest text-text-primary">ALL EVENTS</h1>
                </div>
            </header>

            <main className="pt-24 md:pt-32 pb-12 px-4 md:px-12 max-w-7xl mx-auto">
                <div className="mb-8 flex overflow-x-auto pb-4 gap-2 snap-x hide-scrollbar">
                    <button
                        type="button"
                        onClick={() => setSelectedTag("ALL")}
                        className={`snap-start shrink-0 px-6 py-2 font-bold border-2 transition-all ${selectedTag === "ALL"
                            ? "bg-text-primary text-white border-text-primary shadow-[4px_4px_0_0_rgba(242,128,191,1)] translate-x-[-2px] translate-y-[-2px]"
                            : "bg-white text-text-primary border-text-primary hover:bg-main/10 shadow-[2px_2px_0_0_rgba(51,51,51,1)] hover:shadow-[4px_4px_0_0_rgba(51,51,51,1)] active:translate-y-0 active:translate-x-0 active:shadow-none"
                            }`}
                    >
                        ALL
                    </button>
                    {USER_TAGS.map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => setSelectedTag(tag)}
                            className={`snap-start shrink-0 px-4 py-2 font-bold border-2 flex items-center gap-2 transition-all ${selectedTag === tag
                                ? "bg-text-primary text-white border-text-primary shadow-[4px_4px_0_0_rgba(242,128,191,1)] translate-x-[-2px] translate-y-[-2px]"
                                : "bg-white text-text-primary border-text-primary hover:bg-main/10 shadow-[2px_2px_0_0_rgba(51,51,51,1)] hover:shadow-[4px_4px_0_0_rgba(51,51,51,1)] active:translate-y-0 active:translate-x-0 active:shadow-none"
                                }`}
                        >
                            <span>{TAG_EMOJIS[tag]}</span>
                            <span>{tag}</span>
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
                    {loading ? (
                        [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="w-[80vw] md:w-[320px] aspect-[3/4] bg-white border-2 border-text-primary animate-pulse flex flex-col p-4">
                                <div className="h-1/2 bg-gray-200 mb-4"></div>
                                <div className="h-4 bg-gray-200 mb-2 w-3/4"></div>
                                <div className="h-4 bg-gray-200 mb-2 w-1/2"></div>
                            </div>
                        ))
                    ) : events.length > 0 ? (
                        events.map((event, i) => (
                            <div key={event.id || i} className="w-full flex justify-center py-2">
                                <EventCard event={event} onUserClick={setSelectedUser} />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full flex items-center justify-center bg-white border-2 border-text-primary p-8 w-full max-w-2xl text-center">
                            <p className="text-text-secondary font-bold">No Events Available</p>
                        </div>
                    )}
                </div>
            </main>

            {selectedUser && (
                <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
            )}
        </div>
    );
}
