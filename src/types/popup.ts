export interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentSegment: number;
  totalSegments: number;
  voice: string;
  speed: number;
  volume: number;
  pitch: number;
}

export interface Voice {
  name: string;
  desc: string;
  accent: string;
  lang: string;
  premium: boolean;
}

export interface ContentInfo {
  detected: boolean;
  type: string;
  wordCount: number;
  currentPageWords: number;
  pageTitle: string;
}

export interface AppSettings {
  showWaveform: boolean;
  showVolumeOnMain: boolean;
  showSpeedOnMain: boolean;
  highlightFollowing: boolean;
  floatingButtonBehavior: 'always' | 'never';
  showFloatingOverlay: boolean;
}