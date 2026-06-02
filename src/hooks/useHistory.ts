import { useState, useEffect, useCallback } from 'react';
import type { ClipboardItem } from '../types';

const PAGE_SIZE = 50;

export function useHistory() {
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const loadItems = useCallback(async (s?: string) => {
    if (!window.clipboardApi) return;
    setLoading(true);
    try {
      const data = await window.clipboardApi.getItems(PAGE_SIZE, 0, s || undefined);
      setItems(data);
    } catch (e) {
      console.error('Failed to load items:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    setPendingDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (pendingDeleteId === null || !window.clipboardApi) return;
    await window.clipboardApi.deleteItem(pendingDeleteId);
    setItems(prev => prev.filter(item => item.id !== pendingDeleteId));
    setPendingDeleteId(null);
  }, [pendingDeleteId]);

  const cancelDelete = useCallback(() => {
    setPendingDeleteId(null);
  }, []);

  const handleTogglePin = useCallback(async (id: number) => {
    if (!window.clipboardApi) return;
    const newPinned = await window.clipboardApi.togglePinItem(id);
    setItems(prev =>
      prev
        .map(item => (item.id === id ? { ...item, pinned: newPinned } : item))
        .sort((a, b) => {
          if (a.pinned !== b.pinned) return b.pinned - a.pinned;
          return b.created_at.localeCompare(a.created_at);
        })
    );
  }, []);

  const handleCopy = useCallback(async (id: number) => {
    if (!window.clipboardApi) return;
    await window.clipboardApi.copyItem(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  useEffect(() => {
    loadItems(search);
  }, [search, loadItems]);

  // Listen for new clipboard items
  useEffect(() => {
    if (!window.clipboardApi) return;
    const unsubscribe = window.clipboardApi.onNewItem(() => {
      loadItems(search);
    });
    return unsubscribe;
  }, [search, loadItems]);

  return {
    items,
    search,
    setSearch,
    loading,
    handleDelete,
    confirmDelete,
    cancelDelete,
    handleTogglePin,
    handleCopy,
    loadItems,
    copiedId,
    pendingDeleteId,
  };
}
