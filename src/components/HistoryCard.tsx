import React from 'react';
import type { ClipboardItem } from '../types';

interface Props {
  item: ClipboardItem;
  copied: boolean;
  onCopy: (id: number) => void;
  onDelete: (id: number) => void;
  onTogglePin: (id: number) => void;
}

const HistoryCard: React.FC<Props> = ({ item, copied, onCopy, onDelete, onTogglePin }) => {
  const timeStr = formatTime(item.created_at);

  return (
    <div
      className="group flex items-start gap-3 p-3 mx-3 mb-2 bg-white border border-card-border
                 rounded-lg cursor-pointer hover:bg-card-hover transition-colors duration-150 relative overflow-hidden"
      onClick={() => onCopy(item.id)}
    >
      {/* Copied toast */}
      {copied && (
        <div className="copied-toast absolute inset-0 bg-primary/90 flex items-center justify-center gap-1.5 z-10">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <polyline points="20,6 9,17 4,12" />
          </svg>
          <span className="text-white text-sm font-medium">已复制</span>
        </div>
      )}

      {/* Type icon */}
      <div className="flex-shrink-0 w-8 h-8 mt-0.5 rounded-md bg-app-bg flex items-center justify-center">
        {item.type === 'image' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B9BD5" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21,15 16,10 5,21" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B9BD5" strokeWidth="2">
            <polyline points="4,7 4,4 20,4 20,7" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {item.type === 'text' ? (
          <p className="text-sm text-text-main leading-relaxed line-clamp-2 break-all">
            {item.content || ''}
          </p>
        ) : (
          <div className="w-16 h-16 rounded overflow-hidden bg-gray-100">
            <img
              src={`file://${item.image_path}`}
              alt="clipboard"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <p className="text-xs text-text-secondary mt-1">{timeStr}</p>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={e => { e.stopPropagation(); onTogglePin(item.id); }}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-app-bg"
          title={item.pinned ? '取消置顶' : '置顶'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24"
               fill={item.pinned ? '#E67E22' : 'none'}
               stroke={item.pinned ? '#E67E22' : '#95A5A6'}
               strokeWidth="2">
            <line x1="12" y1="17" x2="12" y2="22" />
            <path d="M5 17h14l-1.4-4.2V9a5.6 5.6 0 0 0-11.2 0v3.8L5 17z" />
          </svg>
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDelete(item.id); }}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50"
          title="删除"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" strokeWidth="2">
            <polyline points="3,6 5,6 21,6" />
            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

function formatTime(dateStr: string): string {
  const date = new Date(dateStr.replace(' ', 'T'));
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;

  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}-${day}`;
}

export default HistoryCard;
