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

interface InternalState {
  saveFailed: boolean;
}

const DEFAULT_SETTINGS: Settings = {
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
  updatedAt: '',
};

const DEFAULT_INTERNAL_STATE: InternalState = {
  saveFailed: false,
};

class AppStore {
  private settingsStore: Store<Settings>;
  private draftStore: Store<Draft>;
  private internalStore: Store<InternalState>;

  constructor() {
    const userDataPath = app.getPath('userData');

    this.settingsStore = new Store<Settings>({
      name: 'settings',
      cwd: userDataPath,
      defaults: DEFAULT_SETTINGS,
    });

    this.draftStore = new Store<Draft>({
      name: 'draft',
      cwd: userDataPath,
      defaults: DEFAULT_DRAFT,
    });

    this.internalStore = new Store<InternalState>({
      name: 'internal-state',
      cwd: userDataPath,
      defaults: DEFAULT_INTERNAL_STATE,
    });
  }

  getSettings(): Settings {
    const data = this.settingsStore.store;
    return {
      hotkeys: {
        toggle: data.hotkeys.toggle,
        copy: data.hotkeys.copy,
        clear: data.hotkeys.clear,
      },
      window: {
        x: data.window.x,
        y: data.window.y,
        width: data.window.width,
        height: data.window.height,
      },
    };
  }

  setSettings(settings: Partial<Settings>): void {
    const current = this.settingsStore.store;
    const merged: Record<string, unknown> = {};

    if (settings.hotkeys) {
      merged.hotkeys = {
        toggle: settings.hotkeys.toggle ?? current.hotkeys.toggle,
        copy: settings.hotkeys.copy ?? current.hotkeys.copy,
        clear: settings.hotkeys.clear ?? current.hotkeys.clear,
      };
    }
    if (settings.window) {
      merged.window = {
        x: settings.window.x !== undefined ? settings.window.x : current.window.x,
        y: settings.window.y !== undefined ? settings.window.y : current.window.y,
        width: settings.window.width !== undefined ? settings.window.width : current.window.width,
        height: settings.window.height !== undefined ? settings.window.height : current.window.height,
      };
    }

    if (Object.keys(merged).length > 0) {
      this.settingsStore.set(merged);
    }
  }

  getDraft(): Draft {
    const data = this.draftStore.store;
    return {
      content: data.content,
      updatedAt: data.updatedAt,
    };
  }

  setDraft(content: string): void {
    this.draftStore.set({
      content,
      updatedAt: new Date().toISOString(),
    });
  }

  clearDraft(): void {
    this.draftStore.set({
      content: '',
      updatedAt: new Date().toISOString(),
    });
  }

  setSaveFailedFlag(failed: boolean): void {
    this.internalStore.set('saveFailed', failed);
  }

  getSaveFailedFlag(): boolean {
    return this.internalStore.get('saveFailed', false) === true;
  }

  clearSaveFailedFlag(): void {
    this.internalStore.set('saveFailed', false);
  }

  resetSettings(): void {
    this.settingsStore.clear();
  }
}

export const store = new AppStore();
