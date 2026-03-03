"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase/config';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import type { UserProfile } from '@/types';
import { RssItem, NewsCard } from '../page';
import UserModal from '@/components/UserModal';

export default function NewsPage() {
    const [newsItems, setNewsItems] = useState<RssItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        const fetchNoteRss = async () => {
            try {
                const usersRef = collection(db, "users");
                const q = query(usersRef, limit(200)); // Consider slightly larger limit for 'All View'
                const querySnapshot = await getDocs(q);

                const noteUsersMap = new Map<string, UserProfile>();

                querySnapshot.docs.forEach(d => {
                    const data = { uid: d.id, ...d.data() } as UserProfile;
                    if (data.noteUrl) {
                        noteUsersMap.set(data.noteUrl, data);
                    }
                });

                const promises = Array.from(noteUsersMap.entries()).map(async ([noteUrl, userProfile]) => {
                    try {
                        const rssUrl = noteUrl.replace(/\/$/, '') + '/rss';
                        const res = await fetch(`/api/rss?url=${encodeURIComponent(rssUrl)}`);
                        if (!res.ok) return [];
                        const data = await res.json();
                        return (data.items || []).map((item: any) => ({
                            ...item,
                            userProfile
                        }));
                    } catch (e) {
                        console.error("Failed to fetch RSS for", noteUrl, e);
                        return [];
                    }
                });

                const results = await Promise.all(promises);
                const allItems = results.flat().sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
                setNewsItems(allItems);

            } catch (error) {
                console.error("News fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNoteRss();
    }, []);

    return (
        <div className="min-h-screen bg-bg-main font-sans text-text-primary">
            <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm z-50 border-b-2 border-text-primary shadow-[0_4px_0_0_rgba(51,51,51,1)]">
                <div className="w-full h-16 md:h-20 px-4 md:px-8 flex items-center justify-between">
                    <Link href="/#news" className="font-black text-base md:text-xl tracking-tighter text-text-primary hover:text-main transition-colors flex items-center gap-2 px-4 py-2 border-2 border-transparent hover:border-main bg-bg-sub shadow-[2px_2px_0_0_rgba(51,51,51,1)]">
                        ← BACK
                    </Link>
                    <h1 className="text-xl md:text-2xl font-black tracking-widest text-text-primary">ALL NEWS</h1>
                </div>
            </header>

            <main className="pt-24 md:pt-32 pb-12 px-4 md:px-12 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
                    {loading ? (
                        [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="w-[85vw] md:w-[320px] aspect-[4/5] bg-white border-2 border-text-primary animate-pulse flex flex-col p-4">
                                <div className="h-1/3 bg-gray-200 mb-4"></div>
                                <div className="h-4 bg-gray-200 mb-2 w-3/4"></div>
                                <div className="h-4 bg-gray-200 mb-2 w-1/2"></div>
                            </div>
                        ))
                    ) : newsItems.length > 0 ? (
                        newsItems.map((item, i) => (
                            <div key={`news-${i}`} className="w-full flex justify-center py-2">
                                <NewsCard item={item} index={i} onUserClick={setSelectedUser} />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full flex items-center justify-center bg-white border-2 border-text-primary p-8 w-full max-w-2xl">
                            <p className="text-text-secondary font-bold">No News Available</p>
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
