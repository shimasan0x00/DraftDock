import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockStore,
  mockClipboard,
  mockHandlers,
  mockHideMainWindow,
  mockUpdateHotkeys,
  mockCreateApplicationMenu,
  mockCloseSettingsWindow,
  mockCreateSettingsWindow,
} = vi.hoisted(() => {
  const mockStore = {
    getDraft: vi.fn(),
    setDraft: vi.fn(),
    clearDraft: vi.fn(),
    getSettings: vi.fn(),
    setSettings: vi.fn(),
  };
  const mockClipboard = { writeText: vi.fn() };
  const mockHandlers = new Map<string, (...args: unknown[]) => unknown>();
  const mockHideMainWindow = vi.fn();
  const mockUpdateHotkeys = vi.fn().mockReturnValue({ toggle: true, copy: true, clear: true });
  const mockCreateApplicationMenu = vi.fn();
  const mockCloseSettingsWindow = vi.fn();
  const mockCreateSettingsWindow = vi.fn();
  return {
    mockStore,
    mockClipboard,
    mockHandlers,
    mockHideMainWindow,
    mockUpdateHotkeys,
    mockCreateApplicationMenu,
    mockCloseSettingsWindow,
    mockCreateSettingsWindow,
  };
});

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/tmp/test'),
    requestSingleInstanceLock: vi.fn().mockReturnValue(true),
    whenReady: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    quit: vi.fn(),
  },
  ipcMain: {
    handle: vi.fn((channel: string, handler: (...args: unknown[]) => unknown) => {
      mockHandlers.set(channel, handler);
    }),
  },
  clipboard: mockClipboard,
  BrowserWindow: vi.fn(),
  globalShortcut: {
    register: vi.fn(),
    unregister: vi.fn(),
  },
  Notification: vi.fn().mockImplementation(() => ({
    show: vi.fn(),
  })),
}));

vi.mock('electron-store', () => ({
  default: class MockStore {
    get() { return undefined; }
    set() {}
    clear() {}
  },
}));

vi.mock('../store', () => ({
  store: mockStore,
}));

vi.mock('../window', () => ({
  createMainWindow: vi.fn(),
  showMainWindow: vi.fn(),
  hideMainWindow: mockHideMainWindow,
  getMainWindow: vi.fn(),
  destroyMainWindow: vi.fn(),
  createSettingsWindow: mockCreateSettingsWindow,
  closeSettingsWindow: mockCloseSettingsWindow,
  flushPendingSave: vi.fn(),
}));

vi.mock('../tray', () => ({
  createTray: vi.fn(),
  destroyTray: vi.fn(),
}));

vi.mock('../hotkey', () => ({
  registerToggleHotkey: vi.fn(),
  registerCopyHotkey: vi.fn(),
  registerClearHotkey: vi.fn(),
  unregisterAllHotkeys: vi.fn(),
  updateHotkeys: mockUpdateHotkeys,
}));

vi.mock('../menu', () => ({
  createApplicationMenu: mockCreateApplicationMenu,
}));

// main.ts をインポートしてsetupIpcHandlersを実行させる
import '../main';

function getHandler(channel: string) {
  const handler = mockHandlers.get(channel);
  if (!handler) throw new Error(`Handler for '${channel}' not registered`);
  return handler;
}

