import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  UserCredential,
} from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "./config";
import type { UserProfile, UserRole } from "@/types";

const googleProvider = new GoogleAuthProvider();

export async function registerWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle(): Promise<UserCredential> {
  return signInWithPopup(auth, googleProvider);
}

export async function logout(): Promise<void> {
  return signOut(auth);
}

export async function createUserProfile(
  uid: string,
  data: {
    username: string;
    mail: string;
    postalcode?: string;
    address?: string;
    role?: UserRole;
    photoURL?: string | null;
  }
): Promise<void> {
  const now = Timestamp.now();
  const profile: Omit<UserProfile, "uid"> & { uid: string } = {
    uid,
    role: data.role ?? "general",
    username: data.username,
    mail: data.mail,
    postalcode: data.postalcode ?? "",
    address: data.address ?? "",
    photoURL: data.photoURL ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(doc(db, "users", uid), profile);
}
