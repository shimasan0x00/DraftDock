(function() {
  let textarea: HTMLTextAreaElement;
  let clearBtn: HTMLButtonElement;
  let copyBtn: HTMLButtonElement;
  let saveTimeout: ReturnType<typeof setTimeout> | null = null;
  let isComposing = false;
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

  async function updateButtonLabels(): Promise<void> {
    try {
      const settings = await window.draftdock.getSettings();
      clearBtn.textContent = `クリア (${settings.hotkeys.clear})`;
      copyBtn.textContent = `コピー (${settings.hotkeys.copy})`;
    } catch (error) {
      console.error('Failed to update button labels:', error);
    }
  }

  function handleGlobalKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      saveDraft();
      if (window.draftdock) {
        window.draftdock.hideWindow();
      }
    }
  }

  function handleTextareaKeydown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      event.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      textarea.value = value.substring(0, start) + '\t' + value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 1;
      debouncedSave();
    }
  }

  function focusTextarea(): void {
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }

  function init(): void {
    console.log('DraftDock: init started');

    textarea = document.getElementById('draft-textarea') as HTMLTextAreaElement;
    clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
    copyBtn = document.getElementById('copy-btn') as HTMLButtonElement;

    if (!textarea || !clearBtn || !copyBtn) {
      console.error('DraftDock: Required DOM elements not found');
      return;
    }

    if (!window.draftdock) {
      console.error('DraftDock: window.draftdock is not defined. Preload script may not be loaded.');
      return;
    }

    console.log('DraftDock: Setting up event listeners');

    textarea.addEventListener('input', () => {
      if (!isComposing) {
        debouncedSave();
      }
    });
    textarea.addEventListener('compositionstart', () => {
      isComposing = true;
    });
    textarea.addEventListener('compositionend', () => {
      isComposing = false;
      debouncedSave();
    });
    textarea.addEventListener('keydown', handleTextareaKeydown);
    clearBtn.addEventListener('click', clearDraft);
    copyBtn.addEventListener('click', copyAndHide);

    document.addEventListener('keydown', handleGlobalKeydown);

    window.draftdock.onWindowShown(() => {
      focusTextarea();
      updateButtonLabels();
    });

    window.draftdock.onClearRequested(() => {
      clearDraft();
    });

    window.draftdock.onCopyRequested(() => {
      copyAndHide();
    });

    window.addEventListener('beforeunload', () => {
      window.draftdock.removeAllListeners();
    });

    loadDraft().then(() => {
      console.log('DraftDock: Draft loaded');
      focusTextarea();
      updateButtonLabels();
    }).catch((error) => {
      console.error('DraftDock: Failed to load draft', error);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
