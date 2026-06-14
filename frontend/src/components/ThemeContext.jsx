import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // Get theme from local storage or default to 'default'
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'default';
    });

    useEffect(() => {
        const root = window.document.body;

        // Remove all theme attributes first
        root.removeAttribute('data-theme');

        // Set the new theme
        if (theme !== 'default') {
            root.setAttribute('data-theme', theme);
        }

        // Save to local storage
        localStorage.setItem('theme', theme);
    }, [theme]);

    const availableThemes = [
        { id: 'default', label: '🌸 Peachy Pink' },
        { id: 'light', label: '☀️ Light' },
        { id: 'dark', label: '🌙 Dark' },
        { id: 'midnight', label: '🌃 Midnight' },
        { id: 'ai', label: '🤖 AI Cyber' },
        { id: 'nature', label: '🌿 Nature' }
    ];

    return (
        <ThemeContext.Provider value={{ theme, setTheme, availableThemes }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
