import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { keyBindingService, type KeyBinding, type KeyAction } from '@/services/keyBindingService';

type ActionHandler = (e: KeyboardEvent) => void;

interface KeyBindingsContextValue {
    bindings: KeyBinding[];
    registerAction: (action: KeyAction, handler: ActionHandler) => () => void;
    reloadBindings: () => Promise<void>;
}

const KeyBindingsContext = createContext<KeyBindingsContextValue | null>(null);

export function KeyBindingsProvider({ children }: { children: ReactNode }) {
    const [bindings, setBindings] = useState<KeyBinding[]>([]);
    const [keyMap, setKeyMap] = useState<Map<string, KeyAction[]>>(new Map());
    const actionHandlersRef = useRef<Map<KeyAction, ActionHandler>>(new Map());

    const loadBindings = useCallback(async () => {
        try {
            const data = await keyBindingService.getAll();
            setBindings(data);

            const map = new Map<string, KeyAction[]>();
            for (const b of data) {
                if (!map.has(b.keyCode)) map.set(b.keyCode, []);
                map.get(b.keyCode)!.push(b.action);
            }
            setKeyMap(map);
        } catch (err) {
            console.error('Failed to load key bindings', err);
        }
    }, []);

    useEffect(() => { loadBindings(); }, [loadBindings]);

    const registerAction = useCallback((action: KeyAction, handler: ActionHandler) => {
        actionHandlersRef.current.set(action, handler);
        return () => { actionHandlersRef.current.delete(action); };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;
            // Skip nav actions when a dropdown listbox is open (let it handle its own keyboard)
            const isDropdownOpen = !!document.querySelector('[role="listbox"]');
            const isNavAction = e.code.startsWith('Arrow');
            if (isDropdownOpen && isNavAction) return;

            const actions = keyMap.get(e.code);
            if (!actions) return;

            for (const action of actions) {
                const handler = actionHandlersRef.current.get(action);
                if (handler) {
                    e.preventDefault();
                    handler(e);
                    break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [keyMap]);

    return (
        <KeyBindingsContext.Provider value={{ bindings, registerAction, reloadBindings: loadBindings }}>
            {children}
        </KeyBindingsContext.Provider>
    );
}

export function useKeyBindings(): KeyBindingsContextValue {
    const ctx = useContext(KeyBindingsContext);
    if (!ctx) throw new Error('useKeyBindings must be used within KeyBindingsProvider');
    return ctx;
}
