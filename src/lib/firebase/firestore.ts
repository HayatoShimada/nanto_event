import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import type {
  Event,
  UserProfile,
  EventCollaborator,
  EventParticipation,
} from "@/types";

// ----- イベント CRUD -----

export async function getEvents(): Promise<Event[]> {
  const q = query(collection(db, "events"), orderBy("startDate", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Event);
}

export async function getEvent(eventId: string): Promise<Event | null> {
  const snap = await getDoc(doc(db, "events", eventId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Event;
}

export async function getUpcomingEvents(limit = 6): Promise<Event[]> {
  const q = query(
    collection(db, "events"),
    where("startDate", ">=", Timestamp.now()),
    orderBy("startDate", "asc"),
    firestoreLimit(limit)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Event);
}

export async function createEvent(
  data: Omit<Event, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const now = Timestamp.now();
  const ref = await addDoc(collection(db, "events"), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateEvent(
  eventId: string,
  data: Partial<Event>
): Promise<void> {
  await updateDoc(doc(db, "events", eventId), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteEvent(eventId: string): Promise<void> {
  await deleteDoc(doc(db, "events", eventId));
}

// ----- ユーザー -----

export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() } as UserProfile;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function getCollaborators(): Promise<UserProfile[]> {
  const q = query(
    collection(db, "users"),
    where("role", "in", ["collaborator", "admin"])
  );
  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ uid: d.id, ...d.data() }) as UserProfile
  );
}

// ----- イベント共同運営者 -----

export async function getEventCollaborators(
  eventId: string
): Promise<EventCollaborator[]> {
  const q = query(
    collection(db, "event_collaborators"),
    where("eventId", "==", eventId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as EventCollaborator
  );
}

export async function addEventCollaborator(
  eventId: string,
  userId: string
): Promise<void> {
  await addDoc(collection(db, "event_collaborators"), { eventId, userId });
}

export async function removeEventCollaborator(
  docId: string
): Promise<void> {
  await deleteDoc(doc(db, "event_collaborators", docId));
}

// ----- イベント参加 -----

export async function getEventParticipations(
  eventId: string
): Promise<EventParticipation[]> {
  const q = query(
    collection(db, "event_participations"),
    where("eventId", "==", eventId),
    where("status", "==", "attending")
  );
  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as EventParticipation
  );
}

export async function getUserParticipations(
  userId: string
): Promise<EventParticipation[]> {
  const q = query(
    collection(db, "event_participations"),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as EventParticipation
  );
}

export async function registerForEvent(
  eventId: string,
  userId: string,
  emailOptIn: boolean
): Promise<void> {
  await addDoc(collection(db, "event_participations"), {
    eventId,
    userId,
    status: "attending",
    registeredAt: Timestamp.now(),
    cancelledAt: null,
    emailOptIn,
  });
}

export async function cancelParticipation(
  participationId: string
): Promise<void> {
  await updateDoc(doc(db, "event_participations", participationId), {
    status: "cancelled",
    cancelledAt: Timestamp.now(),
  });
}
