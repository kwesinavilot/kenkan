import { useState, useEffect } from 'react';

interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
}

interface ContentInfo {
  currentPageWords: number;
}

interface AppSettings {
  showWaveform: boolean;
}

interface ProgressSectionProps {
  playbackState: PlaybackState;
  contentInfo: ContentInfo;
  appSettings: AppSettings;
  progress: number;
}

function WaveformAnimation({ playbackState }: { playbackState: PlaybackState }) {
  const [waveformHeights, setWaveformHeights] = useState<number[]>(
    Array.from({ length: 20 }, () => 12)
  );

  useEffect(() => {
    let interval: number;

    if (playbackState.isPlaying) {
      // Fast animation when playing
      interval = setInterval(() => {
        setWaveformHeights(Array.from({ length: 20 }, () => Math.random() * 40 + 12));
      }, 200); // Much faster - 200ms
    } else if (playbackState.isPaused) {
      // Slow pulse when paused - keep last heights but pulse
      // Don't change heights, just let CSS pulse animation handle it
    } else {
      // Uniform when stopped
      setWaveformHeights(Array.from({ length: 20 }, () => 12));
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [playbackState.isPlaying, playbackState.isPaused]);

  return (
    <div className="flex items-center justify-center space-x-1.5 h-12 w-full px-4">
      {waveformHeights.map((height, i) => (
        <div
          key={i}
          className={`flex-1 bg-blue-500 rounded-full transition-all duration-150 ${playbackState.isPaused ? 'animate-pulse' : ''
            }`}
          style={{
            height: `${height}px`,
            maxWidth: '4px'
          }}
        />
      ))}
    </div>
  );
}

export function ProgressSection({ playbackState, contentInfo, appSettings, progress }: ProgressSectionProps) {
  return (
    <div className="px-6 py-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">Progress</span>
          <span className="text-sm text-gray-600 font-medium">
            <span className="text-blue-600 font-semibold">{Math.round(progress)}%</span>
            <span className="text-gray-400 mx-1">•</span>
            <span>
              {Math.round((progress / 100) * contentInfo.currentPageWords).toLocaleString()}/{contentInfo.currentPageWords.toLocaleString()} words
            </span>
          </span>
        </div>

        {/* Enhanced Waveform - Conditional */}
        {appSettings.showWaveform && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <WaveformAnimation playbackState={playbackState} />
          </div>
        )}
      </div>
    </div>
  );
}