import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";

if (getApps().length === 0) initializeApp();
const db = getFirestore();

// status が attending → cancelled に変更された場合 → キャンセル通知メール
export const onParticipationUpdated = onDocumentUpdated(
  "event_participations/{participationId}",
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    // attending → cancelled の変更のみ処理
    if (before.status === "attending" && after.status === "cancelled") {
      const { eventId, userId } = after;

      const eventDoc = await db.collection("events").doc(eventId).get();
      const eventData = eventDoc.data();
      if (!eventData) return;

      const userDoc = await db.collection("users").doc(userId).get();
      const userData = userDoc.data();
      if (!userData) return;

      // 参加者にキャンセル確認メール
      if (after.emailOptIn && eventData.emailNotification) {
        await db.collection("mail").add({
          to: userData.mail,
          message: {
            subject: `【南砺市イベント】${eventData.name} の参加をキャンセルしました`,
            html: `
              <h2>参加キャンセル完了</h2>
              <p>${userData.username} 様</p>
              <p>${eventData.name} の参加がキャンセルされました。</p>
              <p>またのご参加をお待ちしております。</p>
            `,
          },
        });
      }

      // 主催者にキャンセル通知
      const organizerDoc = await db
        .collection("users")
        .doc(eventData.organizerUid)
        .get();
      const organizerData = organizerDoc.data();
      if (organizerData) {
        await db.collection("mail").add({
          to: organizerData.mail,
          message: {
            subject: `【南砺市イベント】${eventData.name} のキャンセル通知`,
            html: `
              <h2>キャンセル通知</h2>
              <p>${organizerData.username} 様</p>
              <p>${userData.username} 様が ${eventData.name} の参加をキャンセルしました。</p>
            `,
          },
        });
      }
    }
  }
);
