(function() {
  let toggleInput: HTMLInputElement;
  let copyInput: HTMLInputElement;
  let clearInput: HTMLInputElement;
  let saveBtn: HTMLButtonElement;
  let cancelBtn: HTMLButtonElement;

  let pendingToggleKey = '';
  let pendingCopyKey = '';
  let pendingClearKey = '';

  async function loadSettings(): Promise<void> {
    try {
      const settings = await window.draftdock.getSettings();
      toggleInput.value = settings.hotkeys.toggle;
      copyInput.value = settings.hotkeys.copy;
      clearInput.value = settings.hotkeys.clear;
      pendingToggleKey = settings.hotkeys.toggle;
      pendingCopyKey = settings.hotkeys.copy;
      pendingClearKey = settings.hotkeys.clear;
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  function formatHotkey(event: KeyboardEvent): string | null {
    const modifiers: string[] = [];

    if (event.ctrlKey) modifiers.push('Ctrl');
    if (event.shiftKey) modifiers.push('Shift');
    if (event.altKey) modifiers.push('Alt');
    if (event.metaKey) modifiers.push('Meta');

    const key = event.key;

    if (['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
      return null;
    }

    let normalizedKey = key;
    if (key === 'Enter') normalizedKey = 'Enter';
    else if (key === 'Escape') normalizedKey = 'Escape';
    else if (key === ' ') normalizedKey = 'Space';
    else if (key.length === 1) normalizedKey = key.toUpperCase();
    else normalizedKey = key;

    if (modifiers.length === 0 && !/^F([1-9]|1[0-2])$/.test(normalizedKey)) {
      return null;
    }

    modifiers.push(normalizedKey);
    return modifiers.join('+');
  }

  function handleHotkeyInput(event: KeyboardEvent, input: HTMLInputElement, setter: (key: string) => void): void {
    event.preventDefault();
    event.stopPropagation();

    const hotkey = formatHotkey(event);
    if (hotkey) {
      input.value = hotkey;
      setter(hotkey);
    }
  }

  function init(): void {
    toggleInput = document.getElementById('toggle-hotkey') as HTMLInputElement;
    copyInput = document.getElementById('copy-hotkey') as HTMLInputElement;
    clearInput = document.getElementById('clear-hotkey') as HTMLInputElement;
    saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
    cancelBtn = document.getElementById('cancel-btn') as HTMLButtonElement;

    if (!toggleInput || !copyInput || !clearInput || !saveBtn || !cancelBtn) {
      console.error('DraftDock Settings: Required DOM elements not found');
      return;
    }

    if (!window.draftdock) {
      console.error('DraftDock Settings: window.draftdock is not defined. Preload script may not be loaded.');
      return;
    }

    toggleInput.addEventListener('keydown', (event) => {
      handleHotkeyInput(event, toggleInput, (key) => {
        pendingToggleKey = key;
      });
    });

    copyInput.addEventListener('keydown', (event) => {
      handleHotkeyInput(event, copyInput, (key) => {
        pendingCopyKey = key;
      });
    });

    clearInput.addEventListener('keydown', (event) => {
      handleHotkeyInput(event, clearInput, (key) => {
        pendingClearKey = key;
      });
    });

    saveBtn.addEventListener('click', async () => {
      const keys = [pendingToggleKey, pendingCopyKey, pendingClearKey];
      const uniqueKeys = new Set(keys.map(k => k.toLowerCase()));
      if (uniqueKeys.size !== keys.length) {
        alert('同じホットキーが複数の機能に割り当てられています。異なるキーを設定してください。');
        return;
      }

      try {
        const result = await window.draftdock.saveSettings({
          toggle: pendingToggleKey,
          copy: pendingCopyKey,
          clear: pendingClearKey,
        });
        const failedKeys: string[] = [];
        if (!result.toggle) failedKeys.push('起動キー');
        if (!result.copy) failedKeys.push('コピーキー');
        if (!result.clear) failedKeys.push('クリアキー');
        if (failedKeys.length > 0) {
          alert(`以下のホットキーの登録に失敗しました:\n${failedKeys.join('\n')}\n\n他のアプリケーションで使用されている可能性があります。`);
        }
      } catch (error) {
        console.error('DraftDock Settings: Failed to save settings:', error);
      }
    });

    cancelBtn.addEventListener('click', async () => {
      try {
        await window.draftdock.closeSettings();
      } catch (error) {
        console.error('DraftDock Settings: Failed to close settings:', error);
      }
    });

    loadSettings();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
