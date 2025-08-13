import type { TTSError, TTSVoice } from '../types/tts';

export class TTSErrorHandler {
  private static readonly ERROR_PATTERNS = {
    NETWORK_ERRORS: ['network', 'connection', 'timeout', 'fetch'],
    VOICE_ERRORS: ['voice', 'not found', 'unavailable', 'invalid'],
    PERMISSION_ERRORS: ['permission', 'denied', 'blocked', 'not allowed'],
    SYNTHESIS_ERRORS: ['synthesis', 'speak', 'utterance', 'audio']
  };

  /**
   * Categorize error based on message content
   */
  static categorizeError(error: any): TTSError {
    const message = (error?.message || error?.toString() || 'Unknown error').toLowerCase();
    
    if (this.ERROR_PATTERNS.NETWORK_ERRORS.some(pattern => message.includes(pattern))) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network connectivity issue detected',
        originalError: error,
        retryable: true
      };
    }

    if (this.ERROR_PATTERNS.VOICE_ERRORS.some(pattern => message.includes(pattern))) {
      return {
        code: 'VOICE_UNAVAILABLE',
        message: 'Selected voice is not available',
        originalError: error,
        retryable: false
      };
    }

    if (this.ERROR_PATTERNS.PERMISSION_ERRORS.some(pattern => message.includes(pattern))) {
      return {
        code: 'PERMISSION_DENIED',
        message: 'TTS permission denied or blocked',
        originalError: error,
        retryable: false
      };
    }

    if (this.ERROR_PATTERNS.SYNTHESIS_ERRORS.some(pattern => message.includes(pattern))) {
      return {
        code: 'TTS_FAILED',
        message: 'Text-to-speech synthesis failed',
        originalError: error,
        retryable: true
      };
    }

    return {
      code: 'UNKNOWN',
      message: message || 'Unknown TTS error',
      originalError: error,
      retryable: true
    };
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: TTSError): string {
    switch (error.code) {
      case 'VOICE_UNAVAILABLE':
        return 'The selected voice is not available. A different voice will be used automatically.';
      
      case 'NETWORK_ERROR':
        return 'Network connection issue detected. Some voices may not work properly.';
      
      case 'PERMISSION_DENIED':
        return 'Text-to-speech permission is required. Please check your browser settings.';
      
      case 'TTS_FAILED':
        return 'Text-to-speech failed. Trying alternative methods...';
      
      default:
        return 'An unexpected error occurred with text-to-speech. Attempting to recover...';
    }
  }

  /**
   * Get recovery suggestions for different error types
   */
  static getRecoverySuggestions(error: TTSError): string[] {
    switch (error.code) {
      case 'VOICE_UNAVAILABLE':
        return [
          'Try selecting a different voice',
          'Check if the voice is installed on your system',
          'Use a default system voice'
        ];
      
      case 'NETWORK_ERROR':
        return [
          'Check your internet connection',
          'Try using local voices instead of online voices',
          'Retry the operation in a few moments'
        ];
      
      case 'PERMISSION_DENIED':
        return [
          'Enable text-to-speech permissions in browser settings',
          'Reload the page and try again',
          'Check if the site is blocked from using audio'
        ];
      
      case 'TTS_FAILED':
        return [
          'Try refreshing the page',
          'Check if other audio is playing',
          'Try a different browser if the issue persists'
        ];
      
      default:
        return [
          'Refresh the page and try again',
          'Check browser console for more details',
          'Try using a different browser'
        ];
    }
  }

  /**
   * Determine if error should trigger a fallback to different TTS engine
   */
  static shouldFallbackToAlternativeEngine(error: TTSError): boolean {
    return error.code === 'TTS_FAILED' || 
           error.code === 'VOICE_UNAVAILABLE' ||
           (error.code === 'NETWORK_ERROR' && error.retryable);
  }

  /**
   * Determine if error should trigger voice fallback
   */
  static shouldFallbackToAlternativeVoice(error: TTSError): boolean {
    return error.code === 'VOICE_UNAVAILABLE' || 
           error.code === 'TTS_FAILED';
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  static calculateRetryDelay(attemptNumber: number, baseDelay: number = 1000): number {
    const maxDelay = 30000; // 30 seconds max
    const delay = baseDelay * Math.pow(2, attemptNumber - 1);
    return Math.min(delay, maxDelay);
  }

  /**
   * Filter voices to exclude potentially problematic ones
   */
  static filterReliableVoices(voices: TTSVoice[]): TTSVoice[] {
    return voices.filter(voice => {
      // Prefer local voices for reliability
      if (voice.localService) return true;
      
      // Include well-known reliable remote voices
      const reliableRemoteVoices = [
        'Google US English',
        'Google UK English',
        'Microsoft David',
        'Microsoft Zira'
      ];
      
      return reliableRemoteVoices.some(reliable => 
        voice.name.toLowerCase().includes(reliable.toLowerCase())
      );
    });
  }

  /**
   * Validate voice configuration
   */
  static validateVoiceConfiguration(voice: TTSVoice, rate: number, pitch: number, volume: number): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check rate
    if (rate < 0.1 || rate > 10) {
      issues.push(`Invalid speech rate: ${rate}. Must be between 0.1 and 10.`);
    }

    // Check pitch
    if (pitch < 0 || pitch > 2) {
      issues.push(`Invalid pitch: ${pitch}. Must be between 0 and 2.`);
    }

    // Check volume
    if (volume < 0 || volume > 1) {
      issues.push(`Invalid volume: ${volume}. Must be between 0 and 1.`);
    }

    // Check voice
    if (!voice.voiceURI || voice.voiceURI.trim().length === 0) {
      issues.push('Voice URI is empty or invalid.');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Create error report for debugging
   */
  static createErrorReport(error: TTSError, context: {
    voiceURI?: string;
    textLength?: number;
    browserInfo?: string;
    timestamp?: Date;
  }): string {
    const report = [
      `TTS Error Report - ${context.timestamp?.toISOString() || new Date().toISOString()}`,
      `Error Code: ${error.code}`,
      `Message: ${error.message}`,
      `Retryable: ${error.retryable}`,
      context.voiceURI ? `Voice: ${context.voiceURI}` : '',
      context.textLength ? `Text Length: ${context.textLength} characters` : '',
      context.browserInfo ? `Browser: ${context.browserInfo}` : '',
      error.originalError ? `Original Error: ${error.originalError}` : '',
      `User-Friendly Message: ${this.getUserFriendlyMessage(error)}`,
      `Recovery Suggestions: ${this.getRecoverySuggestions(error).join(', ')}`
    ].filter(line => line.length > 0);

    return report.join('\n');
  }
}