import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Crown, ArrowLeft, Skull, Swords } from 'lucide-react';
import { userService } from '../services/userService';
import CountUp from './react-bits/CountUp.tsx';
import { getIconComponent, getColorTheme } from "@/lib/gameConfig.ts";
import PlayerProfile from './PlayerProfile';
import { useSpatialNav } from '@/hooks/useSpatialNav';
import { useAction } from '@/hooks/useAction';
import { cn } from '@/lib/utils';

const calcWinRate = (user) =>
    user.matchesPlayed > 0 ? Math.round((user.wins / user.matchesPlayed) * 100) : 0;

function ChampionCard({ user, onClick }) {
    const theme = getColorTheme(user.color);
    const wr = calcWinRate(user);

    return (
        <div
            onClick={onClick}
            data-nav="true"
            data-nav-group="hof"
            tabIndex={0}
            className="relative w-full cursor-pointer group mb-5 mt-6"
        >
            {/* Crown badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-amber-400 text-black font-black text-[11px] px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-amber-500/40">
                <Crown size={11} fill="currentColor" /> Champion
            </div>

            {/* Card */}
            <div className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-black/55 backdrop-blur-xl transition-all duration-300 hover:border-amber-400/40 hover:shadow-[0_0_60px_rgba(251,191,36,0.12)]">
                {/* Player color tint */}
                <div className={cn("absolute inset-0 opacity-[0.04]", theme.bg)} />
                {/* Top shimmer */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 p-8 pt-10">
                    {/* Avatar */}
                    <div className={cn(
                        "w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0",
                        "bg-black/60 border-2 border-amber-400/25",
                        "shadow-[0_0_30px_rgba(251,191,36,0.15)] group-hover:shadow-[0_0_50px_rgba(251,191,36,0.25)] transition-shadow duration-300"
                    )}>
                        {React.createElement(getIconComponent(user.icon), { size: 48, className: theme.text, strokeWidth: 1.5 })}
                    </div>

                    {/* Identity */}
                    <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-5xl font-black italic tracking-tighter text-amber-300 leading-none">
                            {user.name}
                        </h2>
                        <p className="text-sm font-mono text-white/30 mt-2 uppercase tracking-widest">
                            "{user.funNickname || 'The Unknown'}"
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-black text-amber-300 leading-none">
                                <CountUp to={user.wins} duration={1.5} />
                            </div>
                            <div className="text-[10px] uppercase tracking-widest text-white/30 mt-1.5 flex items-center gap-1 justify-center">
                                <Trophy size={9} /> Wins
                            </div>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="text-center">
                            <div className="text-4xl font-black text-white/60 leading-none">
                                <CountUp to={user.matchesPlayed || 0} duration={1.2} />
                            </div>
                            <div className="text-[10px] uppercase tracking-widest text-white/30 mt-1.5 flex items-center gap-1 justify-center">
                                <Swords size={9} /> Played
                            </div>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="text-center">
                            <div className={cn("text-4xl font-black leading-none", wr >= 50 ? "text-green-400" : "text-red-400")}>
                                <CountUp to={wr} duration={1.4} />%
                            </div>
                            <div className="text-[10px] uppercase tracking-widest text-white/30 mt-1.5">Win Rate</div>
                        </div>
                    </div>
                </div>

                {/* Bottom shimmer */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
            </div>
        </div>
    );
}

function PodiumCard({ user, rank, onClick }) {
    const theme = getColorTheme(user.color);
    const wr = calcWinRate(user);
    const isSecond = rank === 2;

    const style = isSecond ? {
        badge: "bg-slate-200 text-slate-900",
        border: "border-white/15",
        shimmer: "via-white/20",
        accent: "text-slate-200",
        hover: "hover:border-white/25 hover:shadow-[0_0_40px_rgba(255,255,255,0.06)]",
        avatarBorder: "border-white/15",
    } : {
        badge: "bg-orange-500 text-white",
        border: "border-orange-500/20",
        shimmer: "via-orange-500/25",
        accent: "text-orange-200",
        hover: "hover:border-orange-500/35 hover:shadow-[0_0_40px_rgba(249,115,22,0.10)]",
        avatarBorder: "border-orange-500/20",
    };

    return (
        <div
            onClick={onClick}
            data-nav="true"
            data-nav-group="hof"
            tabIndex={0}
            className={cn(
                "relative overflow-hidden rounded-2xl border bg-black/50 backdrop-blur-xl p-6 cursor-pointer",
                "transition-all duration-300 hover:scale-[1.02]",
                style.border, style.hover
            )}
        >
            <div className={cn("absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent to-transparent", style.shimmer)} />
            <div className={cn("absolute inset-0 opacity-[0.03]", theme.bg)} />

            {/* Rank badge */}
            <div className={cn("absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-md", style.badge)}>
                {rank}
            </div>

            <div className="relative z-10 flex flex-col items-center text-center gap-4">
                {/* Avatar */}
                <div className={cn("w-16 h-16 rounded-xl flex items-center justify-center bg-black/50 border", style.avatarBorder)}>
                    {React.createElement(getIconComponent(user.icon), { size: 32, className: theme.text, strokeWidth: 1.5 })}
                </div>

                {/* Identity */}
                <div>
                    <h3 className={cn("text-2xl font-black italic tracking-tight leading-none", style.accent)}>
                        {user.name}
                    </h3>
                    <p className="text-[11px] font-mono text-white/25 mt-1">"{user.funNickname || 'The Unknown'}"</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-5">
                    <div className="text-center">
                        <div className={cn("text-2xl font-black leading-none", style.accent)}>
                            <CountUp to={user.wins} duration={1.3} />
                        </div>
                        <div className="text-[9px] uppercase tracking-widest text-white/20 mt-1">Wins</div>
                    </div>
                    <div className="w-px h-6 bg-white/10" />
                    <div className="text-center">
                        <div className="text-2xl font-black leading-none text-white/50">
                            <CountUp to={user.matchesPlayed || 0} duration={1.1} />
                        </div>
                        <div className="text-[9px] uppercase tracking-widest text-white/20 mt-1">Played</div>
                    </div>
                    <div className="w-px h-6 bg-white/10" />
                    <div className="text-center">
                        <div className={cn("text-2xl font-black leading-none", wr >= 50 ? "text-green-400" : "text-red-400")}>
                            <CountUp to={wr} duration={1.3} />%
                        </div>
                        <div className="text-[9px] uppercase tracking-widest text-white/20 mt-1">Win Rate</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RankRow({ user, rank, onClick }) {
    const theme = getColorTheme(user.color);
    const wr = calcWinRate(user);

    return (
        <div
            onClick={onClick}
            data-nav="true"
            data-nav-group="hof"
            tabIndex={0}
            className="flex items-center gap-4 px-5 py-3.5 rounded-xl bg-black/30 border border-white/5 hover:bg-black/50 hover:border-white/10 transition-all duration-200 cursor-pointer group"
        >
            <div className="w-7 text-center font-mono text-sm font-bold text-white/20 group-hover:text-white/40 flex-shrink-0">
                {rank}
            </div>

            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-black/40 border border-white/5 flex-shrink-0">
                {React.createElement(getIconComponent(user.icon), { size: 18, className: theme.text, strokeWidth: 1.5 })}
            </div>

            <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-white/70 truncate group-hover:text-white/90 transition-colors">{user.name}</div>
                <div className="text-[10px] font-mono text-white/20 italic">"{user.funNickname || 'The Unknown'}"</div>
            </div>

            <div className="flex items-center gap-5 flex-shrink-0">
                <div className="text-center">
                    <div className="text-base font-black text-white/60 leading-none">
                        <CountUp to={user.wins} duration={1.0} />
                    </div>
                    <div className="text-[8px] uppercase text-white/20 tracking-wider mt-0.5">Wins</div>
                </div>
                <div className="text-center hidden sm:block">
                    <div className="text-base font-black text-white/40 leading-none">
                        <CountUp to={user.matchesPlayed || 0} duration={1.0} />
                    </div>
                    <div className="text-[8px] uppercase text-white/20 tracking-wider mt-0.5">Played</div>
                </div>
                <div className="text-center">
                    <div className={cn("text-base font-black leading-none", wr >= 50 ? "text-green-400/80" : "text-red-400/70")}>
                        <CountUp to={wr} duration={1.0} />%
                    </div>
                    <div className="text-[8px] uppercase text-white/20 tracking-wider mt-0.5">W/R</div>
                </div>
            </div>
        </div>
    );
}

const HallOfFame = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState(null);

    useSpatialNav('hof');
    useAction('confirm', () => document.activeElement?.click(), []);
    useAction('back', () => selectedUserId ? setSelectedUserId(null) : navigate('/'), [selectedUserId]);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const data = await userService.getAll();
                const sorted = data.sort((a, b) => b.wins - a.wins);
                setUsers(sorted);
            } catch (err) {
                console.error("Failed to load users", err);
            } finally {
                setLoading(false);
            }
        };
        loadUsers();
    }, []);

    const [champion, silver, bronze, ...rest] = users;

    return (
        <div className="min-h-screen text-white p-4 md:p-8 flex flex-col items-center font-sans pb-24">

            {/* Header */}
            <div className="w-full max-w-3xl flex items-center justify-between pt-4 mb-2">
                <button
                    onClick={() => navigate('/')}
                    data-nav="true"
                    data-nav-group="hof"
                    tabIndex={0}
                    className="p-2.5 rounded-full hover:bg-white/10 text-white/30 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="text-center">
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700">
                        HALL OF FAME
                    </h1>
                    <p className="text-white/20 font-mono text-[10px] uppercase tracking-[0.5em] mt-2">
                        Legends never die
                    </p>
                </div>

                <div className="w-10" />
            </div>

            {/* Content */}
            <div className="w-full max-w-3xl">
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <div className="w-10 h-10 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 opacity-40">
                        <Skull size={48} className="text-white/30" />
                        <p className="text-lg font-bold text-white/40">No warriors found.</p>
                        <p className="text-sm text-white/25">Be the first to enter the arena.</p>
                    </div>
                ) : (
                    <>
                        {/* Champion */}
                        {champion && (
                            <ChampionCard user={champion} onClick={() => setSelectedUserId(champion._id)} />
                        )}

                        {/* Podium: 2nd & 3rd */}
                        {(silver || bronze) && (
                            <div className={cn("grid gap-4 mb-5", silver && bronze ? "grid-cols-2" : "grid-cols-1")}>
                                {silver && <PodiumCard user={silver} rank={2} onClick={() => setSelectedUserId(silver._id)} />}
                                {bronze && <PodiumCard user={bronze} rank={3} onClick={() => setSelectedUserId(bronze._id)} />}
                            </div>
                        )}

                        {/* 4th onwards */}
                        {rest.length > 0 && (
                            <div className="space-y-1.5">
                                {rest.map((user, i) => (
                                    <RankRow
                                        key={user._id}
                                        user={user}
                                        rank={i + 4}
                                        onClick={() => setSelectedUserId(user._id)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {selectedUserId && (
                <PlayerProfile
                    userId={selectedUserId}
                    isOpen={!!selectedUserId}
                    onClose={() => setSelectedUserId(null)}
                />
            )}
        </div>
    );
};

export default HallOfFame;
