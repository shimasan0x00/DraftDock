import { app, ipcMain, clipboard, BrowserWindow, Notification } from 'electron';
import { createMainWindow, showMainWindow, hideMainWindow, getMainWindow, destroyMainWindow, createSettingsWindow, closeSettingsWindow, flushPendingSave } from './window';
import { createTray, destroyTray } from './tray';
import { registerToggleHotkey, registerCopyHotkey, registerClearHotkey, unregisterAllHotkeys, updateHotkeys } from './hotkey';
import { store } from './store';
import { createApplicationMenu } from './menu';
import { validateDraftContent, validateCopyText, validateHotkeySettings } from './validators';
import { IPC_CHANNELS } from '../shared/ipc-channels';

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
      sendToMainWindow(IPC_CHANNELS.COPY_REQUESTED);
    });
    registerClearHotkey(() => {
      sendToMainWindow(IPC_CHANNELS.CLEAR_REQUESTED);
    });

    setupIpcHandlers();
    checkSaveFailedFlag();
  });

  app.on('window-all-closed', () => {
    // トレイ常駐のため、アプリを終了しない
  });

  app.on('before-quit', () => {
    flushPendingSave();
    unregisterAllHotkeys();
    destroyTray();
    destroyMainWindow();
  });

  app.on('activate', () => {
    showMainWindow();
  });
}

function checkSaveFailedFlag(): void {
  try {
    if (store.getSaveFailedFlag()) {
      new Notification({
        title: 'DraftDock',
        body: '前回の下書き保存に失敗しました。内容が失われている可能性があります。',
      }).show();
      store.clearSaveFailedFlag();
    }
  } catch (error) {
    console.error('Failed to check save-failed flag:', error);
  }
}

function setFailedFlagSafely(): void {
  try {
    store.setSaveFailedFlag(true);
  } catch (flagError) {
    console.error('Failed to set save-failed flag:', flagError);
  }
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOSPC' || code === 'EACCES' || code === 'EPERM' || code === 'EROFS') {
      return false;
    }
  }
  return true;
}

function setupIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.GET_DRAFT, () => {
    try {
      return store.getDraft();
    } catch (error) {
      console.error('Failed to get draft:', error);
      return { content: '', updatedAt: new Date().toISOString() };
    }
  });

  ipcMain.handle(IPC_CHANNELS.SAVE_DRAFT, (_event, content: unknown) => {
    if (!validateDraftContent(content)) return false;
    try {
      store.setDraft(content);
      return true;
    } catch (firstError) {
      console.error('Failed to save draft (attempt 1):', firstError);
      if (!isRetryableError(firstError)) {
        setFailedFlagSafely();
        return false;
      }
    }
    try {
      store.setDraft(content);
      return true;
    } catch (retryError) {
      console.error('Failed to save draft (attempt 2, final):', retryError);
      setFailedFlagSafely();
      return false;
    }
  });

  ipcMain.handle(IPC_CHANNELS.CLEAR_DRAFT, () => {
    try {
      store.clearDraft();
      return true;
    } catch (error) {
      console.error('Failed to clear draft:', error);
      return false;
    }
  });

  ipcMain.handle(IPC_CHANNELS.COPY_TO_CLIPBOARD, (_event, text: unknown) => {
    if (!validateCopyText(text)) return false;
    try {
      clipboard.writeText(text);
      hideMainWindow();
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  });

  ipcMain.handle(IPC_CHANNELS.HIDE_WINDOW, () => {
    hideMainWindow();
    return true;
  });

  ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, () => {
    return store.getSettings();
  });

  ipcMain.handle(IPC_CHANNELS.SAVE_SETTINGS, (_event, settings: unknown) => {
    if (!validateHotkeySettings(settings)) {
      return { toggle: false, copy: false, clear: false };
    }

    const { toggle, copy, clear } = settings;

    try {
      const oldSettings = store.getSettings();

      store.setSettings({
        hotkeys: { toggle, copy, clear },
      });

      const result = updateHotkeys(
        () => {
          sendToMainWindow(IPC_CHANNELS.COPY_REQUESTED);
        },
        () => {
          sendToMainWindow(IPC_CHANNELS.CLEAR_REQUESTED);
        }
      );

      const hasFailure = !result.toggle || !result.copy || !result.clear;
      if (hasFailure) {
        store.setSettings({
          hotkeys: {
            toggle: result.toggle ? toggle : oldSettings.hotkeys.toggle,
            copy: result.copy ? copy : oldSettings.hotkeys.copy,
            clear: result.clear ? clear : oldSettings.hotkeys.clear,
          },
        });
      }

      createApplicationMenu();
      closeSettingsWindow();
      return result;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return { toggle: false, copy: false, clear: false };
    }
  });

  ipcMain.handle(IPC_CHANNELS.CLOSE_SETTINGS, () => {
    closeSettingsWindow();
    return true;
  });

  ipcMain.handle(IPC_CHANNELS.OPEN_SETTINGS, () => {
    createSettingsWindow();
    return true;
  });
}
