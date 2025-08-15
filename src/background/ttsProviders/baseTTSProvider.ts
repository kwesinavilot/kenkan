export interface TTSProviderVoice {
  id: string;
  name: string;
  description: string;
  lang?: string;
}

export interface TTSProviderOptions {
  voice: string;
  model?: string;
  speed?: number;
  pitch?: number;
}

export interface TTSProviderConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export abstract class BaseTTSProvider {
  protected config: TTSProviderConfig;
  protected audioCache = new Map<string, string>();
  
  constructor(config: TTSProviderConfig) {
    this.config = config;
  }

  abstract getProviderName(): string;
  abstract getAvailableVoices(): TTSProviderVoice[];
  abstract getAvailableModels(): string[];
  abstract generateSpeech(text: string, options: TTSProviderOptions): Promise<string>;
  
  /**
   * Play audio from URL
   */
  async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      
      audio.onended = () => resolve();
      audio.onerror = (error) => reject(error);
      
      audio.play().catch(reject);
    });
  }

  /**
   * Clear audio cache to free memory
   */
  clearCache(): void {
    this.audioCache.forEach(url => URL.revokeObjectURL(url));
    this.audioCache.clear();
  }

  /**
   * Generate cache key for audio
   */
  protected generateCacheKey(text: string, options: TTSProviderOptions): string {
    return `${text}-${options.voice}-${options.model || 'default'}-${options.speed || 1.0}`;
  }

  /**
   * Check if audio is cached
   */
  protected getCachedAudio(cacheKey: string): string | null {
    return this.audioCache.get(cacheKey) || null;
  }

  /**
   * Cache audio URL
   */
  protected setCachedAudio(cacheKey: string, audioUrl: string): void {
    this.audioCache.set(cacheKey, audioUrl);
  }
}