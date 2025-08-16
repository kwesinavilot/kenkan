import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import {
  loadReadingStats,
  startReadingSession,
  endReadingSession,
  incrementDocumentCount,
  type ReadingStats
} from '../utils/statsStorage';
// LLM TTS is now handled automatically behind the scenes

// Component imports
import { Header } from './components/Header';
import { ContentDetectionBar } from './components/ContentDetectionBar';
import { VoiceSelector } from './components/VoiceSelector';
import { ProgressSection } from './components/ProgressSection';
import { MainControls } from './components/MainControls';
import { SecondaryControls } from './components/SecondaryControls';
import { SettingsPanel } from './components/SettingsPanel';
import { QuickStats } from './components/QuickStats';
import { Footer } from './components/Footer';

// Types
import type { PlaybackState, Voice, ContentInfo, AppSettings } from '../types/popup';

import './popup.css';



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

  // LLM TTS is now automatic based on voice selection
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

  // const [stats, setStats] = useState({
  //   activeTabs: 3,      // Tabs with Kenkan extension active (max 3)
  //   contentTabs: 8      // Tabs with readable content detected
  // });

  const [readingStats, setReadingStats] = useState<ReadingStats>({
    todayReadingTime: 0,
    totalDocumentsRead: 0,
    lastResetDate: new Date().toISOString().split('T')[0],
    currentSessionStart: undefined
  });

  const [appSettings, setAppSettings] = useState<AppSettings>({
    showWaveform: true,
    showVolumeOnMain: true,
    showSpeedOnMain: true,
    highlightFollowing: true,
    floatingButtonBehavior: 'always',  // Always show by default
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
    loadReadingStatsData();

    const interval = setInterval(() => {
      loadInitialData();
      getCurrentPageWordCount();
      enforceTabLimit();
      updateReadingStatsDisplay();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Real-time update for reading time when actively reading
  useEffect(() => {
    let realtimeInterval: number;

    if (playbackState.isPlaying && readingStats.currentSessionStart) {
      realtimeInterval = setInterval(() => {
        setReadingStats(prev => ({ ...prev })); // Trigger re-render to update display
      }, 1000); // Update every second
    }

    return () => {
      if (realtimeInterval) clearInterval(realtimeInterval);
    };
  }, [playbackState.isPlaying, readingStats.currentSessionStart]);

  const loadReadingStatsData = () => {
    const stats = loadReadingStats();
    setReadingStats(stats);
  };

  const updateReadingStatsDisplay = () => {
    const stats = loadReadingStats();
    setReadingStats(stats);
  };

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

      // If floating button setting changed, notify content script
      if ('floatingButtonBehavior' in newSettings) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'toggleFloatingButton',
              data: { show: newSettings.floatingButtonBehavior === 'always' }
            });
          }
        });
      }
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
      // const statsResponse = await sendMessage({ action: 'getStats' });
      // if (statsResponse.success && statsResponse.data) {
      //   setStats(statsResponse.data);
      // }
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
        // setStats(prev => ({
        //   ...prev,
        //   activeTabs: Math.min(response.data.activeTabs, 3)
        // }));
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
    try {
      // If paused, just resume
      if (playbackState.isPaused) {
        const response = await sendMessage({ action: 'resumeReading' });
        if (response.success) {
          setPlaybackState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
          // Resume reading session tracking
          const updatedStats = startReadingSession();
          setReadingStats(updatedStats);
        }
        return;
      }

      // For new reading, first ensure content is extracted from current tab
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (!tabs[0]?.id) {
          alert('No active tab found. Please try again.');
          return;
        }

        try {
          // First, ask content script to extract and send content to background
          chrome.tabs.sendMessage(tabs[0].id, { action: 'refreshContent' }, async (contentResponse) => {
            if (chrome.runtime.lastError) {
              console.error('Content script not available:', chrome.runtime.lastError);
              alert('Content script not loaded. Please refresh the page and try again.');
              return;
            }

            if (contentResponse && contentResponse.success) {
              // Content extracted successfully, give background script a moment to process it
              setTimeout(async () => {
                const response = await sendMessage({ action: 'startReading' });
                if (response.success) {
                  setPlaybackState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
                  // Start reading session tracking and increment document count
                  startReadingSession();
                  const docStats = incrementDocumentCount();
                  setReadingStats(docStats);
                } else {
                  console.error('Failed to start reading:', response.error);
                  alert('Failed to start reading. The page might not have readable content.');
                }
              }, 100); // Small delay to ensure content is processed
            } else {
              console.error('Failed to extract content:', contentResponse);
              alert('No readable content found on this page. Please navigate to a page with text content and try again.');
            }
          });
        } catch (error) {
          console.error('Error communicating with content script:', error);
          alert('Error communicating with content script. Please refresh the page and try again.');
        }
      });
    } catch (error) {
      console.error('Error starting playback:', error);
      alert('Error starting playback. Please try again.');
    }
  };

  const handlePause = async () => {
    const response = await sendMessage({ action: 'pauseReading' });
    if (response.success) {
      setPlaybackState(prev => ({ ...prev, isPlaying: false, isPaused: true }));
      // End reading session and save time
      const updatedStats = endReadingSession();
      setReadingStats(updatedStats);
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
      // End reading session and save time
      const updatedStats = endReadingSession();
      setReadingStats(updatedStats);
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

  const truncateTitle = (title: string, maxLength: number = 40) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="w-[400px] bg-white shadow-2xl overflow-hidden font-sans relative">
      <Header onSettingsClick={() => setShowSettings(!showSettings)} />

      <ContentDetectionBar
        contentInfo={contentInfo}
        truncateTitle={truncateTitle}
      />

      <VoiceSelector
        voices={voices}
        currentVoice={currentVoice}
        showVoiceSelector={showVoiceSelector}
        onToggleSelector={() => setShowVoiceSelector(!showVoiceSelector)}
        onVoiceChange={handleVoiceChange}
      />

      <ProgressSection
        playbackState={playbackState}
        contentInfo={contentInfo}
        appSettings={appSettings}
        progress={progress}
      />

      <MainControls
        playbackState={playbackState}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
      />

      <SecondaryControls
        playbackState={playbackState}
        appSettings={appSettings}
        onVolumeChange={handleVolumeChange}
        onSpeedChange={handleSpeedChange}
      />

      <SettingsPanel
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        playbackState={playbackState}
        appSettings={appSettings}
        readingStats={readingStats}
        onSpeedChange={handleSpeedChange}
        onVolumeChange={handleVolumeChange}
        onSettingsChange={saveSettings}
      />

      <QuickStats readingStats={readingStats} />

      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<Popup />);