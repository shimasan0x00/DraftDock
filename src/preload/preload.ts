import { contextBridge, ipcRenderer } from 'electron';
import { DraftDockAPI } from '../shared/types';
export type { DraftDockAPI };

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
