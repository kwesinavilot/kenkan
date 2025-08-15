import { Volume2, CircleGauge } from 'lucide-react';

interface PlaybackState {
  volume: number;
  speed: number;
}

interface AppSettings {
  showVolumeOnMain: boolean;
  showSpeedOnMain: boolean;
}

interface SecondaryControlsProps {
  playbackState: PlaybackState;
  appSettings: AppSettings;
  onVolumeChange: (volume: number) => void;
  onSpeedChange: (speed: number) => void;
}

export function SecondaryControls({ 
  playbackState, 
  appSettings, 
  onVolumeChange, 
  onSpeedChange 
}: SecondaryControlsProps) {
  if (!appSettings.showVolumeOnMain && !appSettings.showSpeedOnMain) {
    return null;
  }

  return (
    <div className="px-6 py-4 border-t border-gray-100">
      <div className="flex items-center justify-center space-x-8">
        {/* Volume Control */}
        {appSettings.showVolumeOnMain && (
          <div className="flex items-center space-x-3">
            <Volume2 className="w-4 h-4 text-gray-500" />
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={playbackState.volume * 100}
                onChange={(e) => onVolumeChange(parseInt(e.target.value) / 100)}
                className="w-20 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${playbackState.volume * 100}%, #e5e7eb ${playbackState.volume * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>
            <span className="text-sm text-gray-600 font-medium w-8 text-center">
              {Math.round(playbackState.volume * 100)}%
            </span>
          </div>
        )}

        {/* Speed Control */}
        {appSettings.showSpeedOnMain && (
          <div className="flex items-center space-x-3">
            <CircleGauge className="w-4 h-4 text-gray-500" />
            <div className="relative">
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={playbackState.speed}
                onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                className="w-20 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${((playbackState.speed - 0.5) / 1.5) * 100}%, #e5e7eb ${((playbackState.speed - 0.5) / 1.5) * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>
            <span className="text-sm text-gray-600 font-medium w-8 text-center">
              {playbackState.speed.toFixed(1)}x
            </span>
          </div>
        )}
      </div>
    </div>
  );
}