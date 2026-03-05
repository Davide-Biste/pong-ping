import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Edit, ArrowLeft, Loader2 } from "lucide-react";
import { userService } from "@/services/userService";
import { cn } from "@/lib/utils";
import { AVAILABLE_COLORS, AVAILABLE_ICONS, getIconComponent, getColorTheme } from "@/lib/gameConfig";
import { useSpatialNav } from '@/hooks/useSpatialNav';
import { useAction } from '@/hooks/useAction';

const PlayerManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [formData, setFormData] = useState({ name: "", nickname: "", color: "blue", icon: "User" });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useSpatialNav('players');
    useAction('confirm', () => (document.activeElement as HTMLElement)?.click(), []);
    useAction('back', () => isDialogOpen ? setIsDialogOpen(false) : navigate('/'), [isDialogOpen]);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const data = await userService.getAll();
            setUsers(data);
        } catch (err) {
            console.error("Failed to load users", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDialog = (user: any = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                nickname: user.funNickname || "",
                color: user.color || "blue",
                icon: user.icon || "User"
            });
        } else {
            setEditingUser(null);
            setFormData({ name: "", nickname: "", color: "blue", icon: "User" });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) return;
        setIsSaving(true);
        try {
            if (editingUser) {
                await userService.update(editingUser._id, formData.name, formData.color, formData.icon, formData.nickname);
            } else {
                await userService.createQuick(formData.name, formData.color, formData.icon, formData.nickname);
            }
            await loadUsers();
            setIsDialogOpen(false);
        } catch (err) {
            alert("Failed to save warrior");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen text-white p-4 md:p-8 font-mono selection:bg-purple-500/30 relative overflow-hidden">

            {/* CRT Overlays */}
            <div className="fixed inset-0 scanlines z-10 pointer-events-none" />
            <div className="fixed inset-0 crt-vignette z-20 pointer-events-none" />

            {/* Background ambient glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/15 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 rounded-full blur-[150px]" />
            </div>

            {/* Header */}
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 mb-12 animate-in slide-in-from-top-4 duration-500 z-30 relative">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button
                        data-nav="true"
                        data-nav-group="players"
                        tabIndex={0}
                        onClick={() => navigate('/')}
                        className="p-2.5 rounded-full hover:bg-yellow-400/8 text-white/30 hover:text-yellow-400 border border-transparent hover:border-yellow-400/30 transition-colors w-12 h-12 flex items-center justify-center"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="font-arcade text-green-400" style={{ fontSize: '1.2rem', textShadow: '0 0 20px rgba(234,179,8,0.35)' }}>BARRACKS</h1>
                        <p className="text-neutral-500 font-arcade uppercase mt-1" style={{ fontSize: '0.4rem', letterSpacing: '0.3em' }}>Manage your roster</p>
                    </div>
                </div>

                <button
                    onClick={() => handleOpenDialog()}
                    data-nav="true"
                    data-nav-group="players"
                    tabIndex={0}
                    className="arcade-btn w-full md:w-auto px-6 h-12 text-xs flex items-center justify-center gap-2"
                >
                    <Plus className="h-4 w-4" /> RECLUTA GUERRIERO
                </button>
            </div>

            {/* Loading State */}
            {isLoading && users.length === 0 ? (
                <div className="flex justify-center items-center h-64 z-30 relative">
                    <Loader2 className="animate-spin text-green-400/50 w-8 h-8" />
                </div>
            ) : (
                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20 z-30 relative">
                    {users.map((user, idx) => {
                        const theme = getColorTheme(user.color);
                        const IconComponent = getIconComponent(user.icon);

                        return (
                            <div
                                key={user._id}
                                className="group relative bg-[#0a0a0a] border border-green-500/10 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400/30 hover:shadow-xl hover:shadow-purple-900/20 animate-in fade-in zoom-in-95"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                {/* Card Top */}
                                <div className="h-28 relative overflow-hidden bg-neutral-950/50 rounded-t-2xl">
                                    {/* Gradient Blob */}
                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${theme.gradient} opacity-20 blur-3xl rounded-full transform translate-x-8 -translate-y-8 group-hover:opacity-40 transition-opacity duration-500`} />
                                    {/* Purple tint */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent" />
                                </div>

                                {/* Avatar */}
                                <div className="relative -mt-10 flex justify-center z-20">
                                    <div className={cn(
                                        "w-20 h-20 rounded-2xl bg-[#0a0a0a] border-[3px] shadow-xl flex items-center justify-center transform rotate-3 group-hover:rotate-0 transition-transform duration-300 ease-out",
                                        theme.border
                                    )}>
                                        <IconComponent className={cn("w-9 h-9", theme.text)} strokeWidth={2.5} />
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="pt-4 pb-6 px-6 text-center space-y-5">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-white tracking-tight leading-tight">{user.name}</h3>
                                        <p className="font-arcade text-neutral-500 uppercase font-bold" style={{ fontSize: '0.38rem', letterSpacing: '0.2em' }}>
                                            {user.funNickname || 'Reclutaccia'}
                                        </p>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-neutral-900/80 rounded-lg p-2.5 border border-green-500/10 flex flex-col items-center justify-center">
                                            <span className="text-lg font-bold text-green-400 leading-none mb-1">{user.wins}</span>
                                            <span className="font-arcade text-neutral-600 uppercase font-bold" style={{ fontSize: '0.38rem' }}>Wins</span>
                                        </div>
                                        <div className="bg-neutral-900/80 rounded-lg p-2.5 border border-green-500/10 flex flex-col items-center justify-center">
                                            <span className="text-lg font-bold text-green-400/70 leading-none mb-1">{user.matchesPlayed || 0}</span>
                                            <span className="font-arcade text-neutral-600 uppercase font-bold" style={{ fontSize: '0.38rem' }}>Matches</span>
                                        </div>
                                    </div>

                                    <button
                                        data-nav="true"
                                        data-nav-group="players"
                                        tabIndex={0}
                                        className="arcade-btn-cyan w-full h-9 text-[0.45rem] uppercase tracking-widest flex items-center justify-center gap-2"
                                        onClick={() => handleOpenDialog(user)}
                                    >
                                        <Edit className="w-3 h-3" /> Configure
                                    </button>
                                </div>

                                {/* Bottom Color Line */}
                                <div className={cn("h-px w-full bg-gradient-to-r opacity-40 rounded-b-2xl", theme.gradient)} />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-[#0a0a0a] text-white border border-green-500/30 sm:max-w-md p-0 overflow-hidden gap-0 shadow-[0_0_40px_rgba(74,222,128,0.15)]">
                    <DialogHeader className="p-6 pb-2 bg-neutral-900/50 border-b border-green-500/15">
                        <DialogTitle className="font-arcade text-green-400 uppercase tracking-wider" style={{ fontSize: '0.75rem' }}>
                            {editingUser ? 'System Override' : 'New Challenger'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-arcade text-neutral-500 uppercase tracking-wider">Codename</label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="bg-black/50 border-green-500/20 text-white focus:border-yellow-400/50 focus:ring-0 h-10 font-bold"
                                placeholder="e.g. Viper"
                            />
                        </div>

                        {/* Color Picker */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-arcade text-neutral-500 uppercase tracking-wider">Energy Signature</label>
                            <div className="flex gap-2 justify-center flex-wrap bg-black/30 p-4 rounded-xl border border-green-500/15">
                                {AVAILABLE_COLORS.map(colorOption => (
                                    <button
                                        key={colorOption.id}
                                        onClick={() => setFormData({ ...formData, color: colorOption.id })}
                                        className={cn(
                                            "w-9 h-9 rounded-full border-2 transition-all duration-200 bg-gradient-to-br flex items-center justify-center",
                                            colorOption.gradient,
                                            formData.color === colorOption.id
                                                ? 'border-yellow-400 scale-110 shadow-[0_0_15px_rgba(234,179,8,0.4)] ring-2 ring-yellow-400/30 ring-offset-2 ring-offset-black'
                                                : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Icon Picker */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-arcade text-neutral-500 uppercase tracking-wider">Emblem</label>
                            <div className="grid grid-cols-6 gap-2 bg-black/30 p-4 rounded-xl border border-green-500/15 max-h-[160px] overflow-y-auto custom-scrollbar">
                                {AVAILABLE_ICONS.map(({ id, component: Icon }) => (
                                    <button
                                        key={id}
                                        onClick={() => setFormData({ ...formData, icon: id })}
                                        className={cn(
                                            "aspect-square rounded-lg flex items-center justify-center transition-all duration-200",
                                            formData.icon === id
                                                ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/50 shadow-lg scale-105'
                                                : 'text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800/50'
                                        )}
                                    >
                                        <Icon size={20} strokeWidth={2} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-2 bg-neutral-900/30">
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !formData.name}
                            className={cn("arcade-btn w-full h-12 text-xs tracking-widest flex items-center justify-center gap-2", (isSaving || !formData.name) ? "opacity-40 cursor-not-allowed" : "")}
                        >
                            {isSaving ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> PROCESSING...</>
                            ) : (
                                editingUser ? 'SALVA CONFIGURAZIONE' : 'INIZIALIZZA SFIDA'
                            )}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PlayerManagement;
