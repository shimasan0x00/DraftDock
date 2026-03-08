export const IPC_CHANNELS = {
  GET_DRAFT: 'get-draft',
  SAVE_DRAFT: 'save-draft',
  CLEAR_DRAFT: 'clear-draft',
  COPY_TO_CLIPBOARD: 'copy-to-clipboard',
  HIDE_WINDOW: 'hide-window',
  GET_SETTINGS: 'get-settings',
  SAVE_SETTINGS: 'save-settings',
  CLOSE_SETTINGS: 'close-settings',
  OPEN_SETTINGS: 'open-settings',
  WINDOW_SHOWN: 'window-shown',
  COPY_REQUESTED: 'copy-requested',
  CLEAR_REQUESTED: 'clear-requested',
} as const;
