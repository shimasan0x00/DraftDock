# DraftDock 開発ワークフロー実装計画

## 概要

feature/xxxブランチで作業し、PR作成までの一連のワークフローをClaude Codeスキルとして実装する。

## ワークフロー

```
/start <タスク名>  →  開発  →  /commit  →  /pr
     │                          │           │
     v                          v           v
feature/xxx作成          コミット作成    push + PR作成
```

## 実装内容

### 1. /start スキル（新規）

**ファイル**: `.claude/skills/start/SKILL.md`

機能:
- mainから最新を取得
- `feature/<タスク名>` ブランチを作成
- issue番号指定時は `feature/<番号>-<slug>` 形式

### 2. /commit スキル（改善）

**ファイル**: `.claude/skills/commit/SKILL.md`

追加:
- ブランチ事前チェック（mainなら警告）
- 未ステージファイルの確認
- 次ステップの案内

### 3. /pr スキル（新規）

**ファイル**: `.claude/skills/pr/SKILL.md`

機能:
- 未コミット変更チェック
- `git push -u origin <branch>`
- `gh pr create` でPR作成
- PRテンプレートに従った本文生成

### 4. PRテンプレート（新規）

**ファイル**: `.github/pull_request_template.md`

内容:
- 概要
- 変更内容
- 関連issue
- テスト方法
- チェックリスト

### 5. CONTRIBUTING.md（新規）

開発ガイド:
- セットアップ手順
- ワークフロー説明（スキル使用/手動）
- ブランチ命名規則
- コミットメッセージ規則
- 仕様との整合性確認方法

## 変更対象ファイル

| ファイル | 操作 |
|---------|------|
| `.claude/skills/start/SKILL.md` | 新規作成 |
| `.claude/skills/pr/SKILL.md` | 新規作成 |
| `.claude/skills/commit/SKILL.md` | 更新 |
| `.github/pull_request_template.md` | 新規作成 |
| `CONTRIBUTING.md` | 新規作成 |

## 検証方法

1. `/start test-workflow` でブランチ作成を確認
2. ファイルを変更して `/commit` でコミット
3. `/pr` でPR作成を確認
4. PRテンプレートが適用されていることを確認
