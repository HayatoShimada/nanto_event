"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { EventParticipation } from "@/types";

export function useEventParticipations(eventId: string) {
  const [participations, setParticipations] = useState<EventParticipation[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    const q = query(
      collection(db, "event_participations"),
      where("eventId", "==", eventId),
      where("status", "==", "attending")
    );
    const unsub = onSnapshot(q, (snap) => {
      setParticipations(
        snap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as EventParticipation
        )
      );
      setLoading(false);
    });
    return () => unsub();
  }, [eventId]);

  return { participations, loading };
}

export function useUserParticipations(userId: string) {
  const [participations, setParticipations] = useState<EventParticipation[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, "event_participations"),
      where("userId", "==", userId)
    );
    const unsub = onSnapshot(q, (snap) => {
      setParticipations(
        snap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as EventParticipation
        )
      );
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  return { participations, loading };
}
