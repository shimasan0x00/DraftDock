import { contextBridge, ipcRenderer } from 'electron';
import { DraftDockAPI } from '../shared/types';
import { IPC_CHANNELS } from '../shared/ipc-channels';
export type { DraftDockAPI };

const api: DraftDockAPI = {
  getDraft: () => ipcRenderer.invoke(IPC_CHANNELS.GET_DRAFT),
  saveDraft: (content: string) => ipcRenderer.invoke(IPC_CHANNELS.SAVE_DRAFT, content),
  clearDraft: () => ipcRenderer.invoke(IPC_CHANNELS.CLEAR_DRAFT),
  copyToClipboard: (text: string) => ipcRenderer.invoke(IPC_CHANNELS.COPY_TO_CLIPBOARD, text),
  hideWindow: () => ipcRenderer.invoke(IPC_CHANNELS.HIDE_WINDOW),
  getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SETTINGS),
  saveSettings: (settings: { toggle: string; copy: string; clear: string }) => ipcRenderer.invoke(IPC_CHANNELS.SAVE_SETTINGS, settings),
  closeSettings: () => ipcRenderer.invoke(IPC_CHANNELS.CLOSE_SETTINGS),
  openSettings: () => ipcRenderer.invoke(IPC_CHANNELS.OPEN_SETTINGS),
  // 単一レンダラーウィンドウ前提のため、removeAllListenersで二重登録を防止している。
  // index.tsの初期化が再実行された場合でも、リスナーが重複しないことを保証する。
  onWindowShown: (callback: () => void) => {
    ipcRenderer.removeAllListeners(IPC_CHANNELS.WINDOW_SHOWN);
    ipcRenderer.on(IPC_CHANNELS.WINDOW_SHOWN, callback);
  },
  onCopyRequested: (callback: () => void) => {
    ipcRenderer.removeAllListeners(IPC_CHANNELS.COPY_REQUESTED);
    ipcRenderer.on(IPC_CHANNELS.COPY_REQUESTED, callback);
  },
  onClearRequested: (callback: () => void) => {
    ipcRenderer.removeAllListeners(IPC_CHANNELS.CLEAR_REQUESTED);
    ipcRenderer.on(IPC_CHANNELS.CLEAR_REQUESTED, callback);
  },
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners(IPC_CHANNELS.WINDOW_SHOWN);
    ipcRenderer.removeAllListeners(IPC_CHANNELS.COPY_REQUESTED);
    ipcRenderer.removeAllListeners(IPC_CHANNELS.CLEAR_REQUESTED);
  },
};

contextBridge.exposeInMainWorld('draftdock', api);
