# DraftDock

AI/チャットツールの誤送信を防ぐための常駐型下書きアプリケーション。

## 対応OS

- Windows (x64)
- macOS (Intel x64)

## ダウンロード

[Releases](https://github.com/shimasan0x00/DraftDock/releases) からダウンロードできます。

| OS | ファイル |
|----|---------|
| Windows | `.exe`（NSISインストーラー） |
| macOS (Intel) | `.dmg` または `.zip` |

## 概要

<p align="center">
  <img src=".readme/draftdock.png" alt="DraftDock メイン画面" width="600">
</p>

- **ホットキーで即呼び出し** - どんなアプリを使っていても `Ctrl+Shift+D` で下書きウィンドウを表示
- **ワンアクションでコピー** - `Ctrl+Enter` でクリップボードにコピーしてウィンドウを閉じる
- **ワンアクションでクリア** - `Ctrl+Shift+L` で下書きをクリア
- **下書きが消えない** - ウィンドウを閉じてもアプリを再起動しても下書きが復元される

<p align="center">
  <img src=".readme/settings.png" alt="DraftDock 設定画面" width="450">
</p>

## 機能

| 機能 | 説明 |
|------|------|
| トレイ常駐 | システムトレイに常駐し、いつでも呼び出し可能 |
| ホットキー | 起動キー・コピーキーをカスタマイズ可能 |
| 永続化 | 下書きとウィンドウ位置を自動保存 |
| 最前面表示 | 他のウィンドウより常に前面に表示 |

## デフォルトキー

| 操作 | キー |
|------|------|
| 表示/非表示 | `Ctrl+Shift+D` |
| コピー&閉じる | `Ctrl+Enter` |
| クリア | `Ctrl+Shift+L` |
| 閉じる | `Escape` |

> **Note**: macOSでも現在はCtrl系のキーバインドです。設定画面からカスタマイズ可能です。

すべてのホットキーは設定画面（トレイアイコン → 設定）からカスタマイズ可能です。

## インストール

### macOS

DraftDockはad-hoc署名のため、初回起動時にGatekeeperの警告が表示されます。以下のコマンドで回避できます:

```bash
xattr -cr /Applications/DraftDock.app
```

### 開発環境

```bash
# リポジトリをクローン
git clone https://github.com/shimasan0x00/DraftDock.git
cd DraftDock

# 依存関係をインストール
npm install

# ビルド & 起動
npm start
```

### Windows環境セットアップ

詳細は [docs/windows-setup-guide.md](docs/windows-setup-guide.md) を参照。

## 開発

### Git Hooks セットアップ

```bash
chmod +x ./scripts/setup-githooks.sh
./scripts/setup-githooks.sh
```

### コマンド

| コマンド | 説明 |
|---------|------|
| `npm run build` | TypeScriptをコンパイル |
| `npm start` | ビルド & アプリ起動 |
| `npm test` | 全テスト実行（単体 + E2E） |
| `npm run test:unit` | 単体テスト（Vitest） |
| `npm run test:e2e` | E2Eテスト（Playwright） |
| `npm run pack` | パッケージング（ディレクトリ） |
| `npm run dist` | インストーラー作成 |

### ディレクトリ構造

```
src/
├── main/           # メインプロセス
│   ├── main.ts     # エントリポイント
│   ├── tray.ts     # トレイ制御
│   ├── hotkey.ts   # グローバルホットキー
│   ├── window.ts   # ウィンドウ管理
│   ├── store.ts    # 永続化
│   ├── menu.ts     # アプリケーションメニュー
│   └── __tests__/  # 単体テスト
├── preload/
│   └── preload.ts  # contextBridge API
└── renderer/
    ├── index.html  # メインウィンドウ
    ├── index.ts
    ├── settings.html # 設定画面
    └── settings.ts
e2e/                # E2Eテスト（Playwright）
assets/
├── fonts/          # Bizin Gothic（日本語対応等幅フォント）
└── *.ico, *.png    # アイコン
```

### データ保存場所

```
# Windows
%APPDATA%\draftdock\
├── settings.json   # 設定（ホットキー、ウィンドウ位置）
└── draft.json      # 下書き

# macOS
~/Library/Application Support/draftdock/
├── settings.json   # 設定（ホットキー、ウィンドウ位置）
└── draft.json      # 下書き
```

## 技術スタック

- **Electron** - クロスプラットフォームデスクトップアプリ
- **TypeScript** - 型安全な開発
- **electron-store** - 設定・データの永続化

## ドキュメント

- [仕様書](plan/spec.md)
- [Windows環境セットアップ・検証ガイド](docs/windows-setup-guide.md)

## ライセンス

MIT
