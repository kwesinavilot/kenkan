// TTS-related types and interfaces

export interface TTSOptions {
  voiceURI?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentSegment: number;
  currentPosition: number;
  totalSegments: number;
  voice: string;
  speed: number;
  volume: number;
  pitch: number;
}

export interface TTSVoice {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
  provider?: 'system' | 'gemini' | 'openai' | 'elevenlabs';
}

export interface TTSEvent {
  type: 'start' | 'end' | 'error' | 'pause' | 'resume' | 'mark' | 'boundary';
  charIndex?: number;
  elapsedTime?: number;
  name?: string;
  error?: string;
}

export interface TTSManagerOptions {
  defaultVoice?: string;
  defaultRate?: number;
  defaultPitch?: number;
  defaultVolume?: number;
  enableAIEnhancement?: boolean;
  enableLLMTTS?: boolean;
  defaultProvider?: 'gemini' | 'openai' | 'elevenlabs';
  retryAttempts?: number;
  retryDelay?: number;
}

export interface LLMTTSProviderConfig {
  provider: 'gemini' | 'openai' | 'elevenlabs';
  apiKey: string;
  model?: string;
  voice?: string;
  enabled: boolean;
}

export interface AIEnhancementOptions {
  improveNaturalness?: boolean;
  addPauses?: boolean;
  fixPronunciation?: boolean;
  optimizeForVoice?: string;
}

export interface TTSError {
  code: 'VOICE_UNAVAILABLE' | 'TTS_FAILED' | 'NETWORK_ERROR' | 'PERMISSION_DENIED' | 'UNKNOWN';
  message: string;
  originalError?: any;
  retryable: boolean;
}

export type TTSEventCallback = (event: TTSEvent) => void;
export type TTSErrorCallback = (error: TTSError) => void;