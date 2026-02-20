import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";

if (getApps().length === 0) initializeApp();
const db = getFirestore();

// event_participations に新規ドキュメント作成時 → 参加確認メール送信
export const handleParticipationCreated = onDocumentCreated(
  "event_participations/{participationId}",
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const { eventId, userId, emailOptIn } = data;
    if (!emailOptIn) return;

    // イベント情報を取得
    const eventDoc = await db.collection("events").doc(eventId).get();
    const eventData = eventDoc.data();
    if (!eventData || !eventData.emailNotification) return;

    // ユーザー情報を取得
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();
    if (!userData) return;

    // mail コレクションにドキュメント追加 → Trigger Email Extension が送信
    await db.collection("mail").add({
      to: userData.mail,
      message: {
        subject: `【南砺市イベント】${eventData.name} への参加登録が完了しました`,
        html: `
          <h2>参加登録完了</h2>
          <p>${userData.username} 様</p>
          <p>以下のイベントへの参加登録が完了しました。</p>
          <ul>
            <li><strong>イベント名:</strong> ${eventData.name}</li>
            <li><strong>開催場所:</strong> ${eventData.location || "未定"}</li>
            <li><strong>開始日時:</strong> ${eventData.startDate.toDate().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}</li>
          </ul>
          <p>当日のご参加をお待ちしております。</p>
        `,
      },
    });
  }
);
