# Windows環境セットアップ・検証ガイド

このドキュメントでは、Windows環境でDraftDockを開発・検証するための環境構築手順を説明します。

---

## 1. 前提条件

- Windows 10 / 11
- 管理者権限でのインストールが可能であること（シンボリックリンク作成に必要）
- インターネット接続

---

## 2. 開発環境のセットアップ

### 2.1 nvm-windows のインストール

nvm-windows は Windows 向けの Node.js バージョン管理ツールです。Microsoft、npm、Googleから公式に推奨されています。

#### 重要: 既存のNode.jsを削除

**nvm-windowsをインストールする前に、既存のNode.jsを完全に削除する必要があります。** 既存インストールとの競合により `nvm use` コマンドが正常に動作しなくなる可能性があります。

1. コントロールパネル → プログラムのアンインストール → Node.js をアンインストール
2. 以下のディレクトリを手動で削除（存在する場合）:
   - `C:\Program Files\nodejs`
   - `C:\Program Files (x86)\nodejs`
   - `%AppData%\npm`
   - `%AppData%\npm-cache`
3. `%UserProfile%\.npmrc` がある場合はバックアップを取っておく

#### ダウンロード

1. [nvm-windows Releases](https://github.com/coreybutler/nvm-windows/releases) にアクセス
2. 最新版（現在 **v1.2.2**）の `nvm-setup.exe` をダウンロード

#### インストール

1. ダウンロードした `nvm-setup.exe` を**管理者として実行**
2. インストールウィザードに従って進める
   - インストール先: デフォルト (`C:\Users\<ユーザー名>\AppData\Roaming\nvm`)
   - Node.js シンボリックリンク先: デフォルト (`C:\Program Files\nodejs`)
3. インストール完了後、**新しいコマンドプロンプトまたはPowerShellを開く**（環境変数を反映するため）

#### インストール確認

```powershell
nvm version
```

`1.2.2` などのバージョン番号が表示されれば成功です。

#### nvm-windows 主要コマンド

| コマンド | 機能 |
|---------|------|
| `nvm install latest` | 最新版をインストール |
| `nvm install lts` | 最新LTS版をインストール |
| `nvm install <version>` | 特定バージョンをインストール（例: `nvm install 20`） |
| `nvm list` | インストール済みバージョン一覧 |
| `nvm list available` | インストール可能なバージョン一覧 |
| `nvm use <version>` | 使用するバージョンを切り替え |
| `nvm current` | 現在使用中のバージョンを表示 |

### 2.2 Node.js のインストール

```powershell
# 利用可能なバージョンを確認
nvm list available

# Node.js LTS版をインストール（現在の最新LTSは v24.13.0）
nvm install lts

# または特定バージョンを指定
nvm install 24

# インストールしたバージョンを使用（管理者権限が必要）
nvm use 24

# 確認
node -v
npm -v
```

> **注意**: `nvm use` コマンドは管理者権限が必要です。PowerShellを「管理者として実行」してください。

> **注意**: 各Node.jsバージョンのグローバルnpmモジュールは共有されません。バージョン切り替え後、必要なグローバルツールは再インストールが必要です。

### 2.3 Git のインストール

#### ダウンロード

1. [Git for Windows 公式サイト](https://gitforwindows.org/) にアクセス
2. 「Download」ボタンをクリック（現在の最新版は **v2.52.0**）

または [GitHub Releases](https://github.com/git-for-windows/git/releases/latest) から直接ダウンロード

#### インストール

1. ダウンロードしたインストーラーを実行
2. インストールウィザードに従って進める
   - 基本的にデフォルト設定でOK
   - 「Adjusting your PATH environment」では **「Git from the command line and also from 3rd-party software」** を選択（推奨）

#### Git for Windows の主な機能

- **Git BASH**: Linux/UNIX互換のコマンドライン環境
- **Git GUI**: グラフィカルインターフェース
- **Shell Integration**: エクスプローラーの右クリックメニューからGitにアクセス
- **Git Credential Manager**: GitHub等への安全な認証

#### インストール確認

```powershell
git --version
```

`git version 2.52.0.windows.1` などと表示されれば成功です。

---

## 3. DraftDock のセットアップ

### 3.1 リポジトリのクローン

```powershell
# 任意のディレクトリに移動（例: ユーザーフォルダ直下にprojectsを作成）
mkdir ~\projects
cd ~\projects

# リポジトリをクローン
git clone https://github.com/shimasan0x00/DraftDock.git

# ディレクトリに移動
cd DraftDock
```

### 3.2 ブランチの切り替え（検証時）

```powershell
# feature ブランチに切り替え
git checkout feature/initial-implementation
```

### 3.3 依存関係のインストール

```powershell
npm install
```

### 3.4 ビルド

```powershell
npm run build
```

成功すると以下のように表示されます:

```
> draftdock@0.1.0 build
> tsc && npm run copy-assets

Copied: src/renderer/index.html -> dist/renderer/index.html
Copied: src/renderer/settings.html -> dist/renderer/settings.html
Assets copied successfully!
```

---

## 4. アプリの起動

```powershell
npm start
```

アプリが起動し、タスクバーのシステムトレイ（右下）にDraftDockのアイコンが表示されます。

---

## 5. 検証項目チェックリスト

### 5.1 基本動作

| # | 検証項目 | 手順 | 期待結果 | 結果 |
|---|----------|------|----------|------|
| 1 | ビルド成功 | `npm run build` を実行 | エラーなく完了 | [X] |
| 2 | アプリ起動 | `npm start` を実行 | アプリが起動する | [X] |
| 3 | トレイアイコン表示 | タスクバー右下を確認 | アイコンが表示される | [X] |

### 5.2 ウィンドウ操作

| # | 検証項目 | 手順 | 期待結果 | 結果 |
|---|----------|------|----------|------|
| 4 | ウィンドウ表示 | `Ctrl+Shift+D` を押す | ウィンドウが表示される | [X] |
| 5 | フォーカス | ウィンドウ表示時 | テキストエリアにフォーカスが当たる | [X] |
| 6 | ウィンドウ非表示 | 再度 `Ctrl+Shift+D` を押す | ウィンドウが非表示になる | [X] |
| 7 | Escapeで非表示 | ウィンドウ表示中に `Escape` を押す | ウィンドウが非表示になる | [X] |
| 8 | 最前面表示 | 他のウィンドウをクリック後、再度表示 | 常に最前面に表示される | [X] |

### 5.3 テキスト入力・コピー

| # | 検証項目 | 手順 | 期待結果 | 結果 |
|---|----------|------|----------|------|
| 9 | テキスト入力 | ウィンドウにテキストを入力 | 入力できる | [X] |
| 10 | Tab入力 | `Tab` キーを押す | タブ文字が挿入される | [X] |
| 11 | コピー&閉じる | テキスト入力後 `Ctrl+Enter` | クリップボードにコピーされ、ウィンドウが閉じる | [X] |
| 12 | 貼り付け確認 | メモ帳で `Ctrl+V` | 入力したテキストが貼り付けられる | [X] |
| 13 | 空テキスト時 | テキストを空にして `Ctrl+Enter` | 何も起きない（ウィンドウも閉じない） | [X] |
| 14 | クリアボタン | 「クリア」ボタンをクリック | テキストエリアが空になる | [X] |

### 5.4 永続化

| # | 検証項目 | 手順 | 期待結果 | 結果 |
|---|----------|------|----------|------|
| 15 | 下書き保存 | テキスト入力→ウィンドウを閉じる→再表示 | 入力したテキストが残っている | [X] |
| 16 | 再起動後復元 | アプリを終了→再起動 | 下書きが復元される | [X] |
| 17 | ウィンドウ位置保存 | ウィンドウを移動→再起動 | 前回の位置に表示される | [X] |

### 5.5 設定

| # | 検証項目 | 手順 | 期待結果 | 結果 |
|---|----------|------|----------|------|
| 18 | 設定画面表示 | トレイアイコン右クリック→「設定」 | 設定画面が表示される | [X] |
| 19 | ホットキー変更 | 起動キーを `Ctrl+Shift+Q` に変更→保存 | 新しいキーで動作する | [X] |
| 20 | コピーキー変更 | コピーキーを `Ctrl+Shift+C` に変更→保存 | 新しいキーで動作する | [X] |

### 5.6 トレイメニュー

| # | 検証項目 | 手順 | 期待結果 | 結果 |
|---|----------|------|----------|------|
| 21 | 「開く」メニュー | トレイアイコン右クリック→「開く」 | ウィンドウが表示される | [X] |
| 22 | 「終了」メニュー | トレイアイコン右クリック→「終了」 | アプリが終了する | [X] |

### 5.7 二重起動防止

| # | 検証項目 | 手順 | 期待結果 | 結果 |
|---|----------|------|----------|------|
| 23 | 二重起動防止 | アプリ起動中に再度 `npm start` | 新しいインスタンスは起動せず、既存ウィンドウが表示される | [X] |

---

## 6. トラブルシューティング

### 6.1 nvm が認識されない

**症状**: `nvm` コマンドが見つからない

**対処法**:
1. **新しい**コマンドプロンプト/PowerShellを開く（環境変数の反映）
2. それでも認識されない場合は、環境変数を確認:
   - `NVM_HOME`: `C:\Users\<ユーザー名>\AppData\Roaming\nvm`
   - `NVM_SYMLINK`: `C:\Program Files\nodejs`
   - `PATH` に上記2つが含まれていること

### 6.2 nvm use でエラー

**症状**: `nvm use` が動作しない、または `exit status 1` エラー

**原因**: 既存のNode.jsインストールとの競合、または管理者権限不足

**対処法**:
1. 既存のNode.jsを完全にアンインストール（セクション2.1参照）
2. PowerShellを**管理者として実行**して `nvm use` を再実行

### 6.3 npm install でエラー

**症状**: 権限エラーや EACCES エラー

**対処法**:
```powershell
# 管理者として PowerShell を実行
# npm キャッシュをクリア
npm cache clean --force

# 再度インストール
npm install
```

### 6.4 ホットキーが効かない

**症状**: `Ctrl+Shift+D` を押してもウィンドウが表示されない

**原因**: 他のアプリケーションが同じホットキーを使用している

**対処法**:
1. トレイアイコンを右クリック→「設定」を開く
2. 別のホットキー（例: `Ctrl+Alt+D`）に変更
3. 「保存」をクリック

### 6.5 トレイアイコンが表示されない

**症状**: システムトレイにアイコンが見えない

**対処法**:
1. タスクバーの「^」（隠れたアイコンを表示）をクリック
2. DraftDockのアイコンがあれば、タスクバーにドラッグして固定

Windows 11の場合:
1. 設定 → 個人用設定 → タスクバー → その他のシステムトレイアイコン
2. DraftDockをオンにする

### 6.6 アプリが起動しない

**症状**: `npm start` でエラーが発生

**対処法**:
```powershell
# dist フォルダを削除して再ビルド
Remove-Item -Recurse -Force dist
npm run build
npm start
```

---

## 7. 開発者向け情報

### 7.1 ディレクトリ構造

```
DraftDock/
├── src/
│   ├── main/           # メインプロセス
│   │   ├── main.ts     # エントリポイント
│   │   ├── tray.ts     # トレイ制御
│   │   ├── hotkey.ts   # ホットキー
│   │   ├── window.ts   # ウィンドウ管理
│   │   ├── store.ts    # 永続化
│   │   ├── menu.ts     # アプリケーションメニュー
│   │   └── __tests__/  # 単体テスト
│   ├── preload/
│   │   └── preload.ts  # contextBridge API
│   └── renderer/
│       ├── index.html  # メインウィンドウ
│       ├── index.ts
│       ├── settings.html # 設定画面
│       └── settings.ts
├── assets/
│   ├── fonts/          # Bizin Gothic（日本語対応等幅フォント）
│   ├── draft_pad.ico   # Windowsアイコン
│   ├── draft_pad_16.png  # トレイアイコン
│   └── draft_pad_256.png # ウィンドウアイコン
├── e2e/                # E2Eテスト（Playwright）
├── dist/               # ビルド出力（gitignore）
├── package.json
└── tsconfig.json
```

### 7.2 データ保存場所

設定と下書きは以下の場所に保存されます:

```
%APPDATA%\draftdock\
├── settings.json   # 設定（ホットキー、ウィンドウ位置）
└── draft.json      # 下書き
```

PowerShellで確認:
```powershell
explorer $env:APPDATA\draftdock
```

### 7.3 開発用コマンド

```powershell
# ビルドのみ
npm run build

# ビルド＆起動
npm start

# パッケージング（インストーラー作成）
npm run dist
```

### 7.4 テスト実行

#### Playwrightブラウザのインストール（初回のみ）

```powershell
npx playwright install
```

#### 単体テスト（Vitest）

```powershell
# 単体テスト実行
npm run test:unit

# ウォッチモード（ファイル変更時に自動再実行）
npm run test:unit:watch
```

#### E2Eテスト（Playwright）

```powershell
# E2Eテスト実行（ヘッドレス）
npm run test:e2e

# E2Eテスト実行（ブラウザ表示）
npm run test:e2e:headed
```

#### 全テスト実行

```powershell
npm run test
```

### 7.5 テスト構成

#### 単体テスト（28件）

| ファイル | 内容 |
|----------|------|
| `src/main/__tests__/hotkey.spec.ts` | ホットキー文字列正規化 |
| `src/main/__tests__/constants.spec.ts` | ウィンドウサイズ定数 |
| `src/main/__tests__/store.spec.ts` | デフォルト設定値 |

#### E2Eテスト（18件 + 2スキップ）

| ファイル | 内容 |
|----------|------|
| `e2e/main-window.spec.ts` | ウィンドウサイズ・属性 |
| `e2e/clipboard.spec.ts` | コピー・クリア操作 |
| `e2e/keyboard.spec.ts` | Escape・Tab操作 |
| `e2e/settings.spec.ts` | 設定画面 |
| `e2e/persistence.spec.ts` | 永続化 |

### 7.6 npm scripts一覧

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

### 7.7 Git Hooks

pre-pushフックでテストが自動実行されます：

1. 単体テスト
2. ビルド
3. E2Eテスト

緊急時は `--no-verify` でスキップ可能：

```powershell
git push --no-verify
```

---

## 8. 参考リンク

- [nvm-windows GitHub](https://github.com/coreybutler/nvm-windows) - Node.jsバージョン管理ツール（v1.2.2）
- [Git for Windows](https://gitforwindows.org/) - Windows向けGit（v2.52.0）
- [Node.js 公式サイト](https://nodejs.org/) - Node.js（LTS v24.13.0）
- [Electron ドキュメント](https://www.electronjs.org/docs) - Electronフレームワーク
