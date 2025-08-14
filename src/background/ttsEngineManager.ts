/// <reference path="../types/chrome-tts-engine.d.ts" />

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { KENKAN_VOICES, type KenkanVoiceName } from '../types/voices';

export class TTSEngineManager {
    private isInitialized = false;
    private currentOptions: chrome.tts.TtsOptions | null = null;
    private isPlaying = false;

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        if (this.isInitialized) return;

        console.log('Initializing Kenkan TTS Engine...');

        // Register event handlers
        chrome.ttsEngine.onSpeak.addListener(this.handleSpeak.bind(this));
        chrome.ttsEngine.onStop.addListener(this.handleStop.bind(this));
        chrome.ttsEngine.onPause.addListener(this.handlePause.bind(this));
        chrome.ttsEngine.onResume.addListener(this.handleResume.bind(this));

        this.isInitialized = true;
        console.log('Kenkan TTS Engine initialized successfully');
    }

    private async handleSpeak(
        utterance: string,
        options: chrome.ttsEngine.SpeakOptions,
        sendTtsEvent: (event: chrome.tts.TtsEvent) => void
    ): Promise<void> {
        console.log('TTS Engine: Speak request received', {
            utterance: utterance.substring(0, 100) + '...',
            voiceName: options.voiceName
        });

        this.currentOptions = options;

        try {
            // Send start event
            sendTtsEvent({ type: 'start', charIndex: 0 });
            this.isPlaying = true;

            // Check if this is one of our custom voices
            const voiceName = options.voiceName as KenkanVoiceName;
            if (KENKAN_VOICES[voiceName]) {
                await this.synthesizeWithAI(utterance, voiceName, options, sendTtsEvent);
            } else {
                // Fallback to system TTS for unknown voices
                await this.fallbackToSystemTTS(utterance, options, sendTtsEvent);
            }

        } catch (error) {
            console.error('TTS Engine: Error during speech synthesis:', error);
            sendTtsEvent({
                type: 'error',
                errorMessage: error instanceof Error ? error.message : 'Unknown synthesis error'
            });
        }
    }

    private async synthesizeWithAI(
        utterance: string,
        voiceName: KenkanVoiceName,
        options: chrome.ttsEngine.SpeakOptions,
        sendTtsEvent: (event: chrome.tts.TtsEvent) => void
    ): Promise<void> {
        const voiceProfile = KENKAN_VOICES[voiceName];

        try {
            // Enhance the text for the specific voice characteristics
            const enhancedText = await this.enhanceTextForVoice(utterance, voiceProfile);

            // For now, we'll use Web Speech API with enhanced text
            // In a production implementation, you would:
            // 1. Send the enhanced text to an AI voice synthesis service
            // 2. Stream the audio back
            // 3. Play it through the Web Audio API

            await this.synthesizeWithWebSpeech(enhancedText, options, sendTtsEvent, voiceProfile);

        } catch (error) {
            console.error(`Error synthesizing with ${voiceName}:`, error);
            // Fallback to system TTS
            await this.fallbackToSystemTTS(utterance, options, sendTtsEvent);
        }
    }

    private async enhanceTextForVoice(text: string, voiceProfile: any): Promise<string> {
        try {
            const prompt = `Enhance the following text for text-to-speech synthesis using this voice profile:

Voice: ${voiceProfile.name}
Characteristics: ${voiceProfile.characteristics.tone}, ${voiceProfile.characteristics.pace}
Specialties: ${voiceProfile.characteristics.specialties.join(', ')}

Instructions:
- Adapt the text to match the voice's ${voiceProfile.characteristics.tone} tone
- Adjust pacing for ${voiceProfile.characteristics.pace} delivery
- Add appropriate pauses and emphasis for ${voiceProfile.characteristics.specialties[0]} content
- Maintain the original meaning exactly
- Return only the enhanced text without explanations

Original text: "${text}"`;

            const { text: enhancedText } = await generateText({
                model: openai('gpt-3.5-turbo'),
                prompt,
                // maxCompletionTokens: Math.min(1000, text.length * 2)
            });

            return enhancedText.trim();
        } catch (error) {
            console.warn('AI enhancement failed, using original text:', error);
            return text;
        }
    }

    private async synthesizeWithWebSpeech(
        text: string,
        options: chrome.ttsEngine.SpeakOptions,
        sendTtsEvent: (event: chrome.tts.TtsEvent) => void,
        voiceProfile: any
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof speechSynthesis === 'undefined') {
                reject(new Error('Speech synthesis not available'));
                return;
            }

            const utterance = new SpeechSynthesisUtterance(text);

            // Try to find a voice that matches the profile characteristics
            const voices = speechSynthesis.getVoices();
            let selectedVoice = voices.find(voice => {
                const isRightGender = voiceProfile.characteristics.gender === 'female'
                    ? voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman')
                    : voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('man');

                const isRightLanguage = voiceProfile.language === 'French'
                    ? voice.lang.startsWith('fr')
                    : voice.lang.startsWith('en');

                return isRightLanguage && (isRightGender || voices.length < 10); // Fallback if few voices
            });

            // Fallback to any voice of the right language
            if (!selectedVoice) {
                selectedVoice = voices.find(voice =>
                    voiceProfile.language === 'French' ? voice.lang.startsWith('fr') : voice.lang.startsWith('en')
                );
            }

            // Final fallback
            if (!selectedVoice) {
                selectedVoice = voices[0];
            }

            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }

            // Apply voice-specific adjustments
            utterance.rate = this.getVoiceRate(voiceProfile, options.rate || 1.0);
            utterance.pitch = this.getVoicePitch(voiceProfile, options.pitch || 1.0);
            utterance.volume = options.volume || 1.0;

            let hasEnded = false;

            utterance.onstart = () => {
                console.log(`TTS Engine: Started speaking with ${voiceProfile.name} characteristics`);
            };

            utterance.onend = () => {
                if (!hasEnded) {
                    hasEnded = true;
                    sendTtsEvent({ type: 'end', charIndex: text.length });
                    resolve();
                }
            };

            utterance.onerror = (event) => {
                console.error('TTS Engine: Web Speech error:', event.error);
                if (!hasEnded) {
                    hasEnded = true;
                    sendTtsEvent({
                        type: 'error',
                        errorMessage: `Speech synthesis error: ${event.error}`
                    });
                    reject(new Error(event.error));
                }
            };

            utterance.onboundary = (event) => {
                if (event.name === 'word' || event.name === 'sentence') {
                    sendTtsEvent({
                        type: event.name as 'word' | 'sentence',
                        charIndex: event.charIndex
                    });
                }
            };

            speechSynthesis.speak(utterance);

            // Timeout fallback
            setTimeout(() => {
                if (!hasEnded) {
                    console.warn('TTS Engine: Speech synthesis timeout');
                    hasEnded = true;
                    sendTtsEvent({ type: 'end', charIndex: text.length });
                    resolve();
                }
            }, Math.max(text.length * 100, 10000));
        });
    }

    private getVoiceRate(voiceProfile: any, baseRate: number): number {
        const pace = voiceProfile.characteristics.pace.toLowerCase();

        if (pace.includes('relaxed') || pace.includes('gentle')) {
            return Math.max(0.7, baseRate * 0.9);
        } else if (pace.includes('measured') || pace.includes('deliberate')) {
            return Math.max(0.6, baseRate * 0.8);
        } else if (pace.includes('steady')) {
            return baseRate;
        }

        return baseRate;
    }

    private getVoicePitch(voiceProfile: any, basePitch: number): number {
        const tone = voiceProfile.characteristics.tone.toLowerCase();
        const gender = voiceProfile.characteristics.gender;

        let adjustment = 1.0;

        if (gender === 'female') {
            adjustment = 1.1; // Slightly higher for female voices
        } else if (tone.includes('deep')) {
            adjustment = 0.9; // Lower for deep voices
        }

        if (tone.includes('warm') || tone.includes('friendly')) {
            adjustment *= 1.05; // Slightly warmer
        }

        return Math.max(0.5, Math.min(2.0, basePitch * adjustment));
    }

    private async fallbackToSystemTTS(
        utterance: string,
        options: chrome.ttsEngine.SpeakOptions,
        sendTtsEvent: (event: chrome.tts.TtsEvent) => void
    ): Promise<void> {
        console.log('TTS Engine: Falling back to system TTS');

        // Use the regular Chrome TTS API as fallback
        return new Promise((resolve, reject) => {
            const fallbackOptions: chrome.tts.TtsOptions = {
                rate: options.rate,
                pitch: options.pitch,
                volume: options.volume,
                onEvent: (event) => {
                    sendTtsEvent(event);
                    if (event.type === 'end') {
                        resolve();
                    } else if (event.type === 'error') {
                        reject(new Error(event.errorMessage || 'System TTS error'));
                    }
                }
            };

            chrome.tts.speak(utterance, fallbackOptions);
        });
    }

    private handleStop(): void {
        console.log('TTS Engine: Stop request received');

        this.isPlaying = false;
        this.currentOptions = null;

        // Stop any ongoing speech synthesis
        if (typeof speechSynthesis !== 'undefined') {
            speechSynthesis.cancel();
        }

        // Stop any Chrome TTS
        chrome.tts.stop();
    }

    private handlePause(): void {
        console.log('TTS Engine: Pause request received');

        if (typeof speechSynthesis !== 'undefined') {
            speechSynthesis.pause();
        }
    }

    private handleResume(): void {
        console.log('TTS Engine: Resume request received');

        if (typeof speechSynthesis !== 'undefined') {
            speechSynthesis.resume();
        }
    }

    /**
     * Update the available voices dynamically
     */
    updateVoices(): void {
        const voices = Object.keys(KENKAN_VOICES).map(voiceName => ({
            voiceName,
            lang: KENKAN_VOICES[voiceName as KenkanVoiceName].language === 'French' ? 'fr-FR' : 'en-US',
            eventTypes: ['start', 'marker', 'end'] as chrome.tts.EventType[]
        }));

        chrome.ttsEngine.updateVoices(voices);
        console.log('TTS Engine: Updated voices:', voices);
    }

    /**
     * Get engine status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isPlaying: this.isPlaying,
            availableVoices: Object.keys(KENKAN_VOICES),
            currentVoice: this.currentOptions?.voiceName || null
        };
    }
}