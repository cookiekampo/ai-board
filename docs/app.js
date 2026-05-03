const STORAGE_KEY = "ai-board-static-v0.1";
const DEFAULT_TOTAL_STEPS = 6;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // Offline support is optional; the app still works without registration.
    });
  });
}

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
  deepResearch: `# 調べたいテーマ

# 背景

# 最終的に判断したいこと

# 使う場面

# 重視する観点
調査品質、実用性、抜け漏れ防止、低コスト、Markdown保存、再利用性

# 除外したいこと
最初から大規模SaaS化すること。
複雑すぎるUI。
Deep Research API前提の設計。

# 希望する出力形式
Deep Researchに貼れる完成プロンプト、調査観点、除外範囲、レビュー観点、次アクション`,
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

const modeLabels = {
  basic: "basic: 通常の提案・批判・結論",
  decision: "decision: 複数案の比較判断",
  review: "review: 文章・企画・仕様のレビュー",
  deepResearchPrompt: "Deep Researchプロンプト作成モード"
};

const modeSteps = {
  basic: steps,
  decision: [
    {
      role: "Proposer / 提案者",
      title: "候補案の整理",
      target: "ChatGPT推奨",
      instruction: `比較対象となる案を整理し、判断に使える形にしてください。
必ず以下を含めてください。
- 比較する案
- 各案の目的
- 各案のメリット
- 必要条件
- 成功時の姿
- 最初に確認すべきこと`,
      note: `案を増やしすぎないでください。
比較できる粒度にそろえ、判断しやすい形にしてください。`
    },
    {
      role: "Critic / 批判者",
      title: "比較案への批判",
      target: "Claude推奨",
      instruction: `Proposerが整理した各案を批判的にレビューしてください。
必ず以下を含めてください。
- 各案の弱点
- 見落としている前提
- コストや手間の差
- 実行リスク
- 判断を誤りやすい点
- 比較に足りない情報
- 明らかに除外すべき案`,
      note: `単なる反対ではなく、最終判断の精度を上げるために比較軸を明確にしてください。`
    },
    {
      role: "Proposer / 提案者",
      title: "比較案の修正と優先順位",
      target: "ChatGPT推奨",
      instruction: `Criticの指摘を踏まえて、比較案を修正し、優先順位を出してください。
必ず以下を含めてください。
- 残す案
- 除外する案
- 修正する案
- 比較軸
- 優先順位
- 小さく試す方法
- 判断前に確認すべきこと`,
      note: `結論を急ぎすぎず、なぜその優先順位になるのかを分かる形にしてください。`
    },
    {
      role: "Critic / 批判者",
      title: "優先順位レビュー",
      target: "Claude推奨",
      instruction: `Proposerの優先順位と比較軸を再レビューしてください。
必ず以下を含めてください。
- 優先順位の妥当性
- 過大評価されている案
- 過小評価されている案
- 採用前に潰すべきリスク
- やらない方がよい案
- 判断基準の修正案`,
      note: `最終判断で使えるように、重要度の高い論点から順に整理してください。`
    },
    {
      role: "Judge / 判定者",
      title: "暫定判断",
      target: "ChatGPTまたはClaude推奨",
      instruction: `ここまでの議論を整理し、暫定判断を出してください。
必ず以下を含めてください。
- 現時点の最有力案
- 次点案
- 却下候補
- 比較表
- 判断理由
- 未確認の前提
- 最終判断前に確認すべきこと`,
      note: `まだ最終結論にしなくて構いません。
判断の軸と不足情報を明確にしてください。`
    },
    {
      role: "Judge / 判定者",
      title: "最終判断",
      target: "ChatGPTまたはClaude推奨",
      instruction: `これまでの議論を踏まえて、最終判断を出してください。
必ず以下の見出しをこの順番で使ってください。
## 採用案
## 次点案
## 却下案
## 比較表
## 主な理由
## 未解決論点
## 追加確認事項
## 次アクション
## 実行順序
## 結論の自信度
## 自信度の理由`,
      note: `最終判断は、どの案を選ぶかだけでなく、次に何を確認・実行するかまで具体化してください。`
    }
  ],
  review: [
    {
      role: "Proposer / 提案者",
      title: "レビュー観点の整理と改善案",
      target: "ChatGPT推奨",
      instruction: `対象をレビューし、改善できる方向を前向きに整理してください。
必ず以下を含めてください。
- 良い点
- 改善余地
- 想定読者または利用者
- 伝わりにくい点
- 改善案
- 最初に直すべき箇所`,
      note: `批判だけで終わらせず、使える改善案にしてください。`
    },
    {
      role: "Critic / 批判者",
      title: "問題点レビュー",
      target: "Claude推奨",
      instruction: `Proposerの整理と対象内容を批判的にレビューしてください。
必ず以下を含めてください。
- 致命的な問題
- 誤解されやすい点
- 抜け漏れ
- 論理の弱い部分
- 表現や構成の問題
- 修正すべき優先順位
- 追加で確認すべきこと`,
      note: `細かい好みよりも、成果物としての品質に影響する問題を優先してください。`
    },
    {
      role: "Proposer / 提案者",
      title: "修正版の方針",
      target: "ChatGPT推奨",
      instruction: `Criticの指摘を踏まえて、修正版の方針を出してください。
必ず以下を含めてください。
- 残す要素
- 削る要素
- 追加する要素
- 構成の直し方
- 表現の直し方
- 優先して修正する順番
- 小さく直すならどこから始めるか`,
      note: `全体を作り替える前提にせず、実際に直しやすい改善方針にしてください。`
    },
    {
      role: "Critic / 批判者",
      title: "修正版レビュー",
      target: "Claude推奨",
      instruction: `Proposerの修正版方針を再レビューしてください。
必ず以下を含めてください。
- まだ残っている問題
- 修正方針の弱点
- 過剰修正になりそうな点
- 読者や利用者に伝わるか
- 直すべき優先順位
- 最終判断前に確認すべきこと`,
      note: `最終判断に使えるように、品質上の重要度が高い順に整理してください。`
    },
    {
      role: "Judge / 判定者",
      title: "改善方針の暫定整理",
      target: "ChatGPTまたはClaude推奨",
      instruction: `ここまでのレビューを整理し、暫定的な改善方針を出してください。
必ず以下を含めてください。
- 残すべき点
- 直すべき点
- 優先順位
- 判断理由
- まだ決めきれない論点
- 追加で確認すべきこと`,
      note: `まだ最終結論にしなくて構いません。
修正作業に移りやすい形へ論点を整理してください。`
    },
    {
      role: "Judge / 判定者",
      title: "最終レビュー結論",
      target: "ChatGPTまたはClaude推奨",
      instruction: `これまでのレビューを踏まえて、最終結論を出してください。
必ず以下の見出しをこの順番で使ってください。
## 採用する改善方針
## 修正すべき点
## 修正しない点
## 主な理由
## 未解決論点
## 追加確認事項
## 次アクション
## 修正順序
## 注意点
## 結論の自信度
## 自信度の理由`,
      note: `最終結論は、次にどこをどう直すかが分かる具体度にしてください。`
    }
  ],
  deepResearchPrompt: [
    {
      role: "Framer / 問いの設計者",
      title: "調査可能な問いへの変換",
      target: "ChatGPT推奨",
      instruction: `雑なテーマを、Deep Researchで調査しやすい問いに変換してください。
必ず以下を含めてください。
- 調査したいテーマの再定義
- 調査目的
- 最終的に判断したいこと
- 調査で明らかにすべきこと
- まだ曖昧な前提
- Deep Researchに投げる前に補うべき情報`,
      note: `テーマを広げすぎないでください。
ユーザーがDeep Researchに貼る前提で、調査可能な問いへ整えてください。`
    },
    {
      role: "Scope Designer / 調査範囲設計者",
      title: "調査範囲と除外範囲の設計",
      target: "Claude推奨",
      instruction: `Framerの整理を踏まえて、調査範囲・除外範囲・前提条件を設計してください。
必ず以下を含めてください。
- 調査範囲
- 除外範囲
- 調査対象に含める条件
- 調査対象から外す条件
- 比較すべき対象
- 期間・地域・用途などの制約
- 広すぎる場合の絞り込み案`,
      note: `Deep Researchが散らからないように、調べることと調べないことを明確にしてください。`
    },
    {
      role: "Question Designer / 調査質問設計者",
      title: "調査質問への分解",
      target: "ChatGPT推奨",
      instruction: `ここまでの整理を踏まえて、Deep Researchで調べるべき問いに分解してください。
必ず以下を含めてください。
- メイン調査質問
- サブ調査質問
- 比較観点
- 意思決定に必要な問い
- 事実確認すべき問い
- 実務適用を判断する問い
- 調査後にAI会議で再検討すべき問い`,
      note: `質問は多すぎず、調査結果を意思決定に使える粒度にしてください。`
    },
    {
      role: "Source & Evidence Reviewer / 情報源レビュー担当",
      title: "情報源と根拠レベルの設計",
      target: "Claude推奨",
      instruction: `調査質問に対して、優先すべき情報源・根拠レベル・確認方法を整理してください。
必ず以下を含めてください。
- 優先すべき情報源
- 避けるべき情報源
- 一次情報を優先すべき項目
- 比較・レビュー情報で足りる項目
- 情報の新しさが重要な項目
- 出典確認で注意すべき点
- 根拠が弱い場合の扱い`,
      note: `もっともらしいが根拠の弱い調査結果にならないように、情報源の条件を明確にしてください。`
    },
    {
      role: "Risk & Practicality Reviewer / リスク実用性レビュー担当",
      title: "調査失敗リスクの洗い出し",
      target: "Claude推奨",
      instruction: `Deep Researchプロンプトとして失敗しやすい点をレビューしてください。
必ず以下を含めてください。
- 調査範囲が広すぎるリスク
- 誤情報・古い情報のリスク
- 出力が一般論になるリスク
- 実務に使えない出力になるリスク
- 機密情報や個人情報の注意点
- トークンや作業量が増えすぎるリスク
- 最終プロンプトに追加すべき制約`,
      note: `単なる批判ではなく、最終プロンプトの品質を上げるための修正点にしてください。`
    },
    {
      role: "Prompt Finalizer / 最終プロンプト作成者",
      title: "Deep Research用完成プロンプト",
      target: "ChatGPTまたはClaude推奨",
      instruction: `これまでの議論を踏まえて、Deep Researchにそのまま貼れる完成プロンプトを作成してください。
必ず以下の見出しをこの順番で使ってください。
## 要約
## Deep Researchに貼る完成プロンプト
ここから下をDeep Researchに貼ってください。
---
本文
---
ここまで
## 補足
## Deep Research後にAI会議で再検討すべき論点
## ユーザー確認用チェックリスト
チェックリストはAIの自己採点ではなく、ユーザー確認用にしてください。
- 調査目的が具体的か：0〜2点
- 判断したいことが明確か：0〜2点
- 調査範囲が明確か：0〜2点
- 除外範囲が明確か：0〜2点
- 調査論点が具体的か：0〜2点
- 情報源指定が具体的か：0〜2点
- 出力形式が意思決定に使えるか：0〜2点
- コピペしやすいか：0〜2点`,
      note: `完成プロンプトは、そのままDeep Researchに貼れる形にしてください。
説明文ではなく、実際に貼り付ける調査依頼文として完成させてください。
完成プロンプト本文の外には、調査目的・範囲・補足説明を重複して書きすぎないでください。`
    }
  ]
};

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

