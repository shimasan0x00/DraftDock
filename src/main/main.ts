import { app, ipcMain, clipboard, BrowserWindow } from 'electron';
import { createMainWindow, showMainWindow, hideMainWindow, getMainWindow, destroyMainWindow, createSettingsWindow, closeSettingsWindow } from './window';
import { createTray, destroyTray } from './tray';
import { registerToggleHotkey, registerCopyHotkey, registerClearHotkey, unregisterAllHotkeys, updateHotkeys } from './hotkey';
import { store } from './store';
import { createApplicationMenu } from './menu';

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
    createApplicationMenu();

    registerToggleHotkey();
    registerCopyHotkey(() => {
      const mainWindow = getMainWindow();
      if (mainWindow) {
        mainWindow.webContents.send('copy-requested');
      }
    });
    registerClearHotkey(() => {
      const mainWindow = getMainWindow();
      if (mainWindow) {
        mainWindow.webContents.send('clear-requested');
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

  ipcMain.handle('save-draft', (_event, content: unknown) => {
    if (typeof content !== 'string') return false;
    if (content.length > 1_000_000) return false;
    store.setDraft(content);
    return true;
  });

  ipcMain.handle('clear-draft', () => {
    store.clearDraft();
    return true;
  });

  ipcMain.handle('copy-to-clipboard', (_event, text: unknown) => {
    if (typeof text !== 'string') return false;
    if (text.length === 0 || text.length > 1_000_000) return false;
    clipboard.writeText(text);
    hideMainWindow();
    return true;
  });

  ipcMain.handle('hide-window', () => {
    hideMainWindow();
    return true;
  });

  ipcMain.handle('get-settings', () => {
    return store.getSettings();
  });

  ipcMain.handle('save-settings', (_event, settings: unknown) => {
    if (
      typeof settings !== 'object' || settings === null ||
      typeof (settings as any).toggle !== 'string' ||
      typeof (settings as any).copy !== 'string' ||
      typeof (settings as any).clear !== 'string'
    ) {
      return { toggle: false, copy: false, clear: false };
    }

    const { toggle, copy, clear } = settings as { toggle: string; copy: string; clear: string };

    if (toggle.length > 50 || copy.length > 50 || clear.length > 50) {
      return { toggle: false, copy: false, clear: false };
    }

    if (toggle.length === 0 || copy.length === 0 || clear.length === 0) {
      return { toggle: false, copy: false, clear: false };
    }

    store.setSettings({
      hotkeys: { toggle, copy, clear },
    });

    const result = updateHotkeys(
      () => {
        const mainWindow = getMainWindow();
        if (mainWindow) {
          mainWindow.webContents.send('copy-requested');
        }
      },
      () => {
        const mainWindow = getMainWindow();
        if (mainWindow) {
          mainWindow.webContents.send('clear-requested');
        }
      }
    );

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
