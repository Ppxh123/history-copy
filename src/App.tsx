import React, { useState } from 'react';
import TitleBar from './components/TitleBar';
import SearchBar from './components/SearchBar';
import HistoryList from './components/HistoryList';
import SettingsPanel from './components/SettingsPanel';
import ConfirmDialog from './components/ConfirmDialog';
import { useHistory } from './hooks/useHistory';

const App: React.FC = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    items,
    search,
    setSearch,
    loading,
    handleDelete,
    confirmDelete,
    cancelDelete,
    handleTogglePin,
    handleCopy,
    copiedId,
    pendingDeleteId,
  } = useHistory();

  return (
    <div className="relative flex flex-col h-screen bg-app-bg rounded-xl overflow-hidden border border-card-border">
      <TitleBar onSettingsClick={() => setSettingsOpen(true)} />
      <SearchBar value={search} onChange={setSearch} />
      <HistoryList
        items={items}
        loading={loading}
        search={search}
        copiedId={copiedId}
        onCopy={handleCopy}
        onDelete={handleDelete}
        onTogglePin={handleTogglePin}
      />

      {/* Settings panel overlay */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        visible={pendingDeleteId !== null}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default App;
