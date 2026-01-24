import { test, expect } from './fixtures/electron.fixture';

test.describe('メインウィンドウ', () => {
  test('MW-01: アプリが起動する', async ({ electronApp, mainWindow }) => {
    // アプリが正常に起動していることを確認
    expect(electronApp).toBeDefined();
    // mainWindowがロードされていることを確認
    expect(mainWindow).toBeDefined();
    const url = mainWindow.url();
    expect(url).toContain('index.html');
  });

  test('MW-02: ウィンドウサイズが500x400', async ({ electronApp, mainWindow }) => {
    // メインウィンドウのサイズを取得
    const windowSize = await electronApp.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows().find(w => !w.isDestroyed() && w.webContents.getURL().includes('index.html'));
      if (win) {
        const [width, height] = win.getSize();
        return { width, height };
      }
      return null;
    });

    expect(windowSize).not.toBeNull();
    expect(windowSize!.width).toBe(500);
    expect(windowSize!.height).toBe(400);
  });

  test('MW-03: 最小サイズが350x250', async ({ electronApp, mainWindow }) => {
    // mainWindowがロードされた状態で最小サイズを取得
    const minSize = await electronApp.evaluate(({ BrowserWindow }) => {
      const windows = BrowserWindow.getAllWindows();
      // 最初のウィンドウ（メインウィンドウ）を使用
      const win = windows.find(w => !w.isDestroyed());
      if (win) {
        return win.getMinimumSize();
      }
      return null;
    });

    expect(minSize).not.toBeNull();
    expect(minSize![0]).toBe(350); // minWidth
    expect(minSize![1]).toBe(250); // minHeight
  });

  test('MW-04: テキストエリアにフォーカスが当たる', async ({ mainWindow }) => {
    // ウィンドウ表示後にテキストエリアにフォーカスが当たっていることを確認
    const textarea = mainWindow.locator('#draft-textarea');
    await expect(textarea).toBeVisible();

    // テキストエリアがフォーカスされているか確認
    const isFocused = await mainWindow.evaluate(() => {
      const el = document.getElementById('draft-textarea');
      return document.activeElement === el;
    });
    expect(isFocused).toBe(true);
  });
});
