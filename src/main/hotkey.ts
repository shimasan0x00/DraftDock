import { globalShortcut, Notification } from 'electron';
import { store } from './store';
import { toggleMainWindow, getMainWindow } from './window';

type HotkeyCallback = () => void;

let currentToggleKey: string | null = null;
let currentCopyKey: string | null = null;
let currentClearKey: string | null = null;
let copyCallback: HotkeyCallback | null = null;
let clearCallback: HotkeyCallback | null = null;

function normalizeAccelerator(key: string): string {
  return key
    .split('+')
    .map((part) => part.trim())
    .map((part) => {
      const lower = part.toLowerCase();
      // Electronでは'CommandOrControl'で Ctrl/Cmd の両方に対応
      if (lower === 'ctrl' || lower === 'control') return 'CommandOrControl';
      if (lower === 'shift') return 'Shift';
      if (lower === 'alt') return 'Alt';
      if (lower === 'meta' || lower === 'cmd' || lower === 'command') return 'CommandOrControl';
      if (lower === 'enter' || lower === 'return') return 'Return';
      if (lower === 'escape' || lower === 'esc') return 'Escape';
      if (lower === 'space') return 'Space';
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join('+');
}

function showHotkeyError(key: string, action: string): void {
  new Notification({
    title: 'DraftDock - ホットキー登録エラー',
    body: `${action}キー「${key}」の登録に失敗しました。他のアプリケーションで使用されている可能性があります。`,
  }).show();
}

export function registerToggleHotkey(): boolean {
  const settings = store.getSettings();
  const key = normalizeAccelerator(settings.hotkeys.toggle);

  if (currentToggleKey) {
    globalShortcut.unregister(currentToggleKey);
    currentToggleKey = null;
  }

  try {
    const success = globalShortcut.register(key, () => {
      toggleMainWindow();
    });

    if (success) {
      currentToggleKey = key;
      return true;
    } else {
      showHotkeyError(key, '起動');
      return false;
    }
  } catch (error) {
    showHotkeyError(key, '起動');
    return false;
  }
}

export function registerCopyHotkey(callback: HotkeyCallback): boolean {
  const settings = store.getSettings();
  const key = normalizeAccelerator(settings.hotkeys.copy);

  if (currentCopyKey) {
    globalShortcut.unregister(currentCopyKey);
    currentCopyKey = null;
  }

  copyCallback = callback;

  try {
    const success = globalShortcut.register(key, () => {
      const mainWindow = getMainWindow();
      if (mainWindow && mainWindow.isVisible()) {
        if (copyCallback) {
          copyCallback();
        }
      }
    });

    if (success) {
      currentCopyKey = key;
      return true;
    } else {
      showHotkeyError(key, 'コピー');
      return false;
    }
  } catch (error) {
    showHotkeyError(key, 'コピー');
    return false;
  }
}

export function registerClearHotkey(callback: HotkeyCallback): boolean {
  const settings = store.getSettings();
  const key = normalizeAccelerator(settings.hotkeys.clear);

  if (currentClearKey) {
    globalShortcut.unregister(currentClearKey);
    currentClearKey = null;
  }

  clearCallback = callback;

  try {
    const success = globalShortcut.register(key, () => {
      const mainWindow = getMainWindow();
      if (mainWindow && mainWindow.isVisible()) {
        if (clearCallback) {
          clearCallback();
        }
      }
    });

    if (success) {
      currentClearKey = key;
      return true;
    } else {
      showHotkeyError(key, 'クリア');
      return false;
    }
  } catch (error) {
    showHotkeyError(key, 'クリア');
    return false;
  }
}

export function unregisterAllHotkeys(): void {
  if (currentToggleKey) {
    globalShortcut.unregister(currentToggleKey);
    currentToggleKey = null;
  }
  if (currentCopyKey) {
    globalShortcut.unregister(currentCopyKey);
    currentCopyKey = null;
  }
  if (currentClearKey) {
    globalShortcut.unregister(currentClearKey);
    currentClearKey = null;
  }
  copyCallback = null;
  clearCallback = null;
}

export function updateHotkeys(copyCallbackFn: HotkeyCallback, clearCallbackFn: HotkeyCallback): { toggle: boolean; copy: boolean; clear: boolean } {
  const toggleSuccess = registerToggleHotkey();
  const copySuccess = registerCopyHotkey(copyCallbackFn);
  const clearSuccess = registerClearHotkey(clearCallbackFn);
  return { toggle: toggleSuccess, copy: copySuccess, clear: clearSuccess };
}

export function getCurrentHotkeys(): { toggle: string | null; copy: string | null; clear: string | null } {
  return {
    toggle: currentToggleKey,
    copy: currentCopyKey,
    clear: currentClearKey,
  };
}
