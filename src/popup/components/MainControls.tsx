import { Play, Pause, Square, SkipBack, SkipForward } from 'lucide-react';

interface PlaybackState {
  isPlaying: boolean;
}

interface MainControlsProps {
  playbackState: PlaybackState;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
}

export function MainControls({ playbackState, onPlay, onPause, onStop }: MainControlsProps) {
  return (
    <div className="px-6 pb-4 pt-0">
      <div className="flex items-center justify-center space-x-4">
        <button className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105">
          <SkipBack className="w-5 h-5 text-gray-600" />
        </button>

        <button
          onClick={playbackState.isPlaying ? onPause : onPlay}
          className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-all duration-300 ring-4 ring-blue-100"
        >
          {playbackState.isPlaying ? (
            <Pause className="w-7 h-7 text-white" />
          ) : (
            <Play className="w-7 h-7 text-white ml-1" />
          )}
        </button>

        <button
          onClick={onStop}
          className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 ring-2 ring-orange-100"
        >
          <Square className="w-5 h-5 text-white" />
        </button>

        <button className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105">
          <SkipForward className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}