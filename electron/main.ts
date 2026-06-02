import { app, BrowserWindow } from 'electron';
import path from 'path';
import { initDatabase, runCleanup, closeDatabase } from './database';
import { startClipboardMonitor, stopClipboardMonitor } from './clipboard-monitor';
import { registerIpcHandlers } from './ipc-handlers';
import { createTray, destroyTray } from './tray';
import { createFloatingBall, destroyFloatingBall } from './floating-ball';
import { setAutoStart } from './auto-start';
import { getSetting } from './database';

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 420,
    height: 600,
    x: -30000,
    y: -30000,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // 点击关闭 → 移到屏幕外（不真正关闭）
  win.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      win.setPosition(-30000, -30000);
    }
  });

  // 点击窗口外部 → 移到屏幕外（不隐藏，避免闪烁）
  win.on('blur', () => {
    win.setPosition(-30000, -30000);
  });

  return win;
}

app.whenReady().then(async () => {
  await initDatabase();
  registerIpcHandlers();
  runCleanup();

  // Apply auto-start setting
  const autoStart = getSetting('auto_start');
  setAutoStart(autoStart === '1');

  startClipboardMonitor();

  mainWindow = createWindow();
  createTray(mainWindow);
  createFloatingBall(mainWindow);
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  stopClipboardMonitor();
  destroyTray();
  destroyFloatingBall();
  closeDatabase();
});
