import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { TTSErrorHandler } from './ttsErrorHandler';
import type {
  TTSOptions,
  PlaybackState,
  TTSVoice,
  TTSEvent,
  TTSManagerOptions,
  TTSError,
  TTSEventCallback,
  TTSErrorCallback
} from '../types/tts';
import type { TextSegment } from '../types/content';

export class TTSManager {
  private playbackState: PlaybackState;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private textSegments: TextSegment[] = [];
  private availableVoices: TTSVoice[] = [];
  private options: TTSManagerOptions;
  private eventCallbacks: Map<string, TTSEventCallback[]> = new Map();
  private errorCallback: TTSErrorCallback | null = null;
  private retryCount = 0;

  constructor(options: TTSManagerOptions = {}) {
    this.options = {
      defaultRate: 1.0,
      defaultPitch: 1.0,
      defaultVolume: 1.0,
      enableAIEnhancement: false,
      retryAttempts: 3,
      retryDelay: 1000,
      ...options
    };

    this.playbackState = {
      isPlaying: false,
      isPaused: false,
      currentSegment: 0,
      currentPosition: 0,
      totalSegments: 0,
      voice: this.options.defaultVoice || '',
      speed: this.options.defaultRate || 1.0,
      volume: this.options.defaultVolume || 1.0,
      pitch: this.options.defaultPitch || 1.0
    };

    this.initializeVoices();
  }

  /**
   * Initialize available voices from Chrome TTS API with error handling
   */
  private async initializeVoices(): Promise<void> {
    try {
      console.log('Initializing TTS voices...');

      // Check if we're in a valid Chrome extension context
      if (typeof chrome === 'undefined') {
        console.error('Chrome APIs not available - not running in extension context');
        this.initializeWebSpeechVoices();
        return;
      }

      // First validate the TTS environment
      const isEnvironmentValid = await this.validateTTSEnvironment();
      console.log('TTS environment valid:', isEnvironmentValid);

      if (!isEnvironmentValid) {
        console.warn('Chrome TTS not available, falling back to Web Speech API');
        this.initializeWebSpeechVoices();
        return;
      }

      if (typeof chrome !== 'undefined' && chrome.tts) {
        console.log('Using Chrome TTS API');
        chrome.tts.getVoices((voices) => {
          console.log('Chrome TTS voices received:', voices?.length || 0);

          if (!voices || voices.length === 0) {
            console.warn('Chrome TTS returned no voices, falling back to Web Speech API');
            this.initializeWebSpeechVoices();
            return;
          }

          const mappedVoices = voices.map(voice => ({
            voiceURI: voice.voiceName || '',
            name: voice.voiceName || '',
            lang: voice.lang || 'en-US',
            localService: !voice.remote,
            default: false
          }));

          // Filter for reliable voices
          this.availableVoices = TTSErrorHandler.filterReliableVoices(mappedVoices);
          console.log('Available voices after filtering:', this.availableVoices.length);

          // Set default voice if not specified
          this.setDefaultVoice();
          this.emitEvent({ type: 'start' });
        });
      } else {
        // Fallback to Web Speech API if Chrome TTS is not available
        console.log('Chrome TTS not available, using Web Speech API');
        this.initializeWebSpeechVoices();
      }
    } catch (error) {
      await this.handleError({
        code: 'TTS_FAILED',
        message: 'Failed to initialize TTS voices',
        originalError: error,
        retryable: true
      });
    }
  }

  /**
   * Set default voice with preference order
   */
  private setDefaultVoice(): void {
    if (this.playbackState.voice && this.availableVoices.some(v => v.voiceURI === this.playbackState.voice)) {
      return; // Current voice is still valid
    }

    // Preference order: default voice -> English voice -> any voice
    let defaultVoice = this.availableVoices.find(v => v.default) ||
      this.availableVoices.find(v => v.lang.startsWith('en')) ||
      this.availableVoices[0];

    if (defaultVoice) {
      this.playbackState.voice = defaultVoice.voiceURI;
    }
  }

