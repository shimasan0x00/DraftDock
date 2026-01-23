---
description: 変更をpushしてPull Requestを作成する
allowed-tools: Bash, Read, Grep
---

# /pr - Pull Request作成コマンド

変更をリモートにpushし、Pull Requestを作成します。

## 実行手順

1. **ブランチ確認**
   ```bash
   git branch --show-current
   ```
   - mainブランチの場合はエラー: 「mainブランチではPRを作成できません」

2. **未コミットの変更を確認**
   ```bash
   git status
   ```
   - 未コミットの変更がある場合は警告:
     - 「未コミットの変更があります。先に /commit を実行してください」
     - または「このまま続行」を選択可能

3. **コミット履歴を確認**
   ```bash
   git log main..HEAD --oneline
   ```
   - コミットがない場合はエラー: 「pushするコミットがありません」

4. **リモートの状態を確認**
   ```bash
   git fetch origin
   git log HEAD..origin/main --oneline
   ```
   - mainが進んでいる場合は警告（リベースを推奨）

5. **リモートへpush**
   ```bash
   git push -u origin <current-branch>
   ```

6. **PR情報を収集**
   - コミット履歴から変更内容を分析
   - `git diff main..HEAD --stat` で変更ファイルを確認

7. **PRタイトルを生成**
   - フォーマット: `<type>: <description>`
   - ブランチ名やコミットメッセージから推測
   - ユーザーに確認（編集可能）

8. **PR本文を生成**
   - テンプレートに従って生成
   - ユーザーに確認（編集可能）

9. **PR作成**
   ```bash
   gh pr create --title "<title>" --body "<body>"
   ```
   - `--draft` オプション: `/pr --draft` で指定可能

10. **結果表示**
    ```
    ✓ Pull Requestを作成しました

    URL: https://github.com/xxx/xxx/pull/123

    次のステップ:
    - レビューを依頼
    - CIの結果を確認
    - マージ後は `git checkout main && git pull` で更新
    ```

## PR本文テンプレート

```markdown
## 概要
[変更の目的・背景を1-2文で]

## 変更内容
- [変更点1]
- [変更点2]

## 関連issue
closes #xxx（あれば）

## テスト方法
- [ ] [テスト項目1]
- [ ] [テスト項目2]

## チェックリスト
- [ ] コードがビルドを通過する
- [ ] spec.mdとの整合性を確認
```

## オプション

- `--draft`: ドラフトPRとして作成
- `--no-push`: pushせずにPR作成（既にpush済みの場合）

## 注意事項

- mainブランチでは実行不可
- 未コミットの変更がある場合は警告
- PRテンプレート (.github/pull_request_template.md) が存在する場合は参照
