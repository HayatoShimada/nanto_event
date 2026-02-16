"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUserParticipations } from "@/hooks/useParticipation";
import { getEvent, cancelParticipation } from "@/lib/firebase/firestore";
import { formatDateTime } from "@/lib/utils/date";
import type { Event } from "@/types";

export default function ParticipationList() {
  const { user } = useAuthContext();
  const { participations, loading } = useUserParticipations(user?.uid ?? "");
  const [events, setEvents] = useState<Record<string, Event>>({});

  useEffect(() => {
    async function loadEvents() {
      const eventMap: Record<string, Event> = {};
      for (const p of participations) {
        if (!eventMap[p.eventId]) {
          const ev = await getEvent(p.eventId);
          if (ev) eventMap[p.eventId] = ev;
        }
      }
      setEvents(eventMap);
    }
    if (participations.length > 0) loadEvents();
  }, [participations]);

  if (loading) return <p className="text-gray-500">読み込み中...</p>;

  const attending = participations.filter((p) => p.status === "attending");

  if (attending.length === 0) {
    return <p className="text-gray-500">参加予定のイベントはありません</p>;
  }

  return (
    <div className="space-y-3">
      {attending.map((p) => {
        const ev = events[p.eventId];
        return (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
          >
            <div>
              <Link
                href={`/events/${p.eventId}`}
                className="font-medium hover:text-primary"
              >
                {ev?.name ?? "読み込み中..."}
              </Link>
              {ev && (
                <p className="text-sm text-gray-500">
                  {formatDateTime(ev.startDate)}
                </p>
              )}
            </div>
            <button
              onClick={() => cancelParticipation(p.id)}
              className="text-sm text-red-600 hover:underline"
            >
              キャンセル
            </button>
          </div>
        );
      })}
    </div>
  );
}
