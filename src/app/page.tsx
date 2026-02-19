"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import MenuOverlay from '@/components/MenuOverlay';
import VerticalNav from '@/components/VerticalNav';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { format } from 'date-fns';

interface RssItem {
  title: string;
  pubDate: string;
  link: string;
  thumbnail: string;
  description: string;
  author: string;
}

export default function Home() {
    const { user, logout } = useAuth();
    const [newsItems, setNewsItems] = useState<RssItem[]>([]);
    const [loadingNews, setLoadingNews] = useState(true);

    useEffect(() => {
        const fetchNoteRss = async () => {
            try {
                // noteUrlを持つユーザーを取得 (とりあえず簡易的に)
                // 本来はインデックスが必要: where("noteUrl", "!=", "")
                // ここでは全件取得してJSで絞るか、admin/collaboratorに限定する
                // Issue #1により全員発信者のため、とりあえず全usersからnoteUrlがあるものを探すのはコスト高。
                // 暫定措置: "role" が "admin" または "organizer" のユーザー、あるいは特定コレクション
                // 今回は「noteUrlを持つユーザー」をクエリで取れる範囲で取る（インデックスがないとエラーになる可能性があるがtry）
                
                const q = query(collection(db, "users"), where("noteUrl", "!=", null), limit(10));
                // Note: Firestoreでは "!=" null は使えない、orderBy("noteUrl")が必要。
                // 代わりにクライアント側でフィルタするか、運用でカバー。
                // ここではデモとして、特定ユーザー(自分など)のRSSを表示する形にするため、
                // ログインユーザーのRSSを表示する...のではなく、"みんなのニュース"なので、
                // 特定の運営アカウントのnoteUrlをハードコードまたはConfig取得が安全だが、
                // 要望は「userが...掲載している場合」なので、動的に取得したい。
                
                // Firestoreの制約を回避するため、"updatedAt" desc で最新ユーザー20件を取得し、その中でnoteUrlがあるものを探す戦略
                // const usersSnap = await getDocs(query(collection(db, "users"), orderBy("updatedAt", "desc"), limit(20)));
                // -> インデックス必要。
                
                // シンプルに: collection(db, "users") 全件取得はNG。
                // "users" に "hasNoteUrl" フラグを持たせるのがベストだが未実装。
                // 今は仮に、getDocs(collection(db, "users")) で20件だけ取ってフィルタする（開発環境ならOK）。
                
                const usersSnap = await getDocs(query(collection(db, "users"), limit(20)));
                const noteUrls = usersSnap.docs
                    .map(d => d.data().noteUrl)
                    .filter(url => url && url.includes("note.com"));

                if (noteUrls.length === 0) {
                    setNewsItems([]);
                    setLoadingNews(false);
                    return;
                }

                // RSS取得 (rss2json使用)
                // noteのRSS URL形式: https://note.com/{id}/rss
                const promises = noteUrls.map(async (url: string) => {
                    const rssUrl = url.endsWith("/rss") ? url : `${url.replace(/\/$/, '')}/rss`;
                    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
                    try {
                        const res = await fetch(apiUrl);
                        const data = await res.json();
                        if (data.status === 'ok') {
                            return data.items.map((item: any) => ({
                                title: item.title,
                                pubDate: item.pubDate,
                                link: item.link,
                                thumbnail: item.thumbnail,
                                description: item.description,
                                author: data.feed.title // noteのユーザー名
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
                setNewsItems(allItems.slice(0, 5)); // 最新5件

            } catch (error) {
                console.error("News fetch error:", error);
            } finally {
                setLoadingNews(false);
            }
        };

        fetchNoteRss();
    }, []);

    return (
        <div className="flex h-dvh w-full bg-bg-main overflow-hidden font-sans flex-col md:flex-row pb-[env(safe-area-inset-bottom)]">
            {/* Mobile Header */}
            <Header />

            {/* Vertical Dot Navigation (Mobile Only) */}
            <VerticalNav />

            {/* Sidebar - Left Stick (Desktop Only) */}
            <aside className="hidden md:flex w-48 bg-bg-sub h-full flex-col p-4 shrink-0 border-r-2 border-text-primary z-50 shadow-xl relative">
                <h1 className="text-2xl font-bold text-main mb-10 tracking-wider">NANTS</h1>

                <nav className="flex flex-col gap-5">
                    <NavItem href="#all" label="ALL" active />
                    <NavItem href="#news" label="NEWS" />
                    <NavItem href="#events" label="EVENTS" />
                    <NavItem href="#teams" label="TEAMS" />
                    <NavItem href={user ? "/mypage" : "/login"} label="MY PAGE" />
                </nav>

                <div className="mt-auto">
                    {user ? (
                        <div className="flex items-center gap-2 p-2 bg-white border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] group relative cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => {
                                const conf = confirm("ログアウトしますか？");
                                if (conf) logout();
                            }}
                        >
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-text-primary object-cover" />
                            ) : (
                                <div className="w-8 h-8 bg-main/20 flex items-center justify-center text-main font-bold border border-text-primary text-xs">
                                    {user.displayName ? user.displayName[0].toUpperCase() : "U"}
                                </div>
                            )}
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold truncate max-w-[90px]">{user.displayName || "User"}</p>
                                <p className="text-[10px] text-text-secondary truncate">Logout</p>
                            </div>
                        </div>
                    ) : (
                        <Link href="/login" className="block w-full">
                            <div className="flex items-center justify-center p-2 bg-white border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_0_rgba(51,51,51,1)] transition-all font-bold text-xs text-center text-main active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
                                LOGIN
                            </div>
                        </Link>
                    )}
                    <div className="flex gap-2 justify-center mt-4 mb-2 text-[10px] text-text-secondary font-bold tracking-wider opacity-60 hover:opacity-100 transition-opacity">
                        <Link href="/privacy" className="hover:text-main hover:underline">PRIVACY</Link>
                        <span>|</span>
                        <Link href="/terms" className="hover:text-main hover:underline">TERMS</Link>
                    </div>
                </div>
            </aside>

            {/* Main Content Area - Vertical Scroll with Snap */}
            <main className="flex-1 h-full overflow-y-auto scroll-smooth snap-y snap-mandatory hide-scrollbar pt-0 pb-0 md:pt-0 md:pb-0">

                {/* Section: ALL & CONCEPT */}
                <Section id="all" title="" showPrevHint={false} showNextHint={true}>
                    <div className="flex flex-col md:flex-row gap-8 items-center h-full px-4 md:px-12 pb-12 pt-4 box-border w-full">
                        <ConceptSection />
                    </div>
                </Section>

                {/* Section: NEWS */}
                <Section id="news" title="NEWS" showPrevHint={true} showNextHint={true}>
                    <div className="flex gap-4 md:gap-8 items-center h-full px-4 md:px-12 pb-0 md:pb-12 box-border">
                        {loadingNews ? (
                             [1, 2, 3].map(i => (
                                <div key={i} className="min-w-[85vw] md:min-w-[35vh] w-[85vw] md:w-auto h-[75%] md:h-[55%] md:aspect-[4/5] snap-center bg-white border-2 border-text-primary animate-pulse flex flex-col p-4">
                                    <div className="h-1/3 bg-gray-200 mb-4"></div>
                                    <div className="h-4 bg-gray-200 mb-2 w-3/4"></div>
                                    <div className="h-4 bg-gray-200 mb-2 w-1/2"></div>
                                </div>
                             ))
                        ) : newsItems.length > 0 ? (
                            newsItems.map((item, i) => <NewsCard key={`news-${i}`} item={item} index={i} />)
                        ) : (
                            <div className="min-w-[85vw] md:min-w-[35vh] flex items-center justify-center bg-white border-2 border-text-primary p-8">
                                <p className="text-text-secondary font-bold">No News Available</p>
                            </div>
                        )}
                        <ViewAllCard />
                    </div>
                </Section>

                {/* Section: EVENTS */}
                <Section id="events" title="EVENTS" showPrevHint={true} showNextHint={true}>
                    <div className="flex gap-4 md:gap-8 items-center h-full px-4 md:px-12 pb-0 md:pb-12 box-border">
                        {[1, 2, 3, 4, 5].map(i => <EventCard key={`event-${i}`} index={i} category="EVENT" />)}
                        <ViewAllCard />
                    </div>
                </Section>

                {/* Section: TEAMS */}
                <Section id="teams" title="TEAMS" showPrevHint={true} showNextHint={false}>
                    <div className="flex gap-4 md:gap-8 items-center h-full px-4 md:px-12 pb-0 md:pb-12 box-border">
                        {[1, 2, 3, 4, 5].map(i => <TeamCard key={`team-${i}`} index={i} />)}
                        <ViewAllCard />
                    </div>
                </Section>

            </main>
        </div>
    );
}

function Section({ id, title, children, showNextHint = true, showPrevHint = false }: { id: string, title: string, children: React.ReactNode, showNextHint?: boolean, showPrevHint?: boolean }) {
    return (
        <section id={id} className="w-full h-dvh snap-start flex flex-col justify-start md:justify-center pt-[calc(4rem+env(safe-area-inset-top))] pb-2 md:py-4 border-b-2 border-text-primary/10 relative shrink-0 box-border scroll-mt-0">
            {/* Previous Hint */}
            {showPrevHint && (
                <div className="absolute top-[calc(4.5rem+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40 md:hidden z-20">
                    <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            )}

            <div className="px-4 md:px-12 mb-1 md:mb-4 shrink-0">
                <h2 className="text-3xl md:text-4xl font-bold text-main tracking-widest drop-shadow-sm flex items-center gap-2 md:gap-4">
                    {title}
                    <div className="h-1 w-12 md:w-20 bg-main rounded-full"></div>
                </h2>
            </div>
            <div className="flex-1 overflow-x-auto hide-scrollbar scroll-smooth w-full flex items-start md:items-center snap-x snap-mandatory">
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
    return (
        <Link
            href={href}
            className={`text-base font-bold transition-all duration-200 border-b-2 ${active ? 'text-main border-main' : 'text-text-primary border-transparent hover:border-sub'
                } w-fit`}
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
                    <h2 className="text-3xl md:text-5xl font-black text-text-primary leading-tight mb-4 md:mb-8 font-serif">
                        楽しむ &lt; <span className="text-main underline decoration-4 decoration-main/30 underline-offset-4">楽しませる</span>
                    </h2>
                    
                    <div className="space-y-4 text-text-secondary font-medium text-sm md:text-base leading-loose">
                        <p>
                            自分だけが楽しむのではなく、<br className="hidden md:inline"/>
                            <strong className="text-text-primary bg-main/10 px-1">誰かを楽しませる</strong> こと。
                        </p>
                        <p>
                            イベントに参加するだけで、<br className="hidden md:inline"/>
                            運営している人を <strong className="text-text-primary bg-main/10 px-1">応援</strong> できること。
                        </p>
                        <p>
                            そして <strong className="text-text-primary bg-main/10 px-1">オープン</strong> で <strong className="text-text-primary bg-main/10 px-1">自由</strong> で、<br className="hidden md:inline"/>
                            <strong className="text-text-primary bg-main/10 px-1">性善説</strong> で運営されること。
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
                        COMMUNITY VISUAL<br/>PLACEHOLDER
                    </p>
                 </div>
            </div>
        </div>
    );
}

function EventCard({ index, category = "FESTIVAL" }: { index: number, category?: string }) {
    return (
        <article className="min-w-[80vw] md:min-w-[30vh] w-[80vw] md:w-auto h-[75%] md:h-[60%] md:aspect-[3/4] snap-center bg-white border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] md:shadow-[6px_6px_0_0_rgba(51,51,51,1)] hover:shadow-[6px_6px_0_0_rgba(242,128,191,0.5)] md:hover:shadow-[10px_10px_0_0_rgba(242,128,191,0.5)] transition-all duration-300 flex flex-col overflow-hidden shrink-0 hover:-translate-y-1 md:hover:-translate-y-2">
            <div className="h-[40%] md:h-[45%] bg-bg-sub relative border-b-2 border-text-primary overflow-hidden shrink-0">
                <div className="absolute inset-0 flex items-center justify-center text-main/30 font-bold text-3xl group-hover:scale-110 transition-transform duration-500">EVENT</div>
                <div className="absolute top-4 left-4 bg-white px-3 py-1 border border-text-primary text-xs font-bold text-main shadow-[2px_2px_0_0_rgba(51,51,51,1)] z-10">
                    {category}
                </div>
            </div>
            <div className="p-4 md:p-5 flex-1 flex flex-col justify-between overflow-y-auto">
                <div>
                    <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
                        <span className="font-bold text-main">2026.03.{10 + index}</span>
                    </div>
                    <h3 className="text-base font-bold mb-2 text-text-primary hover:text-main transition-colors">
                        第{index}回 南砺市クリエイティブフェスティバル
                    </h3>
                    <p className="text-xs text-text-secondary">
                        伝統と技術が融合する祭典。地元の職人とクリエイターが競演します。
                    </p>
                </div>
                <div className="pt-3 border-t-2 border-gray-100 mt-2 shrink-0">
                    <button className="text-sm font-bold text-main border-2 border-main px-4 py-2 hover:bg-main hover:text-white transition-all w-full cursor-pointer active:scale-95">JOIN</button>
                </div>
            </div>
        </article>
    );
}

function NewsCard({ item, index }: { item: RssItem, index: number }) {
    // 日付フォーマット
    const dateStr = format(new Date(item.pubDate), 'yyyy.MM.dd');
    
    // HTMLタグ除去（簡易的）
    const plainDesc = item.description.replace(/<[^>]+>/g, '').substring(0, 80) + "...";

    return (
        <article className="min-w-[85vw] md:min-w-[35vh] w-[85vw] md:w-auto h-[75%] md:h-[55%] md:aspect-[4/5] snap-center bg-white border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] md:shadow-[6px_6px_0_0_rgba(51,51,51,1)] hover:shadow-[6px_6px_0_0_rgba(51,51,200,0.5)] md:hover:shadow-[10px_10px_0_0_rgba(51,51,200,0.5)] transition-all duration-300 flex flex-col overflow-hidden shrink-0 hover:-translate-y-1 md:hover:-translate-y-2">
            <div className="h-[30%] md:h-[35%] bg-blue-50 relative border-b-2 border-text-primary overflow-hidden shrink-0 flex items-center justify-center text-blue-200 font-bold text-2xl group">
                {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                    "NEWS"
                )}
                <div className="absolute top-2 left-2 bg-white/90 px-2 py-0.5 text-[10px] font-bold border border-text-primary text-blue-900 truncate max-w-[90%]">
                    {item.author}
                </div>
            </div>
            <div className="p-4 md:p-5 flex-1 flex flex-col overflow-y-auto">
                <span className="text-xs font-bold text-blue-500 mb-2 shrink-0">{dateStr}</span>
                <h3 className="text-base font-bold mb-2 text-text-primary shrink-0 leading-tight">
                    {item.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed flex-1 overflow-hidden">
                    {plainDesc}
                </p>
                <div className="mt-auto pt-3 text-right shrink-0">
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-text-secondary border-2 border-text-secondary px-3 py-1.5 hover:text-main hover:border-main cursor-pointer inline-block active:scale-95 transition-colors">
                        READ NOTE
                    </a>
                </div>
            </div>
        </article>
    );
}

function TeamCard({ index }: { index: number }) {
    return (
        <article className="min-w-[80vw] md:min-w-[30vh] w-[80vw] md:w-auto h-[75%] md:h-[50%] md:aspect-[3/4] snap-center bg-white border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] md:shadow-[6px_6px_0_0_rgba(51,51,51,1)] hover:shadow-[10px_10px_0_0_rgba(50,200,100,0.5)] md:hover:shadow-[10px_10px_0_0_rgba(50,200,100,0.5)] transition-all duration-300 flex flex-col overflow-hidden shrink-0 hover:-translate-y-1 md:hover:-translate-y-2">
            <div className="h-[25%] md:h-[30%] bg-green-50 relative border-b-2 border-text-primary overflow-hidden shrink-0 flex items-center justify-center text-green-200 font-bold text-2xl">
                TEAM
            </div>
            <div className="p-4 flex-1 flex flex-col items-center text-center overflow-y-auto">
                <div className="w-14 h-14 rounded-full border-2 border-text-primary bg-white -mt-10 mb-2 z-10 flex items-center justify-center text-lg font-bold text-main shadow-md shrink-0">
                    T{index}
                </div>
                <h3 className="text-base font-bold mb-1 text-text-primary">Design Team {index}</h3>
                <p className="text-xs text-text-secondary mb-3">Creative Design & Art</p>
                <div className="flex gap-1 justify-center mb-4 flex-1 items-end shrink-0">
                    {[1, 2, 3].map(i => <div key={i} className="w-5 h-5 rounded-full bg-gray-200 border border-text-primary"></div>)}
                </div>
                <button className="mt-auto px-6 py-2 bg-text-primary text-white text-xs font-bold hover:bg-main transition-colors w-full shrink-0">
                    VIEW TEAM
                </button>
            </div>
        </article>
    );
}

function ViewAllCard() {
    return (
        <div className="min-w-[50vw] md:min-w-[20vh] w-[50vw] md:w-auto h-[80%] md:h-[50%] md:aspect-[2/3] snap-center flex flex-col items-center justify-center text-text-secondary hover:text-main cursor-pointer group shrink-0 hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 border-2 border-current flex items-center justify-center mb-4 group-hover:bg-white transition-colors bg-bg-sub shadow-[4px_4px_0_0_rgba(51,51,51,1)]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </div>
            <span className="font-bold tracking-widest border-b-2 border-transparent group-hover:border-main text-base">VIEW ALL</span>
        </div>
    );
}