const quickFieldDefs = [
  { key: "topic", id: "quickTopic", heading: "# 議題" },
  { key: "background", id: "quickBackground", heading: "# 背景" },
  { key: "decision", id: "quickDecision", heading: "# 判断したいこと" },
  { key: "constraints", id: "quickConstraints", heading: "# 制約" },
  { key: "resources", id: "quickResources", heading: "# 使える資源" },
  { key: "avoid", id: "quickAvoid", heading: "# やらないこと" },
  { key: "unwanted", id: "quickUnwanted", heading: "# 欲しくない回答" },
  { key: "criteria", id: "quickCriteria", heading: "# 判断基準" },
  { key: "granularity", id: "quickGranularity", heading: "# 回答の粒度" },
  { key: "output", id: "quickOutput", heading: "# 出力形式" }
];

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
  modeSelect: document.getElementById("modeSelect"),
  quickTopic: document.getElementById("quickTopic"),
  quickBackground: document.getElementById("quickBackground"),
  quickDecision: document.getElementById("quickDecision"),
  quickConstraints: document.getElementById("quickConstraints"),
  quickResources: document.getElementById("quickResources"),
  quickAvoid: document.getElementById("quickAvoid"),
  quickUnwanted: document.getElementById("quickUnwanted"),
  quickCriteria: document.getElementById("quickCriteria"),
  quickGranularity: document.getElementById("quickGranularity"),
  quickOutput: document.getElementById("quickOutput"),
  applyQuickCardButton: document.getElementById("applyQuickCardButton"),
  quickCardStatus: document.getElementById("quickCardStatus"),
  templateSelect: document.getElementById("templateSelect"),
  topicCard: document.getElementById("topicCard"),
  saveStatus: document.getElementById("saveStatus"),
  stepTitle: document.getElementById("stepTitle"),
  stepTarget: document.getElementById("stepTarget"),
  completionBadge: document.getElementById("completionBadge"),
  progressBar: document.getElementById("progressBar"),
  backStepButton: document.getElementById("backStepButton"),
  retryStepButton: document.getElementById("retryStepButton"),
  stepActionStatus: document.getElementById("stepActionStatus"),
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
  steeringText: document.getElementById("steeringText"),
  saveAnswerButton: document.getElementById("saveAnswerButton"),
  answerStatus: document.getElementById("answerStatus"),
  logPreview: document.getElementById("logPreview"),
  deepResearchCopyPanel: document.getElementById("deepResearchCopyPanel"),
  deepResearchPromptText: document.getElementById("deepResearchPromptText"),
  copyDeepResearchPromptButton: document.getElementById("copyDeepResearchPromptButton"),
  deepResearchCopyStatus: document.getElementById("deepResearchCopyStatus"),
  markdownText: document.getElementById("markdownText"),
  copyMarkdownButton: document.getElementById("copyMarkdownButton"),
  shareMarkdownButton: document.getElementById("shareMarkdownButton"),
  downloadMarkdownButton: document.getElementById("downloadMarkdownButton"),
  markdownStatus: document.getElementById("markdownStatus"),
  setupToggleButton: document.getElementById("setupToggleButton"),
  setupPanel: document.getElementById("setupPanel"),
  setupDoneCheckbox: document.getElementById("setupDoneCheckbox"),
  resetButton: document.getElementById("resetButton")
};

