"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getCollaborators } from "@/lib/firebase/firestore";
import type { UserProfile } from "@/types";

export default function CollaboratorsList() {
  const [collaborators, setCollaborators] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCollaborators()
      .then(setCollaborators)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">読み込み中...</p>;

  if (collaborators.length === 0) {
    return <p className="text-gray-500">共同運営者はまだ登録されていません</p>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {collaborators.map((c) => (
        <div
          key={c.uid}
          className="flex items-center gap-4 rounded-lg border border-gray-200 p-4"
        >
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
            {c.photoURL ? (
              <Image
                src={c.photoURL}
                alt={c.username}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-medium text-gray-400">
                {c.username.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="font-medium">{c.username}</p>
            <p className="text-sm text-gray-500">{c.role}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
