import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button as ButtonOriginal } from "@/components/ui/button";
import { Dialog as DialogOriginal, DialogContent as DialogContentOriginal, DialogHeader as DialogHeaderOriginal, DialogTitle as DialogTitleOriginal, DialogDescription as DialogDescriptionOriginal, DialogFooter as DialogFooterOriginal } from "@/components/ui/dialog";
import { Input as InputOriginal } from "@/components/ui/input";
import { Plus, Swords, ArrowRightLeft, ChevronRight, ChevronLeft, Settings, Trophy, User, Users } from "lucide-react";
import { userService } from "@/services/userService";
import { gameModeService } from "@/services/gameModeService";
import { matchService } from "@/services/matchService";
import DecryptedText from "../react-bits/DecryptedText";
import { cn } from "@/lib/utils";
import { AVAILABLE_COLORS, AVAILABLE_ICONS } from "@/lib/gameConfig";
import GameSelect from "@/components/GameSelect.tsx";
import { motion, AnimatePresence } from 'framer-motion';
import { useSpatialNav } from '@/hooks/useSpatialNav';
import { useAction } from '@/hooks/useAction';

// Bypass TS checks for JS components
const Button = ButtonOriginal as any;
const Dialog = DialogOriginal as any;
const DialogContent = DialogContentOriginal as any;
const DialogHeader = DialogHeaderOriginal as any;
const DialogTitle = DialogTitleOriginal as any;
const DialogDescription = DialogDescriptionOriginal as any;
const DialogFooter = DialogFooterOriginal as any;
const Input = InputOriginal as any;

