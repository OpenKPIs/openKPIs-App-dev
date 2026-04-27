'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Provider = 'openai' | 'anthropic' | 'google';

export interface AISettingsData {
  provider: Provider;
  model: string;
  customModel: string;
  baseUrl: string;
  openaiKey: string;
  anthropicKey: string;
  googleKey: string;
}

const DEFAULT_SETTINGS: AISettingsData = {
  provider: 'openai',
  model: 'gpt-5.4',
  customModel: '',
  baseUrl: '',
  openaiKey: '',
  anthropicKey: '',
  googleKey: '',
};

interface AIContextType {
  settings: AISettingsData;
  updateSettings: (newSettings: Partial<AISettingsData>) => void;
  isSettingsOpen: boolean;
  setSettingsOpen: (isOpen: boolean) => void;
  activeKey: string;
  activeModel: string;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AISettingsData>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('openkpis_ai_settings');
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Failed to load AI settings from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  const updateSettings = (newSettings: Partial<AISettingsData>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('openkpis_ai_settings', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save AI settings to localStorage', e);
      }
      return updated;
    });
  };

  const activeKey =
    settings.provider === 'openai' ? settings.openaiKey :
    settings.provider === 'anthropic' ? settings.anthropicKey :
    settings.provider === 'google' ? settings.googleKey : '';

  const activeModel = settings.customModel.trim() || settings.model;

  if (!isLoaded) {
    return null; // Prevent hydration mismatch
  }

  return (
    <AIContext.Provider value={{ settings, updateSettings, isSettingsOpen, setSettingsOpen, activeKey, activeModel }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}
