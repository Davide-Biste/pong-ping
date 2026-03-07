import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { invoke } from '@tauri-apps/api/core';

export type Language = 'en' | 'it';

export interface BgTheme {
    id: string;
    label: string;
    color1: string;
    color2: string;
    color3: string;
}

export const BG_THEMES: BgTheme[] = [
    { id: 'purple', label: 'Viola',  color1: '#9333EA', color2: '#4C1D95', color3: '#0F0520' },
    { id: 'blue',   label: 'Oceano', color1: '#0284C7', color2: '#0C4A6E', color3: '#030711' },
    { id: 'red',    label: 'Fuoco',  color1: '#DC2626', color2: '#7F1D1D', color3: '#0C0202' },
    { id: 'green',  label: 'Matrix', color1: '#16A34A', color2: '#14532D', color3: '#020B04' },
    { id: 'gold',   label: 'Oro',    color1: '#D97706', color2: '#78350F', color3: '#0C0700' },
    { id: 'pink',   label: 'Neon',   color1: '#DB2777', color2: '#831843', color3: '#0C0108' },
];

const DEFAULT_BG_THEME = BG_THEMES[0];
const DEFAULT_LANGUAGE: Language = 'it';

interface SettingsContextValue {
    bgTheme: BgTheme;
    setBgTheme: (theme: BgTheme) => void;
    language: Language;
    setLanguage: (lang: Language) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [bgTheme, setBgThemeState] = useState<BgTheme>(DEFAULT_BG_THEME);
    const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

    // Load from DB on mount
    useEffect(() => {
        invoke<string | null>('get_setting', { key: 'bg_theme' }).then(val => {
            if (val) {
                const found = BG_THEMES.find(t => t.id === val);
                if (found) setBgThemeState(found);
            }
        }).catch(() => {});

        invoke<string | null>('get_setting', { key: 'language' }).then(val => {
            if (val === 'en' || val === 'it') setLanguageState(val);
        }).catch(() => {});
    }, []);

    const setBgTheme = (theme: BgTheme) => {
        setBgThemeState(theme);
        invoke('set_setting', { key: 'bg_theme', value: theme.id }).catch(() => {});
    };

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        invoke('set_setting', { key: 'language', value: lang }).catch(() => {});
    };

    return (
        <SettingsContext.Provider value={{ bgTheme, setBgTheme, language, setLanguage }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings(): SettingsContextValue {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
    return ctx;
}
