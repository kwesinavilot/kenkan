import { BaseTTSProvider } from './baseTTSProvider';
import type { TTSProviderVoice, TTSProviderOptions, TTSProviderConfig } from './baseTTSProvider';

export class GeminiTTSProvider extends BaseTTSProvider {
    constructor(config: TTSProviderConfig) {
        super({
            ...config,
            baseUrl: config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta/":
        });
    }

    getProviderName(): string {
        return 'gemini';
    }

    getAvailableVoices(): TTSProviderVoice[] {
        return [
            {
                id: 'Puck',
                name: 'Puck',
                description: 'Natural, expressive voice',
                lang: 'en-US'
            },
            {
                id: 'Charon',
                name: 'Charon',
                description: 'Deep, authoritative voice',
                lang: 'en-US'
            },
            {
                id: 'Kore',
                name: 'Kore',
                description: 'Warm, friendly voice',
                lang: 'en-US'
            },
            {
                id: 'Fenrir',
                name: 'Fenrir',
                description: 'Strong, confident voice',
                lang: 'en-US'
            }
        ];
    }

    getAvailableModels(): string[] {
        return [
            'gemini-2.5-flash-preview-tts',
            'gemini-2.5-pro-preview-tts'
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
            const model = options.model || 'gemini-2.5-flash-preview-tts';
            const voice = options.voice || 'Puck';

            const requestBody = {
                model: `models/${model}`,
                contents: [{
                    parts: [{
                        text: text
                    }]
                }],
                generationConfig: {
                    voice: voice,
                    speed: options.speed || 1.0
                }
            };

            const response = await fetch(
                `${this.config.baseUrl}/models/${model}:generateContent?key=${this.config.apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gemini TTS API error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const result = await response.json();

            // Extract audio data from response
            if (!result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
                throw new Error('No audio data in Gemini TTS response');
            }

            const audioData = result.candidates[0].content.parts[0].inlineData.data;
            const mimeType = result.candidates[0].content.parts[0].inlineData.mimeType || 'audio/wav';

            // Convert base64 to blob
            const binaryString = atob(audioData);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const audioBlob = new Blob([bytes], { type: mimeType });
            const audioUrl = URL.createObjectURL(audioBlob);

            // Cache the result
            this.setCachedAudio(cacheKey, audioUrl);

            return audioUrl;
        } catch (error) {
            console.error('Gemini TTS generation failed:', error);
            throw error;
        }
    }
}