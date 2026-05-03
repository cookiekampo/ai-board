from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
CONFIG_PATH = ROOT / "config.json"
TOPIC_PATH = ROOT / "topic.txt"
ENV_PATH = ROOT / ".env"
OPENAI_STORE_RESPONSES = False


ROLE_NAMES = {
    "proposer": "Proposer / 提案者",
    "critic": "Critic / 批判者",
    "judge": "Judge / 統合者",
}


SYSTEM_PROMPTS = {
    "proposer": """あなたはAI会議室の Proposer / 提案者です。
議題に対して、前向きな案、実行方法、メリット、現実的な進め方を出してください。
楽観論だけにせず、実行可能な単位まで具体化してください。""",
    "critic": """あなたはAI会議室の Critic / 批判者です。
提案に対して、リスク、抜け漏れ、失敗要因、コスト、現実的な問題点を指摘してください。
単なる否定ではなく、致命的リスク、修正可能な問題、見落とされている前提、追加確認事項を分けてください。""",
    "judge": """あなたはAI会議室の Judge / 統合者です。
提案と批判を整理し、曖昧な両論併記ではなく、意思決定に使える結論へ落としてください。
採用案、却下案、主な理由、未解決論点、追加確認事項、次アクション、自信度を明確にしてください。""",
}


TURN_PLAN = [
    (1, "proposer", "初期提案"),
    (1, "critic", "批判・リスク指摘"),
    (1, "judge", "中間整理"),
    (2, "proposer", "批判を踏まえた修正案"),
    (2, "critic", "最終チェック"),
    (2, "judge", "最終結論"),
]


SECRET_PATTERNS = [
    re.compile(r"sk-[A-Za-z0-9_\-]{20,}"),
    re.compile(r"(?i)\b(api[_-]?key|secret|password|token)\b\s*[:=]"),
    re.compile(r"(?i)\bOPENAI_API_KEY\b"),
    re.compile(r"(?i)\bANTHROPIC_API_KEY\b"),
]


FINAL_DECISION_SCHEMA = {
    "type": "object",
    "properties": {
        "final_conclusion": {
            "type": "string",
            "description": "会議全体の最終結論。曖昧な両論併記ではなく、判断として書く。",
        },
        "adopted_proposals": {
            "type": "array",
            "description": "採用すべき案。",
            "items": {"type": "string"},
        },
        "rejected_proposals": {
            "type": "array",
            "description": "採用しない案、またはMVPから外す案。",
            "items": {"type": "string"},
        },
        "main_reasons": {
            "type": "array",
            "description": "最終結論を支える主な理由。",
            "items": {"type": "string"},
        },
        "next_actions": {
            "type": "array",
            "description": "次にやる具体的アクション。実行順に書く。",
            "items": {"type": "string"},
        },
        "unresolved_issues": {
            "type": "array",
            "description": "まだ解決していない論点。",
            "items": {"type": "string"},
        },
        "additional_checks": {
            "type": "array",
            "description": "追加で確認すべきこと。",
            "items": {"type": "string"},
        },
        "confidence": {
            "type": "string",
            "description": "結論の自信度。",
            "enum": ["高", "中", "低"],
        },
        "confidence_reasons": {
            "type": "array",
            "description": "自信度をそう判断した理由。",
            "items": {"type": "string"},
        },
        "agent_summaries": {
            "type": "object",
            "description": "各AIの発言の要約。",
            "properties": {
                "proposer": {"type": "string"},
                "critic": {"type": "string"},
                "judge": {"type": "string"},
            },
            "additionalProperties": False,
            "required": ["proposer", "critic", "judge"],
        },
    },
    "additionalProperties": False,
    "required": [
        "final_conclusion",
        "adopted_proposals",
        "rejected_proposals",
        "main_reasons",
        "next_actions",
        "unresolved_issues",
        "additional_checks",
        "confidence",
        "confidence_reasons",
        "agent_summaries",
    ],
}


FINAL_DECISION_RESPONSE_FORMAT = {
    "type": "json_schema",
    "name": "ai_board_final_decision",
    "description": "AI会議室の最終判断を固定構造で返す。",
    "strict": True,
    "schema": FINAL_DECISION_SCHEMA,
}


