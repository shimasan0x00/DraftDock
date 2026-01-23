import { Tray, Menu, nativeImage, app, NativeImage } from 'electron';
import * as path from 'path';
import { showMainWindow, createSettingsWindow } from './window';

let tray: Tray | null = null;

function createTrayIcon(): NativeImage {
  const iconPath = path.join(__dirname, '..', '..', 'assets', 'tray-icon.png');
  try {
    return nativeImage.createFromPath(iconPath);
  } catch {
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
