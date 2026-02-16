"use client";

import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import jaLocale from "@fullcalendar/core/locales/ja";
import type { Event } from "@/types";

interface EventCalendarProps {
  events: Event[];
}

export default function EventCalendar({ events }: EventCalendarProps) {
  const router = useRouter();

  const calendarEvents = events.map((e) => ({
    id: e.id,
    title: e.name,
    start: e.startDate.toDate(),
    end: e.finishDate.toDate(),
  }));

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      locale={jaLocale}
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,listMonth",
      }}
      events={calendarEvents}
      eventClick={(info) => {
        router.push(`/events/${info.event.id}`);
      }}
      height="auto"
    />
  );
}
