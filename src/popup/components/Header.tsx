import { BookOpen, Settings } from 'lucide-react';

interface HeaderProps {
  onSettingsClick: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  return (
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
          onClick={onSettingsClick}
          className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
        >
          <Settings className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}