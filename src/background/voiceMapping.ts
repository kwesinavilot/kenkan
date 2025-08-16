// Voice mapping system - maps branded voices to LLM providers
export interface VoiceMapping {
  brandedName: string;
  provider: 'gemini' | 'openai' | 'elevenlabs' | 'system';
  llmVoice: string;
  model: string;
  description: string;
}

// Hardcoded API keys (replace with your actual keys)
export const API_KEYS = {
  gemini: 'YOUR_GEMINI_API_KEY_HERE',
  openai: 'YOUR_OPENAI_API_KEY_HERE', 
  elevenlabs: 'YOUR_ELEVENLABS_API_KEY_HERE'
};

// Map your branded voices to LLM voices
export const VOICE_MAPPINGS: VoiceMapping[] = [
  {
    brandedName: 'Kwame',
    provider: 'gemini',
    llmVoice: 'Puck',
    model: 'gemini-2.5-flash-preview-tts',
    description: 'Expressive Storyteller - Enhanced with Gemini AI'
  },
  {
    brandedName: 'Sandra', 
    provider: 'gemini',
    llmVoice: 'Kore',
    model: 'gemini-2.5-flash-preview-tts',
    description: 'Warm & Friendly - Enhanced with Gemini AI'
  },
  {
    brandedName: 'Kwesi',
    provider: 'openai',
    llmVoice: 'onyx',
    model: 'tts-1-hd',
    description: 'Authoritative News - Enhanced with OpenAI'
  },
  {
    brandedName: 'Akua',
    provider: 'elevenlabs',
    llmVoice: 'EXAVITQu4vr4xnSDxMaL', // Bella voice ID
    model: 'eleven_multilingual_v2',
    description: 'French Eloquent - Enhanced with ElevenLabs'
  }
];

/**
 * Get LLM mapping for a branded voice
 */
export function getVoiceMapping(brandedVoiceName: string): VoiceMapping | null {
  return VOICE_MAPPINGS.find(mapping => mapping.brandedName === brandedVoiceName) || null;
}

/**
 * Check if a voice should use LLM TTS
 */
export function shouldUseLLMTTS(brandedVoiceName: string): boolean {
  const mapping = getVoiceMapping(brandedVoiceName);
  return mapping !== null && mapping.provider !== 'system';
}

/**
 * Get API key for a provider
 */
export function getAPIKey(provider: 'gemini' | 'openai' | 'elevenlabs'): string {
  return API_KEYS[provider];
}