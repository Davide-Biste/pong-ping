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
        else navigate('/');
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
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{title}</h3>
            {items.map(({ action, label, bindings: actionBindings }) => (
                <div
                    key={action}
                    className="flex items-center justify-between bg-neutral-900/60 border border-white/5 rounded-xl px-5 py-4"
                >
                    <div className="flex-1">
                        <div className="text-sm font-bold text-white">{label}</div>
                        <div className="text-xs text-neutral-500 font-mono">{action}</div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-end">
                        {actionBindings.map(b => (
                            <div
                                key={b._id}
                                className="flex items-center gap-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-mono text-neutral-300"
                            >
                                <Keyboard size={12} className="text-neutral-500" />
                                {b.label || b.keyCode}
                                <button
                                    onClick={() => handleDelete(b._id)}
                                    className="ml-1 text-neutral-600 hover:text-red-400 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}

                        {capturingAction === action ? (
                            <div className="flex items-center gap-2 bg-green-900/30 border border-green-500/50 rounded-lg px-3 py-1.5 text-xs font-mono text-green-400 animate-pulse">
                                <Keyboard size={12} />
                                Premi un tasto...
                            </div>
                        ) : (
                            <button
                                onClick={() => startCapture(action)}
                                data-nav="true"
                                data-nav-group="settings"
                                tabIndex={0}
                                className="p-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
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
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 flex flex-col items-center font-sans selection:bg-neutral-500/30">
            {/* Header */}
            <div className="w-full max-w-3xl flex items-center justify-between mb-10 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        data-nav="true"
                        data-nav-group="settings"
                        tabIndex={0}
                        className="p-3 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter text-white">REMOTE CONTROL</h1>
                        <p className="text-neutral-500 font-mono text-xs uppercase tracking-[0.2em] mt-1">
                            Configure keyboard bindings
                        </p>
                    </div>
                </div>

                <Button
                    variant="outline"
                    onClick={handleReset}
                    data-nav="true"
                    data-nav-group="settings"
                    tabIndex={0}
                    className="border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800"
                    disabled={isLoading}
                >
                    <RotateCcw size={14} className="mr-2" />
                    Reset Default
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-neutral-500 w-8 h-8" />
                </div>
            ) : (
                <div className="w-full max-w-3xl space-y-8 pb-32">
                    {renderSection('Navigation', navActions)}
                    {renderSection('General', generalActions)}
                    {renderSection('Game Actions', gameActions)}
                </div>
            )}
        </div>
    );
};

export default KeyBindingsSettings;
