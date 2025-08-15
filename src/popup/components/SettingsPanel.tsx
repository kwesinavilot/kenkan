import { ChevronDown, Volume2 } from 'lucide-react';
import { Switch } from './Switch';
import { OpenAITTSSettings } from './OpenAITTSSettings';
import { formatReadingTime, getCurrentSessionDuration } from '../../utils/statsStorage';

interface PlaybackState {
  speed: number;
  volume: number;
}

interface AppSettings {
  showWaveform: boolean;
  showVolumeOnMain: boolean;
  showSpeedOnMain: boolean;
  highlightFollowing: boolean;
  floatingButtonBehavior: 'always' | 'never';
}

interface ReadingStats {
  todayReadingTime: number;
  totalDocumentsRead: number;
  currentSessionStart?: string;
}

interface OpenAITTSState {
  enabled: boolean;
  apiKey: string;
  voice: string;
  model: 'tts-1' | 'tts-1-hd';
}

interface SettingsPanelProps {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  playbackState: PlaybackState;
  appSettings: AppSettings;
  readingStats: ReadingStats;
  openaiTTS: OpenAITTSState;
  onSpeedChange: (speed: number) => void;
  onVolumeChange: (volume: number) => void;
  onSettingsChange: (settings: Partial<AppSettings>) => void;
  onOpenAITTSChange: (settings: Partial<OpenAITTSState>) => void;
}

export function SettingsPanel({
  showSettings,
  setShowSettings,
  playbackState,
  appSettings,
  readingStats,
  openaiTTS,
  onSpeedChange,
  onVolumeChange,
  onSettingsChange,
  onOpenAITTSChange
}: SettingsPanelProps) {
  return (
    <div className={`absolute inset-0 bg-white transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
      showSettings ? 'translate-x-0' : 'translate-x-full'
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
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
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
              onChange={(e) => onVolumeChange(parseInt(e.target.value) / 100)}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${playbackState.volume * 100}%, #e5e7eb ${playbackState.volume * 100}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* OpenAI TTS Settings */}
        <OpenAITTSSettings
          isEnabled={openaiTTS.enabled}
          apiKey={openaiTTS.apiKey}
          voice={openaiTTS.voice}
          model={openaiTTS.model}
          onToggle={(enabled) => onOpenAITTSChange({ enabled })}
          onApiKeyChange={(apiKey) => onOpenAITTSChange({ apiKey })}
          onVoiceChange={(voice) => onOpenAITTSChange({ voice })}
          onModelChange={(model) => onOpenAITTSChange({ model })}
        />

        {/* Interface Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Interface</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <label className="text-sm font-semibold text-gray-700">Show Waveform</label>
                <p className="text-xs text-gray-500 mt-1">Display animated waveform during playback</p>
              </div>
              <Switch
                checked={appSettings.showWaveform}
                onChange={(checked) => onSettingsChange({ showWaveform: checked })}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <label className="text-sm font-semibold text-gray-700">Show Volume on Main</label>
                <p className="text-xs text-gray-500 mt-1">Display volume control in main interface</p>
              </div>
              <Switch
                checked={appSettings.showVolumeOnMain}
                onChange={(checked) => onSettingsChange({ showVolumeOnMain: checked })}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <label className="text-sm font-semibold text-gray-700">Show Speed on Main</label>
                <p className="text-xs text-gray-500 mt-1">Display speed control in main interface</p>
              </div>
              <Switch
                checked={appSettings.showSpeedOnMain}
                onChange={(checked) => onSettingsChange({ showSpeedOnMain: checked })}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <label className="text-sm font-semibold text-gray-700">Highlight Following</label>
                <p className="text-xs text-gray-500 mt-1">Highlight text as it's being read</p>
              </div>
              <Switch
                checked={appSettings.highlightFollowing}
                onChange={(checked) => onSettingsChange({ highlightFollowing: checked })}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <label className="text-sm font-semibold text-gray-700">Floating Button Behavior</label>
                <p className="text-xs text-gray-500 mt-1">Control when the floating button appears</p>
              </div>
              <select
                value={appSettings.floatingButtonBehavior}
                onChange={(e) => onSettingsChange({ floatingButtonBehavior: e.target.value as 'always' | 'never' })}
                className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="always">Always show</option>
                <option value="never">Don't show</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reading Statistics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Reading Statistics</h3>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatReadingTime(readingStats.todayReadingTime + (readingStats.currentSessionStart ? getCurrentSessionDuration() : 0))}
                </div>
                <div className="text-sm text-gray-600 font-medium">Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{readingStats.totalDocumentsRead}</div>
                <div className="text-sm text-gray-600 font-medium">Documents</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p>Kenkan v2.6.1</p>
            <p className="mt-1">Made with ❤️ for better reading</p>
          </div>
        </div>
      </div>
    </div>
  );
}