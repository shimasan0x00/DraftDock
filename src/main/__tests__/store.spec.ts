import { describe, it, expect, vi, beforeEach } from 'vitest';

// electron-storeモック用のストレージ
const { mockSettingsData, mockDraftData, mockInternalData } = vi.hoisted(() => {
  const mockSettingsData: Record<string, unknown> = {};
  const mockDraftData: Record<string, unknown> = {};
  const mockInternalData: Record<string, unknown> = {};
  return { mockSettingsData, mockDraftData, mockInternalData };
});

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/tmp/test'),
  },
}));

vi.mock('electron-store', () => ({
  default: class MockStore {
    private data: Record<string, unknown>;
    constructor(opts: { name: string; defaults?: Record<string, unknown> }) {
      const storageMap: Record<string, Record<string, unknown>> = {
        settings: mockSettingsData,
        draft: mockDraftData,
        'internal-state': mockInternalData,
      };
      const storage = storageMap[opts.name] ?? mockDraftData;
      this.data = storage;
      if (opts.defaults) {
        for (const [key, value] of Object.entries(opts.defaults)) {
          if (!(key in this.data)) {
            this.data[key] = JSON.parse(JSON.stringify(value));
          }
        }
      }
    }
    get store() {
      return this.data;
    }
    get(key: string, defaultValue?: unknown) {
      const keys = key.split('.');
      let current: unknown = this.data;
      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = (current as Record<string, unknown>)[k];
        } else {
          return defaultValue;
        }
      }
      return current;
    }
    set(key: string | Record<string, unknown>, value?: unknown) {
      if (typeof key === 'object') {
        Object.assign(this.data, key);
        return;
      }
      const keys = key.split('.');
      let current: Record<string, unknown> = this.data;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current) || typeof current[keys[i]] !== 'object') {
          current[keys[i]] = {};
        }
        current = current[keys[i]] as Record<string, unknown>;
      }
      current[keys[keys.length - 1]] = value;
    }
    clear() {
      for (const key of Object.keys(this.data)) {
        delete this.data[key];
      }
    }
  },
}));

function resetMockData() {
  for (const key of Object.keys(mockSettingsData)) delete mockSettingsData[key];
  for (const key of Object.keys(mockDraftData)) delete mockDraftData[key];
  for (const key of Object.keys(mockInternalData)) delete mockInternalData[key];
}

describe('Store Default Settings', () => {
  const DEFAULT_SETTINGS = {
    hotkeys: {
      toggle: 'Ctrl+Shift+D',
      copy: 'Ctrl+Enter',
      clear: 'Ctrl+Shift+L',
    },
    window: {
      x: null,
      y: null,
      width: 800,
      height: 450,
    },
  };

  // ST-01: デフォルトホットキー値の検証
  describe('Default hotkey settings', () => {
    it('should have correct default toggle hotkey', () => {
      expect(DEFAULT_SETTINGS.hotkeys.toggle).toBe('Ctrl+Shift+D');
    });

    it('should have correct default copy hotkey', () => {
      expect(DEFAULT_SETTINGS.hotkeys.copy).toBe('Ctrl+Enter');
    });

    it('should have correct default clear hotkey', () => {
      expect(DEFAULT_SETTINGS.hotkeys.clear).toBe('Ctrl+Shift+L');
    });

    it('should have valid hotkey format (contains modifier + key)', () => {
      const hotkeyPattern = /^(Ctrl|Alt|Shift|CommandOrControl)(\+(Ctrl|Alt|Shift|CommandOrControl))*\+\w+$/i;
      expect(DEFAULT_SETTINGS.hotkeys.toggle).toMatch(hotkeyPattern);
      expect(DEFAULT_SETTINGS.hotkeys.copy).toMatch(hotkeyPattern);
      expect(DEFAULT_SETTINGS.hotkeys.clear).toMatch(hotkeyPattern);
    });
  });

  // ST-02: デフォルトウィンドウサイズの検証
  describe('Default window settings', () => {
    it('should have null initial position', () => {
      expect(DEFAULT_SETTINGS.window.x).toBeNull();
      expect(DEFAULT_SETTINGS.window.y).toBeNull();
    });

    it('should have correct default window size', () => {
      expect(DEFAULT_SETTINGS.window.width).toBe(800);
      expect(DEFAULT_SETTINGS.window.height).toBe(450);
    });

    it('should have positive window dimensions', () => {
      expect(DEFAULT_SETTINGS.window.width).toBeGreaterThan(0);
      expect(DEFAULT_SETTINGS.window.height).toBeGreaterThan(0);
    });
  });
});

