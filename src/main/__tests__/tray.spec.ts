import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockTrayInstance, mockNativeImage, mockMenu, mockApp } = vi.hoisted(() => {
  const mockTrayInstance = {
    setToolTip: vi.fn(),
    setContextMenu: vi.fn(),
    on: vi.fn(),
    destroy: vi.fn(),
  };

  const mockNativeImage = {
    createFromPath: vi.fn().mockReturnValue({
      isEmpty: vi.fn().mockReturnValue(false),
    }),
    createEmpty: vi.fn().mockReturnValue({ isEmpty: vi.fn().mockReturnValue(true) }),
  };

  const mockMenu = {
    buildFromTemplate: vi.fn().mockReturnValue({}),
  };

  const mockApp = {
    getPath: vi.fn().mockReturnValue('/tmp/test'),
    quit: vi.fn(),
  };

  return { mockTrayInstance, mockNativeImage, mockMenu, mockApp };
});

vi.mock('electron', () => ({
  Tray: vi.fn(function () { return mockTrayInstance; }),
  Menu: mockMenu,
  nativeImage: mockNativeImage,
  app: mockApp,
}));

vi.mock('electron-store', () => ({
  default: class MockStore {
    get() { return undefined; }
    set() {}
    clear() {}
  },
}));

vi.mock('../window', () => ({
  showMainWindow: vi.fn(),
  createSettingsWindow: vi.fn(),
}));

let trayModule: typeof import('../tray');

async function loadTrayModule() {
  vi.resetModules();
  vi.doMock('electron', () => ({
    Tray: vi.fn(function () { return mockTrayInstance; }),
    Menu: mockMenu,
    nativeImage: mockNativeImage,
    app: mockApp,
  }));
  vi.doMock('electron-store', () => ({
    default: class MockStore {
      get() { return undefined; }
      set() {}
      clear() {}
    },
  }));
  vi.doMock('../window', () => ({
    showMainWindow: vi.fn(),
    createSettingsWindow: vi.fn(),
  }));
  trayModule = await import('../tray');
}

describe('tray', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await loadTrayModule();
  });

  describe('createTray', () => {
    it('Trayインスタンスを作成して返す', () => {
      const tray = trayModule.createTray();
      expect(tray).toBe(mockTrayInstance);
      expect(mockTrayInstance.setToolTip).toHaveBeenCalledWith('DraftDock');
      expect(mockTrayInstance.setContextMenu).toHaveBeenCalled();
    });

    it('二重作成時は既存Trayを返す', () => {
      const tray1 = trayModule.createTray();
      const tray2 = trayModule.createTray();
      expect(tray1).toBe(tray2);
    });

    it('クリックイベントリスナーを登録する', () => {
      trayModule.createTray();
      expect(mockTrayInstance.on).toHaveBeenCalledWith('click', expect.any(Function));
      expect(mockTrayInstance.on).toHaveBeenCalledWith('double-click', expect.any(Function));
    });
  });

  describe('destroyTray', () => {
    it('destroy呼び出しとnull化', () => {
      trayModule.createTray();
      trayModule.destroyTray();

      expect(mockTrayInstance.destroy).toHaveBeenCalled();
      expect(trayModule.getTray()).toBeNull();
    });

    it('Trayが存在しない場合は何もしない', () => {
      trayModule.destroyTray();
      expect(mockTrayInstance.destroy).not.toHaveBeenCalled();
    });
  });

  describe('getTray', () => {
    it('作成前はnull', () => {
      expect(trayModule.getTray()).toBeNull();
    });

    it('作成後はTrayインスタンス', () => {
      trayModule.createTray();
      expect(trayModule.getTray()).toBe(mockTrayInstance);
    });
  });

  describe('createTrayIcon', () => {
    it('空アイコンの場合はcreateEmptyにフォールバック', async () => {
      mockNativeImage.createFromPath.mockReturnValueOnce({
        isEmpty: vi.fn().mockReturnValue(true),
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      trayModule.createTray();

      expect(mockNativeImage.createEmpty).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('例外時はcreateEmptyにフォールバック', async () => {
      mockNativeImage.createFromPath.mockImplementationOnce(() => {
        throw new Error('file not found');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      trayModule.createTray();

      expect(mockNativeImage.createEmpty).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
