# LLM TTS Integration Example

Here's how to integrate the multi-provider LLM TTS functionality into your existing popup:

## 1. Update your main popup component

```tsx
import React, { useState } from 'react';
import { SettingsPanel } from './components/SettingsPanel';
import { useLLMTTS } from './hooks/useOpenAITTS';

export function MainPopup() {
  const [showSettings, setShowSettings] = useState(false);
  const llmTTS = useLLMTTS();
  
  // Your existing state...
  const [playbackState, setPlaybackState] = useState({
    speed: 1.0,
    volume: 1.0
  });
  
  const [appSettings, setAppSettings] = useState({
    showWaveform: true,
    showVolumeOnMain: false,
    showSpeedOnMain: false,
    highlightFollowing: true,
    floatingButtonBehavior: 'always' as const
  });

  const [readingStats] = useState({
    todayReadingTime: 0,
    totalDocumentsRead: 0
  });

  return (
    <div className="relative w-full h-full">
      {/* Your main popup content */}
      
      <SettingsPanel
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        playbackState={playbackState}
        appSettings={appSettings}
        readingStats={readingStats}
        llmTTS={llmTTS}
        onSpeedChange={(speed) => setPlaybackState(prev => ({ ...prev, speed }))}
        onVolumeChange={(volume) => setPlaybackState(prev => ({ ...prev, volume }))}
        onSettingsChange={(updates) => setAppSettings(prev => ({ ...prev, ...updates }))}
        onLLMTTSChange={llmTTS.updateSettings}
      />
    </div>
  );
}
```

## 2. Update your background script message handler

```tsx
// In your background/messageHandler.ts or similar
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'LLM_TTS_SETTINGS_CHANGED') {
    // Update TTS manager with new provider settings
    ttsManager.updateLLMTTSProvider(message.settings);
    
    if (message.settings.enabled) {
      // Set voice if it's an LLM voice
      const llmVoiceURI = `${message.settings.provider}-${message.settings.voice}`;
      ttsManager.setVoice(llmVoiceURI);
    }
  }
});
```

## 3. Initialize TTS Manager with OpenAI support

```tsx
// When creating your TTS manager
const ttsManager = new TTSManager({
  enableLLMTTS: true, // Enable by default or load from settings
  defaultProvider: 'gemini', // Default to Gemini
  enableAIEnhancement: true // This enhances text before sending to TTS
});
```

## 4. Voice Selection

The LLM voices will appear in your voice selector with names like:
- **Gemini**: "Gemini Puck", "Gemini Charon", "Gemini Kore", "Gemini Fenrir"
- **OpenAI**: "OpenAI Alloy", "OpenAI Echo", "OpenAI Fable", etc.
- **ElevenLabs**: "ElevenLabs Adam", "ElevenLabs Bella", etc.

Users can switch between regular system voices and LLM voices seamlessly.

## 5. Multi-Provider Management

API keys are stored securely in Chrome's sync storage per provider. Users can:
- **Gemini TTS** (Default): Google AI Studio API key, 4 voices, 2 models
- **OpenAI TTS**: OpenAI Platform API key, 6 voices, 2 models  
- **ElevenLabs**: ElevenLabs API key, 6+ voices, 4 models
- Toggle each provider on/off independently
- Switch between providers seamlessly
- Fall back to system voices anytime

## Benefits

- **Multiple Providers**: Choose from Gemini, OpenAI, or ElevenLabs based on your needs
- **High Quality**: All providers produce very natural-sounding speech
- **Variety**: 14+ different voice options across all providers
- **Speed Control**: Supports variable speed control (provider-dependent)
- **Caching**: Audio is cached to avoid repeated API calls for the same text
- **Fallback**: Automatically falls back to system TTS if LLM providers fail
- **Cost Effective**: Only generates audio when needed, with caching to minimize API usage
- **Pluggable**: Easy to add new providers in the future

## Usage Tips

### Gemini TTS (Default)
- **API Key**: Get from https://aistudio.google.com/app/apikey
- **Cost**: Free tier available, then pay-per-use
- **Models**: Flash (fast) vs Pro (higher quality)
- **Voices**: 4 distinct voices with different characteristics

### OpenAI TTS
- **API Key**: Get from https://platform.openai.com/api-keys  
- **Cost**: TTS-1 ($15/1M chars), TTS-1-HD ($30/1M chars)
- **Quality**: TTS-1-HD provides noticeably better quality
- **Voices**: 6 voices with different personalities

### ElevenLabs
- **API Key**: Get from https://elevenlabs.io/app/speech-synthesis
- **Cost**: Free tier (10k chars/month), then subscription
- **Quality**: Highest quality, most natural sounding
- **Voices**: Professional voice actors, very expressive

### General
- **Caching**: Audio is cached in memory during the session to improve performance
- **Speed Control**: Varies by provider (Gemini: 0.25x-4x, OpenAI: 0.25x-4x, ElevenLabs: 0.5x-2x)