@dataclass
class Turn:
    round_number: int
    role: str
    title: str
    content: str


def load_dotenv(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def load_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise SystemExit(f"設定ファイルが見つかりません: {path}")
    except json.JSONDecodeError as exc:
        raise SystemExit(f"config.jsonのJSON形式が不正です: {exc}")


def validate_config(config: dict[str, Any]) -> None:
    if config.get("mode") != "basic":
        raise SystemExit("v0.1では mode は basic のみ対応です。")
    if config.get("rounds") != 2:
        raise SystemExit("v0.1では rounds は 2 のみ対応です。")

    models = config.get("models", {})
    for role in ("proposer", "critic", "judge"):
        role_config = models.get(role)
        if not isinstance(role_config, dict):
            raise SystemExit(f"models.{role} が設定されていません。")
        if role_config.get("provider") != "openai":
            raise SystemExit(f"v0.1では models.{role}.provider は openai のみ対応です。")
        if not role_config.get("model"):
            raise SystemExit(f"models.{role}.model が設定されていません。")

    limits = config.get("limits", {})
    if int(limits.get("max_total_turns", 0)) < len(TURN_PLAN):
        raise SystemExit("limits.max_total_turns は 6 以上にしてください。")
    if int(limits.get("max_tokens_per_turn", 0)) <= 0:
        raise SystemExit("limits.max_tokens_per_turn は 1 以上にしてください。")


def read_topic(path: Path) -> str:
    try:
        topic = path.read_text(encoding="utf-8").strip()
    except FileNotFoundError:
        raise SystemExit(
            f"議題ファイルが見つかりません: {path}\n"
            "topic.example.txt をコピーして topic.txt を作成してください。\n"
            "例: Copy-Item topic.example.txt topic.txt"
        )
    if not topic:
        raise SystemExit("topic.txt が空です。topic.example.txt を参考に議題を入力してください。")
    return topic


def has_possible_secret(text: str) -> bool:
    return any(pattern.search(text) for pattern in SECRET_PATTERNS)


def next_meeting_id(save_dir: Path, filename_prefix: str, now: datetime | None = None) -> str:
    now = now or datetime.now()
    date_part = now.strftime("%Y%m%d")
    save_dir.mkdir(parents=True, exist_ok=True)
    pattern = re.compile(rf"^{re.escape(date_part)}_(\d{{3}})_{re.escape(filename_prefix)}\.md$")
    numbers: list[int] = []
    for path in save_dir.glob(f"{date_part}_*_{filename_prefix}.md"):
        match = pattern.match(path.name)
        if match:
            numbers.append(int(match.group(1)))
    return f"{date_part}_{(max(numbers) + 1) if numbers else 1:03d}"


def output_path_for(config: dict[str, Any], meeting_id: str) -> Path:
    output_config = config.get("output", {})
    save_dir = ROOT / output_config.get("save_dir", "output")
    filename_prefix = output_config.get("filename_prefix", "ai_board")
    return save_dir / f"{meeting_id}_{filename_prefix}.md"


def build_run_metadata(
    *,
    config: dict[str, Any],
    started_at: datetime,
    dry_run: bool,
) -> dict[str, Any]:
    return {
        "started_at": started_at.astimezone().isoformat(timespec="seconds"),
        "dry_run": dry_run,
        "openai_store_responses": OPENAI_STORE_RESPONSES,
        "mode": config.get("mode"),
        "rounds": config.get("rounds"),
        "limits": config.get("limits", {}),
        "models": config.get("models", {}),
    }


def compact_topic(topic: str, max_chars: int = 500) -> str:
    return topic if len(topic) <= max_chars else topic[:max_chars] + "\n..."


def format_transcript(turns: list[Turn]) -> str:
    if not turns:
        return "まだ会議ログはありません。"
    chunks = []
    for turn in turns:
        chunks.append(
            f"## Round {turn.round_number} - {ROLE_NAMES[turn.role]}: {turn.title}\n\n{turn.content}"
        )
    return "\n\n".join(chunks)


def quote_markdown(text: str) -> str:
    return "\n".join(f"> {line}" if line else ">" for line in text.strip().splitlines())


def demote_markdown_headings(text: str, levels: int = 3) -> str:
    demoted_lines: list[str] = []
    for line in text.strip().splitlines():
        match = re.match(r"^(#{1,6})(\s+.*)$", line)
        if match:
            heading_marks, rest = match.groups()
            demoted_lines.append("#" * min(6, len(heading_marks) + levels) + rest)
        else:
            demoted_lines.append(line)
    return "\n".join(demoted_lines)


def markdown_list(items: list[str], ordered: bool = False) -> list[str]:
    if not items:
        return ["- なし"]
    if ordered:
        return [f"{index}. {item}" for index, item in enumerate(items, start=1)]
    return [f"- {item}" for item in items]


def render_final_decision(decision: dict[str, Any]) -> str:
    summaries = decision["agent_summaries"]
    lines = [
        "## 3. 最終結論",
        decision["final_conclusion"],
        "",
        "## 4. 採用案",
        *markdown_list(decision["adopted_proposals"]),
        "",
        "## 5. 却下案",
        *markdown_list(decision["rejected_proposals"]),
        "",
        "## 6. 主な理由",
        *markdown_list(decision["main_reasons"]),
        "",
        "## 7. 次にやること",
        *markdown_list(decision["next_actions"], ordered=True),
        "",
        "## 8. 未解決論点",
        *markdown_list(decision["unresolved_issues"]),
        "",
        "## 9. 追加で確認すべきこと",
        *markdown_list(decision["additional_checks"]),
        "",
        "## 10. 結論の自信度",
        decision["confidence"],
        "",
        "## 11. 自信度の理由",
        *markdown_list(decision["confidence_reasons"]),
        "",
        "## 12. 各AIの要約",
        "### Proposer",
        summaries["proposer"],
        "",
        "### Critic",
        summaries["critic"],
        "",
        "### Judge",
        summaries["judge"],
    ]
    return "\n".join(lines)


def validate_string_list(value: Any, field_name: str) -> list[str]:
    if not isinstance(value, list):
        raise RuntimeError(f"Judge最終出力の {field_name} は配列である必要があります。")
    normalized: list[str] = []
    for item in value:
        if not isinstance(item, str):
            raise RuntimeError(f"Judge最終出力の {field_name} に文字列以外が含まれています。")
        text = item.strip()
        if text:
            normalized.append(text)
    return normalized


def validate_non_empty_string(value: Any, field_name: str) -> str:
    if not isinstance(value, str):
        raise RuntimeError(f"Judge最終出力の {field_name} は文字列である必要があります。")
    text = value.strip()
    if not text:
        raise RuntimeError(f"Judge最終出力の {field_name} が空です。")
    return text


def validate_final_decision(data: Any) -> dict[str, Any]:
    if not isinstance(data, dict):
        raise RuntimeError("Judge最終出力はJSON objectである必要があります。")

    required_strings = ["final_conclusion", "confidence"]
    required_lists = [
        "adopted_proposals",
        "rejected_proposals",
        "main_reasons",
        "next_actions",
        "unresolved_issues",
        "additional_checks",
        "confidence_reasons",
    ]
    for field in required_strings + required_lists + ["agent_summaries"]:
        if field not in data:
            raise RuntimeError(f"Judge最終出力に必須項目 {field} がありません。")

    confidence = str(data["confidence"]).strip()
    if confidence not in {"高", "中", "低"}:
        raise RuntimeError("Judge最終出力の confidence は 高 / 中 / 低 のいずれかである必要があります。")

    summaries = data["agent_summaries"]
    if not isinstance(summaries, dict):
        raise RuntimeError("Judge最終出力の agent_summaries はobjectである必要があります。")
    for role in ("proposer", "critic", "judge"):
        if not isinstance(summaries.get(role), str) or not summaries[role].strip():
            raise RuntimeError(f"Judge最終出力の agent_summaries.{role} が不正です。")

    return {
        "final_conclusion": validate_non_empty_string(data["final_conclusion"], "final_conclusion"),
        "adopted_proposals": validate_string_list(data["adopted_proposals"], "adopted_proposals"),
        "rejected_proposals": validate_string_list(data["rejected_proposals"], "rejected_proposals"),
        "main_reasons": validate_string_list(data["main_reasons"], "main_reasons"),
        "next_actions": validate_string_list(data["next_actions"], "next_actions"),
        "unresolved_issues": validate_string_list(data["unresolved_issues"], "unresolved_issues"),
        "additional_checks": validate_string_list(data["additional_checks"], "additional_checks"),
        "confidence": confidence,
        "confidence_reasons": validate_string_list(data["confidence_reasons"], "confidence_reasons"),
        "agent_summaries": {
            "proposer": summaries["proposer"].strip(),
            "critic": summaries["critic"].strip(),
            "judge": summaries["judge"].strip(),
        },
    }


def build_prompt(role: str, round_number: int, title: str, topic: str, turns: list[Turn]) -> str:
    transcript = format_transcript(turns)

    if role == "proposer" and round_number == 1:
        instruction = """初期提案を出してください。
- 主要な案
- 実行方法
- メリット
- 成功条件
- 最初にやること
を含めてください。"""
    elif role == "critic" and round_number == 1:
        instruction = """Proposerの初期提案を批判的にレビューしてください。
- 致命的リスク
- 修正可能な問題
- 見落とされている前提
- 追加で確認すべきこと
を分けてください。"""
    elif role == "judge" and round_number == 1:
        instruction = """Round 1の中間整理をしてください。
- 現時点の有力案
- 主な対立点
- 修正すべき点
- Round 2で確認すべきこと
を簡潔にまとめてください。まだ最終結論にはしないでください。"""
    elif role == "proposer" and round_number == 2:
        instruction = """CriticとJudgeの指摘を踏まえて、修正案を出してください。
- 採用すべき修正
- 捨てるべき案
- 現実的な実行順序
- 残るリスクへの対処
を含めてください。"""
    elif role == "critic" and round_number == 2:
        instruction = """修正案を最終チェックしてください。
- まだ残る致命的リスク
- 実行前に確認すべきこと
- MVPから外すべきこと
- 判断を保留すべき条件
を分けてください。"""
    else:
        instruction = """最終結論を出してください。
出力は指定されたJSON Schemaに従ってください。Markdown見出しは書かないでください。

必ず以下を埋めてください。
- final_conclusion: 最終結論
- adopted_proposals: 採用案
- rejected_proposals: 却下案、またはMVPから外す案
- main_reasons: 主な理由
- next_actions: 次にやること
- unresolved_issues: 未解決論点
- additional_checks: 追加で確認すべきこと
- confidence: 高 / 中 / 低 のいずれか
- confidence_reasons: 自信度の理由
- agent_summaries: Proposer / Critic / Judge の要約

曖昧な両論併記で終わらず、実行可能な次アクションまで落としてください。"""

    return f"""# 議題
{topic}

# これまでの会議ログ
{transcript}

# 今回の担当
{ROLE_NAMES[role]} - {title}

# 指示
{instruction}
"""


def extract_response_text(response: Any) -> str:
    output_text = getattr(response, "output_text", None)
    if output_text:
        return str(output_text).strip()

    if hasattr(response, "model_dump"):
        data = response.model_dump()
    elif isinstance(response, dict):
        data = response
    else:
        data = {}

    texts: list[str] = []
    for item in data.get("output", []) or []:
        for content in item.get("content", []) or []:
            text = content.get("text")
            if text:
                texts.append(text)
    if texts:
        return "\n".join(texts).strip()

    choices = data.get("choices", [])
    if choices:
        message = choices[0].get("message", {})
        content = message.get("content")
        if content:
            return str(content).strip()

    return str(response).strip()


def call_openai(
    *,
    model: str,
    temperature: float,
    max_output_tokens: int,
    system_prompt: str,
    user_prompt: str,
    response_format: dict[str, Any] | None = None,
) -> str:
    try:
        from openai import OpenAI
    except ImportError:
        raise RuntimeError("openai パッケージが未インストールです。`pip install -U -r requirements.txt` を実行してください。")

    if not os.environ.get("OPENAI_API_KEY"):
        raise RuntimeError("OPENAI_API_KEY が見つかりません。.env に設定してください。")

    client = OpenAI()

    if hasattr(client, "responses"):
        try:
            request: dict[str, Any] = {
                "model": model,
                "input": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": temperature,
                "max_output_tokens": max_output_tokens,
                "store": OPENAI_STORE_RESPONSES,
            }
            if response_format is not None:
                request["text"] = {"format": response_format}
            response = client.responses.create(**request)
        except TypeError as exc:
            if "store" in str(exc) or "text" in str(exc):
                raise RuntimeError(
                    "OpenAI SDKがResponses APIのstore=falseまたはStructured Outputs指定に対応していません。"
                    "`pip install -U openai` を実行してください。"
                ) from exc
            raise
        return extract_response_text(response)

    raise RuntimeError(
        "OpenAI SDKのResponses APIが見つかりません。"
        "`pip install -U openai` を実行してください。"
    )


def call_openai_json(
    *,
    model: str,
    temperature: float,
    max_output_tokens: int,
    system_prompt: str,
    user_prompt: str,
    response_format: dict[str, Any],
) -> dict[str, Any]:
    text = call_openai(
        model=model,
        temperature=temperature,
        max_output_tokens=max_output_tokens,
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        response_format=response_format,
    )
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Judge最終出力のJSON parseに失敗しました: {exc}") from exc
    if not isinstance(parsed, dict):
        raise RuntimeError("Judge最終出力はJSON objectである必要があります。")
    return parsed


def dry_run_final_decision() -> dict[str, Any]:
    return {
        "final_conclusion": "AI会議室 v0.1 は、3役・2ラウンド固定のCLI版として作るのがよい。",
        "adopted_proposals": [
            "OpenAIのみでまず動く構成にする",
            "`topic.txt`、`config.json`、`debate.py` の最小構成にする",
            "Markdownは結論を先、会議ログを後ろにする",
        ],
        "rejected_proposals": [
            "GUIを初期実装する",
            "Web検索やDeep Researchを初期実装する",
            "厳密な円コスト上限を初期実装する",
        ],
        "main_reasons": [
            "実装範囲が小さく、完成まで持っていきやすい",
            "後からAnthropicやDev Reviewerへ拡張しやすい",
            "出力形式を固定することで、意思決定に使いやすい",
        ],
        "next_actions": [
            "`.env` に `OPENAI_API_KEY` を設定する",
            "`topic.txt` に実際の議題を書く",
            "`python debate.py` を実行して出力を確認する",
        ],
        "unresolved_issues": [
            "利用するOpenAIモデルを最新の利用可能モデルにするか",
            "将来のDev Reviewerをどの段階で入れるか",
        ],
        "additional_checks": [
            "API料金の運用上限",
            "議題に機密情報を含めない運用ルール",
        ],
        "confidence": "中",
        "confidence_reasons": [
            "MVP範囲は明確だが、実際のモデル料金と利用可能モデルは環境で確認が必要",
        ],
        "agent_summaries": {
            "proposer": "小さく作り、Markdown出力まで完成させる案を提示した。",
            "critic": "初期スコープ肥大、コスト管理、秘密情報の扱いをリスクとして指摘した。",
            "judge": "v0.1は軽量CLIとして完成を優先する判断にまとめた。",
        },
    }


def dry_run_response(role: str, round_number: int, title: str) -> str:
    if role == "judge" and round_number == 2:
        return render_final_decision(validate_final_decision(dry_run_final_decision()))

    return f"""### {ROLE_NAMES[role]} - {title}
これは `--dry-run` によるダミー応答です。
実際の実行ではOpenAI APIから、この役割に応じた発言が生成されます。"""


def call_role(
    *,
    role: str,
    round_number: int,
    title: str,
    topic: str,
    turns: list[Turn],
    config: dict[str, Any],
    dry_run: bool,
) -> str:
    if dry_run:
        return dry_run_response(role, round_number, title)

    role_config = config["models"][role]
    max_tokens = int(config["limits"]["max_tokens_per_turn"])
    prompt = build_prompt(role, round_number, title, topic, turns)
    return call_openai(
        model=role_config["model"],
        temperature=float(role_config.get("temperature", 0.2)),
        max_output_tokens=max_tokens,
        system_prompt=SYSTEM_PROMPTS[role],
        user_prompt=prompt,
    )


def call_final_judge(
    *,
    topic: str,
    turns: list[Turn],
    config: dict[str, Any],
    dry_run: bool,
) -> dict[str, Any]:
    if dry_run:
        return validate_final_decision(dry_run_final_decision())

    role_config = config["models"]["judge"]
    max_tokens = int(config["limits"]["max_tokens_per_turn"])
    prompt = build_prompt("judge", 2, "最終結論", topic, turns)
    raw_decision = call_openai_json(
        model=role_config["model"],
        temperature=float(role_config.get("temperature", 0.2)),
        max_output_tokens=max_tokens,
        system_prompt=SYSTEM_PROMPTS["judge"],
        user_prompt=prompt,
        response_format=FINAL_DECISION_RESPONSE_FORMAT,
    )
    return validate_final_decision(raw_decision)


def render_markdown(
    *,
    meeting_id: str,
    topic: str,
    turns: list[Turn],
    final_decision: dict[str, Any] | None,
    metadata: dict[str, Any],
    partial: bool,
    error: str | None = None,
) -> str:
    lines = [
        "# AI会議室 結論",
        "",
        "## 1. Meeting ID",
        meeting_id,
        "",
        "- 実行日時: " + str(metadata.get("started_at", "")),
        "- Dry run: " + ("yes" if metadata.get("dry_run") else "no"),
        "- API response store: " + ("true" if metadata.get("openai_store_responses") else "false"),
        "- Mode: " + str(metadata.get("mode", "")),
        "- Rounds: " + str(metadata.get("rounds", "")),
        "",
        "### Models",
        "",
    ]

    models = metadata.get("models", {})
    for role in ("proposer", "critic", "judge"):
        role_config = models.get(role, {})
        lines.append(
            "- "
            + role
            + ": "
            + str(role_config.get("provider", ""))
            + " / "
            + str(role_config.get("model", ""))
            + " / temperature="
            + str(role_config.get("temperature", ""))
        )

    lines.extend(
        [
        "",
        "## 2. 議題",
        "",
        quote_markdown(topic),
        "",
        ]
    )

    if partial:
        lines.extend(
            [
                "## 3. ステータス",
                "途中保存です。会議は正常終了していません。",
                "",
            ]
        )
        if error:
            lines.extend(["## 4. エラー", error, ""])
        if final_decision:
            lines.extend([render_final_decision(final_decision), ""])
    elif final_decision:
        lines.extend([render_final_decision(final_decision), ""])
    else:
        lines.extend(["## 3. 最終結論", "最終結論は生成されていません。", ""])

    lines.extend(["## 13. 会議ログ", ""])
    current_round = None
    for turn in turns:
        if current_round != turn.round_number:
            current_round = turn.round_number
            lines.extend([f"### Round {current_round}", ""])
        lines.extend(
            [
                f"#### {ROLE_NAMES[turn.role]}: {turn.title}",
                "",
                demote_markdown_headings(turn.content),
                "",
            ]
        )

    return "\n".join(lines).rstrip() + "\n"


def save_markdown(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def print_run_settings(config: dict[str, Any], topic: str, meeting_id: str, output_path: Path, dry_run: bool) -> None:
    print("AI会議室 v0.1")
    print(f"Meeting ID: {meeting_id}")
    print(f"Output: {output_path}")
    print(f"Mode: {config['mode']}")
    print(f"Rounds: {config['rounds']}")
    print(f"Dry run: {'yes' if dry_run else 'no'}")
    print(f"API response store: {str(OPENAI_STORE_RESPONSES).lower()}")
    print("")
    print("Models:")
    for role in ("proposer", "critic", "judge"):
        role_config = config["models"][role]
        print(
            f"- {role}: {role_config['provider']} / {role_config['model']} / temperature={role_config.get('temperature')}"
        )
    print("")
    max_tokens = int(config["limits"]["max_tokens_per_turn"])
    max_turns = int(config["limits"]["max_total_turns"])
    print("Limits:")
    print(f"- max_tokens_per_turn: {max_tokens}")
    print(f"- max_total_turns: {max_turns}")
    if config["limits"].get("show_estimated_cost"):
        print(f"- max_output_tokens_upper_bound: {max_tokens * len(TURN_PLAN)} tokens")
        print("- estimated_cost: モデル料金は変動するため、v0.1では厳密計算しません。")
    print("")
    print("Topic preview:")
    print(compact_topic(topic))
    print("")


def confirm_or_exit(enabled: bool) -> None:
    if not enabled:
        return
    answer = input("この設定でAPIを呼びます。続行しますか？ [y/N]: ").strip().lower()
    if answer not in {"y", "yes", "はい"}:
        raise SystemExit("実行を中止しました。")


def run(dry_run: bool, yes: bool) -> Path:
    started_at = datetime.now().astimezone()
    load_dotenv(ENV_PATH)
    config = load_json(CONFIG_PATH)
    validate_config(config)
    topic = read_topic(TOPIC_PATH)

    output_config = config.get("output", {})
    save_dir = ROOT / output_config.get("save_dir", "output")
    filename_prefix = output_config.get("filename_prefix", "ai_board")
    meeting_id = next_meeting_id(save_dir, filename_prefix)
    output_path = output_path_for(config, meeting_id)
    metadata = build_run_metadata(config=config, started_at=started_at, dry_run=dry_run)

    print_run_settings(config, topic, meeting_id, output_path, dry_run)

    if config.get("safety", {}).get("no_secret_mode", True) and has_possible_secret(topic):
        print("警告: topic.txt にAPIキー、パスワード、トークンらしき文字列が含まれている可能性があります。")
        print("機密情報を外部APIに送らないでください。")
        print("")

    if not dry_run:
        confirm_or_exit(config.get("safety", {}).get("confirm_before_api_call", True) and not yes)

    turns: list[Turn] = []
    final_decision: dict[str, Any] | None = None

    try:
        for round_number, role, title in TURN_PLAN:
            print(f"Running Round {round_number}: {ROLE_NAMES[role]} - {title}")
            if role == "judge" and round_number == 2:
                final_decision = call_final_judge(
                    topic=topic,
                    turns=turns,
                    config=config,
                    dry_run=dry_run,
                )
                content = render_final_decision(final_decision)
            else:
                content = call_role(
                    role=role,
                    round_number=round_number,
                    title=title,
                    topic=topic,
                    turns=turns,
                    config=config,
                    dry_run=dry_run,
                )
            turn = Turn(round_number=round_number, role=role, title=title, content=content)
            turns.append(turn)

        markdown = render_markdown(
            meeting_id=meeting_id,
            topic=topic,
            turns=turns,
            final_decision=final_decision,
            metadata=metadata,
            partial=False,
        )
        save_markdown(output_path, markdown)
        return output_path
    except Exception as exc:
        if config.get("safety", {}).get("save_partial_on_error", True):
            markdown = render_markdown(
                meeting_id=meeting_id,
                topic=topic,
                turns=turns,
                final_decision=final_decision,
                metadata=metadata,
                partial=True,
                error=str(exc),
            )
            save_markdown(output_path, markdown)
            print(f"エラーが発生したため、途中結果を保存しました: {output_path}")
        raise


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="AI会議室 v0.1 CLI")
    parser.add_argument("--dry-run", action="store_true", help="OpenAI APIを呼ばずにダミー応答で出力を生成する")
    parser.add_argument("--yes", action="store_true", help="確認プロンプトを省略する")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    try:
        output_path = run(dry_run=args.dry_run, yes=args.yes)
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
