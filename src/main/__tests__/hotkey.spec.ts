import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGlobalShortcut, mockNotificationShow, mockStoreGetSettings } = vi.hoisted(() => {
  const mockGlobalShortcut = {
    register: vi.fn(),
    unregister: vi.fn(),
  };
  const mockNotificationShow = vi.fn();
  const mockStoreGetSettings = vi.fn().mockReturnValue({
    hotkeys: {
      toggle: 'Ctrl+Shift+D',
      copy: 'Ctrl+Enter',
      clear: 'Ctrl+Shift+L',
    },
    window: { x: null, y: null, width: 800, height: 450 },
  });
  return { mockGlobalShortcut, mockNotificationShow, mockStoreGetSettings };
});

// Electron依存をモック
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/tmp/test'),
  },
  globalShortcut: mockGlobalShortcut,
  Notification: vi.fn().mockImplementation(function() {
    return { show: mockNotificationShow };
  }),
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
  toggleMainWindow: vi.fn(),
  getMainWindow: vi.fn().mockReturnValue({
    isVisible: vi.fn().mockReturnValue(true),
  }),
}));

import { normalizeAccelerator, registerToggleHotkey, registerCopyHotkey, registerClearHotkey, unregisterAllHotkeys, updateHotkeys, getCurrentHotkeys } from '../hotkey';

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

describe('registerToggleHotkey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 現在のホットキーをリセット
    unregisterAllHotkeys();
    vi.clearAllMocks();
  });

  it('登録成功時にtrueを返す', () => {
    mockGlobalShortcut.register.mockReturnValue(true);
    const result = registerToggleHotkey();
    expect(result).toBe(true);
    expect(mockGlobalShortcut.register).toHaveBeenCalledWith(
      'CommandOrControl+Shift+D',
      expect.any(Function)
    );
  });

  it('登録失敗時にfalseを返しNotificationを表示する', () => {
    mockGlobalShortcut.register.mockReturnValue(false);
    const result = registerToggleHotkey();
    expect(result).toBe(false);
    expect(mockNotificationShow).toHaveBeenCalled();
  });

  it('register例外時にfalseを返す', () => {
    mockGlobalShortcut.register.mockImplementation(() => { throw new Error('fail'); });
    const result = registerToggleHotkey();
    expect(result).toBe(false);
    expect(mockNotificationShow).toHaveBeenCalled();
  });

  it('新キー登録失敗時に旧キーが維持される', () => {
    // 旧キーを登録
    mockGlobalShortcut.register.mockReturnValue(true);
    registerToggleHotkey();
    expect(getCurrentHotkeys().toggle).toBe('CommandOrControl+Shift+D');
    vi.clearAllMocks();

    // 設定を別のキーに変更
    mockStoreGetSettings.mockReturnValueOnce({
      hotkeys: { toggle: 'Ctrl+Shift+X', copy: 'Ctrl+Enter', clear: 'Ctrl+Shift+L' },
      window: { x: null, y: null, width: 800, height: 450 },
    });

    // 新キー登録を失敗させる
    mockGlobalShortcut.register.mockReturnValue(false);
    const result = registerToggleHotkey();

    expect(result).toBe(false);
    // 旧キーはunregisterされず維持される
    expect(mockGlobalShortcut.unregister).not.toHaveBeenCalled();
    expect(getCurrentHotkeys().toggle).toBe('CommandOrControl+Shift+D');
  });
});

describe('registerCopyHotkey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    unregisterAllHotkeys();
    vi.clearAllMocks();
  });

  it('登録成功時にtrueを返す', () => {
    mockGlobalShortcut.register.mockReturnValue(true);
    const callback = vi.fn();
    const result = registerCopyHotkey(callback);
    expect(result).toBe(true);
    expect(mockGlobalShortcut.register).toHaveBeenCalledWith(
      'CommandOrControl+Return',
      expect.any(Function)
    );
  });

  it('登録失敗時にfalseを返す', () => {
    mockGlobalShortcut.register.mockReturnValue(false);
    const result = registerCopyHotkey(vi.fn());
    expect(result).toBe(false);
  });
});

describe('registerClearHotkey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    unregisterAllHotkeys();
    vi.clearAllMocks();
  });

  it('登録成功時にtrueを返す', () => {
    mockGlobalShortcut.register.mockReturnValue(true);
    const callback = vi.fn();
    const result = registerClearHotkey(callback);
    expect(result).toBe(true);
    expect(mockGlobalShortcut.register).toHaveBeenCalledWith(
      'CommandOrControl+Shift+L',
      expect.any(Function)
    );
  });
});

describe('unregisterAllHotkeys', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('登録済みキーをすべて解除する', () => {
    mockGlobalShortcut.register.mockReturnValue(true);
    registerToggleHotkey();
    registerCopyHotkey(vi.fn());
    registerClearHotkey(vi.fn());
    vi.clearAllMocks();

    unregisterAllHotkeys();

    expect(mockGlobalShortcut.unregister).toHaveBeenCalledTimes(3);
    const keys = getCurrentHotkeys();
    expect(keys.toggle).toBeNull();
    expect(keys.copy).toBeNull();
    expect(keys.clear).toBeNull();
  });

  it('未登録状態でも安全に呼べる', () => {
    unregisterAllHotkeys();
    expect(mockGlobalShortcut.unregister).not.toHaveBeenCalled();
  });
});

describe('updateHotkeys', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    unregisterAllHotkeys();
    vi.clearAllMocks();
  });

  it('3キー一括更新して結果を返す', () => {
    mockGlobalShortcut.register.mockReturnValue(true);
    const copyFn = vi.fn();
    const clearFn = vi.fn();

    const result = updateHotkeys(copyFn, clearFn);
    expect(result).toEqual({ toggle: true, copy: true, clear: true });
    expect(mockGlobalShortcut.register).toHaveBeenCalledTimes(3);
  });

  it('一部失敗時に個別の結果を返す', () => {
    mockGlobalShortcut.register
      .mockReturnValueOnce(true)   // toggle
      .mockReturnValueOnce(false)  // copy
      .mockReturnValueOnce(true);  // clear

    const result = updateHotkeys(vi.fn(), vi.fn());
    expect(result).toEqual({ toggle: true, copy: false, clear: true });
  });
});

describe('getCurrentHotkeys', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    unregisterAllHotkeys();
    vi.clearAllMocks();
  });

  it('登録前はすべてnull', () => {
    const keys = getCurrentHotkeys();
    expect(keys).toEqual({ toggle: null, copy: null, clear: null });
  });

  it('登録後はキー文字列を返す', () => {
    mockGlobalShortcut.register.mockReturnValue(true);
    registerToggleHotkey();
    registerCopyHotkey(vi.fn());
    registerClearHotkey(vi.fn());

    const keys = getCurrentHotkeys();
    expect(keys.toggle).toBe('CommandOrControl+Shift+D');
    expect(keys.copy).toBe('CommandOrControl+Return');
    expect(keys.clear).toBe('CommandOrControl+Shift+L');
  });
});
