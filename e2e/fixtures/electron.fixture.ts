import { test as base, _electron as electron, ElectronApplication, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

export interface ElectronFixtures {
  electronApp: ElectronApplication;
  mainWindow: Page;
  testUserDataDir: string;
}

export const test = base.extend<ElectronFixtures>({
  testUserDataDir: async ({}, use) => {
    // テスト用の一時ディレクトリを作成
    const testDir = path.join(os.tmpdir(), `draftdock-test-${Date.now()}`);
    fs.mkdirSync(testDir, { recursive: true });
    await use(testDir);
    // テスト後にクリーンアップ
    fs.rmSync(testDir, { recursive: true, force: true });
  },

  electronApp: async ({ testUserDataDir }, use) => {
    const app = await electron.launch({
      args: [path.join(__dirname, '..', '..', 'dist', 'main', 'main.js')],
      env: {
        ...process.env,
        ELECTRON_USER_DATA_DIR: testUserDataDir,
      },
    });
    await use(app);
    await app.close();
  },

  mainWindow: async ({ electronApp }, use) => {
    // メインウィンドウを取得
    const window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
    await use(window);
  },
});

export { expect } from '@playwright/test';
