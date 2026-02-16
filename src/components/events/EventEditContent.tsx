"use client";

import { useEvent } from "@/hooks/useEvents";
import AuthGuard from "@/components/auth/AuthGuard";
import EventForm from "./EventForm";

interface EventEditContentProps {
  eventId: string;
}

export default function EventEditContent({ eventId }: EventEditContentProps) {
  const { event, loading } = useEvent(eventId);

  if (loading) return <p className="text-gray-500">読み込み中...</p>;
  if (!event) return <p className="text-gray-500">イベントが見つかりません</p>;

  return (
    <AuthGuard allowedRoles={["admin", "collaborator"]}>
      <EventForm event={event} />
    </AuthGuard>
  );
}
