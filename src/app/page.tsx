"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import MenuOverlay from '@/components/MenuOverlay';
import { useState } from 'react';

export default function Home() {
    const { user, logout } = useAuth();

    return (
        <div className="flex h-screen w-full bg-bg-main overflow-hidden font-sans flex-col md:flex-row">
            {/* Mobile Header */}
            <Header />

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

                {/* Section: ALL */}
                <Section id="all" title="ALL">
                    <div className="flex gap-4 md:gap-8 items-center h-full px-4 md:px-12 pb-0 md:pb-12 box-border">
                        <WelcomeCard />
                        {[1, 2, 3].map(i => <EventCard key={`all-${i}`} index={i} category="RECOMMEND" />)}
                        <ViewAllCard />
                    </div>
                </Section>

                {/* Section: NEWS */}
                <Section id="news" title="NEWS">
                    <div className="flex gap-4 md:gap-8 items-center h-full px-4 md:px-12 pb-0 md:pb-12 box-border">
                        {[1, 2, 3, 4, 5].map(i => <NewsCard key={`news-${i}`} index={i} />)}
                        <ViewAllCard />
                    </div>
                </Section>

                {/* Section: EVENTS */}
                <Section id="events" title="EVENTS">
                    <div className="flex gap-4 md:gap-8 items-center h-full px-4 md:px-12 pb-0 md:pb-12 box-border">
                        {[1, 2, 3, 4, 5].map(i => <EventCard key={`event-${i}`} index={i} category="EVENT" />)}
                        <ViewAllCard />
                    </div>
                </Section>

                {/* Section: TEAMS */}
                <Section id="teams" title="TEAMS">
                    <div className="flex gap-4 md:gap-8 items-center h-full px-4 md:px-12 pb-0 md:pb-12 box-border">
                        {[1, 2, 3, 4, 5].map(i => <TeamCard key={`team-${i}`} index={i} />)}
                        <ViewAllCard />
                    </div>
                </Section>

            </main>
        </div>
    );
}

function Section({ id, title, children }: { id: string, title: string, children: React.ReactNode }) {
    return (
        <section id={id} className="w-full h-screen snap-start flex flex-col justify-start md:justify-center pt-16 pb-2 md:py-4 border-b-2 border-text-primary/10 relative shrink-0 box-border scroll-mt-0">
            <div className="px-4 md:px-12 mb-1 md:mb-4 shrink-0">
                <h2 className="text-3xl md:text-4xl font-bold text-main tracking-widest drop-shadow-sm flex items-center gap-2 md:gap-4">
                    {title}
                    <div className="h-1 w-12 md:w-20 bg-main rounded-full"></div>
                </h2>
            </div>
            <div className="flex-1 overflow-x-auto hide-scrollbar scroll-smooth w-full flex items-start md:items-center snap-x snap-mandatory">
                {children}
            </div>
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

function WelcomeCard() {
    return (
        <div className="min-w-[85vw] md:min-w-[40vh] w-[85vw] md:w-auto h-[80%] md:h-[65%] md:aspect-[4/5] snap-center bg-white p-6 md:p-8 flex flex-col justify-center border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] md:shadow-[8px_8px_0_0_rgba(51,51,51,1)] relative overflow-hidden group shrink-0">
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-main/10 -mr-8 -mt-8 transition-all group-hover:bg-main/20"></div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-main relative z-10">Welcome to<br />NANTS</h2>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed relative z-10 flex-1 overflow-y-auto">
                南砺市を好きになるコミュニティーゾーン。<br />
                新しい出会いと体験があなたを待っています。
            </p>
            <button className="mt-4 px-6 py-3 bg-white text-text-primary border-2 border-text-primary font-bold shadow-[2px_2px_0_0_rgba(242,128,191,1)] md:shadow-[4px_4px_0_0_rgba(242,128,191,1)] hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0_0_rgba(242,128,191,1)] md:hover:shadow-[2px_2px_0_0_rgba(242,128,191,1)] transition-all w-fit cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shrink-0 text-sm md:text-base">
                EXPLORE
            </button>
        </div>
    );
}

function EventCard({ index, category = "FESTIVAL" }: { index: number, category?: string }) {
    return (
        <article className="min-w-[75vw] md:min-w-[30vh] w-[75vw] md:w-auto h-[80%] md:h-[60%] md:aspect-[3/4] snap-center bg-white border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] md:shadow-[6px_6px_0_0_rgba(51,51,51,1)] hover:shadow-[6px_6px_0_0_rgba(242,128,191,0.5)] md:hover:shadow-[10px_10px_0_0_rgba(242,128,191,0.5)] transition-all duration-300 flex flex-col overflow-hidden shrink-0 hover:-translate-y-1 md:hover:-translate-y-2">
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
                    <button className="text-xs font-bold text-main border-b-2 border-transparent hover:border-main cursor-pointer">JOIN</button>
                </div>
            </div>
        </article>
    );
}

function NewsCard({ index }: { index: number }) {
    return (
        <article className="min-w-[80vw] md:min-w-[35vh] w-[80vw] md:w-auto h-[80%] md:h-[55%] md:aspect-[4/5] snap-center bg-white border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] md:shadow-[6px_6px_0_0_rgba(51,51,51,1)] hover:shadow-[6px_6px_0_0_rgba(51,51,200,0.5)] md:hover:shadow-[10px_10px_0_0_rgba(51,51,200,0.5)] transition-all duration-300 flex flex-col overflow-hidden shrink-0 hover:-translate-y-1 md:hover:-translate-y-2">
            <div className="h-[30%] md:h-[35%] bg-blue-50 relative border-b-2 border-text-primary overflow-hidden shrink-0 flex items-center justify-center text-blue-200 font-bold text-2xl">
                NEWS
            </div>
            <div className="p-4 md:p-5 flex-1 flex flex-col overflow-y-auto">
                <span className="text-xs font-bold text-blue-500 mb-2 shrink-0">2026.02.{20 - index}</span>
                <h3 className="text-base font-bold mb-2 text-text-primary shrink-0">
                    地域活性化プロジェクト「NANTS」始動のお知らせ
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed flex-1">
                    南砺市の新しいコミュニティプラットフォームがオープンしました。最新のイベント情報やチーム活動をチェックして、地域とのつながりを深めましょう。
                </p>
                <div className="mt-auto pt-3 text-right shrink-0">
                    <span className="text-xs font-bold text-text-secondary border-b border-text-secondary hover:text-main hover:border-main cursor-pointer">READ MORE</span>
                </div>
            </div>
        </article>
    );
}

function TeamCard({ index }: { index: number }) {
    return (
        <article className="min-w-[75vw] md:min-w-[30vh] w-[75vw] md:w-auto h-[80%] md:h-[50%] md:aspect-[3/4] snap-center bg-white border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] md:shadow-[6px_6px_0_0_rgba(51,51,51,1)] hover:shadow-[10px_10px_0_0_rgba(50,200,100,0.5)] md:hover:shadow-[10px_10px_0_0_rgba(50,200,100,0.5)] transition-all duration-300 flex flex-col overflow-hidden shrink-0 hover:-translate-y-1 md:hover:-translate-y-2">
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
