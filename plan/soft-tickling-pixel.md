# CLAUDE.md と README.md の最新化

## Context

コードベースはmacOS対応（CI/CDビルド・GitHub Releases配布）やクリアキー機能（F9）など複数の機能が追加済みだが、CLAUDE.mdとREADMEの記載が初期状態のまま残っている箇所がある。ドキュメントを実態に合わせて最新化する。

---

## 修正対象と内容

### 1. CLAUDE.md

#### 1-1. 対応OS（8行目）
- **現在**: `Windows（MVP）、macOS（将来）`
- **修正**: `Windows / macOS`
- **理由**: macOSビルドはCI/CDで自動ビルド・配布済み（release.yml: build-macos ジョブ）

#### 1-2. 検証項目IDレンジ（62行目・66-69行目）
- **現在**: `F1-F8, D1-D6, U1-U8, AC1-AC8`
- **修正**: `F1-F9, D1-D7, U1-U11, AC1-AC8`
- **理由**: `.claude/agents/spec-reviewer.md` の実際の検証項目と一致させる
  - F9: クリアキーでテキストクリア
  - D7: クリアキーデフォルト値
  - U9: メニューバー、U10: ボタンショートカット表記、U11: 設定画面メニューなし

#### 1-3. ディレクトリ構造（109-133行目）
- `assets/draft_pad_512.png # macOSアイコン` を追加
- **理由**: macOS対応で追加されたアセットが未記載

#### 1-4. CI/CD説明（166-174行目）
- **現在**: ビルド&パッケージング（単一ステップのように記載）
- **修正**: Windows + macOS のマルチプラットフォームビルドであることを明記
- **理由**: 実際のrelease.ymlは prepare → build-windows + build-macos → release の構成

### 2. README.md

#### 2-1. ディレクトリ構造（107-128行目）
- renderer/ セクションに `types.d.ts # 型定義` を追加
- **理由**: CLAUDE.mdには記載済みだが、READMEでは欠落

---

## 対象ファイル

- `/home/shimasan0x00/products/DraftDock/CLAUDE.md`
- `/home/shimasan0x00/products/DraftDock/README.md`

## 検証方法

1. 修正後のCLAUDE.mdの検証項目IDが `.claude/agents/spec-reviewer.md` と一致することを確認
2. ディレクトリ構造の記載が `assets/` 配下の実ファイルと一致することを確認
3. CI/CDの記載が `.github/workflows/release.yml` の構成と一致することを確認
4. README.mdのディレクトリ構造が `src/renderer/` 配下の実ファイルと一致することを確認
