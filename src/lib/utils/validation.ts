import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
  username: z.string().min(1, "ユーザー名を入力してください"),
  postalcode: z
    .string()
    .regex(/^\d{3}-?\d{4}$/, "郵便番号の形式が正しくありません（例: 123-4567）"),
  address: z.string().min(1, "住所を入力してください"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const eventSchema = z
  .object({
    name: z.string().min(1, "イベント名を入力してください"),
    description: z.string().min(1, "説明を入力してください"),
    location: z.string().min(1, "開催場所を入力してください"),
    categories: z
      .array(z.string())
      .min(1, "カテゴリを1つ以上選択してください"),
    startDate: z.string().min(1, "開始日時を入力してください"),
    finishDate: z.string().min(1, "終了日時を入力してください"),
    emailNotification: z.boolean(),
  })
  .refine(
    (data) => new Date(data.finishDate) > new Date(data.startDate),
    {
      message: "終了日時は開始日時より後に設定してください",
      path: ["finishDate"],
    }
  );

export type EventFormData = z.infer<typeof eventSchema>;

export const contactSchema = z.object({
  name: z.string().min(1, "お名前を入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  message: z.string().min(10, "メッセージは10文字以上で入力してください"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
