"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/utils/validation";
import { registerWithEmail, createUserProfile } from "@/lib/firebase/auth";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    setError("");
    try {
      const credential = await registerWithEmail(data.email, data.password);
      await createUserProfile(credential.user.uid, {
        username: data.username,
        mail: data.email,
        postalcode: data.postalcode,
        address: data.address,
      });
      router.push("/");
    } catch {
      setError("登録に失敗しました。メールアドレスが既に使用されている可能性があります。");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-md space-y-4"
    >
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
        {errors.username && (
          <p className="mt-1 text-sm text-red-600">
            {errors.username.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          パスワード
        </label>
        <input
          id="password"
          type="password"
          {...register("password")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="postalcode" className="block text-sm font-medium">
          郵便番号
        </label>
        <input
          id="postalcode"
          type="text"
          placeholder="123-4567"
          {...register("postalcode")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {errors.postalcode && (
          <p className="mt-1 text-sm text-red-600">
            {errors.postalcode.message}
          </p>
        )}
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
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-dark disabled:opacity-50"
      >
        {isSubmitting ? "登録中..." : "新規登録"}
      </button>
    </form>
  );
}
