# 開発環境セットアップ（Windows）

DraftDockの開発・動作確認手順。

## 前提条件

- Node.js 18以上
- Git
- Windows 10/11

## 初期セットアップ

### 1. リポジトリのクローン

```powershell
git clone https://github.com/shimasan0x00/DraftDock.git
cd DraftDock
```

### 2. 依存関係のインストール

```powershell
npm install
```

### 3. Playwrightブラウザのインストール（E2Eテスト用）

```powershell
npx playwright install
```

## ビルド・実行

### アプリのビルド

```powershell
npm run build
```

### アプリの起動

```powershell
npm run start
```

または開発モード:

```powershell
npm run dev
```

## テスト実行

### 単体テスト（Vitest）

```powershell
# 単体テスト実行
npm run test:unit

# ウォッチモード（ファイル変更時に自動再実行）
npm run test:unit:watch
```

### E2Eテスト（Playwright）

```powershell
# E2Eテスト実行（ヘッドレス）
npm run test:e2e

# E2Eテスト実行（ブラウザ表示）
npm run test:e2e:headed
```

### 全テスト実行

```powershell
npm run test
```

## テスト構成

### 単体テスト（28件）

| ファイル | 内容 |
|----------|------|
| `src/main/__tests__/hotkey.spec.ts` | ホットキー文字列正規化 |
| `src/main/__tests__/constants.spec.ts` | ウィンドウサイズ定数 |
| `src/main/__tests__/store.spec.ts` | デフォルト設定値 |

### E2Eテスト（18件 + 2スキップ）

| ファイル | 内容 |
|----------|------|
| `e2e/main-window.spec.ts` | ウィンドウサイズ・属性 |
| `e2e/clipboard.spec.ts` | コピー・クリア操作 |
| `e2e/keyboard.spec.ts` | Escape・Tab操作 |
| `e2e/settings.spec.ts` | 設定画面 |
| `e2e/persistence.spec.ts` | 永続化 |

## npm scripts一覧

| コマンド | 説明 |
|----------|------|
| `npm run build` | TypeScriptコンパイル + アセットコピー |
| `npm run start` | ビルド + アプリ起動 |
| `npm run dev` | ビルド + アプリ起動（開発用） |
| `npm run test` | 全テスト実行（単体 + E2E） |
| `npm run test:unit` | 単体テスト実行 |
| `npm run test:unit:watch` | 単体テスト（ウォッチモード） |
| `npm run test:e2e` | E2Eテスト実行 |
| `npm run test:e2e:headed` | E2Eテスト（ブラウザ表示） |
| `npm run pack` | インストーラなしでパッケージング |
| `npm run dist` | インストーラ付きでビルド |

## トラブルシューティング

### E2Eテストが失敗する

Playwrightブラウザが未インストールの可能性:

```powershell
npx playwright install
```

### ビルドエラー

node_modulesを削除して再インストール:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### テスト環境でのスキップ項目

以下のテストは環境依存のためスキップされる場合があります:

- `MW-05`: alwaysOnTop確認（WSL2/Linux環境の制限）
- `PS-02`: ウィンドウ位置復元（movedイベント発火問題）

Windows実機では正常に動作する可能性があります。

## Git Hooks

pre-pushフックでテストが自動実行されます:

1. 単体テスト
2. ビルド
3. E2Eテスト

緊急時は `--no-verify` でスキップ可能:

```powershell
git push --no-verify
```
