from __future__ import annotations

import argparse
import sys
from datetime import datetime
from pathlib import Path

import debate


END_MARKER = "/end"
CANCEL_MARKER = "/cancel"


MANUAL_TARGETS = {
    "proposer": "ChatGPTなどの提案担当AI",
    "critic": "Claudeなどの批判担当AI",
    "judge": "ChatGPTまたはClaudeなどの統合担当AI",
}


def read_multiline_response(role: str) -> str:
    print("")
    print(f"{debate.ROLE_NAMES[role]} の返答を貼り付けてください。")
    print(f"入力を終えるには単独行で {END_MARKER}、中止するには {CANCEL_MARKER} と入力してください。")
    print("")

    lines: list[str] = []
    while True:
        try:
            line = input()
        except EOFError:
            break
        if line.strip() == CANCEL_MARKER:
            raise KeyboardInterrupt
        if line.strip() == END_MARKER:
            break
        lines.append(line)

    content = "\n".join(lines).strip()
    if not content:
        raise RuntimeError(f"{debate.ROLE_NAMES[role]} の返答が空です。")
    return content


def wait_for_enter() -> None:
    input("貼り付けが終わったら Enter を押してください...")


def print_prompt_block(prompt: str) -> None:
    border = "=" * 72
    print("")
    print(border)
    print("ここからコピー")
    print(border)
    print(prompt.rstrip())
    print(border)
    print("ここまでコピー")
    print(border)
    print("")


def build_manual_prompt(role: str, round_number: int, title: str, topic: str, turns: list[debate.Turn]) -> str:
    if role == "judge" and round_number == 2:
        transcript = debate.format_transcript(turns)
        instruction = """最終結論を出してください。
必ず以下の見出しをこの順番で使ってください。

## 3. 最終結論
## 4. 採用案
## 5. 却下案
## 6. 主な理由
## 7. 次にやること
## 8. 未解決論点
## 9. 追加で確認すべきこと
## 10. 結論の自信度
高 / 中 / 低 のいずれかを明記してください。
## 11. 自信度の理由
## 12. 各AIの要約
### Proposer
### Critic
### Judge

曖昧な両論併記で終わらず、実行可能な次アクションまで落としてください。"""
        return f"""# 議題
{topic}

# これまでの会議ログ
{transcript}

# 今回の担当
{debate.ROLE_NAMES[role]} - {title}

# 指示
{instruction}
"""

    return debate.build_prompt(role, round_number, title, topic, turns)


def manual_output_path(config: dict, meeting_id: str) -> Path:
    output_config = config.get("output", {})
    save_dir = debate.ROOT / output_config.get("save_dir", "output")
    filename_prefix = output_config.get("filename_prefix", "ai_board")
    return save_dir / f"{meeting_id}_{filename_prefix}_manual.md"


def build_manual_metadata(config: dict, started_at: datetime) -> dict:
    metadata = debate.build_run_metadata(config=config, started_at=started_at, dry_run=False)
    metadata["manual_mode"] = True
    metadata["openai_store_responses"] = False
    return metadata


