---
description: 変更をコミットし、spec.md変更時にはspec-reviewer更新を促す
allowed-tools: Bash, Read, Grep, Edit
---

# /commit - DraftDock用コミットコマンド

このコマンドは変更をコミットし、spec.md変更時にはspec-reviewer更新を促します。

## 実行手順

1. **ブランチ確認**
   ```bash
   git branch --show-current
   ```
   - mainブランチの場合はエラー:
     「mainブランチでは直接コミットできません。/start でfeatureブランチを作成してください」

2. **変更状況を確認**
   ```bash
   git status
   git diff --cached --name-only
   git diff --name-only
   ```

3. **ステージングされていない変更がある場合**
   - 変更ファイル一覧を表示
   - ユーザーに確認:
     - 「全てステージングする」
     - 「選択してステージング」
     - 「キャンセル」

4. **変更がない場合**
   - エラー: 「コミットする変更がありません」

5. **spec.md変更チェック**
   - `plan/spec.md` がステージングされている場合:
     - ユーザーに「spec-reviewerの更新が必要か確認しますか？」と質問
     - 「はい」の場合: spec-reviewerの検証項目とspec.mdを比較し、差分があれば更新を提案

6. **コミットメッセージ生成**
   - 変更内容を分析
   - 適切なコミットメッセージを日本語で生成
   - フォーマット: `<type>: <description>`
     - feat: 新機能
     - fix: バグ修正
     - docs: ドキュメント
     - refactor: リファクタリング
     - test: テスト
     - chore: その他
   - ユーザーに確認（編集可能）

7. **コミット実行**
   ```bash
   git commit -m "<message>"
   ```

8. **結果表示**
   ```
   ✓ コミットしました: <commit-hash>

   次のステップ:
   - 開発を続ける場合: 変更を加えて再度 /commit
   - PR作成する場合: /pr
   ```

## spec-reviewer同期チェック

spec.mdが変更されている場合、以下を確認:
- 機能要件（F1-F8）の追加・変更
- データ仕様（D1-D6）の追加・変更
- UI仕様（U1-U8）の追加・変更
- 受け入れ条件（AC1-AC8）の追加・変更

差分があれば `.claude/agents/spec-reviewer.md` の更新を提案する。

## 注意事項

- mainブランチでは実行不可（エラー）
- コミットメッセージは日本語で簡潔に
- spec.md変更時は必ずspec-reviewer同期を確認
