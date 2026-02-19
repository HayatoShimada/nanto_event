import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage";
import { storage } from "./config";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function validateFile(file: File): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("ファイルサイズは5MB以下にしてください");
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("JPEG、PNG、WebP形式の画像のみアップロードできます");
  }
}

function getExtension(file: File): string {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts.pop()! : "jpg";
}

// ----- イベントイメージ画像 -----

export async function uploadEventImage(
  eventId: string,
  file: File
): Promise<string> {
  validateFile(file);
  const ext = getExtension(file);
  const storageRef = ref(storage, `events/${eventId}/image.${ext}`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

export async function deleteEventImage(eventId: string): Promise<void> {
  const folderRef = ref(storage, `events/${eventId}`);
  const list = await listAll(folderRef);
  await Promise.all(list.items.map((item) => deleteObject(item)));
}

// ----- ユーザーアバター画像 -----

export async function uploadUserAvatar(
  uid: string,
  file: File
): Promise<string> {
  validateFile(file);
  const ext = getExtension(file);
  const storageRef = ref(storage, `users/${uid}/avatar.${ext}`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

export async function deleteUserAvatar(uid: string): Promise<void> {
  const folderRef = ref(storage, `users/${uid}`);
  const list = await listAll(folderRef);
  await Promise.all(list.items.map((item) => deleteObject(item)));
}

// ----- ニュースサムネイル画像 -----

export async function uploadNewsThumbnail(
  newsId: string,
  file: File
): Promise<string> {
  validateFile(file);
  const ext = getExtension(file);
  const storageRef = ref(storage, `news/${newsId}/thumbnail.${ext}`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

export async function deleteNewsThumbnail(newsId: string): Promise<void> {
  const folderRef = ref(storage, `news/${newsId}`);
  const list = await listAll(folderRef);
  await Promise.all(list.items.map((item) => deleteObject(item)));
}
