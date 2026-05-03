const STORAGE_KEY = "ai-board-static-v0.1";
const TOTAL_STEPS = 6;

const templates = {
  general: `# 議題

# 背景

# 判断したいこと

# 制約

# 使える資源

# やらないこと

# 欲しくない回答

# 判断基準

# 回答の粒度

# 出力形式
採用案、却下案、主な理由、未解決論点、追加確認事項、次アクション`,
  marketing: `# 議題
集客について

# 背景
新規顧客・相談者を増やしたい。

# 判断したいこと
今後優先すべき集客施策を決めたい。

# 制約
広告費は大きくかけない。
まずは1人でも実行できる範囲にしたい。
薬機法・景表法・医療広告ガイドラインに配慮する。

# 使える資源
Instagram、X、note、LINE、Webサイト、店頭、既存顧客、地域活動

# やらないこと
過度な値引き。
断定的な医療表現。
毎日大量投稿が前提の施策。

# 欲しくない回答
SNSを頑張る、広告を出す、SEOを強化する、などの一般論だけの回答。
毎日大量投稿が前提の回答。

# 判断基準
1人で続けられる。
LINE相談または来店相談につながる。
薬機法・景表法・医療広告ガイドライン上のリスクが低い。
3か月以内に小さく試せる。

# 回答の粒度
最初の2週間で何をするか分かる具体度。

# 出力形式
採用案、却下案、主な理由、未解決論点、追加確認事項、次アクション`
};

const steps = [
  {
    role: "Proposer / 提案者",
    title: "初期提案",
    target: "ChatGPT推奨",
    instruction: `初期提案を出してください。
必ず以下を含めてください。
- 主要な案
- 実行方法
- メリット
- 成功条件
- 最初にやること`,
    note: `現実的に実行できる案を優先してください。
抽象論だけで終わらせないでください。`
  },
  {
    role: "Critic / 批判者",
    title: "初期提案への批判",
    target: "Claude推奨",
    instruction: `Proposerの初期提案を批判的にレビューしてください。
必ず以下を含めてください。
- 致命的リスク
- 実行上の問題
- 見落としている前提
- コストや手間の懸念
- 法規制・信頼性・運用面の懸念
- 修正すれば使える点
- 追加で確認すべきこと`,
    note: `単なる否定ではなく、より良い案にするための批判をしてください。`
  },
  {
    role: "Proposer / 提案者",
    title: "修正提案",
    target: "ChatGPT推奨",
    instruction: `Criticの指摘を踏まえて、初期提案を修正してください。
必ず以下を含めてください。
- 残す案
- 捨てる案
- 修正する案
- 優先順位
- 具体的な実行手順
- コストを抑える方法
- 失敗しにくくする工夫
- 次に検証すべきこと`,
    note: `Criticの指摘を無視しないでください。
ただし、必要以上に保守的になりすぎず、実行可能な案にまとめてください。`
  },
  {
    role: "Critic / 批判者",
    title: "修正案レビュー",
    target: "Claude推奨",
    instruction: `Proposerの修正提案を再レビューしてください。
必ず以下を含めてください。
- まだ残っているリスク
- 実行前に潰すべき不明点
- 優先順位の妥当性
- 予算・手間・時間の現実性
- やらない方がよいこと
- 小さく試すならどうするべきか`,
    note: `最終判断に使えるように、重要度の高い論点から順に整理してください。`
  },
  {
    role: "Judge / 判定者",
    title: "暫定判断",
    target: "ChatGPTまたはClaude推奨",
    instruction: `ここまでの議論を整理し、暫定判断を出してください。
必ず以下を含めてください。
- 現時点の有力案
- 却下すべき案
- 判断理由
- まだ決めきれない論点
- 追加で確認すべきこと
- 最終結論に向けて不足している情報`,
    note: `まだ最終結論にしなくて構いません。
論点を整理し、最終判断しやすい形にしてください。`
  },
  {
    role: "Judge / 判定者",
    title: "最終結論",
    target: "ChatGPTまたはClaude推奨",
    instruction: `これまでの議論を踏まえて、最終結論を出してください。
必ず以下の見出しをこの順番で使ってください。
## 採用案
## 却下案
## 主な理由
## 未解決論点
## 追加確認事項
## 次アクション
## 実行順序
## 注意点
## 結論の自信度
## 自信度の理由
## 各AIの要約`,
    note: `最終結論は、実行に移せるレベルまで具体化してください。
抽象論ではなく、次に何をすればよいかが分かる形にしてください。`
  }
];

