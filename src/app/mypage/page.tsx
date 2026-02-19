"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";

export default function MyPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !profile) {
    return (
      <div className="h-dvh w-full flex items-center justify-center bg-bg-main">
         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-main" />
      </div>
    );
  }

  return (
    <div className="h-dvh w-screen flex flex-col bg-bg-main overflow-hidden text-text-primary font-sans">
      <Header />
      
      <main className="flex-1 w-full flex items-center justify-center p-4 pt-[calc(4rem+env(safe-area-inset-top))]">
        {/* Profile Card */}
        <div className="w-full max-w-md bg-white border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)] p-8 flex flex-col items-center relative">
          
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full border-2 border-text-primary overflow-hidden mb-6 shadow-md relative">
             {profile.photoURL ? (
               <img src={profile.photoURL} alt={profile.username} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full bg-main/20 flex items-center justify-center text-main font-bold text-3xl">
                 {profile.username[0]?.toUpperCase()}
               </div>
             )}
          </div>

          <h1 className="text-2xl font-bold mb-2 tracking-widest">{profile.username}</h1>
          <p className="text-text-secondary text-sm mb-6">{profile.mail}</p>

          <div className="w-full space-y-4 mb-8">
             <div className="border-b border-text-primary/20 pb-2">
               <span className="text-xs font-bold text-main block mb-1">ROLE</span>
               <span className="text-sm">{profile.role.toUpperCase()}</span>
             </div>
             <div className="border-b border-text-primary/20 pb-2">
               <span className="text-xs font-bold text-main block mb-1">POSTAL CODE</span>
               <span className="text-sm">{profile.postalcode || "未登録"}</span>
             </div>
             <div className="border-b border-text-primary/20 pb-2">
               <span className="text-xs font-bold text-main block mb-1">ADDRESS</span>
               <span className="text-sm">{profile.address || "未登録"}</span>
             </div>
             {profile.snsAccounts && profile.snsAccounts.length > 0 && (
               <div className="border-b border-text-primary/20 pb-2">
                 <span className="text-xs font-bold text-main block mb-1">SNS ACCOUNTS</span>
                 <div className="flex flex-col gap-1">
                   {profile.snsAccounts.map((url, index) => (
                     <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                       {url}
                     </a>
                   ))}
                 </div>
               </div>
             )}
          </div>

          <Link href="/mypage/edit" className="w-full bg-main text-white font-bold py-3 text-center border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(51,51,51,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all">
            EDIT PROFILE
          </Link>

          <div className="w-full grid grid-cols-2 gap-4 mt-4">
             <Link href="/events/create" className="w-full bg-white text-main font-bold py-2 text-sm text-center border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] hover:translate-x-[2px] hover:translate-y-[2px] is-active:translate-x-[4px] is-active:translate-y-[4px] hover:shadow-[2px_2px_0_0_rgba(51,51,51,1)] active:shadow-none transition-all">
               CREATE EVENT
             </Link>
             <Link href="/news/create" className="w-full bg-white text-main font-bold py-2 text-sm text-center border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] hover:shadow-[2px_2px_0_0_rgba(51,51,51,1)] active:shadow-none transition-all">
               CREATE NEWS
             </Link>
          </div>
          
          <Link href="/" className="mt-4 text-sm font-bold text-text-secondary hover:text-main transition-colors border-b border-transparent hover:border-main">
             BACK TO HOME
          </Link>

        </div>
      </main>
    </div>
  );
}
