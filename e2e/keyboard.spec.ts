import { test, expect } from './fixtures/electron.fixture';

test.describe('キーボード操作', () => {
  test('KB-01: Escapeキーでウィンドウ非表示', async ({ electronApp, mainWindow }) => {
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

    // ウィンドウが表示されていることを確認
    const isVisibleBefore = await electronApp.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows().find(w =>
        !w.isDestroyed() && w.webContents.getURL().includes('index.html')
      );
      return win?.isVisible() ?? false;
    });
    expect(isVisibleBefore).toBe(true);

    // Escapeキーを押す
    await mainWindow.keyboard.press('Escape');

    // 少し待ってからウィンドウが非表示になっていることを確認
    await mainWindow.waitForTimeout(200);

    const isVisibleAfter = await electronApp.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows().find(w =>
        !w.isDestroyed() && w.webContents.getURL().includes('index.html')
      );
      return win?.isVisible() ?? false;
    });
    expect(isVisibleAfter).toBe(false);
  });

  test('KB-02: Tabキーでタブ文字挿入', async ({ mainWindow }) => {
    const textarea = mainWindow.locator('#draft-textarea');

    // テキストを入力
    await textarea.fill('line1');

    // カーソル位置を確認してTabを押す
    await textarea.focus();
    await mainWindow.keyboard.press('Tab');

    // タブ文字が挿入されていることを確認
    const value = await textarea.inputValue();
    expect(value).toContain('\t');
  });

  test('KB-03: Tabキーでカーソル位置にタブ挿入', async ({ mainWindow }) => {
    const textarea = mainWindow.locator('#draft-textarea');

    // テキストを入力
    await textarea.fill('beforeafter');

    // カーソルを「before」と「after」の間に移動
    await textarea.focus();
    // 先頭から6文字目（beforeの後）にカーソルを移動
    await mainWindow.evaluate(() => {
      const el = document.getElementById('draft-textarea') as HTMLTextAreaElement;
      el.setSelectionRange(6, 6);
    });

    // Tabを押す
    await mainWindow.keyboard.press('Tab');

    // 「before」と「after」の間にタブが挿入されていることを確認
    const value = await textarea.inputValue();
    expect(value).toBe('before\tafter');
  });
});
