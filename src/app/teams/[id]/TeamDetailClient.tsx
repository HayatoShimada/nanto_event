"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { getTeam, getUserProfile } from "@/lib/firebase/firestore";
import type { Team, UserProfile } from "@/types";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export async function generateStaticParams() {
    return [];
}

export default function TeamDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { user } = useAuth();

    const [team, setTeam] = useState<Team | null>(null);
    const [members, setMembers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTeam() {
            if (!id) return;
            try {
                const teamData = await getTeam(id);
                if (!teamData) {
                    alert("Team not found");
                    router.push("/");
                    return;
                }
                setTeam(teamData);

                const memberPromises = teamData.members.map((uid) => getUserProfile(uid));
                const memberProfiles = await Promise.all(memberPromises);
                setMembers(memberProfiles.filter((m): m is UserProfile => m !== null));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchTeam();
    }, [id, router]);

    if (loading) {
        return (
            <div className="h-dvh w-full flex items-center justify-center bg-bg-main">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-main" />
            </div>
        );
    }

    if (!team) return null;

    const isMember = user && team.members.includes(user.uid);

    return (
        <div className="min-h-dvh bg-bg-main text-text-primary font-sans flex flex-col">
            <Header />

            <main className="flex-1 max-w-4xl mx-auto w-full p-4 pt-[calc(5rem+env(safe-area-inset-top))] pb-20">
                <div className="bg-white border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)] overflow-hidden relative">

                    <div className="h-48 md:h-64 bg-main/10 relative border-b-2 border-text-primary">
                        {team.imageURL ? (
                            <img src={team.imageURL} alt={team.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-main/30 font-bold text-4xl tracking-widest border-b-2 border-transparent">
                                {team.name}
                            </div>
                        )}

                        {isMember && (
                            <Link href={`/teams/edit?id=${team.id}`} className="absolute top-4 right-4 bg-white border-2 border-text-primary px-4 py-2 font-bold text-xs shadow-[2px_2px_0_0_rgba(51,51,51,1)] hover:translate-x-px hover:translate-y-px active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all z-10">
                                EDIT TEAM
                            </Link>
                        )}
                    </div>

                    <div className="p-6 md:p-10 relative">
                        <h1 className="text-3xl md:text-5xl font-bold mb-4">{team.name}</h1>

                        <div className="flex flex-wrap gap-2 mb-8">
                            {team.interests?.map((tag) => (
                                <span key={`int-${tag}`} className="text-xs font-bold border border-text-primary px-3 py-1 bg-white shadow-[2px_2px_0_0_rgba(51,51,51,1)]">
                                    興味: {tag}
                                </span>
                            ))}
                            {team.transmissions?.map((tag) => (
                                <span key={`trn-${tag}`} className="text-xs font-bold border border-main text-main px-3 py-1 bg-white shadow-[2px_2px_0_0_rgba(242,128,191,1)]">
                                    発信: {tag}
                                </span>
                            ))}
                        </div>

                        <div className="mb-8">
                            <h2 className="text-xl font-bold border-b-2 border-text-primary pb-2 mb-4">PROFILE</h2>
                            <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed bg-gray-50 p-4 border border-text-primary">
                                {team.description}
                            </div>
                        </div>

                        {team.snsAccounts && team.snsAccounts.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-xl font-bold border-b-2 border-text-primary pb-2 mb-4">SNS LINKS</h2>
                                <div className="flex flex-wrap gap-4">
                                    {team.snsAccounts.map((url, i) => (
                                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline text-sm break-all font-bold">
                                            {url}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h2 className="text-xl font-bold border-b-2 border-text-primary pb-2 mb-4">MEMBERS</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {members.map(member => (
                                    <div key={member.uid} className="flex items-center gap-3 p-3 border-2 border-text-primary hover:bg-gray-50 transition-colors">
                                        <div className="w-10 h-10 rounded-full border border-text-primary overflow-hidden shrink-0">
                                            {member.photoURL ? (
                                                <img src={member.photoURL} alt={member.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-main/20 flex items-center justify-center text-main font-bold">
                                                    {member.username[0]?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-sm truncate">{member.username}</p>
                                            <p className="text-[10px] text-text-secondary truncate">{member.role.toUpperCase()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
