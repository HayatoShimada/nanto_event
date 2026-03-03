"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { getTeam, updateTeam, deleteTeam } from "@/lib/firebase/firestore";
import { uploadTeamImage, deleteTeamImage } from "@/lib/firebase/storage";
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

export default function EditTeamClient() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [currentImageURL, setCurrentImageURL] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const { user } = useAuth();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        async function loadData() {
            if (!id) return;
            const teamData = await getTeam(id);

            if (!teamData) {
                alert("Team not found");
                router.push("/mypage");
                return;
            }

            if (user && !teamData.members.includes(user.uid)) {
                alert("権限がありません");
                router.push("/mypage");
                return;
            }

            setValue("name", teamData.name);
            setValue("description", teamData.description);
            setValue("sns1", teamData.snsAccounts?.[0] || "");
            setValue("sns2", teamData.snsAccounts?.[1] || "");
            setValue("sns3", teamData.snsAccounts?.[2] || "");
            setValue("interests", teamData.interests || []);
            setValue("transmissions", teamData.transmissions || []);

            setCurrentImageURL(teamData.imageURL || null);
            setLoading(false);
        }
        loadData();
    }, [id, router, setValue, user]);

    const onSubmit = async (data: FormData) => {
        if (!user || !id) return;

        setIsSubmitting(true);
        try {
            let imageURL = currentImageURL;
            if (imageFile) {
                imageURL = await uploadTeamImage(id, imageFile);
            }

            const snsAccounts = [data.sns1, data.sns2, data.sns3].filter((s): s is string => !!s && s.trim() !== "");

            await updateTeam(id, {
                name: data.name,
                description: data.description,
                snsAccounts,
                interests: data.interests || [],
                transmissions: data.transmissions || [],
                imageURL,
            });

            alert("チームを更新しました");
            router.push("/mypage");
        } catch (error) {
            console.error("Failed to update team:", error);
            alert("チーム更新に失敗しました");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!id || !confirm("本当にこのチームを削除しますか？この操作は取り消せません。")) return;

        setIsSubmitting(true);
        try {
            if (currentImageURL) {
                await deleteTeamImage(id);
            }
            await deleteTeam(id);
            alert("チームを削除しました");
            router.push("/mypage");
        } catch (error) {
            console.error("Failed to delete team:", error);
            alert("削除に失敗しました");
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="h-dvh w-full flex items-center justify-center bg-bg-main">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-main" />
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-bg-main text-text-primary font-sans">
            <Header alwaysShowOnDesktop />

            <main className="max-w-3xl mx-auto p-4 pt-[calc(5rem+env(safe-area-inset-top))] pb-20">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Edit Team</h1>
                    <button
                        onClick={handleDelete}
                        disabled={isSubmitting}
                        className="text-red-500 font-bold border-2 border-red-500 px-4 py-2 hover:bg-red-50 transition-colors text-sm"
                    >
                        DELETE TEAM
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)]">

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">TEAM NAME</label>
                        <input
                            {...register("name")}
                            type="text"
                            className="w-full border-2 border-text-primary p-2 focus:ring-2 focus:ring-main focus:outline-none"
                        />
                        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">TEAM AVATAR</label>
                        {currentImageURL && (
                            <div className="mb-2 relative w-32 h-32 bg-gray-100 border-2 border-text-primary rounded-full overflow-hidden">
                                <img src={currentImageURL} alt="Current Avatar" className="w-full h-full object-cover" />
                            </div>
                        )}
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
                            {isSubmitting ? "SAVING..." : "SAVE CHANGES"}
                        </button>
                    </div>

                </form>
            </main>
        </div>
    );
}
