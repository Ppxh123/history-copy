import React from 'react';

interface Props {
  onSettingsClick: () => void;
}

const TitleBar: React.FC<Props> = ({ onSettingsClick }) => {
  return (
    <div className="flex items-center justify-between h-10 px-3 bg-white border-b border-card-border rounded-t-xl"
         style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <rect x="6" y="4" width="12" height="16" rx="2" />
            <line x1="10" y1="9" x2="16" y2="9" />
            <line x1="10" y1="13" x2="16" y2="13" />
            <line x1="10" y1="17" x2="12" y2="17" />
          </svg>
        </div>
        <span className="text-sm font-medium text-text-main">历史粘贴板</span>
      </div>

      <button
        onClick={onSettingsClick}
        className="w-6 h-6 flex items-center justify-center rounded hover:bg-app-bg transition-colors"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        title="设置"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7F8C8D" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </div>
  );
};

export default TitleBar;
