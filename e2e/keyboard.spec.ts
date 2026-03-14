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

  test('KB-04: IME変換中のTabキーでタブ文字が挿入されない', async ({ mainWindow }) => {
    const textarea = mainWindow.locator('#draft-textarea');
    await textarea.fill('test');
    await textarea.focus();

    // IME変換中のTabキー押下をシミュレート
    const value = await mainWindow.evaluate(() => {
      const el = document.getElementById('draft-textarea') as HTMLTextAreaElement;

      el.dispatchEvent(new CompositionEvent('compositionstart', { data: '' }));

      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, 'isComposing', { value: true });
      el.dispatchEvent(event);

      el.dispatchEvent(new CompositionEvent('compositionend', { data: '' }));

      return el.value;
    });

    expect(value).toBe('test');
    expect(value).not.toContain('\t');
  });

  test('KB-05: IME変換中のEscapeキーでウィンドウが非表示にならない', async ({ electronApp, mainWindow }) => {
    // ウィンドウを表示させる
    await electronApp.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows().find(w =>
        !w.isDestroyed() && w.webContents.getURL().includes('index.html')
      );
      if (win) win.show();
    });
    await mainWindow.waitForTimeout(100);

    // IME変換中のEscapeキー押下をシミュレート
    await mainWindow.evaluate(() => {
      const el = document.getElementById('draft-textarea') as HTMLTextAreaElement;

      el.dispatchEvent(new CompositionEvent('compositionstart', { data: '' }));

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, 'isComposing', { value: true });
      document.dispatchEvent(event);

      el.dispatchEvent(new CompositionEvent('compositionend', { data: '' }));
    });

    await mainWindow.waitForTimeout(200);

    // ウィンドウが表示中のままであることを確認
    const isVisible = await electronApp.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows().find(w =>
        !w.isDestroyed() && w.webContents.getURL().includes('index.html')
      );
      return win?.isVisible() ?? false;
    });
    expect(isVisible).toBe(true);
  });
});