describe('IPC Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('get-draft', () => {
    it('store.getDraft()の結果を返す', () => {
      const draft = { content: 'test', updatedAt: '2024-01-01' };
      mockStore.getDraft.mockReturnValue(draft);

      const result = getHandler('get-draft')(null);
      expect(result).toEqual(draft);
      expect(mockStore.getDraft).toHaveBeenCalled();
    });
  });

  describe('save-draft', () => {
    it('正常な文字列を保存してtrueを返す', () => {
      const result = getHandler('save-draft')(null, 'hello');
      expect(result).toBe(true);
      expect(mockStore.setDraft).toHaveBeenCalledWith('hello');
    });

    it('空文字を保存してtrueを返す', () => {
      const result = getHandler('save-draft')(null, '');
      expect(result).toBe(true);
      expect(mockStore.setDraft).toHaveBeenCalledWith('');
    });

    it('バリデーション失敗時にfalseを返す（number）', () => {
      const result = getHandler('save-draft')(null, 123);
      expect(result).toBe(false);
      expect(mockStore.setDraft).not.toHaveBeenCalled();
    });

    it('バリデーション失敗時にfalseを返す（null）', () => {
      const result = getHandler('save-draft')(null, null);
      expect(result).toBe(false);
    });

    it('バリデーション失敗時にfalseを返す（1MB超）', () => {
      const result = getHandler('save-draft')(null, 'a'.repeat(1_000_001));
      expect(result).toBe(false);
    });

    it('store例外時にfalseを返しエラーログを出力する', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockStore.setDraft.mockImplementationOnce(() => { throw new Error('disk full'); });

      const result = getHandler('save-draft')(null, 'test');
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save draft:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('clear-draft', () => {
    it('正常にクリアしてtrueを返す', () => {
      const result = getHandler('clear-draft')(null);
      expect(result).toBe(true);
      expect(mockStore.clearDraft).toHaveBeenCalled();
    });

    it('store例外時にfalseを返しエラーログを出力する', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockStore.clearDraft.mockImplementationOnce(() => { throw new Error('disk error'); });

      const result = getHandler('clear-draft')(null);
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to clear draft:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('copy-to-clipboard', () => {
    it('正常にコピーしてhideMainWindowを呼ぶ', () => {
      const result = getHandler('copy-to-clipboard')(null, 'copy text');
      expect(result).toBe(true);
      expect(mockClipboard.writeText).toHaveBeenCalledWith('copy text');
      expect(mockHideMainWindow).toHaveBeenCalled();
    });

    it('バリデーション失敗時にfalseを返す（空文字）', () => {
      const result = getHandler('copy-to-clipboard')(null, '');
      expect(result).toBe(false);
      expect(mockClipboard.writeText).not.toHaveBeenCalled();
    });

    it('バリデーション失敗時にfalseを返す（number）', () => {
      const result = getHandler('copy-to-clipboard')(null, 42);
      expect(result).toBe(false);
    });

    it('バリデーション失敗時にfalseを返す（null）', () => {
      const result = getHandler('copy-to-clipboard')(null, null);
      expect(result).toBe(false);
    });
  });

  describe('hide-window', () => {
    it('hideMainWindowを呼んでtrueを返す', () => {
      const result = getHandler('hide-window')(null);
      expect(result).toBe(true);
      expect(mockHideMainWindow).toHaveBeenCalled();
    });
  });

  describe('get-settings', () => {
    it('store.getSettings()の結果を返す', () => {
      const settings = {
        hotkeys: { toggle: 'Ctrl+Shift+D', copy: 'Ctrl+Enter', clear: 'Ctrl+Shift+L' },
        window: { x: null, y: null, width: 800, height: 450 },
      };
      mockStore.getSettings.mockReturnValue(settings);

      const result = getHandler('get-settings')(null);
      expect(result).toEqual(settings);
    });
  });

  describe('save-settings', () => {
    const validSettings = { toggle: 'Ctrl+Shift+D', copy: 'Ctrl+Enter', clear: 'Ctrl+Shift+L' };

    it('正常な設定を保存しupdateHotkeysの結果を返す', () => {
      const result = getHandler('save-settings')(null, validSettings);
      expect(result).toEqual({ toggle: true, copy: true, clear: true });
      expect(mockStore.setSettings).toHaveBeenCalledWith({
        hotkeys: validSettings,
      });
      expect(mockUpdateHotkeys).toHaveBeenCalled();
      expect(mockCreateApplicationMenu).toHaveBeenCalled();
      expect(mockCloseSettingsWindow).toHaveBeenCalled();
    });

    it('バリデーション失敗時に全falseを返す', () => {
      const result = getHandler('save-settings')(null, 'invalid');
      expect(result).toEqual({ toggle: false, copy: false, clear: false });
      expect(mockStore.setSettings).not.toHaveBeenCalled();
    });

    it('バリデーション失敗時に全falseを返す（重複キー）', () => {
      const result = getHandler('save-settings')(null, {
        toggle: 'Ctrl+A', copy: 'Ctrl+A', clear: 'Ctrl+B',
      });
      expect(result).toEqual({ toggle: false, copy: false, clear: false });
    });

    it('store例外時に全falseを返しエラーログを出力する', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockStore.setSettings.mockImplementationOnce(() => { throw new Error('write error'); });

      const result = getHandler('save-settings')(null, validSettings);
      expect(result).toEqual({ toggle: false, copy: false, clear: false });
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save settings:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('close-settings', () => {
    it('closeSettingsWindowを呼んでtrueを返す', () => {
      const result = getHandler('close-settings')(null);
      expect(result).toBe(true);
      expect(mockCloseSettingsWindow).toHaveBeenCalled();
    });
  });

  describe('open-settings', () => {
    it('createSettingsWindowを呼んでtrueを返す', () => {
      const result = getHandler('open-settings')(null);
      expect(result).toBe(true);
      expect(mockCreateSettingsWindow).toHaveBeenCalled();
    });
  });
});
