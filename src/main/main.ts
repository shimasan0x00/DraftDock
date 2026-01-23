import { app, ipcMain, clipboard, BrowserWindow } from 'electron';
import { createMainWindow, showMainWindow, hideMainWindow, getMainWindow, destroyMainWindow, createSettingsWindow, closeSettingsWindow } from './window';
import { createTray, destroyTray } from './tray';
import { registerToggleHotkey, registerCopyHotkey, unregisterAllHotkeys, updateHotkeys } from './hotkey';
import { store } from './store';

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    showMainWindow();
  });

  app.whenReady().then(() => {
    createMainWindow();
    createTray();

    registerToggleHotkey();
    registerCopyHotkey(() => {
      const mainWindow = getMainWindow();
      if (mainWindow) {
        mainWindow.webContents.send('copy-requested');
      }
    });

    setupIpcHandlers();
  });

  app.on('window-all-closed', (event: Event) => {
    event.preventDefault();
  });

  app.on('before-quit', () => {
    unregisterAllHotkeys();
    destroyTray();
    destroyMainWindow();
  });

  app.on('activate', () => {
    showMainWindow();
  });
}

function setupIpcHandlers(): void {
  ipcMain.handle('get-draft', () => {
    return store.getDraft();
  });

  ipcMain.handle('save-draft', (_event, content: string) => {
    store.setDraft(content);
    return true;
  });

  ipcMain.handle('clear-draft', () => {
    store.clearDraft();
    return true;
  });

  ipcMain.handle('copy-to-clipboard', (_event, text: string) => {
    if (text && text.length > 0) {
      clipboard.writeText(text);
      hideMainWindow();
      return true;
    }
    return false;
  });

  ipcMain.handle('hide-window', () => {
    hideMainWindow();
    return true;
  });

  ipcMain.handle('get-settings', () => {
    return store.getSettings();
  });

  ipcMain.handle('save-settings', (_event, settings: { toggle: string; copy: string }) => {
    store.setSettings({
      hotkeys: {
        toggle: settings.toggle,
        copy: settings.copy,
      },
    });

    const result = updateHotkeys(() => {
      const mainWindow = getMainWindow();
      if (mainWindow) {
        mainWindow.webContents.send('copy-requested');
      }
    });

    closeSettingsWindow();
    return result;
  });

  ipcMain.handle('close-settings', () => {
    closeSettingsWindow();
    return true;
  });

  ipcMain.handle('open-settings', () => {
    createSettingsWindow();
    return true;
  });
}
