import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('floatingBallAPI', {
  onClick: () => ipcRenderer.send('floating-ball:click'),
  onDragStart: (screenX: number, screenY: number) =>
    ipcRenderer.send('floating-ball:drag-start', screenX, screenY),
  onDrag: (screenX: number, screenY: number) =>
    ipcRenderer.send('floating-ball:drag', screenX, screenY),
});
