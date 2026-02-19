"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Header from "@/components/Header";
import Link from "next/link";

const schema = z.object({
  username: z.string().min(1, "ユーザー名は必須です"),
  postalcode: z.string().optional(),
  address: z.string().optional(),
  sns1: z.string().optional(),
  sns2: z.string().optional(),
  sns3: z.string().optional(),
  noteUrl: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditProfilePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (profile) {
      setValue("username", profile.username);
      setValue("postalcode", profile.postalcode);
      setValue("address", profile.address);
      setValue("sns1", profile.snsAccounts?.[0] || "");
      setValue("sns2", profile.snsAccounts?.[1] || "");
      setValue("sns3", profile.snsAccounts?.[2] || "");
      setValue("noteUrl", profile.noteUrl || "");
    }
  }, [user, loading, router, profile, setValue]);

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        username: data.username,
        postalcode: data.postalcode || "",
        address: data.address || "",
        snsAccounts: [data.sns1, data.sns2, data.sns3].filter((s): s is string => !!s && s.trim() !== ""),
        noteUrl: data.noteUrl || "",
        updatedAt: serverTimestamp(),
      });
      router.push("/mypage");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("プロフィールの更新に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      
      <main className="flex-1 w-full flex items-center justify-center p-4 pt-[calc(4rem+env(safe-area-inset-top))] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md bg-white border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)] p-8 flex flex-col gap-6 relative">
          
          <h1 className="text-2xl font-bold tracking-widest text-center text-main border-b-2 border-main pb-2">EDIT PROFILE</h1>

          {/* Username */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold">USERNAME</label>
            <input
              {...register("username")}
              className="w-full p-2 border-2 border-text-primary/20 focus:border-main outline-none bg-bg-sub/30 transition-colors"
              placeholder="Your Name"
            />
            {errors.username && <span className="text-xs text-red-500 font-bold">{errors.username.message}</span>}
          </div>

          {/* Postal Code */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold">POSTAL CODE</label>
            <input
              {...register("postalcode")}
              className="w-full p-2 border-2 border-text-primary/20 focus:border-main outline-none bg-bg-sub/30 transition-colors"
              placeholder="000-0000"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold">ADDRESS</label>
            <textarea
              {...register("address")}
              className="w-full p-2 border-2 border-text-primary/20 focus:border-main outline-none bg-bg-sub/30 transition-colors h-24 resize-none"
              placeholder="City, Country"
            />
          </div>

          {/* SNS Accounts */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold">SNS ACCOUNTS (Max 3)</label>
            <input
              {...register("sns1")}
              className="w-full p-2 border-2 border-text-primary/20 focus:border-main outline-none bg-bg-sub/30 transition-colors"
              placeholder="https://twitter.com/..."
            />
            <input
              {...register("sns2")}
              className="w-full p-2 border-2 border-text-primary/20 focus:border-main outline-none bg-bg-sub/30 transition-colors"
              placeholder="https://instagram.com/..."
            />
            <input
              {...register("sns3")}
              className="w-full p-2 border-2 border-text-primary/20 focus:border-main outline-none bg-bg-sub/30 transition-colors"
              placeholder="https://facebook.com/..."
            />
          </div>

          {/* Note URL */}
          <div className="flex flex-col gap-2">
             <label className="text-sm font-bold">NOTE URL (RSS)</label>
             <input 
               {...register("noteUrl")}
               className="w-full p-2 border-2 border-text-primary/20 focus:border-main outline-none bg-bg-sub/30 transition-colors"
               placeholder="https://note.com/your_id"
             />
             <p className="text-[10px] text-text-secondary">noteのトップページURLを入力すると自動でRSSを取得します</p>
          </div>

          <div className="flex gap-4 mt-4">
             <Link href="/mypage" className="flex-1 py-3 text-center border-2 border-text-primary font-bold hover:bg-gray-100 transition-colors flex items-center justify-center">
               CANCEL
             </Link>
             <button
               type="submit"
               disabled={isSubmitting}
               className="flex-1 py-3 bg-main text-white font-bold border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(51,51,51,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isSubmitting ? "SAVING..." : "SAVE"}
             </button>
          </div>

        </form>
      </main>
    </div>
  );
}
