"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserRoleUpdated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const auth_1 = require("firebase-admin/auth");
const app_1 = require("firebase-admin/app");
if ((0, app_1.getApps)().length === 0)
    (0, app_1.initializeApp)();
// users コレクションの role が変更された時 → Custom Claims を更新
exports.onUserRoleUpdated = (0, firestore_1.onDocumentUpdated)("users/{userId}", async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after)
        return;
    if (before.role !== after.role) {
        await (0, auth_1.getAuth)().setCustomUserClaims(event.params.userId, {
            role: after.role,
        });
    }
});
//# sourceMappingURL=onUserRoleUpdate.js.map