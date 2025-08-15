import { useState, useEffect } from 'react';

interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
}

interface WaveformAnimationProps {
  playbackState: PlaybackState;
}

export function WaveformAnimation({ playbackState }: WaveformAnimationProps) {
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