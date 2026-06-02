import { clipboard } from 'electron';
import { addTextItem, addImageItem, runCleanup } from './database';
import { notifyNewItem } from './ipc-handlers';

let lastTextHash: string | null = null;
let lastImageHash: string | null = null;
let intervalId: ReturnType<typeof setInterval> | null = null;

const POLL_INTERVAL = 500; // ms

function checkClipboard(): void {
  // Check image first (screenshots, copied images)
  const img = clipboard.readImage();
  if (!img.isEmpty()) {
    const pngBuffer = img.toPNG();
    // Only process if image data changed
    const imgHash = Buffer.from(pngBuffer.slice(0, 1024)).toString('base64');
    if (imgHash !== lastImageHash) {
      lastImageHash = imgHash;
      const id = addImageItem(Buffer.from(pngBuffer));
      if (id !== null) {
        console.log(`[Clipboard] New image saved (id=${id})`);
        runCleanup();
        notifyNewItem();
      }
      return;
    }
  }

  // Check text
  const text = clipboard.readText();
  if (text && text.length > 0) {
    if (text !== lastTextHash) {
      lastTextHash = text;
      const id = addTextItem(text);
      if (id !== null) {
        console.log(`[Clipboard] New text saved (id=${id}, len=${text.length})`);
        runCleanup();
        notifyNewItem();
      }
    }
  }
}

export function startClipboardMonitor(): void {
  if (intervalId) return;
  console.log('[Clipboard] Monitor started');
  intervalId = setInterval(checkClipboard, POLL_INTERVAL);
}

export function stopClipboardMonitor(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[Clipboard] Monitor stopped');
  }
}
