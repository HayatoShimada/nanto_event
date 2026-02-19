import './globals.css';
import type { Metadata } from 'next';
import { M_PLUS_2 } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';

const mPlus2 = M_PLUS_2({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-m-plus-2',
});

export const metadata: Metadata = {
    title: 'NANTS - 南砺市イベント',
    description: '南砺市を好きになるコミュニティーゾーン',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ja">
            <body className={`${mPlus2.variable} bg-bg-main text-text-primary h-dvh w-screen overflow-hidden antialiased`}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
