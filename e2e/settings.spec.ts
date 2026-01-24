import { test, expect } from './fixtures/electron.fixture';

test.describe('設定画面', () => {
  test('SW-01: 設定画面が開く', async ({ electronApp, mainWindow }) => {
    // preload API経由で設定ウィンドウを開く
    await mainWindow.evaluate(() => {
      return (window as any).draftdock.openSettings();
    });

    // 設定ウィンドウが開くのを待つ
    await mainWindow.waitForTimeout(500);

    // 設定ウィンドウが存在することを確認
    const hasSettingsWindow = await electronApp.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows().find(w =>
        !w.isDestroyed() && w.webContents.getURL().includes('settings.html')
      );
      return !!win;
    });
    expect(hasSettingsWindow).toBe(true);
  });

  test('SW-02: 設定画面サイズ350x300', async ({ electronApp, mainWindow }) => {
    // preload API経由で設定ウィンドウを開く
    await mainWindow.evaluate(() => {
      return (window as any).draftdock.openSettings();
    });

    await mainWindow.waitForTimeout(500);

    // 設定ウィンドウのサイズを確認
    const windowSize = await electronApp.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows().find(w =>
        !w.isDestroyed() && w.webContents.getURL().includes('settings.html')
      );
      if (win) {
        const [width, height] = win.getSize();
        return { width, height };
      }
      return null;
    });

    expect(windowSize).not.toBeNull();
    expect(windowSize!.width).toBe(350);
    expect(windowSize!.height).toBe(300);
  });

  test('SW-03: 設定画面にデフォルト値が表示される', async ({ electronApp, mainWindow }) => {
    // preload API経由で設定ウィンドウを開く
    await mainWindow.evaluate(() => {
      return (window as any).draftdock.openSettings();
    });

    await mainWindow.waitForTimeout(500);

    // 設定ウィンドウを取得
    const settingsWindow = await electronApp.firstWindow();
    const allPages = electronApp.windows();
    const settingsPage = allPages.find(p => p.url().includes('settings.html'));

    if (settingsPage) {
      // 各ホットキーフィールドにデフォルト値が表示されていることを確認
      const toggleHotkey = settingsPage.locator('#toggle-hotkey');
      const copyHotkey = settingsPage.locator('#copy-hotkey');
      const clearHotkey = settingsPage.locator('#clear-hotkey');

      await expect(toggleHotkey).toHaveValue('Ctrl+Shift+D');
      await expect(copyHotkey).toHaveValue('Ctrl+Enter');
      await expect(clearHotkey).toHaveValue('Ctrl+Shift+L');
    }
  });

  test('SW-04: キャンセルボタンで設定画面が閉じる', async ({ electronApp, mainWindow }) => {
    // preload API経由で設定ウィンドウを開く
    await mainWindow.evaluate(() => {
      return (window as any).draftdock.openSettings();
    });

    await mainWindow.waitForTimeout(500);

    // 設定ウィンドウが開いていることを確認
    let hasSettingsWindow = await electronApp.evaluate(({ BrowserWindow }) => {
      return BrowserWindow.getAllWindows().some(w =>
        !w.isDestroyed() && w.webContents.getURL().includes('settings.html')
      );
    });
    expect(hasSettingsWindow).toBe(true);

    // 設定ウィンドウを取得してキャンセルボタンをクリック
    const allPages = electronApp.windows();
    const settingsPage = allPages.find(p => p.url().includes('settings.html'));

    if (settingsPage) {
      const cancelBtn = settingsPage.locator('#cancel-btn');
      await cancelBtn.click();
    }

    await mainWindow.waitForTimeout(300);

    // 設定ウィンドウが閉じていることを確認
    hasSettingsWindow = await electronApp.evaluate(({ BrowserWindow }) => {
      return BrowserWindow.getAllWindows().some(w =>
        !w.isDestroyed() && w.webContents.getURL().includes('settings.html')
      );
    });
    expect(hasSettingsWindow).toBe(false);
  });
});
