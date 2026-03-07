# DraftDock P0セキュリティ脆弱性修正計画

## Context

コードベースレビューにより、以下のセキュリティ上の問題が発見された。ユーザーの選択によりP0（即対応推奨）の3件を修正する。

- **S1**: npm依存パッケージの脆弱性（HIGH 7件, MODERATE 2件）
- **S2**: IPC通信のバリデーション不足（`save-settings`ハンドラ）
- **S3**: CSPの`unsafe-inline`許可

---

## 修正1: IPC通信のバリデーション強化（S2）

### 対象ファイル
- `src/main/main.ts` (行87-113)

### 問題
`save-settings`ハンドラで受信データの型・形式検証なし。不正なホットキー文字列がそのまま`store.setSettings()`に渡され保存される。

### 修正内容

`save-settings`ハンドラにバリデーションを追加:

```typescript
ipcMain.handle('save-settings', (_event, settings: unknown) => {
  // 型チェック
  if (
    typeof settings !== 'object' || settings === null ||
    typeof (settings as any).toggle !== 'string' ||
    typeof (settings as any).copy !== 'string' ||
    typeof (settings as any).clear !== 'string'
  ) {
    return { toggle: false, copy: false, clear: false };
  }

  const { toggle, copy, clear } = settings as { toggle: string; copy: string; clear: string };

  // 長さ制限（異常に長い文字列の防止）
  if (toggle.length > 50 || copy.length > 50 || clear.length > 50) {
    return { toggle: false, copy: false, clear: false };
  }

  // 空文字チェック
  if (toggle.length === 0 || copy.length === 0 || clear.length === 0) {
    return { toggle: false, copy: false, clear: false };
  }

  store.setSettings({
    hotkeys: { toggle, copy, clear },
  });
  // ... 以下既存のupdateHotkeys処理
});
```

同様に `save-draft` と `copy-to-clipboard` にも基本的な型チェックを追加:

```typescript
ipcMain.handle('save-draft', (_event, content: unknown) => {
  if (typeof content !== 'string') return false;
  if (content.length > 1_000_000) return false; // 1MB上限
  store.setDraft(content);
  return true;
});

ipcMain.handle('copy-to-clipboard', (_event, text: unknown) => {
  if (typeof text !== 'string') return false;
  if (text.length === 0 || text.length > 1_000_000) return false;
  clipboard.writeText(text);
  hideMainWindow();
  return true;
});
```

---

## 修正2: CSPから`unsafe-inline`を除去（S3）

### 対象ファイル
- `src/renderer/index.html` (行6-115)
- `src/renderer/settings.html` (行6-110)
- **新規**: `src/renderer/index.css`
- **新規**: `src/renderer/settings.css`
- `scripts/copy-assets.js` (CSSファイルのコピー追加が必要な場合)

### 問題
`style-src 'unsafe-inline'`によりインラインスタイルが許可されており、XSSリスクがある。

### 修正内容

1. **インラインスタイルを外部CSSファイルに抽出**
   - `index.html`の`<style>`ブロック → `src/renderer/index.css`
   - `settings.html`の`<style>`ブロック → `src/renderer/settings.css`

2. **HTMLからインラインスタイルを削除し、CSSリンクに置換**
   ```html
   <!-- index.html -->
   <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'">
   <link rel="stylesheet" href="index.css">
   ```
   ```html
   <!-- settings.html -->
   <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'">
   <link rel="stylesheet" href="settings.css">
   ```

3. **CSPの`font-src 'self'`追加**（index.htmlで@font-faceを使用しているため）

4. **ビルドスクリプト確認**: `scripts/copy-assets.js`がCSSファイルもdistにコピーすることを確認（HTMLと同ディレクトリなので対応不要の可能性が高いが要確認）

---

## 修正3: npm依存パッケージの脆弱性対応（S1）

### 対象ファイル
- `package.json`

### 問題
- Electron v28: ASAR Integrity Bypass脆弱性
- minimatch: ReDoS脆弱性（electron-builder依存）
- rollup: Path Traversal（vitest依存）
- tar: 複数脆弱性（electron-builder依存）

### 修正内容

1. **`npm audit`を実行して現状を確認**
2. **安全に更新可能なパッケージを特定**
   - `npm audit fix` で自動修正可能なものを適用
   - breaking changeが伴うものは個別に影響を確認
3. **Electronのメジャーバージョン更新はスコープ外**（破壊的変更のリスクが大きいため別タスクとする）
   - ただし、Electron 28系の最新パッチ（28.3.x）には更新
4. **更新後にビルド・テスト実行して動作確認**

> **注意**: Electronのメジャーバージョンアップ（v28→v32+）は影響範囲が大きいため、別タスクとして切り出すことを推奨。

---

## 実装順序

1. **修正2（CSP）** — 外部CSSファイル抽出 + CSP強化（独立した変更）
2. **修正1（IPCバリデーション）** — main.tsの修正（独立した変更）
3. **修正3（npm audit）** — 依存パッケージ更新（ビルド全体に影響）

---

## 検証方法

1. **ビルド確認**: `npm run build` が成功すること
2. **単体テスト**: `npm run test:unit` が全パスすること
3. **手動確認**:
   - `npm start` でアプリ起動、メインウィンドウ表示確認
   - テキスト入力 → コピー → クリアが正常動作
   - 設定画面でホットキー変更 → 即時反映
   - CSSが正しく適用されている（見た目が変わっていない）
4. **npm audit**: `npm audit` で HIGH脆弱性が減少していること
