import { Timestamp } from "firebase/firestore";

// ユーザーロール
export type UserRole = "general" | "auth";

// イベントカテゴリ
export type EventCategory =
  | "festival"
  | "workshop"
  | "concert"
  | "sports"
  | "community"
  | "other";

// Firestore users コレクション
export interface UserProfile {
  uid: string;
  role: UserRole;
  username: string;
  mail: string;
  postalcode: string;
  address: string;
  photoURL: string | null;
  snsAccounts?: string[]; // 最大3つまで
  noteUrl?: string; // RSS取得用
  interests?: string[]; // 興味のあること
  transmissions?: string[]; // 発信したいこと
  followingUsers?: string[]; // フォローしているユーザー (UID)
  defaultTags?: string[]; // デフォルトで表示・選択するタグ
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Firestore events コレクション
export interface Event {
  id: string;
  name: string;
  description: string; // HTML形式（Tiptapで編集）
  location: string;
  imageURL: string | null;
  categories: EventCategory[];
  tags?: string[]; // 最大2つ
  startDate: Timestamp;
  finishDate: Timestamp;
  organizerUid: string;
  organizerType?: "user" | "team"; // 主催者タイプ
  emailNotification: boolean;
  recruitmentUrl?: string; // 外部募集用URL
  participationClicks?: number; // 参加ボタンクリック数
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Firestore news コレクション
export interface News {
  id: string;
  title: string;
  content: string;
  publishedAt: Timestamp;
  thumbnailURL: string | null;
  authorId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Firestore teams コレクション
export interface Team {
  id: string;
  name: string;
  description: string;
  members: string[]; // User IDs
  imageURL: string | null;
  snsAccounts?: string[];
  interests?: string[];
  transmissions?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Firestore event_collaborators コレクション
export interface EventCollaborator {
  id: string;
  eventId: string;
  userId: string;
}

// 参加ステータス
export type ParticipationStatus = "attending" | "cancelled";

// Firestore event_participations コレクション
export interface EventParticipation {
  id: string;
  eventId: string;
  userId: string;
  status: ParticipationStatus;
  registeredAt: Timestamp;
  cancelledAt: Timestamp | null;
  emailOptIn: boolean;
}