def render_manual_markdown(
    *,
    meeting_id: str,
    topic: str,
    turns: list[debate.Turn],
    metadata: dict,
    partial: bool,
    error: str | None = None,
) -> str:
    final_decision = None
    final_judge = next(
        (turn for turn in reversed(turns) if turn.role == "judge" and turn.round_number == 2),
        None,
    )

    if final_judge and not partial:
        final_summary = final_judge.content
    else:
        final_summary = None

    lines = [
        "# AI会議室 結論",
        "",
        "## 1. Meeting ID",
        meeting_id,
        "",
        "- 実行日時: " + str(metadata.get("started_at", "")),
        "- Manual mode: yes",
        "- API used: no",
        "- Mode: " + str(metadata.get("mode", "")),
        "- Rounds: " + str(metadata.get("rounds", "")),
        "",
        "## 2. 議題",
        "",
        debate.quote_markdown(topic),
        "",
    ]

    if partial:
        lines.extend(["## 3. ステータス", "途中保存です。会議は正常終了していません。", ""])
        if error:
            lines.extend(["## 4. エラー", error, ""])
    elif final_summary:
        lines.extend([final_summary.strip(), ""])
    else:
        lines.extend(["## 3. 最終結論", "最終結論は入力されていません。", ""])

    lines.extend(["## 13. 会議ログ", ""])
    current_round = None
    for turn in turns:
        if current_round != turn.round_number:
            current_round = turn.round_number
            lines.extend([f"### Round {current_round}", ""])
        lines.extend(
            [
                f"#### {debate.ROLE_NAMES[turn.role]}: {turn.title}",
                "",
                debate.demote_markdown_headings(turn.content),
                "",
            ]
        )

    return "\n".join(lines).rstrip() + "\n"


def print_run_settings(config: dict, meeting_id: str, output_path: Path) -> None:
    print("AI会議室 半手動モード")
    print(f"Meeting ID: {meeting_id}")
    print(f"Output: {output_path}")
    print(f"Mode: {config['mode']}")
    print(f"Rounds: {config['rounds']}")
    print("API used: no")
    print("")
    print("想定貼り付け先:")
    for role in ("proposer", "critic", "judge"):
        print(f"- {role}: {MANUAL_TARGETS[role]}")
    print("")


def run(no_pause: bool = False) -> Path:
    started_at = datetime.now().astimezone()
    config = debate.load_json(debate.CONFIG_PATH)
    debate.validate_config(config)
    topic = debate.read_topic(debate.TOPIC_PATH)

    output_config = config.get("output", {})
    save_dir = debate.ROOT / output_config.get("save_dir", "output")
    filename_prefix = output_config.get("filename_prefix", "ai_board")
    meeting_id = debate.next_meeting_id(save_dir, f"{filename_prefix}_manual")
    output_path = manual_output_path(config, meeting_id)
    metadata = build_manual_metadata(config, started_at)

    print_run_settings(config, meeting_id, output_path)
    turns: list[debate.Turn] = []

    try:
        for round_number, role, title in debate.TURN_PLAN:
            print("")
            print(f"Round {round_number}: {debate.ROLE_NAMES[role]} - {title}")
            print(f"貼り付け先の目安: {MANUAL_TARGETS[role]}")

            prompt = build_manual_prompt(role, round_number, title, topic, turns)
            print_prompt_block(prompt)
            if not no_pause:
                wait_for_enter()

            content = read_multiline_response(role)
            turns.append(debate.Turn(round_number=round_number, role=role, title=title, content=content))

        markdown = render_manual_markdown(
            meeting_id=meeting_id,
            topic=topic,
            turns=turns,
            metadata=metadata,
            partial=False,
        )
        debate.save_markdown(output_path, markdown)
        return output_path
    except KeyboardInterrupt:
        markdown = render_manual_markdown(
            meeting_id=meeting_id,
            topic=topic,
            turns=turns,
            metadata=metadata,
            partial=True,
            error="ユーザーが中止しました。",
        )
        debate.save_markdown(output_path, markdown)
        raise SystemExit(f"中止しました。途中結果を保存しました: {output_path}")
    except Exception as exc:
        markdown = render_manual_markdown(
            meeting_id=meeting_id,
            topic=topic,
            turns=turns,
            metadata=metadata,
            partial=True,
            error=str(exc),
        )
        debate.save_markdown(output_path, markdown)
        raise


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="AI会議室 半手動モード")
    parser.add_argument("--no-pause", action="store_true", help="プロンプト表示後のEnter待ちを省略する")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    try:
        output_path = run(no_pause=args.no_pause)
    except SystemExit:
        raise
    except Exception as exc:
        print(f"実行に失敗しました: {exc}", file=sys.stderr)
        return 1

    print("")
    print(f"保存しました: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
