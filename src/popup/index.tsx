import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import {
  Play,
  Pause,
  Square,
  Settings,
  Volume2,
  Zap,
  BookOpen,
  SkipForward,
  SkipBack,
  Star,
  ChevronDown,
  CircleGauge
} from 'lucide-react';

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
  name: string;
  desc: string;
  accent: string;
  lang: string;
  premium: boolean;
}

interface ContentInfo {
  detected: boolean;
  type: string;
  wordCount: number;
  currentPageWords: number;
  pageTitle: string;
}

interface AppSettings {
  showWaveform: boolean;
  showVolumeOnMain: boolean;
  showSpeedOnMain: boolean;
  highlightFollowing: boolean;
  showFloatingButton: boolean;
  showFloatingOverlay: boolean;
}



function Popup() {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    isPaused: false,
    currentSegment: 0,
    totalSegments: 0,
    voice: 'Kwame',
    speed: 1.0,
    volume: 0.8,
    pitch: 1.0
  });


  const [showSettings, setShowSettings] = useState(false);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  // const [isConnected, setIsConnected] = useState(true);
  const [contentInfo, setContentInfo] = useState<ContentInfo>({
    detected: true,
    type: 'Research Article',
    wordCount: 4200,
    currentPageWords: 0,
    pageTitle: ''
  });

  const [stats, setStats] = useState({
    timeListened: '2h 34m',
    wordsRead: '12,450',
    activeTabs: 3,      // Tabs with Kenkan extension active (max 3)
    contentTabs: 8      // Tabs with readable content detected
  });

  const [appSettings, setAppSettings] = useState<AppSettings>({
    showWaveform: true,
    showVolumeOnMain: true,
    showSpeedOnMain: true,
    highlightFollowing: true,
    showFloatingButton: true,
    showFloatingOverlay: false  // Disabled by default since it's redundant
  });

  const voices: Voice[] = [
    { name: 'Kwame', desc: 'Expressive Storyteller', accent: 'West African', lang: 'EN', premium: false },
    { name: 'Sandra', desc: 'Warm & Friendly', accent: 'West African', lang: 'EN', premium: false },
    { name: 'Kwesi', desc: 'Authoritative News', accent: 'West African', lang: 'EN', premium: true },
    { name: 'Akua', desc: 'French Eloquent', accent: 'Parisian', lang: 'FR', premium: true }
  ];

  useEffect(() => {
    loadSettings();
    loadInitialData();
    getCurrentPageWordCount();
    enforceTabLimit();
    const interval = setInterval(() => {
      loadInitialData();
      getCurrentPageWordCount();
      enforceTabLimit();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('kenkan-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setAppSettings(prev => ({ ...prev, ...settings }));
      }

      const savedPlaybackState = localStorage.getItem('kenkan-playback-state');
      if (savedPlaybackState) {
        const playback = JSON.parse(savedPlaybackState);
        setPlaybackState(prev => ({ ...prev, ...playback }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...appSettings, ...newSettings };
      setAppSettings(updatedSettings);
      localStorage.setItem('kenkan-settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const savePlaybackState = (newState: Partial<PlaybackState>) => {
    try {
      const updatedState = { ...playbackState, ...newState };
      localStorage.setItem('kenkan-playback-state', JSON.stringify({
        voice: updatedState.voice,
        speed: updatedState.speed,
        volume: updatedState.volume,
        pitch: updatedState.pitch
      }));
    } catch (error) {
      console.error('Error saving playback state:', error);
    }
  };

  const loadInitialData = async () => {
    try {
      const stateResponse = await sendMessage({ action: 'getPlaybackState' });
      if (stateResponse.success && stateResponse.data) {
        setPlaybackState(stateResponse.data);
      }

      // Get updated stats
      const statsResponse = await sendMessage({ action: 'getStats' });
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getCurrentPageWordCount = async () => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs[0]?.id && tabs[0]?.title) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'getWordCount' }, (response) => {
            if (response && response.wordCount) {
              setContentInfo(prev => ({
                ...prev,
                currentPageWords: response.wordCount,
                detected: response.wordCount > 0,
                type: response.contentType || 'Web Page',
                pageTitle: tabs[0].title || 'Untitled Page'
              }));
            }
          });
        }
      });
    } catch (error) {
      console.error('Error getting word count:', error);
    }
  };

  const enforceTabLimit = async () => {
    try {
      const response = await sendMessage({ action: 'enforceTabLimit', data: { maxTabs: 3 } });
      if (response.success && response.data) {
        setStats(prev => ({
          ...prev,
          activeTabs: Math.min(response.data.activeTabs, 3)
        }));
      }
    } catch (error) {
      console.error('Error enforcing tab limit:', error);
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
    // If paused, resume; otherwise start fresh
    const action = playbackState.isPaused ? 'resumeReading' : 'startReading';
    const response = await sendMessage({ action });
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
    // Stop completely and reset to beginning
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

  const handleVoiceChange = (voiceName: string) => {
    const newState = { voice: voiceName };
    setPlaybackState(prev => ({ ...prev, ...newState }));
    savePlaybackState(newState);
    setShowVoiceSelector(false);
  };

  const handleSpeedChange = async (speed: number) => {
    const response = await sendMessage({ action: 'setSpeed', data: { speed } });
    if (response.success) {
      const newState = { speed };
      setPlaybackState(prev => ({ ...prev, ...newState }));
      savePlaybackState(newState);
    }
  };

  const handleVolumeChange = async (volume: number) => {
    const response = await sendMessage({ action: 'setVolume', data: { volume } });
    if (response.success) {
      const newState = { volume };
      setPlaybackState(prev => ({ ...prev, ...newState }));
      savePlaybackState(newState);
    }
  };

  const currentVoice = voices.find(v => v.name === playbackState.voice) || voices[0];
  const progress = playbackState.totalSegments > 0
    ? (playbackState.currentSegment / playbackState.totalSegments) * 100
    : 65; // Demo progress
  console.log('Current progress is: ' + progress);

  const truncateTitle = (title: string, maxLength: number = 40) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength).trim() + '...';
  };

  const Switch = ({ checked, onChange, disabled = false }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) => (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
          }`}
      />
    </button>
  );

  const WaveformAnimation = () => {
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
  };

  return (
    <div className="w-[400px] bg-white shadow-2xl overflow-hidden font-sans relative">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Kenkan</h1>
              <p className="text-blue-100 text-sm font-medium">Read</p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
          >
            <Settings className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Content Detection Bar */}
      {contentInfo.detected && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-3 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm" />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-700 font-medium">
                Reading: <span className="font-semibold text-gray-900" title={contentInfo.pageTitle}>
                  {truncateTitle(contentInfo.pageTitle)}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                {contentInfo.type}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice Selector */}
      <div className="px-6 py-4 border-b border-gray-100 relative">
        <button
          onClick={() => setShowVoiceSelector(!showVoiceSelector)}
          className="w-full bg-gray-50 hover:bg-gray-100 rounded-xl py-3 px-4 flex items-center justify-between transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
              {currentVoice.name[0]}
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900 text-base">{currentVoice.name}</div>
              <div className="text-sm text-gray-600 font-medium">{currentVoice.desc}</div>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${showVoiceSelector ? 'rotate-180' : ''}`} />
        </button>

        {/* Voice Dropdown */}
        {showVoiceSelector && (
          <div className="absolute top-full left-6 right-6 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto backdrop-blur-sm">
            {voices.map((voice) => (
              <button
                key={voice.name}
                onClick={() => handleVoiceChange(voice.name)}
                className="w-full py-3 px-4 hover:bg-gray-50 flex items-center justify-between transition-all duration-200 first:rounded-t-xl last:rounded-b-xl border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {voice.name[0]}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 flex items-center space-x-2 text-base">
                      <span>{voice.name}</span>
                      {voice.premium && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">{voice.desc}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">
                      <span className="bg-gray-100 px-2 py-0.5 rounded-full mr-2">{voice.accent}</span>
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{voice.lang}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Waveform Section */}
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
              <WaveformAnimation />
            </div>
          )}
        </div>
      </div>

      {/* Progress Section - Commented out for now */}
      {/* 
      <div className="px-6 py-5">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">Progress</span>
            <span className="text-sm text-gray-600 font-medium">
              <span className="text-blue-600 font-semibold">{Math.round(progress)}%</span>
              <span className="text-gray-400 mx-1">•</span>
              <span>{contentInfo.currentPageWords.toLocaleString()} words</span>
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      */}

      {/* Main Controls */}
      <div className="px-6 pb-4 pt-0">
        <div className="flex items-center justify-center space-x-4">
          <button className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105">
            <SkipBack className="w-5 h-5 text-gray-600" />
          </button>

          <button
            onClick={playbackState.isPlaying ? handlePause : handlePlay}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-all duration-300 ring-4 ring-blue-100"
          >
            {playbackState.isPlaying ? (
              <Pause className="w-7 h-7 text-white" />
            ) : (
              <Play className="w-7 h-7 text-white ml-1" />
            )}
          </button>

          <button
            onClick={handleStop}
            className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 ring-2 ring-orange-100"
          >
            <Square className="w-5 h-5 text-white" />
          </button>

          <button className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105">
            <SkipForward className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Secondary Controls */}
      {(appSettings.showVolumeOnMain || appSettings.showSpeedOnMain) && (
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
                    onChange={(e) => handleVolumeChange(parseInt(e.target.value) / 100)}
                    className="w-20 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${playbackState.volume * 100}%, #e5e7eb ${playbackState.volume * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 font-medium w-8 text-center">{Math.round(playbackState.volume * 100)}%</span>
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
                    onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                    className="w-20 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #10b981 0%, #10b981 ${((playbackState.speed - 0.5) / 1.5) * 100}%, #e5e7eb ${((playbackState.speed - 0.5) / 1.5) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 font-medium w-8 text-center">{playbackState.speed.toFixed(1)}x</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Sliding Panel */}
      <div className={`absolute inset-0 bg-white transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${showSettings ? 'translate-x-0' : 'translate-x-full'
        }`}>
        {/* Settings Header */}
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
              >
                <ChevronDown className="w-4 h-4 text-white rotate-90" />
              </button>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight">Settings</h1>
                <p className="text-gray-100 text-sm font-medium">Customize your experience</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          {/* Playback Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Playback</h3>

            {/* Speed Control */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700">Reading Speed</label>
                <span className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full">
                  {playbackState.speed.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={playbackState.speed}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${((playbackState.speed - 0.5) / 1.5) * 100}%, #e5e7eb ${((playbackState.speed - 0.5) / 1.5) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0.5x</span>
                <span>1.0x</span>
                <span>2.0x</span>
              </div>
            </div>

            {/* Volume Control */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Volume
                </label>
                <span className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full">
                  {Math.round(playbackState.volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={playbackState.volume * 100}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value) / 100)}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${playbackState.volume * 100}%, #e5e7eb ${playbackState.volume * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>
          </div>

          {/* Interface Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Interface Settings</h3>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="font-medium text-gray-900">Show floating button</div>
                <div className="text-gray-600">Display floating TTS button on web pages</div>
              </div>
              <Switch
                checked={appSettings.showFloatingButton}
                onChange={(checked) => saveSettings({ showFloatingButton: checked })}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Show waveform visualizer</div>
                  <div className="text-gray-600">Display animated waveform during playback</div>
                </div>
                <Switch
                  checked={appSettings.showWaveform}
                  onChange={(checked) => saveSettings({ showWaveform: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Show volume on main screen</div>
                  <div className="text-gray-600">Display volume control on popup main screen</div>
                </div>
                <Switch
                  checked={appSettings.showVolumeOnMain}
                  onChange={(checked) => saveSettings({ showVolumeOnMain: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Show speed on main screen</div>
                  <div className="text-gray-600">Display speed control on popup main screen</div>
                </div>
                <Switch
                  checked={appSettings.showSpeedOnMain}
                  onChange={(checked) => saveSettings({ showSpeedOnMain: checked })}
                />
              </div>

              {/* <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Show floating overlay</div>
                  <div className="text-gray-600">Display additional control overlay during reading</div>
                </div>
                <Switch
                  checked={appSettings.showFloatingOverlay}
                  onChange={(checked) => saveSettings({ showFloatingOverlay: checked })}
                />
              </div> */}

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Highlight following</div>
                  <div className="text-gray-600">Highlight text as it's being read</div>
                </div>
                <Switch
                  checked={appSettings.highlightFollowing}
                  onChange={(checked) => saveSettings({ highlightFollowing: checked })}
                />
              </div>
            </div>
          </div>

          {/* Tab Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Tab Management</h3>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">{stats.activeTabs}</span>
                </div>
                <div>
                  <div className="font-medium text-blue-900">Active tabs (max 3)</div>
                  <div className="text-sm text-blue-700">Kenkan is active on {stats.activeTabs} of 3 allowed tabs</div>
                </div>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.activeTabs / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">About</h3>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-center space-y-2">
                <div className="font-semibold text-gray-900">Kenkan v2.5.0</div>
                <div className="text-sm text-gray-600">AI-Powered Text-to-Speech</div>
                <div className="text-xs text-gray-500">Making web content accessible</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-5">
        <div className="grid grid-cols-2 gap-6 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Zap className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Today</span>
            </div>
            <div className="items-center justify-center space-y-2">
              <span className="font-bold text-lg text-gray-900">{stats.timeListened}</span>
              <div className="text-xs text-gray-600 font-medium">Time listened</div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <BookOpen className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Active</span>
            </div>
            <div className="items-center justify-center space-y-2">
              <span className="font-bold text-lg text-gray-900">{stats.activeTabs}/{stats.contentTabs}</span>
              <div className="text-xs text-gray-600 font-medium">{stats.contentTabs} with content</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 px-6 py-3">
        <div className="text-center text-xs text-gray-400 font-medium">
          v2.5.0
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<Popup />);