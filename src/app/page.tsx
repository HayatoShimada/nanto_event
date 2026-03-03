"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import VerticalNav from '@/components/VerticalNav';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { format } from 'date-fns';
import type { Event as EventType, UserProfile } from '@/types';
import { incrementParticipationClick, getUserProfile } from '@/lib/firebase/firestore';
import UserModal from '@/components/UserModal';
import { TAG_EMOJIS, USER_TAGS } from '@/constants/tags';
import { updateUserProfile } from '@/lib/firebase/firestore';

export interface RssItem {
    title: string;
    pubDate: string;
    link: string;
    thumbnail: string;
    description: string;
    author: string;
    userProfile?: UserProfile;
}

export default function Home() {
    const { user, profile, logout } = useAuth();
    const [allNewsItems, setAllNewsItems] = useState<RssItem[]>([]);
    const [newsItems, setNewsItems] = useState<RssItem[]>([]);
    const [visibleNewsCount, setVisibleNewsCount] = useState(5);
    const [loadingNews, setLoadingNews] = useState(true);

    const [allEvents, setAllEvents] = useState<EventType[]>([]);
    const [events, setEvents] = useState<EventType[]>([]);
    const [visibleEventsCount, setVisibleEventsCount] = useState(10);
    const [loadingEvents, setLoadingEvents] = useState(true);

    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [selectedTag, setSelectedTag] = useState<string>("ALL");
    const [activeSection, setActiveSection] = useState<string>("all");

    // IntersectionObserver to detect active section for Sidebar highlight
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { threshold: 0.3 }
        );

        const sections = ["all", "news", "events", "teams"];
        sections.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    // IntersectionObserver for infinite scrolling of horizontal lists
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (entry.target.id === 'news-load-trigger') {
                            setVisibleNewsCount(prev => prev + 5);
                        } else if (entry.target.id === 'events-load-trigger') {
                            setVisibleEventsCount(prev => prev + 10);
                        }
                    }
                });
            },
            { threshold: 0.1 }
        );

        const newsTrigger = document.getElementById('news-load-trigger');
        const eventsTrigger = document.getElementById('events-load-trigger');

        if (newsTrigger) observer.observe(newsTrigger);
        if (eventsTrigger) observer.observe(eventsTrigger);

        return () => observer.disconnect();
    }, [newsItems.length, events.length]); // Re-run when rendered items change to re-bind if triggers unmount

    // Update visible lists when all items or limits change
    useEffect(() => {
        setNewsItems(allNewsItems.slice(0, visibleNewsCount));
    }, [allNewsItems, visibleNewsCount]);

    useEffect(() => {
        setEvents(allEvents.slice(0, visibleEventsCount));
    }, [allEvents, visibleEventsCount]);

    useEffect(() => {
        const fetchNoteRss = async () => {
            try {
                const usersSnap = await getDocs(query(collection(db, "users"), where("noteUrl", "!=", null), limit(20)));
                const noteUsersMap = new Map<string, UserProfile>();
                const noteUrls = usersSnap.docs
                    .map(d => {
                        const data = { uid: d.id, ...d.data() } as UserProfile;
                        if (data.noteUrl && data.noteUrl.includes("note.com")) {
                            noteUsersMap.set(data.noteUrl, data);
                            return data.noteUrl;
                        }
                        return null;
                    })
                    .filter(url => url) as string[];

                if (noteUrls.length === 0) {
                    setNewsItems([]);
                    setLoadingNews(false);
                    return;
                }

                const promises = noteUrls.map(async (url: string) => {
                    const rssUrl = url.endsWith("/rss") ? url : `${url.replace(/\/$/, '')}/rss`;
                    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
                    try {
                        const res = await fetch(apiUrl);
                        const data = await res.json();
                        const userProfile = noteUsersMap.get(url);
                        if (data.status === 'ok') {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            return data.items.map((item: any) => ({
                                title: item.title,
                                pubDate: item.pubDate,
                                link: item.link,
                                thumbnail: item.thumbnail,
                                description: item.description,
                                author: data.feed.title,
                                userProfile
                            }));
                        }
                        return [];
                    } catch (e) {
                        console.error("RSS Fetch Error:", e);
                        return [];
                    }
                });

                const results = await Promise.all(promises);
                const allItems = results.flat().sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
                setAllNewsItems(allItems);

            } catch (error) {
                console.error("News fetch error:", error);
            } finally {
                setLoadingNews(false);
            }
        };

        const fetchEvents = async () => {
            setLoadingEvents(true);
            try {
                const snap = await getDocs(query(collection(db, "events"), orderBy("startDate", "asc"), limit(200)));
                let fetchedEvents = snap.docs.map(d => ({ id: d.id, ...d.data() } as EventType))
                    .filter(e => e.status !== "draft" && (!e.publishedAt || e.publishedAt.toDate() <= new Date()));

                if (selectedTag !== "ALL") {
                    fetchedEvents = fetchedEvents.filter(e => e.tags && e.tags.includes(selectedTag));
                }

                setAllEvents(fetchedEvents);
            } catch (error) {
                console.error("Failed to fetch events:", error);
            } finally {
                setLoadingEvents(false);
            }
        };

        fetchNoteRss();
        fetchEvents();
    }, [selectedTag]);

    const handleSetDefaultTag = async () => {
        if (!user || !profile || selectedTag === "ALL") return;
        const currentDefaults = profile.defaultTags || [];
        const isDefault = currentDefaults.includes(selectedTag);

        let newDefaults;
        if (isDefault) {
            newDefaults = currentDefaults.filter((t: string) => t !== selectedTag);
        } else {
            newDefaults = [...currentDefaults, selectedTag];
        }

        try {
            await updateUserProfile(user.uid, { defaultTags: newDefaults });
            alert(isDefault ? `${selectedTag}をデフォルトタグから解除しました` : `${selectedTag}をデフォルトタグに設定しました！`);
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert("エラーが発生しました");
        }
    };

    return (
        <div className="flex h-dvh w-full bg-bg-main overflow-hidden font-sans flex-col md:flex-row pb-[env(safe-area-inset-bottom)]">
            {/* Mobile Header */}
            <Header />

            {/* Vertical Dot Navigation (Mobile Only) */}
            <VerticalNav />

            {/* Sidebar - Left Stick (Desktop Only) */}
            <aside className="hidden md:flex w-48 bg-bg-sub h-full flex-col p-4 shrink-0 border-r-2 border-text-primary z-50 shadow-xl relative">
                <div className="flex items-center gap-2 mb-10">
                    <h1 className="text-2xl font-bold text-main tracking-wider">NANTS</h1>
                    <span className="text-[10px] font-bold bg-main text-white px-2 py-0.5 rounded-sm tracking-widest">BETA</span>
                </div>

                <nav className="flex flex-col gap-5">
                    <NavItem href="#all" label="ALL" active={activeSection === "all"} />
                    <NavItem href="#news" label="NEWS" active={activeSection === "news"} />
                    <NavItem href="#events" label="EVENTS" active={activeSection === "events"} />
                    <NavItem href="#teams" label="TEAMS" active={activeSection === "teams"} />
                    <NavItem href={user ? "/mypage" : "/login"} label="MY PAGE" />
                </nav>

                <div className="mt-auto">
                    {user ? (
                        <button
                            type="button"
                            className="w-full flex items-center gap-2 p-2 bg-white border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] group relative cursor-pointer hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-main text-left"
                            onClick={() => {
                                const conf = confirm("ログアウトしますか？");
                                if (conf) logout();
                            }}
                            aria-label="ログアウト"
                        >
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={`${user.displayName || "User"}のアイコン`} className="w-8 h-8 rounded-full border border-text-primary object-cover" />
                            ) : (
                                <div className="w-8 h-8 bg-main/20 flex items-center justify-center text-main font-bold border border-text-primary text-xs" aria-hidden="true">
                                    {user.displayName ? user.displayName[0].toUpperCase() : "U"}
                                </div>
                            )}
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold truncate max-w-[90px]">{user.displayName || "User"}</p>
                                <p className="text-[10px] text-text-secondary truncate">Logout</p>
                            </div>
                        </button>
                    ) : (
                        <Link href="/login" className="block w-full">
                            <div className="flex items-center justify-center p-2 bg-white border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_0_rgba(51,51,51,1)] transition-all font-bold text-xs text-center text-main active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
                                LOGIN
                            </div>
                        </Link>
                    )}
                    {/* Footer Links */}
                    <div className="mt-auto pt-8 flex flex-col gap-2 text-[10px] sm:text-xs font-bold text-text-secondary">
                        <Link href="/community" className="hover:text-main hover:underline w-fit">COMMUNITY</Link>
                        <Link href="/privacy" className="hover:text-main hover:underline w-fit">PRIVACY</Link>
                        <Link href="/terms" className="hover:text-main hover:underline w-fit">TERMS</Link>
                    </div>
                </div>
            </aside>

            {/* Main Content Area - Vertical Scroll with Snap (Mobile) / Normal Flow (PC) */}
            <main className="flex-1 h-full overflow-y-auto scroll-smooth snap-y snap-mandatory md:snap-none hide-scrollbar pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 relative">

                {/* Tag Selector Bar (Sticky Top) */}
                <div className="sticky top-0 z-40 bg-bg-main border-b-2 border-text-primary px-4 py-2 flex items-start justify-between">
                    <div className="flex-1 flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedTag("ALL")}
                            className={`shrink-0 px-4 py-1 text-sm font-bold border-2 border-text-primary snap-start transition-colors ${selectedTag === "ALL" ? 'bg-main text-white' : 'bg-white text-text-primary hover:bg-gray-100'}`}
                        >
                            ALL
                        </button>
                        {USER_TAGS.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={`shrink-0 px-4 py-1 text-sm font-bold border-2 border-text-primary snap-start transition-colors flex items-center gap-1 ${selectedTag === tag ? 'bg-main text-white' : 'bg-white text-text-primary hover:bg-gray-100'}`}
                            >
                                <span>{TAG_EMOJIS[tag]}</span>
                                <span>{tag}</span>
                            </button>
                        ))}
                    </div>
                    {selectedTag !== "ALL" && user && profile && (
                        <button
                            onClick={handleSetDefaultTag}
                            className={`ml-4 shrink-0 px-3 py-1 text-xs font-bold border-2 border-text-primary ${profile.defaultTags?.includes(selectedTag) ? 'bg-white text-black' : 'bg-black text-white'} shadow-[2px_2px_0_0_rgba(51,51,51,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all`}
                        >
                            {profile.defaultTags?.includes(selectedTag) ? 'デフォルト解除' : 'デフォルトタグに設定'}
                        </button>
                    )}
                </div>

                {/* Section: ALL & CONCEPT */}
                <Section id="all" title="" showPrevHint={false} showNextHint={true}>
                    <div className="flex flex-col md:flex-row gap-8 items-center h-full px-4 md:px-12 pb-12 pt-4 box-border w-full">
                        <ConceptSection />
                    </div>
                </Section>

                {/* Section: NEWS */}
                <Section id="news" title="NEWS" showPrevHint={true} showNextHint={true}>
                    <div className="flex flex-row md:flex-row md:flex-wrap md:justify-start gap-4 md:gap-8 items-center md:items-stretch h-full md:h-auto px-4 md:px-12 pb-0 md:pb-12 box-border">
                        {loadingNews ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="min-w-[85vw] md:min-w-[35vh] w-[85vw] md:w-auto h-[75%] md:h-[55%] md:aspect-4/5 snap-center bg-white border-2 border-text-primary animate-pulse flex flex-col p-4">
                                    <div className="h-1/3 bg-gray-200 mb-4"></div>
                                    <div className="h-4 bg-gray-200 mb-2 w-3/4"></div>
                                    <div className="h-4 bg-gray-200 mb-2 w-1/2"></div>
                                </div>
                            ))
                        ) : newsItems.length > 0 ? (
                            newsItems.map((item, i) => <NewsCard key={`news-${i}`} item={item} onUserClick={setSelectedUser} />)
                        ) : (
                            <div className="min-w-[85vw] md:min-w-[35vh] flex items-center justify-center bg-white border-2 border-text-primary p-8">
                                <p className="text-text-secondary font-bold">No News Available</p>
                            </div>
                        )}
                        <ViewAllCard href="/news" />
                        {newsItems.length < allNewsItems.length && (
                            <div id="news-load-trigger" className="snap-center min-w-[20px] h-full flex items-center justify-center shrink-0">
                                <div className="w-6 h-6 border-2 border-main border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                </Section>

                {/* Section: EVENTS */}
                <Section id="events" title="EVENTS" showPrevHint={true} showNextHint={true}>
                    <div className="flex flex-row md:flex-row md:flex-wrap md:justify-start gap-4 md:gap-8 items-center md:items-stretch h-full md:h-auto px-4 md:px-12 pb-0 md:pb-12 box-border">
                        {loadingEvents ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="min-w-[80vw] md:min-w-[30vh] w-[80vw] md:w-auto h-[75%] md:h-[60%] md:aspect-3/4 snap-center bg-white border-2 border-text-primary animate-pulse flex flex-col p-4">
                                    <div className="h-1/2 bg-gray-200 mb-4"></div>
                                    <div className="h-4 bg-gray-200 mb-2 w-3/4"></div>
                                    <div className="h-4 bg-gray-200 mb-2 w-1/2"></div>
                                </div>
                            ))
                        ) : events.length > 0 ? (
                            events.map((event, i) => <EventCard key={event.id || i} event={event} onUserClick={setSelectedUser} />)
                        ) : (
                            <div className="min-w-[80vw] md:min-w-[30vh] flex items-center justify-center bg-white border-2 border-text-primary p-8 text-center">
                                <p className="text-text-secondary font-bold">No Events Available</p>
                            </div>
                        )}
                        <ViewAllCard href="/events" />
                        {events.length < allEvents.length && (
                            <div id="events-load-trigger" className="snap-center min-w-[20px] h-full flex items-center justify-center shrink-0">
                                <div className="w-6 h-6 border-2 border-main border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                </Section>

                {/* Section: TEAMS */}
                <Section id="teams" title="TEAMS" showPrevHint={true} showNextHint={false}>
                    <div className="flex flex-row md:flex-row md:flex-wrap justify-center md:justify-start gap-4 md:gap-8 items-center md:items-stretch h-full md:h-auto px-4 md:px-12 pb-0 md:pb-12 box-border">
                        <div className="min-w-[80vw] md:min-w-[300px] flex items-center justify-center bg-white border-2 border-text-primary p-8 text-center flex-1 md:flex-none">
                            <p className="text-text-secondary font-bold">No Teams Available</p>
                        </div>
                    </div>
                </Section>

            </main>

            {selectedUser && (
                <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
            )}
        </div>
    );
}

