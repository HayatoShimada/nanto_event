"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createNews, updateNews } from "@/lib/firebase/firestore";
import { uploadNewsThumbnail } from "@/lib/firebase/storage";
import Header from "@/components/Header";
import Editor from "@/components/Editor";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

const schema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  content: z.string().optional(),
  publishedAt: z.string().min(1, "公開日は必須です"),
});

type FormData = z.infer<typeof schema>;

export default function CreateNewsPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user } = useAuth(); // TODO: Check for admin permission later

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      publishedAt: new Date().toISOString().substring(0, 10), // Today's date YYYY-MM-DD
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) {
      alert("ログインしてください");
      router.push("/login"); // Simple guard
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create News Document
      const newsId = await createNews({
        title: data.title,
        content: data.content || "",
        publishedAt: Timestamp.fromDate(new Date(data.publishedAt)),
        thumbnailURL: null,
        authorId: user.uid,
      });

      // 2. Upload Thumbnail if exists
      if (imageFile) {
        const url = await uploadNewsThumbnail(newsId, imageFile);
        await updateNews(newsId, { thumbnailURL: url });
      }

      router.push(`/news/${newsId}`);
    } catch (error) {
      console.error("Failed to create news:", error);
      alert("ニュース作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-bg-main text-text-primary font-sans">
      <Header />
      
      <main className="max-w-3xl mx-auto p-4 pt-[calc(5rem+env(safe-area-inset-top))] pb-20">
        <h1 className="text-2xl font-bold mb-6">Create News</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)]">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-bold mb-1">TITLE</label>
            <input
              {...register("title")}
              type="text"
              className="w-full border-2 border-text-primary p-2 rounded-sm focus:ring-2 focus:ring-main focus:outline-none"
              placeholder="Ex: Start of Ticket Sales"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Published Date */}
          <div>
            <label className="block text-sm font-bold mb-1">PUBLISHED DATE</label>
            <input
              {...register("publishedAt")}
              type="date"
              className="w-full border-2 border-text-primary p-2 rounded-sm focus:ring-2 focus:ring-main focus:outline-none"
            />
            {errors.publishedAt && <p className="text-red-500 text-xs mt-1">{errors.publishedAt.message}</p>}
          </div>

          {/* Thumbnail */}
          <div>
             <label className="block text-sm font-bold mb-1">THUMBNAIL IMAGE</label>
             <input
               type="file"
               accept="image/*"
               onChange={(e) => {
                 if (e.target.files?.[0]) {
                   setImageFile(e.target.files[0]);
                 }
               }}
               className="w-full border-2 border-text-primary p-2 rounded-sm bg-gray-50 from-neutral-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-main file:text-white hover:file:bg-main/80"
             />
          </div>

          {/* Content (Rich Text) */}
          <div>
            <label className="block text-sm font-bold mb-1">CONTENT</label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <Editor 
                  content={field.value} 
                  onChange={field.onChange} 
                />
              )}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-main text-white font-bold py-3 border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(51,51,51,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "PUBLISHING..." : "PUBLISH NEWS"}
          </button>

        </form>
      </main>
    </div>
  );
}
