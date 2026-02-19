"use client";

import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen w-full bg-bg-main p-8 md:p-12 overflow-y-auto font-sans">
            <div className="max-w-3xl mx-auto bg-white border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)] p-8 md:p-12">
                <div className="mb-8">
                    <Link href="/" className="text-main font-bold hover:underline mb-4 inline-block">
                        ← BACK TO TOP
                    </Link>
                    <h1 className="text-3xl font-bold text-text-primary tracking-widest mt-2">PRIVACY POLICY</h1>
                    <p className="text-text-secondary text-sm mt-2">最終更新日: 2026年2月19日</p>
                </div>

                <div className="space-y-8 text-text-primary leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold mb-3 border-b-2 border-main/20 pb-1 w-fit">1. 収集する情報</h2>
                        <p className="text-sm">
                            当サービス（NANTS）は、ユーザーがGoogleアカウントを使用してログインする際に、以下の情報を収集します。
                        </p>
                        <ul className="list-disc list-inside mt-2 text-sm ml-2 space-y-1 text-text-secondary">
                            <li>Googleアカウントの公開プロフィール（名前、プロフィール画像）</li>
                            <li>メールアドレス</li>
                            <li>ユーザー識別子（UID）</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 border-b-2 border-main/20 pb-1 w-fit">2. 情報の利用目的</h2>
                        <p className="text-sm">収集した情報は、以下の目的のために利用されます。</p>
                        <ul className="list-disc list-inside mt-2 text-sm ml-2 space-y-1 text-text-secondary">
                            <li>ユーザーの本人確認および認証</li>
                            <li>サービスの提供および維持</li>
                            <li>不正利用の防止</li>
                            <li>サービスに関する重要なお知らせの通知</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 border-b-2 border-main/20 pb-1 w-fit">3. 情報の第三者提供</h2>
                        <p className="text-sm">
                            当サービスは、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 border-b-2 border-main/20 pb-1 w-fit">4. アクセス解析・Cookie</h2>
                        <p className="text-sm">
                            当サイトでは、サービスの改善のためにGoogle Analytics等のアクセス解析ツールを使用する場合があります。これにより、ブラウザのCookieを使用してトラフィックデータを収集することがありますが、個人を特定する情報は含まれません。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 border-b-2 border-main/20 pb-1 w-fit">5. お問い合わせ</h2>
                        <p className="text-sm">
                            本ポリシーに関するお問い合わせは、運営者までご連絡ください。
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
