import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Keyboard, RotateCcw, Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { keyBindingService, ACTION_LABELS, type KeyBinding, type KeyAction } from '@/services/keyBindingService';
import { useKeyBindings } from '@/contexts/KeyBindingsContext';
import { useSpatialNav } from '@/hooks/useSpatialNav';
import { useAction } from '@/hooks/useAction';
import { cn } from '@/lib/utils';

interface GroupedBindings {
    action: KeyAction;
    label: string;
    bindings: KeyBinding[];
}

const KeyBindingsSettings = () => {
    const navigate = useNavigate();
    const { reloadBindings } = useKeyBindings();
    const [bindings, setBindings] = useState<KeyBinding[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [capturingAction, setCapturingAction] = useState<KeyAction | null>(null);

    useSpatialNav('settings');
    useAction('back', () => {
        if (capturingAction) setCapturingAction(null);
        else navigate('/settings');
    }, [capturingAction]);

    const loadBindings = useCallback(async () => {
        try {
            const data = await keyBindingService.getAll();
            setBindings(data);
        } catch (err) {
            console.error('Failed to load bindings', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadBindings(); }, [loadBindings]);

    const grouped: GroupedBindings[] = Object.entries(ACTION_LABELS).map(([action, label]) => ({
        action: action as KeyAction,
        label,
        bindings: bindings.filter(b => b.action === action),
    }));

    const handleDelete = async (id: number) => {
        await keyBindingService.delete(id);
        await loadBindings();
        await reloadBindings();
    };

    const handleReset = async () => {
        setIsLoading(true);
        const data = await keyBindingService.resetDefaults();
        setBindings(data);
        await reloadBindings();
        setIsLoading(false);
    };

    const startCapture = (action: KeyAction) => {
        setCapturingAction(action);
    };

    // Key capture listener
    useEffect(() => {
        if (!capturingAction) return;

        const handler = async (e: KeyboardEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const label = e.key.length === 1 ? e.key.toUpperCase() : e.code.replace(/^(Key|Digit)/, '');
            await keyBindingService.set(capturingAction, e.code, label);
            setCapturingAction(null);
            await loadBindings();
            await reloadBindings();
        };

        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [capturingAction, loadBindings, reloadBindings]);

    // Section grouping
    const navActions = grouped.filter(g => g.action.startsWith('nav_'));
    const generalActions = grouped.filter(g => g.action === 'confirm' || g.action === 'back');
    const gameActions = grouped.filter(g => g.action === 'add_point_left' || g.action === 'add_point_right' || g.action === 'undo');

    const renderSection = (title: string, items: GroupedBindings[]) => (
        <div className="space-y-3">
            <h3 className="text-xs font-arcade text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                <Keyboard size={12} /> {title}
            </h3>
            {items.map(({ action, label, bindings: actionBindings }) => (
                <div
                    key={action}
                    className="flex items-center justify-between bg-neutral-900/60 border border-white/5 rounded-xl px-5 py-4"
                >
                    <div className="flex-1">
                        <div className="font-arcade text-white" style={{ fontSize: '0.55rem' }}>{label.toUpperCase()}</div>
                        <div className="text-neutral-600 font-mono mt-1" style={{ fontSize: '0.5rem' }}>{action}</div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-end">
                        {actionBindings.map(b => (
                            <div
                                key={b._id}
                                className="flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-1.5 font-arcade text-neutral-300"
                                style={{ fontSize: '0.5rem' }}
                            >
                                <Keyboard size={11} className="text-neutral-500" />
                                {b.label || b.keyCode}
                                <button
                                    onClick={() => handleDelete(b._id)}
                                    className="ml-1 text-neutral-600 hover:text-red-400 transition-colors"
                                >
                                    <X size={11} />
                                </button>
                            </div>
                        ))}

                        {capturingAction === action ? (
                            <div className="flex items-center gap-2 bg-green-900/30 border border-green-500/50 rounded-lg px-3 py-1.5 font-arcade text-green-400 animate-pulse" style={{ fontSize: '0.5rem' }}>
                                <Keyboard size={11} />
                                PREMI UN TASTO...
                            </div>
                        ) : (
                            <button
                                onClick={() => startCapture(action)}
                                data-nav="true"
                                data-nav-group="settings"
                                tabIndex={0}
                                className="p-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50"
                            >
                                <Plus size={14} />
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen text-white p-4 md:p-8 flex flex-col items-center font-mono selection:bg-purple-500/30">
            {/* CRT overlays */}
            <div className="fixed inset-0 scanlines z-10 pointer-events-none" />
            <div className="fixed inset-0 crt-vignette z-20 pointer-events-none" />

            <div className="relative z-30 w-full max-w-3xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/settings')}
                            data-nav="true"
                            data-nav-group="settings"
                            tabIndex={0}
                            className="p-3 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="font-arcade text-green-400" style={{ fontSize: '1.4rem' }}>REMOTE CONTROL</h1>
                            <p className="text-neutral-500 text-xs uppercase tracking-widest mt-1">Configura i tasti di gioco</p>
                        </div>
                    </div>

                    <button
                        onClick={handleReset}
                        data-nav="true"
                        data-nav-group="settings"
                        tabIndex={0}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors font-arcade disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50"
                        style={{ fontSize: '0.45rem' }}
                    >
                        <RotateCcw size={12} />
                        RESET DEFAULT
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="animate-spin text-neutral-500 w-8 h-8" />
                    </div>
                ) : (
                    <div className="space-y-8 pb-32">
                        {renderSection('Navigation', navActions)}
                        {renderSection('General', generalActions)}
                        {renderSection('Game Actions', gameActions)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KeyBindingsSettings;