const aiUrls = {
  chatgpt: "https://chatgpt.com/",
  claude: "https://claude.ai/",
  gemini: "https://gemini.google.com/"
};

const shortcutNames = {
  chatgpt: "AI会議 ChatGPT",
  claude: "AI会議 Claude",
  gemini: "AI会議 Gemini"
};

const state = loadState();

const els = {
  roughTopic: document.getElementById("roughTopic"),
  topicPromptText: document.getElementById("topicPromptText"),
  copyTopicPromptButton: document.getElementById("copyTopicPromptButton"),
  openTopicChatGptButton: document.getElementById("openTopicChatGptButton"),
  openTopicClaudeButton: document.getElementById("openTopicClaudeButton"),
  openTopicGeminiButton: document.getElementById("openTopicGeminiButton"),
  shortcutTopicChatGptButton: document.getElementById("shortcutTopicChatGptButton"),
  shortcutTopicClaudeButton: document.getElementById("shortcutTopicClaudeButton"),
  shortcutTopicGeminiButton: document.getElementById("shortcutTopicGeminiButton"),
  draftTopicCardButton: document.getElementById("draftTopicCardButton"),
  topicPromptStatus: document.getElementById("topicPromptStatus"),
  generatedTopicCard: document.getElementById("generatedTopicCard"),
  applyGeneratedTopicButton: document.getElementById("applyGeneratedTopicButton"),
  generatedTopicStatus: document.getElementById("generatedTopicStatus"),
  templateSelect: document.getElementById("templateSelect"),
  topicCard: document.getElementById("topicCard"),
  saveStatus: document.getElementById("saveStatus"),
  stepTitle: document.getElementById("stepTitle"),
  completionBadge: document.getElementById("completionBadge"),
  progressBar: document.getElementById("progressBar"),
  promptText: document.getElementById("promptText"),
  copyPromptButton: document.getElementById("copyPromptButton"),
  openChatGptButton: document.getElementById("openChatGptButton"),
  openClaudeButton: document.getElementById("openClaudeButton"),
  openGeminiButton: document.getElementById("openGeminiButton"),
  shortcutChatGptButton: document.getElementById("shortcutChatGptButton"),
  shortcutClaudeButton: document.getElementById("shortcutClaudeButton"),
  shortcutGeminiButton: document.getElementById("shortcutGeminiButton"),
  copyStatus: document.getElementById("copyStatus"),
  answerText: document.getElementById("answerText"),
  saveAnswerButton: document.getElementById("saveAnswerButton"),
  answerStatus: document.getElementById("answerStatus"),
  logPreview: document.getElementById("logPreview"),
  markdownText: document.getElementById("markdownText"),
  copyMarkdownButton: document.getElementById("copyMarkdownButton"),
  downloadMarkdownButton: document.getElementById("downloadMarkdownButton"),
  markdownStatus: document.getElementById("markdownStatus"),
  resetButton: document.getElementById("resetButton")
};

init();

function init() {
  els.topicCard.value = state.topicCard;
  els.topicPromptText.value = generateTopicCardPrompt(els.roughTopic.value);
  bindEvents();
  render();
}

function bindEvents() {
  ["input", "change", "keyup", "compositionend"].forEach((eventName) => {
    els.roughTopic.addEventListener(eventName, updateTopicPrompt);
  });
  els.copyTopicPromptButton.addEventListener("click", () => copyText(els.topicPromptText.value, els.topicPromptText, els.topicPromptStatus));
  els.openTopicChatGptButton.addEventListener("click", () => copyTopicPromptAndOpen("chatgpt"));
  els.openTopicClaudeButton.addEventListener("click", () => copyTopicPromptAndOpen("claude"));
  els.openTopicGeminiButton.addEventListener("click", () => copyTopicPromptAndOpen("gemini"));
  els.shortcutTopicChatGptButton.addEventListener("click", () => copyTopicPromptAndRunShortcut("chatgpt"));
  els.shortcutTopicClaudeButton.addEventListener("click", () => copyTopicPromptAndRunShortcut("claude"));
  els.shortcutTopicGeminiButton.addEventListener("click", () => copyTopicPromptAndRunShortcut("gemini"));
  els.draftTopicCardButton.addEventListener("click", draftTopicCardFromRoughTopic);
  els.applyGeneratedTopicButton.addEventListener("click", applyGeneratedTopicCard);
  els.templateSelect.addEventListener("change", applyTemplate);
  els.topicCard.addEventListener("input", () => {
    state.topicCard = els.topicCard.value;
    persist("保存しました");
    render();
  });
  els.copyPromptButton.addEventListener("click", () => copyText(els.promptText.value, els.promptText, els.copyStatus));
  els.openChatGptButton.addEventListener("click", () => copyAndOpen("chatgpt"));
  els.openClaudeButton.addEventListener("click", () => copyAndOpen("claude"));
  els.openGeminiButton.addEventListener("click", () => copyAndOpen("gemini"));
  els.shortcutChatGptButton.addEventListener("click", () => copyAndRunShortcut("chatgpt"));
  els.shortcutClaudeButton.addEventListener("click", () => copyAndRunShortcut("claude"));
  els.shortcutGeminiButton.addEventListener("click", () => copyAndRunShortcut("gemini"));
  els.saveAnswerButton.addEventListener("click", saveAnswerAndNext);
  els.copyMarkdownButton.addEventListener("click", () => copyText(els.markdownText.value, els.markdownText, els.markdownStatus));
  els.downloadMarkdownButton.addEventListener("click", downloadMarkdown);
  els.resetButton.addEventListener("click", resetMeeting);
}

