import { test as base, _electron as electron, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// 永続化テスト用の特別なfixture（アプリ再起動が必要）
const test = base.extend<{ testUserDataDir: string }>({
  testUserDataDir: async ({}, use) => {
    const testDir = path.join(os.tmpdir(), `draftdock-persistence-test-${Date.now()}`);
    fs.mkdirSync(testDir, { recursive: true });
    await use(testDir);
    fs.rmSync(testDir, { recursive: true, force: true });
  },
});

test.describe('永続化', () => {
  test('PS-01: テキスト再起動後も復元', async ({ testUserDataDir }) => {
    const testText = '永続化テスト用テキスト';
    const appPath = path.join(__dirname, '..', 'dist', 'main', 'main.js');

    // 1回目の起動: テキストを入力して保存
    const app1 = await electron.launch({
      args: [appPath],
      env: {
        ...process.env,
        ELECTRON_USER_DATA_DIR: testUserDataDir,
      },
    });

    const window1 = await app1.firstWindow();
    await window1.waitForLoadState('domcontentloaded');

    // テキストを入力
    const textarea1 = window1.locator('#draft-textarea');
    await textarea1.fill(testText);

    // デバウンス保存を待つ (500ms + マージン)
    await window1.waitForTimeout(700);

    // アプリを閉じる
    await app1.close();

    // 2回目の起動: テキストが復元されていることを確認
    const app2 = await electron.launch({
      args: [appPath],
      env: {
        ...process.env,
        ELECTRON_USER_DATA_DIR: testUserDataDir,
      },
    });

    const window2 = await app2.firstWindow();
    await window2.waitForLoadState('domcontentloaded');

    // 初期化を待つ
    await window2.waitForTimeout(500);

    // テキストが復元されていることを確認
    const textarea2 = window2.locator('#draft-textarea');
    await expect(textarea2).toHaveValue(testText);

    await app2.close();
  });
});
