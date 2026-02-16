"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import EventForm from "./EventForm";

export default function EventNewContent() {
  return (
    <AuthGuard allowedRoles={["admin", "collaborator"]}>
      <EventForm />
    </AuthGuard>
  );
}
