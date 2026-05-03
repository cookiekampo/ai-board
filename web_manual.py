from __future__ import annotations

import html
import json
import socket
import sys
import urllib.parse
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

import debate
import manual_debate


HOST = "0.0.0.0"
PORT = 8765
STATE_PATH = debate.ROOT / "output" / ".web_manual_state.json"
APP_VERSION = "web-manual-copy-fallback-2"


def local_ip() -> str:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.connect(("8.8.8.8", 80))
            return sock.getsockname()[0]
    except OSError:
        return "127.0.0.1"


def base_state() -> dict[str, Any]:
    started_at = datetime.now().astimezone()
    config = debate.load_json(debate.CONFIG_PATH)
    debate.validate_config(config)
    topic = debate.read_topic(debate.TOPIC_PATH)
    output_config = config.get("output", {})
    save_dir = debate.ROOT / output_config.get("save_dir", "output")
    filename_prefix = output_config.get("filename_prefix", "ai_board")
    meeting_id = debate.next_meeting_id(save_dir, f"{filename_prefix}_web_manual")
    metadata = manual_debate.build_manual_metadata(config, started_at)
    metadata["web_manual_mode"] = True
    return {
        "meeting_id": meeting_id,
        "started_at": metadata["started_at"],
        "topic": topic,
        "turn_index": 0,
        "turns": [],
        "saved_path": None,
        "metadata": metadata,
    }


def load_state() -> dict[str, Any] | None:
    if not STATE_PATH.exists():
        return None
    try:
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None


def save_state(state: dict[str, Any]) -> None:
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


def clear_state() -> None:
    if STATE_PATH.exists():
        STATE_PATH.unlink()


def state_turns(state: dict[str, Any]) -> list[debate.Turn]:
    turns: list[debate.Turn] = []
    for item in state.get("turns", []):
        turns.append(
            debate.Turn(
                round_number=int(item["round_number"]),
                role=str(item["role"]),
                title=str(item["title"]),
                content=str(item["content"]),
            )
        )
    return turns


def current_turn(state: dict[str, Any]) -> tuple[int, str, str] | None:
    index = int(state.get("turn_index", 0))
    if index >= len(debate.TURN_PLAN):
        return None
    return debate.TURN_PLAN[index]


def output_path_for(state: dict[str, Any]) -> Path:
    config = debate.load_json(debate.CONFIG_PATH)
    output_config = config.get("output", {})
    save_dir = debate.ROOT / output_config.get("save_dir", "output")
    filename_prefix = output_config.get("filename_prefix", "ai_board")
    return save_dir / f"{state['meeting_id']}_{filename_prefix}_web_manual.md"


def save_meeting(state: dict[str, Any], partial: bool = False, error: str | None = None) -> Path:
    turns = state_turns(state)
    output_path = output_path_for(state)
    markdown = manual_debate.render_manual_markdown(
        meeting_id=state["meeting_id"],
        topic=state["topic"],
        turns=turns,
        metadata=state["metadata"],
        partial=partial,
        error=error,
    )
    debate.save_markdown(output_path, markdown)
    state["saved_path"] = str(output_path)
    save_state(state)
    return output_path


