# DraftDock 開発ガイド

## 開発環境セットアップ

### 1. リポジトリをクローン
```bash
git clone https://github.com/shimasan0x00/DraftDock.git
cd DraftDock
```

### 2. Git Hooksを設定
```bash
chmod +x ./scripts/setup-githooks.sh
./scripts/setup-githooks.sh
```

これにより以下の保護が有効になります:
- mainブランチへの直接コミット禁止
- mainブランチへの直接push禁止

## 開発ワークフロー

### Claude Codeを使う場合

```
/start <タスク名>  →  開発  →  /commit  →  /pr
```

#### 1. タスクを開始
```
/start <タスク名>
/start <issue番号>
```

`feature/<name>` ブランチが作成されます。

#### 2. 開発
通常通りコードを変更します。

#### 3. コミット
```
/commit
```

変更内容を分析し、適切なコミットメッセージを生成します。

#### 4. Pull Request作成
```
/pr
```

変更をpushし、PRを作成します。

### 手動で行う場合

```bash
# 1. featureブランチを作成
git checkout main
git pull origin main
git checkout -b feature/your-task-name

# 2. 開発・コミット
git add -A
git commit -m "feat: your changes"

# 3. push・PR作成
git push -u origin feature/your-task-name
gh pr create
```

## ブランチ命名規則

| プレフィックス | 用途 |
|---------------|------|
| `feature/` | 新機能追加 |
| `fix/` | バグ修正 |
| `docs/` | ドキュメント変更 |
| `refactor/` | リファクタリング |

## コミットメッセージ規則

フォーマット: `<type>: <description>`

| type | 用途 |
|------|------|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメント |
| `refactor` | リファクタリング |
| `test` | テスト |
| `chore` | その他 |

## 仕様との整合性

- `plan/spec.md` がプロジェクトの正式な仕様書です
- spec.mdを変更した場合、`spec-reviewer` の更新を検討してください

## 禁止事項

- mainブランチへの直接コミット
- mainブランチへの直接push
