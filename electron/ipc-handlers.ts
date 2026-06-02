import { ipcMain, clipboard, BrowserWindow } from 'electron';
import { getItems, getItemById, getItemCount, deleteItem, togglePinItem, getSetting, setSetting } from './database';
import { setAutoStart } from './auto-start';

export function registerIpcHandlers(): void {
  ipcMain.handle('clipboard:get-items', (_event, limit: number = 50, offset: number = 0, search?: string) => {
    return getItems(limit, offset, search);
  });

  ipcMain.handle('clipboard:get-count', (_event, search?: string) => {
    return getItemCount(search);
  });

  ipcMain.handle('clipboard:delete-item', (_event, id: number) => {
    deleteItem(id);
  });

  ipcMain.handle('clipboard:toggle-pin', (_event, id: number) => {
    return togglePinItem(id);
  });

  ipcMain.handle('clipboard:copy-item', (_event, id: number) => {
    const item = getItemById(id);
    if (!item) return;

    if (item.type === 'text' && item.content) {
      clipboard.writeText(item.content);
    } else if (item.type === 'image' && item.image_path) {
      const { nativeImage } = require('electron');
      const img = nativeImage.createFromPath(item.image_path);
      clipboard.writeImage(img);
    }
  });

  ipcMain.handle('settings:get', (_event, key: string) => {
    return getSetting(key);
  });

  ipcMain.handle('settings:set', (_event, key: string, value: string) => {
    setSetting(key, value);
    if (key === 'auto_start') {
      setAutoStart(value === '1');
    }
  });
}

export function notifyNewItem(): void {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send('clipboard:new-item');
  }
}