  /**
   * Fallback to Web Speech API voices with error handling
   */
  private initializeWebSpeechVoices(): void {
    try {
      console.log('Initializing Web Speech API voices...');

      if (typeof speechSynthesis === 'undefined') {
        console.error('Web Speech API not available in this environment');
        this.handleError({
          code: 'TTS_FAILED',
          message: 'No TTS engines available - neither Chrome TTS nor Web Speech API found',
          retryable: false
        });
        return;
      }

      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        console.log('Web Speech API voices found:', voices.length);

        if (voices.length === 0) {
          console.warn('No Web Speech API voices available');
          this.handleError({
            code: 'TTS_FAILED',
            message: 'No voices available in Web Speech API',
            retryable: true
          });
          return;
        }

        const mappedVoices = voices.map(voice => ({
          voiceURI: voice.voiceURI,
          name: voice.name,
          lang: voice.lang,
          localService: voice.localService,
          default: voice.default
        }));

        // Filter for reliable voices
        this.availableVoices = TTSErrorHandler.filterReliableVoices(mappedVoices);
        console.log('Web Speech voices after filtering:', this.availableVoices.length);

        if (this.availableVoices.length === 0) {
          console.error('No reliable voices found after filtering');
          this.handleError({
            code: 'TTS_FAILED',
            message: 'No reliable TTS voices available',
            retryable: false
          });
          return;
        }

        this.setDefaultVoice();
        this.emitEvent({ type: 'start' });
      };

      // Voices might load asynchronously
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        loadVoices();
      } else {
        // Wait for voices to load
        speechSynthesis.onvoiceschanged = () => {
          loadVoices();
          speechSynthesis.onvoiceschanged = null; // Remove listener
        };

        // Timeout if voices don't load
        setTimeout(() => {
          if (this.availableVoices.length === 0) {
            this.handleError({
              code: 'TTS_FAILED',
              message: 'Web Speech API voices failed to load',
              retryable: true
            });
          }
        }, 5000);
      }
    } catch (error) {
      this.handleError({
        code: 'TTS_FAILED',
        message: 'Failed to initialize Web Speech API voices',
        originalError: error,
        retryable: true
      });
    }
  }

  /**
   * Start reading text segments
   */
  async startReading(segments: TextSegment[], options: TTSOptions = {}): Promise<void> {
    try {
      this.textSegments = segments;
      this.playbackState.totalSegments = segments.length;
      this.playbackState.currentSegment = 0;
      this.playbackState.currentPosition = 0;

      // Apply options
      if (options.rate !== undefined) this.playbackState.speed = options.rate;
      if (options.volume !== undefined) this.playbackState.volume = options.volume;
      if (options.pitch !== undefined) this.playbackState.pitch = options.pitch;
      if (options.voiceURI) this.playbackState.voice = options.voiceURI;

      await this.playCurrentSegment();
    } catch (error) {
      this.handleError({
        code: 'TTS_FAILED',
        message: 'Failed to start reading',
        originalError: error,
        retryable: true
      });
    }
  }

  /**
   * Play the current text segment
   */
  private async playCurrentSegment(): Promise<void> {
    if (this.playbackState.currentSegment >= this.textSegments.length) {
      this.stopReading();
      return;
    }

    const segment = this.textSegments[this.playbackState.currentSegment];
    let textToSpeak = segment.text;

    // Apply AI enhancement if enabled
    if (this.options.enableAIEnhancement) {
      textToSpeak = await this.enhanceTextForTTS(textToSpeak);
    }

    // Use Chrome TTS API if available
    if (typeof chrome !== 'undefined' && chrome.tts) {
      await this.speakWithChromeTTS(textToSpeak);
    } else {
      // Fallback to Web Speech API
      await this.speakWithWebSpeech(textToSpeak);
    }
  }

  /**
   * Speak text using Chrome TTS API with enhanced error handling
   */
  private async speakWithChromeTTS(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!text || text.trim().length === 0) {
        resolve();
        return;
      }

      const options: chrome.tts.TtsOptions = {
        voiceName: this.playbackState.voice,
        rate: this.playbackState.speed,
        pitch: this.playbackState.pitch,
        volume: this.playbackState.volume,
        onEvent: (event) => {
          this.handleTTSEvent(event);
          if (event.type === 'end') {
            this.retryCount = 0; // Reset retry count on success
            resolve();
          } else if (event.type === 'error') {
            const errorMessage = event.errorMessage || 'Chrome TTS error';
            console.error('Chrome TTS error:', errorMessage);
            reject(new Error(errorMessage));
          }
        }
      };

      try {
        chrome.tts.speak(text, options);
        this.playbackState.isPlaying = true;
        this.playbackState.isPaused = false;

        // Timeout fallback in case onEvent doesn't fire
        setTimeout(() => {
          if (this.playbackState.isPlaying) {
            console.warn('Chrome TTS timeout, assuming completion');
            resolve();
          }
        }, Math.max(text.length * 100, 5000)); // Estimate based on text length, min 5 seconds

      } catch (error) {
        console.error('Error calling Chrome TTS speak:', error);
        reject(error);
      }
    });
  }

  /**
   * Speak text using Web Speech API as fallback with enhanced error handling
   */
  private async speakWithWebSpeech(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof speechSynthesis === 'undefined') {
        reject(new Error('Speech synthesis not available'));
        return;
      }

      if (!text || text.trim().length === 0) {
        resolve();
        return;
      }

      // Check if speech synthesis is paused and resume if needed
      if (speechSynthesis.paused) {
        speechSynthesis.resume();
      }

      this.currentUtterance = new SpeechSynthesisUtterance(text);

      // Find and set voice with fallback
      const voices = speechSynthesis.getVoices();
      let voice = voices.find(v => v.voiceURI === this.playbackState.voice);

      if (!voice) {
        console.warn(`Voice ${this.playbackState.voice} not found, using fallback`);
        voice = voices.find(v => v.lang.startsWith('en')) || voices[0];
        if (voice) {
          this.playbackState.voice = voice.voiceURI;
        }
      }

      if (voice) {
        this.currentUtterance.voice = voice;
      }

      // Set speech parameters with validation
      this.currentUtterance.rate = Math.max(0.1, Math.min(10, this.playbackState.speed));
      this.currentUtterance.pitch = Math.max(0, Math.min(2, this.playbackState.pitch));
      this.currentUtterance.volume = Math.max(0, Math.min(1, this.playbackState.volume));

      let hasStarted = false;
      let hasEnded = false;

      this.currentUtterance.onstart = () => {
        hasStarted = true;
        this.playbackState.isPlaying = true;
        this.playbackState.isPaused = false;
        this.retryCount = 0; // Reset retry count on success
        this.emitEvent({ type: 'start' });
      };

      this.currentUtterance.onend = () => {
        if (!hasEnded) {
          hasEnded = true;
          this.playbackState.currentSegment++;
          this.emitEvent({ type: 'end' });
          resolve();
        }
      };

      this.currentUtterance.onerror = (event) => {
        console.error('Web Speech API error:', event.error);
        this.emitEvent({ type: 'error', error: event.error });

        if (!hasEnded) {
          hasEnded = true;
          reject(new Error(event.error));
        }
      };

      this.currentUtterance.onboundary = (event) => {
        this.playbackState.currentPosition = event.charIndex || 0;
        this.emitEvent({
          type: 'boundary',
          charIndex: event.charIndex || 0
        });
      };

      try {
        speechSynthesis.speak(this.currentUtterance);

        // Fallback timeout in case events don't fire properly
        setTimeout(() => {
          if (!hasStarted && !hasEnded) {
            console.warn('Web Speech API timeout - no start event received');
            reject(new Error('Speech synthesis timeout'));
          }
        }, 2000);

        // Long timeout for completion
        setTimeout(() => {
          if (hasStarted && !hasEnded) {
            console.warn('Web Speech API completion timeout');
            if (!hasEnded) {
              hasEnded = true;
              resolve();
            }
          }
        }, Math.max(text.length * 100, 10000)); // Estimate based on text length, min 10 seconds

      } catch (error) {
        console.error('Error calling Web Speech API speak:', error);
        reject(error);
      }
    });
  }

  /**
   * Handle Chrome TTS events
   */
  private handleTTSEvent(event: chrome.tts.TtsEvent): void {
    const ttsEvent: TTSEvent = {
      type: event.type as TTSEvent['type'],
      charIndex: event.charIndex,
      // elapsedTime: event.elapsedTime
    };

    if (event.type === 'word' || event.type === 'sentence') {
      this.playbackState.currentPosition = event.charIndex || 0;
    }

    this.emitEvent(ttsEvent);

    if (event.type === 'end') {
      this.playbackState.currentSegment++;
      // Continue to next segment
      setTimeout(() => this.playCurrentSegment(), 100);
    }
  }

  /**
   * Pause reading
   */
  pauseReading(): void {
    try {
      if (typeof chrome !== 'undefined' && chrome.tts) {
        chrome.tts.pause();
      } else if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.pause();
      }

      this.playbackState.isPlaying = false;
      this.playbackState.isPaused = true;
      this.emitEvent({ type: 'pause' });
    } catch (error) {
      this.handleError({
        code: 'TTS_FAILED',
        message: 'Failed to pause reading',
        originalError: error,
        retryable: false
      });
    }
  }

  /**
   * Resume reading
   */
  resumeReading(): void {
    try {
      if (typeof chrome !== 'undefined' && chrome.tts) {
        chrome.tts.resume();
      } else if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.resume();
      }

      this.playbackState.isPlaying = true;
      this.playbackState.isPaused = false;
      this.emitEvent({ type: 'resume' });
    } catch (error) {
      this.handleError({
        code: 'TTS_FAILED',
        message: 'Failed to resume reading',
        originalError: error,
        retryable: false
      });
    }
  }

  /**
   * Stop reading
   */
  stopReading(): void {
    try {
      if (typeof chrome !== 'undefined' && chrome.tts) {
        chrome.tts.stop();
      } else if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.cancel();
      }

      this.playbackState.isPlaying = false;
      this.playbackState.isPaused = false;
      this.playbackState.currentSegment = 0;
      this.playbackState.currentPosition = 0;
      this.currentUtterance = null;
      this.emitEvent({ type: 'end' });
    } catch (error) {
      this.handleError({
        code: 'TTS_FAILED',
        message: 'Failed to stop reading',
        originalError: error,
        retryable: false
      });
    }
  }

  /**
   * Set voice for TTS with validation and fallback
   */
  async setVoice(voiceURI: string): Promise<void> {
    const voice = this.availableVoices.find(v => v.voiceURI === voiceURI);
    if (!voice) {
      await this.handleError({
        code: 'VOICE_UNAVAILABLE',
        message: `Voice ${voiceURI} is not available`,
        retryable: false
      });
      return;
    }

    // Test the voice before setting it
    const isVoiceWorking = await this.testVoice(voiceURI);
    if (isVoiceWorking) {
      this.playbackState.voice = voiceURI;
    } else {
      console.warn(`Voice ${voiceURI} failed test, finding fallback`);
      const fallback = this.findFallbackVoice();
      if (fallback) {
        this.playbackState.voice = fallback.voiceURI;
        console.log(`Using fallback voice: ${fallback.name}`);
      } else {
        await this.handleError({
          code: 'VOICE_UNAVAILABLE',
          message: `Voice ${voiceURI} is not working and no fallback available`,
          retryable: false
        });
      }
    }
  }

  /**
   * Set reading speed with validation
   */
  setSpeed(rate: number): void {
    const dummyVoice = { voiceURI: 'dummy', name: 'dummy', lang: 'en', localService: true, default: false };
    const validation = TTSErrorHandler.validateVoiceConfiguration(
      dummyVoice, rate, this.playbackState.pitch, this.playbackState.volume
    );

    if (!validation.isValid) {
      throw new Error(validation.issues[0]);
    }

    this.playbackState.speed = rate;
  }

  /**
   * Set volume with validation
   */
  setVolume(volume: number): void {
    const dummyVoice = { voiceURI: 'dummy', name: 'dummy', lang: 'en', localService: true, default: false };
    const validation = TTSErrorHandler.validateVoiceConfiguration(
      dummyVoice, this.playbackState.speed, this.playbackState.pitch, volume
    );

    if (!validation.isValid) {
      throw new Error(validation.issues.find(issue => issue.includes('volume')) || validation.issues[0]);
    }

    this.playbackState.volume = volume;
  }

  /**
   * Set pitch with validation
   */
  setPitch(pitch: number): void {
    const dummyVoice = { voiceURI: 'dummy', name: 'dummy', lang: 'en', localService: true, default: false };
    const validation = TTSErrorHandler.validateVoiceConfiguration(
      dummyVoice, this.playbackState.speed, pitch, this.playbackState.volume
    );

    if (!validation.isValid) {
      throw new Error(validation.issues.find(issue => issue.includes('pitch')) || validation.issues[0]);
    }

    this.playbackState.pitch = pitch;
  }

  /**
   * Get available voices
   */
  getVoices(): TTSVoice[] {
    return [...this.availableVoices];
  }

  /**
   * Get current playback state
   */
  getPlaybackState(): PlaybackState {
    return { ...this.playbackState };
  }

  /**
   * Enhance text using AI SDK for better TTS
   */
  private async enhanceTextForTTS(text: string): Promise<string> {
    try {
      const { text: enhancedText } = await generateText({
        model: openai('gpt-3.5-turbo'),
        prompt: `Enhance the following text for text-to-speech by:
        - Adding natural pauses with commas and periods where appropriate
        - Fixing any pronunciation issues
        - Making it flow more naturally when spoken
        - Keeping the meaning exactly the same
        
        Original text: "${text}"
        
        Return only the enhanced text without any explanations.`,
        // maxCompletionTokens: 1000
      });

      return enhancedText.trim();
    } catch (error) {
      console.warn('AI enhancement failed, using original text:', error);
      return text;
    }
  }

  /**
   * Add event listener
   */
  addEventListener(eventType: string, callback: TTSEventCallback): void {
    if (!this.eventCallbacks.has(eventType)) {
      this.eventCallbacks.set(eventType, []);
    }
    this.eventCallbacks.get(eventType)!.push(callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(eventType: string, callback: TTSEventCallback): void {
    const callbacks = this.eventCallbacks.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Set error callback
   */
  setErrorCallback(callback: TTSErrorCallback): void {
    this.errorCallback = callback;
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(event: TTSEvent): void {
    const callbacks = this.eventCallbacks.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in TTS event callback:', error);
        }
      });
    }
  }

  /**
   * Handle TTS errors with comprehensive retry logic and fallback mechanisms
   */
  private async handleError(errorInput: TTSError | any): Promise<void> {
    // Categorize the error using the error handler
    const error = errorInput.code ? errorInput : TTSErrorHandler.categorizeError(errorInput);

    console.error('TTS Error:', TTSErrorHandler.createErrorReport(error, {
      voiceURI: this.playbackState.voice,
      textLength: this.textSegments[this.playbackState.currentSegment]?.text?.length,
      browserInfo: navigator.userAgent,
      timestamp: new Date()
    }));

    // Try voice fallback first
    if (TTSErrorHandler.shouldFallbackToAlternativeVoice(error)) {
      const fallbackVoice = this.findFallbackVoice();
      if (fallbackVoice) {
        console.log(`Falling back to voice: ${fallbackVoice.name}`);
        this.playbackState.voice = fallbackVoice.voiceURI;
        await this.playCurrentSegment();
        return;
      }
    }

    // Try switching TTS engines if appropriate
    if (TTSErrorHandler.shouldFallbackToAlternativeEngine(error)) {
      if (typeof chrome !== 'undefined' && chrome.tts) {
        console.log('Chrome TTS failed, falling back to Web Speech API');
        // Temporarily disable Chrome TTS for this session
        (globalThis as any).chrome = undefined;
        this.initializeWebSpeechVoices();

        // Wait for voices to load
        await new Promise(resolve => setTimeout(resolve, 500));

        if (this.availableVoices.length > 0) {
          await this.playCurrentSegment();
          return;
        }
      }
    }

    // Retry logic for temporary failures with exponential backoff
    if (error.retryable && this.retryCount < (this.options.retryAttempts || 3)) {
      this.retryCount++;
      console.log(`Retrying TTS operation (attempt ${this.retryCount}/${this.options.retryAttempts})`);

      const delay = TTSErrorHandler.calculateRetryDelay(this.retryCount, this.options.retryDelay);
      setTimeout(async () => {
        await this.playCurrentSegment();
      }, delay);
      return;
    }

    this.retryCount = 0;

    // Final fallback: try to continue with next segment
    if (this.playbackState.currentSegment < this.textSegments.length - 1) {
      console.log('Skipping problematic segment and continuing');
      this.playbackState.currentSegment++;

      // Add a small delay before continuing
      setTimeout(async () => {
        await this.playCurrentSegment();
      }, 500);
      return;
    }

    // Attempt system recovery as last resort
    console.log('Attempting TTS system recovery...');
    const recoverySuccessful = await this.recoverFromError();
    if (recoverySuccessful && this.textSegments.length > 0) {
      // Restart from current segment
      await this.playCurrentSegment();
      return;
    }

    // Notify error callback with user-friendly message
    if (this.errorCallback) {
      this.errorCallback({
        ...error,
        message: TTSErrorHandler.getUserFriendlyMessage(error)
      });
    }

    // Stop playback on unrecoverable error
    this.stopReading();
  }

  /**
   * Find a fallback voice when the preferred voice is unavailable
   */
  private findFallbackVoice(): TTSVoice | null {
    const currentLang = this.playbackState.voice ?
      this.availableVoices.find(v => v.voiceURI === this.playbackState.voice)?.lang :
      'en-US';

    // Try to find a voice with the same language
    let fallback = this.availableVoices.find(v =>
      v.voiceURI !== this.playbackState.voice &&
      v.lang === currentLang
    );

    // If no same-language voice, try English variants
    if (!fallback) {
      fallback = this.availableVoices.find(v =>
        v.voiceURI !== this.playbackState.voice &&
        v.lang.startsWith('en')
      );
    }

    // If still no fallback, use any available voice
    if (!fallback) {
      fallback = this.availableVoices.find(v =>
        v.voiceURI !== this.playbackState.voice
      );
    }

    return fallback || null;
  }

  /**
   * Validate TTS environment and setup fallbacks
   */
  private async validateTTSEnvironment(): Promise<boolean> {
    try {
      // Check Chrome TTS availability
      if (typeof chrome !== 'undefined' && chrome.tts) {
        return new Promise((resolve) => {
          chrome.tts.getVoices((voices) => {
            if (voices && voices.length > 0) {
              resolve(true);
            } else {
              console.warn('Chrome TTS available but no voices found');
              resolve(false);
            }
          });
        });
      }

      // Check Web Speech API availability
      if (typeof speechSynthesis !== 'undefined') {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          return true;
        }

        // Sometimes voices load asynchronously
        return new Promise((resolve) => {
          const checkVoices = () => {
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
              resolve(true);
            } else {
              setTimeout(checkVoices, 100);
            }
          };

          speechSynthesis.onvoiceschanged = checkVoices;
          setTimeout(() => resolve(false), 5000); // Timeout after 5 seconds
        });
      }

      return false;
    } catch (error) {
      console.error('Error validating TTS environment:', error);
      return false;
    }
  }

  /**
   * Test voice availability before using it
   */
  private async testVoice(voiceURI: string): Promise<boolean> {
    try {
      if (typeof chrome !== 'undefined' && chrome.tts) {
        return new Promise((resolve) => {
          const testOptions: chrome.tts.TtsOptions = {
            voiceName: voiceURI,
            onEvent: (event) => {
              if (event.type === 'start' || event.type === 'end') {
                chrome.tts.stop();
                resolve(true);
              } else if (event.type === 'error') {
                resolve(false);
              }
            }
          };

          chrome.tts.speak('', testOptions); // Empty string for testing

          // Timeout if no response
          setTimeout(() => {
            chrome.tts.stop();
            resolve(false);
          }, 2000);
        });
      }

      // For Web Speech API, check if voice exists in available voices
      if (typeof speechSynthesis !== 'undefined') {
        const voices = speechSynthesis.getVoices();
        return voices.some(voice => voice.voiceURI === voiceURI);
      }

      return false;
    } catch (error) {
      console.error('Error testing voice:', error);
      return false;
    }
  }

  /**
   * Check network connectivity for remote voices
   */
  private async checkNetworkConnectivity(): Promise<boolean> {
    try {
      // Simple connectivity check
      await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      return true;
    } catch (error) {
      console.warn('Network connectivity check failed:', error);
      return false;
    }
  }

  /**
   * Get health status of TTS system
   */
  async getHealthStatus(): Promise<{
    isHealthy: boolean;
    availableEngines: string[];
    voiceCount: number;
    networkConnected: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    const availableEngines: string[] = [];

    // Check Chrome TTS
    if (typeof chrome !== 'undefined' && chrome.tts) {
      availableEngines.push('Chrome TTS');
    } else {
      errors.push('Chrome TTS not available');
    }

    // Check Web Speech API
    if (typeof speechSynthesis !== 'undefined') {
      availableEngines.push('Web Speech API');
    } else {
      errors.push('Web Speech API not available');
    }

    // Check network connectivity
    const networkConnected = await this.checkNetworkConnectivity();
    if (!networkConnected) {
      errors.push('Network connectivity issues detected');
    }

    // Check voice availability
    if (this.availableVoices.length === 0) {
      errors.push('No voices available');
    }

    return {
      isHealthy: availableEngines.length > 0 && this.availableVoices.length > 0,
      availableEngines,
      voiceCount: this.availableVoices.length,
      networkConnected,
      errors
    };
  }

  /**
   * Attempt to recover from errors by reinitializing TTS
   */
  async recoverFromError(): Promise<boolean> {
    try {
      console.log('Attempting TTS recovery...');

      // Reset state
      this.stopReading();
      this.retryCount = 0;
      this.availableVoices = [];

      // Reinitialize voices
      await this.initializeVoices();

      // Wait a bit for initialization
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if recovery was successful
      const health = await this.getHealthStatus();

      if (health.isHealthy) {
        console.log('TTS recovery successful');
        this.emitEvent({ type: 'start' }); // Signal recovery
        return true;
      } else {
        console.error('TTS recovery failed:', health.errors);
        return false;
      }
    } catch (error) {
      console.error('Error during TTS recovery:', error);
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stopReading();
    this.eventCallbacks.clear();
    this.errorCallback = null;
    this.currentUtterance = null;
  }
}