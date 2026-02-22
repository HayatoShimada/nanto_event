import { UserProfile } from "@/types";

interface UserModalProps {
    user: UserProfile;
    onClose: () => void;
}

export default function UserModal({ user, onClose }: UserModalProps) {
    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="w-full max-w-sm bg-white border-4 border-text-primary shadow-[8px_8px_0_0_rgba(51,51,51,1)] flex flex-col items-center relative overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header background */}
                <div className="w-full h-24 bg-main/10 border-b-2 border-text-primary absolute top-0 left-0 z-0"></div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center bg-white border-2 border-text-primary hover:bg-text-primary hover:text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* Avatar */}
                <div className="w-24 h-24 rounded-full border-4 border-text-primary overflow-hidden shadow-md relative z-10 mt-12 bg-white">
                    {user.photoURL ? (
                        <img src={user.photoURL} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-main/20 flex items-center justify-center text-main font-bold text-4xl">
                            {user.username[0]?.toUpperCase()}
                        </div>
                    )}
                </div>

                <div className="p-6 pt-4 flex flex-col items-center w-full z-10 bg-white">
                    <h2 className="text-2xl font-bold mb-1 text-center truncate w-full">{user.username}</h2>
                    <span className="text-xs font-bold text-main border border-main px-2 py-0.5 mb-4">{user.role.toUpperCase()}</span>

                    {user.snsAccounts && user.snsAccounts.length > 0 ? (
                        <div className="w-full flex justify-center gap-3">
                            {user.snsAccounts.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-bg-sub border-2 border-text-primary hover:bg-main hover:text-white hover:-translate-y-1 transition-all shadow-[2px_2px_0_0_rgba(51,51,51,1)]">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" /></svg>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-text-secondary">SNSアカウントは登録されていません。</p>
                    )}
                </div>
            </div>
        </div>
    );
}