function Section({ id, title, children, showNextHint = true, showPrevHint = false }: { id: string, title: string, children: React.ReactNode, showNextHint?: boolean, showPrevHint?: boolean }) {
    return (
        <section id={id} className="w-full h-full min-h-[500px] md:h-auto md:min-h-screen snap-start md:snap-align-none flex flex-col justify-start md:justify-center pt-28 pb-8 md:pt-12 md:pb-12 border-b-2 border-text-primary/10 relative shrink-0 box-border scroll-mt-0">
            {/* Previous Hint */}
            {showPrevHint && (
                <div className="absolute top-22 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40 md:hidden z-20">
                    <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            )}

            <div className="px-4 md:px-12 mb-1 md:mb-4 shrink-0">
                <h2 className="text-3xl md:text-4xl font-bold text-main tracking-widest drop-shadow-sm flex items-center gap-2 md:gap-4">
                    {title}
                    <div className="h-1 w-12 md:w-20 bg-main rounded-full"></div>
                </h2>
            </div>
            <div className="flex-1 md:flex-none overflow-x-auto md:overflow-x-visible hide-scrollbar scroll-smooth w-full flex items-start md:items-stretch snap-x snap-mandatory md:snap-none">
                {children}
            </div>

            {/* Next Hint */}
            {showNextHint && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-70 md:hidden z-20 animate-scroll-down">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-text-secondary">SCROLL</span>
                    <svg className="w-5 h-5 text-main" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            )}
        </section>
    );
}

