import { useState, useEffect } from 'react';

interface LLMTTSState {
  provider: 'gemini' | 'openai' | 'elevenlabs';
  enabled: boolean;
  apiKey: string;
  voice: string;
  model: string;
}

export function useLLMTTS() {
  const [state, setState] = useState<LLMTTSState>({
    provider: 'gemini',
    enabled: false,
    apiKey: '',
    voice: 'Puck',
    model: 'gemini-2.5-flash-preview-tts'
  });

  // Load settings from storage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await new Promise<any>((resolve) => {
          chrome.storage.sync.get([
            'llmTTSProvider',
            'geminiTTSConfig',
            'openaiTTSConfig',
            'elevenlabsTTSConfig'
          ], resolve);
        });

        const provider = result.llmTTSProvider || 'gemini';
        const config = result[`${provider}TTSConfig`] || {};

        setState({
          provider,
          enabled: config.enabled || false,
          apiKey: config.apiKey || '',
          voice: config.voice || (provider === 'gemini' ? 'Puck' : provider === 'openai' ? 'alloy' : 'pNInz6obpgDQGcFmaJgB'),
          model: config.model || (provider === 'gemini' ? 'gemini-2.5-flash-preview-tts' : provider === 'openai' ? 'tts-1' : 'eleven_turbo_v2')
        });
      }
    } catch (error) {
      console.error('Failed to load OpenAI TTS settings:', error);
    }
  };

  const updateSettings = async (updates: Partial<LLMTTSState>) => {
    const newState = { ...state, ...updates };
    setState(newState);

    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const configKey = `${newState.provider}TTSConfig`;
        const config = {
          provider: newState.provider,
          enabled: newState.enabled,
          apiKey: newState.apiKey,
          voice: newState.voice,
          model: newState.model
        };

        await new Promise<void>((resolve) => {
          chrome.storage.sync.set({
            llmTTSProvider: newState.provider,
            [configKey]: config
          }, resolve);
        });

        // Notify background script of changes
        chrome.runtime.sendMessage({
          type: 'LLM_TTS_SETTINGS_CHANGED',
          settings: config
        });
      }
    } catch (error) {
      console.error('Failed to save LLM TTS settings:', error);
    }
  };

  return {
    ...state,
    updateSettings
  };
}