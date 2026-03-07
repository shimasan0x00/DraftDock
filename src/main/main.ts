import { app, ipcMain, clipboard, BrowserWindow } from 'electron';
import { createMainWindow, showMainWindow, hideMainWindow, getMainWindow, destroyMainWindow, createSettingsWindow, closeSettingsWindow } from './window';
import { createTray, destroyTray } from './tray';
import { registerToggleHotkey, registerCopyHotkey, registerClearHotkey, unregisterAllHotkeys, updateHotkeys } from './hotkey';
import { store } from './store';
import { createApplicationMenu } from './menu';
import { validateDraftContent, validateCopyText, validateHotkeySettings } from './validators';

function sendToMainWindow(channel: string): void {
  const mainWindow = getMainWindow();
  if (mainWindow) {
    mainWindow.webContents.send(channel);
  }
}

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
      sendToMainWindow('copy-requested');
    });
    registerClearHotkey(() => {
      sendToMainWindow('clear-requested');
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
    if (!validateDraftContent(content)) return false;
    store.setDraft(content);
    return true;
  });

  ipcMain.handle('clear-draft', () => {
    store.clearDraft();
    return true;
  });

  ipcMain.handle('copy-to-clipboard', (_event, text: unknown) => {
    if (!validateCopyText(text)) return false;
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
    if (!validateHotkeySettings(settings)) {
      return { toggle: false, copy: false, clear: false };
    }

    const { toggle, copy, clear } = settings;

    store.setSettings({
      hotkeys: { toggle, copy, clear },
    });

    const result = updateHotkeys(
      () => {
        sendToMainWindow('copy-requested');
      },
      () => {
        sendToMainWindow('clear-requested');
      }
    );

    createApplicationMenu();
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
