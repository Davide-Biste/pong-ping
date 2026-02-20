import React, { useEffect, useState } from 'react';
import { userService } from '@/services/userService';
import { getIconComponent, getColorTheme } from '@/lib/gameConfig';
import { cn } from '@/lib/utils';
import { Trophy, Flame, Skull, Target, History, Swords } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import CountUp from '@/components/react-bits/CountUp';

interface PlayerProfileProps {
    userId: number;
    isOpen: boolean;
    onClose: () => void;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ userId, isOpen, onClose }) => {
    const [stats, setStats] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && userId) {
            loadData();
        }
    }, [isOpen, userId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [statsData, allUsers] = await Promise.all([
                userService.getUserStatistics(userId),
                userService.getAll()
            ]);
            setStats(statsData);
            setUser(allUsers.find((u: any) => u._id === userId));
        } catch (err) {
            console.error("Failed to load profile", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const theme = user ? getColorTheme(user.color) : null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            {/* @ts-ignore */}
            <DialogContent className="max-w-4xl bg-black/80 backdrop-blur-2xl text-white border-white/10 p-0 overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">

                {loading || !user || !stats ? (
                    <div className="h-96 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full border-2 border-purple-500/30 border-t-purple-400 animate-spin" />
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row min-h-[580px]">

                        {/* Sidebar */}
                        <div className={cn("w-full md:w-72 flex flex-col items-center relative overflow-hidden border-r border-white/5", theme?.bg)}>
                            <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-0" />

                            {/* Color accent line at top */}
                            <div className={cn("absolute top-0 left-0 right-0 h-px", theme?.bg)} style={{ filter: 'brightness(2)' }} />

                            <div className="relative z-10 flex flex-col items-center w-full p-8">
                                {/* Avatar */}
                                <div className={cn(
                                    "w-28 h-28 rounded-2xl border-2 shadow-2xl flex items-center justify-center mb-5 bg-black/60",
                                    theme?.border
                                )}>
                                    {(() => {
                                        const Icon = getIconComponent(user.icon);
                                        return <Icon size={56} className={theme?.text} strokeWidth={1.5} />;
                                    })()}
                                </div>

                                <h2 className="text-2xl font-black italic tracking-tighter text-center leading-none mb-1">
                                    {user.name}
                                </h2>
                                <p className="text-xs font-mono uppercase tracking-widest text-white/40 mb-8">
                                    {user.funNickname || 'The Rookie'}
                                </p>

                                {/* Key Metrics */}
                                <div className="grid grid-cols-2 gap-2 w-full mb-6">
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                        <div className="text-2xl font-bold flex items-center justify-center gap-0.5">
                                            <CountUp
                                                to={Math.round(stats.winRate * 100)}
                                                duration={1.4}
                                                startWhen={!loading}
                                            />
                                            <span>%</span>
                                        </div>
                                        <div className="text-[10px] uppercase text-white/30 font-bold tracking-wider mt-0.5">Win Rate</div>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                        <div className="text-2xl font-bold">
                                            <CountUp
                                                to={stats.matchesPlayed}
                                                duration={1.2}
                                                startWhen={!loading}
                                            />
                                        </div>
                                        <div className="text-[10px] uppercase text-white/30 font-bold tracking-wider mt-0.5">Matches</div>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                        <div className="text-xl font-bold text-yellow-400 flex items-center justify-center gap-1.5">
                                            <Trophy size={13} />
                                            <CountUp
                                                to={stats.wins}
                                                duration={1.2}
                                                delay={0.1}
                                                startWhen={!loading}
                                            />
                                        </div>
                                        <div className="text-[10px] uppercase text-white/30 font-bold tracking-wider mt-0.5">Wins</div>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                        <div className="text-xl font-bold text-red-400 flex items-center justify-center gap-1.5">
                                            <Skull size={13} />
                                            <CountUp
                                                to={stats.losses}
                                                duration={1.2}
                                                delay={0.1}
                                                startWhen={!loading}
                                            />
                                        </div>
                                        <div className="text-[10px] uppercase text-white/30 font-bold tracking-wider mt-0.5">Losses</div>
                                    </div>
                                </div>

                                {/* Streak */}
                                <div className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Flame
                                            size={18}
                                            className={cn(
                                                stats.currentStreak > 2 ? "text-orange-400 animate-pulse" : "text-white/20"
                                            )}
                                        />
                                        <div>
                                            <div className="text-xs font-bold text-white/60">Current Streak</div>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-black italic tracking-tighter">
                                        <CountUp
                                            to={stats.currentStreak}
                                            duration={1.0}
                                            delay={0.2}
                                            startWhen={!loading}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main content */}
                        <div className="flex-1 p-8 bg-black/20">
                            {/* Performance */}
                            <div className="mb-8">
                                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Target size={12} className={theme?.text} /> Performance by Mode
                                </h3>
                                <div className="space-y-4">
                                    {stats.modeStats.length === 0 ? (
                                        <p className="text-white/20 text-sm italic">No data yet.</p>
                                    ) : (
                                        stats.modeStats.map((mode: any) => (
                                            <div key={mode.modeName}>
                                                <div className="flex justify-between items-end mb-1.5">
                                                    <span className="text-sm font-semibold text-white/80">{mode.modeName}</span>
                                                    <span className="text-xs font-mono text-white/30">
                                                        {mode.wins}W — {mode.losses}L ({mode.winRate > 0 ? (mode.winRate * 100).toFixed(0) : 0}%)
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full rounded-full transition-all duration-1000 ease-out", theme?.bg)}
                                                        style={{ width: `${mode.winRate * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Nemesis & Victim */}
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                    <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <Swords size={10} className="text-red-400" /> Nemesis
                                    </div>
                                    {stats.nemesis ? (
                                        <>
                                            <div className="text-lg font-bold text-white truncate">{stats.nemesis.opponentName}</div>
                                            <div className="text-xs text-red-400/80 mt-1">
                                                Beat you <CountUp to={stats.nemesis.count} duration={1.0} startWhen={!loading} />×
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-white/20 text-sm">No rival yet</div>
                                    )}
                                </div>

                                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                    <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <Target size={10} className="text-green-400" /> Favorite Target
                                    </div>
                                    {stats.victim ? (
                                        <>
                                            <div className="text-lg font-bold text-white truncate">{stats.victim.opponentName}</div>
                                            <div className="text-xs text-green-400/80 mt-1">
                                                Defeated <CountUp to={stats.victim.count} duration={1.0} startWhen={!loading} />×
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-white/20 text-sm">No easy wins yet</div>
                                    )}
                                </div>
                            </div>

                            {/* Recent History */}
                            <div>
                                <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <History size={11} /> Recent Matches
                                </h3>
                                <div className="space-y-2">
                                    {stats.recentMatches.length === 0 ? (
                                        <div className="text-white/20 italic text-sm">No battles recorded.</div>
                                    ) : (
                                        stats.recentMatches.map((match: any) => (
                                            <div
                                                key={match.matchId}
                                                className="flex items-center justify-between px-4 py-3 bg-white/3 border border-white/5 rounded-xl hover:bg-white/8 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-1 h-8 rounded-full",
                                                        match.result === 'Win' ? "bg-green-400" : "bg-red-400"
                                                    )} />
                                                    <div>
                                                        <div className="font-semibold text-sm text-white/90">vs {match.opponentName}</div>
                                                        <div className="text-[10px] text-white/30 uppercase tracking-wide">{match.modeName}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={cn(
                                                        "font-mono font-bold text-sm",
                                                        match.result === 'Win' ? "text-green-400" : "text-red-400"
                                                    )}>
                                                        {match.scoreUser} – {match.scoreOpponent}
                                                    </div>
                                                    <div className="text-[10px] text-white/25">
                                                        {new Date(match.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PlayerProfile;
