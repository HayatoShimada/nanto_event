"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { getOrganizedEvents, getUpcomingEvents, incrementParticipationClick, getUserTeams, getUsersByUids } from "@/lib/firebase/firestore";
import type { Event as EventType, Team as TeamType, UserProfile } from "@/types";
import { format } from "date-fns";
import UserModal from "@/components/UserModal";

export default function MyPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [organizedEvents, setOrganizedEvents] = useState<EventType[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [ongoingEvents, setOngoingEvents] = useState<EventType[]>([]);
  const [loadingOngoing, setLoadingOngoing] = useState(true);
  const [teams, setTeams] = useState<TeamType[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [followingUsersProfiles, setFollowingUsersProfiles] = useState<UserProfile[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && user && profile) {
      getOrganizedEvents(user.uid).then(events => {
        setOrganizedEvents(events);
        setLoadingEvents(false);
      }).catch(err => {
        console.error("Failed to load organized events:", err);
        setLoadingEvents(false);
      });

      getUpcomingEvents(5).then(events => {
        setOngoingEvents(events);
        setLoadingOngoing(false);
      }).catch(err => {
        console.error("Failed to load ongoing events:", err);
        setLoadingOngoing(false);
      });

      getUserTeams(user.uid).then(teamsData => {
        setTeams(teamsData);
        setLoadingTeams(false);
      }).catch(err => {
        console.error("Failed to load teams:", err);
        setLoadingTeams(false);
      });

      if (profile.followingUsers && profile.followingUsers.length > 0) {
        getUsersByUids(profile.followingUsers).then(usersData => {
          setFollowingUsersProfiles(usersData);
          setLoadingFollowing(false);
        }).catch(err => {
          console.error("Failed to load following users:", err);
          setLoadingFollowing(false);
        });
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoadingFollowing(false);
      }
    }
  }, [user, profile, loading, router]);

  if (loading || !profile) {
    return (
      <div className="h-dvh w-full flex items-center justify-center bg-bg-main">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-main" />
      </div>
    );
  }

  return (
    <div className="h-dvh w-screen flex flex-col bg-bg-main overflow-hidden text-text-primary font-sans">
      <Header />

      <main className="flex-1 w-full flex flex-col md:flex-row items-center md:items-start md:justify-center p-4 py-8 pt-[calc(5rem+env(safe-area-inset-top))] gap-8 overflow-y-auto">
        <div className="flex flex-col gap-8 w-full max-w-md shrink-0 mt-4 md:mt-0">
          {/* Profile Card */}
          <div className="w-full bg-white border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)] p-8 flex flex-col items-center relative">

            {/* Avatar */}
            <div className="w-24 h-24 rounded-full border-2 border-text-primary overflow-hidden mb-6 shadow-md relative">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-main/20 flex items-center justify-center text-main font-bold text-3xl">
                  {profile.username[0]?.toUpperCase()}
                </div>
              )}
            </div>

            <h1 className="text-2xl font-bold mb-2 tracking-widest">{profile.username}</h1>
            <p className="text-text-secondary text-sm mb-6">{profile.mail}</p>

            <div className="w-full space-y-4 mb-8">
              <div className="border-b border-text-primary/20 pb-2">
                <span className="text-xs font-bold text-main block mb-1">ROLE</span>
                <span className="text-sm">{profile.role.toUpperCase()}</span>
              </div>
              <div className="border-b border-text-primary/20 pb-2">
                <span className="text-xs font-bold text-main block mb-1">POSTAL CODE</span>
                <span className="text-sm">{profile.postalcode || "未登録"}</span>
              </div>
              <div className="border-b border-text-primary/20 pb-2">
                <span className="text-xs font-bold text-main block mb-1">ADDRESS</span>
                <span className="text-sm">{profile.address || "未登録"}</span>
              </div>
              {profile.snsAccounts && profile.snsAccounts.length > 0 && (
                <div className="border-b border-text-primary/20 pb-2">
                  <span className="text-xs font-bold text-main block mb-1">SNS ACCOUNTS</span>
                  <div className="flex flex-col gap-1">
                    {profile.snsAccounts.map((url, index) => (
                      <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                        {url}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/mypage/edit" className="w-full bg-main text-white font-bold py-3 text-center border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(51,51,51,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all">
              EDIT PROFILE
            </Link>

            <div className="w-full flex justify-center mt-4">
              <Link href="/events/create" className="w-full bg-white text-main font-bold py-2 text-sm text-center border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] hover:shadow-[2px_2px_0_0_rgba(51,51,51,1)] active:shadow-none transition-all">
                CREATE EVENT
              </Link>
            </div>

            <Link href="/" className="mt-6 text-sm font-bold text-text-secondary hover:text-main transition-colors border-b border-transparent hover:border-main">
              BACK TO HOME
            </Link>

          </div>

          {/* Organizer Dashboard */}
          <div className="w-full max-w-md bg-white border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)] p-6 md:p-8 flex flex-col relative">
            <h2 className="text-xl font-bold mb-4 tracking-widest text-main border-b-2 border-main pb-2">YOUR EVENTS</h2>

            {loadingEvents ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-main" />
              </div>
            ) : organizedEvents.length > 0 ? (
              <div className="flex flex-col gap-4">
                {organizedEvents.map(event => (
                  <div key={event.id} className="border-2 border-text-primary p-4 flex flex-col gap-2 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm leading-tight text-text-primary">{event.name}</h3>
                      <span className="text-[10px] items-center px-2 py-0.5 font-bold bg-main/10 text-main border border-main shrink-0">
                        {event.startDate ? format(event.startDate.toDate(), "yyyy.MM.dd") : ""}
                      </span>
                    </div>

                    <div className="flex justify-between items-end mt-2">
                      <div className="flex gap-4 text-xs font-bold text-text-secondary">
                        <span className="flex items-center gap-1">🖱️ <span className="text-main font-mono">{event.participationClicks || 0}</span></span>
                      </div>
                      <Link href={`/events/edit?id=${event.id}`} className="text-sm bg-text-primary text-white px-5 py-2 font-bold hover:opacity-80 transition-all active:scale-95 flex items-center justify-center shrink-0 shadow-[2px_2px_0_0_rgba(51,51,51,1)]">
                        EDIT
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm font-bold text-text-secondary bg-gray-50 border-2 border-dashed border-gray-300">
                まだ主催イベントがありません。
              </div>
            )}
          </div>

          {/* Teams Dashboard */}
          <div className="w-full max-w-md bg-white border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)] p-6 md:p-8 flex flex-col relative">
            <h2 className="text-xl font-bold mb-4 tracking-widest text-main border-b-2 border-main pb-2">YOUR TEAMS</h2>

            {loadingTeams ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-main" />
              </div>
            ) : teams.length > 0 ? (
              <div className="flex flex-col gap-4">
                {teams.map(team => (
                  <div key={team.id} className="border-2 border-text-primary p-4 flex flex-col gap-2 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm leading-tight text-text-primary">{team.name}</h3>
                      <Link href={`/teams/${team.id}`} className="text-[10px] items-center px-2 py-0.5 font-bold bg-main/10 text-main border border-main shrink-0">
                        VIEW
                      </Link>
                    </div>
                    <div className="mt-2 text-right">
                      <Link href={`/teams/edit?id=${team.id}`} className="text-sm bg-text-primary text-white px-5 py-2 font-bold hover:opacity-80 transition-all active:scale-95 inline-block shadow-[2px_2px_0_0_rgba(51,51,51,1)]">
                        EDIT
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm font-bold text-text-secondary bg-gray-50 border-2 border-dashed border-gray-300">
                まだ所属チームがありません。
              </div>
            )}

            <Link href="/teams/create" className="mt-6 w-full bg-white text-main font-bold py-2 text-sm text-center border-2 border-text-primary shadow-[4px_4px_0_0_rgba(51,51,51,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] hover:shadow-[2px_2px_0_0_rgba(51,51,51,1)] active:shadow-none transition-all">
              CREATE TEAM
            </Link>
          </div>

          {/* Following Dashboard */}
          <div className="w-full max-w-md bg-white border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)] p-6 md:p-8 flex flex-col relative">
            <h2 className="text-xl font-bold mb-4 tracking-widest text-main border-b-2 border-main pb-2">FOLLOWING USERS</h2>

            {loadingFollowing ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-main" />
              </div>
            ) : followingUsersProfiles.length > 0 ? (
              <div className="flex flex-col gap-4">
                {followingUsersProfiles.map(u => (
                  <div key={u.uid} onClick={() => setSelectedUser(u)} className="cursor-pointer border-2 border-text-primary p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    {u.photoURL ? (
                      <img src={u.photoURL} alt={u.username} className="w-12 h-12 rounded-full border border-text-primary object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full border border-text-primary bg-main/20 flex flex-col items-center justify-center text-main font-bold">
                        {u.username[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm leading-tight text-text-primary truncate">{u.username}</h3>
                      <p className="text-[10px] text-text-secondary mt-1">{u.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm font-bold text-text-secondary bg-gray-50 border-2 border-dashed border-gray-300">
                フォローしているユーザーはいません。
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-8 w-full max-w-md shrink-0">
          {/* Ongoing Events */}
          <div className="w-full bg-white border-2 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)] p-6 md:p-8 flex flex-col relative">
            <h2 className="text-xl font-bold mb-4 tracking-widest text-main border-b-2 border-main pb-2">ONGOING EVENTS</h2>

            {loadingOngoing ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-main" />
              </div>
            ) : ongoingEvents.length > 0 ? (
              <div className="flex flex-col gap-4">
                {ongoingEvents.map(event => (
                  <button
                    key={event.id}
                    onClick={() => {
                      if (event.id) {
                        requestAnimationFrame(() => incrementParticipationClick(event.id!).catch(console.error));
                      }
                      if (event.recruitmentUrl) {
                        window.open(event.recruitmentUrl, "_blank", "noopener,noreferrer");
                      } else {
                        alert("募集ページが設定されていません。");
                      }
                    }}
                    className="text-left border-2 border-text-primary p-4 flex flex-col gap-2 hover:bg-gray-50 transition-colors cursor-pointer group w-full"
                  >
                    <div className="flex justify-between items-start w-full">
                      <h3 className="font-bold text-sm leading-tight text-text-primary group-hover:text-main transition-colors flex-1 pr-2">{event.name}</h3>
                      <span className="text-[10px] items-center px-2 py-0.5 font-bold bg-main/10 text-main border border-main shrink-0">
                        {event.startDate ? format(event.startDate.toDate(), "yyyy.MM.dd") : ""}
                      </span>
                    </div>
                    <div className="mt-2 text-right w-full">
                      <span className="text-xs font-bold text-main border-2 border-main px-3 py-1 group-hover:bg-main group-hover:text-white transition-all inline-block active:scale-95">JOIN</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm font-bold text-text-secondary bg-gray-50 border-2 border-dashed border-gray-300">
                ただいま開催・募集中のイベントはありません。
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedUser && (
        <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}
