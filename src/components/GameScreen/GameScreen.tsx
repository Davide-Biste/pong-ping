import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button as ButtonOriginal } from "@/components/ui/button";
import { Trophy, RotateCcw, Home, Check } from "lucide-react";
import Counter from "@/components/react-bits/Counter";

// Bypass TS checks for JS components
const Button = ButtonOriginal as any;
import { matchService } from '@/services/matchService';
import { getColorTheme, getIconComponent } from "@/lib/gameConfig";
import { cn } from "@/lib/utils";
import { useSpatialNav } from '@/hooks/useSpatialNav';
import { useAction } from '@/hooks/useAction';

const GameScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [match, setMatch] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [rematchSwap, setRematchSwap] = useState(true);

    // Determine nav group based on game state
    const navGroup = useMemo(() => {
        if (!match) return 'game';
        if (match.winner) return 'winner';
        if (!match.firstServer && match.status === 'in_progress') return 'first-server';
        return 'game';
    }, [match]);

    useSpatialNav(navGroup);

    const fetchMatch = async () => {
        try {
            const data = await matchService.getMatch(id);
            setMatch(data);
        } catch (err) {
            console.error("Error fetching match", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMatch();
    }, [id]);

    const handlePoint = async (playerId: string) => {
        if (!match || match.status === 'finished') return;
        try {
            const updated = await matchService.addPoint(id, playerId);
            setMatch(updated);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUndo = async () => {
        try {
            const updated = await matchService.undoPoint(id);
            setMatch(updated);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSetFirstServer = async (playerId: string) => {
        try {
            const updated = await matchService.setFirstServer(id, playerId);
            setMatch(updated);
        } catch (err) {
            console.error(err);
        }
    }

    // Keyboard action bindings
    useAction('add_point_left', () => {
        if (match?.player1?._id && match.status === 'in_progress' && match.firstServer) {
            handlePoint(match.player1._id);
        }
    }, [match]);

    useAction('add_point_right', () => {
        if (match?.player2?._id && match.status === 'in_progress' && match.firstServer) {
            handlePoint(match.player2._id);
        }
    }, [match]);

    useAction('undo', () => {
        if (match?.events?.length > 0) handleUndo();
    }, [match]);

    useAction('confirm', () => {
        (document.activeElement as HTMLElement)?.click();
    }, []);

    useAction('back', () => {
        if (match?.winner) {
            navigate('/');
        } else if (!match?.firstServer) {
            navigate('/');
        } else if (match?.status === 'in_progress') {
            // During gameplay, back = exit with cancel
            if (match) {
                matchService.cancelMatch(id).catch(console.error);
            }
            navigate('/');
        }
    }, [match, id]);

    const handleRematch = async () => {
        if (!match) return;
        setIsLoading(true);
        try {
            // Logic to swap players if requested
            const p1 = rematchSwap ? match.player2._id : match.player1._id;
            const p2 = rematchSwap ? match.player1._id : match.player2._id;
            const p3 = (match.player3 && match.player4) ? (rematchSwap ? match.player4._id : match.player3._id) : null;
            const p4 = (match.player3 && match.player4) ? (rematchSwap ? match.player3._id : match.player4._id) : null;

            // Re-use existing settings
            const overrides = {
                serveType: match.matchRules?.serveType,
                servesInDeuce: match.matchRules?.servesInDeuce,
                player3Id: p3,
                player4Id: p4
            };

            const newMatch = await matchService.startMatch(p1, p2, match.gameMode.id || match.gameMode._id, overrides);
            setMatch(null); // Clear current match
            navigate(`/game/${newMatch._id}`);
            // Force reload via key or fetch is handled by useEffect on [id]
        } catch (e) {
            console.error("Rematch failed", e);
            setIsLoading(false);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen text-white flex items-center justify-center font-mono">
            <div className="text-center">
                <div className="w-10 h-10 rounded-full border-2 border-green-500/20 border-t-green-400 animate-spin mx-auto mb-4" />
                <p className="font-arcade text-green-400/60" style={{ fontSize: '0.6rem' }}>LOADING ARENA...</p>
            </div>
        </div>
    );
    if (!match) return (
        <div className="min-h-screen text-white flex items-center justify-center font-mono">
            <p className="font-arcade text-neutral-500" style={{ fontSize: '0.6rem' }}>MATCH NOT FOUND</p>
        </div>
    );

    const { player1, player2, player3, player4, score, gameMode, winner } = match;
    const isDoubles = !!player3 && !!player4;

    const totalPoints = score.p1 + score.p2;

    const p1Theme = getColorTheme(player1.color || 'blue');
    const p2Theme = getColorTheme(player2.color || 'red');
    const p3Theme = isDoubles ? getColorTheme(player3.color || 'blue') : p1Theme;
    const p4Theme = isDoubles ? getColorTheme(player4.color || 'red') : p2Theme;

    const P1Icon = getIconComponent(player1.icon);
    const P2Icon = getIconComponent(player2.icon);
    const P3Icon = isDoubles ? getIconComponent(player3.icon) : P1Icon;
    const P4Icon = isDoubles ? getIconComponent(player4.icon) : P2Icon;

    // Show Server Selection Modal if not set
    if (!match.firstServer && !winner && match.status === 'in_progress') {
        return (
            <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono">
                {/* CRT Overlays */}
                <div className="fixed inset-0 scanlines z-10 pointer-events-none" />
                <div className="fixed inset-0 crt-vignette z-20 pointer-events-none" />

                {/* Background */}
                <div className={cn("absolute top-0 left-0 w-1/2 h-full opacity-10", p1Theme.bg)} />
                <div className={cn("absolute top-0 right-0 w-1/2 h-full opacity-10", p2Theme.bg)} />

                <div className="z-30 bg-black/80 border border-green-500/25 p-8 rounded-2xl shadow-[0_0_40px_rgba(74,222,128,0.1)] max-w-md w-full text-center">
                    <p className="font-arcade text-green-400 mb-2" style={{ fontSize: '0.9rem' }}>WHO STARTS?</p>
                    <p className="text-neutral-500 text-xs mb-8 font-mono">Select the player (or team) serving first.</p>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            data-nav="true"
                            data-nav-group="first-server"
                            tabIndex={0}
                            className={cn(
                                "h-32 flex flex-col gap-2 items-center justify-center bg-neutral-950 border-2 rounded-xl transition-all hover:bg-yellow-400/5",
                                p1Theme.border
                            )}
                            onClick={() => handleSetFirstServer(player1._id)}
                        >
                            <P1Icon size={32} className={p1Theme.text} />
                            <span className="text-lg font-bold text-white">{player1.name}</span>
                            {isDoubles && <span className="text-xs text-neutral-500">+ {player3.name}</span>}
                        </button>

                        <button
                            data-nav="true"
                            data-nav-group="first-server"
                            tabIndex={0}
                            className={cn(
                                "h-32 flex flex-col gap-2 items-center justify-center bg-neutral-950 border-2 rounded-xl transition-all hover:bg-yellow-400/5",
                                p2Theme.border
                            )}
                            onClick={() => handleSetFirstServer(player2._id)}
                        >
                            <P2Icon size={32} className={p2Theme.text} />
                            <span className="text-lg font-bold text-white">{player2.name}</span>
                            {isDoubles && <span className="text-xs text-neutral-500">+ {player4.name}</span>}
                        </button>
                    </div>

                    <button
                        data-nav="true"
                        data-nav-group="first-server"
                        tabIndex={0}
                        className="mt-8 text-xs font-arcade text-neutral-600 hover:text-neutral-400 transition-colors"
                        style={{ fontSize: '0.45rem' }}
                        onClick={() => navigate('/')}
                    >
                        Cancel Match
                    </button>
                </div>
            </div>
        )
    }

    // Determine Server
    let serverId;
    const { servesBeforeChange, pointsToWin } = gameMode;
    const matchRules = match.matchRules || {};
    const servesInDeuce = matchRules.servesInDeuce || 1;
    const isDeuce = score.p1 >= pointsToWin - 1 && score.p2 >= pointsToWin - 1;

    // Serving Sequence
    // Singles: [P1, P2] (or [P2, P1] if P2 started? No, normally P1, P2 if P1 starts)
    // Actually standard logic: Starter, Receiver.
    // Doubles: [P1, P2, P3, P4] assuming A, X, B, Y.
    // But who is A/X/B/Y depends on who starts.
    // Let's assume standard rotation array based on Starter.
    const starterId = match.firstServer || player1._id;

    // Construct rotation array. P3 is partner of P1. P4 partner of P2.
    // Order: Captain1 -> Captain2 -> Partner1 -> Partner2
    // If starter is P1: P1 -> P2 -> P3 -> P4.
    // If starter is P2: P2 -> P1 -> P4 -> P3.
    // If starter is P3: P3 -> P4 -> P1 -> P2.
    // If starter is P4: P4 -> P3 -> P2 -> P1.
    // We need to find the "Index 0" player.

    let rotationIds = [];
    if (isDoubles) {
        // Find which team starts
        const startTeam1 = starterId === player1._id || starterId === player3._id;
        if (startTeam1) {
            // Team 1 starts. A=Starter.
            // Opponent X? P2 or P4. Let's assume P2 is "Primary Receiver".
            // A(Start) -> X(P2) -> B(Partner) -> Y(P4).
            const partner = starterId === player1._id ? player3._id : player1._id;
            rotationIds = [starterId, player2._id, partner, player4._id];
        } else {
            // Team 2 starts. A=Starter.
            const partner = starterId === player2._id ? player4._id : player2._id;
            rotationIds = [starterId, player1._id, partner, player3._id];
        }
    } else {
        const receiverId = starterId === player1._id ? player2._id : player1._id;
        rotationIds = [starterId, receiverId];
    }

    const pointsBeforeDeuce = (pointsToWin - 1) * 2;
    let turnIndex = 0;

    if (isDeuce) {
        const offset = totalPoints - pointsBeforeDeuce;
        if (offset >= 0) {
            turnIndex = Math.floor(offset / servesInDeuce);
        } else {
            // Edge case
            turnIndex = Math.floor(totalPoints / servesBeforeChange);
        }
    } else {
        turnIndex = Math.floor(totalPoints / servesBeforeChange);
    }

    // In Deuce, we continue rotation but step 1 by 1 (or servesInDeuce).
    // The turnIndex represents "how many service turns have passed".
    // We map this to the rotation array.
    serverId = rotationIds[turnIndex % rotationIds.length];

    const handleExit = async () => {
        if (match && match.status === 'in_progress') {
            try {
                await matchService.cancelMatch(id);
            } catch (err) {
                console.error("Failed to cancel match", err);
            }
        }
        navigate('/');
    };

    return (
        <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono">

            {/* CRT Overlays */}
            <div className="fixed inset-0 scanlines z-10 pointer-events-none" />
            <div className="fixed inset-0 crt-vignette z-20 pointer-events-none" />

            {/* Background effects */}
            <div className={cn(
                "absolute top-0 left-0 w-1/2 h-full transition-all duration-500 opacity-10",
                p1Theme.bg,
                (serverId === player1._id || (isDoubles && serverId === player3._id)) ? 'opacity-30' : ''
            )} />
            <div className={cn(
                "absolute top-0 right-0 w-1/2 h-full transition-all duration-500 opacity-10",
                p2Theme.bg,
                (serverId === player2._id || (isDoubles && serverId === player4._id)) ? 'opacity-30' : ''
            )} />

            {/* Header */}
            <div className="absolute top-4 left-4 z-30 flex gap-2">
                <button
                    data-nav="true"
                    data-nav-group="game"
                    tabIndex={0}
                    onClick={handleExit}
                    className="arcade-btn-cyan px-4 py-2 text-[0.45rem] flex items-center gap-2"
                >
                    <Home size={12} /> Home
                </button>
            </div>

            {/* Rule Indicators (Cross/Free) */}
            {matchRules.serveType && (
                <div className="absolute top-4 right-4 z-30">
                    <div className="px-3 py-1 bg-black/70 backdrop-blur border border-green-500/20 rounded-full text-xs font-arcade font-bold text-green-400 uppercase tracking-widest flex items-center gap-2"
                        style={{ fontSize: '0.4rem' }}>
                        <span className={cn("w-2 h-2 rounded-full", matchRules.serveType === 'cross' ? "bg-green-400 shadow-[0_0_8px_#4ade80]" : "bg-green-500 shadow-[0_0_8px_#22c55e]")} />
                        {matchRules.serveType} SERVE
                    </div>
                </div>
            )}

            <div className="mb-8 z-30 flex flex-col items-center gap-3">
                {/* TARGET SCORE BADGE */}
                <div className="relative flex items-center gap-2 px-6 py-2 bg-black/70 backdrop-blur-md border border-green-500/20 rounded-full shadow-[0_0_15px_rgba(74,222,128,0.1)]">
                    <Trophy size={14} className="text-green-400" />
                    <span className="font-arcade text-neutral-500 uppercase mr-2" style={{ fontSize: '0.4rem' }}>Target</span>
                    <span className="text-xl font-black text-green-400 tracking-tighter"
                        style={{ textShadow: '0 0 10px rgba(74,222,128,0.5)' }}>
                        {gameMode.pointsToWin || 11} <span className="text-xs font-normal text-neutral-500 ml-0.5">PTS</span>
                    </span>
                </div>

                {/* DEUCE BADGE (Shows only if active) */}
                {match.isDeuce && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="relative px-4 py-1 bg-orange-500/10 border border-orange-500/50 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.3)] animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                            <span className="font-arcade text-orange-400 uppercase" style={{ fontSize: '0.45rem', letterSpacing: '0.2em' }}>
                                DEUCE ACTIVE
                            </span>
                        </div>
                    </div>
                )}
            </div>


            {/* Scoreboard */}
            <div className="flex w-full max-w-6xl justify-between items-center z-30 gap-4 lg:gap-12">

                {/* TEAM 1 */}
                <div
                    className="flex-1 flex flex-col items-center cursor-pointer group rounded-xl"
                    data-nav="true"
                    data-nav-group="game"
                    tabIndex={0}
                    onClick={() => handlePoint(player1._id)}
                >
                    {/* Serving Indicator Team 1 */}
                    <div className={`mb-4 text-xl font-bold flex items-center gap-2 ${(serverId === player1._id || (isDoubles && serverId === player3._id)) ? `animate-bounce ${p1Theme.text}` : 'text-neutral-500'}`}>
                        {(serverId === player1._id || (isDoubles && serverId === player3._id)) ? 'SERVING' : '\u00A0'}
                    </div>

                    {isDoubles ? (
                        <div className="w-full flex flex-col items-center gap-4">
                            {/* Big Score */}
                            <div className={cn("text-9xl font-black tabular-nums tracking-tighter drop-shadow-2xl", p1Theme.text)}>
                                {score.p1}
                            </div>
                            {/* Players */}
                            <div className="flex gap-4">
                                <Card className={cn("relative w-32 h-40 bg-neutral-900/80 border-2 overflow-hidden flex flex-col items-center justify-end p-2 transition-all", serverId === player1._id ? "border-white scale-110 z-10 shadow-xl" : "border-white/10 opacity-80")}>
                                    <P1Icon className={cn("absolute opacity-20 w-32 h-32 -top-4 -left-4", p1Theme.text)} />
                                    <div className="z-10 text-center font-bold text-sm truncate w-full">{player1.name}</div>
                                </Card>
                                <Card className={cn("relative w-32 h-40 bg-neutral-900/80 border-2 overflow-hidden flex flex-col items-center justify-end p-2 transition-all", serverId === player3._id ? "border-white scale-110 z-10 shadow-xl" : "border-white/10 opacity-80")}>
                                    <P3Icon className={cn("absolute opacity-20 w-32 h-32 -top-4 -right-4", p3Theme.text)} />
                                    <div className="z-10 text-center font-bold text-sm truncate w-full">{player3.name}</div>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <Card className={cn(
                            "w-full aspect-3/4 max-w-xs bg-neutral-900/80 backdrop-blur border-4 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 active:scale-95 group-hover:shadow-2xl",
                            p1Theme.border, p1Theme.shadow
                        )}>
                            <P1Icon className={cn("absolute opacity-10 w-64 h-64 -bottom-10 -left-10 rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110", p1Theme.text)} />
                            <div className="absolute font-bold text-white/90 user-select-none z-10">
                                <Counter
                                    value={score.p1}
                                    places={[10, 1]}
                                    fontSize={120}
                                    padding={0}
                                    gap={10}
                                    textColor="white"
                                    fontWeight={900}
                                    gradientHeight={0}
                                />
                            </div>
                            <div className="absolute bottom-6 font-bold text-2xl flex items-center gap-2"><P1Icon size={24} /> {player1.name}</div>
                        </Card>
                    )}
                    <div className="mt-4 font-arcade text-neutral-600" style={{ fontSize: '0.4rem' }}>Click card to add point</div>
                </div>

                {/* VS / Divider */}
                <div className="font-arcade text-neutral-700" style={{ fontSize: '1.2rem' }}>VS</div>

                {/* TEAM 2 */}
                <div
                    className="flex-1 flex flex-col items-center cursor-pointer group rounded-xl"
                    data-nav="true"
                    data-nav-group="game"
                    tabIndex={0}
                    onClick={() => handlePoint(player2._id)}
                >
                    {/* Serving Indicator Team 2 */}
                    <div className={`mb-4 text-xl font-bold flex items-center gap-2 ${(serverId === player2._id || (isDoubles && serverId === player4._id)) ? `animate-bounce ${p2Theme.text}` : 'text-neutral-500'}`}>
                        {(serverId === player2._id || (isDoubles && serverId === player4._id)) ? 'SERVING' : '\u00A0'}
                    </div>

                    {isDoubles ? (
                        <div className="w-full flex flex-col items-center gap-4">
                            {/* Big Score */}
                            <div className={cn("text-9xl font-black tabular-nums tracking-tighter drop-shadow-2xl", p2Theme.text)}>
                                {score.p2}
                            </div>
                            {/* Players */}
                            <div className="flex gap-4">
                                <Card className={cn("relative w-32 h-40 bg-neutral-900/80 border-2 overflow-hidden flex flex-col items-center justify-end p-2 transition-all", serverId === player2._id ? "border-white scale-110 z-10 shadow-xl" : "border-white/10 opacity-80")}>
                                    <P2Icon className={cn("absolute opacity-20 w-32 h-32 -top-4 -left-4", p2Theme.text)} />
                                    <div className="z-10 text-center font-bold text-sm truncate w-full">{player2.name}</div>
                                </Card>
                                <Card className={cn("relative w-32 h-40 bg-neutral-900/80 border-2 overflow-hidden flex flex-col items-center justify-end p-2 transition-all", serverId === player4._id ? "border-white scale-110 z-10 shadow-xl" : "border-white/10 opacity-80")}>
                                    <P4Icon className={cn("absolute opacity-20 w-32 h-32 -top-4 -right-4", p4Theme.text)} />
                                    <div className="z-10 text-center font-bold text-sm truncate w-full">{player4.name}</div>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <Card className={cn(
                            "w-full aspect-3/4 max-w-xs bg-neutral-900/80 backdrop-blur border-4 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 active:scale-95 group-hover:shadow-2xl",
                            p2Theme.border, p2Theme.shadow
                        )}>
                            {/* Icon Background */}
                            <P2Icon className={cn("absolute opacity-10 w-64 h-64 -bottom-10 -right-10 -rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110", p2Theme.text)} />

                            <div className="absolute font-bold text-white/90 user-select-none z-10">
                                <Counter
                                    value={score.p2}
                                    places={[10, 1]}
                                    fontSize={120}
                                    padding={0}
                                    gap={10}
                                    textColor="white"
                                    fontWeight={900}
                                    gradientHeight={0}
                                />
                            </div>
                            <div className="absolute bottom-6 font-bold text-2xl flex items-center gap-2"><P2Icon size={24} /> {player2.name}</div>
                        </Card>
                    )}
                    <div className="mt-4 font-arcade text-neutral-600" style={{ fontSize: '0.4rem' }}>Click card to add point</div>
                </div>
            </div>

            {/* Controls */}
            <div className="mt-12 z-30 flex gap-4">
                <button
                    className="arcade-btn-cyan px-8 py-3 text-[0.5rem] flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    data-nav="true"
                    data-nav-group="game"
                    tabIndex={0}
                    onClick={handleUndo}
                    disabled={match.events.length === 0}
                >
                    <RotateCcw size={14} className="mr-1" /> Undo
                </button>
            </div>

            {/* Winner Overlay */}
            {winner && (
                <div className="absolute inset-0 bg-black/85 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-500">
                    {/* Scanlines on overlay too */}
                    <div className="absolute inset-0 scanlines pointer-events-none opacity-50" />

                    <div className="text-center p-8 bg-black/80 border border-amber-500/40 rounded-xl shadow-[0_0_60px_rgba(251,191,36,0.15)] max-w-lg w-full relative overflow-hidden font-mono">
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"></div>

                        <Trophy className="w-20 h-20 text-amber-400 mx-auto mb-4 animate-[bounce_2s_infinite]"
                            style={{ filter: 'drop-shadow(0 0 20px rgba(251,191,36,0.5))' }} />

                        <h1 className="font-arcade text-amber-300 mb-2"
                            style={{ fontSize: '1.5rem', textShadow: '0 0 30px rgba(251,191,36,0.5)' }}>
                            VICTORY!
                        </h1>
                        <h2 className="font-arcade text-amber-400/70 mb-8" style={{ fontSize: '0.7rem' }}>
                            {match.winner.name} wins!
                        </h2>

                        <div className="flex items-center justify-center gap-8 mb-8">
                            <div className="flex flex-col items-center">
                                <div className={cn("text-5xl font-black tabular-nums", score.p1 > score.p2 ? "text-amber-400" : "text-neutral-600")}
                                    style={score.p1 > score.p2 ? { textShadow: '0 0 20px rgba(251,191,36,0.4)' } : {}}>
                                    {score.p1}
                                </div>
                                <div className="font-arcade text-neutral-500 uppercase mt-1" style={{ fontSize: '0.38rem' }}>
                                    {player1.name} {isDoubles && `& ${player3.name}`}
                                </div>
                            </div>
                            <div className="font-arcade text-neutral-700" style={{ fontSize: '0.8rem' }}>VS</div>
                            <div className="flex flex-col items-center">
                                <div className={cn("text-5xl font-black tabular-nums", score.p2 > score.p1 ? "text-amber-400" : "text-neutral-600")}
                                    style={score.p2 > score.p1 ? { textShadow: '0 0 20px rgba(251,191,36,0.4)' } : {}}>
                                    {score.p2}
                                </div>
                                <div className="font-arcade text-neutral-500 uppercase mt-1" style={{ fontSize: '0.38rem' }}>
                                    {player2.name} {isDoubles && `& ${player4.name}`}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* Rematch Section */}
                            <div className="bg-neutral-900/50 rounded-lg p-3 border border-green-500/15 mb-4">
                                <button
                                    onClick={handleRematch}
                                    data-nav="true"
                                    data-nav-group="winner"
                                    tabIndex={0}
                                    className="arcade-btn w-full h-14 text-xs flex items-center justify-center gap-2 mb-3"
                                >
                                    <RotateCcw className="w-4 h-4" /> REMATCH
                                </button>

                                <div
                                    onClick={() => setRematchSwap(!rematchSwap)}
                                    className="flex items-center justify-center gap-2 text-xs text-neutral-500 cursor-pointer hover:text-white transition-colors font-mono"
                                >
                                    <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-colors", rematchSwap ? "bg-green-500 border-green-500 text-black" : "border-neutral-600 bg-transparent")}>
                                        {rematchSwap && <Check size={12} strokeWidth={4} />}
                                    </div>
                                    <span>Switch Sides (Teams)</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    data-nav="true"
                                    data-nav-group="winner"
                                    tabIndex={0}
                                    className="arcade-btn-cyan h-12 text-[0.45rem]"
                                    onClick={() => navigate('/setup')}
                                >
                                    New Match
                                </button>
                                <button
                                    data-nav="true"
                                    data-nav-group="winner"
                                    tabIndex={0}
                                    className="arcade-btn-cyan h-12 text-[0.45rem]"
                                    onClick={() => navigate('/')}
                                >
                                    Menu
                                </button>
                            </div>

                            <button onClick={handleUndo} className="w-full font-arcade text-neutral-700 hover:text-neutral-500 mt-2 py-2 transition-colors" style={{ fontSize: '0.38rem' }}>
                                Made a mistake? Undo last point
                            </button>
                        </div>

                        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameScreen;
