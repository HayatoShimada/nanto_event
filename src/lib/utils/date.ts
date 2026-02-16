import { Timestamp } from "firebase/firestore";
import { format, formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export function timestampToDate(timestamp: Timestamp): Date {
  return timestamp.toDate();
}

export function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

export function formatDate(timestamp: Timestamp): string {
  return format(timestamp.toDate(), "yyyy年M月d日", { locale: ja });
}

export function formatDateTime(timestamp: Timestamp): string {
  return format(timestamp.toDate(), "yyyy年M月d日 HH:mm", { locale: ja });
}

export function formatRelative(timestamp: Timestamp): string {
  return formatDistanceToNow(timestamp.toDate(), {
    addSuffix: true,
    locale: ja,
  });
}
