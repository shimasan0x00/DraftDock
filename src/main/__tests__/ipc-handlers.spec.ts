import { describe, it, expect } from 'vitest';
import { validateDraftContent, validateCopyText, validateHotkeySettings, isValidHotkeyFormat } from '../validators';

describe('validateDraftContent', () => {
  it('string を受理する', () => {
    expect(validateDraftContent('hello')).toBe(true);
  });

  it('空文字を受理する', () => {
    expect(validateDraftContent('')).toBe(true);
  });

  it('1MB ちょうどを受理する', () => {
    expect(validateDraftContent('a'.repeat(1_000_000))).toBe(true);
  });

  it('1MB 超を拒否する', () => {
    expect(validateDraftContent('a'.repeat(1_000_001))).toBe(false);
  });

  it('number を拒否する', () => {
    expect(validateDraftContent(123)).toBe(false);
  });

  it('null を拒否する', () => {
    expect(validateDraftContent(null)).toBe(false);
  });

  it('undefined を拒否する', () => {
    expect(validateDraftContent(undefined)).toBe(false);
  });
});

describe('validateCopyText', () => {
  it('通常の文字列を受理する', () => {
    expect(validateCopyText('hello')).toBe(true);
  });

  it('空文字を拒否する', () => {
    expect(validateCopyText('')).toBe(false);
  });

  it('1MB ちょうどを受理する', () => {
    expect(validateCopyText('a'.repeat(1_000_000))).toBe(true);
  });

  it('1MB 超を拒否する', () => {
    expect(validateCopyText('a'.repeat(1_000_001))).toBe(false);
  });

  it('number を拒否する', () => {
    expect(validateCopyText(42)).toBe(false);
  });

  it('null を拒否する', () => {
    expect(validateCopyText(null)).toBe(false);
  });
});

describe('isValidHotkeyFormat', () => {
  it('修飾キー+英字を受理する', () => {
    expect(isValidHotkeyFormat('Ctrl+A')).toBe(true);
  });

  it('複数修飾キー+英字を受理する', () => {
    expect(isValidHotkeyFormat('Ctrl+Shift+D')).toBe(true);
  });

  it('修飾キー+特殊キーを受理する', () => {
    expect(isValidHotkeyFormat('Ctrl+Enter')).toBe(true);
    expect(isValidHotkeyFormat('Ctrl+Space')).toBe(true);
    expect(isValidHotkeyFormat('Alt+Backspace')).toBe(true);
  });

  it('Fキー単独を受理する', () => {
    expect(isValidHotkeyFormat('F1')).toBe(true);
    expect(isValidHotkeyFormat('F12')).toBe(true);
  });

  it('修飾キー+Fキーを受理する', () => {
    expect(isValidHotkeyFormat('Ctrl+F5')).toBe(true);
  });

  it('修飾キーなしの英字を拒否する', () => {
    expect(isValidHotkeyFormat('A')).toBe(false);
  });

  it('修飾キーだけ（キーなし）を拒否する', () => {
    expect(isValidHotkeyFormat('Ctrl+')).toBe(false);
  });

  it('空文字を拒否する', () => {
    expect(isValidHotkeyFormat('')).toBe(false);
  });

  it('制御文字を含む文字列を拒否する', () => {
    expect(isValidHotkeyFormat('Ctrl+\x00')).toBe(false);
    expect(isValidHotkeyFormat('Ctrl+\x1f')).toBe(false);
  });

  it('不正な修飾キーを拒否する', () => {
    expect(isValidHotkeyFormat('Super+A')).toBe(false);
  });

  it('不正なキー名を拒否する', () => {
    expect(isValidHotkeyFormat('Ctrl+InvalidKey')).toBe(false);
  });

  it('数字キーを受理する', () => {
    expect(isValidHotkeyFormat('Ctrl+1')).toBe(true);
  });

  it('F13以降を拒否する', () => {
    expect(isValidHotkeyFormat('F13')).toBe(false);
  });

  it('Meta/Cmd修飾キーを受理する', () => {
    expect(isValidHotkeyFormat('Meta+A')).toBe(true);
    expect(isValidHotkeyFormat('Cmd+A')).toBe(true);
    expect(isValidHotkeyFormat('CommandOrControl+A')).toBe(true);
  });

  it('矢印キーを受理する', () => {
    expect(isValidHotkeyFormat('Ctrl+Up')).toBe(true);
    expect(isValidHotkeyFormat('Ctrl+Down')).toBe(true);
    expect(isValidHotkeyFormat('Alt+Left')).toBe(true);
  });
});

describe('validateHotkeySettings', () => {
  const validSettings = {
    toggle: 'Ctrl+Shift+D',
    copy: 'Ctrl+Enter',
    clear: 'Ctrl+Shift+L',
  };

  it('正常な設定を受理する', () => {
    expect(validateHotkeySettings(validSettings)).toBe(true);
  });

  it('null を拒否する', () => {
    expect(validateHotkeySettings(null)).toBe(false);
  });

  it('string を拒否する', () => {
    expect(validateHotkeySettings('invalid')).toBe(false);
  });

  it('number を拒否する', () => {
    expect(validateHotkeySettings(123)).toBe(false);
  });

  it('フィールド不足を拒否する', () => {
    expect(validateHotkeySettings({ toggle: 'Ctrl+A', copy: 'Ctrl+B' })).toBe(false);
  });

  it('toggle が string でない場合を拒否する', () => {
    expect(validateHotkeySettings({ ...validSettings, toggle: 123 })).toBe(false);
  });

  it('copy が string でない場合を拒否する', () => {
    expect(validateHotkeySettings({ ...validSettings, copy: null })).toBe(false);
  });

  it('50文字超のキーを拒否する', () => {
    expect(validateHotkeySettings({ ...validSettings, toggle: 'A'.repeat(51) })).toBe(false);
  });

  it('空文字のキーを拒否する', () => {
    expect(validateHotkeySettings({ ...validSettings, toggle: '' })).toBe(false);
  });

  it('不正なフォーマットのキーを拒否する', () => {
    expect(validateHotkeySettings({ ...validSettings, toggle: 'InvalidKey' })).toBe(false);
  });

  it('制御文字を含むキーを拒否する', () => {
    expect(validateHotkeySettings({ ...validSettings, toggle: 'Ctrl+\x00A' })).toBe(false);
  });

  it('重複するホットキーを拒否する', () => {
    expect(validateHotkeySettings({
      toggle: 'Ctrl+Shift+D',
      copy: 'Ctrl+Shift+D',
      clear: 'Ctrl+Shift+L',
    })).toBe(false);
  });

  it('大文字小文字が異なる重複を拒否する', () => {
    expect(validateHotkeySettings({
      toggle: 'Ctrl+Shift+D',
      copy: 'ctrl+shift+d',
      clear: 'Ctrl+Shift+L',
    })).toBe(false);
  });

  it('3つすべて同じホットキーを拒否する', () => {
    expect(validateHotkeySettings({
      toggle: 'Ctrl+A',
      copy: 'Ctrl+A',
      clear: 'Ctrl+A',
    })).toBe(false);
  });
});
