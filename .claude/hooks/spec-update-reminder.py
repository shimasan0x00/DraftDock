#!/usr/bin/env python3
"""
plan/spec.md 編集時に spec-reviewer の更新を促すリマインダー
"""
import json
import sys

def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.exit(0)

    file_path = input_data.get('tool_input', {}).get('file_path', '')
    tool_name = input_data.get('tool_name', '')

    # plan/spec.md のみに反応
    if not (tool_name in ['Edit', 'Write'] and 'plan/spec.md' in file_path):
        sys.exit(0)

    # リマインダーを出力（stdoutはClaudeのコンテキストに追加される）
    print("""
[spec-update-reminder]
plan/spec.md が更新されました。
spec-reviewer の検証項目も更新が必要な可能性があります。

確認コマンド:
  「spec-reviewerの検証項目をspec.mdと同期して」
""")

    sys.exit(0)

if __name__ == '__main__':
    main()
