"use client";

import Link from "next/link";

export default function CommunityPage() {
    return (
        <div className="min-h-screen w-full bg-bg-main p-8 md:p-12 overflow-y-auto font-sans">
            <div className="max-w-3xl mx-auto bg-white border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)] p-8 md:p-12">
                <div className="mb-8">
                    <Link href="/" className="text-main font-bold hover:underline mb-4 inline-block">
                        ← BACK TO TOP
                    </Link>
                    <h1 className="text-3xl font-bold text-text-primary tracking-widest mt-2">COMMUNITY</h1>
                    <p className="text-text-secondary text-sm mt-2">開発コミュニティについて</p>
                </div>

                <div className="space-y-12 text-text-primary leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold mb-3 border-b-2 border-main/20 pb-1 w-fit flex items-center gap-2">
                            <span>🤝</span>
                            <span>Community Discord</span>
                        </h2>
                        <p className="text-sm mb-4">
                            NANTS プロジェクトの公式Discordサーバーです。<br />
                            開発に関する相談や雑談、イベントの企画など、どなたでも気軽にご参加いただけます！
                        </p>
                        <a
                            href="https://discord.gg/7sgj4Jej"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-6 py-3 bg-[#5865F2] text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-[2px_2px_0_0_rgba(51,51,51,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                        >
                            Discordサーバーに参加する
                        </a>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 border-b-2 border-main/20 pb-1 w-fit flex items-center gap-2">
                            <span>💻</span>
                            <span>Open Source Project</span>
                        </h2>
                        <p className="text-sm">
                            NANTS はオープンソースプロジェクトとして開発されています。<br />
                            「ここを改善したい」「新しい機能を作りたい」といったアイデアがあれば、GitHubリポジトリからIssueの起票やPull Requestを通して、どなたでも開発に参加することが可能です。
                        </p>
                        <a
                            href="https://github.com/HayatoShimada/nanto_event"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-white text-text-primary border-2 border-text-primary font-bold hover:bg-gray-50 transition-colors shadow-[2px_2px_0_0_rgba(51,51,51,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            GitHub Repository
                        </a>
                    </section>
                </div>

                <div className="mt-12 text-center pt-8 border-t-2 border-gray-100">
                    <p className="text-xs text-text-secondary mb-2">
                        ※ 本プロジェクトは皆さまのコントリビューションを歓迎しています！
                    </p>
                    <p className="text-xs text-text-secondary">© 2026 NANTS Project</p>
                </div>
            </div>
        </div>
    );
}
