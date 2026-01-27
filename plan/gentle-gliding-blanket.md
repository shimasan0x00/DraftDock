# Mac版リリース対応 実装計画

## 概要

DraftDockをmacOSでもリリースできるようにGitHub ActionsワークフローとElectron Builder設定を更新する。

## 現状

- **コードベース**: プラットフォーム非依存（CommandOrControl対応済み、Tray/Store両OS対応）
- **ビルド設定**: Windows限定（`runs-on: windows-latest`、`release/*.exe`のみ）
- **Mac設定**: package.jsonに最小限の`mac.target: dmg`のみ
- **トレイ実装**: ElectronのTray APIで両OS対応済み（macOSではメニューバーに表示）

## 変更方針

- コードサイニング・Notarization: **なし**（Gatekeeper警告は手動許可で対応）
- ビルド形式: DMG + ZIP（zipはGatekeeper回避が容易）

---

## 実装手順

### 1. package.json - Mac向けビルド設定の拡充

**ファイル**: `package.json`

**変更内容**:
```json
"mac": {
  "target": ["dmg", "zip"],
  "icon": "assets/draft_pad_256.png",
  "category": "public.app-category.utilities"
}
```

- `target`: DMGに加えZIPも生成（展開して使用可能）
- `icon`: 既存のPNGを使用（electron-builderが自動変換）
- `category`: Mac App Storeカテゴリ指定

### 2. GitHub Actions - マルチプラットフォーム対応

**ファイル**: `.github/workflows/release.yml`

**変更内容**:

#### 2-1. ジョブをWindows/Macで分離

```yaml
jobs:
  build-windows:
    runs-on: windows-latest
    # ... Windows用ビルド

  build-macos:
    runs-on: macos-latest
    # ... macOS用ビルド

  release:
    needs: [build-windows, build-macos]
    # ... 統合リリース作成
```

#### 2-2. アーティファクトのアップロード/ダウンロード

- 各ビルドジョブで`actions/upload-artifact`を使用
- releaseジョブで`actions/download-artifact`で統合

#### 2-3. リリースファイルの拡張

```yaml
files: |
  release/*.exe
  release/*.dmg
  release/*.zip
```

### 3. ワークフロー詳細設計

```yaml
jobs:
  # バージョン判定（1回のみ、Linux runnerで高速化）
  prepare:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
      bumped: ${{ steps.version.outputs.bumped }}
    steps:
      - checkout, version判定ロジック

  # Windowsビルド
  build-windows:
    needs: prepare
    runs-on: windows-latest
    steps:
      - checkout
      - npm ci
      - npm run dist（--win）
      - upload-artifact（*.exe）

  # macOSビルド
  build-macos:
    needs: prepare
    runs-on: macos-latest
    steps:
      - checkout
      - npm ci
      - npm run dist（--mac）
      - upload-artifact（*.dmg, *.zip）

  # リリース作成
  release:
    needs: [prepare, build-windows, build-macos]
    runs-on: ubuntu-latest
    steps:
      - checkout
      - バージョン更新（bumped時）
      - download-artifact（両OS分）
      - タグ作成
      - GitHub Release作成（全ファイル添付）
```

---

## 変更対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `package.json` | mac設定の拡充（target, icon, category） |
| `.github/workflows/release.yml` | マルチプラットフォームジョブ構成 |

---

## 検証方法

1. **ローカルテスト**（任意）
   - `npm run dist` でビルドエラーがないことを確認

2. **CI動作確認**
   - featureブランチでワークフローをテスト実行（`workflow_dispatch`追加）
   - または直接mainにマージしてリリース動作を確認

3. **リリース成果物確認**
   - GitHub Releaseに以下が含まれること:
     - `DraftDock-x.x.x-Setup.exe`（Windows）
     - `DraftDock-x.x.x.dmg`（Mac）
     - `DraftDock-x.x.x-mac.zip`（Mac）

4. **Mac実機テスト**（推奨）
   - DMGからインストール
   - Gatekeeper警告を許可して起動
   - トレイ常駐、ホットキー、クリップボードコピーの動作確認
