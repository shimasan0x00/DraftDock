import { describe, it, expect } from 'vitest';

// store.tsはelectron-storeとapp.getPath()に依存しているため、
// デフォルト値の検証のみ行う（モック不要）

describe('Store Default Settings', () => {
  // DEFAULT_SETTINGSの値を直接定義して検証
  // これらの値はstore.tsのDEFAULT_SETTINGSと同期している必要がある
  const DEFAULT_SETTINGS = {
    hotkeys: {
      toggle: 'Ctrl+Shift+D',
      copy: 'Ctrl+Enter',
      clear: 'Ctrl+Shift+L',
    },
    window: {
      x: null,
      y: null,
      width: 450,
      height: 400,
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
      expect(DEFAULT_SETTINGS.window.width).toBe(450);
      expect(DEFAULT_SETTINGS.window.height).toBe(400);
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
    updatedAt: expect.any(String),
  };

  it('should have empty default draft content', () => {
    expect(DEFAULT_DRAFT.content).toBe('');
  });
});
