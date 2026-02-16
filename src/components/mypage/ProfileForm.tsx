"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/lib/firebase/firestore";
import { uploadUserAvatar, deleteUserAvatar } from "@/lib/firebase/storage";
import ImageUploader from "@/components/ui/ImageUploader";

interface ProfileFormData {
  username: string;
  postalcode: string;
  address: string;
}

export default function ProfileForm() {
  const { user, profile } = useAuthContext();
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ProfileFormData>({
    defaultValues: {
      username: profile?.username ?? "",
      postalcode: profile?.postalcode ?? "",
      address: profile?.address ?? "",
    },
  });

  if (!user || !profile) return null;

  async function onSubmit(data: ProfileFormData) {
    setMessage("");
    await updateUserProfile(user!.uid, data);
    setMessage("プロフィールを更新しました");
  }

  async function handleAvatarUpload(file: File): Promise<string> {
    const url = await uploadUserAvatar(user!.uid, file);
    await updateUserProfile(user!.uid, { photoURL: url });
    return url;
  }

  async function handleAvatarDelete(): Promise<void> {
    await deleteUserAvatar(user!.uid);
    await updateUserProfile(user!.uid, { photoURL: null });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <ImageUploader
          currentImageURL={profile.photoURL}
          onUpload={handleAvatarUpload}
          onDelete={handleAvatarDelete}
          shape="circle"
        />
        <div>
          <p className="font-medium">{profile.username}</p>
          <p className="text-sm text-gray-500">{profile.mail}</p>
          <p className="text-xs text-gray-400">
            ロール: {profile.role}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium">
            ユーザー名
          </label>
          <input
            id="username"
            type="text"
            {...register("username")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="postalcode" className="block text-sm font-medium">
            郵便番号
          </label>
          <input
            id="postalcode"
            type="text"
            {...register("postalcode")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium">
            住所
          </label>
          <input
            id="address"
            type="text"
            {...register("address")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {message && <p className="text-sm text-green-600">{message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {isSubmitting ? "更新中..." : "プロフィールを更新"}
        </button>
      </form>
    </div>
  );
}
