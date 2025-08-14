import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Play, Pause, Square, Settings, Volume2, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import './popup.css';

interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentSegment: number;
  totalSegments: number;
  voice: string;
  speed: number;
  volume: number;
  pitch: number;
}

interface Voice {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

function Popup() {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    isPaused: false,
    currentSegment: 0,
    totalSegments: 0,
    voice: '',
    speed: 1.0,
    volume: 1.0,
    pitch: 1.0
  });
  
  const [voices, setVoices] = useState<Voice[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({
    totalTabs: 0,
    activeTabs: 0,
    tabsWithContent: 0,
    playingTabs: 0
  });

  useEffect(() => {
    loadInitialData();
    
    // Refresh data every 5 seconds (reduced frequency)
    const interval = setInterval(loadInitialData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadInitialData = async () => {
    try {
      // Get playback state
      const stateResponse = await sendMessage({ action: 'getPlaybackState' });
      if (stateResponse.success && stateResponse.data) {
        setPlaybackState(stateResponse.data);
      }

      // Get available voices
      const voicesResponse = await sendMessage({ action: 'getVoices' });
      if (voicesResponse.success && voicesResponse.data) {
        setVoices(voicesResponse.data);
      }

      // Get stats
      const statsResponse = await sendMessage({ action: 'getStats' });
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      setIsConnected(true);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsConnected(false);
    }
  };

  const sendMessage = async (message: any): Promise<any> => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message });
        } else {
          resolve(response || { success: true });
        }
      });
    });
  };

  const handlePlay = async () => {
    const response = await sendMessage({ action: 'startReading' });
    if (response.success) {
      setPlaybackState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
    }
  };

  const handlePause = async () => {
    const response = await sendMessage({ action: 'pauseReading' });
    if (response.success) {
      setPlaybackState(prev => ({ ...prev, isPlaying: false, isPaused: true }));
    }
  };

  const handleStop = async () => {
    const response = await sendMessage({ action: 'stopReading' });
    if (response.success) {
      setPlaybackState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        isPaused: false,
        currentSegment: 0
      }));
    }
  };

  const handleVoiceChange = async (voiceURI: string) => {
    const response = await sendMessage({ action: 'setVoice', data: { voiceURI } });
    if (response.success) {
      setPlaybackState(prev => ({ ...prev, voice: voiceURI }));
    }
  };

  const handleSpeedChange = async (speed: number) => {
    const response = await sendMessage({ action: 'setSpeed', data: { speed } });
    if (response.success) {
      setPlaybackState(prev => ({ ...prev, speed }));
    }
  };

  const handleVolumeChange = async (volume: number) => {
    const response = await sendMessage({ action: 'setVolume', data: { volume } });
    if (response.success) {
      setPlaybackState(prev => ({ ...prev, volume }));
    }
  };

  const handlePitchChange = async (pitch: number) => {
    const response = await sendMessage({ action: 'setPitch', data: { pitch } });
    if (response.success) {
      setPlaybackState(prev => ({ ...prev, pitch }));
    }
  };

  const progress = playbackState.totalSegments > 0 
    ? (playbackState.currentSegment / playbackState.totalSegments) * 100 
    : 0;

  const voiceOptions = voices.map(voice => ({
    value: voice.voiceURI,
    label: `${voice.name} (${voice.lang})`
  }));

  return (
    <div className="w-96 h-[600px] p-4 bg-gray-50">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🎧</span>
              Kenkan TTS
            </div>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="text-center">
            <span className={`text-sm px-3 py-1 rounded-full ${
              playbackState.isPlaying 
                ? 'bg-green-100 text-green-800' 
                : playbackState.isPaused 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {playbackState.isPlaying ? 'Playing' : playbackState.isPaused ? 'Paused' : 'Stopped'}
            </span>
          </div>

          {/* Progress */}
          {playbackState.totalSegments > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Segment {playbackState.currentSegment + 1} of {playbackState.totalSegments}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Main Controls */}
          <div className="flex items-center justify-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStop}
              disabled={!playbackState.isPlaying && !playbackState.isPaused}
              className="w-10 h-10 p-0"
            >
              <Square className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={playbackState.isPlaying ? handlePause : handlePlay}
              className="w-12 h-12 p-0 rounded-full"
            >
              {playbackState.isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="w-10 h-10 p-0"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              {/* Voice Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Voice</label>
                <Select
                  options={voiceOptions}
                  value={playbackState.voice}
                  onChange={handleVoiceChange}
                  placeholder="Select voice..."
                />
              </div>

              {/* Speed Control */}
              <Slider
                label="Speed"
                value={playbackState.speed}
                onChange={handleSpeedChange}
                min={0.5}
                max={3}
                step={0.1}
                formatValue={(val) => `${val.toFixed(1)}x`}
              />

              {/* Volume Control */}
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-gray-700">
                  <Volume2 className="w-4 h-4 mr-1" />
                  Volume
                </div>
                <Slider
                  value={playbackState.volume}
                  onChange={handleVolumeChange}
                  min={0}
                  max={1}
                  step={0.05}
                  formatValue={(val) => `${Math.round(val * 100)}%`}
                  showValue={true}
                />
              </div>

              {/* Pitch Control */}
              <Slider
                label="Pitch"
                value={playbackState.pitch}
                onChange={handlePitchChange}
                min={0.5}
                max={2}
                step={0.1}
                formatValue={(val) => `${val.toFixed(1)}`}
              />
            </div>
          )}

          {/* Statistics */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-medium text-gray-700 mb-2 flex items-center">
              <Zap className="w-4 h-4 mr-1" />
              Statistics
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-blue-50 p-2 rounded">
                <div className="font-medium text-blue-900">{stats.totalTabs}</div>
                <div className="text-blue-600 text-xs">Total Tabs</div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="font-medium text-green-900">{stats.tabsWithContent}</div>
                <div className="text-green-600 text-xs">With Content</div>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <div className="font-medium text-purple-900">{stats.activeTabs}</div>
                <div className="text-purple-600 text-xs">Active</div>
              </div>
              <div className="bg-orange-50 p-2 rounded">
                <div className="font-medium text-orange-900">{stats.playingTabs}</div>
                <div className="text-orange-600 text-xs">Playing</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.id) {
                  chrome.tabs.sendMessage(tabs[0].id, { action: 'refreshContent' });
                }
              })}
            >
              Refresh Content
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-200">
            Kenkan v0.5.0 - AI-Powered Text-to-Speech
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<Popup />);