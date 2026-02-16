"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Timestamp } from "firebase/firestore";
import { eventSchema, type EventFormData } from "@/lib/utils/validation";
import { createEvent, updateEvent } from "@/lib/firebase/firestore";
import {
  uploadEventImage,
  deleteEventImage,
} from "@/lib/firebase/storage";
import { useAuthContext } from "@/contexts/AuthContext";
import RichTextEditor from "@/components/editor/RichTextEditor";
import ImageUploader from "@/components/ui/ImageUploader";
import type { Event, EventCategory } from "@/types";

const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: "festival", label: "お祭り" },
  { value: "workshop", label: "ワークショップ" },
  { value: "concert", label: "コンサート" },
  { value: "sports", label: "スポーツ" },
  { value: "community", label: "コミュニティ" },
  { value: "other", label: "その他" },
];

interface EventFormProps {
  event?: Event;
}

export default function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const { user } = useAuthContext();
  const [imageURL, setImageURL] = useState<string | null>(
    event?.imageURL ?? null
  );
  const [eventId] = useState(event?.id ?? "");
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: event
      ? {
          name: event.name,
          description: event.description,
          location: event.location,
          categories: event.categories,
          startDate: toDateTimeLocal(event.startDate),
          finishDate: toDateTimeLocal(event.finishDate),
          emailNotification: event.emailNotification,
        }
      : {
          name: "",
          description: "",
          location: "",
          categories: [],
          startDate: "",
          finishDate: "",
          emailNotification: true,
        },
  });

  const watchedValues = watch();

  async function onSubmit(data: EventFormData) {
    if (!user) return;

    const eventData = {
      name: data.name,
      description: data.description,
      location: data.location,
      imageURL,
      categories: data.categories as EventCategory[],
      startDate: Timestamp.fromDate(new Date(data.startDate)),
      finishDate: Timestamp.fromDate(new Date(data.finishDate)),
      organizerUid: user.uid,
      emailNotification: data.emailNotification,
    };

    if (event) {
      await updateEvent(event.id, eventData);
      router.push(`/events/${event.id}`);
    } else {
      const newId = await createEvent(eventData);
      router.push(`/events/${newId}`);
    }
  }

  async function handleImageUpload(file: File): Promise<string> {
    const id = eventId || "temp_" + Date.now();
    const url = await uploadEventImage(id, file);
    setImageURL(url);
    return url;
  }

  async function handleImageDelete(): Promise<void> {
    if (eventId) {
      await deleteEventImage(eventId);
    }
    setImageURL(null);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setShowPreview(false)}
          className={`rounded px-3 py-1 text-sm ${!showPreview ? "bg-primary text-white" : "bg-gray-100"}`}
        >
          編集
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className={`rounded px-3 py-1 text-sm ${showPreview ? "bg-primary text-white" : "bg-gray-100"}`}
        >
          プレビュー
        </button>
      </div>

      {showPreview ? (
        <div className="space-y-4 rounded-lg border border-gray-200 p-6">
          {imageURL && (
            <div className="relative h-48 w-full overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageURL}
                alt="イベント画像"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <h2 className="text-2xl font-bold">
            {watchedValues.name || "（イベント名未入力）"}
          </h2>
          <p className="text-gray-600">
            {watchedValues.location || "（開催場所未入力）"}
          </p>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: watchedValues.description || "<p>（説明未入力）</p>",
            }}
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* イメージ画像 */}
          <section>
            <h3 className="mb-2 text-sm font-medium">イベントイメージ画像</h3>
            <ImageUploader
              currentImageURL={imageURL}
              onUpload={handleImageUpload}
              onDelete={handleImageDelete}
            />
          </section>

          {/* 基本情報 */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500">基本情報</h3>

            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                イベント名
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">カテゴリ</label>
              <div className="mt-2 flex flex-wrap gap-2">
                <Controller
                  name="categories"
                  control={control}
                  render={({ field }) => (
                    <>
                      {CATEGORIES.map((cat) => {
                        const selected = field.value.includes(cat.value);
                        return (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => {
                              if (selected) {
                                field.onChange(
                                  field.value.filter(
                                    (v: string) => v !== cat.value
                                  )
                                );
                              } else {
                                field.onChange([...field.value, cat.value]);
                              }
                            }}
                            className={`rounded-full px-3 py-1 text-sm ${
                              selected
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </>
                  )}
                />
              </div>
              {errors.categories && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.categories.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium">
                開催場所
              </label>
              <input
                id="location"
                type="text"
                {...register("location")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.location.message}
                </p>
              )}
            </div>
          </section>

          {/* 日時 */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500">日時</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium"
                >
                  開始日時
                </label>
                <input
                  id="startDate"
                  type="datetime-local"
                  {...register("startDate")}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="finishDate"
                  className="block text-sm font-medium"
                >
                  終了日時
                </label>
                <input
                  id="finishDate"
                  type="datetime-local"
                  {...register("finishDate")}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {errors.finishDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.finishDate.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* イベント説明 */}
          <section>
            <h3 className="mb-2 text-sm font-medium text-gray-500">
              イベント説明
            </h3>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  content={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </section>

          {/* 設定 */}
          <section>
            <h3 className="mb-2 text-sm font-medium text-gray-500">設定</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register("emailNotification")}
                className="rounded border-gray-300"
              />
              <span className="text-sm">
                参加者へのメール通知を有効にする
              </span>
            </label>
          </section>

          {/* 送信 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-primary px-4 py-3 font-medium text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {isSubmitting
              ? "保存中..."
              : event
                ? "イベントを更新"
                : "イベントを作成"}
          </button>
        </form>
      )}
    </div>
  );
}

function toDateTimeLocal(timestamp: Timestamp): string {
  const d = timestamp.toDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
