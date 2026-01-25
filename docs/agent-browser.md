# agent-browser 導入ガイド

AIエージェント向けブラウザ自動化CLIツール。

- リポジトリ: https://github.com/vercel-labs/agent-browser
- ライセンス: Apache 2.0

## インストール

```bash
npm install -g agent-browser
agent-browser install  # Chromiumをダウンロード
```

Linux環境では追加の依存関係が必要:

```bash
npx playwright install-deps chromium
```

## 基本コマンド

### ナビゲーション

```bash
agent-browser open "https://example.com"
```

### 要素操作

```bash
# クリック
agent-browser click "button.submit"

# テキスト入力
agent-browser fill "#email" "test@example.com"

# タイプ（1文字ずつ）
agent-browser type "#search" "query"
```

### セマンティックロケーター

CSSセレクタ以外にも、アクセシビリティベースの要素指定が可能:

```bash
# ARIAロール指定
agent-browser click "role=button[name='Submit']"

# テキスト指定
agent-browser click "text=ログイン"

# ラベル指定
agent-browser fill "label=メールアドレス" "test@example.com"
```

### スナップショット（AI向け）

アクセシビリティツリーを取得し、要素参照ID付きで返す:

```bash
# インタラクティブ要素のみ
agent-browser snapshot -i

# JSON形式で出力
agent-browser snapshot -i --json

# コンパクトモード（空ノード除去）
agent-browser snapshot -i -c
```

スナップショット結果の要素参照を使って操作:

```bash
agent-browser click @e2
agent-browser fill @e5 "入力値"
```

## セッション管理

### 分離セッション

```bash
agent-browser --session my-session open "https://example.com"
agent-browser --session my-session click "#login"
```

### 永続プロファイル

ログイン状態を保持:

```bash
agent-browser --profile ./my-profile open "https://example.com"
```

## AI統合

### JSON出力モード

```bash
agent-browser get text "#result" --json
```

### 推奨ワークフロー

1. URLを開く
2. `snapshot -i --json` でインタラクティブ要素を取得
3. AIが要素参照を特定
4. 参照ID（`@e1`, `@e2`等）で操作実行
5. 状態変化後に再スナップショット

### Claude Code等との統合

```bash
npx skills add vercel-labs/agent-browser
```

## 高度な機能

### ネットワーク操作

```bash
# リクエストブロック
agent-browser network block "*.analytics.com"

# リクエストモック
agent-browser network mock "*/api/user" '{"name": "test"}'
```

### スクリーンショット・PDF

```bash
agent-browser screenshot output.png
agent-browser pdf output.pdf
```

### リモートブラウザ接続

```bash
# CDP経由で既存Chromeに接続
agent-browser --cdp "http://localhost:9222" open "https://example.com"
```

## 注意事項

- Electronアプリのテストには非対応（Chromiumウェブブラウザ向け）
- DraftDockのE2EテストにはPlaywright Electronを使用
