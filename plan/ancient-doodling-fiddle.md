# リポジトリ公開前セキュリティ診断 & 履歴クリーンアップ検討

## セキュリティ診断結果: 問題なし

### 確認済み項目
- **シークレット/APIキー**: なし（コード・履歴ともにクリーン）
- **環境ファイル(.env等)**: 追跡されていない。`.gitignore`適切
- **GitHub Actions**: `${{ secrets.GITHUB_TOKEN }}`のみ使用（安全）
- **内部URL/IP**: なし
- **依存関係**: すべて公開npmレジストリ
- **ライセンス**: MIT（適切）

### 軽微な指摘事項

| # | 内容 | リスク | 対応 |
|---|------|--------|------|
| 1 | メールアドレス `kkss07020@gmail.com` がコミット履歴に露出 | 低 | 後述のオプション参照 |
| 2 | 削除済み `assets/tray-icon.png`(1.7MB) が履歴に残存 | なし（軽微な肥大化） | 任意 |
| 3 | Git author名が `Villager-B` と `shimasan0x00` の2つ混在 | なし | 任意で統一可能 |

## 履歴クリーンアップのオプション

### オプションA: そのまま公開（推奨）
- セキュリティ上の問題はないためそのまま公開可能
- 64コミットと小規模なので履歴を残す価値がある

### オプションB: git filter-repo で部分クリーンアップ
- メールアドレスを `noreply` に書き換え
- 削除済み大ファイルをパージ
- **注意**: 全コミットハッシュが変わる（force push必要）

### オプションC: スカッシュして新規リポジトリ
- 全履歴を1コミットに圧縮して新しいリポジトリとして公開
- 最もクリーンだが履歴が完全に失われる

## 実施手順（オプションC: スカッシュして新規公開）

### 前提
- 現在のリポジトリはprivateのまま保持（バックアップ）
- 新しいクリーンな履歴で公開用リポジトリを準備

### 手順

1. **現在のmainブランチの最新状態を確認**
   - fix/ime-composition-input ブランチをmainにマージ済みか確認
   - 未マージなら先にマージする

2. **新しいクリーンな履歴を作成**
   ```bash
   # 作業用の一時ディレクトリで実施
   git checkout main
   git checkout --orphan clean-main
   git add -A
   git commit -m "Initial commit: DraftDock v0.1.7"
   git branch -D main
   git branch -m main
   ```

3. **リモートにforce push（または新リポジトリ作成）**
   - 方法A: 同じリポジトリをforce pushしてpublicに変更
   - 方法B: 新しいリポジトリを作成してpush

4. **公開後の設定**
   - GitHub Settings > Emails > "Keep my email addresses private" を有効化
   - git config で `noreply` メールを設定:
     ```
     git config user.email "shimasan0x00@users.noreply.github.com"
     ```

### 対象ファイル
- Git操作のみ。ソースコードの変更なし。

## 公開前チェックリスト
- [x] シークレット/認証情報の漏洩なし
- [x] .gitignore が適切
- [x] ライセンスファイル(MIT)あり
- [x] README.md あり
- [ ] GitHub設定でメールを非公開に変更
- [ ] 今後のコミット用に `noreply` メール設定
- [ ] fix/ime-composition-input のマージ状況確認
