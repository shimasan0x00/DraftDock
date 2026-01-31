---
description: 新しいfeatureブランチを作成してタスクを開始する
allowed-tools: Bash, Read
---

# /start - タスク開始コマンド

新しいfeatureブランチを作成し、開発を開始します。

## 使用方法

```
/start <タスク名>
/start <issue番号>
```

## 実行手順

1. **引数を確認**
   - 引数がない場合はエラー: 「タスク名またはissue番号を指定してください」

2. **現在の状態を確認**
   ```bash
   git status
   git branch --show-current
   ```

3. **未コミットの変更がある場合**
   - ユーザーに確認:
     - 「stashして続行」
     - 「中止する」

4. **mainブランチに切り替え・更新**
   ```bash
   git checkout main
   git pull origin main
   ```

5. **ブランチ名を決定**
   - 引数が数字のみ（issue番号）の場合:
     - `gh issue view <番号>` でissue情報を取得
     - `feature/<番号>-<slug>` 形式でブランチ名を生成
   - 引数がタスク名の場合:
     - `feature/<タスク名>` 形式（kebab-case変換）

6. **featureブランチを作成・切り替え**
   ```bash
   git checkout -b feature/<ブランチ名>
   ```

7. **開始メッセージを表示**
   ```
   ✓ ブランチ 'feature/xxx' を作成しました

   次のステップ:
   - 開発を進める
   - /commit で変更をコミット
   - /pr でプルリクエストを作成
   ```

## 注意事項

- mainブランチ以外から開始する場合は警告を表示
- ブランチ名は英数字とハイフンのみ（日本語は自動変換または警告）
- 既存ブランチ名と重複する場合はエラー
