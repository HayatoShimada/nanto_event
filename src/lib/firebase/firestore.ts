import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  increment,
} from "firebase/firestore";
import { db } from "./config";
import type {
  Event,
  UserProfile,
  EventCollaborator,
  EventParticipation,
  News,
  Team,
} from "@/types";

// ----- イベント CRUD -----

export async function getEvents(): Promise<Event[]> {
  const q = query(
    collection(db, "events"),
    where("status", "==", "published"),
    orderBy("startDate", "asc")
  );
  const snap = await getDocs(q);
  const currentTime = Timestamp.now().toMillis();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Event)
    .filter(event => !event.publishedAt || event.publishedAt.toMillis() <= currentTime);
}

export async function getEvent(eventId: string): Promise<Event | null> {
  const snap = await getDoc(doc(db, "events", eventId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Event;
}

export async function getUpcomingEvents(limit = 6): Promise<Event[]> {
  const q = query(
    collection(db, "events"),
    where("status", "==", "published"),
    where("startDate", ">=", Timestamp.now()),
    orderBy("startDate", "asc"),
    firestoreLimit(limit * 2) // We query a bit more to accommodate client-side filtering
  );
  const snap = await getDocs(q);
  const currentTime = Timestamp.now().toMillis();
  const events = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Event)
    .filter(event => !event.publishedAt || event.publishedAt.toMillis() <= currentTime);

  return events.slice(0, limit);
}

export async function getOrganizedEvents(uid: string): Promise<Event[]> {
  const q = query(
    collection(db, "events"),
    where("organizerUid", "==", uid)
  );
  const snap = await getDocs(q);
  const events = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Event);

  // Sort descending by startDate in memory to avoid needing a composite index
  events.sort((a, b) => b.startDate.toMillis() - a.startDate.toMillis());

  return events;
}

export async function createEvent(
  data: Omit<Event, "id" | "createdAt" | "updatedAt" | "participationClicks" | "pageViews"> & { recruitmentUrl?: string }
): Promise<string> {
  const now = Timestamp.now();
  const ref = await addDoc(collection(db, "events"), {
    ...data,
    recruitmentUrl: data.recruitmentUrl || "",
    participationClicks: 0,
    pageViews: 0,
    status: data.status || "published",
    publishedAt: data.publishedAt || now,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function incrementParticipationClick(eventId: string): Promise<void> {
  await updateDoc(doc(db, "events", eventId), {
    participationClicks: increment(1)
  });
}

export async function incrementPageViews(eventId: string): Promise<void> {
  await updateDoc(doc(db, "events", eventId), {
    pageViews: increment(1)
  });
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

// ----- ニュース CRUD -----

export async function getNewsList(limit = 10): Promise<News[]> {
  const q = query(
    collection(db, "news"),
    orderBy("publishedAt", "desc"),
    firestoreLimit(limit)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as News);
}

export async function getNews(newsId: string): Promise<News | null> {
  const snap = await getDoc(doc(db, "news", newsId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as News;
}

export async function createNews(
  data: Omit<News, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const now = Timestamp.now();
  const ref = await addDoc(collection(db, "news"), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateNews(
  newsId: string,
  data: Partial<News>
): Promise<void> {
  await updateDoc(doc(db, "news", newsId), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteNews(newsId: string): Promise<void> {
  await deleteDoc(doc(db, "news", newsId));
}

// ----- ユーザー -----

export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() } as UserProfile;
}

export async function getUsersByUids(uids: string[]): Promise<UserProfile[]> {
  if (!uids || uids.length === 0) return [];
  // For simplicity and to avoid the 'in' query limit of 10, use Promise.all
  const promises = uids.map(uid => getDoc(doc(db, "users", uid)));
  const snaps = await Promise.all(promises);
  const users: UserProfile[] = [];
  snaps.forEach(snap => {
    if (snap.exists()) {
      users.push({ uid: snap.id, ...snap.data() } as UserProfile);
    }
  });
  return users;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  await setDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: Timestamp.now(),
  }, { merge: true });
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

// ----- チーム -----

export async function createTeam(
  data: Omit<Team, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const now = Timestamp.now();
  const ref = await addDoc(collection(db, "teams"), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateTeam(
  teamId: string,
  data: Partial<Team>
): Promise<void> {
  await updateDoc(doc(db, "teams", teamId), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteTeam(teamId: string): Promise<void> {
  await deleteDoc(doc(db, "teams", teamId));
}

export async function getTeam(teamId: string): Promise<Team | null> {
  const snap = await getDoc(doc(db, "teams", teamId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Team;
}

export async function getUserTeams(userId: string): Promise<Team[]> {
  const q = query(
    collection(db, "teams"),
    where("members", "array-contains", userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Team);
}
