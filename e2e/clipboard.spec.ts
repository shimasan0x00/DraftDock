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
});
