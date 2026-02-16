"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import ProfileForm from "./ProfileForm";
import ParticipationList from "./ParticipationList";

export default function MyPageContent() {
  return (
    <AuthGuard>
      <div className="space-y-12">
        <section>
          <h2 className="mb-4 text-xl font-bold">プロフィール</h2>
          <ProfileForm />
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">参加予定イベント</h2>
          <ParticipationList />
        </section>
      </div>
    </AuthGuard>
  );
}
