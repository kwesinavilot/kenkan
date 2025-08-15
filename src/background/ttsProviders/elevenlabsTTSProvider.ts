import { BaseTTSProvider, TTSProviderVoice, TTSProviderOptions, TTSProviderConfig } from './baseTTSProvider';

export class ElevenLabsTTSProvider extends BaseTTSProvider {
  constructor(config: TTSProviderConfig) {
    super({
      ...config,
      baseUrl: config.baseUrl || 'https://api.elevenlabs.io/v1'
    });
  }

  getProviderName(): string {
    return 'elevenlabs';
  }

  getAvailableVoices(): TTSProviderVoice[] {
    return [
      { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Deep, authoritative male voice' },
      { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Warm, friendly female voice' },
      { id: 'VR6AewLTigWG4xSOukaG', name: 'Antoni', description: 'Smooth, professional male voice' },
      { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', description: 'Young, energetic male voice' },
      { id: 'jsCqWAovK2LkecY7zXl4', name: 'Arnold', description: 'Strong, confident male voice' },
      { id: 'CYw3kZ02Hs0563khs1Fj', name: 'Sam', description: 'Clear, articulate male voice' }
    ];
  }

  getAvailableModels(): string[] {
    return [
      'eleven_monolingual_v1',
      'eleven_multilingual_v1',
      'eleven_multilingual_v2',
      'eleven_turbo_v2'
    ];
  }

  async generateSpeech(text: string, options: TTSProviderOptions): Promise<string> {
    const cacheKey = this.generateCacheKey(text, options);
    
    // Check cache first
    const cachedAudio = this.getCachedAudio(cacheKey);
    if (cachedAudio) {
      return cachedAudio;
    }

    try {
      const voiceId = options.voice || 'pNInz6obpgDQGcFmaJgB'; // Default to Adam
      const model = options.model || 'eleven_turbo_v2';
      
      const requestBody = {
        text: text,
        model_id: model,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        }
      };

      const response = await fetch(
        `${this.config.baseUrl}/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.config.apiKey
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs TTS API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Cache the result
      this.setCachedAudio(cacheKey, audioUrl);

      return audioUrl;
    } catch (error) {
      console.error('ElevenLabs TTS generation failed:', error);
      throw error;
    }
  }
}