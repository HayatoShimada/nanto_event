import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps } from "firebase-admin/app";

if (getApps().length === 0) initializeApp();

// users コレクションの role が変更された時 → Custom Claims を更新
export const onUserRoleUpdated = onDocumentUpdated(
  "users/{userId}",
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    if (before.role !== after.role) {
      await getAuth().setCustomUserClaims(event.params.userId, {
        role: after.role,
      });
    }
  }
);
