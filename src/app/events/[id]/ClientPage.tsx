"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEvent } from "@/lib/firebase/firestore";
import type { Event as EventType } from "@/types";
import Header from "@/components/Header";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function ClientPage({ id }: { id: string }) {
    const [event, setEvent] = useState<EventType | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        if (!id) return;
        
        async function fetchEvent() {
            setLoading(true);
            try {
                const data = await getEvent(id);
                if (data) {
                    setEvent(data);
                }
            } catch (error) {
                console.error("Failed to fetch event:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchEvent();
    }, [id]);

    if (loading) {
        return (
            <div className="h-dvh w-full flex items-center justify-center bg-bg-main">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-main" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="h-dvh w-full flex flex-col items-center justify-center bg-bg-main text-text-primary">
                <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
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
        <div className="min-h-dvh w-full bg-bg-main text-text-primary font-sans relative">
            <Header />

            {/* Background Image Effect */}
            <div className="fixed inset-0 z-0">
                {event.imageURL ? (
                    <img src={event.imageURL} alt="" className="w-full h-full object-cover opacity-10 blur-xl scale-110" />
                ) : (
                    <div className="w-full h-full bg-main/5" />
                )}
            </div>
            
            <main className="w-full max-w-4xl mx-auto p-4 pt-[calc(5rem+env(safe-area-inset-top))] pb-24 relative z-10 flex flex-col gap-8">
                
                {/* Image & Title Card */}
                <div className="bg-white border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)] overflow-hidden">
                    <div className="w-full aspect-video md:aspect-[21/9] bg-gray-200 relative">
                         {event.imageURL ? (
                             <img src={event.imageURL} alt={event.name} className="w-full h-full object-cover" />
                         ) : (
                             <div className="w-full h-full flex items-center justify-center text-text-secondary font-bold text-4xl opacity-20">NO IMAGE</div>
                         )}
                         <div className="absolute top-4 left-4 flex gap-2">
                             {event.categories.map((cat, i) => (
                                 <span key={i} className="px-3 py-1 bg-white/90 backdrop-blur-sm border-2 border-text-primary text-xs font-bold tracking-wider rounded-sm shadow-sm">
                                     {cat.toUpperCase()}
                                 </span>
                             ))}
                         </div>
                    </div>
                    
                    <div className="p-6 md:p-10 flex flex-col gap-4">
                        <h1 className="text-2xl md:text-4xl font-bold leading-tight tracking-wide">{event.name}</h1>
                        
                        <div className="flex flex-col md:flex-row gap-4 md:gap-12 mt-4 border-t-2 border-text-primary/10 pt-4">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-main tracking-widest mb-1 block">DATE</span>
                                <span className="text-lg md:text-xl font-bold font-mono">
                                    {event.startDate && format(event.startDate.toDate(), "yyyy.MM.dd HH:mm")}
                                     - 
                                    {event.finishDate && format(event.finishDate.toDate(), "HH:mm")}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-main tracking-widest mb-1 block">LOCATION</span>
                                <span className="text-lg md:text-xl font-bold">{event.location}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Button (Owner Only) */}
                {user && event.organizerUid === user.uid && (
                    <div className="flex justify-end">
                        <Link href={`/events/${id}/edit`} className="bg-text-primary text-white font-bold px-6 py-2 border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_0_rgba(51,51,51,1)] transition-all active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
                            EDIT EVENT
                        </Link>
                    </div>
                )}

                {/* Description Card */}
                <div className="bg-white border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)] p-6 md:p-10">
                    <h2 className="text-xl font-bold text-main tracking-widest mb-6 border-b-2 border-main inline-block pb-1">ABOUT EVENT</h2>
                    <div 
                      className="prose prose-sm md:prose-lg max-w-none text-text-primary leading-relaxed" 
                      dangerouslySetInnerHTML={{ __html: event.description }} 
                    />
                </div>

                {/* Action Bar (Fixed Bottom) */}
                <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t-2 border-text-primary p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] flex justify-center items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 md:sticky md:bottom-8 md:rounded-full md:border-2 md:w-auto md:mx-auto md:px-12 md:pb-4 md:shadow-[4px_4px_0_0_rgba(51,51,51,1)]">
                    <button className="w-full md:w-auto min-w-[200px] bg-main text-white font-bold py-3 md:py-4 px-8 rounded-full shadow-[2px_2px_0_0_rgba(51,51,51,1)] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_rgba(51,51,51,1)] active:translate-y-[1px] active:shadow-none transition-all text-lg tracking-widest border-2 border-text-primary">
                        JOIN EVENT
                    </button>
                </div>

            </main>
        </div>
    );
}
