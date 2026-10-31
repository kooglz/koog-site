import { useEffect, useState } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';
const savedTheme = (): ThemeMode => {
  try {
    const value = localStorage.getItem('koog-theme');
    return value === 'dark' || value === 'light' ? value : 'system';
  } catch { return 'system'; }
};

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(savedTheme);
  const [system, setSystem] = useState<'light' | 'dark'>(() => matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const theme = mode === 'system' ? system : mode;
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystem(media.matches ? 'dark' : 'light');
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111214' : '#ffffff');
  }, [theme]);
  const setThemeMode = (next: ThemeMode) => {
    setMode(next);
    try { localStorage.setItem('koog-theme', next); } catch { /* Preferences remain usable without storage. */ }
  };
  return { theme, mode, setThemeMode };
}