def page(title: str, body: str) -> bytes:
    html_doc = f"""<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(title)}</title>
  <style>
    :root {{
      color-scheme: light dark;
      --bg: #f6f7f9;
      --fg: #16181d;
      --muted: #626a76;
      --line: #d9dde5;
      --panel: #ffffff;
      --accent: #0f6b5f;
      --accent-fg: #ffffff;
      --danger: #a23131;
      --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }}
    @media (prefers-color-scheme: dark) {{
      :root {{
        --bg: #111418;
        --fg: #f1f3f5;
        --muted: #a3aab5;
        --line: #313842;
        --panel: #1a1f26;
        --accent: #39a693;
        --accent-fg: #08110f;
        --danger: #e08383;
      }}
    }}
    * {{ box-sizing: border-box; }}
    body {{ margin: 0; background: var(--bg); color: var(--fg); line-height: 1.5; }}
    main {{ width: min(960px, 100%); margin: 0 auto; padding: 16px; }}
    header {{ display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 16px; }}
    h1 {{ font-size: 22px; margin: 0; }}
    h2 {{ font-size: 18px; margin: 20px 0 8px; }}
    p {{ margin: 8px 0; }}
    .panel {{ background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 14px; margin: 12px 0; }}
    .muted {{ color: var(--muted); }}
    .row {{ display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }}
    button, .button {{
      appearance: none;
      border: 1px solid var(--line);
      background: var(--panel);
      color: var(--fg);
      border-radius: 8px;
      padding: 10px 12px;
      font: inherit;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 42px;
      cursor: pointer;
    }}
    button.primary, .button.primary {{ background: var(--accent); color: var(--accent-fg); border-color: var(--accent); }}
    button.danger, .button.danger {{ color: var(--danger); }}
    textarea {{
      width: 100%;
      min-height: 220px;
      resize: vertical;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 10px;
      background: var(--panel);
      color: var(--fg);
      font: 14px/1.5 var(--mono);
    }}
    .prompt {{ min-height: 340px; white-space: pre-wrap; }}
    .prompt-text {{
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 10px;
      background: var(--panel);
      font: 14px/1.5 var(--mono);
      white-space: pre-wrap;
      user-select: text;
      -webkit-user-select: text;
    }}
    .copy-page .prompt-text {{
      max-height: none;
      overflow: visible;
      font-size: 16px;
    }}
    .badge {{ border: 1px solid var(--line); border-radius: 999px; padding: 4px 8px; color: var(--muted); font-size: 13px; }}
    .turn-list {{ padding-left: 20px; }}
    .turn-list li {{ margin: 4px 0; }}
  </style>
</head>
<body>
<main>
{body}
</main>
<script>
async function copyPrompt() {{
  const prompt = document.getElementById('prompt');
  if (!prompt) return;
  const status = document.getElementById('copy-status');
  try {{
    if (navigator.clipboard && window.isSecureContext) {{
      await navigator.clipboard.writeText(prompt.value);
      if (status) status.textContent = 'コピーしました';
      return;
    }}
    prompt.focus();
    prompt.select();
    prompt.setSelectionRange(0, prompt.value.length);
    const ok = document.execCommand('copy');
    if (status) status.textContent = ok ? 'コピーしました' : '選択しました。共有/コピーを使ってください';
  }} catch (error) {{
    prompt.focus();
    prompt.select();
    prompt.setSelectionRange(0, prompt.value.length);
    if (status) status.textContent = '選択しました。共有/コピーを使ってください';
  }}
}}
function selectPromptText() {{
  const prompt = document.getElementById('prompt');
  if (!prompt) return;
  prompt.focus();
  prompt.select();
  prompt.setSelectionRange(0, prompt.value.length);
  const status = document.getElementById('copy-status');
  if (status) status.textContent = '選択しました';
}}
</script>
</body>
</html>"""
    return html_doc.encode("utf-8")


def index_page(state: dict[str, Any]) -> bytes:
    turn = current_turn(state)
    turns = state_turns(state)
    saved_path = state.get("saved_path")
    header = f"""<header>
  <div>
    <h1>AI会議室 半手動Web</h1>
    <p class="muted">Meeting ID: {html.escape(state['meeting_id'])}</p>
    <p class="muted">Version: {APP_VERSION}</p>
  </div>
  <form method="post" action="/reset"><button class="danger" type="submit">新規開始</button></form>
</header>"""

    if turn is None:
        body = header + f"""
<section class="panel">
  <h2>完了</h2>
  <p>全ターンの入力が完了しました。</p>
  <p>保存先: <code>{html.escape(saved_path or '')}</code></p>
  <form method="post" action="/save"><button class="primary" type="submit">再保存</button></form>
</section>
{turns_panel(turns)}
"""
        return page("AI会議室 半手動Web", body)

    round_number, role, title = turn
    prompt = manual_debate.build_manual_prompt(role, round_number, title, state["topic"], turns)
    body = header + f"""
<section class="panel">
  <div class="row">
    <span class="badge">Round {round_number}</span>
    <span class="badge">{html.escape(debate.ROLE_NAMES[role])}</span>
    <span class="badge">{html.escape(title)}</span>
  </div>
  <p class="muted">貼り付け先の目安: {html.escape(manual_debate.MANUAL_TARGETS[role])}</p>
</section>
<section class="panel">
  <h2>1. このプロンプトをコピー</h2>
  <textarea id="prompt" class="prompt" readonly>{html.escape(prompt)}</textarea>
  <div class="row">
    <button class="primary" type="button" onclick="copyPrompt()">コピー</button>
    <button type="button" onclick="selectPromptText()">全選択</button>
    <span id="copy-status" class="muted"></span>
  </div>
  <p class="muted">iPhoneでコピーできない場合は「全選択」を押してから、選択範囲を長押ししてコピーしてください。</p>
  <p><a class="button" href="/prompt">プロンプトだけを開く</a></p>
  <details>
    <summary>長押しコピー用テキスト</summary>
    <pre class="prompt-text">{html.escape(prompt)}</pre>
  </details>
</section>
<section class="panel">
  <h2>2. AIの返答を貼り戻す</h2>
  <form method="post" action="/submit">
    <textarea name="content" required placeholder="ChatGPT / Claude の返答をここに貼る"></textarea>
    <div class="row">
      <button class="primary" type="submit">保存して次へ</button>
      <button formaction="/save-partial" type="submit">途中保存</button>
    </div>
  </form>
</section>
{turns_panel(turns)}
"""
    return page("AI会議室 半手動Web", body)


