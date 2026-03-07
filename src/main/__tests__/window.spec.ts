import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockScreen,
  mockApp,
  mockStoreGetSettings,
  mockStoreSetSettings,
  mockBrowserWindowInstance,
} = vi.hoisted(() => {
  const mockBrowserWindowInstance = {
    loadFile: vi.fn(),
    on: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
    focus: vi.fn(),
    close: vi.fn(),
    isVisible: vi.fn().mockReturnValue(false),
    getBounds: vi.fn().mockReturnValue({ x: 100, y: 100, width: 800, height: 450 }),
    removeAllListeners: vi.fn(),
    setMenu: vi.fn(),
    webContents: {
      send: vi.fn(),
      on: vi.fn(),
      toggleDevTools: vi.fn(),
    },
  };

  const mockScreen = {
    getAllDisplays: vi.fn().mockReturnValue([
      { bounds: { x: 0, y: 0, width: 1920, height: 1080 } },
    ]),
    getPrimaryDisplay: vi.fn().mockReturnValue({
      workAreaSize: { width: 1920, height: 1080 },
    }),
  };

  const mockApp = {
    getPath: vi.fn().mockReturnValue('/tmp/test'),
    isPackaged: true,
  };

  const mockStoreGetSettings = vi.fn().mockReturnValue({
    hotkeys: { toggle: 'Ctrl+Shift+D', copy: 'Ctrl+Enter', clear: 'Ctrl+Shift+L' },
    window: { x: null, y: null, width: 800, height: 450 },
  });

  const mockStoreSetSettings = vi.fn();

  return {
    mockScreen,
    mockApp,
    mockStoreGetSettings,
    mockStoreSetSettings,
    mockBrowserWindowInstance,
  };
});

vi.mock('electron', () => ({
  BrowserWindow: vi.fn(function () { return mockBrowserWindowInstance; }),
  screen: mockScreen,
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
    setSettings: mockStoreSetSettings,
  },
}));

// window.tsはモジュールレベルの変数(mainWindow等)を持つため、
// テスト間の分離のためにテスト毎にモジュールをリセットする
let windowModule: typeof import('../window');

async function loadWindowModule() {
  vi.resetModules();
  // 再モック設定（resetModulesでクリアされるため）
  vi.doMock('electron', () => ({
    BrowserWindow: vi.fn(function () { return mockBrowserWindowInstance; }),
    screen: mockScreen,
    app: mockApp,
  }));
  vi.doMock('electron-store', () => ({
    default: class MockStore {
      get() { return undefined; }
      set() {}
      clear() {}
    },
  }));
  vi.doMock('../store', () => ({
    store: {
      getSettings: mockStoreGetSettings,
      setSettings: mockStoreSetSettings,
    },
  }));
  windowModule = await import('../window');
}

