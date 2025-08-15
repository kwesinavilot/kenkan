import { BaseTTSProvider, TTSProviderVoice, TTSProviderOptions, TTSProviderConfig } from './ttsProviders/baseTTSProvider';

export class OpenAITTSProvider extends BaseTTSProvider {
  constructor(config: TTSProviderConfig) {
    super({
      ...config,
      baseUrl: config.baseUrl || 'https://api.openai.com/v1'
    });
  }

  getProviderName(): string {
    return 'openai';
  }

  getAvailableVoices(): TTSProviderVoice[] {
    return [
      { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced voice' },
      { id: 'echo', name: 'Echo', description: 'Male voice with clarity' },
      { id: 'fable', name: 'Fable', description: 'British accent, storytelling' },
      { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative male voice' },
      { id: 'nova', name: 'Nova', description: 'Young, energetic female voice' },
      { id: 'shimmer', name: 'Shimmer', description: 'Soft, warm female voice' }
    ];
  }

  getAvailableModels(): string[] {
    return ['tts-1', 'tts-1-hd'];
  }

  async generateSpeech(text: string, options: TTSProviderOptions): Promise<string> {
    const cacheKey = this.generateCacheKey(text, options);
    
    // Check cache first
    const cachedAudio = this.getCachedAudio(cacheKey);
    if (cachedAudio) {
      return cachedAudio;
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/audio/speech`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options.model || 'tts-1',
          input: text,
          voice: options.voice || 'alloy',
          speed: Math.max(0.25, Math.min(4.0, options.speed || 1.0)),
          response_format: 'mp3'
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI TTS API error: ${response.status} ${response.statusText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Cache the result
      this.setCachedAudio(cacheKey, audioUrl);

      return audioUrl;
    } catch (error) {
      console.error('OpenAI TTS generation failed:', error);
      throw error;
    }
  }
}