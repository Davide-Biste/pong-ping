import { invoke } from '@tauri-apps/api/core';

export interface KeyBinding {
    _id: number;
    action: KeyAction;
    keyCode: string;
    label: string;
    isDefault: boolean;
}

export type KeyAction =
    | 'nav_up'
    | 'nav_down'
    | 'nav_left'
    | 'nav_right'
    | 'confirm'
    | 'back'
    | 'add_point_left'
    | 'add_point_right'
    | 'undo';

export const ACTION_LABELS: Record<KeyAction, string> = {
    nav_up: 'Navigate Up',
    nav_down: 'Navigate Down',
    nav_left: 'Navigate Left',
    nav_right: 'Navigate Right',
    confirm: 'Confirm / Select',
    back: 'Back / Cancel',
    add_point_left: 'Add Point (Left Team)',
    add_point_right: 'Add Point (Right Team)',
    undo: 'Undo Last Point',
};

export const keyBindingService = {
    getAll: async (): Promise<KeyBinding[]> => {
        return await invoke('get_key_bindings');
    },

    set: async (action: KeyAction, keyCode: string, label: string): Promise<KeyBinding> => {
        return await invoke('set_key_binding', { action, keyCode, label });
    },

    delete: async (id: number): Promise<void> => {
        return await invoke('delete_key_binding', { id });
    },

    resetDefaults: async (): Promise<KeyBinding[]> => {
        return await invoke('reset_key_bindings');
    },
};
