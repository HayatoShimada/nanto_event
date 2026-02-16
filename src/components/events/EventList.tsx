"use client";

import { useState } from "react";
import type { Event, EventCategory } from "@/types";
import EventCard from "./EventCard";

const CATEGORIES: { value: EventCategory | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "festival", label: "お祭り" },
  { value: "workshop", label: "ワークショップ" },
  { value: "concert", label: "コンサート" },
  { value: "sports", label: "スポーツ" },
  { value: "community", label: "コミュニティ" },
  { value: "other", label: "その他" },
];

interface EventListProps {
  events: Event[];
}

export default function EventList({ events }: EventListProps) {
  const [filter, setFilter] = useState<EventCategory | "all">("all");

  const filtered =
    filter === "all"
      ? events
      : events.filter((e) => e.categories.includes(filter));

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`rounded-full px-3 py-1 text-sm ${
              filter === cat.value
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-500">イベントがありません</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