function NavItem({ href, label, active = false }: { href: string; label: string; active?: boolean }) {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (href.startsWith('#')) {
            const targetId = href.substring(1);
            const el = document.getElementById(targetId);
            if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth' });
                // update URL hash without triggering default jump
                history.replaceState(null, '', href);
            }
        }
    };

    return (
        <Link
            href={href}
            onClick={handleClick}
            className={`text-base font-bold transition-all duration-200 border-b-2 ${active ? 'text-main border-main' : 'text-text-primary border-transparent hover:border-sub'
                } w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-main rounded-sm`}
            aria-current={active ? 'page' : undefined}
        >
            {label}
        </Link>
    );
}

function ConceptSection() {
    return (
        <div className="w-full h-full flex flex-col md:flex-row gap-8 items-center justify-center snap-center shrink-0">
            {/* Main Concept Card */}
            <div className="w-full md:w-1/2 h-auto md:h-full flex flex-col justify-center gap-6 p-6 md:p-10 bg-white border-4 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-main/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-main/10 transition-colors duration-700"></div>

                <div className="relative z-10">
                    <span className="text-main font-bold tracking-[0.2em] text-sm md:text-base border-b-2 border-main pb-1 inline-block mb-4">NANTS CONCEPT</span>
                    <h2 className="text-3xl md:text-4xl font-black text-text-primary leading-tight mb-4 md:mb-8 font-serif break-keep">
                        楽しむ、<span className="text-main underline decoration-4 decoration-main/30 underline-offset-4">つながる、</span>応援する
                    </h2>

                    <div className="space-y-4 text-text-secondary font-medium text-sm md:text-base leading-loose">
                        <p>
                            参加する一人ひとりが、<br className="hidden md:inline" />
                            <strong className="text-text-primary bg-main/10 px-1">一緒に場を盛り上げる</strong> こと。
                        </p>
                        <p>
                            気軽に足を運ぶことが、<br className="hidden md:inline" />
                            企画する人への <strong className="text-text-primary bg-main/10 px-1">応援</strong> につながること。
                        </p>
                        <p>
                            お互いの <strong className="text-text-primary bg-main/10 px-1">思いやり</strong> や <strong className="text-text-primary bg-main/10 px-1">信頼</strong> を大切に、<br className="hidden md:inline" />
                            <strong className="text-text-primary bg-main/10 px-1">誰もが心地よく</strong> 過ごせること。
                        </p>
                    </div>
                </div>

                <div className="mt-8 relative z-10">
                    <Link href="/about" className="inline-flex items-center gap-2 px-8 py-4 bg-text-primary text-white font-bold tracking-widest hover:bg-main transition-colors shadow-[4px_4px_0_0_rgba(200,200,200,1)] hover:shadow-[4px_4px_0_0_rgba(51,51,51,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none">
                        READ MORE
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </Link>
                </div>
            </div>

            {/* Sub Visual / Quick Access */}
            <div className="hidden md:flex flex-col w-1/3 h-full gap-4 box-border pb-10 pt-20">
                <div className="flex-1 bg-main/10 border-2 border-dashed border-main/30 rounded-lg flex items-center justify-center p-8 text-center">
                    <p className="text-text-primary font-bold opacity-50">
                        COMMUNITY VISUAL<br />PLACEHOLDER
                    </p>
                </div>
            </div>
        </div>
    );
}

