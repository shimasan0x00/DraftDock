import { app, Menu, MenuItemConstructorOptions } from 'electron';
import { createSettingsWindow, getMainWindow } from './window';
import { store } from './store';

export function createApplicationMenu(): void {
  const settings = store.getSettings();

  const template: MenuItemConstructorOptions[] = [
    {
      label: 'ファイル',
      submenu: [
        {
          label: '設定',
          accelerator: 'CommandOrControl+,',
          click: () => {
            createSettingsWindow();
          },
        },
        { type: 'separator' },
        {
          label: '終了',
          accelerator: 'Alt+F4',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: '編集',
      submenu: [
        {
          label: '元に戻す',
          accelerator: 'CommandOrControl+Z',
          role: 'undo',
        },
        {
          label: 'やり直し',
          accelerator: 'CommandOrControl+Y',
          role: 'redo',
        },
        { type: 'separator' },
        {
          label: '切り取り',
          accelerator: 'CommandOrControl+X',
          role: 'cut',
        },
        {
          label: 'コピー',
          accelerator: 'CommandOrControl+C',
          role: 'copy',
        },
        {
          label: '貼り付け',
          accelerator: 'CommandOrControl+V',
          role: 'paste',
        },
        {
          label: 'すべて選択',
          accelerator: 'CommandOrControl+A',
          role: 'selectAll',
        },
        { type: 'separator' },
        {
          label: `クリア (${settings.hotkeys.clear})`,
          click: () => {
            const mainWindow = getMainWindow();
            if (mainWindow) {
              mainWindow.webContents.send('clear-requested');
            }
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
