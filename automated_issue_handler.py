# -*- coding: utf-8 -*-
import os
import sys
import json
from google import genai
from notifier import Notifier

def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY is not set.", file=sys.stderr)
        sys.exit(1)

    client = genai.Client(api_key=api_key)
    todo_path = 'todo.md'
    
    # 0. ラベルとメタデータの取得
    issue_labels = os.environ.get("ISSUE_LABELS", "").lower()
    print(f"Detected Labels: {issue_labels}")
    
    # ガードコード: no-implementation ラベルがある場合は実装をスキップ
    skip_implementation = "no-implementation" in issue_labels

    # 1. 計画フェーズ (Planner: Issue -> todo.md)
    issue_title = os.environ.get("ISSUE_TITLE", "")
    issue_body = os.environ.get("ISSUE_BODY", "")
    
    if issue_title or issue_body:
        print(f"--- Phase 1: Planning (Issue #{os.environ.get('ISSUE_NUMBER', '?')}) ---")
        current_todo = ""
        if os.path.exists(todo_path):
            with open(todo_path, 'r', encoding='utf-8') as f:
                current_todo = f.read()

        # ラベルに応じた追加命令
        label_context = ""
        if "bug" in issue_labels or "task:bug_fix" in issue_labels:
            label_context = "- これはバグ修正タスクです。原因究明と再発防止を重視したステップを作成してください。"
        elif "refactor" in issue_labels:
            label_context = "- これはリファクタリングです。動作を変えずに可読性と保守性を高めるステップにしてください。"
        elif "feat" in issue_labels or "task:implementation" in issue_labels:
            label_context = "- これは機能追加タスクです。既存のUIデザイン（Tailwind/Glassmorphism）に馴染むように設計してください。"

        planner_prompt = f"""
        あなたは自律型エンジニア「Jules」です。
        GitHubのIssue（指令）を読み取り、現在の todo.md を更新してください。
        
        {label_context}

        【現在のTODO】
        {current_todo}
        
        【新しい指令: {issue_title}】
        {issue_body}
        
        【ルール】
        - Markdown形式で出力すること。
        - 既存のタスクを維持しつつ、新しい指令を具体的なステップに分解して追加してください。
        - 日本語で回答してください。
        """
        
        response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=planner_prompt
        )
        
        new_todo = response.text
        if new_todo.startswith("```"):
            lines = new_todo.splitlines()
            if lines[0].startswith("```markdown") or lines[0].startswith("```"):
                new_todo = "\n".join(lines[1:-1])
        
        with open(todo_path, 'w', encoding='utf-8') as f:
            f.write(new_todo.strip())
        print("Successfully updated todo.md")
    else:
        print("No issue context found. Skipping Planner phase.")

    if skip_implementation:
        print("Skip implementation based on label (no-implementation).")
        Notifier.send(f"✅ [Jules] 計画フェーズ完了: {issue_title} (実装はスキップされました)")
        return

    # 2. 実行フェーズ (Implementer: todo.md -> Code)
    print("--- Phase 2: Implementation ---")
    with open(todo_path, 'r', encoding='utf-8') as f:
        updated_todo = f.read()

    # リポジトリ内の主要なファイルをコンテキストとして読み込む
    # 今回は特定のファイルに限定せず、todo.md 自体と README.md, STANDARD_WORKFLOW.md などを参考にする
    context_files = ['todo.md', 'README.md', 'STANDARD_WORKFLOW.md']
    context_data = ""
    for path in context_files:
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                context_data += f"\n--- File: {path} ---\n{content}\n"

    impl_prompt = f"""
    あなたは凄腕のエンジニア「Jules」です。
    `todo.md` の「Immediate Actions」にある未完了タスクのうち、現在のリポジトリに関連するものを1つ選び、実装してください。

    【現在のTODO状況】
    {updated_todo}

    【リポジトリのコンテキスト】
    {context_data}

    【要求事項】
    - 実装が必要なファイルを特定し、そのファイル全体の新しい内容を出力してください。
    - 出力は必ず以下の JSON 形式にしてください。
    - 日本語で説明してください。

    【フォーマット】
    {{
        "explanation": "修正内容の説明（日本語）",
        "edits": [
            {{
                "path": "ファイルの相対パス",
                "content": "ファイル全体の新しい内容"
            }}
        ],
        "completed_task": "完了したタスクの正確なテキスト（todo.md 更新用）"
    }}
    """

    print("Requesting implementation from Gemini...")
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=impl_prompt,
        config={
            "response_mime_type": "application/json"
        }
    )
    
    try:
        result = json.loads(response.text)
        explanation = result.get('explanation', '不明な修正')
        print(f"Implementation Plan: {explanation}")
        
        for edit in result.get("edits", []):
            path = edit["path"]
            content = edit["content"]
            print(f"Applying edits to {path}...")
            # 親ディレクトリが存在しない場合は作成
            os.makedirs(os.path.dirname(path), exist_ok=True) if os.path.dirname(path) else None
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
        
        completed_task = result.get("completed_task")
        if completed_task:
            print(f"Marking task as completed: {completed_task}")
            with open(todo_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            with open(todo_path, 'w', encoding='utf-8') as f:
                for line in lines:
                    if completed_task in line and "[ ]" in line:
                        line = line.replace("[ ]", "[x]")
                    f.write(line)

        print("Implementation phase completed successfully.")
        
        # 3. 通知送信
        Notifier.send(f"🚀 [Jules] 実装完了: {issue_title}\n\n内容: {explanation}\nTask: {completed_task}")


    except Exception as e:
        msg = f"❌ [Jules] 実装中にエラーが発生しました: {str(e)}"
        print(msg)
        Notifier.send(msg)
        sys.exit(0)

if __name__ == "__main__":
    main()
