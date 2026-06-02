import React, { useState, useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const RETENTION_OPTIONS = [
  { label: '1 天', value: '1' },
  { label: '3 天', value: '3' },
  { label: '永久', value: '0' },
];

const SettingsPanel: React.FC<Props> = ({ isOpen, onClose }) => {
  const [retentionDays, setRetentionDays] = useState('3');
  const [customDays, setCustomDays] = useState('');
  const [autoStart, setAutoStart] = useState(false);

  useEffect(() => {
    if (isOpen && window.clipboardApi) {
      window.clipboardApi.getSetting('retention_days').then(v => {
        if (v) {
          setRetentionDays(v);
          // 如果当前值不是预设值之一，显示在自定义输入框
          if (!RETENTION_OPTIONS.some(o => o.value === v)) {
            setCustomDays(v);
          }
        }
      });
      window.clipboardApi.getSetting('auto_start').then(v => {
        setAutoStart(v === '1');
      });
    }
  }, [isOpen]);

  const isPreset = RETENTION_OPTIONS.some(o => o.value === retentionDays);

  const handleRetentionChange = async (value: string) => {
    setRetentionDays(value);
    setCustomDays('');
    await window.clipboardApi?.setSetting('retention_days', value);
  };

  const handleCustomDaysChange = async (value: string) => {
    // 只允许正整数
    const num = parseInt(value, 10);
    if (value === '') {
      setCustomDays('');
      return;
    }
    if (isNaN(num) || num < 1) return;
    const str = String(num);
    setCustomDays(str);
    setRetentionDays(str);
    await window.clipboardApi?.setSetting('retention_days', str);
  };

  const handleAutoStartChange = async (enabled: boolean) => {
    setAutoStart(enabled);
    await window.clipboardApi?.setSetting('auto_start', enabled ? '1' : '0');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 z-10 rounded-xl" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-lg z-20 rounded-r-xl
                      flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-card-border">
          <h2 className="text-sm font-medium text-text-main">设置</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-main">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-4 space-y-6">
          {/* Retention days */}
          <div>
            <label className="block text-xs font-medium text-text-main mb-2">保留天数</label>
            <div className="flex gap-1 mb-2">
              {RETENTION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleRetentionChange(opt.value)}
                  className={`flex-1 h-8 text-xs rounded-md border transition-colors
                    ${retentionDays === opt.value
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-text-main border-card-border hover:bg-card-hover'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-secondary">自定义:</span>
              <input
                type="text"
                inputMode="numeric"
                value={isPreset ? '' : customDays}
                placeholder="天数"
                onChange={e => handleCustomDaysChange(e.target.value)}
                className="w-14 h-7 text-xs text-center rounded-md border border-card-border
                           focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
              <span className="text-xs text-text-secondary">天</span>
            </div>
          </div>

          {/* Auto start */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-text-main">开机自启</label>
            <button
              onClick={() => handleAutoStartChange(!autoStart)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200
                ${autoStart ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                  ${autoStart ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>

          {/* Info */}
          <div className="pt-2 border-t border-card-border">
            <p className="text-xs text-text-secondary leading-relaxed">
              记录上限 1314 条<br />
              过期记录自动清理<br />
              置顶记录不会被清理
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;