function updateTopicPrompt() {
  els.topicPromptText.value = generateTopicCardPrompt(els.roughTopic.value);
}

function generateTopicCardPrompt(roughTopic) {
  const topic = roughTopic.trim() || "未入力";
  return `あなたはAI会議室の事前整理担当です。
ユーザーの雑なテーマを、AI会議で使いやすい「議題カード」に整理してください。

## ユーザーの入力
${topic}

## 作成する議題カード
必ず以下の見出しで作成してください。

# 議題
# 背景
# 判断したいこと
# 制約
# 使える資源
# やらないこと
# 欲しくない回答
# 判断基準
# 回答の粒度
# 出力形式

## 作成方針
- 不明な情報は勝手に断定しない
- 不明な箇所は「未入力」または「要確認」と書く
- ユーザーがすぐ編集できるように簡潔に書く
- 一般論ではなく、AI会議で議論しやすい形にする
- 「判断したいこと」と「制約」を特に明確にする
- 「欲しくない回答」には、避けたい一般論や不要な方向性を書く
- 「判断基準」には、採用案を選ぶ基準を書く
- 「回答の粒度」には、どの程度具体的に答えるべきかを書く

## 出力形式
議題カードだけを出力してください。
余計な説明は不要です。`;
}

async function copyTopicPromptAndOpen(service) {
  const ok = await copyText(els.topicPromptText.value, els.topicPromptText, els.topicPromptStatus, false);
  if (!ok) {
    setStatus(els.topicPromptStatus, "コピーに失敗しました。先に手動でプロンプトをコピーしてください。", "error");
    return;
  }
  window.open(aiUrls[service], "_blank", "noopener,noreferrer");
}

async function copyTopicPromptAndRunShortcut(service) {
  await copyTextAndRunShortcut(service, els.topicPromptText.value, els.topicPromptText, els.topicPromptStatus);
}

function applyGeneratedTopicCard() {
  const generated = els.generatedTopicCard.value.trim();
  if (!generated) {
    setStatus(els.generatedTopicStatus, "AIが作った議題カードを貼り付けてください。", "error");
    return;
  }
  if (els.topicCard.value.trim() && !confirm("現在の議題カードを上書きします。よろしいですか？")) {
    return;
  }
  state.topicCard = generated;
  els.topicCard.value = generated;
  persist("議題カードを反映しました");
  setStatus(els.generatedTopicStatus, "議題カード欄へ反映しました。");
  render();
}

function draftTopicCardFromRoughTopic() {
  const roughTopic = els.roughTopic.value.trim();
  if (!roughTopic) {
    setStatus(els.topicPromptStatus, "雑なテーマを入力してください。", "error");
    return;
  }
  if (els.topicCard.value.trim() && !confirm("現在の議題カードを上書きします。よろしいですか？")) {
    return;
  }
  const draft = `# 議題
${roughTopic}

# 背景
未入力

# 判断したいこと
このテーマについて、今後取るべき方針を決めたい。

# 制約
未入力

# 使える資源
未入力

# やらないこと
未入力

# 欲しくない回答
一般論だけの回答。
具体的な次アクションがない回答。

# 判断基準
実行しやすさ。
効果の見込み。
リスクの低さ。
続けやすさ。

# 回答の粒度
次に何をすればよいか分かる具体度。

# 出力形式
採用案、却下案、主な理由、未解決論点、追加確認事項、次アクション`;
  state.topicCard = draft;
  els.topicCard.value = draft;
  persist("雑なテーマから仮カードを作成しました");
  setStatus(els.topicPromptStatus, "仮カードを議題カード欄へ反映しました。必要に応じて編集してください。");
  render();
}

