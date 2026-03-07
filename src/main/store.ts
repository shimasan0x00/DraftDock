import Store from 'electron-store';
import { app } from 'electron';

export interface Settings {
  hotkeys: {
    toggle: string;
    copy: string;
    clear: string;
  };
  window: {
    x: number | null;
    y: number | null;
    width: number;
    height: number;
  };
}

export interface Draft {
  content: string;
  updatedAt: string;
}

interface InternalSettings extends Settings {
  _saveFailed?: boolean;
}

const DEFAULT_SETTINGS: InternalSettings = {
  hotkeys: {
    toggle: 'Ctrl+Shift+D',
    copy: 'Ctrl+Enter',
    clear: 'Ctrl+Shift+L',
  },
  window: {
    x: null,
    y: null,
    width: 800,
    height: 450,
  },
};

const DEFAULT_DRAFT: Draft = {
  content: '',
  updatedAt: new Date().toISOString(),
};

class AppStore {
  private settingsStore: Store<InternalSettings>;
  private draftStore: Store<Draft>;

  constructor() {
    const userDataPath = app.getPath('userData');

    this.settingsStore = new Store<InternalSettings>({
      name: 'settings',
      cwd: userDataPath,
      defaults: DEFAULT_SETTINGS,
    });

    this.draftStore = new Store<Draft>({
      name: 'draft',
      cwd: userDataPath,
      defaults: DEFAULT_DRAFT,
    });
  }

  getSettings(): Settings {
    return {
      hotkeys: {
        toggle: this.settingsStore.get('hotkeys.toggle'),
        copy: this.settingsStore.get('hotkeys.copy'),
        clear: this.settingsStore.get('hotkeys.clear'),
      },
      window: {
        x: this.settingsStore.get('window.x'),
        y: this.settingsStore.get('window.y'),
        width: this.settingsStore.get('window.width'),
        height: this.settingsStore.get('window.height'),
      },
    };
  }

  setSettings(settings: Partial<Settings>): void {
    if (settings.hotkeys) {
      if (settings.hotkeys.toggle !== undefined) {
        this.settingsStore.set('hotkeys.toggle', settings.hotkeys.toggle);
      }
      if (settings.hotkeys.copy !== undefined) {
        this.settingsStore.set('hotkeys.copy', settings.hotkeys.copy);
      }
      if (settings.hotkeys.clear !== undefined) {
        this.settingsStore.set('hotkeys.clear', settings.hotkeys.clear);
      }
    }
    if (settings.window) {
      if (settings.window.x !== undefined) {
        this.settingsStore.set('window.x', settings.window.x);
      }
      if (settings.window.y !== undefined) {
        this.settingsStore.set('window.y', settings.window.y);
      }
      if (settings.window.width !== undefined) {
        this.settingsStore.set('window.width', settings.window.width);
      }
      if (settings.window.height !== undefined) {
        this.settingsStore.set('window.height', settings.window.height);
      }
    }
  }

  getDraft(): Draft {
    return {
      content: this.draftStore.get('content'),
      updatedAt: this.draftStore.get('updatedAt'),
    };
  }

  setDraft(content: string): void {
    this.draftStore.set('content', content);
    this.draftStore.set('updatedAt', new Date().toISOString());
  }

  clearDraft(): void {
    this.draftStore.set('content', '');
    this.draftStore.set('updatedAt', new Date().toISOString());
  }

  setSaveFailedFlag(failed: boolean): void {
    this.settingsStore.set('_saveFailed', failed);
  }

  getSaveFailedFlag(): boolean {
    return this.settingsStore.get('_saveFailed', false) === true;
  }

  clearSaveFailedFlag(): void {
    this.settingsStore.set('_saveFailed', false);
  }

  resetSettings(): void {
    this.settingsStore.clear();
  }
}

export const store = new AppStore();
