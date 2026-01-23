export {};

interface DraftDockAPI {
  getDraft: () => Promise<{ content: string; updatedAt: string }>;
  saveDraft: (content: string) => Promise<boolean>;
  clearDraft: () => Promise<boolean>;
  copyToClipboard: (text: string) => Promise<boolean>;
  hideWindow: () => Promise<boolean>;
  getSettings: () => Promise<{
    hotkeys: { toggle: string; copy: string };
    window: { x: number | null; y: number | null; width: number; height: number };
  }>;
  saveSettings: (settings: { toggle: string; copy: string }) => Promise<{ toggle: boolean; copy: boolean }>;
  closeSettings: () => Promise<boolean>;
  openSettings: () => Promise<boolean>;
  onWindowShown: (callback: () => void) => void;
  onCopyRequested: (callback: () => void) => void;
  removeAllListeners: () => void;
}

declare global {
  interface Window {
    draftdock: DraftDockAPI;
  }
}

let textarea: HTMLTextAreaElement;
let clearBtn: HTMLButtonElement;
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 500;

async function loadDraft(): Promise<void> {
  try {
    const draft = await window.draftdock.getDraft();
    textarea.value = draft.content;
  } catch (error) {
    console.error('Failed to load draft:', error);
  }
}

async function saveDraft(): Promise<void> {
  try {
    await window.draftdock.saveDraft(textarea.value);
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
}

function debouncedSave(): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    saveDraft();
    saveTimeout = null;
  }, DEBOUNCE_MS);
}

async function clearDraft(): Promise<void> {
  textarea.value = '';
  try {
    await window.draftdock.clearDraft();
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
  textarea.focus();
}

async function copyAndHide(): Promise<void> {
  const text = textarea.value;
  if (text && text.length > 0) {
    try {
      await window.draftdock.copyToClipboard(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }
}

function handleGlobalKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault();
    saveDraft();
    window.draftdock.hideWindow();
  }
}

function focusTextarea(): void {
  textarea.focus();
  textarea.setSelectionRange(textarea.value.length, textarea.value.length);
}

function init(): void {
  textarea = document.getElementById('draft-textarea') as HTMLTextAreaElement;
  clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;

  if (!textarea || !clearBtn) {
    console.error('Required DOM elements not found');
    return;
  }

  textarea.addEventListener('input', debouncedSave);
  clearBtn.addEventListener('click', clearDraft);

  // Escapeキーはウィンドウ全体で検知
  document.addEventListener('keydown', handleGlobalKeydown);

  window.draftdock.onWindowShown(() => {
    focusTextarea();
  });

  window.draftdock.onCopyRequested(() => {
    copyAndHide();
  });

  loadDraft().then(() => {
    focusTextarea();
  });
}

// DOMContentLoadedを待つ
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
