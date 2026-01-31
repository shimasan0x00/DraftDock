# DraftDock - Claude Code 設定

## プロジェクト概要

DraftDockは、AI/チャットツールの誤送信を防ぐための常駐型下書きアプリケーション。

- **技術スタック**: TypeScript, Electron, HTML/CSS
- **対応OS**: Windows（MVP）、macOS（将来）
- **仕様書**: `plan/spec.md`
- **配布**: GitHub Releases（自動ビルド）

## セットアップ

**Windows環境セットアップ**: [`docs/windows-setup-guide.md`](docs/windows-setup-guide.md)

Git Hooks設定（WSL/Linux）:
```bash
chmod +x ./scripts/setup-githooks.sh
./scripts/setup-githooks.sh
```

## 開発ワークフロー

### 自動ブランチ作成

開発タスク（実装、修正、リファクタリング等）を受けた場合:

1. **現在のブランチを確認**
2. **mainブランチの場合は自動でfeatureブランチを作成**
   - ブランチ名: `feature/<タスク名のslug>`
   - 例: 「ホットキー設定画面を追加して」→ `feature/add-hotkey-settings`
3. **開発を実施**
4. **適切なタイミングでコミット**（ユーザー確認後）

### PRは手動制御

PRの作成は `/pr` コマンドで明示的に実行する。自動でPRを作成しない。

## スキル（カスタムコマンド）

| コマンド | 用途 |
|---------|------|
| `/start <name>` | featureブランチを作成してタスク開始 |
| `/commit` | 変更をコミット（spec.md変更時は同期確認） |
| `/pr` | pushしてPull Requestを作成 |

## カスタムエージェント

| エージェント | 用途 | モデル |
|-------------|------|--------|
| `spec-reviewer` | plan/spec.mdとコードの整合性検証 | Opus |
| `codebase-explorer` | プロジェクト概要の定型レポート | Haiku |

## 仕様書との連携

### plan/spec.md
- プロジェクトの正式な仕様書
- 実装時は必ず参照すること

### spec.md変更時
1. コミット時にリマインダーが表示される
2. `spec-reviewer`の検証項目（F1-F8, D1-D6, U1-U8, AC1-AC8）の更新を検討
3. 必要に応じて `.claude/agents/spec-reviewer.md` を更新

### 検証項目ID
- **F1-F8**: 機能要件（トレイ常駐、ホットキー、クリップボード等）
- **D1-D6**: データ仕様（保存先、ファイル形式、デバウンス等）
- **U1-U8**: UI仕様（ウィンドウサイズ、フォント、キーボード等）
- **AC1-AC8**: 受け入れ条件（MVP完了判定）

## Git Hooks保護

| フック | 保護内容 |
|--------|---------|
| pre-commit | mainブランチでのコミット禁止、spec.md変更時リマインダー |
| pre-push | mainからのpush禁止、mainへのpush禁止 |

## ブランチ命名規則

| プレフィックス | 用途 |
|---------------|------|
| `feature/` | 新機能追加 |
| `fix/` | バグ修正 |
| `docs/` | ドキュメント変更 |
| `refactor/` | リファクタリング |

## コミットメッセージ形式

`<type>: <description>`（日本語）

| type | 用途 |
|------|------|
| feat | 新機能 |
| fix | バグ修正 |
| docs | ドキュメント |
| refactor | リファクタリング |
| test | テスト |
| chore | その他 |

## 禁止事項

- mainブランチでの直接コミット
- mainブランチへの直接push
- ユーザー確認なしのPR作成
- 仕様を確認せずに実装を進めること

## ディレクトリ構造

```
src/
├── main/
│   ├── main.ts       # エントリポイント
│   ├── tray.ts       # トレイ制御
│   ├── hotkey.ts     # グローバルホットキー
│   ├── window.ts     # ウィンドウ管理
│   ├── store.ts      # 永続化
│   ├── menu.ts       # アプリケーションメニュー
│   └── __tests__/    # 単体テスト（Vitest）
├── preload/
│   └── preload.ts    # contextBridge API
└── renderer/
    ├── index.html    # メインウィンドウ
    ├── index.ts
    ├── settings.html # 設定画面
    ├── settings.ts
    └── types.d.ts    # 型定義
e2e/                  # E2Eテスト（Playwright）
assets/
├── fonts/            # Bizin Gothic フォント
├── draft_pad.ico     # Windowsアイコン
├── draft_pad_16.png  # トレイアイコン
└── draft_pad_256.png # ウィンドウアイコン
```

## デフォルト設定値

| 項目 | デフォルト |
|------|-----------|
| 起動キー | Ctrl+Shift+D |
| コピーキー | Ctrl+Enter |
| クリアキー | Ctrl+Shift+L |
| ウィンドウサイズ | 800 x 450 px |
| 最小サイズ | 400 x 300 px |
| 設定画面サイズ | 450 x 450 px |
| デバウンス保存 | 500ms |
| フォント | Bizin Gothic（日本語対応等幅） |

## テスト

### コマンド

| コマンド | 説明 |
|---------|------|
| `npm test` | 全テスト実行（単体 + E2E） |
| `npm run test:unit` | Vitest単体テスト |
| `npm run test:unit:watch` | Vitest ウォッチモード |
| `npm run test:e2e` | Playwright E2Eテスト |

### テスト構成

- **単体テスト**: `src/main/__tests__/*.spec.ts`
- **E2Eテスト**: `e2e/*.spec.ts`

## CI/CD

### GitHub Actions

mainブランチへのpush時に自動でリリースが作成される。

1. バージョン判定（既存タグがあればパッチバンプ）
2. ビルド & パッケージング
3. タグ作成 & GitHub Release公開

詳細: `.github/workflows/release.yml`
