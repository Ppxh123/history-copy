import React from 'react';
import type { ClipboardItem } from '../types';
import HistoryCard from './HistoryCard';

interface Props {
  items: ClipboardItem[];
  loading: boolean;
  search: string;
  copiedId: number | null;
  onCopy: (id: number) => void;
  onDelete: (id: number) => void;
  onTogglePin: (id: number) => void;
}

const HistoryList: React.FC<Props> = ({ items, loading, search, copiedId, onCopy, onDelete, onTogglePin }) => {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-text-secondary">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-40">
          <rect x="6" y="4" width="12" height="16" rx="2" />
          <line x1="10" y1="9" x2="16" y2="9" />
          <line x1="10" y1="13" x2="16" y2="13" />
          <line x1="10" y1="17" x2="12" y2="17" />
        </svg>
        <p className="text-sm">{search ? '无匹配结果' : '暂无历史记录'}</p>
        <p className="text-xs mt-1 opacity-60">{search ? '换个关键词试试' : '复制内容后自动出现在这里'}</p>
      </div>
    );
  }

  const pinnedItems = items.filter(i => i.pinned);
  const normalItems = items.filter(i => !i.pinned);

  return (
    <div className="flex-1 overflow-y-auto py-1">
      {pinnedItems.map(item => (
        <HistoryCard
          key={item.id}
          item={item}
          copied={item.id === copiedId}
          onCopy={onCopy}
          onDelete={onDelete}
          onTogglePin={onTogglePin}
        />
      ))}
      {pinnedItems.length > 0 && normalItems.length > 0 && (
        <div className="mx-3 my-2 border-t border-card-border" />
      )}
      {normalItems.map(item => (
        <HistoryCard
          key={item.id}
          item={item}
          copied={item.id === copiedId}
          onCopy={onCopy}
          onDelete={onDelete}
          onTogglePin={onTogglePin}
        />
      ))}
    </div>
  );
};

export default HistoryList;
