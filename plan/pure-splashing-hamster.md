# DraftDock 単体テスト・Git Hooks整備計画

## 概要
Vitestによる単体テストを導入し、pre-pushフックでテスト自動実行を整備する。

---

## 1. 単体テストフレームワーク選定

### Vitest を採用
- TypeScript対応が優秀（設定不要）
- ESMネイティブ対応
- Jestより高速
- 設定が簡潔

---

## 2. テスト対象の分析

### 2.1 純粋関数（テスト容易）

| モジュール | 関数 | 概要 |
|-----------|------|------|
| `hotkey.ts` | `normalizeAccelerator` | キー文字列の正規化 |

### 2.2 定数・デフォルト値（静的検証）

| モジュール | 対象 | 検証内容 |
|-----------|------|---------|
| `store.ts` | `DEFAULT_SETTINGS` | ホットキーデフォルト値 |
| `window.ts` | 定数 | ウィンドウサイズ |
| `index.ts` | `DEBOUNCE_MS` | デバウンス間隔 |

### 2.3 Electron依存（モック必要）

| モジュール | 概要 | 方針 |
|-----------|------|------|
| `store.ts` | electron-store使用 | electron-storeをモック |
| `window.ts` | BrowserWindow使用 | E2Eでカバー |
| `hotkey.ts` | globalShortcut使用 | 純粋関数のみ単体テスト |
| `tray.ts` | Tray使用 | E2Eでカバー |

---

## 3. 単体テストケース

### 3.1 hotkey.spec.ts

| ID | テスト内容 |
|----|----------|
| HK-01 | `Ctrl+Shift+D` → `CommandOrControl+Shift+D` |
| HK-02 | `ctrl+enter` → `CommandOrControl+Return` |
| HK-03 | `Alt+Space` → `Alt+Space` |
| HK-04 | 大文字小文字の正規化 |

### 3.2 store.spec.ts

| ID | テスト内容 |
|----|----------|
| ST-01 | デフォルトホットキー値の検証 |
| ST-02 | デフォルトウィンドウサイズの検証 |
| ST-03 | 設定の保存・読み込み（モック使用） |
| ST-04 | 下書きの保存・読み込み（モック使用） |

### 3.3 constants.spec.ts

| ID | テスト内容 |
|----|----------|
| CN-01 | ウィンドウサイズ定数の検証 |
| CN-02 | デバウンス値の検証 |

---

## 4. ディレクトリ構成

```
src/
├── main/
│   ├── __tests__/
│   │   ├── hotkey.spec.ts
│   │   ├── store.spec.ts
│   │   └── constants.spec.ts
│   └── ...
├── renderer/
│   └── __tests__/
│       └── debounce.spec.ts
vitest.config.ts
```

---

## 5. 実装順序

### Phase 1: 環境構築
1. `npm install -D vitest`
2. `vitest.config.ts` 作成
3. `package.json` scripts追加

### Phase 2: 純粋関数テスト
4. `hotkey.ts`から`normalizeAccelerator`をexport
5. `src/main/__tests__/hotkey.spec.ts` 作成

### Phase 3: 定数・デフォルト値テスト
6. `src/main/__tests__/constants.spec.ts` 作成
7. `src/main/__tests__/store.spec.ts` 作成

### Phase 4: Git Hooks整備
8. `.githooks/pre-push` 更新（テスト実行追加）
9. テスト用npm script整理

---

## 6. package.json scripts

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:e2e",
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "pretest:e2e": "npm run build"
  }
}
```

---

## 7. Git Hooks更新

### .githooks/pre-push（追加内容）

```bash
# === テスト実行 ===
echo "Running tests before push..."

# 単体テスト
npm run test:unit
if [[ $? -ne 0 ]]; then
  echo "ERROR: Unit tests failed. Push aborted."
  exit 1
fi

# ビルド
npm run build
if [[ $? -ne 0 ]]; then
  echo "ERROR: Build failed. Push aborted."
  exit 1
fi

# E2Eテスト
npm run test:e2e
if [[ $? -ne 0 ]]; then
  echo "ERROR: E2E tests failed. Push aborted."
  exit 1
fi

echo "All tests passed!"
```

---

## 8. 変更対象ファイル

| ファイル | 変更内容 |
|----------|----------|
| `package.json` | vitest追加、scripts整理 |
| `vitest.config.ts` | **新規** |
| `src/main/hotkey.ts` | `normalizeAccelerator`をexport |
| `src/main/__tests__/hotkey.spec.ts` | **新規** |
| `src/main/__tests__/constants.spec.ts` | **新規** |
| `src/main/__tests__/store.spec.ts` | **新規** |
| `.githooks/pre-push` | テスト実行追加 |

---

## 9. 検証方法

```bash
# 単体テスト実行
npm run test:unit

# 全テスト実行
npm run test

# ウォッチモード（開発中）
npm run test:unit:watch
```

---

## 10. 制約・注意事項

- Electron依存モジュールはモックが複雑なため、E2Eでカバー
- pre-pushでテスト実行するため、push時間が増加
- WSL2環境でもE2Eテスト実行可能（確認済み）
- `--no-verify`でスキップ可能（緊急時のみ）
