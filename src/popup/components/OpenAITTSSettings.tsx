import React, { useState, useEffect } from 'react';
import { Key, Volume2, Zap } from 'lucide-react';

interface OpenAITTSSettingsProps {
  isEnabled: boolean;
  apiKey: string;
  voice: string;
  model: 'tts-1' | 'tts-1-hd';
  onToggle: (enabled: boolean) => void;
  onApiKeyChange: (apiKey: string) => void;
  onVoiceChange: (voice: string) => void;
  onModelChange: (model: 'tts-1' | 'tts-1-hd') => void;
}

const OPENAI_VOICES = [
  { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced' },
  { id: 'echo', name: 'Echo', description: 'Male, clear' },
  { id: 'fable', name: 'Fable', description: 'British, storytelling' },
  { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative' },
  { id: 'nova', name: 'Nova', description: 'Young, energetic' },
  { id: 'shimmer', name: 'Shimmer', description: 'Soft, warm' }
];

export function OpenAITTSSettings({
  isEnabled,
  apiKey,
  voice,
  model,
  onToggle,
  onApiKeyChange,
  onVoiceChange,
  onModelChange
}: OpenAITTSSettingsProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);

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
          <Zap className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900">OpenAI TTS</h3>
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
                placeholder="sk-..."
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
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                OpenAI Platform
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
              {OPENAI_VOICES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} - {v.description}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Quality</label>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="model"
                  value="tts-1"
                  checked={model === 'tts-1'}
                  onChange={(e) => onModelChange(e.target.value as 'tts-1')}
                  className="text-blue-500"
                />
                <span className="text-sm">Standard (tts-1)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="model"
                  value="tts-1-hd"
                  checked={model === 'tts-1-hd'}
                  onChange={(e) => onModelChange(e.target.value as 'tts-1-hd')}
                  className="text-blue-500"
                />
                <span className="text-sm">HD (tts-1-hd)</span>
              </label>
            </div>
            <p className="text-xs text-gray-500">
              HD model provides higher quality but costs more
            </p>
          </div>
        </>
      )}
    </div>
  );
}