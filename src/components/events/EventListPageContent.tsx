"use client";

import { useState } from "react";
import { useEvents } from "@/hooks/useEvents";
import EventCalendar from "./EventCalendar";
import EventList from "./EventList";

type ViewMode = "calendar" | "list";

export default function EventListPageContent() {
  const [view, setView] = useState<ViewMode>("calendar");
  const { events, loading } = useEvents();

  if (loading) {
    return <p className="text-gray-500">読み込み中...</p>;
  }

  return (
    <div>
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setView("calendar")}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            view === "calendar"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          カレンダー
        </button>
        <button
          onClick={() => setView("list")}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            view === "list"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          リスト
        </button>
      </div>

      {view === "calendar" ? (
        <EventCalendar events={events} />
      ) : (
        <EventList events={events} />
      )}
    </div>
  );
}
