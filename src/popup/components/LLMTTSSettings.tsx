import { useState, useEffect } from 'react';
import { Key, Volume2, Zap, Brain } from 'lucide-react';

interface LLMTTSSettingsProps {
  provider: 'gemini' | 'openai' | 'elevenlabs';
  isEnabled: boolean;
  apiKey: string;
  voice: string;
  model: string;
  onToggle: (enabled: boolean) => void;
  onApiKeyChange: (apiKey: string) => void;
  onVoiceChange: (voice: string) => void;
  onModelChange: (model: string) => void;
}

const PROVIDER_CONFIG = {
  gemini: {
    name: 'Gemini TTS',
    icon: Brain,
    color: 'blue',
    apiKeyPlaceholder: 'AIza...',
    apiKeyUrl: 'https://aistudio.google.com/app/apikey',
    voices: [
      { id: 'Puck', name: 'Puck', description: 'Natural, expressive' },
      { id: 'Charon', name: 'Charon', description: 'Deep, authoritative' },
      { id: 'Kore', name: 'Kore', description: 'Warm, friendly' },
      { id: 'Fenrir', name: 'Fenrir', description: 'Strong, confident' }
    ],
    models: [
      { id: 'gemini-2.5-flash-preview-tts', name: 'Gemini 2.5 Flash Preview TTS', description: 'Fast, efficient' },
      { id: 'gemini-2.5-pro-preview-tts', name: 'Gemini 2.5 Pro Preview TTS', description: 'High quality' }
    ]
  },
  openai: {
    name: 'OpenAI TTS',
    icon: Zap,
    color: 'green',
    apiKeyPlaceholder: 'sk-...',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    voices: [
      { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced' },
      { id: 'echo', name: 'Echo', description: 'Male, clear' },
      { id: 'fable', name: 'Fable', description: 'British, storytelling' },
      { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative' },
      { id: 'nova', name: 'Nova', description: 'Young, energetic' },
      { id: 'shimmer', name: 'Shimmer', description: 'Soft, warm' }
    ],
    models: [
      { id: 'tts-1', name: 'TTS-1', description: 'Standard quality' },
      { id: 'tts-1-hd', name: 'TTS-1 HD', description: 'High definition' }
    ]
  },
  elevenlabs: {
    name: 'ElevenLabs',
    icon: Volume2,
    color: 'purple',
    apiKeyPlaceholder: 'sk_...',
    apiKeyUrl: 'https://elevenlabs.io/app/speech-synthesis',
    voices: [
      { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Deep, authoritative' },
      { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Warm, friendly' },
      { id: 'VR6AewLTigWG4xSOukaG', name: 'Antoni', description: 'Smooth, professional' },
      { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', description: 'Young, energetic' }
    ],
    models: [
      { id: 'eleven_turbo_v2', name: 'Turbo v2', description: 'Fast, efficient' },
      { id: 'eleven_multilingual_v2', name: 'Multilingual v2', description: 'Multiple languages' }
    ]
  }
};

export function LLMTTSSettings({
  provider,
  isEnabled,
  apiKey,
  voice,
  model,
  onToggle,
  onApiKeyChange,
  onVoiceChange,
  onModelChange
}: LLMTTSSettingsProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  
  const config = PROVIDER_CONFIG[provider];
  const IconComponent = config.icon;

  useEffect(() => {
    setTempApiKey(apiKey);
  }, [apiKey]);

  const handleApiKeySubmit = () => {
    onApiKeyChange(tempApiKey);
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconComponent className={`w-5 h-5 text-${config.color}-500`} />
          <h3 className="font-semibold text-gray-900">{config.name}</h3>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {isEnabled && (
        <>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Key className="w-4 h-4" />
              API Key
            </label>
            <div className="flex gap-2">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder={config.apiKeyPlaceholder}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={handleApiKeySubmit}
                disabled={tempApiKey === apiKey}
                className="px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Get your API key from{' '}
              <a
                href={config.apiKeyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {config.name}
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Volume2 className="w-4 h-4" />
              Voice
            </label>
            <select
              value={voice}
              onChange={(e) => onVoiceChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {config.voices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} - {v.description}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Model</label>
            <select
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {config.models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} - {m.description}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}