init();

function init() {
  els.topicCard.value = state.topicCard;
  els.modeSelect.value = state.mode;
  els.setupDoneCheckbox.checked = state.setupDone;
  fillQuickFields(state.quickFields);
  els.topicPromptText.value = generateTopicCardPrompt(els.roughTopic.value);
  bindEvents();
  renderSetupPanel();
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
  els.modeSelect.addEventListener("change", changeMode);
  quickFieldDefs.forEach((field) => {
    els[field.id].addEventListener("input", saveQuickFields);
  });
  els.applyQuickCardButton.addEventListener("click", applyQuickCard);
  els.templateSelect.addEventListener("change", applyTemplate);
  els.topicCard.addEventListener("input", () => {
    state.topicCard = els.topicCard.value;
    persist("保存しました");
    render();
  });
  els.backStepButton.addEventListener("click", goBackStep);
  els.retryStepButton.addEventListener("click", retryCurrentStep);
  els.copyPromptButton.addEventListener("click", () => copyText(els.promptText.value, els.promptText, els.copyStatus));
  els.openChatGptButton.addEventListener("click", () => copyAndOpen("chatgpt"));
  els.openClaudeButton.addEventListener("click", () => copyAndOpen("claude"));
  els.openGeminiButton.addEventListener("click", () => copyAndOpen("gemini"));
  els.shortcutChatGptButton.addEventListener("click", () => copyAndRunShortcut("chatgpt"));
  els.shortcutClaudeButton.addEventListener("click", () => copyAndRunShortcut("claude"));
  els.shortcutGeminiButton.addEventListener("click", () => copyAndRunShortcut("gemini"));
  els.steeringText.addEventListener("input", saveCurrentSteeringNote);
  els.saveAnswerButton.addEventListener("click", saveAnswerAndNext);
  els.copyDeepResearchPromptButton.addEventListener("click", copyDeepResearchPrompt);
  els.copyMarkdownButton.addEventListener("click", () => copyText(els.markdownText.value, els.markdownText, els.markdownStatus));
  els.shareMarkdownButton.addEventListener("click", shareMarkdown);
  els.downloadMarkdownButton.addEventListener("click", downloadMarkdown);
  els.setupToggleButton.addEventListener("click", toggleSetupPanel);
  els.setupDoneCheckbox.addEventListener("change", changeSetupDone);
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
    mode: "basic",
    topicCard: templates.general,
    setupDone: false,
    quickFields: defaultQuickFields(),
    currentStep: 1,
    answers: {},
    steeringNotes: {},
    updatedAt: new Date().toISOString()
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    const mode = modeSteps[parsed.mode] ? parsed.mode : fallback.mode;
    return {
      mode,
      topicCard: typeof parsed.topicCard === "string" ? parsed.topicCard : fallback.topicCard,
      setupDone: typeof parsed.setupDone === "boolean" ? parsed.setupDone : fallback.setupDone,
      quickFields: normalizeQuickFields(parsed.quickFields),
      currentStep: normalizeStep(parsed.currentStep, mode),
      answers: typeof parsed.answers === "object" && parsed.answers ? parsed.answers : {},
      steeringNotes: typeof parsed.steeringNotes === "object" && parsed.steeringNotes ? parsed.steeringNotes : {},
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : fallback.updatedAt
    };
  } catch {
    return fallback;
  }
}

