"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { getEvent, updateEvent, deleteEvent } from "@/lib/firebase/firestore";
import { uploadEventImage, deleteEventImage } from "@/lib/firebase/storage";
import Header from "@/components/Header";
import Editor from "@/components/Editor";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import type { Event as EventType } from "@/types";

const schema = z.object({
  name: z.string().min(1, "イベント名は必須です"),
  startDate: z.string().min(1, "開始日時は必須です"),
  finishDate: z.string().min(1, "終了日時は必須です"),
  location: z.string().min(1, "場所は必須です"),
  categories: z.string().min(1, "カテゴリは少なくとも1つ必要です"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ClientPage({ id }: { id: string }) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageURL, setCurrentImageURL] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    async function loadEvent() {
      // id is from props
      const eventData = await getEvent(id);
      
      if (!eventData) {
        alert("Event not found");
        router.push("/mypage");
        return;
      }

      // Check ownership
      if (user && eventData.organizerUid !== user.uid) {
         // Allow admin bypass or show error
      }
      
      setValue("name", eventData.name);
      setValue("startDate", formatDateForInput(eventData.startDate));
      setValue("finishDate", formatDateForInput(eventData.finishDate));
      setValue("location", eventData.location);
      setValue("categories", eventData.categories.join(", "));
      setValue("description", eventData.description);
      setCurrentImageURL(eventData.imageURL);
      
      setLoading(false);
    }
    loadEvent();
  }, [id, router, setValue, user]);

  const formatDateForInput = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    // Format: YYYY-MM-DDThh:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      let imageURL = currentImageURL;

      if (imageFile) {
        // Upload new image
        imageURL = await uploadEventImage(id, imageFile);
      }

      await updateEvent(id, {
        name: data.name,
        startDate: Timestamp.fromDate(new Date(data.startDate)),
        finishDate: Timestamp.fromDate(new Date(data.finishDate)),
        location: data.location,
        categories: data.categories.split(",").map((s) => s.trim()) as any[],
        description: data.description || "",
        imageURL: imageURL,
      });

      router.push(`/events/${id}`);
    } catch (error) {
      console.error("Failed to update event:", error);
      alert("イベント更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("本当にこのイベントを削除しますか？この操作は取り消せません。")) return;
    
    setIsSubmitting(true);
    try {
        if (currentImageURL) {
            await deleteEventImage(id);
        }
        await deleteEvent(id);
        router.push("/mypage");
    } catch (error) {
        console.error("Failed to delete event:", error);
        alert("削除に失敗しました");
        setIsSubmitting(false);
    }
  };

  if (loading) {
      return (
          <div className="h-dvh w-full flex items-center justify-center bg-bg-main">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-main" />
          </div>
      );
  }

  return (
    <div className="min-h-dvh bg-bg-main text-text-primary font-sans">
      <Header />
      
      <main className="max-w-3xl mx-auto p-4 pt-[calc(5rem+env(safe-area-inset-top))] pb-20">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Edit Event</h1>
            <button 
                onClick={handleDelete}
                disabled={isSubmitting}
                className="text-red-500 font-bold border-2 border-red-500 px-4 py-2 hover:bg-red-50 transition-colors text-sm"
            >
                DELETE EVENT
            </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)]">
          
          {/* Event Name */}
          <div>
            <label className="block text-sm font-bold mb-1">EVENT NAME</label>
            <input
              {...register("name")}
              type="text"
              className="w-full border-2 border-text-primary p-2 rounded-sm focus:ring-2 focus:ring-main focus:outline-none"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">START DATE</label>
              <input
                {...register("startDate")}
                type="datetime-local"
                className="w-full border-2 border-text-primary p-2 rounded-sm focus:ring-2 focus:ring-main focus:outline-none"
              />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">FINISH DATE</label>
              <input
                {...register("finishDate")}
                type="datetime-local"
                className="w-full border-2 border-text-primary p-2 rounded-sm focus:ring-2 focus:ring-main focus:outline-none"
              />
              {errors.finishDate && <p className="text-red-500 text-xs mt-1">{errors.finishDate.message}</p>}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-bold mb-1">LOCATION</label>
            <input
              {...register("location")}
              type="text"
              className="w-full border-2 border-text-primary p-2 rounded-sm focus:ring-2 focus:ring-main focus:outline-none"
            />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-bold mb-1">CATEGORIES (comma separated)</label>
            <input
              {...register("categories")}
              type="text"
              className="w-full border-2 border-text-primary p-2 rounded-sm focus:ring-2 focus:ring-main focus:outline-none"
            />
            {errors.categories && <p className="text-red-500 text-xs mt-1">{errors.categories.message}</p>}
          </div>

          {/* Main Image */}
          <div>
             <label className="block text-sm font-bold mb-1">MAIN IMAGE</label>
             {currentImageURL && (
                 <div className="mb-2 relative w-full h-48 bg-gray-100 border border-text-primary">
                     <img src={currentImageURL} alt="Current" className="w-full h-full object-contain" />
                 </div>
             )}
             <input
               type="file"
               accept="image/*"
               onChange={(e) => {
                 if (e.target.files?.[0]) {
                   setImageFile(e.target.files[0]);
                 }
               }}
               className="w-full border-2 border-text-primary p-2 rounded-sm bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-main file:text-white hover:file:bg-main/80"
             />
          </div>

          {/* Description (Rich Text) */}
          <div>
            <label className="block text-sm font-bold mb-1">DESCRIPTION</label>
            <Controller
              name="description"
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
            {isSubmitting ? "SAVING..." : "SAVE CHANGES"}
          </button>

        </form>
      </main>
    </div>
  );
}
