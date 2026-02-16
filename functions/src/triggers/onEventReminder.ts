import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";

if (getApps().length === 0) initializeApp();
const db = getFirestore();

// 毎日 UTC 0:00 (JST 9:00) に実行 → 翌日開催イベントのリマインダー
export const sendEventReminders = onSchedule(
  { schedule: "0 0 * * *", timeZone: "Asia/Tokyo" },
  async () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 翌日の開始・終了を設定
    const startOfTomorrow = new Date(tomorrow);
    startOfTomorrow.setHours(0, 0, 0, 0);
    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    // 翌日開催のイベントを検索
    const eventsSnap = await db
      .collection("events")
      .where("startDate", ">=", Timestamp.fromDate(startOfTomorrow))
      .where("startDate", "<=", Timestamp.fromDate(endOfTomorrow))
      .where("emailNotification", "==", true)
      .get();

    for (const eventDoc of eventsSnap.docs) {
      const eventData = eventDoc.data();

      // 参加者を取得
      const participantsSnap = await db
        .collection("event_participations")
        .where("eventId", "==", eventDoc.id)
        .where("status", "==", "attending")
        .where("emailOptIn", "==", true)
        .get();

      for (const pDoc of participantsSnap.docs) {
        const pData = pDoc.data();
        const userDoc = await db.collection("users").doc(pData.userId).get();
        const userData = userDoc.data();
        if (!userData) continue;

        await db.collection("mail").add({
          to: userData.mail,
          message: {
            subject: `【リマインド】明日 ${eventData.name} が開催されます`,
            html: `
              <h2>イベントリマインダー</h2>
              <p>${userData.username} 様</p>
              <p>明日開催のイベントのリマインドです。</p>
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
    }
  }
);
