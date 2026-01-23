import { globalShortcut, Notification } from 'electron';
import { store } from './store';
import { toggleMainWindow, getMainWindow } from './window';

type HotkeyCallback = () => void;

let currentToggleKey: string | null = null;
let currentCopyKey: string | null = null;
let copyCallback: HotkeyCallback | null = null;

function normalizeAccelerator(key: string): string {
  return key
    .split('+')
    .map((part) => part.trim())
    .map((part) => {
      const lower = part.toLowerCase();
      if (lower === 'ctrl' || lower === 'control') return 'Ctrl';
      if (lower === 'shift') return 'Shift';
      if (lower === 'alt') return 'Alt';
      if (lower === 'meta' || lower === 'cmd' || lower === 'command') return 'Meta';
      if (lower === 'enter' || lower === 'return') return 'Return';
      if (lower === 'escape' || lower === 'esc') return 'Escape';
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

export function unregisterAllHotkeys(): void {
  if (currentToggleKey) {
    globalShortcut.unregister(currentToggleKey);
    currentToggleKey = null;
  }
  if (currentCopyKey) {
    globalShortcut.unregister(currentCopyKey);
    currentCopyKey = null;
  }
  copyCallback = null;
}

export function updateHotkeys(callback: HotkeyCallback): { toggle: boolean; copy: boolean } {
  const toggleSuccess = registerToggleHotkey();
  const copySuccess = registerCopyHotkey(callback);
  return { toggle: toggleSuccess, copy: copySuccess };
}

export function getCurrentHotkeys(): { toggle: string | null; copy: string | null } {
  return {
    toggle: currentToggleKey,
    copy: currentCopyKey,
  };
}
