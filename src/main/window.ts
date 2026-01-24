import { BrowserWindow, screen } from 'electron';
import * as path from 'path';
import { store, Settings } from './store';

let mainWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;

const MIN_WIDTH = 300;
const MIN_HEIGHT = 250;
const DEFAULT_WIDTH = 350;
const DEFAULT_HEIGHT = 400;
const SETTINGS_WIDTH = 400;
const SETTINGS_HEIGHT = 350;

function isPositionOnScreen(x: number, y: number): boolean {
  const displays = screen.getAllDisplays();
  for (const display of displays) {
    const { x: dx, y: dy, width, height } = display.bounds;
    if (x >= dx && x < dx + width && y >= dy && y < dy + height) {
      return true;
    }
  }
  return false;
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

  if (x === null || y === null || !isPositionOnScreen(x, y)) {
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
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  // 開発時はDevToolsを開く（F12でも開ける）
  mainWindow.webContents.on('before-input-event', (_event, input) => {
    if (input.key === 'F12') {
      mainWindow?.webContents.toggleDevTools();
    }
  });

  mainWindow.on('close', (event) => {
    event.preventDefault();
    hideMainWindow();
  });

  mainWindow.on('moved', () => {
    saveWindowPosition();
  });

  mainWindow.on('resized', () => {
    saveWindowPosition();
  });

  return mainWindow;
}

function saveWindowPosition(): void {
  if (!mainWindow) return;

  const bounds = mainWindow.getBounds();
  store.setSettings({
    window: {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    },
  });
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
    mainWindow.removeAllListeners('close');
    mainWindow.close();
    mainWindow = null;
  }
}

export function createSettingsWindow(): BrowserWindow {
  if (settingsWindow) {
    settingsWindow.focus();
    return settingsWindow;
  }

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
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  settingsWindow.setMenu(null);
  settingsWindow.loadFile(path.join(__dirname, '..', 'renderer', 'settings.html'));

  // 開発時はDevToolsを開く（F12でも開ける）
  settingsWindow.webContents.on('before-input-event', (_event, input) => {
    if (input.key === 'F12') {
      settingsWindow?.webContents.toggleDevTools();
    }
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });

  return settingsWindow;
}

export function closeSettingsWindow(): void {
  if (settingsWindow) {
    settingsWindow.close();
    settingsWindow = null;
  }
}

export function getSettingsWindow(): BrowserWindow | null {
  return settingsWindow;
}
