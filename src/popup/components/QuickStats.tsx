import { Clock, FileText } from 'lucide-react';
import { formatReadingTime, getCurrentSessionDuration, type ReadingStats } from '../../utils/statsStorage';

interface QuickStatsProps {
  readingStats: ReadingStats;
}

export function QuickStats({ readingStats }: QuickStatsProps) {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-5">
      <div className="grid grid-cols-2 gap-6 text-center">
        <div className="space-y-1">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500">Today</span>
          </div>
          <div className="items-center justify-center space-y-2">
            <span className="font-bold text-lg text-gray-900">
              {formatReadingTime(readingStats.todayReadingTime + (readingStats.currentSessionStart ? getCurrentSessionDuration() : 0))}
            </span>
            <div className="text-xs text-gray-600 font-medium">Reading time</div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <FileText className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <div className="items-center justify-center space-y-2">
            <span className="font-bold text-lg text-gray-900">
              {readingStats.totalDocumentsRead.toLocaleString()}
            </span>
            <div className="text-xs text-gray-600 font-medium">Documents read</div>
          </div>
        </div>
      </div>
    </div>
  );
}