function normalizeStep(step, mode = "basic") {
  const n = Number(step);
  if (!Number.isFinite(n)) return 1;
  return Math.min(getTotalSteps(mode), Math.max(1, Math.trunc(n)));
}

function defaultQuickFields() {
  return {
    topic: "",
    background: "",
    decision: "",
    constraints: "",
    resources: "",
    avoid: "",
    unwanted: "",
    criteria: "",
    granularity: "",
    output: "採用案、却下案、主な理由、未解決論点、追加確認事項、次アクション"
  };
}

function normalizeQuickFields(value) {
  const defaults = defaultQuickFields();
  if (!value || typeof value !== "object") return defaults;
  quickFieldDefs.forEach((field) => {
    defaults[field.key] = typeof value[field.key] === "string" ? value[field.key] : defaults[field.key];
  });
  return defaults;
}

function readQuickFields() {
  const values = {};
  quickFieldDefs.forEach((field) => {
    values[field.key] = els[field.id].value;
  });
  return values;
}

function fillQuickFields(values) {
  const normalized = normalizeQuickFields(values);
  quickFieldDefs.forEach((field) => {
    els[field.id].value = normalized[field.key];
  });
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

function renderSetupPanel() {
  els.setupDoneCheckbox.checked = state.setupDone;
  els.setupToggleButton.textContent = state.setupDone ? "初期設定済み" : "初期設定";
  els.setupToggleButton.classList.toggle("muted", state.setupDone);
}

function toggleSetupPanel() {
  els.setupPanel.hidden = !els.setupPanel.hidden;
}

function changeSetupDone() {
  state.setupDone = els.setupDoneCheckbox.checked;
  persist(state.setupDone ? "初期設定を完了にしました" : "初期設定を未完了に戻しました");
  renderSetupPanel();
  if (state.setupDone) {
    els.setupPanel.hidden = true;
  }
}

function changeMode() {
  const mode = els.modeSelect.value;
  if (countCompletedAnswers() > 0 && mode !== state.mode && !confirm("会議モードを変更すると、保存済みログのStep名も新しいモードで表示されます。変更してよろしいですか？")) {
    els.modeSelect.value = state.mode;
    return;
  }
  state.mode = modeSteps[mode] ? mode : "basic";
  state.currentStep = normalizeStep(state.currentStep, state.mode);
  els.modeSelect.value = state.mode;
  persist(`会議モードを ${modeLabels[state.mode]} に変更しました`);
  render();
}

function saveQuickFields() {
  state.quickFields = readQuickFields();
  persist();
}

function applyQuickCard() {
  state.quickFields = readQuickFields();
  if (!state.quickFields.topic.trim()) {
    setStatus(els.quickCardStatus, "議題だけは入力してください。", "error");
    persist();
    return;
  }
  if (els.topicCard.value.trim() && !confirm("現在の議題カードをフォームの内容で上書きします。よろしいですか？")) {
    persist();
    return;
  }
  const topicCard = buildTopicCardFromQuickFields(state.quickFields);
  state.topicCard = topicCard;
  els.topicCard.value = topicCard;
  persist("かんたん入力フォームから議題カードを作成しました");
  setStatus(els.quickCardStatus, "議題カード欄へ反映しました。必要に応じて詳細編集してください。");
  render();
}

function buildTopicCardFromQuickFields(values) {
  return quickFieldDefs
    .map((field) => {
      const value = values[field.key].trim() || "未入力";
      return `${field.heading}\n${value}`;
    })
    .join("\n\n");
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
  return normalizeStep(state.currentStep, state.mode) - 1;
}

function getStepsForMode(mode) {
  return modeSteps[mode] || modeSteps.basic;
}

function getSteps() {
  return getStepsForMode(state.mode);
}

function getTotalSteps(mode = state.mode) {
  const stepList = getStepsForMode(mode);
  return stepList.length || DEFAULT_TOTAL_STEPS;
}

function isComplete() {
  const totalSteps = getTotalSteps();
  return Boolean(state.answers[String(totalSteps)] && String(state.answers[String(totalSteps)]).trim());
}

function render() {
  const activeSteps = getSteps();
  const step = activeSteps[currentStepIndex()];
  const totalSteps = getTotalSteps();
  const complete = isComplete();
  els.modeSelect.value = state.mode;
  els.stepTitle.textContent = `Step ${state.currentStep}: ${step.role} - ${step.title}`;
  els.stepTarget.textContent = `推奨AI: ${step.target}`;
  els.completionBadge.textContent = complete ? "会議完了" : "進行中";
  els.progressBar.style.width = `${Math.round((countCompletedAnswers() / totalSteps) * 100)}%`;
  els.promptText.value = generatePrompt(state.currentStep, state.topicCard, state.answers, state.steeringNotes);
  els.answerText.value = state.answers[String(state.currentStep)] || "";
  els.steeringText.value = state.steeringNotes[String(state.currentStep)] || "";
  els.saveAnswerButton.textContent = state.currentStep === totalSteps ? "回答を保存して会議完了" : "回答を保存して次へ";
  els.saveAnswerButton.disabled = false;
  els.backStepButton.disabled = state.currentStep <= 1;
  els.retryStepButton.disabled = !hasCurrentStepWork();
  updateRecommendedAiButtons(step.target);
  els.logPreview.textContent = buildMeetingLog(state.answers, state.steeringNotes) || "まだ会議ログはありません。";
  els.markdownText.value = generateMarkdown();
  renderDeepResearchCopyPanel();
}

function countCompletedAnswers() {
  let count = 0;
  const totalSteps = getTotalSteps();
  for (let i = 1; i <= totalSteps; i += 1) {
    if (state.answers[String(i)] && String(state.answers[String(i)]).trim()) count += 1;
  }
  return count;
}

function hasCurrentStepWork() {
  const key = String(state.currentStep);
  return Boolean(
    (state.answers[key] && String(state.answers[key]).trim()) ||
    (state.steeringNotes[key] && String(state.steeringNotes[key]).trim())
  );
}

function updateRecommendedAiButtons(target) {
  const buttons = [
    { service: "ChatGPT", el: els.shortcutChatGptButton },
    { service: "Claude", el: els.shortcutClaudeButton },
    { service: "Gemini", el: els.shortcutGeminiButton }
  ];
  buttons.forEach(({ service, el }) => {
    const recommended = target.includes(service);
    el.classList.toggle("primary", recommended);
    el.textContent = recommended ? `推奨: ${service}アプリ` : `iPhone: ${service}アプリ`;
  });
}

function generatePrompt(stepNumber, topicCard, answers, steeringNotes) {
  const step = getSteps()[stepNumber - 1];
  const meetingLog = buildMeetingLogBefore(answers, steeringNotes, stepNumber) || "まだ会議ログはありません。";
  return `あなたはAI会議室の ${step.role}です。

## 会議モード
${modeLabels[state.mode] || modeLabels.basic}

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

function buildMeetingLogBefore(answers, steeringNotes, stepNumber) {
  const parts = [];
  for (let i = 1; i < stepNumber; i += 1) {
    const stepLog = buildStepLog(i, answers, steeringNotes);
    if (stepLog) parts.push(stepLog);
  }
  return parts.join("\n\n");
}

function buildMeetingLog(answers, steeringNotes) {
  const parts = [];
  const totalSteps = getTotalSteps();
  for (let i = 1; i <= totalSteps; i += 1) {
    const stepLog = buildStepLog(i, answers, steeringNotes);
    if (stepLog) parts.push(stepLog);
  }
  return parts.join("\n\n");
}

function buildStepLog(stepNumber, answers, steeringNotes) {
  const answer = answers[String(stepNumber)];
  if (!answer || !String(answer).trim()) return "";
  const step = getSteps()[stepNumber - 1];
  const note = steeringNotes[String(stepNumber)];
  const noteBlock = note && String(note).trim() ? `\n\n### ユーザーの軌道修正メモ\n${String(note).trim()}` : "";
  return `## Step ${stepNumber}: ${step.role.split(" / ")[0]} ${step.title}\n${String(answer).trim()}${noteBlock}`;
}

function goBackStep() {
  if (state.currentStep <= 1) {
    setStatus(els.stepActionStatus, "Step 1より前には戻れません。", "warn");
    return;
  }
  if (!confirm("1つ前のStepへ戻ります。現在のStep番号だけを戻し、保存済み回答は残します。よろしいですか？")) {
    return;
  }
  state.currentStep -= 1;
  persist();
  setStatus(els.stepActionStatus, `Step ${state.currentStep}へ戻りました。`);
  render();
}

function retryCurrentStep() {
  const key = String(state.currentStep);
  if (!hasCurrentStepWork()) {
    setStatus(els.stepActionStatus, "このStepには削除する回答や軌道修正メモがありません。", "warn");
    return;
  }
  if (!confirm("このStepの回答と軌道修正メモを削除して、同じStepをやり直します。よろしいですか？")) {
    return;
  }
  delete state.answers[key];
  delete state.steeringNotes[key];
  els.answerText.value = "";
  els.steeringText.value = "";
  persist();
  setStatus(els.stepActionStatus, `Step ${state.currentStep}をやり直せる状態にしました。`);
  render();
}

function saveAnswerAndNext() {
  const answer = els.answerText.value.trim();
  const totalSteps = getTotalSteps();
  if (!answer) {
    setStatus(els.answerStatus, "AIの回答を貼り戻してから保存してください。", "error");
    return;
  }
  state.answers[String(state.currentStep)] = answer;
  saveCurrentSteeringNote();
  if (state.currentStep < totalSteps) {
    state.currentStep += 1;
    setStatus(els.answerStatus, "回答を保存しました。次Stepのプロンプトを生成しました。");
  } else {
    setStatus(els.answerStatus, "Step 6を保存しました。会議完了です。");
  }
  persist();
  render();
}

function saveCurrentSteeringNote() {
  const key = String(state.currentStep);
  const note = els.steeringText.value.trim();
  if (note) {
    state.steeringNotes[key] = note;
  } else {
    delete state.steeringNotes[key];
  }
  persist();
  els.markdownText.value = generateMarkdown();
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

function renderDeepResearchCopyPanel() {
  const canCopy = state.mode === "deepResearchPrompt" && isComplete();
  els.deepResearchCopyPanel.hidden = !canCopy;
  if (!canCopy) {
    els.deepResearchPromptText.value = "";
    return;
  }
  els.deepResearchPromptText.value = extractDeepResearchPrompt();
}

async function copyDeepResearchPrompt() {
  const prompt = els.deepResearchPromptText.value.trim();
  if (!prompt) {
    setStatus(els.deepResearchCopyStatus, "コピーできるDeep Research用プロンプトがまだありません。", "warn");
    return;
  }
  await copyText(prompt, els.deepResearchPromptText, els.deepResearchCopyStatus);
}

function extractDeepResearchPrompt() {
  const answer = String(state.answers[String(getTotalSteps())] || "").trim();
  if (!answer) return "";

  const marker = "ここから下をDeep Researchに貼ってください。";
  const markerIndex = answer.indexOf(marker);
  if (markerIndex >= 0) {
    const afterMarker = answer.slice(markerIndex + marker.length);
    const firstDelimiter = afterMarker.match(/(?:^|\n)---\s*(?:\n|$)/);
    if (firstDelimiter) {
      const start = markerIndex + marker.length + firstDelimiter.index + firstDelimiter[0].length;
      const rest = answer.slice(start);
      const endIndex = rest.search(/\n---\s*(?:\n|$)/);
      if (endIndex >= 0) return rest.slice(0, endIndex).trim();
      return rest.replace(/(?:^|\n)ここまで[\s\S]*$/m, "").trim();
    }
    const endMarkerIndex = afterMarker.indexOf("ここまで");
    if (endMarkerIndex >= 0) {
      return afterMarker.slice(0, endMarkerIndex).replace(/^---\s*/, "").replace(/---\s*$/, "").trim();
    }
  }

  const section = extractMarkdownSection(answer, [
    "## Deep Researchに貼る完成プロンプト",
    "## Deep Researchにそのまま貼れる完成プロンプト"
  ]);
  return section || answer;
}

function extractMarkdownSection(text, headings) {
  for (const heading of headings) {
    const startIndex = text.indexOf(heading);
    if (startIndex < 0) continue;
    const contentStart = startIndex + heading.length;
    const afterHeading = text.slice(contentStart).replace(/^\s*\n/, "");
    const nextHeadingIndex = afterHeading.search(/\n##\s+/);
    if (nextHeadingIndex >= 0) return afterHeading.slice(0, nextHeadingIndex).trim();
    return afterHeading.trim();
  }
  return "";
}

function generateMarkdown() {
  const created = formatDateTime(new Date());
  const log = buildMeetingLog(state.answers, state.steeringNotes);
  const incomplete = isComplete() ? "" : "> この会議ログは途中保存です。最終結論はまだ完了していません。\n\n";
  return `# AI会議ログ

作成日: ${created}
会議モード: ${modeLabels[state.mode] || modeLabels.basic}

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

async function shareMarkdown() {
  const markdown = els.markdownText.value;
  if (!navigator.share) {
    setStatus(els.markdownStatus, "この環境では共有できません。Markdownコピーを使ってください。", "warn");
    return;
  }
  try {
    await navigator.share({
      title: "AI会議ログ",
      text: markdown
    });
    setStatus(els.markdownStatus, "共有を開きました。");
  } catch (error) {
    if (error && error.name === "AbortError") {
      setStatus(els.markdownStatus, "共有をキャンセルしました。", "warn");
      return;
    }
    setStatus(els.markdownStatus, "共有に失敗しました。Markdownコピーを使ってください。", "error");
  }
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
  state.mode = "basic";
  state.topicCard = templates.general;
  state.quickFields = defaultQuickFields();
  state.currentStep = 1;
  state.answers = {};
  state.steeringNotes = {};
  els.modeSelect.value = state.mode;
  fillQuickFields(state.quickFields);
  els.topicCard.value = state.topicCard;
  els.steeringText.value = "";
  persist("新規会議を開始しました");
  render();
}

function setStatus(el, message, type = "") {
  el.textContent = message || "";
  el.classList.toggle("error", type === "error");
  el.classList.toggle("warn", type === "warn");
}
