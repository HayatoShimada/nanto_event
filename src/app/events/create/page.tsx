"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent, getUserTeams } from "@/lib/firebase/firestore";
import { uploadEventImage } from "@/lib/firebase/storage";
import Header from "@/components/Header";
import Editor from "@/components/Editor";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { EVENT_TAGS } from "@/constants/tags";
import type { Team, EventCategory } from "@/types";

const schema = z.object({
  name: z.string().min(1, "イベント名は必須です"),
  startDate: z.string().min(1, "開始日時は必須です"),
  finishDate: z.string().min(1, "終了日時は必須です"),
  location: z.string().min(1, "場所は必須です"),
  categories: z.string().min(1, "カテゴリは少なくとも1つ必要です"),
  description: z.string().optional(),
  recruitmentUrl: z.string().optional(),
  tags: z.array(z.string()).max(2, "タグは最大2つまで選択できます").optional(),
  organizerType: z.enum(["user", "team"]),
  teamId: z.string().optional(),
  status: z.enum(["draft", "published"]),
  publishType: z.enum(["immediate", "scheduled"]).optional(),
  publishedAt: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CreateEventPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const router = useRouter();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      organizerType: "user",
      status: "published",
      publishType: "immediate",
    }
  });

  useEffect(() => {
    if (user) {
      getUserTeams(user.uid).then(setTeams).catch(console.error);
    }
  }, [user]);

  const onSubmit = async (data: FormData) => {
    if (!user) {
      alert("ログインしてください");
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Event Document first to get ID
      let publishTimestamp = null;
      if (data.status === "published") {
        publishTimestamp = data.publishType === "immediate" || !data.publishedAt
          ? Timestamp.now()
          : Timestamp.fromDate(new Date(data.publishedAt));
      }

      const eventId = await createEvent({
        name: data.name,
        startDate: Timestamp.fromDate(new Date(data.startDate)),
        finishDate: Timestamp.fromDate(new Date(data.finishDate)),
        location: data.location,
        categories: data.categories.split(",").map((s) => s.trim()) as EventCategory[],
        description: data.description || "",
        recruitmentUrl: data.recruitmentUrl || "",
        tags: data.tags || [],
        imageURL: null,
        organizerUid: data.organizerType === "team" && data.teamId ? data.teamId : user.uid,
        organizerType: data.organizerType,
        emailNotification: false,
        status: data.status,
        publishedAt: publishTimestamp,
      });

      if (imageFile) {
        const imageURL = await uploadEventImage(eventId, imageFile);
        await updateEvent(eventId, { imageURL });
      }

      alert("イベントを作成しました");
      router.push("/mypage");
    } catch (error) {
      console.error("Failed to create event:", error);
      alert("イベント作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-bg-main text-text-primary font-sans">
      <Header />

      <main className="max-w-3xl mx-auto p-4 pt-[calc(5rem+env(safe-area-inset-top))] pb-20">
        <h1 className="text-2xl font-bold mb-6">Create New Event</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)]">

          {/* Organizer */}
          <div>
            <label className="block text-sm font-bold mb-1">ORGANIZER</label>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="user" {...register("organizerType")} className="accent-main" />
                個人として主催
              </label>
              {teams.length > 0 && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="team" {...register("organizerType")} className="accent-main" />
                  チームとして主催
                </label>
              )}
            </div>
            {watch("organizerType") === "team" && (
              <select {...register("teamId")} className="w-full border-2 border-text-primary p-2 focus:ring-2 focus:ring-main focus:outline-none mb-2">
                <option value="">チームを選択してください</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            )}
            {errors.organizerType && <p className="text-red-500 text-xs mt-1">{errors.organizerType.message}</p>}
          </div>

          {/* Event Name */}
          <div>
            <label className="block text-sm font-bold mb-1">EVENT NAME</label>
            <input
              {...register("name")}
              type="text"
              className="w-full border-2 border-text-primary p-2 rounded-sm focus:ring-2 focus:ring-main focus:outline-none"
              placeholder="Ex: Nanto Summer Festival"
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
              placeholder="Ex: Inami Wood Carving Center"
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
              placeholder="Ex: music, food, tradition"
            />
            {errors.categories && <p className="text-red-500 text-xs mt-1">{errors.categories.message}</p>}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-bold mb-1">TAGS (Max 2)</label>
            <div className="flex flex-wrap gap-2">
              {EVENT_TAGS.map((tag) => (
                <label key={`tag-${tag}`} className="flex items-center gap-1 text-sm bg-bg-sub/30 px-2 py-1 border border-text-primary/20 rounded cursor-pointer hover:bg-main/10 transition-colors">
                  <input
                    type="checkbox"
                    value={tag}
                    {...register("tags")}
                    className="accent-main"
                  />
                  {tag}
                </label>
              ))}
            </div>
            {errors.tags && <p className="text-red-500 text-xs mt-1">{errors.tags.message}</p>}
          </div>

          {/* Recruitment URL */}
          <div>
            <label className="block text-sm font-bold mb-1">RECRUITMENT URL (Optional)</label>
            <input
              {...register("recruitmentUrl")}
              type="text"
              className="w-full border-2 border-text-primary p-2 rounded-sm focus:ring-2 focus:ring-main focus:outline-none"
              placeholder="Ex: https://peatix.com/..."
            />
          </div>

          {/* Main Image */}
          <div>
            <label className="block text-sm font-bold mb-1">MAIN IMAGE</label>
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

          <hr className="border-text-primary/20" />

          {/* Status Settings */}
          <div>
            <label className="block text-xl font-bold mb-3">PUBLISH SETTINGS</label>
            <div className="space-y-4">
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input type="radio" value="published" {...register("status")} className="accent-main w-4 h-4" />
                  公開
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input type="radio" value="draft" {...register("status")} className="accent-main w-4 h-4" />
                  下書き
                </label>
              </div>

              {watch("status") === "published" && (
                <div className="pl-6 border-l-4 border-main/50 space-y-3 mt-3">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value="immediate" {...register("publishType")} className="accent-main" />
                      今すぐ公開
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value="scheduled" {...register("publishType")} className="accent-main" />
                      日時を指定して予約公開
                    </label>
                  </div>

                  {watch("publishType") === "scheduled" && (
                    <div>
                      <label className="block text-sm font-bold mb-1 text-text-primary/70">SCHEDULED DATE & TIME</label>
                      <input
                        {...register("publishedAt")}
                        type="datetime-local"
                        className="w-full md:w-1/2 border-2 border-text-primary p-2 rounded-sm focus:ring-2 focus:ring-main focus:outline-none"
                      />
                      {errors.publishedAt && <p className="text-red-500 text-xs mt-1">{errors.publishedAt.message}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-main text-white font-bold py-3 border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(51,51,51,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "CREATING..." : "CREATE EVENT"}
          </button>

        </form>
      </main>
    </div>
  );
}
