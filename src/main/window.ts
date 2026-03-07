import { BrowserWindow, screen, app } from 'electron';
import * as path from 'path';
import { store, Settings } from './store';

let mainWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let savePositionTimeout: ReturnType<typeof setTimeout> | null = null;
const SAVE_POSITION_DEBOUNCE_MS = 500;

const MIN_WIDTH = 400;
const MIN_HEIGHT = 300;
const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 450;
const SETTINGS_WIDTH = 450;
const SETTINGS_HEIGHT = 450;

const MIN_VISIBLE_SIZE = 100;

// ウィンドウが画面内に十分表示されているかを判定する。
// 各ディスプレイとウィンドウの重複領域（overlap）を計算し、
// 縦横ともにMIN_VISIBLE_SIZE以上の重なりがあれば「画面内」と判定。
function isPositionOnScreen(x: number, y: number, winWidth: number, winHeight: number): boolean {
  const displays = screen.getAllDisplays();
  for (const display of displays) {
    const { x: dx, y: dy, width, height } = display.bounds;
    const overlapX = Math.max(0, Math.min(x + winWidth, dx + width) - Math.max(x, dx));
    const overlapY = Math.max(0, Math.min(y + winHeight, dy + height) - Math.max(y, dy));
    if (overlapX >= MIN_VISIBLE_SIZE && overlapY >= MIN_VISIBLE_SIZE) {
      return true;
    }
  }
  return false;
}

function getSecureWebPreferences(): Electron.WebPreferences {
  return {
    preload: path.join(__dirname, '..', 'preload', 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
  };
}

function setupDevToolsShortcut(window: BrowserWindow): void {
  if (!app.isPackaged) {
    window.webContents.on('before-input-event', (_event, input) => {
      if (input.key === 'F12') {
        window.webContents.toggleDevTools();
      }
    });
  }
}

function getCenterPosition(width: number, height: number): { x: number; y: number } {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
  return {
    x: Math.round((screenWidth - width) / 2),
    y: Math.round((screenHeight - height) / 2),
  };
}

export function createMainWindow(): BrowserWindow {
  if (mainWindow) {
    return mainWindow;
  }

  const settings = store.getSettings();
  let { x, y, width, height } = settings.window;

  width = width || DEFAULT_WIDTH;
  height = height || DEFAULT_HEIGHT;

  if (x === null || y === null || !isPositionOnScreen(x, y, width, height)) {
    const center = getCenterPosition(width, height);
    x = center.x;
    y = center.y;
  }

  mainWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    show: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    icon: path.join(__dirname, '..', 'assets', 'draft_pad_256.png'),
    webPreferences: getSecureWebPreferences(),
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  setupDevToolsShortcut(mainWindow);

  mainWindow.on('close', (event) => {
    event.preventDefault();
    hideMainWindow();
  });

  mainWindow.on('moved', () => {
    debouncedSaveWindowPosition();
  });

  mainWindow.on('resized', () => {
    debouncedSaveWindowPosition();
  });

  return mainWindow;
}

function debouncedSaveWindowPosition(): void {
  if (savePositionTimeout) {
    clearTimeout(savePositionTimeout);
  }
  savePositionTimeout = setTimeout(() => {
    saveWindowPosition();
    savePositionTimeout = null;
  }, SAVE_POSITION_DEBOUNCE_MS);
}

export function flushPendingSave(): void {
  if (savePositionTimeout) {
    clearTimeout(savePositionTimeout);
    savePositionTimeout = null;
    saveWindowPosition();
  }
}

function saveWindowPosition(): void {
  if (!mainWindow) return;

  const bounds = mainWindow.getBounds();
  try {
    store.setSettings({
      window: {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
      },
    });
  } catch (error) {
    console.error('Failed to save window position:', error);
  }
}

export function showMainWindow(): void {
  if (!mainWindow) {
    createMainWindow();
  }

  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('window-shown');
  }
}

export function hideMainWindow(): void {
  if (mainWindow) {
    saveWindowPosition();
    mainWindow.hide();
  }
}

export function toggleMainWindow(): void {
  if (mainWindow && mainWindow.isVisible()) {
    hideMainWindow();
  } else {
    showMainWindow();
  }
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function destroyMainWindow(): void {
  if (mainWindow) {
    mainWindow.removeAllListeners();
    mainWindow.close();
    mainWindow = null;
  }
}

export function createSettingsWindow(): BrowserWindow {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return settingsWindow;
  }
  settingsWindow = null;

  const center = getCenterPosition(SETTINGS_WIDTH, SETTINGS_HEIGHT);

  settingsWindow = new BrowserWindow({
    x: center.x,
    y: center.y,
    width: SETTINGS_WIDTH,
    height: SETTINGS_HEIGHT,
    resizable: false,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '..', 'assets', 'draft_pad_256.png'),
    webPreferences: getSecureWebPreferences(),
  });

  settingsWindow.setMenu(null);
  settingsWindow.loadFile(path.join(__dirname, '..', 'renderer', 'settings.html'));

  setupDevToolsShortcut(settingsWindow);

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });

  return settingsWindow;
}

export function closeSettingsWindow(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.close();
  }
  settingsWindow = null;
}

export function getSettingsWindow(): BrowserWindow | null {
  return settingsWindow;
}
