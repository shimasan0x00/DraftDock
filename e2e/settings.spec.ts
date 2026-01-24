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
});
