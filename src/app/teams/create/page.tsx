"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createTeam, updateTeam } from "@/lib/firebase/firestore";
import { uploadTeamImage } from "@/lib/firebase/storage";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { USER_TAGS } from "@/constants/tags";
import Link from "next/link";

const schema = z.object({
    name: z.string().min(1, "チーム名は必須です"),
    description: z.string().min(1, "説明文は必須です"),
    sns1: z.string().optional(),
    sns2: z.string().optional(),
    sns3: z.string().optional(),
    interests: z.array(z.string()).optional(),
    transmissions: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

export default function CreateTeamPage() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { user } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        if (!user) {
            alert("ログインしてください");
            router.push("/login");
            return;
        }

        setIsSubmitting(true);
        try {
            const snsAccounts = [data.sns1, data.sns2, data.sns3].filter((s): s is string => !!s && s.trim() !== "");

            const teamId = await createTeam({
                name: data.name,
                description: data.description,
                members: [user.uid],
                imageURL: null,
                snsAccounts,
                interests: data.interests || [],
                transmissions: data.transmissions || [],
            });

            if (imageFile) {
                const imageURL = await uploadTeamImage(teamId, imageFile);
                await updateTeam(teamId, { imageURL });
            }

            alert("チームを作成しました");
            router.push("/mypage");
        } catch (error) {
            console.error("Failed to create team:", error);
            alert("チーム作成に失敗しました");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-dvh w-screen flex flex-col bg-bg-main overflow-hidden text-text-primary font-sans">
            <Header alwaysShowOnDesktop />

            <main className="flex-1 w-full flex items-center justify-center p-4 pt-[calc(4rem+env(safe-area-inset-top))] md:pt-24 pb-20 overflow-y-auto">
                <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md bg-white border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)] p-6 md:p-8 flex flex-col gap-6 relative my-8">

                    <h1 className="text-2xl font-bold tracking-widest text-center text-main border-b-2 border-main pb-2">CREATE TEAM</h1>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">TEAM NAME</label>
                        <input
                            {...register("name")}
                            type="text"
                            className="w-full border-2 border-text-primary p-2 focus:ring-2 focus:ring-main focus:outline-none"
                            placeholder="Ex: Nanto Event Team"
                        />
                        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">TEAM AVATAR</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                            }}
                            className="w-full border-2 border-text-primary p-2 bg-gray-50 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-bold file:bg-main file:text-white"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">PROFILE</label>
                        <textarea
                            {...register("description")}
                            className="w-full border-2 border-text-primary p-2 h-32 resize-none focus:ring-2 focus:ring-main focus:outline-none"
                            placeholder="Tell us about this team..."
                        />
                        {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold flex items-center gap-2">
                            SNS URL
                            <span className="text-[10px] bg-main text-white px-2 py-0.5 font-normal">Optional</span>
                        </label>
                        <input {...register("sns1")} type="url" placeholder="https://x.com/your_team" className="w-full border-2 border-text-primary p-2 focus:ring-2 focus:ring-main focus:outline-none" />
                        <input {...register("sns2")} type="url" placeholder="https://instagram.com/your_team" className="w-full border-2 border-text-primary p-2 focus:ring-2 focus:ring-main focus:outline-none" />
                        <input {...register("sns3")} type="url" placeholder="https://facebook.com/your_team" className="w-full border-2 border-text-primary p-2 focus:ring-2 focus:ring-main focus:outline-none" />
                    </div>

                    {/* Interests */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">興味のあること (複数選択可)</label>
                        <div className="flex flex-wrap gap-2">
                            {USER_TAGS.map((tag) => (
                                <label key={`interest-${tag}`} className="flex items-center gap-1 text-sm bg-bg-sub/30 px-2 py-1 border border-text-primary/20 rounded cursor-pointer hover:bg-main/10 transition-colors">
                                    <input type="checkbox" value={tag} {...register("interests")} className="accent-main" />
                                    {tag}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Transmissions */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">発信したいこと (複数選択可)</label>
                        <div className="flex flex-wrap gap-2">
                            {USER_TAGS.map((tag) => (
                                <label key={`transmission-${tag}`} className="flex items-center gap-1 text-sm bg-bg-sub/30 px-2 py-1 border border-text-primary/20 rounded cursor-pointer hover:bg-main/10 transition-colors">
                                    <input type="checkbox" value={tag} {...register("transmissions")} className="accent-main" />
                                    {tag}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 mt-4">
                        <Link href="/mypage" className="flex-1 py-3 text-center border-2 border-text-primary font-bold hover:bg-gray-100 transition-colors flex items-center justify-center">
                            CANCEL
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-main text-white font-bold py-3 border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(51,51,51,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "CREATING..." : "CREATE"}
                        </button>
                    </div>

                </form>
            </main>
        </div>
    );
}
