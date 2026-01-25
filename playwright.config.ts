import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 0,
  workers: 1, // Electron制約: シリアル実行
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
  },
});