describe('window', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await loadWindowModule();
  });

  describe('createMainWindow', () => {
    it('BrowserWindowを作成して返す', () => {
      const win = windowModule.createMainWindow();
      expect(win).toBe(mockBrowserWindowInstance);
    });

    it('二重作成時は既存ウィンドウを返す', () => {
      const win1 = windowModule.createMainWindow();
      const win2 = windowModule.createMainWindow();
      expect(win1).toBe(win2);
    });

    it('保存済み座標が画面内の場合はその位置を使用する', async () => {
      mockStoreGetSettings.mockReturnValueOnce({
        hotkeys: { toggle: 'Ctrl+Shift+D', copy: 'Ctrl+Enter', clear: 'Ctrl+Shift+L' },
        window: { x: 200, y: 200, width: 800, height: 450 },
      });

      windowModule.createMainWindow();

      const { BrowserWindow } = await import('electron');
      expect(BrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({ x: 200, y: 200 }),
      );
    });

    it('座標がnullの場合は中央に配置する', async () => {
      mockStoreGetSettings.mockReturnValueOnce({
        hotkeys: { toggle: 'Ctrl+Shift+D', copy: 'Ctrl+Enter', clear: 'Ctrl+Shift+L' },
        window: { x: null, y: null, width: 800, height: 450 },
      });

      windowModule.createMainWindow();

      const { BrowserWindow } = await import('electron');
      expect(BrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          x: Math.round((1920 - 800) / 2),
          y: Math.round((1080 - 450) / 2),
        }),
      );
    });

    it('画面外の座標の場合は中央に配置する', async () => {
      mockStoreGetSettings.mockReturnValueOnce({
        hotkeys: { toggle: 'Ctrl+Shift+D', copy: 'Ctrl+Enter', clear: 'Ctrl+Shift+L' },
        window: { x: -5000, y: -5000, width: 800, height: 450 },
      });

      windowModule.createMainWindow();

      const { BrowserWindow } = await import('electron');
      expect(BrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          x: Math.round((1920 - 800) / 2),
          y: Math.round((1080 - 450) / 2),
        }),
      );
    });
  });

  describe('showMainWindow', () => {
    it('ウィンドウが未作成の場合は作成してから表示する', () => {
      windowModule.showMainWindow();
      expect(mockBrowserWindowInstance.show).toHaveBeenCalled();
      expect(mockBrowserWindowInstance.focus).toHaveBeenCalled();
      expect(mockBrowserWindowInstance.webContents.send).toHaveBeenCalledWith('window-shown');
    });

    it('既存ウィンドウがある場合はそのまま表示する', () => {
      windowModule.createMainWindow();
      vi.clearAllMocks();

      windowModule.showMainWindow();
      expect(mockBrowserWindowInstance.show).toHaveBeenCalled();
    });
  });

  describe('hideMainWindow', () => {
    it('ウィンドウが存在する場合は非表示にする', () => {
      windowModule.createMainWindow();
      vi.clearAllMocks();

      windowModule.hideMainWindow();
      expect(mockBrowserWindowInstance.hide).toHaveBeenCalled();
    });

    it('ウィンドウ非表示時にポジションを保存する', () => {
      windowModule.createMainWindow();
      vi.clearAllMocks();

      windowModule.hideMainWindow();
      expect(mockStoreSetSettings).toHaveBeenCalledWith({
        window: { x: 100, y: 100, width: 800, height: 450 },
      });
    });

    it('ウィンドウが存在しない場合は何もしない', () => {
      windowModule.hideMainWindow();
      expect(mockBrowserWindowInstance.hide).not.toHaveBeenCalled();
    });
  });

  describe('toggleMainWindow', () => {
    it('表示中の場合は非表示にする', () => {
      windowModule.createMainWindow();
      mockBrowserWindowInstance.isVisible.mockReturnValue(true);
      vi.clearAllMocks();

      windowModule.toggleMainWindow();
      expect(mockBrowserWindowInstance.hide).toHaveBeenCalled();
    });

    it('非表示の場合は表示する', () => {
      windowModule.createMainWindow();
      mockBrowserWindowInstance.isVisible.mockReturnValue(false);
      vi.clearAllMocks();

      windowModule.toggleMainWindow();
      expect(mockBrowserWindowInstance.show).toHaveBeenCalled();
    });
  });

  describe('destroyMainWindow', () => {
    it('リスナー削除後にclose・null化する', () => {
      windowModule.createMainWindow();
      windowModule.destroyMainWindow();

      expect(mockBrowserWindowInstance.removeAllListeners).toHaveBeenCalledWith('close');
      expect(mockBrowserWindowInstance.close).toHaveBeenCalled();
      expect(windowModule.getMainWindow()).toBeNull();
    });

    it('ウィンドウが存在しない場合は何もしない', () => {
      windowModule.destroyMainWindow();
      expect(mockBrowserWindowInstance.close).not.toHaveBeenCalled();
    });
  });

  describe('getMainWindow', () => {
    it('作成前はnull', () => {
      expect(windowModule.getMainWindow()).toBeNull();
    });

    it('作成後はBrowserWindowインスタンス', () => {
      windowModule.createMainWindow();
      expect(windowModule.getMainWindow()).toBe(mockBrowserWindowInstance);
    });
  });

  describe('saveWindowPosition (H1: try-catch)', () => {
    it('store.setSettings例外時にconsole.errorが呼ばれる', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      windowModule.createMainWindow();

      mockStoreSetSettings.mockImplementationOnce(() => {
        throw new Error('disk full');
      });

      // hideMainWindow内部でsaveWindowPositionが呼ばれる
      windowModule.hideMainWindow();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to save window position:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('createSettingsWindow', () => {
    it('設定ウィンドウを作成して返す', () => {
      const win = windowModule.createSettingsWindow();
      expect(win).toBe(mockBrowserWindowInstance);
    });

    it('二重作成時は既存ウィンドウをフォーカスして返す', () => {
      windowModule.createSettingsWindow();
      vi.clearAllMocks();

      const win = windowModule.createSettingsWindow();
      expect(mockBrowserWindowInstance.focus).toHaveBeenCalled();
      expect(win).toBe(mockBrowserWindowInstance);
    });
  });

  describe('closeSettingsWindow', () => {
    it('設定ウィンドウを閉じてnull化する', () => {
      windowModule.createSettingsWindow();
      windowModule.closeSettingsWindow();

      expect(mockBrowserWindowInstance.close).toHaveBeenCalled();
      expect(windowModule.getSettingsWindow()).toBeNull();
    });
  });
});