function loadState() {
  const fallback = {
    topicCard: templates.general,
    currentStep: 1,
    answers: {},
    updatedAt: new Date().toISOString()
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      topicCard: typeof parsed.topicCard === "string" ? parsed.topicCard : fallback.topicCard,
      currentStep: normalizeStep(parsed.currentStep),
      answers: typeof parsed.answers === "object" && parsed.answers ? parsed.answers : {},
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : fallback.updatedAt
    };
  } catch {
    return fallback;
  }
}

function normalizeStep(step) {
  const n = Number(step);
  if (!Number.isFinite(n)) return 1;
  return Math.min(TOTAL_STEPS, Math.max(1, Math.trunc(n)));
}

function persist(message) {
  state.updatedAt = new Date().toISOString();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (message) setStatus(els.saveStatus, message);
  } catch {
    setStatus(els.saveStatus, "localStorage保存に失敗しました。画面操作は継続できます。", "warn");
  }
}

function applyTemplate() {
  const key = els.templateSelect.value;
  if (!key || !templates[key]) return;
  const hasInput = els.topicCard.value.trim().length > 0;
  if (hasInput && !confirm("現在の議題カードをテンプレートで上書きします。よろしいですか？")) {
    els.templateSelect.value = "";
    return;
  }
  state.topicCard = templates[key];
  els.topicCard.value = state.topicCard;
  persist("テンプレートを適用しました");
  els.templateSelect.value = "";
  render();
}

function currentStepIndex() {
  return normalizeStep(state.currentStep) - 1;
}

function isComplete() {
  return Boolean(state.answers[String(TOTAL_STEPS)] && String(state.answers[String(TOTAL_STEPS)]).trim());
}

function render() {
  const step = steps[currentStepIndex()];
  const complete = isComplete();
  els.stepTitle.textContent = `Step ${state.currentStep}: ${step.role} - ${step.title}`;
  els.completionBadge.textContent = complete ? "会議完了" : "進行中";
  els.progressBar.style.width = `${Math.round((countCompletedAnswers() / TOTAL_STEPS) * 100)}%`;
  els.promptText.value = complete ? "会議は完了しています。Markdownをコピーまたはダウンロードしてください。" : generatePrompt(state.currentStep, state.topicCard, state.answers);
  els.answerText.value = state.answers[String(state.currentStep)] || "";
  els.saveAnswerButton.textContent = state.currentStep === TOTAL_STEPS ? "回答を保存して会議完了" : "回答を保存して次へ";
  els.saveAnswerButton.disabled = complete;
  els.logPreview.textContent = buildMeetingLog(state.answers) || "まだ会議ログはありません。";
  els.markdownText.value = generateMarkdown();
}

function countCompletedAnswers() {
  let count = 0;
  for (let i = 1; i <= TOTAL_STEPS; i += 1) {
    if (state.answers[String(i)] && String(state.answers[String(i)]).trim()) count += 1;
  }
  return count;
}

function generatePrompt(stepNumber, topicCard, answers) {
  const step = steps[stepNumber - 1];
  const meetingLog = buildMeetingLogBefore(answers, stepNumber) || "まだ会議ログはありません。";
  return `あなたはAI会議室の ${step.role}です。

## 議題カード
${topicCard.trim() || "# 議題\\n"}

## これまでの会議ログ
${meetingLog}

## 今回の担当
${step.role} - ${step.title}

## 指示
${step.instruction}

## 注意
${step.note}`;
}

function buildMeetingLogBefore(answers, stepNumber) {
  const parts = [];
  for (let i = 1; i < stepNumber; i += 1) {
    const answer = answers[String(i)];
    if (answer && String(answer).trim()) {
      parts.push(`## Step ${i}: ${steps[i - 1].role.split(" / ")[0]} ${steps[i - 1].title}\n${String(answer).trim()}`);
    }
  }
  return parts.join("\n\n");
}

function buildMeetingLog(answers) {
  const parts = [];
  for (let i = 1; i <= TOTAL_STEPS; i += 1) {
    const answer = answers[String(i)];
    if (answer && String(answer).trim()) {
      parts.push(`## Step ${i}: ${steps[i - 1].role.split(" / ")[0]} ${steps[i - 1].title}\n${String(answer).trim()}`);
    }
  }
  return parts.join("\n\n");
}

