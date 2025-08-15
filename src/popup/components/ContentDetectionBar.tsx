interface ContentInfo {
  detected: boolean;
  type: string;
  pageTitle: string;
}

interface ContentDetectionBarProps {
  contentInfo: ContentInfo;
  truncateTitle: (title: string, maxLength?: number) => string;
}

export function ContentDetectionBar({ contentInfo, truncateTitle }: ContentDetectionBarProps) {
  if (!contentInfo.detected) return null;

  return (
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
  );
}