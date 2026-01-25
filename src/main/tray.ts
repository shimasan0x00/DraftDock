import { Tray, Menu, nativeImage, app, NativeImage } from 'electron';
import * as path from 'path';
import { showMainWindow, createSettingsWindow } from './window';

let tray: Tray | null = null;

function createTrayIcon(): NativeImage {
  // dist/main から dist/assets への相対パス
  const iconPath = path.join(__dirname, '..', 'assets', 'draft_pad_16.png');
  try {
    const icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) {
      console.error('Tray icon is empty, path:', iconPath);
      return nativeImage.createEmpty();
    }
    return icon;
  } catch (error) {
    console.error('Failed to load tray icon:', error);
    return nativeImage.createEmpty();
  }
}

export function createTray(): Tray {
  if (tray) {
    return tray;
  }

  const icon = createTrayIcon();
  tray = new Tray(icon);

  tray.setToolTip('DraftDock');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '開く',
      click: () => {
        showMainWindow();
      },
    },
    { type: 'separator' },
    {
      label: '設定',
      click: () => {
        createSettingsWindow();
      },
    },
    { type: 'separator' },
    {
      label: '終了',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    showMainWindow();
  });

  tray.on('double-click', () => {
    showMainWindow();
  });

  return tray;
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}

export function getTray(): Tray | null {
  return tray;
}
