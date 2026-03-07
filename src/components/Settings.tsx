import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Keyboard, Globe, Palette, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSpatialNav } from '@/hooks/useSpatialNav';
import { useAction } from '@/hooks/useAction';
import { useSettings, BG_THEMES, type BgTheme, type Language } from '@/contexts/SettingsContext';

const LANGUAGES = [
    { id: 'it' as Language, label: 'Italiano', flag: '🇮🇹' },
    { id: 'en' as Language, label: 'English',  flag: '🇬🇧' },
];

const Settings = () => {
    const navigate = useNavigate();
    const { bgTheme, setBgTheme, language, setLanguage } = useSettings();

    useSpatialNav('settings');
    useAction('back', () => navigate('/'), []);
    useAction('confirm', () => (document.activeElement as HTMLElement)?.click(), []);

    return (
        <div className="min-h-screen text-white p-4 md:p-8 flex flex-col items-center font-mono selection:bg-purple-500/30">
            {/* CRT overlays */}
            <div className="fixed inset-0 scanlines z-10 pointer-events-none" />
            <div className="fixed inset-0 crt-vignette z-20 pointer-events-none" />

            <div className="relative z-30 w-full max-w-3xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <button
                        onClick={() => navigate('/')}
                        data-nav="true"
                        data-nav-group="settings"
                        tabIndex={0}
                        className="p-3 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="font-arcade text-green-400" style={{ fontSize: '1.4rem' }}>IMPOSTAZIONI</h1>
                        <p className="text-neutral-500 text-xs uppercase tracking-widest mt-1">System Settings</p>
                    </div>
                </div>

                <div className="space-y-10">
                    {/* ── Remote Control ── */}
                    <section className="space-y-3">
                        <h2 className="text-xs font-arcade text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                            <Keyboard size={12} /> Remote Control
                        </h2>
                        <button
                            onClick={() => navigate('/settings/remote')}
                            data-nav="true"
                            data-nav-group="settings"
                            tabIndex={0}
                            className="w-full flex items-center justify-between bg-neutral-900/60 border border-white/5 hover:border-green-500/30 rounded-xl px-6 py-5 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                    <Keyboard size={18} className="text-green-400" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-white text-sm">Tasti di gioco</div>
                                    <div className="text-xs text-neutral-500 mt-0.5">Configura i tasti del controller</div>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-neutral-600 group-hover:text-green-400 transition-colors" />
                        </button>
                    </section>

                    {/* ── Tema Sfondo ── */}
                    <section className="space-y-3">
                        <h2 className="text-xs font-arcade text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                            <Palette size={12} /> Tema Sfondo
                        </h2>
                        <div className="bg-neutral-900/60 border border-white/5 rounded-xl px-6 py-5">
                            <div className="grid grid-cols-3 gap-3">
                                {BG_THEMES.map((theme: BgTheme) => {
                                    const isActive = bgTheme.id === theme.id;
                                    return (
                                        <button
                                            key={theme.id}
                                            onClick={() => setBgTheme(theme)}
                                            data-nav="true"
                                            data-nav-group="settings"
                                            tabIndex={0}
                                            className={cn(
                                                "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                                                isActive
                                                    ? "border-white/60 bg-white/5 scale-105"
                                                    : "border-white/5 hover:border-white/20"
                                            )}
                                        >
                                            {/* Color preview */}
                                            <div className="w-12 h-12 rounded-lg overflow-hidden relative">
                                                <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 40%, ${theme.color1}, ${theme.color2}, ${theme.color3})` }} />
                                            </div>
                                            <span className={cn(
                                                "font-arcade text-center",
                                                isActive ? "text-white" : "text-neutral-500"
                                            )} style={{ fontSize: '0.45rem' }}>
                                                {theme.label.toUpperCase()}
                                            </span>
                                            {isActive && (
                                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* ── Lingua ── */}
                    <section className="space-y-3">
                        <h2 className="text-xs font-arcade text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                            <Globe size={12} /> Lingua
                        </h2>
                        <div className="bg-neutral-900/60 border border-white/5 rounded-xl px-6 py-5">
                            <div className="grid grid-cols-2 gap-3">
                                {LANGUAGES.map(lang => {
                                    const isActive = language === lang.id;
                                    return (
                                        <button
                                            key={lang.id}
                                            onClick={() => setLanguage(lang.id)}
                                            data-nav="true"
                                            data-nav-group="settings"
                                            tabIndex={0}
                                            className={cn(
                                                "flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                                                isActive
                                                    ? "border-green-500/60 bg-green-500/10 text-green-400"
                                                    : "border-white/5 hover:border-white/20 text-neutral-400"
                                            )}
                                        >
                                            <span className="text-2xl">{lang.flag}</span>
                                            <span className="font-arcade" style={{ fontSize: '0.55rem' }}>{lang.label.toUpperCase()}</span>
                                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Settings;
