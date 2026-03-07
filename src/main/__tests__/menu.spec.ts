import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockMenu, mockApp, mockStoreGetSettings, mockGetMainWindow } = vi.hoisted(() => {
  const mockMenu = {
    buildFromTemplate: vi.fn().mockReturnValue({}),
    setApplicationMenu: vi.fn(),
  };

  const mockApp = {
    getPath: vi.fn().mockReturnValue('/tmp/test'),
    quit: vi.fn(),
  };

  const mockStoreGetSettings = vi.fn().mockReturnValue({
    hotkeys: { toggle: 'Ctrl+Shift+D', copy: 'Ctrl+Enter', clear: 'Ctrl+Shift+L' },
    window: { x: null, y: null, width: 800, height: 450 },
  });

  const mockGetMainWindow = vi.fn().mockReturnValue({
    webContents: { send: vi.fn() },
  });

  return { mockMenu, mockApp, mockStoreGetSettings, mockGetMainWindow };
});

vi.mock('electron', () => ({
  Menu: mockMenu,
  app: mockApp,
}));

vi.mock('electron-store', () => ({
  default: class MockStore {
    get() { return undefined; }
    set() {}
    clear() {}
  },
}));

vi.mock('../store', () => ({
  store: {
    getSettings: mockStoreGetSettings,
  },
}));

vi.mock('../window', () => ({
  createSettingsWindow: vi.fn(),
  getMainWindow: mockGetMainWindow,
}));

import { createApplicationMenu } from '../menu';

describe('menu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createApplicationMenu', () => {
    it('Menu.setApplicationMenuが呼ばれる', () => {
      createApplicationMenu();
      expect(mockMenu.setApplicationMenu).toHaveBeenCalledTimes(1);
    });

    it('buildFromTemplateにファイル・編集サブメニューを含むテンプレートを渡す', () => {
      createApplicationMenu();

      const template = mockMenu.buildFromTemplate.mock.calls[0][0];
      expect(template).toHaveLength(2);
      expect(template[0].label).toBe('ファイル');
      expect(template[1].label).toBe('編集');
    });

    it('ファイルメニューに設定・終了が含まれる', () => {
      createApplicationMenu();

      const template = mockMenu.buildFromTemplate.mock.calls[0][0];
      const fileSubmenu = template[0].submenu;
      const labels = fileSubmenu
        .filter((item: { type?: string }) => item.type !== 'separator')
        .map((item: { label: string }) => item.label);
      expect(labels).toContain('設定');
      expect(labels).toContain('終了');
    });

    it('編集メニューに標準編集項目が含まれる', () => {
      createApplicationMenu();

      const template = mockMenu.buildFromTemplate.mock.calls[0][0];
      const editSubmenu = template[1].submenu;
      const labels = editSubmenu
        .filter((item: { type?: string }) => item.type !== 'separator')
        .map((item: { label: string }) => item.label);
      expect(labels).toContain('元に戻す');
      expect(labels).toContain('コピー');
      expect(labels).toContain('貼り付け');
      expect(labels).toContain('すべて選択');
    });

    it('クリアキーラベルに設定値が反映される', () => {
      createApplicationMenu();

      const template = mockMenu.buildFromTemplate.mock.calls[0][0];
      const editSubmenu = template[1].submenu;
      const clearItem = editSubmenu.find(
        (item: { label?: string }) => item.label && item.label.includes('クリア'),
      );
      expect(clearItem.label).toBe('クリア (Ctrl+Shift+L)');
    });

    it('カスタムクリアキーが反映される', () => {
      mockStoreGetSettings.mockReturnValueOnce({
        hotkeys: { toggle: 'Ctrl+Shift+D', copy: 'Ctrl+Enter', clear: 'Alt+Delete' },
        window: { x: null, y: null, width: 800, height: 450 },
      });

      createApplicationMenu();

      const template = mockMenu.buildFromTemplate.mock.calls[0][0];
      const editSubmenu = template[1].submenu;
      const clearItem = editSubmenu.find(
        (item: { label?: string }) => item.label && item.label.includes('クリア'),
      );
      expect(clearItem.label).toBe('クリア (Alt+Delete)');
    });

    it('クリアメニュークリック時にclear-requestedを送信する', () => {
      const mockSend = vi.fn();
      mockGetMainWindow.mockReturnValue({ webContents: { send: mockSend } });

      createApplicationMenu();

      const template = mockMenu.buildFromTemplate.mock.calls[0][0];
      const editSubmenu = template[1].submenu;
      const clearItem = editSubmenu.find(
        (item: { label?: string }) => item.label && item.label.includes('クリア'),
      );
      clearItem.click();

      expect(mockSend).toHaveBeenCalledWith('clear-requested');
    });

    it('mainWindowがnullの場合はクリアクリックでエラーにならない', () => {
      mockGetMainWindow.mockReturnValue(null);

      createApplicationMenu();

      const template = mockMenu.buildFromTemplate.mock.calls[0][0];
      const editSubmenu = template[1].submenu;
      const clearItem = editSubmenu.find(
        (item: { label?: string }) => item.label && item.label.includes('クリア'),
      );
      expect(() => clearItem.click()).not.toThrow();
    });
  });
});
