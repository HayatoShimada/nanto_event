"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  where,
  limit as firestoreLimit,
  onSnapshot,
  Timestamp,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Event } from "@/types";

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("startDate", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setEvents(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Event)
        );
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return { events, loading, error };
}

export function useEvent(eventId: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!eventId) return;
    const unsub = onSnapshot(
      doc(db, "events", eventId),
      (snap) => {
        if (snap.exists()) {
          setEvent({ id: snap.id, ...snap.data() } as Event);
        } else {
          setEvent(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [eventId]);

  return { event, loading, error };
}

export function useUpcomingEvents(limit = 6) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "events"),
      where("startDate", ">=", Timestamp.now()),
      orderBy("startDate", "asc"),
      firestoreLimit(limit)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setEvents(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Event)
        );
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [limit]);

  return { events, loading, error };
}
