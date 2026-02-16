import Link from "next/link";
import Image from "next/image";
import type { Event } from "@/types";
import { formatDateTime } from "@/lib/utils/date";

interface EventCardProps {
  event: Event;
}

const CATEGORY_LABELS: Record<string, string> = {
  festival: "お祭り",
  workshop: "ワークショップ",
  concert: "コンサート",
  sports: "スポーツ",
  community: "コミュニティ",
  other: "その他",
};

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="card-hover group block overflow-hidden rounded-xl bg-white"
    >
      <div className="relative h-44 w-full bg-surface">
        {event.imageURL ? (
          <Image
            src={event.imageURL}
            alt={event.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {event.categories.map((cat) => (
            <span
              key={cat}
              className="rounded-full border border-gray-200 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-muted uppercase"
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </span>
          ))}
        </div>
        <h3 className="text-lg font-bold leading-snug text-primary group-hover:text-accent">
          {event.name}
        </h3>
        <p className="mt-2 text-sm text-muted">
          {formatDateTime(event.startDate)}
        </p>
        <p className="mt-0.5 text-sm text-muted/70">{event.location}</p>
      </div>
    </Link>
  );
}
