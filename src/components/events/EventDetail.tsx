"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuthContext } from "@/contexts/AuthContext";
import { useEvent } from "@/hooks/useEvents";
import { useEventParticipations } from "@/hooks/useParticipation";
import {
  registerForEvent,
  cancelParticipation,
  deleteEvent,
} from "@/lib/firebase/firestore";
import { formatDateTime } from "@/lib/utils/date";

const CATEGORY_LABELS: Record<string, string> = {
  festival: "お祭り",
  workshop: "ワークショップ",
  concert: "コンサート",
  sports: "スポーツ",
  community: "コミュニティ",
  other: "その他",
};

interface EventDetailProps {
  eventId: string;
}

export default function EventDetail({ eventId }: EventDetailProps) {
  const router = useRouter();
  const { user, profile } = useAuthContext();
  const { event, loading } = useEvent(eventId);
  const { participations } = useEventParticipations(eventId);
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  if (loading) {
    return <p className="text-center text-gray-500">読み込み中...</p>;
  }

  if (!event) {
    return <p className="text-center text-gray-500">イベントが見つかりません</p>;
  }

  const myParticipation = participations.find(
    (p) => p.userId === user?.uid && p.status === "attending"
  );
  const isOrganizer = user?.uid === event.organizerUid;
  const canEdit =
    profile &&
    (profile.role === "admin" ||
      (profile.role === "collaborator" && isOrganizer));

  async function handleRegister() {
    if (!user) return;
    setActionLoading(true);
    try {
      await registerForEvent(eventId, user.uid, emailOptIn);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    if (!myParticipation) return;
    setActionLoading(true);
    try {
      await cancelParticipation(myParticipation.id);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("このイベントを削除しますか？")) return;
    await deleteEvent(eventId);
    router.push("/events");
  }

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      {/* イメージ画像 */}
      {event.imageURL && (
        <div className="relative h-64 w-full overflow-hidden rounded-lg sm:h-80">
          <Image
            src={event.imageURL}
            alt={event.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* カテゴリ */}
      <div className="flex flex-wrap gap-2">
        {event.categories.map((cat) => (
          <span
            key={cat}
            className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
          >
            {CATEGORY_LABELS[cat] ?? cat}
          </span>
        ))}
      </div>

      {/* タイトル */}
      <h1 className="text-3xl font-bold">{event.name}</h1>

      {/* 日時・場所 */}
      <div className="space-y-1 text-gray-600">
        <p>
          {formatDateTime(event.startDate)} 〜{" "}
          {formatDateTime(event.finishDate)}
        </p>
        <p>{event.location}</p>
      </div>

      {/* 参加者数 */}
      <p className="text-sm text-gray-500">
        参加者: {participations.length}名
      </p>

      {/* 説明（HTML） */}
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: event.description }}
      />

      {/* 参加 / キャンセル */}
      {user && (
        <div className="rounded-lg border border-gray-200 p-4">
          {myParticipation ? (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">参加登録済み</p>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                参加をキャンセル
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={emailOptIn}
                  onChange={(e) => setEmailOptIn(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">
                  このイベントのメール通知を受け取る
                </span>
              </label>
              <button
                onClick={handleRegister}
                disabled={actionLoading}
                className="rounded-md bg-primary px-6 py-2 text-white hover:bg-primary-dark disabled:opacity-50"
              >
                参加する
              </button>
            </div>
          )}
        </div>
      )}

      {!user && (
        <div className="rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-gray-600">
            参加するには
            <Link href="/auth/login" className="text-primary hover:underline">
              ログイン
            </Link>
            してください
          </p>
        </div>
      )}

      {/* 編集・削除 */}
      {canEdit && (
        <div className="flex gap-3 border-t border-gray-200 pt-4">
          <Link
            href={`/events/${eventId}/edit`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            編集
          </Link>
          <button
            onClick={handleDelete}
            className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            削除
          </button>
        </div>
      )}
    </article>
  );
}
