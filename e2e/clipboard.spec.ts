import { test, expect } from './fixtures/electron.fixture';

test.describe('クリップボード・ボタン操作', () => {
  test('CB-01: コピーボタンでコピー', async ({ electronApp, mainWindow }) => {
    const testText = 'テスト用テキスト for clipboard';

    // テキストエリアにテキストを入力
    const textarea = mainWindow.locator('#draft-textarea');
    await textarea.fill(testText);

    // コピーボタンをクリック
    const copyBtn = mainWindow.locator('#copy-btn');
    await copyBtn.click();

    // クリップボードの内容を確認
    const clipboardContent = await electronApp.evaluate(({ clipboard }) => {
      return clipboard.readText();
    });

    expect(clipboardContent).toBe(testText);
  });

  test('CB-02: 空テキスト時は何もしない', async ({ electronApp, mainWindow }) => {
    // まずクリップボードに既知の値をセット
    const initialText = 'initial clipboard content';
    await electronApp.evaluate(({ clipboard }, text) => {
      clipboard.writeText(text);
    }, initialText);

    // テキストエリアを空にする
    const textarea = mainWindow.locator('#draft-textarea');
    await textarea.fill('');

    // コピーボタンをクリック
    const copyBtn = mainWindow.locator('#copy-btn');
    await copyBtn.click();

    // クリップボードが変更されていないことを確認
    const clipboardContent = await electronApp.evaluate(({ clipboard }) => {
      return clipboard.readText();
    });

    expect(clipboardContent).toBe(initialText);
  });

  test('CB-03: クリアボタンでクリア', async ({ mainWindow }) => {
    const testText = 'クリアテスト用テキスト';

    // テキストエリアにテキストを入力
    const textarea = mainWindow.locator('#draft-textarea');
    await textarea.fill(testText);

    // テキストが入力されていることを確認
    await expect(textarea).toHaveValue(testText);

    // クリアボタンをクリック
    const clearBtn = mainWindow.locator('#clear-btn');
    await clearBtn.click();

    // テキストエリアが空になっていることを確認
    await expect(textarea).toHaveValue('');
  });

  test('CB-04: コピー後にウィンドウが非表示になる', async ({ electronApp, mainWindow }) => {
    const testText = 'コピー後非表示テスト';

    // ウィンドウを表示させる
    await electronApp.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows().find(w =>
        !w.isDestroyed() && w.webContents.getURL().includes('index.html')
      );
      if (win) {
        win.show();
      }
    });
    await mainWindow.waitForTimeout(100);

    // テキストエリアにテキストを入力
    const textarea = mainWindow.locator('#draft-textarea');
    await textarea.fill(testText);

    // ウィンドウが表示されていることを確認
    const isVisibleBefore = await electronApp.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows().find(w =>
        !w.isDestroyed() && w.webContents.getURL().includes('index.html')
      );
      return win?.isVisible() ?? false;
    });
    expect(isVisibleBefore).toBe(true);

    // コピーボタンをクリック
    const copyBtn = mainWindow.locator('#copy-btn');
    await copyBtn.click();

    // ウィンドウが非表示になるまでポーリングで確認
    await expect.poll(async () => {
      return await electronApp.evaluate(({ BrowserWindow }) => {
        const win = BrowserWindow.getAllWindows().find(w =>
          !w.isDestroyed() && w.webContents.getURL().includes('index.html')
        );
        return win?.isVisible() ?? false;
      });
    }, { timeout: 5000 }).toBe(false);
  });

  test('CB-05: 空テキスト時はコピーボタンでウィンドウ非表示にならない', async ({ electronApp, mainWindow }) => {
    // ウィンドウを表示させる
    await electronApp.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows().find(w =>
        !w.isDestroyed() && w.webContents.getURL().includes('index.html')
      );
      if (win) {
        win.show();
      }
    });
    await mainWindow.waitForTimeout(100);

    // テキストエリアを空にする
    const textarea = mainWindow.locator('#draft-textarea');
    await textarea.fill('');

    // コピーボタンをクリック
    const copyBtn = mainWindow.locator('#copy-btn');
    await copyBtn.click();

    // ウィンドウが表示されたままであることをポーリングで確認
    await expect.poll(async () => {
      return await electronApp.evaluate(({ BrowserWindow }) => {
        const win = BrowserWindow.getAllWindows().find(w =>
          !w.isDestroyed() && w.webContents.getURL().includes('index.html')
        );
        return win?.isVisible() ?? false;
      });
    }, { timeout: 5000 }).toBe(true);
  });
});
