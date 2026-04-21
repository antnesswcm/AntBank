import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Settings } from '../types';

interface SettingsContextValue {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  setShowAnalysis: (value: boolean) => void;
  setAutoShowAnswer: (value: boolean) => void;
  setRandomOrder: (value: boolean) => void;
  setAlwaysOnTop: (value: boolean) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  showAnalysis: true,
  autoShowAnswer: true,
  randomOrder: false,
  alwaysOnTop: false,
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    getCurrentWindow()
      .setAlwaysOnTop(settings.alwaysOnTop)
      .catch(() => {});
  }, [settings.alwaysOnTop]);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const setShowAnalysis = useCallback((value: boolean) => {
    setSettings(prev => ({ ...prev, showAnalysis: value }));
  }, []);

  const setAutoShowAnswer = useCallback((value: boolean) => {
    setSettings(prev => ({ ...prev, autoShowAnswer: value }));
  }, []);

  const setRandomOrder = useCallback((value: boolean) => {
    setSettings(prev => ({ ...prev, randomOrder: value }));
  }, []);

  const setAlwaysOnTop = useCallback((value: boolean) => {
    setSettings(prev => ({ ...prev, alwaysOnTop: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const value: SettingsContextValue = {
    settings,
    updateSettings,
    setShowAnalysis,
    setAutoShowAnswer,
    setRandomOrder,
    setAlwaysOnTop,
    resetSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export { SettingsContext };
