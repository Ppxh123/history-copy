import { contextBridge, ipcRenderer } from 'electron';

export interface ClipboardApi {
  getItems: (limit?: number, offset?: number, search?: string) => Promise<any[]>;
  getItemCount: (search?: string) => Promise<number>;
  deleteItem: (id: number) => Promise<void>;
  togglePinItem: (id: number) => Promise<number>;
  copyItem: (id: number) => Promise<void>;
  getSetting: (key: string) => Promise<string | null>;
  setSetting: (key: string, value: string) => Promise<void>;
  onNewItem: (callback: () => void) => () => void;
}

contextBridge.exposeInMainWorld('clipboardApi', {
  getItems: (limit?: number, offset?: number, search?: string) =>
    ipcRenderer.invoke('clipboard:get-items', limit, offset, search),
  getItemCount: (search?: string) =>
    ipcRenderer.invoke('clipboard:get-count', search),
  deleteItem: (id: number) =>
    ipcRenderer.invoke('clipboard:delete-item', id),
  togglePinItem: (id: number) =>
    ipcRenderer.invoke('clipboard:toggle-pin', id),
  copyItem: (id: number) =>
    ipcRenderer.invoke('clipboard:copy-item', id),
  getSetting: (key: string) =>
    ipcRenderer.invoke('settings:get', key),
  setSetting: (key: string, value: string) =>
    ipcRenderer.invoke('settings:set', key, value),
  onNewItem: (callback: () => void) => {
    const handler = (): void => callback();
    ipcRenderer.on('clipboard:new-item', handler);
    return () => ipcRenderer.removeListener('clipboard:new-item', handler);
  },
} satisfies ClipboardApi);
