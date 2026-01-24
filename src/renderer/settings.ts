(function() {
  let toggleInput: HTMLInputElement;
  let copyInput: HTMLInputElement;
  let saveBtn: HTMLButtonElement;
  let cancelBtn: HTMLButtonElement;

  let pendingToggleKey = '';
  let pendingCopyKey = '';

  async function loadSettings(): Promise<void> {
    try {
      const settings = await window.draftdock.getSettings();
      toggleInput.value = settings.hotkeys.toggle;
      copyInput.value = settings.hotkeys.copy;
      pendingToggleKey = settings.hotkeys.toggle;
      pendingCopyKey = settings.hotkeys.copy;
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

    if (modifiers.length === 0 && !['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'].includes(normalizedKey)) {
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
    console.log('DraftDock Settings: init started');

    toggleInput = document.getElementById('toggle-hotkey') as HTMLInputElement;
    copyInput = document.getElementById('copy-hotkey') as HTMLInputElement;
    saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
    cancelBtn = document.getElementById('cancel-btn') as HTMLButtonElement;

    if (!toggleInput || !copyInput || !saveBtn || !cancelBtn) {
      console.error('DraftDock Settings: Required DOM elements not found');
      return;
    }

    if (!window.draftdock) {
      console.error('DraftDock Settings: window.draftdock is not defined. Preload script may not be loaded.');
      return;
    }

    console.log('DraftDock Settings: Setting up event listeners');

    toggleInput.addEventListener('keydown', (event) => {
      handleHotkeyInput(event, toggleInput, (key) => {
        pendingToggleKey = key;
        console.log('DraftDock Settings: Toggle key set to', key);
      });
    });

    copyInput.addEventListener('keydown', (event) => {
      handleHotkeyInput(event, copyInput, (key) => {
        pendingCopyKey = key;
        console.log('DraftDock Settings: Copy key set to', key);
      });
    });

    saveBtn.addEventListener('click', async () => {
      console.log('DraftDock Settings: Save button clicked', { toggle: pendingToggleKey, copy: pendingCopyKey });
      try {
        const result = await window.draftdock.saveSettings({
          toggle: pendingToggleKey,
          copy: pendingCopyKey,
        });
        console.log('DraftDock Settings: Save result', result);
      } catch (error) {
        console.error('DraftDock Settings: Failed to save settings:', error);
      }
    });

    cancelBtn.addEventListener('click', async () => {
      console.log('DraftDock Settings: Cancel button clicked');
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