const MatchSetup = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [gameModes, setGameModes] = useState<any[]>([]);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Wizard Step: 0 = Mode, 1 = Players, 2 = Config/Start
    const [step, setStep] = useState(0);

    // Selection State
    const [p1, setP1] = useState("");
    const [p2, setP2] = useState("");
    const [p3, setP3] = useState(""); // Partner for P1
    const [p4, setP4] = useState(""); // Partner for P2
    const [isDoubles, setIsDoubles] = useState(false);
    const [modeId, setModeId] = useState("");

    // New Match Config Overrides
    const [serveType, setServeType] = useState('free');
    const [servesInDeuce, setServesInDeuce] = useState(1);

    // Update defaults when mode changes
    useEffect(() => {
        if (modeId && gameModes.length) {
            const mode = gameModes.find(m => m._id === modeId);
            if (mode) {
                setServeType(mode.serveType || 'free');
                setServesInDeuce(mode.servesInDeuce || 1);
            }
        }
    }, [modeId, gameModes]);

    // Start Button Ref for focus
    const startButtonRef = useRef<HTMLButtonElement>(null);

    // User Dialog State
    const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
    const [newUserName, setNewUserName] = useState("");
    const [newUserColor, setNewUserColor] = useState("blue");
    const [newUserIcon, setNewUserIcon] = useState("User");
    const [creatingUser, setCreatingUser] = useState(false);

    // Spatial navigation per step
    useSpatialNav(`setup-step-${step}`);
    useAction('back', () => {
        if (isUserDialogOpen) { setIsUserDialogOpen(false); return; }
        if (step > 0) setStep(step - 1);
        else navigate('/');
    }, [step, isUserDialogOpen]);
    useAction('confirm', () => (document.activeElement as HTMLElement)?.click(), []);


    useEffect(() => {
        const loadData = async () => {
            try {
                const [u, m] = await Promise.all([userService.getAll(), gameModeService.getAll()]);
                setUsers(u || []);
                setGameModes(m || []);
            } catch (e) {
                console.error("Error loading data", e);
            }
        };
        loadData();
    }, []);

    // Focus start button on step 2
    useEffect(() => {
        if (step === 2 && startButtonRef.current) {
            setTimeout(() => {
                startButtonRef.current?.focus();
            }, 300);
        }
    }, [step]);

    const handleStart = async () => {
        if (!p1 || !p2 || !modeId) return;
        if (p1 === p2) {
            alert("Shadow boxing is not supported yet.");
            return;
        }

        setIsTransitioning(true);

        try {
            const minAnimationTime = new Promise(resolve => setTimeout(resolve, 3000));
            const overrides = {
                serveType,
                servesInDeuce,
                player3Id: isDoubles ? p3 : null,
                player4Id: isDoubles ? p4 : null
            };
            const startMatchPromise = matchService.startMatch(p1, p2, modeId, overrides);
            const [_, match] = await Promise.all([minAnimationTime, startMatchPromise]);
            navigate(`/game/${match._id}`);
        } catch (err) {
            console.error("Failed to start match", err);
            alert(`Failed to start match: ${err}`);
            setIsTransitioning(false);
        }
    };

    const handleCreateUser = async () => {
        if (!newUserName.trim()) return;
        setCreatingUser(true);
        try {
            const newUser = await userService.createQuick(newUserName, newUserColor, newUserIcon);
            setUsers([...users, newUser]);
            setNewUserName("");
            setNewUserColor("blue");
            setNewUserIcon("User");
            setIsUserDialogOpen(false);
        } catch (err) {
            alert("Failed to create user");
        } finally {
            setCreatingUser(false);
        }
    };

    return (
        <div className="min-h-screen text-white flex items-center justify-center p-4 overflow-hidden relative font-mono selection:bg-purple-500/30">

            {/* CRT Overlays */}
            <div className="fixed inset-0 scanlines z-10 pointer-events-none" />
            <div className="fixed inset-0 crt-vignette z-20 pointer-events-none" />

            {/* Background Ambient Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/15 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/15 rounded-full blur-[120px]" />
            </div>

            {/* Loading Overlay */}
            <AnimatePresence>
                {isTransitioning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center"
                    >
                        <div className="w-full max-w-md space-y-8 p-8 relative">
                            <div className="absolute inset-0 bg-green-500/5 blur-3xl rounded-full"></div>
                            <div className="text-center space-y-4 relative z-10">
                                <DecryptedText
                                    text="INITIALIZING BATTLE ARENA..."
                                    speed={70}
                                    animateOn="view"
                                    className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-300 tracking-tighter"
                                />
                                <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden mt-8">
                                    <div className="h-full bg-gradient-to-r from-green-500 to-green-300 shadow-[0_0_15px_#4ade80] animate-[loading_2.5s_ease-in-out_forwards]" style={{ width: '0%' }}></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Wizard Container */}
            <div className="w-full max-w-5xl z-30 relative">

                {/* Header / Progress */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        {step > 0 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                data-nav="true"
                                data-nav-group={`setup-step-${step}`}
                                tabIndex={0}
                                className="p-2 rounded-full hover:bg-green-500/10 text-neutral-400 hover:text-yellow-400 border border-transparent hover:border-yellow-400/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50"
                                aria-label="Go back to previous step"
                            >
                                <ChevronLeft />
                            </button>
                        )}
                        <div>
                            <h1 className="text-2xl font-black italic tracking-tighter text-green-400">
                                {step === 0 && "SELECT PROTOCOL"}
                                {step === 1 && "CHOOSE COMBATANTS"}
                                {step === 2 && "FINALIZE PARAMETERS"}
                            </h1>
                            <div className="text-[10px] font-arcade text-neutral-600 uppercase tracking-widest flex items-center gap-2 mt-1">
                                <span className={cn(step >= 0 ? "text-green-400" : "text-neutral-700")}>01 Mode</span>
                                <span className="text-neutral-800">/</span>
                                <span className={cn(step >= 1 ? "text-green-400" : "text-neutral-700")}>02 Players</span>
                                <span className="text-neutral-800">/</span>
                                <span className={cn(step >= 2 ? "text-green-400" : "text-neutral-700")}>03 Start</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="min-h-[500px]">
                    <AnimatePresence mode="wait">

                        {/* STEP 0: GAME MODE */}
                        {step === 0 && (
                            <motion.div
                                key="step0"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {gameModes.map(mode => (
                                    <button
                                        key={mode._id}
                                        onClick={() => { setModeId(mode._id); setStep(1); }}
                                        data-nav="true"
                                        data-nav-group="setup-step-0"
                                        tabIndex={0}
                                        className={cn(
                                            "group relative bg-neutral-900/40 border-2 rounded-3xl p-8 cursor-pointer transition-all duration-300 text-left outline-none",
                                            "focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:border-green-500",
                                            modeId === mode._id
                                                ? "border-green-500/50 bg-green-950/20 shadow-[0_0_30px_rgba(74,222,128,0.08)]"
                                                : "border-white/5 hover:border-yellow-400/40 hover:bg-neutral-900/80 hover:shadow-xl hover:shadow-purple-900/20"
                                        )}
                                    >
                                        <div className="flex flex-col h-full justify-between">
                                            <div>
                                                <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center mb-6 group-hover:bg-yellow-400/10 group-hover:border group-hover:border-yellow-400/40 transition-colors">
                                                    <Trophy size={24} className="text-neutral-400 group-hover:text-yellow-400 transition-colors" />
                                                </div>
                                                <h3 className="text-2xl font-black italic uppercase mb-2 text-white group-hover:text-yellow-400 transition-colors">{mode.name}</h3>
                                                <p className="text-neutral-500 text-sm leading-relaxed">{mode.rulesDescription || "Standard competitive table tennis rules."}</p>
                                            </div>
                                            <div className="mt-8 pt-6 border-t border-white/5 flex gap-4 text-xs font-arcade uppercase text-neutral-500">
                                                <span className="flex items-center gap-1"><span className="text-green-400 font-bold">{mode.pointsToWin}</span> Pts</span>
                                                <span className="flex items-center gap-1"><span className="text-green-300 font-bold">{mode.servesBeforeChange}</span> Serves</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </motion.div>
                        )}

                        {/* STEP 1: PLAYERS */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-neutral-900/30 border border-green-500/10 rounded-3xl p-8 backdrop-blur-sm"
                            >
                                {/* MATCH TYPE TOGGLE */}
                                <div className="flex justify-center mb-8">
                                    <div className="bg-neutral-800 p-1 rounded-lg inline-flex relative border border-green-500/10">
                                        <div
                                            className={cn(
                                                "absolute top-1 bottom-1 w-[120px] bg-green-500/15 border border-green-500/30 rounded-md transition-all duration-300",
                                                isDoubles ? "left-[124px]" : "left-1"
                                            )}
                                        />
                                        <button
                                            onClick={() => setIsDoubles(false)}
                                            data-nav="true"
                                            data-nav-group="setup-step-1"
                                            tabIndex={0}
                                            className={cn(
                                                "relative w-[120px] py-1.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors z-10",
                                                !isDoubles ? "text-green-400" : "text-neutral-500 hover:text-neutral-300"
                                            )}
                                        >
                                            <User size={14} /> Singles
                                        </button>
                                        <button
                                            onClick={() => setIsDoubles(true)}
                                            data-nav="true"
                                            data-nav-group="setup-step-1"
                                            tabIndex={0}
                                            className={cn(
                                                "relative w-[120px] py-1.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors z-10",
                                                isDoubles ? "text-green-400" : "text-neutral-500 hover:text-neutral-300"
                                            )}
                                        >
                                            <Users size={14} /> Doubles
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-11 gap-8 items-center">
                                    {/* TEAM 1 */}
                                    <div className="lg:col-span-5 space-y-4">
                                        <h3 className="text-xs font-arcade text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                            <User size={14} className="text-green-400" /> {isDoubles ? "Team Blue" : "Challenger 01"}
                                        </h3>
                                        <GameSelect
                                            label=""
                                            placeholder="Select Player 1"
                                            options={users}
                                            value={p1}
                                            onChange={setP1}
                                            type="user"
                                            disabledValues={[p2, p3, p4].filter(Boolean)}
                                            navGroup="setup-step-1"
                                        />
                                        {isDoubles && (
                                            <GameSelect
                                                label=""
                                                placeholder="Select Partner (P3)"
                                                options={users}
                                                value={p3}
                                                onChange={setP3}
                                                type="user"
                                                disabledValues={[p1, p2, p4].filter(Boolean)}
                                                navGroup="setup-step-1"
                                            />
                                        )}
                                    </div>

                                    {/* VS / Swap */}
                                    <div className="lg:col-span-1 flex flex-col items-center justify-center py-4">
                                        <div className="w-px h-12 bg-green-500/20 lg:hidden"></div>
                                        <button
                                            onClick={() => {
                                                const t1 = p1; setP1(p2); setP2(t1);
                                                if (isDoubles) { const t3 = p3; setP3(p4); setP4(t3); }
                                            }}
                                            data-nav="true"
                                            data-nav-group="setup-step-1"
                                            tabIndex={0}
                                            className="p-3 rounded-full bg-neutral-800 border border-green-500/20 hover:bg-green-500/10 hover:border-green-500/50 transition-all active:scale-95 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                                            aria-label="Swap sides"
                                        >
                                            <ArrowRightLeft className="text-neutral-400 group-hover:text-yellow-400 transition-colors group-hover:rotate-180 duration-500" size={20} />
                                        </button>
                                        <div className="w-px h-12 bg-green-500/20 lg:hidden"></div>
                                    </div>

                                    {/* TEAM 2 */}
                                    <div className="lg:col-span-5 space-y-4">
                                        <h3 className="text-xs font-arcade text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                            <User size={14} className="text-green-400" /> {isDoubles ? "Team Red" : "Challenger 02"}
                                        </h3>
                                        <GameSelect
                                            label=""
                                            placeholder="Select Player 2"
                                            options={users}
                                            value={p2}
                                            onChange={setP2}
                                            type="user"
                                            disabledValues={[p1, p3, p4].filter(Boolean)}
                                            navGroup="setup-step-1"
                                        />
                                        {isDoubles && (
                                            <GameSelect
                                                label=""
                                                placeholder="Select Partner (P4)"
                                                options={users}
                                                value={p4}
                                                onChange={setP4}
                                                type="user"
                                                disabledValues={[p1, p2, p3].filter(Boolean)}
                                                navGroup="setup-step-1"
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="mt-12 flex justify-between items-center border-t border-green-500/10 pt-8">
                                    <Button
                                        variant="ghost"
                                        data-nav="true"
                                        data-nav-group="setup-step-1"
                                        tabIndex={0}
                                        onClick={() => setIsUserDialogOpen(true)}
                                        className="text-neutral-500 hover:text-yellow-400 hover:bg-green-500/5 border border-transparent hover:border-green-500/20"
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Register New Player
                                    </Button>
                                    <button
                                        onClick={() => setStep(2)}
                                        data-nav="true"
                                        data-nav-group="setup-step-1"
                                        tabIndex={0}
                                        disabled={!p1 || !p2 || (isDoubles && (!p3 || !p4))}
                                        className={cn(
                                            "arcade-btn px-8 h-12 text-sm flex items-center gap-2 transition-all",
                                            (!p1 || !p2 || (isDoubles && (!p3 || !p4))) ? "opacity-40 cursor-not-allowed" : ""
                                        )}
                                    >
                                        Done <ChevronRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: CONFIG & START */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-2xl mx-auto space-y-8"
                            >
                                {/* Summary Card */}
                                <div className="bg-neutral-900/50 border border-green-500/15 rounded-2xl p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                                            <Trophy size={20} className="text-green-400" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-arcade text-neutral-500 uppercase tracking-wider">Protocol</div>
                                            <div className="text-xl font-bold text-white">{gameModes.find(m => m._id === modeId)?.name}</div>
                                        </div>
                                    </div>
                                    <button
                                        data-nav="true"
                                        data-nav-group="setup-step-2"
                                        tabIndex={0}
                                        className="text-xs font-arcade text-neutral-500 hover:text-yellow-400 transition-colors px-3 py-1.5 border border-neutral-700 hover:border-yellow-400/40 rounded"
                                        onClick={() => setStep(0)}
                                    >
                                        Change
                                    </button>
                                </div>

                                {/* Rules Config */}
                                <div className="bg-neutral-900/50 border border-green-500/10 rounded-2xl p-6 space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Settings size={18} className="text-green-400/60" />
                                        <h3 className="text-xs font-arcade text-neutral-400 uppercase tracking-widest">Fine-Tune Rules</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-arcade text-neutral-500 uppercase">Service Style</label>
                                            <div className="flex bg-neutral-900/80 p-1 rounded-lg border border-green-500/10">
                                                <button
                                                    onClick={() => setServeType('free')}
                                                    data-nav="true"
                                                    data-nav-group="setup-step-2"
                                                    tabIndex={0}
                                                    className={cn("flex-1 py-2 text-xs font-bold rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50", serveType === 'free' ? "bg-green-500/15 text-green-400 border border-green-500/30 shadow-md" : "text-neutral-500 hover:text-white")}
                                                >
                                                    FREE
                                                </button>
                                                <button
                                                    onClick={() => setServeType('cross')}
                                                    data-nav="true"
                                                    data-nav-group="setup-step-2"
                                                    tabIndex={0}
                                                    className={cn("flex-1 py-2 text-xs font-bold rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50", serveType === 'cross' ? "bg-green-500/15 text-green-300 border border-green-500/30 shadow-md" : "text-neutral-500 hover:text-white")}
                                                >
                                                    CROSS
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-arcade text-neutral-500 uppercase">Deuce Serves</label>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => setServesInDeuce(Math.max(1, servesInDeuce - 1))} data-nav="true" data-nav-group="setup-step-2" tabIndex={0} className="w-10 h-10 rounded-lg bg-neutral-900 border border-green-500/20 hover:bg-green-500/10 hover:border-green-500/50 text-green-400 flex items-center justify-center font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50">-</button>
                                                <div className="flex-1 text-center font-arcade font-bold text-xl text-green-400">{servesInDeuce}</div>
                                                <button onClick={() => setServesInDeuce(servesInDeuce + 1)} data-nav="true" data-nav-group="setup-step-2" tabIndex={0} className="w-10 h-10 rounded-lg bg-neutral-900 border border-green-500/20 hover:bg-green-500/10 hover:border-green-500/50 text-green-400 flex items-center justify-center font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50">+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* START BUTTON */}
                                <div className="pt-4 relative group">
                                    <div className={cn(
                                        "w-full h-20 border-2 border-green-500 rounded-xl flex items-center justify-center gap-4 transition-all duration-300",
                                        "bg-transparent",
                                        "group-hover:bg-yellow-400/5 group-hover:scale-[1.02] group-hover:shadow-[0_0_30px_rgba(234,179,8,0.3)]",
                                        "group-focus-within:border-yellow-400 group-focus-within:ring-2 group-focus-within:ring-yellow-400/40 group-focus-within:ring-offset-2 group-focus-within:ring-offset-black group-focus-within:scale-[1.02] group-focus-within:shadow-[0_0_40px_rgba(234,179,8,0.4)]"
                                    )}>
                                        <Swords size={28} className="text-green-400" />
                                        <span className="text-3xl font-arcade text-green-400 tracking-widest" style={{ fontSize: '1.2rem' }}>FIGHT</span>
                                    </div>
                                    <button
                                        ref={startButtonRef}
                                        data-nav="true"
                                        data-nav-group="setup-step-2"
                                        tabIndex={0}
                                        onClick={handleStart}
                                        className="absolute inset-0 w-full h-20 opacity-0 z-10 cursor-pointer focus:outline-none"
                                        aria-label="Start fight"
                                    />
                                </div>

                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>

            {/* Create User Dialog */}
            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogContent className="bg-[#0a0a0a] text-white border border-green-500/30 sm:max-w-md p-6 shadow-[0_0_40px_rgba(74,222,128,0.1)]">
                    <DialogHeader>
                        <DialogTitle className="font-arcade text-base text-green-400 uppercase tracking-wider">New Challenger</DialogTitle>
                        <DialogDescription className="text-neutral-500 text-xs">Initialize a new combat profile.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-arcade text-neutral-500 uppercase tracking-wider">Codename</label>
                            <Input
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                                placeholder="Enter name..."
                                className="bg-neutral-900 border-green-500/20 focus:border-yellow-400/50 h-10 font-bold text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-arcade text-neutral-500 uppercase tracking-wider">Energy Signature</label>
                            <div className="flex gap-2 flex-wrap">
                                {AVAILABLE_COLORS.map((color) => (
                                    <button
                                        key={color.id}
                                        onClick={() => setNewUserColor(color.id)}
                                        className={cn(
                                            "w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center border-2",
                                            color.bg,
                                            newUserColor === color.id ? "border-white scale-110 shadow-lg" : "border-transparent opacity-40 hover:opacity-100"
                                        )}
                                    >
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-arcade text-neutral-500 uppercase tracking-wider">Emblem</label>
                            <div className="grid grid-cols-6 gap-2 bg-neutral-900/50 p-3 rounded-xl border border-green-500/15 max-h-[150px] overflow-y-auto custom-scrollbar">
                                {AVAILABLE_ICONS.map(({ id, component: Icon }) => (
                                    <button
                                        key={id}
                                        onClick={() => setNewUserIcon(id)}
                                        className={cn(
                                            "aspect-square rounded-lg flex items-center justify-center transition-all",
                                            newUserIcon === id
                                                ? "bg-green-500/20 text-green-400 ring-1 ring-green-500/50 shadow-lg"
                                                : "text-neutral-600 hover:bg-neutral-800 hover:text-white"
                                        )}
                                    >
                                        <Icon size={18} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <button
                            onClick={handleCreateUser}
                            disabled={!newUserName.trim() || creatingUser}
                            className={cn("arcade-btn w-full h-11 text-xs tracking-widest", (!newUserName.trim() || creatingUser) ? "opacity-40 cursor-not-allowed" : "")}
                        >
                            {creatingUser ? "INITIALIZING..." : "INITIALIZE UNIT"}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MatchSetup;
