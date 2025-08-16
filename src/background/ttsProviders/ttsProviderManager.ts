import { BaseTTSProvider } from './baseTTSProvider';
import type { TTSProviderOptions } from './baseTTSProvider';
import { GeminiTTSProvider } from './geminiTTSProvider';
import { OpenAITTSProvider } from '../openaiTTSService';
import { ElevenLabsTTSProvider } from './elevenlabsTTSProvider';
import type { LLMTTSProviderConfig } from '../../types/tts';

export type TTSProviderType = 'gemini' | 'openai' | 'elevenlabs';

export class TTSProviderManager {
  private providers = new Map<TTSProviderType, BaseTTSProvider>();
  private activeProvider: TTSProviderType = 'gemini';

  /**
   * Initialize a TTS provider
   */
  async initializeProvider(config: LLMTTSProviderConfig): Promise<void> {
    if (!config.enabled || !config.apiKey) {
      this.removeProvider(config.provider);
      return;
    }

    try {
      let provider: BaseTTSProvider;

      switch (config.provider) {
        case 'gemini':
          provider = new GeminiTTSProvider({ apiKey: config.apiKey });
          break;
        case 'openai':
          provider = new OpenAITTSProvider({ apiKey: config.apiKey });
          break;
        case 'elevenlabs':
          provider = new ElevenLabsTTSProvider({ apiKey: config.apiKey });
          break;
        default:
          throw new Error(`Unknown TTS provider: ${config.provider}`);
      }

      this.providers.set(config.provider, provider);
      
      // Set as active if it's the first provider or if explicitly requested
      if (this.providers.size === 1 || config.provider === this.activeProvider) {
        this.activeProvider = config.provider;
      }

      console.log(`Initialized ${config.provider} TTS provider`);
    } catch (error) {
      console.error(`Failed to initialize ${config.provider} TTS provider:`, error);
      throw error;
    }
  }

  /**
   * Remove a TTS provider
   */
  removeProvider(providerType: TTSProviderType): void {
    const provider = this.providers.get(providerType);
    if (provider) {
      provider.clearCache();
      this.providers.delete(providerType);
      
      // Switch to another provider if this was the active one
      if (this.activeProvider === providerType) {
        const availableProviders = Array.from(this.providers.keys());
        this.activeProvider = availableProviders[0] || 'gemini';
      }
    }
  }

  /**
   * Set the active provider
   */
  setActiveProvider(providerType: TTSProviderType): void {
    if (this.providers.has(providerType)) {
      this.activeProvider = providerType;
    } else {
      throw new Error(`Provider ${providerType} is not initialized`);
    }
  }

  /**
   * Get the active provider
   */
  getActiveProvider(): BaseTTSProvider | null {
    return this.providers.get(this.activeProvider) || null;
  }

  /**
   * Get active provider type
   */
  getActiveProviderType(): TTSProviderType {
    return this.activeProvider;
  }

  /**
   * Check if a provider is available
   */
  hasProvider(providerType: TTSProviderType): boolean {
    return this.providers.has(providerType);
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): TTSProviderType[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Generate speech using the active provider
   */
  async generateSpeech(text: string, options: TTSProviderOptions): Promise<string> {
    const provider = this.getActiveProvider();
    if (!provider) {
      throw new Error('No TTS provider is available');
    }

    return provider.generateSpeech(text, options);
  }

  /**
   * Get voices from the active provider
   */
  getAvailableVoices() {
    const provider = this.getActiveProvider();
    return provider ? provider.getAvailableVoices() : [];
  }

  /**
   * Get models from the active provider
   */
  getAvailableModels(): string[] {
    const provider = this.getActiveProvider();
    return provider ? provider.getAvailableModels() : [];
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.providers.forEach(provider => provider.clearCache());
  }

  /**
   * Get provider info for UI
   */
  getProviderInfo() {
    return {
      active: this.activeProvider,
      available: this.getAvailableProviders(),
      voices: this.getAvailableVoices(),
      models: this.getAvailableModels()
    };
  }
}