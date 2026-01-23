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

interface Window {
  draftdock: DraftDockAPI;
}
