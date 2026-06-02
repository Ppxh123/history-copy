import React from 'react';

interface Props {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<Props> = ({ visible, onConfirm, onCancel }) => {
  if (!visible) return null;

  return (
    <>
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/20 z-30" onClick={onCancel} />

      {/* 弹窗 */}
      <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
        <div
          className="bg-white rounded-xl shadow-lg p-6 w-64 text-center
                     animate-fade-in pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* 图标 */}
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          {/* 标题 */}
          <h3 className="text-sm font-medium text-text-main mb-1">确认删除</h3>

          {/* 描述 */}
          <p className="text-xs text-text-secondary mb-4">删除后无法恢复</p>

          {/* 按钮 */}
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 h-8 text-xs rounded-md border border-card-border
                         text-text-main hover:bg-card-hover transition-colors"
            >
              取消
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 h-8 text-xs rounded-md bg-red-500 text-white
                         hover:bg-red-600 transition-colors"
            >
              确认删除
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialog;
