import { BrowserWindow, ipcMain, Menu, screen } from 'electron';
import path from 'path';

let floatingBall: BrowserWindow | null = null;
let dragOffsetX = 28; // 默认偏移：窗口中心
let dragOffsetY = 28;

export function createFloatingBall(mainWin: BrowserWindow): BrowserWindow {
  if (floatingBall) return floatingBall;

  const size = 56;
  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;

  const isDev = !require('electron').app.isPackaged;

  floatingBall = new BrowserWindow({
    width: size,
    height: size,
    x: screenW - size - 20,
    y: Math.floor(screenH / 2),
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, 'floating-ball-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const htmlPath = isDev
    ? path.join(__dirname, '..', 'electron', 'floating-ball.html')
    : path.join(__dirname, 'floating-ball.html');
  floatingBall.loadFile(htmlPath);

  // IPC: 记录拖拽起始偏移
  ipcMain.on('floating-ball:drag-start', (_event, screenX: number, screenY: number) => {
    if (!floatingBall) return;
    const [winX, winY] = floatingBall.getPosition();
    dragOffsetX = screenX - winX;
    dragOffsetY = screenY - winY;
  });

  // IPC: 拖拽悬浮球（绝对坐标，避免增量累积误差）
  ipcMain.on('floating-ball:drag', (_event, screenX: number, screenY: number) => {
    if (!floatingBall) return;
    floatingBall.setPosition(screenX - dragOffsetX, screenY - dragOffsetY);
  });

  // IPC: ball clicked → toggle main panel
  ipcMain.on('floating-ball:click', () => {
    if (mainWin.getPosition()[0] > -10000) {
      mainWin.setPosition(-30000, -30000);
    } else {
      showMainWindow(mainWin);
    }
  });

  // 右键菜单
  floatingBall.webContents.on('context-menu', () => {
    const menu = Menu.buildFromTemplate([
      {
        label: '显示/隐藏面板',
        click: () => {
          if (mainWin.getPosition()[0] > -10000) {
            mainWin.setPosition(-30000, -30000);
          } else {
            showMainWindow(mainWin);
          }
        },
      },
      { type: 'separator' },
      {
        label: '关闭悬浮球',
        click: () => {
          destroyFloatingBall();
        },
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => {
          mainWin.destroy();
          process.exit(0);
        },
      },
    ]);
    menu.popup();
  });

  return floatingBall;
}

function showMainWindow(win: BrowserWindow): void {
  const cursorPoint = screen.getCursorScreenPoint();
  const currentDisplay = screen.getDisplayNearestPoint(cursorPoint);
  const { x: screenX, y: screenY, width: screenW, height: screenH } = currentDisplay.workArea;

  const winBounds = win.getBounds();
  const x = screenX + screenW - winBounds.width - 10;
  const y = screenY + screenH - winBounds.height - 10;

  win.setPosition(x, y);
  win.focus();
}

export function destroyFloatingBall(): void {
  if (floatingBall) {
    ipcMain.removeAllListeners('floating-ball:click');
    ipcMain.removeAllListeners('floating-ball:drag-start');
    ipcMain.removeAllListeners('floating-ball:drag');
    floatingBall.destroy();
    floatingBall = null;
  }
}

export function getFloatingBall(): BrowserWindow | null {
  return floatingBall;
}