def prompt_page(state: dict[str, Any]) -> bytes:
    turn = current_turn(state)
    if turn is None:
        return page(
            "プロンプト",
            """<header><h1>プロンプト</h1></header>
<section class="panel"><p>全ターンが完了しています。</p><p><a class="button" href="/">戻る</a></p></section>""",
        )
    turns = state_turns(state)
    round_number, role, title = turn
    prompt = manual_debate.build_manual_prompt(role, round_number, title, state["topic"], turns)
    body = f"""<header>
  <div>
    <h1>プロンプト</h1>
    <p class="muted">Round {round_number}: {html.escape(debate.ROLE_NAMES[role])} - {html.escape(title)}</p>
  </div>
  <a class="button" href="/">戻る</a>
</header>
<section class="panel copy-page">
  <p class="muted">iPhoneでは下のテキストを長押しして、範囲を広げてコピーしてください。</p>
  <pre class="prompt-text">{html.escape(prompt)}</pre>
</section>"""
    return page("プロンプト", body)


def turns_panel(turns: list[debate.Turn]) -> str:
    if not turns:
        return """<section class="panel"><h2>会議ログ</h2><p class="muted">まだ入力はありません。</p></section>"""
    items = "\n".join(
        f"<li>Round {turn.round_number}: {html.escape(debate.ROLE_NAMES[turn.role])} - {html.escape(turn.title)}</li>"
        for turn in turns
    )
    return f"""<section class="panel">
  <h2>会議ログ</h2>
  <ol class="turn-list">{items}</ol>
</section>"""


class Handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        path = urllib.parse.urlparse(self.path).path
        if path == "/prompt":
            state = load_state()
            if state is None:
                state = base_state()
                save_state(state)
            self.send_html(prompt_page(state))
            return
        if path not in {"/", "/index.html"}:
            self.send_error(404)
            return
        state = load_state()
        if state is None:
            state = base_state()
            save_state(state)
        self.send_html(index_page(state))

    def do_POST(self) -> None:
        path = urllib.parse.urlparse(self.path).path
        if path == "/reset":
            clear_state()
            state = base_state()
            save_state(state)
            self.redirect("/")
            return

        state = load_state()
        if state is None:
            state = base_state()
            save_state(state)

        if path == "/submit":
            form = self.read_form()
            content = str(form.get("content", "")).strip()
            if not content:
                self.send_error(400, "content is required")
                return
            turn = current_turn(state)
            if turn is None:
                self.redirect("/")
                return
            round_number, role, title = turn
            state["turns"].append(
                {
                    "round_number": round_number,
                    "role": role,
                    "title": title,
                    "content": content,
                }
            )
            state["turn_index"] = int(state.get("turn_index", 0)) + 1
            if current_turn(state) is None:
                save_meeting(state, partial=False)
            else:
                save_state(state)
            self.redirect("/")
            return

        if path == "/save":
            save_meeting(state, partial=False)
            self.redirect("/")
            return

        if path == "/save-partial":
            form = self.read_form()
            content = str(form.get("content", "")).strip()
            turn = current_turn(state)
            if content and turn is not None:
                round_number, role, title = turn
                state["turns"].append(
                    {
                        "round_number": round_number,
                        "role": role,
                        "title": title,
                        "content": content,
                    }
                )
                state["turn_index"] = int(state.get("turn_index", 0)) + 1
            save_meeting(state, partial=True, error="ユーザーが途中保存しました。")
            self.redirect("/")
            return

        self.send_error(404)

    def read_form(self) -> dict[str, str]:
        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length).decode("utf-8")
        parsed = urllib.parse.parse_qs(body, keep_blank_values=True)
        return {key: values[0] if values else "" for key, values in parsed.items()}

    def send_html(self, content: bytes) -> None:
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def redirect(self, location: str) -> None:
        self.send_response(303)
        self.send_header("Location", location)
        self.end_headers()

    def log_message(self, format: str, *args: Any) -> None:
        print(format % args)


def main(argv: list[str] | None = None) -> int:
    host = HOST
    port = PORT
    server = ThreadingHTTPServer((host, port), Handler)
    ip = local_ip()
    print("AI会議室 半手動Web", flush=True)
    print(f"PC:      http://127.0.0.1:{port}", flush=True)
    print(f"iPhone:  http://{ip}:{port}", flush=True)
    print("同じWi-Fi上のiPhoneブラウザから iPhone のURLを開いてください。", flush=True)
    print("停止: Ctrl+C", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("")
        print("停止しました。")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
