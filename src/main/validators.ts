export function validateDraftContent(content: unknown): content is string {
  return typeof content === 'string' && content.length <= 1_000_000;
}

export function validateCopyText(text: unknown): text is string {
  return typeof text === 'string' && text.length > 0 && text.length <= 1_000_000;
}

export function validateHotkeySettings(settings: unknown): settings is { toggle: string; copy: string; clear: string } {
  if (typeof settings !== 'object' || settings === null) return false;
  const s = settings as Record<string, unknown>;
  if (typeof s.toggle !== 'string' || typeof s.copy !== 'string' || typeof s.clear !== 'string') return false;
  if (s.toggle.length > 50 || s.copy.length > 50 || s.clear.length > 50) return false;
  if (s.toggle.length === 0 || s.copy.length === 0 || s.clear.length === 0) return false;
  const keys = [s.toggle, s.copy, s.clear];
  const uniqueKeys = new Set(keys.map(k => k.toLowerCase()));
  return uniqueKeys.size === keys.length;
}
