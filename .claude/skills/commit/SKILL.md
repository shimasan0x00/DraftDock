---
description: 変更をコミットし、spec.md変更時にはspec-reviewer更新を促す
allowed-tools: Bash, Read, Grep, Edit
---

# /commit - DraftDock用コミットコマンド

このコマンドは変更をコミットし、spec.md変更時にはspec-reviewer更新を促します。

## 実行手順

1. **変更状況を確認**
   ```bash
   git status
   git diff --cached --name-only
   git diff --name-only
   ```

2. **spec.md変更チェック**
   - `plan/spec.md` が変更されている場合:
     - ユーザーに「spec-reviewerの更新が必要か確認しますか？」と質問
     - 「はい」の場合: spec-reviewerの検証項目とspec.mdを比較し、差分があれば更新を提案

3. **コミット作成**
   - 変更内容を分析
   - 適切なコミットメッセージを生成
   - ユーザーに確認後、コミット実行

## spec-reviewer同期チェック

spec.mdが変更されている場合、以下を確認:
- 機能要件（F1-F8）の追加・変更
- データ仕様（D1-D6）の追加・変更
- UI仕様（U1-U8）の追加・変更
- 受け入れ条件（AC1-AC8）の追加・変更

差分があれば `.claude/agents/spec-reviewer.md` の更新を提案する。

## 注意事項

- コミット前に必ずspec.md変更をチェック
- spec-reviewer更新はユーザー確認後に実行
- コミットメッセージは日本語で簡潔に
