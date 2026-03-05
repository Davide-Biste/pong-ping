import { useEffect } from 'react';
import { useKeyBindings } from '@/contexts/KeyBindingsContext';
import type { KeyAction } from '@/services/keyBindingService';

/**
 * Register a handler for a named action. Active while the component is mounted.
 */
export function useAction(action: KeyAction, handler: ((e: KeyboardEvent) => void) | null, deps: unknown[] = []) {
    const { registerAction } = useKeyBindings();

    useEffect(() => {
        if (!handler) return;
        return registerAction(action, handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [action, registerAction, ...deps]);
}