describe('Store Default Draft', () => {
  const DEFAULT_DRAFT = {
    content: '',
    updatedAt: '',
  };

  it('should have empty default draft content', () => {
    expect(DEFAULT_DRAFT.content).toBe('');
  });

  it('should have empty default updatedAt', () => {
    expect(DEFAULT_DRAFT.updatedAt).toBe('');
  });
});

describe('AppStore', () => {
  beforeEach(() => {
    resetMockData();
    vi.resetModules();
  });

  async function getStore() {
    const mod = await import('../store');
    return mod.store;
  }

  describe('getSettings()', () => {
    it('デフォルト設定を一括取得で正しいオブジェクトとして返す', async () => {
      const store = await getStore();
      const settings = store.getSettings();
      expect(settings).toEqual({
        hotkeys: {
          toggle: 'Ctrl+Shift+D',
          copy: 'Ctrl+Enter',
          clear: 'Ctrl+Shift+L',
        },
        window: {
          x: null,
          y: null,
          width: 800,
          height: 450,
        },
      });
    });
  });

  describe('setSettings()', () => {
    it('hotkeysのみ部分更新できる', async () => {
      const store = await getStore();
      store.setSettings({
        hotkeys: { toggle: 'Ctrl+Shift+X', copy: 'Ctrl+Shift+C', clear: 'Ctrl+Shift+Z' },
      });
      const settings = store.getSettings();
      expect(settings.hotkeys.toggle).toBe('Ctrl+Shift+X');
      expect(settings.hotkeys.copy).toBe('Ctrl+Shift+C');
      expect(settings.hotkeys.clear).toBe('Ctrl+Shift+Z');
      expect(settings.window.width).toBe(800);
    });

    it('windowのみ部分更新できる', async () => {
      const store = await getStore();
      store.setSettings({
        window: { x: 100, y: 200, width: 600, height: 400 },
      });
      const settings = store.getSettings();
      expect(settings.window).toEqual({ x: 100, y: 200, width: 600, height: 400 });
      expect(settings.hotkeys.toggle).toBe('Ctrl+Shift+D');
    });
  });

  describe('getDraft() / setDraft()', () => {
    it('setDraftで保存した内容をgetDraftで取得できる', async () => {
      const store = await getStore();
      store.setDraft('テストコンテンツ');
      const draft = store.getDraft();
      expect(draft.content).toBe('テストコンテンツ');
      expect(draft.updatedAt).toBeTruthy();
    });
  });

  describe('clearDraft()', () => {
    it('クリア後にcontentが空になる', async () => {
      const store = await getStore();
      store.setDraft('何かのテキスト');
      store.clearDraft();
      const draft = store.getDraft();
      expect(draft.content).toBe('');
      expect(draft.updatedAt).toBeTruthy();
    });
  });

  describe('saveFailedFlag', () => {
    it('setSaveFailedFlag → getSaveFailedFlag → clearSaveFailedFlagのサイクル', async () => {
      const store = await getStore();
      expect(store.getSaveFailedFlag()).toBe(false);

      store.setSaveFailedFlag(true);
      expect(store.getSaveFailedFlag()).toBe(true);

      store.clearSaveFailedFlag();
      expect(store.getSaveFailedFlag()).toBe(false);
    });
  });
});
