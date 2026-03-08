export function validateDraftContent(content: unknown): content is string {
  return typeof content === 'string' && content.length <= 1_000_000;
}

export function validateCopyText(text: unknown): text is string {
  return typeof text === 'string' && text.length > 0 && text.length <= 1_000_000;
}

const VALID_MODIFIERS = new Set([
  'ctrl', 'shift', 'alt', 'meta', 'control', 'cmd', 'command', 'commandorcontrol',
]);

const VALID_SPECIAL_KEYS = new Set([
  'enter', 'return', 'escape', 'esc', 'space', 'tab', 'backspace', 'delete',
  'up', 'down', 'left', 'right', 'home', 'end', 'pageup', 'pagedown',
]);

export function isValidHotkeyFormat(hotkey: string): boolean {
  if (/[\x00-\x1f\x7f]/.test(hotkey)) return false;

  const parts = hotkey.split('+').map(p => p.trim());
  if (parts.length < 1 || parts.some(p => p.length === 0)) return false;

  const key = parts[parts.length - 1].toLowerCase();
  const modifiers = parts.slice(0, -1).map(m => m.toLowerCase());

  if (!modifiers.every(m => VALID_MODIFIERS.has(m))) return false;

  const isSingleChar = key.length === 1 && /^[a-z0-9]$/.test(key);
  const isFKey = /^f([1-9]|1[0-2])$/.test(key);
  const isSpecialKey = VALID_SPECIAL_KEYS.has(key);

  if (!isSingleChar && !isFKey && !isSpecialKey) return false;
  if (modifiers.length === 0 && !isFKey) return false;

  return true;
}

export function validateHotkeySettings(settings: unknown): settings is { toggle: string; copy: string; clear: string } {
  if (typeof settings !== 'object' || settings === null) return false;
  const s = settings as Record<string, unknown>;
  if (typeof s.toggle !== 'string' || typeof s.copy !== 'string' || typeof s.clear !== 'string') return false;
  if (s.toggle.length > 50 || s.copy.length > 50 || s.clear.length > 50) return false;
  if (s.toggle.length === 0 || s.copy.length === 0 || s.clear.length === 0) return false;
  if (!isValidHotkeyFormat(s.toggle) || !isValidHotkeyFormat(s.copy) || !isValidHotkeyFormat(s.clear)) return false;
  const keys = [s.toggle, s.copy, s.clear];
  const uniqueKeys = new Set(keys.map(k => k.toLowerCase()));
  return uniqueKeys.size === keys.length;
}
