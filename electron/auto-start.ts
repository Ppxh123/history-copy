import { app } from 'electron';

export function setAutoStart(enabled: boolean): void {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    path: process.execPath,
  });
}

export function isAutoStartEnabled(): boolean {
  const settings = app.getLoginItemSettings();
  return settings.openAtLogin;
}
