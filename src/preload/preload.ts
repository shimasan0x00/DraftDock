import { contextBridge, ipcRenderer } from 'electron';

export interface DraftDockAPI {
  getDraft: () => Promise<{ content: string; updatedAt: string }>;
  saveDraft: (content: string) => Promise<boolean>;
  clearDraft: () => Promise<boolean>;
  copyToClipboard: (text: string) => Promise<boolean>;
  hideWindow: () => Promise<boolean>;
  getSettings: () => Promise<{
    hotkeys: { toggle: string; copy: string; clear: string };
    window: { x: number | null; y: number | null; width: number; height: number };
  }>;
  saveSettings: (settings: { toggle: string; copy: string; clear: string }) => Promise<{ toggle: boolean; copy: boolean; clear: boolean }>;
  closeSettings: () => Promise<boolean>;
  openSettings: () => Promise<boolean>;
  onWindowShown: (callback: () => void) => void;
  onCopyRequested: (callback: () => void) => void;
  onClearRequested: (callback: () => void) => void;
  removeAllListeners: () => void;
}

const api: DraftDockAPI = {
  getDraft: () => ipcRenderer.invoke('get-draft'),
  saveDraft: (content: string) => ipcRenderer.invoke('save-draft', content),
  clearDraft: () => ipcRenderer.invoke('clear-draft'),
  copyToClipboard: (text: string) => ipcRenderer.invoke('copy-to-clipboard', text),
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: { toggle: string; copy: string; clear: string }) => ipcRenderer.invoke('save-settings', settings),
  closeSettings: () => ipcRenderer.invoke('close-settings'),
  openSettings: () => ipcRenderer.invoke('open-settings'),
  onWindowShown: (callback: () => void) => {
    ipcRenderer.on('window-shown', callback);
  },
  onCopyRequested: (callback: () => void) => {
    ipcRenderer.on('copy-requested', callback);
  },
  onClearRequested: (callback: () => void) => {
    ipcRenderer.on('clear-requested', callback);
  },
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('window-shown');
    ipcRenderer.removeAllListeners('copy-requested');
    ipcRenderer.removeAllListeners('clear-requested');
  },
};

contextBridge.exposeInMainWorld('draftdock', api);
