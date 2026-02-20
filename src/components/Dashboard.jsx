import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Users } from 'lucide-react';
import { useSpatialNav } from '@/hooks/useSpatialNav';
import { useAction } from '@/hooks/useAction';
import { userService } from '@/services/userService';

const Dashboard = () => {
    const navigate = useNavigate();
    const [playerCount, setPlayerCount] = useState(0);

    useSpatialNav('dashboard');
    useAction('confirm', () => document.activeElement?.click(), []);
    useAction('back', () => {}, []);

    useEffect(() => {
        userService.getAll()
            .then((users) => setPlayerCount(users.length))
            .catch(() => {});
    }, []);

    return (
        <div className="min-h-screen text-white flex flex-col items-center justify-center relative overflow-hidden font-mono selection:bg-purple-500/30">

            {/* CRT Scanlines — z-10 */}
            <div className="fixed inset-0 scanlines z-10" />

            {/* CRT Vignette — z-20 */}
            <div className="fixed inset-0 crt-vignette z-20" />

            {/* Background ambient glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-purple-900/25 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-purple-900/15 rounded-full blur-[150px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-800/10 rounded-full blur-[100px]" />
            </div>

            {/* Content — z-30 */}
            <div className="z-30 flex flex-col items-center w-full max-w-lg px-8 gap-10">

                {/* Corner decorations */}
                <div className="fixed top-4 left-4 text-green-500/25 font-arcade text-xs select-none">╔═</div>
                <div className="fixed top-4 right-4 text-green-500/25 font-arcade text-xs select-none">═╗</div>
                <div className="fixed bottom-4 left-4 text-green-500/25 font-arcade text-xs select-none">╚═</div>
                <div className="fixed bottom-4 right-4 text-green-500/25 font-arcade text-xs select-none">═╝</div>

                {/* INSERT COIN */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-center"
                >
                    <span
                        className="text-green-400 font-arcade text-sm tracking-widest"
                        style={{ animation: 'blink 0.7s step-start infinite' }}
                    >
                        ── INSERT COIN ──
                    </span>
                </motion.div>

                {/* PONG / PING Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-center leading-tight"
                >
                    <div
                        className="arcade-title arcade-title-glitch text-green-400 text-7xl block mb-2"
                        data-text="PONG"
                    >
                        PONG
                    </div>
                    <div className="arcade-title-cyan text-green-300 text-7xl block">
                        PING
                    </div>
                    <div className="mt-5 text-neutral-500 font-arcade text-[0.55rem] tracking-[0.3em] uppercase">
                        Table Tennis Tracker
                    </div>
                </motion.div>

                {/* PRESS START button */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    onClick={() => navigate('/setup')}
                    data-nav="true"
                    data-nav-group="dashboard"
                    tabIndex={0}
                    className="arcade-btn w-full py-6 px-10 text-base tracking-widest uppercase"
                >
                    ▶ PRESS START
                </motion.button>

                {/* Stats bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="text-neutral-600 font-arcade text-[0.6rem] tracking-widest text-center"
                >
                    PLAYERS: {playerCount}&nbsp;&nbsp;|&nbsp;&nbsp;© 2025 PONG PING
                </motion.div>

                {/* Footer buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                    className="flex gap-4 w-full"
                >
                    <button
                        onClick={() => navigate('/hall-of-fame')}
                        data-nav="true"
                        data-nav-group="dashboard"
                        tabIndex={0}
                        className="arcade-btn-cyan flex-1 flex items-center justify-center gap-2 py-4 px-4 tracking-wider uppercase"
                    >
                        <Trophy size={14} />
                        HALL OF FAME
                    </button>
                    <button
                        onClick={() => navigate('/players')}
                        data-nav="true"
                        data-nav-group="dashboard"
                        tabIndex={0}
                        className="arcade-btn-cyan flex-1 flex items-center justify-center gap-2 py-4 px-4 tracking-wider uppercase"
                    >
                        <Users size={14} />
                        PLAYERS
                    </button>
                </motion.div>

            </div>
        </div>
    );
};

export default Dashboard;
