import { describe, it, expect, vi } from 'vitest';

// Electron依存をモック
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/tmp/test'),
  },
  globalShortcut: {
    register: vi.fn(),
    unregister: vi.fn(),
  },
  Notification: vi.fn().mockImplementation(() => ({
    show: vi.fn(),
  })),
}));

vi.mock('electron-store', () => {
  return {
    default: class MockStore {
      get() { return undefined; }
      set() {}
      clear() {}
    },
  };
});

import { normalizeAccelerator } from '../hotkey';

describe('normalizeAccelerator', () => {
  // HK-01: Ctrl+Shift+D → CommandOrControl+Shift+D
  it('should convert Ctrl+Shift+D to CommandOrControl+Shift+D', () => {
    expect(normalizeAccelerator('Ctrl+Shift+D')).toBe('CommandOrControl+Shift+D');
  });

  // HK-02: ctrl+enter → CommandOrControl+Return
  it('should convert ctrl+enter to CommandOrControl+Return', () => {
    expect(normalizeAccelerator('ctrl+enter')).toBe('CommandOrControl+Return');
  });

  // HK-03: Alt+Space → Alt+Space
  it('should preserve Alt+Space as Alt+Space', () => {
    expect(normalizeAccelerator('Alt+Space')).toBe('Alt+Space');
  });

  // HK-04: 大文字小文字の正規化
  it('should normalize case variations', () => {
    expect(normalizeAccelerator('CTRL+SHIFT+D')).toBe('CommandOrControl+Shift+D');
    expect(normalizeAccelerator('shift+d')).toBe('Shift+D');
    expect(normalizeAccelerator('ALT+ENTER')).toBe('Alt+Return');
  });

  // 追加テスト: その他のキー変換
  it('should convert Control to CommandOrControl', () => {
    expect(normalizeAccelerator('Control+A')).toBe('CommandOrControl+A');
  });

  it('should convert meta/cmd/command to CommandOrControl', () => {
    expect(normalizeAccelerator('meta+A')).toBe('CommandOrControl+A');
    expect(normalizeAccelerator('cmd+A')).toBe('CommandOrControl+A');
    expect(normalizeAccelerator('command+A')).toBe('CommandOrControl+A');
  });

  it('should convert escape/esc to Escape', () => {
    expect(normalizeAccelerator('escape')).toBe('Escape');
    expect(normalizeAccelerator('esc')).toBe('Escape');
  });

  it('should convert return to Return', () => {
    expect(normalizeAccelerator('return')).toBe('Return');
  });

  it('should handle spaces around plus signs', () => {
    expect(normalizeAccelerator('Ctrl + Shift + D')).toBe('CommandOrControl+Shift+D');
  });

  // エッジケース
  describe('edge cases', () => {
    it('should handle empty string', () => {
      expect(normalizeAccelerator('')).toBe('');
    });

    it('should handle single key without modifier', () => {
      expect(normalizeAccelerator('A')).toBe('A');
      expect(normalizeAccelerator('a')).toBe('A');
      expect(normalizeAccelerator('Z')).toBe('Z');
    });

    it('should handle function keys', () => {
      expect(normalizeAccelerator('F1')).toBe('F1');
      expect(normalizeAccelerator('f12')).toBe('F12');
      expect(normalizeAccelerator('Ctrl+F5')).toBe('CommandOrControl+F5');
    });

    it('should handle number keys', () => {
      expect(normalizeAccelerator('Ctrl+1')).toBe('CommandOrControl+1');
      expect(normalizeAccelerator('Alt+0')).toBe('Alt+0');
    });

    it('should handle special keys', () => {
      expect(normalizeAccelerator('Ctrl+Delete')).toBe('CommandOrControl+Delete');
      expect(normalizeAccelerator('Ctrl+Backspace')).toBe('CommandOrControl+Backspace');
      expect(normalizeAccelerator('Ctrl+Home')).toBe('CommandOrControl+Home');
      expect(normalizeAccelerator('Ctrl+End')).toBe('CommandOrControl+End');
    });

    it('should handle multiple modifiers', () => {
      expect(normalizeAccelerator('Ctrl+Alt+Delete')).toBe('CommandOrControl+Alt+Delete');
      expect(normalizeAccelerator('Ctrl+Shift+Alt+A')).toBe('CommandOrControl+Shift+Alt+A');
    });
  });
});
