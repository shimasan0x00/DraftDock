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

  // テスト環境でsetPosition()による位置変更がmovedイベントを発火しない場合がある
  test.skip('PS-02: ウィンドウ位置が再起動後も復元', async ({ testUserDataDir }) => {
    const appPath = path.join(__dirname, '..', 'dist', 'main', 'main.js');
    const targetX = 150;
    const targetY = 150;

    // 1回目の起動: ウィンドウ位置を変更
    const app1 = await electron.launch({
      args: [appPath],
      env: {
        ...process.env,
        ELECTRON_USER_DATA_DIR: testUserDataDir,
      },
    });

    const window1 = await app1.firstWindow();
    await window1.waitForLoadState('domcontentloaded');

    // ウィンドウを表示してから位置を変更
    await app1.evaluate(({ BrowserWindow }, { x, y }) => {
      const win = BrowserWindow.getAllWindows().find(w =>
        !w.isDestroyed() && w.webContents.getURL().includes('index.html')
      );
      if (win) {
        win.show();
        win.setPosition(x, y);
      }
    }, { x: targetX, y: targetY });

    // 位置変更を待つ
    await window1.waitForTimeout(200);

    // ウィンドウを非表示にして位置を保存させる
    await app1.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows().find(w =>
        !w.isDestroyed() && w.webContents.getURL().includes('index.html')
      );
      if (win) {
        win.hide();
      }
    });

    // 保存を待つ
    await window1.waitForTimeout(500);

    // アプリを閉じる
    await app1.close();

    // 2回目の起動: 位置が復元されていることを確認
    const app2 = await electron.launch({
      args: [appPath],
      env: {
        ...process.env,
        ELECTRON_USER_DATA_DIR: testUserDataDir,
      },
    });

    const window2 = await app2.firstWindow();
    await window2.waitForLoadState('domcontentloaded');
    await window2.waitForTimeout(300);

    // 位置が復元されていることを確認
    const position = await app2.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows().find(w =>
        !w.isDestroyed() && w.webContents.getURL().includes('index.html')
      );
      if (win) {
        const [x, y] = win.getPosition();
        return { x, y };
      }
      return null;
    });

    expect(position).not.toBeNull();
    expect(position!.x).toBe(targetX);
    expect(position!.y).toBe(targetY);

    await app2.close();
  });
});
