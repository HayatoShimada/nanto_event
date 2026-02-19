"use client";

import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="min-h-screen w-full bg-bg-main p-8 md:p-12 overflow-y-auto font-sans">
            <div className="max-w-3xl mx-auto bg-white border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)] p-8 md:p-12">
                <div className="mb-8">
                    <Link href="/" className="text-main font-bold hover:underline mb-4 inline-block">
                        ← BACK TO TOP
                    </Link>
                    <h1 className="text-3xl font-bold text-text-primary tracking-widest mt-2">TERMS OF SERVICE</h1>
                    <p className="text-text-secondary text-sm mt-2">最終更新日: 2026年2月19日</p>
                </div>

                <div className="space-y-8 text-text-primary leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold mb-3 border-b-2 border-main/20 pb-1 w-fit">1. はじめに</h2>
                        <p className="text-sm">
                            本利用規約（以下「本規約」）は、NANTS（以下「当サービス」）の提供するサービスの利用条件を定めるものです。登録ユーザーの皆さま（以下「ユーザー」）には、本規約に従って本サービスをご利用いただきます。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 border-b-2 border-main/20 pb-1 w-fit">2. アカウントの管理</h2>
                        <p className="text-sm">
                            ユーザーは、自身のGoogleアカウントを自己の責任において管理するものとし、第三者による不正使用の防止に努めるものとします。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 border-b-2 border-main/20 pb-1 w-fit">3. 禁止事項</h2>
                        <p className="text-sm">ユーザーは、以下の行為を行ってはなりません。</p>
                        <ul className="list-disc list-inside mt-2 text-sm ml-2 space-y-1 text-text-secondary">
                            <li>法令または公序良俗に違反する行為</li>
                            <li>犯罪行為に関連する行為</li>
                            <li>当サービスのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                            <li>他のユーザーに対する嫌がらせや誹謗中傷</li>
                            <li>不正アクセスや、他人のアカウントを使用する行為</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 border-b-2 border-main/20 pb-1 w-fit">4. サービスの停止</h2>
                        <p className="text-sm">
                            当サービスは、保守点検やアップデート、または天災等の不可抗力により、予告なく本サービスの全部または一部の提供を停止または中断することができるものとします。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 border-b-2 border-main/20 pb-1 w-fit">5. 免責事項</h2>
                        <p className="text-sm">
                            当サービスの利用によって生じた損害について、運営者は、故意または重過失がない限り、一切の責任を負いません。また、ユーザーと他のユーザーまたは第三者との間において生じたトラブルについても、当サービスは一切関与しません。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 border-b-2 border-main/20 pb-1 w-fit">6. 規約の変更</h2>
                        <p className="text-sm">
                            必要と判断した場合、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
                        </p>
                    </section>
                </div>

                <div className="mt-12 text-center pt-8 border-t-2 border-gray-100">
                    <p className="text-xs text-text-secondary">© 2026 NANTS Project</p>
                </div>
            </div>
        </div>
    );
}
