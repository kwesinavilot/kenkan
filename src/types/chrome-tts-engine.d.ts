// Chrome TTS Engine API type definitions

declare namespace chrome.ttsEngine {
  interface SpeakOptions {
    voiceName?: string;
    lang?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    enqueue?: boolean;
    extensionId?: string;
    gender?: 'male' | 'female';
    requiredEventTypes?: string[];
    desiredEventTypes?: string[];
    onEvent?: (event: chrome.tts.TtsEvent) => void;
  }

  interface TtsVoice {
    voiceName: string;
    lang?: string;
    gender?: 'male' | 'female';
    remote?: boolean;
    extensionId?: string;
    eventTypes?: chrome.tts.EventType[];
  }

  interface OnSpeakEvent extends chrome.events.Event<(
    utterance: string,
    options: SpeakOptions,
    sendTtsEvent: (event: chrome.tts.TtsEvent) => void
  ) => void> {}

  interface OnStopEvent extends chrome.events.Event<() => void> {}

  interface OnPauseEvent extends chrome.events.Event<() => void> {}

  interface OnResumeEvent extends chrome.events.Event<() => void> {}

  const onSpeak: OnSpeakEvent;
  const onStop: OnStopEvent;
  const onPause: OnPauseEvent;
  const onResume: OnResumeEvent;

  function updateVoices(voices: TtsVoice[]): void;
}