import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type ColorblindMode = 'none' | 'deuteranopia' | 'protanopia' | 'achromatopsia';
type ReadingBackground = 'white' | 'sepia' | 'dark';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  colorblindMode: ColorblindMode;
  readingMode: boolean;
  readingFontSize: number;
  readingLineHeight: number;
  readingFontFamily: 'sans' | 'serif' | 'mono';
  readingBackground: ReadingBackground;
  setTheme: (theme: Theme) => void;
  setColorblindMode: (mode: ColorblindMode) => void;
  setReadingMode: (on: boolean) => void;
  setReadingFontSize: (size: number) => void;
  setReadingLineHeight: (lh: number) => void;
  setReadingFontFamily: (ff: 'sans' | 'serif' | 'mono') => void;
  setReadingBackground: (bg: ReadingBackground) => void;
  resetReadingDefaults: () => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') return getSystemTheme();
  return theme;
}

function applyColorblindMode(mode: ColorblindMode) {
  if (mode === 'none') {
    document.documentElement.removeAttribute('data-colorblind');
  } else {
    document.documentElement.setAttribute('data-colorblind', mode);
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: getSystemTheme(),
      colorblindMode: 'none',
      readingMode: false,
      readingFontSize: 18,
      readingLineHeight: 1.8,
      readingFontFamily: 'sans' as const,
      readingBackground: 'white',

      setTheme: (theme) => {
        const resolved = resolveTheme(theme);
        set({ theme, resolvedTheme: resolved });
        if (resolved === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      },

      setColorblindMode: (mode) => {
        set({ colorblindMode: mode });
        applyColorblindMode(mode);
      },

      setReadingMode: (on) => set({ readingMode: on }),
      setReadingFontSize: (size) => set({ readingFontSize: size }),
      setReadingLineHeight: (lh) => set({ readingLineHeight: lh }),
      setReadingFontFamily: (ff) => set({ readingFontFamily: ff }),
      setReadingBackground: (bg) => set({ readingBackground: bg }),
      resetReadingDefaults: () => set({
        readingFontSize: 18, readingLineHeight: 1.8,
        readingFontFamily: 'sans', readingBackground: 'white',
      }),
    }),
    {
      name: 'eduflow-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolved = resolveTheme(state.theme);
          state.resolvedTheme = resolved;
          if (resolved === 'dark') document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
          applyColorblindMode(state.colorblindMode || 'none');
        }
      },
    }
  )
);