function saveAnswerAndNext() {
  const answer = els.answerText.value.trim();
  if (!answer) {
    setStatus(els.answerStatus, "AIの回答を貼り戻してから保存してください。", "error");
    return;
  }
  state.answers[String(state.currentStep)] = answer;
  if (state.currentStep < TOTAL_STEPS) {
    state.currentStep += 1;
    setStatus(els.answerStatus, "回答を保存しました。次Stepのプロンプトを生成しました。");
  } else {
    setStatus(els.answerStatus, "Step 6を保存しました。会議完了です。");
  }
  persist();
  render();
}

async function copyAndOpen(service) {
  const ok = await copyText(els.promptText.value, els.promptText, els.copyStatus, false);
  if (!ok) {
    setStatus(els.copyStatus, "コピーに失敗しました。先に手動でプロンプトをコピーしてください。", "error");
    return;
  }
  window.open(aiUrls[service], "_blank", "noopener,noreferrer");
}

async function copyAndRunShortcut(service) {
  await copyTextAndRunShortcut(service, els.promptText.value, els.promptText, els.copyStatus);
}

async function copyTextAndRunShortcut(service, text, sourceEl, statusEl) {
  const ok = await copyText(text, sourceEl, statusEl, false);
  if (!ok) {
    setStatus(statusEl, "コピーに失敗しました。先に手動でプロンプトをコピーしてください。", "error");
    return;
  }
  const shortcutName = shortcutNames[service];
  const shortcutUrl = `shortcuts://run-shortcut?name=${encodeURIComponent(shortcutName)}`;
  setStatus(statusEl, `コピーしました。${shortcutName}を開きます。`);
  window.location.href = shortcutUrl;
}

async function copyText(text, sourceEl, statusEl, showSuccess = true) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      if (showSuccess) setStatus(statusEl, "コピーしました");
      return true;
    }
    sourceEl.focus();
    sourceEl.select();
    sourceEl.setSelectionRange(0, sourceEl.value.length);
    const ok = document.execCommand("copy");
    if (ok) {
      if (showSuccess) setStatus(statusEl, "コピーしました");
      return true;
    }
  } catch {
    // fall through
  }
  sourceEl.focus();
  sourceEl.select();
  sourceEl.setSelectionRange(0, sourceEl.value.length);
  setStatus(statusEl, "コピーに失敗しました。テキストを長押しして手動でコピーしてください。", "error");
  return false;
}

function generateMarkdown() {
  const created = formatDateTime(new Date());
  const log = buildMeetingLog(state.answers);
  const incomplete = isComplete() ? "" : "> この会議ログは途中保存です。最終結論はまだ完了していません。\n\n";
  return `# AI会議ログ

作成日: ${created}

${incomplete}## 議題カード

${state.topicCard.trim()}

## 会議ログ

${log || "まだ会議ログはありません。"}
`;
}

function downloadMarkdown() {
  const markdown = els.markdownText.value;
  const filename = buildFilename();
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus(els.markdownStatus, "ダウンロードを開始しました。iPhoneで失敗する場合はMarkdownコピーを使ってください。");
}

function buildFilename() {
  const ymd = formatDate(new Date());
  const title = safeFilename(extractTopicTitle(state.topicCard));
  return `${ymd}_${title}_ai_board.md`;
}

function extractTopicTitle(topicCard) {
  const lines = topicCard.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].trim() === "# 議題") {
      return lines.slice(i + 1).find((line) => line.trim()) || "ai_board";
    }
  }
  return lines.find((line) => line.trim() && !line.trim().startsWith("#")) || "ai_board";
}

function safeFilename(value) {
  const cleaned = String(value)
    .replace(/\r?\n/g, "")
    .trim()
    .replace(/[\/\\:*?"<>|]/g, "_")
    .slice(0, 20);
  return cleaned || "ai_board";
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function formatDateTime(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

function resetMeeting() {
  if (!confirm("現在の会議内容をリセットします。よろしいですか？")) return;
  state.topicCard = templates.general;
  state.currentStep = 1;
  state.answers = {};
  els.topicCard.value = state.topicCard;
  persist("新規会議を開始しました");
  render();
}

function setStatus(el, message, type = "") {
  el.textContent = message || "";
  el.classList.toggle("error", type === "error");
  el.classList.toggle("warn", type === "warn");
}
