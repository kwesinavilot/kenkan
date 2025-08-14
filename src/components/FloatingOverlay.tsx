import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, Settings, X, Minimize2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export interface FloatingOverlayProps {
  isPlaying: boolean;
  isPaused: boolean;
  currentSegment: number;
  totalSegments: number;
  speed: number;
  volume: number;
  progress: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSpeedChange: (speed: number) => void;
  onVolumeChange: (volume: number) => void;
  onClose: () => void;
  onMinimize: () => void;
}

export function FloatingOverlay({
  isPlaying,
  isPaused,
  currentSegment,
  totalSegments,
  speed,
  volume,
  progress,
  onPlay,
  onPause,
  onStop,
  onSpeedChange,
  onVolumeChange,
  onClose,
  onMinimize
}: FloatingOverlayProps) {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number }>({
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    const newX = Math.max(0, Math.min(window.innerWidth - 300, dragRef.current.startPosX + deltaX));
    const newY = Math.max(0, Math.min(window.innerHeight - 200, dragRef.current.startPosY + deltaY));

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    onMinimize();
  };

  if (isMinimized) {
    return (
      <div
        className="fixed z-[10000] cursor-move"
        style={{ left: position.x, top: position.y }}
        onMouseDown={handleMouseDown}
      >
        <Button
          onClick={handleMinimize}
          className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          🎧
        </Button>
      </div>
    );
  }

  return (
    <div
      className="fixed z-[10000] select-none"
      style={{ left: position.x, top: position.y }}
    >
      <Card className="w-80 shadow-xl border-2 border-blue-200 bg-white/95 backdrop-blur-sm">
        {/* Header */}
        <div
          className="flex items-center justify-between p-3 bg-blue-50 cursor-move border-b"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">🎧</span>
            <span className="font-medium text-gray-800">Kenkan TTS</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMinimize}
              className="w-8 h-8 p-0"
            >
              <Minimize2 className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Segment {currentSegment + 1} of {totalSegments}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onStop}
              className="w-10 h-10 p-0"
            >
              <Square className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={handlePlayPause}
              className="w-12 h-12 p-0 rounded-full"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowControls(!showControls)}
              className="w-10 h-10 p-0"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Advanced Controls */}
          {showControls && (
            <div className="space-y-3 pt-3 border-t border-gray-200">
              {/* Speed Control */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">Speed</label>
                  <span className="text-sm text-gray-600">{speed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={speed}
                  onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Volume Control */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Volume2 className="w-4 h-4 mr-1" />
                    Volume
                  </label>
                  <span className="text-sm text-gray-600">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          )}

          {/* Status */}
          <div className="text-center">
            <span className={`text-sm px-2 py-1 rounded-full ${
              isPlaying 
                ? 'bg-green-100 text-green-800' 
                : isPaused 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isPlaying ? 'Playing' : isPaused ? 'Paused' : 'Stopped'}
            </span>
          </div>
        </CardContent>
      </Card>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}