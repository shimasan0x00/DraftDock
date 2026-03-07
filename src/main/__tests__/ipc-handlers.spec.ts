import { describe, it, expect } from 'vitest';
import { validateDraftContent, validateCopyText, validateHotkeySettings } from '../validators';

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

  it('50文字ちょうどのキーを受理する', () => {
    expect(validateHotkeySettings({ ...validSettings, toggle: 'A'.repeat(50) })).toBe(true);
  });

  it('空文字のキーを拒否する', () => {
    expect(validateHotkeySettings({ ...validSettings, toggle: '' })).toBe(false);
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
