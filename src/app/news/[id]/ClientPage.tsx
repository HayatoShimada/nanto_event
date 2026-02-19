"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getNews } from "@/lib/firebase/firestore";
import type { News } from "@/types";
import Header from "@/components/Header";
import { format } from "date-fns";

export default function ClientPage({ id }: { id: string }) {
    const [news, setNews] = useState<News | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!id) return;
        
        async function fetchNews() {
            setLoading(true);
            try {
                const data = await getNews(id);
                if (data) {
                    setNews(data);
                }
            } catch (error) {
                console.error("Failed to fetch news:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchNews();
    }, [id]);

    if (loading) {
        return (
            <div className="h-dvh w-full flex items-center justify-center bg-bg-main">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-main" />
            </div>
        );
    }

    if (!news) {
        return (
            <div className="h-dvh w-full flex flex-col items-center justify-center bg-bg-main text-text-primary">
                <h1 className="text-2xl font-bold mb-4">News Not Found</h1>
                <button 
                  onClick={() => router.push("/")}
                  className="px-6 py-2 bg-main text-white font-bold rounded-full hover:opacity-80 transition-opacity"
                >
                  Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-dvh w-full bg-bg-main text-text-primary font-sans">
            <Header />
            
            <main className="w-full max-w-2xl mx-auto p-4 pt-[calc(5rem+env(safe-area-inset-top))] pb-20">
                <article className="bg-white border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)] p-6 md:p-10 flex flex-col gap-6 relative">
                    
                    {/* Date Tag */}
                    <div className="absolute top-0 right-0 bg-main text-white px-4 py-1 text-sm font-bold tracking-widest translate-x-2 -translate-y-2 border-2 border-text-primary shadow-[2px_2px_0_0_rgba(51,51,51,1)]">
                         {news.publishedAt ? format(news.publishedAt.toDate(), "yyyy.MM.dd") : "Unknown Date"}
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold mt-4 leading-tight">
                        {news.title}
                    </h1>

                    {news.thumbnailURL && (
                        <div className="w-full aspect-video bg-gray-100 border-2 border-text-primary overflow-hidden">
                            <img src={news.thumbnailURL} alt={news.title} className="w-full h-full object-cover" />
                        </div>
                    )}

                    <div className="prose prose-sm md:prose-base max-w-none text-text-primary/90 mt-4 leading-relaxed whitespace-pre-wrap">
                        {news.content}
                    </div>

                    <div className="border-t-2 border-text-primary/10 pt-6 mt-4 flex justify-between items-center">
                        <button 
                          onClick={() => router.back()}
                          className="text-sm font-bold text-text-secondary hover:text-main transition-colors flex items-center gap-1 group"
                        >
                          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                          BACK
                        </button>
                    </div>

                </article>
            </main>
        </div>
    );
}
