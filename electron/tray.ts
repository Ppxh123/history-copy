import { Tray, Menu, nativeImage, BrowserWindow } from 'electron';
import path from 'path';
import { createFloatingBall, destroyFloatingBall, getFloatingBall } from './floating-ball';

let tray: Tray | null = null;

function createTrayIcon(): Electron.NativeImage {
  // Generate a simple 16x16 blue clipboard icon as PNG
  const size = 16;
  const buf = createPngIcon(size);
  return nativeImage.createFromBuffer(buf, { scaleFactor: 1 });
}

function createPngIcon(size: number): Buffer {
  // Create a simple clipboard icon: blue rounded rectangle with lines
  const canvas = Buffer.alloc(size * size * 4); // RGBA

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;

      // Draw rounded rectangle body
      const left = 3, right = size - 1, top = 2, bottom = size - 4;
      const inRect = x >= left && x <= right && y >= top && y <= bottom;

      // Draw clip lines
      const line1Y = 6;
      const line2Y = 9;
      const line3Y = 12;
      const inLine = (y === line1Y || y === line2Y || y === line3Y) && x >= 5 && x <= size - 5;

      if (inLine) {
        // White lines
        canvas[i] = 255;     // R
        canvas[i + 1] = 255; // G
        canvas[i + 2] = 255; // B
        canvas[i + 3] = 255; // A
      } else if (inRect) {
        // Blue
        canvas[i] = 91;      // R
        canvas[i + 1] = 155; // G
        canvas[i + 2] = 213; // B
        canvas[i + 3] = 255; // A
      } else {
        // Transparent
        canvas[i] = 0;
        canvas[i + 1] = 0;
        canvas[i + 2] = 0;
        canvas[i + 3] = 0;
      }
    }
  }

  // Wrap in minimal PNG
  return wrapPng(size, size, canvas);
}

function wrapPng(width: number, height: number, rgba: Buffer): Buffer {
  // Build minimal PNG with zlib compression
  const zlib = require('zlib');

  // Filter byte per row (0 = None)
  const rawData: number[] = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter none
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      rawData.push(rgba[i], rgba[i + 1], rgba[i + 2], rgba[i + 3]);
    }
  }

  const deflated = zlib.deflateSync(Buffer.from(rawData));

  // Build PNG
  const chunks: Buffer[] = [];

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  chunks.push(createPngChunk('IHDR', ihdr));

  // IDAT
  chunks.push(createPngChunk('IDAT', deflated));

  // IEND
  chunks.push(createPngChunk('IEND', Buffer.alloc(0)));

  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([signature, ...chunks]);
}

function createPngChunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);

  const crc = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(buf: Buffer): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

export function createTray(win: BrowserWindow): Tray {
  if (tray) return tray;

  const icon = createTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip('历史粘贴板');

  // 动态构建托盘菜单（实时检查悬浮球状态）
  tray.on('right-click', () => {
    const ballExists = getFloatingBall() !== null;
    const menu = Menu.buildFromTemplate([
      {
        label: '显示/隐藏窗口',
        click: () => {
          if (win.getPosition()[0] > -10000) {
            win.setPosition(-30000, -30000);
          } else {
            showWindow(win);
          }
        },
      },
      { type: 'separator' },
      {
        label: ballExists ? '隐藏悬浮球' : '显示悬浮球',
        click: () => {
          if (getFloatingBall()) {
            destroyFloatingBall();
          } else {
            createFloatingBall(win);
          }
        },
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => {
          win.destroy();
          process.exit(0);
        },
      },
    ]);
    tray!.popUpContextMenu(menu);
  });

  tray.on('click', () => {
    if (win.getPosition()[0] > -10000) {
      win.setPosition(-30000, -30000);
    } else {
      showWindow(win);
    }
  });

  return tray;
}

function showWindow(win: BrowserWindow): void {
  const { screen } = require('electron');
  const cursorPoint = screen.getCursorScreenPoint();
  const currentDisplay = screen.getDisplayNearestPoint(cursorPoint);
  const { x: screenX, y: screenY, width: screenW, height: screenH } = currentDisplay.workArea;

  const winBounds = win.getBounds();
  const x = screenX + screenW - winBounds.width - 10;
  const y = screenY + screenH - winBounds.height - 10;

  win.setPosition(x, y);
  win.focus();
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}