export function EventCard({ event, onUserClick }: { event: EventType, onUserClick: (u: UserProfile) => void }) {
    const router = useRouter();
    const [organizer, setOrganizer] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (event.organizerUid) {
            getUserProfile(event.organizerUid).then(setOrganizer).catch(console.error);
        }
    }, [event.organizerUid]);

    const handleJoin = async () => {
        if (event.id) {
            router.push(`/events/detail?id=${event.id}`);
        }
    };

    return (
        <article
            className="min-w-[80vw] w-[80vw] h-[75%] aspect-auto md:min-w-[300px] md:w-[320px] md:h-auto md:aspect-3/4 snap-center md:snap-align-none bg-white border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] md:shadow-[6px_6px_0_0_rgba(51,51,51,1)] hover:shadow-[6px_6px_0_0_rgba(242,128,191,0.5)] md:hover:shadow-[10px_10px_0_0_rgba(242,128,191,0.5)] transition-all duration-300 flex flex-col overflow-hidden shrink-0 hover:-translate-y-1 md:hover:-translate-y-2 cursor-pointer group focus:outline-none focus-visible:ring-4 focus-visible:ring-main"
            role="button"
            tabIndex={0}
            onClick={handleJoin}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleJoin(); } }}
            aria-label={`${event.name}の詳細および参加ページを開く`}
        >
            <div className="h-[40%] md:h-[45%] bg-bg-sub relative border-b-2 border-text-primary overflow-hidden shrink-0">
                {event.imageURL ? (
                    <img src={event.imageURL} alt={event.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-main/30 font-bold text-3xl group-hover:scale-110 transition-transform duration-500">NO IMAGE</div>
                )}
                <div className="absolute top-4 left-4 flex gap-1 flex-wrap">
                    {event.categories?.map((cat, i) => (
                        <span key={i} className="bg-white px-3 py-1 border border-text-primary text-xs font-bold text-main shadow-[2px_2px_0_0_rgba(51,51,51,1)] z-10">
                            {cat}
                        </span>
                    ))}
                </div>
            </div>
            <div className="p-4 md:p-5 flex-1 flex flex-col justify-between overflow-y-auto">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        {organizer && (
                            <button
                                type="button"
                                className="flex items-center gap-2 cursor-pointer group/user shrink-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-main p-1 rounded -m-1 relative z-10"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUserClick(organizer); }}
                                aria-label={`${organizer.username}のプロフィールを見る`}
                            >
                                {organizer.photoURL ? (
                                    <img src={organizer.photoURL} alt={`${organizer.username}のアイコン`} className="w-6 h-6 rounded-full border border-text-primary object-cover group-hover/user:scale-110 transition-transform" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full border border-text-primary bg-main/20 flex items-center justify-center text-main font-bold text-[10px]" aria-hidden="true">
                                        {organizer.username[0]?.toUpperCase()}
                                    </div>
                                )}
                                <span className="text-xs font-bold text-text-primary group-hover/user:text-main group-hover/user:underline transition-colors truncate max-w-[80px] md:max-w-[120px]">{organizer.username}</span>
                            </button>
                        )}
                        <span className="text-xs font-bold text-main ml-auto shrink-0">
                            {event.startDate ? format(event.startDate.toDate(), "yyyy.MM.dd HH:mm") : ""}
                        </span>
                    </div>
                    <h3 className="text-base font-bold mb-2 text-text-primary group-hover:text-main transition-colors leading-tight">
                        {event.name}
                    </h3>
                    {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {event.tags.map((tag, i) => (
                                <span key={i} className="text-[10px] bg-bg-sub border border-text-primary px-1.5 py-0.5 font-bold flex items-center gap-1 shrink-0" title={tag}>
                                    <span>{TAG_EMOJIS[tag] || "🏷️"}</span>
                                    <span>{tag}</span>
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="text-xs text-text-secondary truncate-multiline line-clamp-2 md:line-clamp-3 mb-2" dangerouslySetInnerHTML={{ __html: event.description || '' }}>
                    </div>
                </div>
                <div className="pt-3 border-t-2 border-gray-100 mt-2 shrink-0">
                    <div aria-hidden="true" className="text-center text-sm font-bold text-main border-2 border-main px-4 py-2 group-hover:bg-main group-hover:text-white transition-all w-full select-none">SEE DETAILS</div>
                </div>
            </div>
        </article>
    );
}

export function NewsCard({
    item,
    className = "min-w-[85vw] w-[85vw] h-[75%] aspect-auto md:min-w-[300px] md:w-[320px] md:h-auto md:aspect-4/5 snap-center md:snap-align-none bg-white border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] md:shadow-[6px_6px_0_0_rgba(51,51,51,1)] hover:shadow-[6px_6px_0_0_rgba(51,51,200,0.5)] md:hover:shadow-[10px_10px_0_0_rgba(51,51,200,0.5)] transition-all duration-300 flex flex-col overflow-hidden shrink-0 hover:-translate-y-1 md:hover:-translate-y-2 cursor-pointer group focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500 relative",
    onUserClick
}: {
    item: RssItem,
    className?: string,
    onUserClick: (u: UserProfile) => void
}) {
    // 日付フォーマット
    const dateStr = format(new Date(item.pubDate), 'yyyy.MM.dd');

    // HTMLタグ除去（簡易的）
    const plainDesc = item.description.replace(/<[^>]+>/g, '').substring(0, 80) + "...";

    return (
        <a href={item.link} target="_blank" rel="noopener noreferrer" className={className}>
            <div className={`w-full bg-blue-50 relative border-b-2 border-text-primary overflow-hidden shrink-0 flex items-center justify-center text-blue-200 font-bold text-2xl group-hover:opacity-90 transition-opacity ${className.includes('aspect-auto') ? 'h-[30%] md:h-[35%]' : 'aspect-video'}`}>
                {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                    "NEWS"
                )}
            </div>
            <div className="p-4 md:p-5 flex-1 flex flex-col overflow-y-auto">
                <div className="flex items-center gap-2 mb-2">
                    {item.userProfile ? (
                        <button
                            type="button"
                            className="flex items-center gap-2 cursor-pointer group/user shrink-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 p-1 rounded -m-1 relative z-10"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUserClick(item.userProfile!); }}
                            aria-label={`${item.userProfile.username}のプロフィールを見る`}
                        >
                            {item.userProfile.photoURL ? (
                                <img src={item.userProfile.photoURL} alt={`${item.userProfile.username}のアイコン`} className="w-6 h-6 rounded-full border border-text-primary object-cover group-hover/user:scale-110 transition-transform" />
                            ) : (
                                <div className="w-6 h-6 rounded-full border border-text-primary bg-main/20 flex items-center justify-center text-main font-bold text-[10px]" aria-hidden="true">
                                    {item.userProfile.username[0]?.toUpperCase()}
                                </div>
                            )}
                            <span className="text-xs font-bold text-text-primary group-hover/user:text-main group-hover/user:underline transition-colors truncate max-w-[80px] md:max-w-[120px]">{item.userProfile.username}</span>
                        </button>
                    ) : (
                        <span className="text-[10px] font-bold border border-text-primary text-blue-900 bg-white px-2 py-0.5 shadow-[2px_2px_0_0_rgba(51,51,51,1)]">{item.author}</span>
                    )}
                    <span className="text-xs font-bold text-blue-500 ml-auto shrink-0">{dateStr}</span>
                </div>
                <h3 className="text-base font-bold mb-2 text-text-primary shrink-0 leading-tight group-hover:text-main transition-colors">
                    {item.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed flex-1 overflow-hidden">
                    {plainDesc}
                </p>
                <div className="mt-auto pt-3 text-right shrink-0">
                    <span className="text-xs font-bold text-text-secondary border-2 border-text-secondary px-3 py-1.5 group-hover:text-white group-hover:bg-main group-hover:border-main inline-block active:scale-95 transition-all">
                        READ NOTE
                    </span>
                </div>
            </div>
        </a>
    );
}



function ViewAllCard({ href }: { href: string }) {
    return (
        <Link href={href} className="min-w-[50vw] w-[50vw] h-[80%] aspect-auto md:min-w-[300px] md:w-[320px] md:h-auto md:aspect-2/3 snap-center md:snap-align-none flex flex-col items-center justify-center text-text-secondary hover:text-main cursor-pointer group shrink-0 hover:scale-105 transition-transform duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-main py-10 md:py-0">
            <div className="w-16 h-16 border-2 border-current flex items-center justify-center mb-4 group-hover:bg-white transition-colors bg-bg-sub shadow-[4px_4px_0_0_rgba(51,51,51,1)]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" aria-hidden="true" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </div>
            <span className="font-bold tracking-widest border-b-2 border-transparent group-hover:border-main text-base">VIEW ALL</span>
        </Link>
    );
}
