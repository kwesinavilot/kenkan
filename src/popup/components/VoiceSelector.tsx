import { ChevronDown, Star } from 'lucide-react';

interface Voice {
  name: string;
  desc: string;
  accent: string;
  lang: string;
  premium: boolean;
}

interface VoiceSelectorProps {
  voices: Voice[];
  currentVoice: Voice;
  showVoiceSelector: boolean;
  onToggleSelector: () => void;
  onVoiceChange: (voiceName: string) => void;
}

export function VoiceSelector({ 
  voices, 
  currentVoice, 
  showVoiceSelector, 
  onToggleSelector, 
  onVoiceChange 
}: VoiceSelectorProps) {
  return (
    <div className="px-6 py-4 border-b border-gray-100 relative">
      <button
        onClick={onToggleSelector}
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
              onClick={() => onVoiceChange(voice.name)}
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
  );
}