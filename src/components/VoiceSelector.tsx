import React, { useState, useEffect } from 'react';
import { KENKAN_VOICES, type KenkanVoiceName } from '../types/voices';

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voiceURI: string) => void;
  className?: string;
}

interface VoiceData {
  systemVoices: any[];
  customVoices: string[];
  engineStatus?: any;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onVoiceChange,
  className = ''
}) => {
  const [voiceData, setVoiceData] = useState<VoiceData>({ systemVoices: [], customVoices: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getVoices' });
      if (response.success) {
        setVoiceData(response.data);
      }
    } catch (error) {
      console.error('Error loading voices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onVoiceChange(event.target.value);
  };

  const testVoice = async (voiceName: string) => {
    try {
      await chrome.runtime.sendMessage({
        action: 'startReading',
        data: {
          text: `Hello, this is ${voiceName}. ${KENKAN_VOICES[voiceName as KenkanVoiceName]?.description.split('.')[0]}.`,
          voiceURI: voiceName
        }
      });
    } catch (error) {
      console.error('Error testing voice:', error);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading voices...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label htmlFor="voice-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Voice
        </label>
        <select
          id="voice-select"
          value={selectedVoice}
          onChange={handleVoiceChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Default System Voice</option>
          
          {/* Custom Kenkan Voices */}
          {voiceData.customVoices.length > 0 && (
            <optgroup label="🎧 Kenkan AI Voices">
              {voiceData.customVoices.map((voiceName) => {
                const profile = KENKAN_VOICES[voiceName as KenkanVoiceName];
                return (
                  <option key={voiceName} value={voiceName}>
                    {voiceName} - {profile?.characteristics.tone} ({profile?.language})
                  </option>
                );
              })}
            </optgroup>
          )}
          
          {/* System Voices */}
          {voiceData.systemVoices.length > 0 && (
            <optgroup label="🔊 System Voices">
              {voiceData.systemVoices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {/* Voice Preview Cards */}
      {voiceData.customVoices.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">🎧 Kenkan AI Voices</h3>
          <div className="grid gap-3">
            {voiceData.customVoices.map((voiceName) => {
              const profile = KENKAN_VOICES[voiceName as KenkanVoiceName];
              const isSelected = selectedVoice === voiceName;
              
              return (
                <div
                  key={voiceName}
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => onVoiceChange(voiceName)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{voiceName}</h4>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {profile?.language}
                        </span>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          {profile?.characteristics.gender}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {profile?.characteristics.tone} • {profile?.characteristics.age}
                      </p>
                      
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {profile?.description.split('.')[0]}.
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {profile?.characteristics.specialties.slice(0, 3).map((specialty) => (
                          <span
                            key={specialty}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        testVoice(voiceName);
                      }}
                      className="ml-3 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Test
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Engine Status */}
      {voiceData.engineStatus && (
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              voiceData.engineStatus.isInitialized ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span>
              TTS Engine: {voiceData.engineStatus.isInitialized ? 'Ready' : 'Not Ready'}
            </span>
          </div>
          {voiceData.engineStatus.currentVoice && (
            <div className="mt-1">
              Current: {voiceData.engineStatus.currentVoice}
            </div>
          )}
        </div>
      )}
    </div>
  );
};