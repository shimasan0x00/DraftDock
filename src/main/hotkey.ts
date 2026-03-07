import { globalShortcut, Notification } from 'electron';
import { store } from './store';
import { toggleMainWindow, getMainWindow } from './window';

type HotkeyCallback = () => void;

let currentToggleKey: string | null = null;
let currentCopyKey: string | null = null;
let currentClearKey: string | null = null;
let copyCallback: HotkeyCallback | null = null;
let clearCallback: HotkeyCallback | null = null;
let isUpdating = false;

export function normalizeAccelerator(key: string): string {
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

function registerHotkeyInternal(
  settingsKey: 'toggle' | 'copy' | 'clear',
  callback: () => void,
  label: string,
  currentKeyRef: { value: string | null }
): boolean {
  const settings = store.getSettings();
  const key = normalizeAccelerator(settings.hotkeys[settingsKey]);
  const oldKey = currentKeyRef.value;

  // 同じキーへの再登録は先にunregisterが必要
  if (oldKey && oldKey === key) {
    globalShortcut.unregister(oldKey);
    currentKeyRef.value = null;
  }

  try {
    const success = globalShortcut.register(key, callback);
    if (success) {
      if (oldKey && oldKey !== key) {
        globalShortcut.unregister(oldKey);
      }
      currentKeyRef.value = key;
      return true;
    } else {
      showHotkeyError(key, label);
      return false;
    }
  } catch {
    showHotkeyError(key, label);
    return false;
  }
}

function createKeyRef(
  getter: () => string | null,
  setter: (v: string | null) => void
): { value: string | null } {
  return {
    get value() { return getter(); },
    set value(v: string | null) { setter(v); },
  };
}

const toggleKeyRef = createKeyRef(() => currentToggleKey, (v) => { currentToggleKey = v; });
const copyKeyRef = createKeyRef(() => currentCopyKey, (v) => { currentCopyKey = v; });
const clearKeyRef = createKeyRef(() => currentClearKey, (v) => { currentClearKey = v; });

function createWindowVisibleCallback(getCallback: () => HotkeyCallback | null): () => void {
  return () => {
    const mainWindow = getMainWindow();
    if (mainWindow && mainWindow.isVisible()) {
      const callback = getCallback();
      if (callback) {
        callback();
      }
    }
  };
}

export function registerToggleHotkey(): boolean {
  return registerHotkeyInternal('toggle', () => { toggleMainWindow(); }, '起動', toggleKeyRef);
}

export function registerCopyHotkey(callback: HotkeyCallback): boolean {
  copyCallback = callback;
  return registerHotkeyInternal('copy', createWindowVisibleCallback(() => copyCallback), 'コピー', copyKeyRef);
}

export function registerClearHotkey(callback: HotkeyCallback): boolean {
  clearCallback = callback;
  return registerHotkeyInternal('clear', createWindowVisibleCallback(() => clearCallback), 'クリア', clearKeyRef);
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
  if (isUpdating) {
    return { toggle: false, copy: false, clear: false };
  }
  isUpdating = true;
  try {
    const toggleSuccess = registerToggleHotkey();
    const copySuccess = registerCopyHotkey(copyCallbackFn);
    const clearSuccess = registerClearHotkey(clearCallbackFn);
    return { toggle: toggleSuccess, copy: copySuccess, clear: clearSuccess };
  } finally {
    isUpdating = false;
  }
}

export function getCurrentHotkeys(): { toggle: string | null; copy: string | null; clear: string | null } {
  return {
    toggle: currentToggleKey,
    copy: currentCopyKey,
    clear: currentClearKey,
  };
}
