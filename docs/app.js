const STORAGE_KEY = "ai-board-static-v0.1";
const DEFAULT_TOTAL_STEPS = 6;
const DEFAULT_MODE = "deepResearchPrompt";
const APP_CACHE_NAME = "ai-board-static-v0.1.80";
const APP_VERSION_LABEL = APP_CACHE_NAME.replace(/^ai-board-static-/, "");
const GOLDEN_CASE_FETCH_TIMEOUT_MS = 8000;
const RESEARCH_BRIEF_DB_NAME = "ai-board-research-briefs";
const RESEARCH_BRIEF_DB_VERSION = 1;
const RESEARCH_BRIEF_STORE = "briefs";
const RESEARCH_BRIEF_LATEST_ID = "latest";
const RESEARCH_BRIEF_FALLBACK_KEY = "ai-board-research-brief-latest";

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
Deep Researchに貼れる完成プロンプト、調査観点、除外範囲、レビュー観点、次アクション

# 病名テーマ Deep Research設計カード

## 病名
未入力

## 調べたい方向
- 医学的基礎
- 安全確認
- 漢方医学的病態
- 処方・生薬・証
- 症例報告・専門家経験知
- エビデンス
- 一般向け相談前メモ
- 専門職向け内部資料

## 今回の最優先目的
要確認

## 想定読者
- 一般ユーザー
- 漢方相談員
- 薬剤師
- 医師・漢方医
- 研究者
- 内部研修担当者

## 利用場面
- 内部学習
- 勉強会
- 相談準備
- 症例検討
- 患者説明
- Web公開
- 販売促進ではない

## 出してほしい成果物
- チェックリスト
- 症状クラスター表
- 証・病態表
- 処方群表
- 生薬表
- 安全性表
- 質問リスト
- 症例検討テンプレート
- 追加Deep Researchプロンプト

## 情報源の扱い
- ガイドライン：
- PMDA・添付文書：
- 論文：
- 症例報告：
- 専門家解説：
- 標準医療を否定するページ・受診不要を示唆するページ：
- 個人ブログ・体験談・SNS投稿：
- 販売ページ・広告LP：
- 危険表現・誤情報の隔離分析：

## 除外したいこと
- 病名処方
- 処方ランキング
- 治癒保証
- 標準治療否定
- 服薬変更指示
- 一般向けの処方推奨

## 初回調査後に判定すること
- この結果は何には使えるか
- 何には不十分か
- 次に必要なのは安全補完か、漢方知識補完か、処方・生薬補完か`,
  deepResearchReview: `# 議題
Deep Research結果をレビューする

# 背景
Deep Researchで調査結果を得た。
この結果をそのまま使うのではなく、情報源、根拠、主張の対応、安全性、抜け漏れ、実用性を確認したい。

# 元のDeep Researchプロンプト
未入力

# レビュー対象
未入力

# 結果を使う目的
要確認

# 判断したいこと
- 調査結果は信頼できるか
- 主張と根拠が対応しているか
- 情報源は十分か
- 古い情報や根拠の弱い情報が混ざっていないか
- 危険な結論や過剰な断定がないか
- 元の調査質問に答えているか
- 実務で使える成果物になっているか
- 追加調査が必要か

# 制約
- 調査結果を無批判に採用しない
- 情報源と根拠レベルを確認する
- 主張と根拠の対応を確認する
- 高リスク領域では安全性を優先する
- 必要なら追加Deep Researchプロンプトを作る

# 使える資源
- 元のDeep Researchプロンプト
- Deep Research結果
- Deep Research内で示された情報源
- ユーザーの利用目的

# やらないこと
- 調査結果をそのまま最終結論にしない
- 根拠の弱い情報を推奨扱いしない
- 危険な内容を成果物に混ぜない
- 単なる要約で終わらせない

# 欲しくない回答
- ただの要約
- 情報源を確認しない感想
- 主張と根拠の対応を見ない結論
- 危険な内容と使える内容を分けない回答
- 追加調査の要否を示さない回答

# 判断基準
- 情報源の信頼性
- 主張と根拠の対応
- 根拠レベル
- 情報の新しさ
- 元の質問への回答度
- 安全性
- 実用性
- 追加調査の必要性
- 成果物として使えるか

# 回答の粒度
- 重要度つきで問題点を整理する
- 採用できる内容、修正すべき内容、危険な内容を分ける
- 最終的に使える成果物へ変換する

# 出力形式
- 採用可否
- 採用できる内容
- 修正すべき内容
- 危険な内容
- 情報源レビュー
- 主張・根拠対応レビュー
- 抜け漏れ
- 実用性レビュー
- 改訂版成果物
- 追加Deep Researchプロンプト案
- 次アクション
- 結論の自信度`,
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
  deepResearchPrompt: "Deep Researchプロンプト作成モード",
  deepResearchReview: "Deep Research結果レビュー用モード"
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
      role: "Review Framer / 対象分類・評価軸・成功条件・実行方針設計",
      title: "対象分類・評価軸・成功条件設計",
      target: "ChatGPT推奨",
      instruction: `対象をレビューする前に、今回のレビュー基準・成果物・実行方針を設計してください。
必ず以下を含めてください。
- レビュー対象の種類
- 想定読者または利用者
- 成功条件
- 壊してはいけない要素
- 今回重視する評価軸
- 今回の最終成果物
- レビュー深度: Light / Standard / Full
- Codex指示の要否
- テスト観点の要否
- Step 6をSkip可能にするかの初期方針
- 良い点
- 改善余地
- 最初に直すべき箇所

出力の最後に必ず以下の見出しを置いてください。
## 成果物更新
今回のレビュー設計、評価軸、成功条件、最終成果物を簡潔に示してください。
## Issue / 未解決論点
この時点で残る懸念、前提不足、判断待ち事項を列挙してください。
## 次Stepへの引き継ぎ
Initial Criticが前提にすべき対象種別、評価軸、壊してはいけない要素を明示してください。`,
      note: `Step 6の実行方式はここでは確定せず、初期方針だけにしてください。最終判定はStep 5で行います。`
    },
    {
      role: "Initial Critic / Issue抽出・重要度分類",
      title: "Issue抽出・重要度分類",
      target: "Claude推奨",
      instruction: `Review Framerが定義したレビュー対象の種類・成功条件・評価軸・レビュー深度に沿って、元対象を批判的にレビューしてください。
必ず以下を含めてください。
- Issue一覧
- 重要度: Critical / Major / Minor / Optional
- 指摘内容
- 根拠
- 影響範囲
- 修正方針
- Critical / Major Issue の要約
- 追加で確認すべきこと

レビュー深度の扱い:
- Light: Critical / Majorのみ簡易列挙
- Standard: Issue ID、重要度、対応方針を出す
- Full: Issue ID、重要度、根拠、影響範囲、対応表、未反映理由まで出す

出力の最後に必ず以下の見出しを置いてください。
## 成果物更新
このStepで作成・更新したIssue一覧と重要度分類を示してください。
## Issue / 未解決論点
未解決のCritical / Major / Minor / Optional Issueを分けて整理してください。
## 次Stepへの引き継ぎ
Draft Revision Builderが反映すべきIssue、反映しない方がよいIssue、重点修正箇所を明示してください。`,
      note: `単なる好みではなく、後続Stepで追跡できる問題として整理してください。`
    },
    {
      role: "Draft Revision Builder / v1修正版・Issue対応表作成",
      title: "v1修正版・Issue対応表作成",
      target: "ChatGPT推奨",
      instruction: `Initial CriticのIssueを踏まえて、完成版ではなくv1修正版を作成してください。
必ず以下を含めてください。
- v1修正版
- Issue対応表
- 反映したIssue
- 未反映Issue
- 未反映理由
- 修正した要素
- 修正しない要素
- 後回しにする要素
- Step 4で重点確認すべき点

対象別の出力方針：
- 文章レビューなら、v1文章を出す
- 仕様レビューなら、v1仕様案を出す
- プロンプトレビューなら、v1プロンプトを出す
- アプリ機能レビューなら、実装指示案を出す
- AI会議モードレビューなら、再設計案とStep別ロール案を出す

出力の最後に必ず以下の見出しを置いてください。
## 成果物更新
v1修正版とIssue対応表を簡潔に示してください。
## Issue / 未解決論点
未反映Issue、後回しにしたIssue、判断待ちIssueを重要度つきで整理してください。
## 次Stepへの引き継ぎ
Regression Criticが重点確認すべき副作用、回帰、過剰修正リスクを明示してください。`,
      note: `ここで作るものは最終版ではありません。過剰に磨き込まず、Step 4で検証できる形にしてください。`
    },
    {
      role: "Regression Critic / 副作用・回帰レビュー",
      title: "副作用・回帰レビュー",
      target: "Claude推奨",
      instruction: `Draft Revision Builderが作成したv1修正版を、副作用・回帰の観点でレビューしてください。
必ず以下を含めてください。
- 修正で改善された点
- 新しく生まれた矛盾
- 元の良さや必須条件が失われていないか
- Step 1の成功条件を満たしているか
- Critical / Major Issueが残っていないか
- 未反映Issueの扱いが妥当か
- 過剰修正のリスク
- 実装負荷・運用負荷
- Step 5で判定すべき論点

出力の最後に必ず以下の見出しを置いてください。
## 成果物更新
v1修正版の副作用レビュー、回帰レビュー、残存Issueの状態を示してください。
## Issue / 未解決論点
Critical / Majorが残っているか、Step 6へ進む前に判断すべき論点を整理してください。
## 次Stepへの引き継ぎ
Gate JudgeがProceed / Diff / Skip / Loop back / Stopを判定するための材料を明示してください。`,
      note: `Step 2は元対象の欠陥検出、Step 4はv1修正版の副作用・回帰検出です。同じCriticでも対象が違うことを明確にしてください。`
    },
    {
      role: "Gate Judge / 最終化可否・Step 6実行判定",
      title: "最終化可否・Step 6実行判定",
      target: "ChatGPTまたはClaude推奨",
      instruction: `ここまでのレビューを整理するだけでなく、次にどの経路へ進むかを必ず判定してください。
必ず以下を含めてください。
- 判定
- 判定理由
- Step 6に渡す指示
- Step 6をSkipする場合の最終候補
- 未解決論点
- 人間判断が必要な点
- ループ上限への注意

判定は以下から1つ選んでください。
- Proceed: Full: Step 6で大きく最終統合する
- Proceed: Diff: Step 6で差分だけ反映する
- Skip Final Builder: Step 3のv1修正版を最終候補としてStep 7へ進む
- Loop back: Step 3またはStep 4へ戻す
- Stop: 情報不足や前提不備により最終化しない
- Human decision required: 人間判断が必要な論点を明示して停止する

出力の最後に必ず以下の見出しを置いてください。
## 成果物更新
Gate判定、Step 6の実行方式、最終候補の扱いを示してください。
## Issue / 未解決論点
最終化を妨げるIssue、人間判断が必要な論点、Stop理由があれば明示してください。
## 次Stepへの引き継ぎ
Final BuilderまたはFinal QA Judgeが参照すべき確定方針、反映条件、禁止事項を明示してください。`,
      note: `単なる中間要約ではなく、進む・戻す・止める・人間判断に回す、のどれかを明確にしてください。Loop backは原則1回までです。`
    },
    {
      role: "Final Builder / 最終候補作成",
      title: "最終候補作成",
      target: "ChatGPT推奨",
      instruction: `Gate Judgeの判定に基づき、最終候補を作成してください。
必ず以下を含めてください。
- 実行方式: Full / Diff / Skip
- 最終候補
- v1からの変更差分
- 反映したGate Judge指示
- 未反映Issueと理由
- 変更しなかった点
- 後回しにした点

対象別の出力方針：
- 文章レビューなら、最終稿を出す
- 企画レビューなら、最終改善方針と実行手順を出す
- 仕様レビューなら、最終仕様を出す
- プロンプトレビューなら、最終プロンプトを出す
- アプリ機能レビューなら、実装指示案を出す
- AI会議モードレビューなら、Step定義・役割定義・遷移条件・Codex指示案を出す

禁止事項:
- Step 5で棄却された方針を復活させない
- 新しい論点を勝手に追加しない
- Step 1の成功条件を落とさない
- 文章を整えるために仕様条件を削らない
- 未反映Issueを理由なく放置しない

出力の最後に必ず以下の見出しを置いてください。
## 成果物更新
最終候補、v1からの差分、未反映理由を示してください。
## Issue / 未解決論点
最終候補に残るIssue、後回しにしたIssue、Final QAで確認すべき論点を整理してください。
## 次Stepへの引き継ぎ
Final QA Judgeが検証すべき成功条件、Critical / Major Issueの処理状況、受け入れ条件を明示してください。`,
      note: `Step 5がSkip Final Builderを選んだ場合は、Step 3のv1修正版を最終候補として扱い、無理に書き直さないでください。`
    },
    {
      role: "Final QA Judge / 最終候補検証・最終結論・実装指示・テスト観点",
      title: "最終候補検証・最終結論・実装指示・テスト観点",
      target: "ChatGPTまたはClaude推奨",
      instruction: `これまでのレビューを踏まえて、最終候補を検証し、最終結論を出してください。
Step 6を実行した場合はStep 6の最終統合版を、Step 6をSkipした場合はStep 3のv1修正版を「最終候補」として検証してください。

必ず以下の見出しをこの順番で使ってください。
## 最終判定
Pass / Conditional Pass / Fail: Rebuild needed / Fail: Premise issue / Human decision required のいずれかを明記してください。
## 判定理由
## 最終候補の検証
## 未解決Issue
## 採用案
## 修正する点
## 修正しない点
## 後回しにする点
## 必要ならCodexへの実装指示
## 実装後の確認項目
## 壊してはいけない既存機能
## テスト観点
## 受け入れ条件
## レビュー品質チェック
## 次アクション
## 結論の自信度
## 自信度の理由
## 成果物更新
最終候補、QA判定、採用可否、Codex指示・テスト観点の最終状態を示してください。
## Issue / 未解決論点
残ったIssue、Conditional Passの条件、Human decision requiredの論点を整理してください。
## 次Stepへの引き継ぎ
実装、再レビュー、保留、または人間判断へ渡すべき内容を明示してください。`,
      note: `Step 7は締めのコメントではなく、最終候補のQA工程です。Step 1の成功条件、Critical / Major Issueの処理、最終候補とCodex指示・テスト観点のズレを必ず確認してください。Fail時は戻り先を明示してください。`
    }
  ],
  deepResearchPrompt: [
    {
      role: "Purpose Diagnoser / 目的診断",
      title: "依頼の目的診断",
      target: "ChatGPT推奨",
      instruction: `ユーザーの調査依頼を、Deep Researchで実行する前の「目的診断」として整理してください。
AI同士の議論ではなく、調査設計の成果物を更新する前提で書いてください。

必ず以下を含めてください。
- 何を作るための依頼か
- 主目的と副目的
- 想定読者・利用者
- 利用場面
- 最終成果物
- 患者向け、専門家向け、内部資料、Web公開、販売促進、意思決定資料などの用途分類
- 現時点で曖昧な前提
- 仮置きして進める前提

質問が必要な場合も途中で止めず、最後の「ユーザーへの確認質問」にまとめてください。

必ず最後に以下を含めてください。
## 成果物更新
## 次Stepへの引き継ぎ
## ユーザーへの確認質問
### 必須確認
最大3つまで。
### 任意確認
必要な場合のみ。
### 未回答の場合の仮置き`,
      note: `このStepは「質問して止まる」ためではなく、未確定点を仮置きしながら調査設計を前に進めるためのStepです。`
    },
    {
      role: "Audience & Use Profiler / 読者・用途判定",
      title: "読者・用途判定",
      target: "Claude推奨",
      instruction: `Purpose Diagnoserの整理を踏まえて、想定読者と利用場面を判定してください。
特に、同じテーマでも読者の専門性によって調査範囲・安全制約・出力形式が変わる点を明確にしてください。

必ず以下を含めてください。
- 想定読者の専門性: 一般向け / 実務者向け / 専門職向け / 研究者向け / 不明
- 利用場面: 内部資料 / Web公開 / 患者配布 / 販売促進 / 勉強会 / 症例検討 / 意思決定資料 / その他
- 読者ごとに扱える範囲
- 読者ごとに避けるべき内容
- 読者が曖昧な場合の分岐案
- 読者を誤ると起きる問題
- 仮置きする読者・用途

医療・漢方などでは、一般患者、相談員、薬剤師、医師、漢方医、専門医などの違いを必ず分けてください。

必ず最後に以下を含めてください。
## 成果物更新
## 次Stepへの引き継ぎ
## ユーザーへの確認質問
### 必須確認
最大3つまで。
### 任意確認
必要な場合のみ。
### 未回答の場合の仮置き`,
      note: `読者の専門性がずれると、Deep Researchの出力は浅くなったり危険になったりします。ここで用途を固定してください。`
    },
    {
      role: "Disease Baseline Planner / 病名の医学的土台設計",
      title: "病名の医学的土台設計",
      target: "ChatGPT推奨",
      instruction: `調査テーマに病名・症候群・疾患名が含まれる場合、その病名を扱うための医学的土台を設計してください。
病名テーマでない場合は、該当しない理由と、代わりに必要な基礎整理を示してください。

必ず以下を含めてください。
- 病名・症候群・疾患名
- まず押さえるべき医学的基礎
- 標準医療・医療連携で確認すべきこと
- 相談・学習・内部資料で扱える範囲
- 扱ってはいけない判断
- 病名だけで処方・治療・改善を断定しないための制約
- 漢方テーマの場合に必要な補完軸
- 病名テーマ用の議題カード不足項目

病名×漢方テーマでは、医学的基礎だけで止めず、必要に応じて以下を補完候補として明示してください。
- 症状クラスター・患者の困りごと
- 漢方医学的病態・証
- 処方群・生薬・処方意図
- 方剤別安全性・添付文書照合
- 症例報告・専門家経験知
- エビデンス・ガイドライン上の位置づけ

必ず最後に以下を含めてください。
## 成果物更新
## 次Stepへの引き継ぎ
## ユーザーへの確認質問
### 必須確認
最大3つまで。
### 任意確認
必要な場合のみ。
### 未回答の場合の仮置き`,
      note: `病名テーマでは、安全確認だけでは学習資料や改善仮説の資料になりません。医学的土台と補完すべき漢方軸を分けてください。`
    },
    {
      role: "Scope & Split Planner / 範囲・分割設計",
      title: "範囲・分割設計",
      target: "ChatGPT推奨",
      instruction: `ここまでの整理を踏まえて、調査範囲と分割方針を設計してください。
一発で調査すべきか、複数回に分けるべきかを必ず判定してください。

必ず以下を含めてください。
- 調査範囲
- 除外範囲
- 混在している論点
- 広すぎる点
- 一発調査か分割調査か
- 判定: 一発でよい / 分割推奨 / 強く分割推奨
- 判定理由
- 一発で行う場合の限界
- 分割する場合の利点
- 推奨する調査順序

医療・漢方などで、安全確認、医学的評価、漢方医学的病態、処方群、添付文書、エビデンス、症例検討が混ざる場合は、分割推奨または強く分割推奨にしてください。
病名×漢方テーマでは、以下の分割候補も検討してください。
1. 病名の医学的基礎・医療連携
2. 症状クラスター・患者の困りごと整理
3. 漢方医学的病態把握・証の整理
4. 処方群・生薬・処方意図の整理
5. 症例報告・専門家経験知・個人ブログの探索整理
6. 方剤別安全性・添付文書照合
7. エビデンス・ガイドライン上の位置づけ
8. 読者別の成果物化

必ず最後に以下を含めてください。
## 成果物更新
## 次Stepへの引き継ぎ
## ユーザーへの確認質問
### 必須確認
最大3つまで。
### 任意確認
必要な場合のみ。
### 未回答の場合の仮置き`,
      note: `このStepはDeep Research品質の要です。広すぎるテーマを一発で投げるリスクを必ず評価してください。`
    },
    {
      role: "Risk Guard / 高リスク・安全制約設計",
      title: "高リスク・安全制約設計",
      target: "Claude推奨",
      instruction: `調査依頼が高リスク領域に該当するかを判定し、Deep Researchプロンプトに入れるべき安全制約を設計してください。

必ず以下を含めてください。
- リスク判定: 低 / 中 / 高
- 高リスク領域: 医療 / 法律 / 金融 / 個人情報 / 安全 / セキュリティ / 政治 / 未成年 / 差別・偏見 / その他
- 誤った出力が害を生む可能性
- 禁止すべき出力
- 避けるべき断定表現
- 専門家連携が必要な範囲
- 安全側に倒す表現ルール
- Deep Researchプロンプトに必ず入れる安全制約

医療・漢方では、診断、治療方針、処方判断、服薬開始・中止・変更、受診不要の示唆、効果保証を厳しく制限してください。

必ず最後に以下を含めてください。
## 成果物更新
## 次Stepへの引き継ぎ
## ユーザーへの確認質問
### 必須確認
最大3つまで。
### 任意確認
必要な場合のみ。
### 未回答の場合の仮置き`,
      note: `高リスク領域では、調査の深さよりも安全境界の明確さを優先してください。`
    },
    {
      role: "Research Axis Selector / 補完軸選択",
      title: "補完軸選択",
      target: "Claude推奨",
      instruction: `ここまでの診断を踏まえて、Deep Researchで優先すべき補完軸を選択してください。
安全性だけに偏らず、ユーザーの本来目的に照らして不足しやすい調査軸を明示してください。

必ず以下を含めてください。
- 今回の最優先補完軸
- 安全性を補う調査が必要か
- 根拠を補う調査が必要か
- 実用性を高める調査が必要か
- 学習価値を高める調査が必要か
- 改善仮説を作る調査が必要か
- 今回は扱わない補完軸
- 補完軸ごとのDeep Research分割候補

病名×漢方テーマでは、以下を必ず検討してください。
- 漢方知識
- 処方・生薬・証
- 症状クラスター
- 改善仮説
- 症例報告・専門家経験知
- 方剤別安全性
- エビデンス

線維筋痛症×漢方のようなテーマでは、安全資料として良くても、処方・生薬・証・症状クラスターの学習資料として不足する場合があります。その場合は、次に必要なDeep Researchとして改善仮説を作る調査を明示してください。

必ず最後に以下を含めてください。
## 成果物更新
## 次Stepへの引き継ぎ
## ユーザーへの確認質問
### 必須確認
最大3つまで。
### 任意確認
必要な場合のみ。
### 未回答の場合の仮置き`,
      note: `追加調査案が安全性だけに偏らないように、学習価値とClinical hypothesis valueをここで確保してください。`
    },
    {
      role: "Source Planner / 情報源設計",
      title: "情報源設計",
      target: "Claude推奨",
      instruction: `Deep Researchで優先すべき情報源、補助的に使う情報源、根拠として除外すべき情報源を設計してください。
「根拠にしない」と「参照しない」を区別し、危険表現・誤情報・広告表現を本文根拠とは別枠で分析できるようにしてください。
情報源ごとの実務上の扱いも明確にしてください。

必ず以下を含めてください。
- 優先すべき情報源
- 補助的に使う情報源
- 医学的根拠・処方根拠・安全性根拠として使わない情報源
- 危険表現・誤情報・広告表現の分析対象としてだけ隔離参照できる情報源
- 一次情報が必要な論点
- 最新性が重要な論点
- 情報源ごとの扱い
- 根拠が弱い場合の扱い
- Deep Researchプロンプトに入れる情報源指定文
- 危険表現レビュー用の隔離表

隔離表は以下の形式にしてください。
| 情報タイプ | 典型的な主張 | なぜ危険か | 相談時の安全な返答方針 |

医療・漢方では、診療ガイドライン、学会資料、PMDA、添付文書、PubMed等の論文、システマティックレビュー、専門医向け資料を優先候補にしてください。
標準医療を否定するページ、受診不要を示唆するページ、医師の診断・治療を代替すると示唆するページ、販売ページ、広告LP、個人ブログ、体験談、SNS投稿は、医学的根拠・処方根拠・安全性根拠として使用しないでください。
ただし、相談現場で患者・保護者が触れている可能性のある誤情報、危険表現、受診回避につながる主張、販売誘導表現を把握する目的に限り、本文根拠とは別枠の隔離表で扱えます。

必ず最後に以下を含めてください。
## 成果物更新
## 次Stepへの引き継ぎ
## ユーザーへの確認質問
### 必須確認
最大3つまで。
### 任意確認
必要な場合のみ。
### 未回答の場合の仮置き`,
      note: `情報源指定が弱いと、Deep Researchは一般論や広告寄り情報に流れます。優先度と除外条件を明確にし、「根拠にしない」情報を危険表現レビューで隔離分析できるようにしてください。`
    },
    {
      role: "Output Architect / 出力形式設計",
      title: "出力形式設計",
      target: "ChatGPT推奨",
      instruction: `Deep Researchの出力形式を設計してください。
最終成果物の用途に合わせて、表、チェックリスト、テンプレート、章立てなどを具体化してください。

必ず以下を含めてください。
- 最終成果物の形式
- 必須セクション
- 表にすべき内容
- チェックリスト化すべき内容
- テンプレート化すべき内容
- 比較表、分類表、QA表、実務フロー、症例テンプレートなどの必要性
- 出力の長さ・粒度
- 読者がそのまま使える形にするための工夫
- Deep Researchプロンプトに入れる出力形式指定文

出力形式が曖昧な場合は、Deep Researchが一般論で終わりやすいため、見出し・表・項目まで指定してください。

必ず最後に以下を含めてください。
## 成果物更新
## 次Stepへの引き継ぎ
## ユーザーへの確認質問
### 必須確認
最大3つまで。
### 任意確認
必要な場合のみ。
### 未回答の場合の仮置き`,
      note: `Deep Researchは、出力形式を明確にすると成果物品質が上がります。読者が使う場面から逆算してください。`
    },
    {
      role: "Prompt Composer / Deep Researchプロンプト作成",
      title: "Deep Researchプロンプト作成",
      target: "ChatGPTまたはClaude推奨",
      instruction: `ここまでの調査設計を踏まえて、Deep Researchに投入できるプロンプト案を作成してください。
必要に応じて、一発版と分割版の両方を作ってください。

必ず以下を含めてください。
- 一発版Deep Researchプロンプト
- 分割版Deep Researchプロンプト
- 分割版の実行順
- 各回の調査目的
- 各回の出力形式
- 情報源指定
- 安全制約・禁止事項
- 除外範囲
- 追加調査が必要になった場合の扱い
- 追加調査案のカテゴリ分け: 安全性 / 根拠 / 実用性 / 学習価値 / 改善仮説
- 病名×漢方テーマの場合の処方・生薬・証・症状クラスター整理プロンプト

Deep Research用プロンプトは、ユーザーがそのままコピーして使える形にしてください。
ただし、未確定事項は勝手に断定せず、仮置きと確認質問に分けてください。

病名×漢方テーマで、処方・生薬・証・症状クラスター整理が必要な場合は、以下の観点を含む追加Deep Researchプロンプトも作ってください。
- 代表的に言及される漢方処方
- 構成生薬
- 証
- 症状クラスター
- 処方意図
- 生薬構成から見た意味
- 添付文書上の効能効果
- 病名そのものへの根拠
- 随伴症状への根拠・経験知
- 注意点
- 症例報告・専門家経験知・患者語彙の探索整理

病名×漢方テーマで改善仮説を作る調査が必要な場合は、次のテンプレート構造を使ってください。

調査テーマ:
【病名】に対する漢方診療・漢方相談の内部学習資料を作るため、代表的に言及される漢方処方、構成生薬、証、症状クラスター、処方意図を調査・整理する。

目的:
患者に処方を勧めることではなく、漢方医・薬剤師・漢方相談実務者が、【病名】に関連する症状を漢方医学的にどう捉え、どのような処方群・生薬がどの症候に関連して語られるかを学ぶこと。

禁止事項:
- 個別患者への診断、処方指示、服薬開始・中止・変更の指示をしない
- 「【病名】にはこの漢方」とする病名処方やランキングにしない
- 患者配布用、Web公開用、販売促進用の断定表現にしない

整理する内容:
1. 症状クラスター
- 広範痛、筋肉痛、こわばり、しびれ、冷え、のぼせ、疲労、睡眠障害、不安・抑うつ、胃腸症状、月経・更年期関連症状、薬への不安、標準治療への不満など、病名に応じて調整する
2. 漢方医学的な病態軸
- 気虚、血虚、気滞 / 気鬱、瘀血、水滞、寒、熱、虚実、寒熱錯雑、肝鬱、脾虚、腎虚、上熱下寒など
3. 代表的に言及される処方群
- 桂枝加朮附湯、疎経活血湯、牛車腎気丸、抑肝散、加味逍遙散、桂枝茯苓丸、芍薬甘草湯、当帰芍薬散、真武湯、十味剉散、補中益気湯、人参養栄湯、柴胡加竜骨牡蛎湯、半夏厚朴湯など。病名に応じて追加・削除する
4. 処方整理表
| 処方名 | 検討される症状クラスター | 想定される証・病態軸 | 処方意図 | 主要構成生薬 | 生薬構成から見た意味 | 添付文書上の効能効果 | 病名そのものへの根拠 | 随伴症状への根拠・経験知 | 注意点 |
5. 生薬整理表
| 生薬 | よく含まれる処方 | 漢方医学的な役割 | 関連する症状・病態 | 注意点 | 病名資料での扱い |
6. 情報源の扱い
- PMDA・添付文書、診療ガイドライン、PubMed / J-STAGE / CiNiiなどの論文、症例報告、漢方専門医・専門家解説、専門書相当の情報、個人ブログ・体験談、販売ページを分ける
- 症例報告、専門家解説、個人ブログは、効果の根拠ではなく、処方仮説・患者の困りごと・相談語彙の参考として扱う
- 標準医療を否定するページ、受診不要を示唆するページ、医師の診断・治療を代替すると示唆するページ、販売ページ、広告LP、個人ブログ、体験談、SNS投稿は、医学的根拠・処方根拠・安全性根拠として使用しない
- ただし、患者・保護者が触れている可能性のある誤情報、危険表現、受診回避主張、販売誘導表現を把握する目的に限り、本文根拠とは別枠で隔離分析する
- 隔離分析した内容を、根拠表・処方表・安全性根拠に混ぜない
- 危険表現レビューは以下の表で出す
| 情報タイプ | 典型的な主張 | なぜ危険か | 相談時の安全な返答方針 |
7. 最終出力形式
- 症状クラスター別整理表
- 処方群整理表
- 生薬整理表
- 証・病態軸整理表
- 情報源別の信頼性分類
- 医師・漢方医向けの学習ポイント
- 薬剤師向けの確認ポイント
- 漢方相談員向けの聞き取りポイント
- 一般ユーザー向けには出さない内容
- 今後の追加調査項目

必ず最後に以下を含めてください。
## 成果物更新
## 次Stepへの引き継ぎ
## ユーザーへの確認質問
### 必須確認
最大3つまで。
### 任意確認
必要な場合のみ。
### 未回答の場合の仮置き`,
      note: `プロンプトは説明文ではなく、Deep Researchに実際に貼る調査依頼文として書いてください。`
    },
    {
      role: "Final QA / 失敗パターン確認",
      title: "最終QA・完成プロンプト",
      target: "ChatGPTまたはClaude推奨",
      instruction: `これまでの調査設計とプロンプト案を最終確認し、Deep Researchに渡せる完成版にしてください。
会議ログではなく、ユーザーが持ち帰れる調査設計成果物としてまとめてください。

必ず以下の見出しをこの順番で使ってください。
## 依頼の目的診断
## このままだと起きる問題
## 一発調査か分割調査か
判定は 一発でよい / 分割推奨 / 強く分割推奨 のいずれかで明記してください。
## 調査戦略
以下の3案を必ず比較し、デフォルトは C としてください。
- A. 一括で広く深く調べる: 初回に全体像・論点・情報源候補・安全上の赤旗を集める。これは最終確定資料ではなく、Deep Research reviewにかけるための全体地図です。
- B. 最初から分割して調べる: 医療・法律・安全性など高リスクで、添付文書・症例報告・エビデンスを丁寧に分けたい場合に使う。
- C. 一括で全体地図 → Deep Research review → 必要部分だけ分割: 推奨戦略。一括版の使いやすさと分割版の精度を両立する。
## 推奨する調査構成
病名×漢方テーマでは、医学的基礎、安全確認、漢方医学的病態、処方群・生薬・証、症状クラスター、症例報告・専門家経験知、エビデンス、読者別成果物化を必要に応じて分けてください。
## 情報源設計
「根拠にしない」と「参照しない」を区別してください。標準医療を否定するページ、受診不要を示唆するページ、医師の診断・治療を代替すると示唆するページ、販売ページ、広告LP、個人ブログ、体験談、SNS投稿は、医学的根拠・処方根拠・安全性根拠として使用しないでください。
ただし、相談現場で患者・保護者が触れている可能性のある誤情報、危険表現、受診回避につながる主張、販売誘導表現を把握する目的に限り、本文根拠とは別枠で隔離分析できます。
隔離分析する場合は、以下の表で出してください。
| 情報タイプ | 典型的な主張 | なぜ危険か | 相談時の安全な返答方針 |
## 安全制約・禁止事項
リスク判定は 低 / 中 / 高 のいずれかで明記してください。
## 補完軸の判定
安全性、根拠、実用性、学習価値、改善仮説のうち、今回優先する軸を明記してください。
## Deep Research用プロンプト案
### 一発版
一括・広く深く版として作ってください。全体像・論点・情報源候補・安全上の赤旗を集める初回調査であり、最終確定資料ではなくDeep Research review用の全体地図であることを明記してください。
### 分割版
一括結果をDeep Research reviewした後、必要部分を深掘りする後続調査候補として出してください。初回一括版の代替ではなく、review後の分割候補として位置づけてください。
## Deep Researchに貼る完成プロンプト
ここから下をDeep Researchに貼ってください。
---
本文
---
ここまで
完成プロンプトは、本命の「一括・広く深く版」としてください。一括版だけで最終判断せず、結果をDeep Research reviewにかけ、抜け漏れ・根拠の弱さ・危険箇所を確認する前提を必ず入れてください。
## 2回目以降用・軽量版プロンプト
一括Deep Research後、Deep Research review後、または次調査カードから再調査するときに使う短いプロンプトです。
必ず以下を含めてください。
- Decision Ledger
- Answer Ledgerの重要回答
- 今回の調査テーマ
- 前回までに確定した条件
- 前回の未解決Issue
- 今回だけ深掘りする範囲
- 除外範囲
- 出力形式
- 安全制約
- 前回結果を前提に重複調査を避ける指示
一括版ほど長い背景説明は繰り返さず、「今回のDeep Researchでは何を深掘りし、何を扱わないか」を明確にしてください。
## 矛盾検出
Answer Ledger / Decision Ledgerと完成プロンプトが矛盾している場合は、矛盾内容を明示し、Decision Ledgerを優先して修正してください。矛盾がない場合は「なし」と書いてください。
## 避けるべき出力
## 次アクション
## 追加調査案
### 安全性を補う調査
### 根拠を補う調査
### 実用性を高める調査
### 学習価値を高める調査
### 改善仮説を作る調査
## 病名×漢方テーマ用プロンプト案
病名×漢方テーマの場合のみ、該当するものをコピーして使えるプロンプトとして出してください。該当しない場合は「該当なし」と書いてください。
### 医学的基礎プロンプト
### 漢方病態・証プロンプト
### 処方・生薬・症状クラスター整理プロンプト
### 方剤別安全性・添付文書照合プロンプト
### 一般ユーザー向け相談前メモ化プロンプト
### 専門職向け分冊化プロンプト
## ユーザーへの確認質問
### 必須確認
最大3つまで。質問で処理を止めず、未回答時の仮置きも示してください。
Decision Ledgerで確定済みの主読者、副読者、専門度、用途、外部公開の有無、初回調査範囲、除外範囲、深掘り項目、後続調査項目は再質問しないでください。
### 任意確認
必要な場合のみ。
### 未回答の場合の仮置き

出口カードで正確に抽出できるよう、該当する本文を以下のHTMLコメントで必ず囲んでください。コメントは削除せず、そのまま出力してください。
<!-- AI_BOARD:DR_PROMPT_COMPLETE:START -->
Deep Researchに貼る完成プロンプト
<!-- AI_BOARD:DR_PROMPT_COMPLETE:END -->
<!-- AI_BOARD:DR_PROMPT_LIGHTWEIGHT:START -->
2回目以降用・軽量版プロンプト
<!-- AI_BOARD:DR_PROMPT_LIGHTWEIGHT:END -->
<!-- AI_BOARD:DR_PROMPT_OPINION_REQUEST:START -->
# ChatGPTに意見をもらう用カード
全文ログではなく、この軽量カードを使って相談してください。

## 相談したいこと

## 現在の結論

## 採用可否

## 使える内容

## 未解決Issue

## 次アクション候補

## 判断してほしい観点

## 回答形式
<!-- AI_BOARD:DR_PROMPT_OPINION_REQUEST:END -->
<!-- AI_BOARD:DR_PROMPT_ONE_SHOT:START -->
一発版プロンプト
<!-- AI_BOARD:DR_PROMPT_ONE_SHOT:END -->
<!-- AI_BOARD:DR_PROMPT_SPLIT:START -->
分割版プロンプト
<!-- AI_BOARD:DR_PROMPT_SPLIT:END -->
<!-- AI_BOARD:DR_PROMPT_ORDER:START -->
推奨する実行順
<!-- AI_BOARD:DR_PROMPT_ORDER:END -->
<!-- AI_BOARD:DR_PROMPT_ADDITIONAL:START -->
追加調査案
<!-- AI_BOARD:DR_PROMPT_ADDITIONAL:END -->
<!-- AI_BOARD:DR_PROMPT_QUESTIONS:START -->
ユーザーへの確認質問
<!-- AI_BOARD:DR_PROMPT_QUESTIONS:END -->
<!-- AI_BOARD:DR_PROMPT_ASSUMPTIONS:START -->
未回答の場合の仮置き
<!-- AI_BOARD:DR_PROMPT_ASSUMPTIONS:END -->
<!-- AI_BOARD:DR_PROMPT_DECISION_LEDGER:START -->
確定済み条件 / Decision Ledger
<!-- AI_BOARD:DR_PROMPT_DECISION_LEDGER:END -->
<!-- AI_BOARD:DR_PROMPT_ANSWER_LEDGER:START -->
回答済み質問 / Answer Ledger
<!-- AI_BOARD:DR_PROMPT_ANSWER_LEDGER:END -->
病名×漢方テーマの場合は、該当する追加プロンプトも以下で囲んでください。該当しない場合は各ブロック内に「該当なし」と書いてください。
<!-- AI_BOARD:DR_KAMPO_BASELINE:START -->
医学的基礎プロンプト
<!-- AI_BOARD:DR_KAMPO_BASELINE:END -->
<!-- AI_BOARD:DR_KAMPO_PATTERN:START -->
漢方病態・証プロンプト
<!-- AI_BOARD:DR_KAMPO_PATTERN:END -->
<!-- AI_BOARD:DR_KAMPO_FORMULA:START -->
処方・生薬・症状クラスター整理プロンプト
<!-- AI_BOARD:DR_KAMPO_FORMULA:END -->
<!-- AI_BOARD:DR_KAMPO_SAFETY:START -->
方剤別安全性・添付文書照合プロンプト
<!-- AI_BOARD:DR_KAMPO_SAFETY:END -->
<!-- AI_BOARD:DR_KAMPO_PUBLIC:START -->
一般ユーザー向け相談前メモ化プロンプト
<!-- AI_BOARD:DR_KAMPO_PUBLIC:END -->
<!-- AI_BOARD:DR_KAMPO_PROFESSIONAL:START -->
専門職向け分冊化プロンプト
<!-- AI_BOARD:DR_KAMPO_PROFESSIONAL:END -->

Final QAでは以下を確認してください。
- Answer Ledgerの回答済み質問がDecision Ledgerに反映されているか
- Decision Ledgerの確定条件が完成プロンプトに反映されているか
- 主読者、副読者、専門度が完成プロンプトに明示されているか
- 主読者が漢方医の場合、漢方相談員・薬剤師・漢方薬局スタッフを主読者として横並びに残していないか
- 完成プロンプトがDecision Ledgerと矛盾していないか
- 矛盾がある場合、Decision Ledgerを優先して完成プロンプトを修正したか
- 目的が曖昧ではないか
- 読者が曖昧ではないか
- 一発か分割か判定されているか
- 情報源が指定されているか
- 「根拠にしない」と「参照しない」が区別されているか
- 標準医療否定、受診不要示唆、医師の診断・治療代替示唆、販売ページ、広告LP、個人ブログ、体験談、SNS投稿が根拠に混ざっていないか
- 危険表現・誤情報・広告表現は本文根拠とは別枠の隔離表で扱われているか
- 高リスク領域の安全制約があるか
- 出力形式が明確か
- 避けるべき出力が明記されているか
- 回答済みの質問を再質問していないか
- 未確定事項が最後の質問欄に集約されているか

回帰テスト観点:
Decision Ledgerに「主読者: 漢方医」「副読者: 薬剤師 / 漢方相談員 / 漢方薬局スタッフ / 内部研修担当者」「専門度: 上級者向け」「用途: 内部学習・相談準備用」「外部公開の有無: 外部公開しない」「初回調査範囲: 医学的基礎 / 安全確認 / 症状クラスター / 漢方病態 / 代表処方群・生薬候補の概観」「後続調査に回す項目: 方剤別PMDA・添付文書照合 / 症例報告網羅 / エビデンス評価」「除外範囲: 患者配布 / Web公開 / 販売促進」がある場合、完成プロンプトは必ずこの条件に従ってください。`,
      note: `ユーザーへの確認質問は最後にまとめてください。途中で質問して止めず、仮置き前提で完成プロンプトまで出してください。`
    }
  ],
  deepResearchReview: [
    {
      role: "Result Framer / 調査結果の構造整理",
      title: "調査結果の構造整理",
      target: "ChatGPT推奨",
      instruction: `Deep Research結果を構造化してください。
要約だけでなく、元の調査目的、主な結論、作成された成果物、提示された情報源、未解決論点、高リスク領域かどうか、重点レビュー観点を整理してください。
必ず以下を含めてください。
- 元の調査目的
- 調査結果の要約
- 主な結論
- 作成された成果物
- 提示された情報源
- 未解決論点
- 高リスク領域かどうか
- 重点レビュー観点`,
      note: `Deep Research結果を「読む」ためではなく、検証して成果物に変換するための入口整理にしてください。`
    },
    {
      role: "Claim & Evidence Mapper / 主張・根拠対応表作成",
      title: "主張・根拠対応表作成",
      target: "Claude推奨",
      instruction: `Deep Research結果の主要な主張を抽出し、それぞれに対応する根拠・出典を整理してください。
主張と根拠が対応していないもの、根拠が弱いもの、出典不明のものを明示してください。
必ず以下を含めてください。
- 主張・根拠対応表
- Claim ID
- 主張
- 対応する根拠・出典
- 根拠種別
- 根拠の強さ
- 要確認点
- 間違っていた場合のリスク

表形式の例:
| Claim ID | 主張 | 対応する根拠・出典 | 根拠種別 | 根拠の強さ | 要確認点 | 間違っていた場合のリスク |`,
      note: `Deep Researchの主張をそのまま採用せず、主張と根拠が本当に対応しているかを確認してください。`
    },
    {
      role: "Source & Evidence Auditor / 情報源・根拠レベル監査",
      title: "情報源・根拠レベル監査",
      target: "Claude推奨",
      instruction: `Deep Research結果の情報源と根拠レベルを監査してください。
情報源の信頼性、一次情報かどうか、公開日・更新日、古い情報、出典不明の主張を確認してください。
「根拠にしない」と「参照しない」を区別し、根拠には使えないが危険表現レビューとして隔離分析できる情報も分けてください。
必ず以下を含めてください。
- 信頼できる情報源
- 根拠が弱い情報源
- 根拠として使ってはいけないが危険表現レビューとして隔離参照できる情報
- 古い情報
- 出典不明の主張
- 一次情報で確認すべき主張
- 根拠レベル
- 追加確認すべき情報源
- 危険表現・誤情報・広告表現の隔離表

隔離表は以下の形式にしてください。
| 情報タイプ | 典型的な主張 | なぜ危険か | 相談時の安全な返答方針 |

根拠レベルは以下を基本にしてください。
- A: 公的機関・一次情報・公式資料
- B: ガイドライン・専門機関資料
- C: 査読論文・レビュー論文
- D: 専門家解説・医療機関資料
- E: メーカー公式情報
- F: 一般記事・個人ブログ・体験談・SNS投稿。医学的根拠・処方根拠・安全性根拠にはしない。危険表現レビューに限り隔離分析可。`,
      note: `情報源の種類、古さ、一次情報かどうかを分け、根拠が弱い情報を結論の中心に置かないでください。標準医療否定、受診不要示唆、販売誘導などは根拠ではなく危険表現として隔離してください。`
    },
    {
      role: "Coverage & Gap Critic / 抜け漏れ・過剰範囲レビュー",
      title: "抜け漏れ・過剰範囲レビュー",
      target: "Claude推奨",
      instruction: `Deep Research結果が元の調査質問に十分答えているか、抜け漏れや過剰な範囲がないかレビューしてください。
必ず以下を含めてください。
- 答えられている問い
- 答えが弱い問い
- 未回答の問い
- 調査範囲から外れている内容
- 範囲を広げすぎた内容
- 追加調査が必要な論点`,
      note: `元の調査目的と照合し、足りない情報だけでなく、余計に広がった情報も分けてください。`
    },
    {
      role: "Risk & Safety Critic / 安全性・禁止判断レビュー",
      title: "安全性・禁止判断レビュー",
      target: "Claude推奨",
      instruction: `Deep Research結果に安全性上の問題がないかレビューしてください。
医療、法律、金融、セキュリティなど高リスク領域では特に慎重に確認してください。
必ず以下を含めてください。
- 危険な結論
- 過剰な断定
- 標準医療を否定する表現
- 受診不要を示唆する表現
- 医師の診断・治療を代替すると示唆する表現
- 販売誘導・広告表現
- 専門家確認が必要な内容
- 禁止すべき使い方
- 個人情報・機密情報の懸念
- 安全に使うための制約
- 危険表現・誤情報の隔離表

隔離表は以下の形式にしてください。
| 情報タイプ | 典型的な主張 | なぜ危険か | 相談時の安全な返答方針 |`,
      note: `危険な内容と使える内容を混ぜないでください。高リスク領域では安全性を優先してください。根拠にできない情報も、相談現場で触れる危険表現として隔離分析してください。`
    },
    {
      role: "Practicality Critic / 実用性レビュー",
      title: "実用性レビュー",
      target: "Claude推奨",
      instruction: `Deep Research結果が実務で使えるかレビューしてください。
単なるレポートではなく、ユーザーが実際に使える成果物になっているか確認してください。
必ず以下を含めてください。
- 使いやすい点
- 実務で使いにくい点
- 一般論に留まっている箇所
- チェックリスト化できる内容
- 質問リスト化できる内容
- 成果物として不足している点
- 具体化すべき内容`,
      note: `実務でそのまま使える形か、チェックリスト・質問リスト・手順に変換できるかを見てください。`
    },
    {
      role: "Artifact Refiner / 成果物改訂・追加調査案作成",
      title: "成果物改訂・追加調査案作成",
      target: "ChatGPT推奨",
      instruction: `ここまでのレビューを踏まえて、Deep Research結果を使える成果物に改訂してください。
危険な内容は除外し、根拠が弱い内容は注意付きにし、必要なら追加Deep Researchプロンプトを作成してください。
標準医療否定、受診不要示唆、医師の診断・治療の代替示唆、販売誘導、体験談依存などは成果物の根拠に混ぜず、必要な場合は危険表現レビューとして隔離してください。
必ず以下を含めてください。
- 採用できる内容
- 削るべき内容
- 修正すべき内容
- 改訂版成果物
- 注意事項
- 追加Deep Researchプロンプト案
- 危険表現・誤情報の隔離表`,
      note: `要約ではなく、実際に使える成果物へ変換してください。危険な内容や根拠が弱い内容は明確に扱いを分けてください。`
    },
    {
      role: "Final Judge / 採用可否・最終成果物・次アクション",
      title: "採用可否・最終成果物・次アクション",
      target: "ChatGPTまたはClaude推奨",
      instruction: `Deep Research結果と改訂案について、最終判断を出してください。
必ず以下の見出しをこの順番で使ってください。
## 採用可否
Pass / Conditional Pass / Needs Revision / Needs More Research / Reject のいずれかで判定してください。
## 採用条件
採用できる場合の条件を明記してください。
## 採用できる内容
## 修正すべき内容
## 危険な内容
危険なため使わない内容を明記してください。
標準医療を否定するページ、受診不要を示唆するページ、医師の診断・治療を代替すると示唆するページ、販売ページ、広告LP、個人ブログ、体験談、SNS投稿に含まれる危険表現・誤情報・広告表現は、根拠には使わず、必要に応じて以下の隔離表で扱ってください。
| 情報タイプ | 典型的な主張 | なぜ危険か | 相談時の安全な返答方針 |
## 情報源レビュー
「根拠にしない」と「参照しない」を区別し、根拠として不採用の情報が本文の根拠・安全性判断・処方判断に混ざっていないか確認してください。
## 主張・根拠対応レビュー
## 抜け漏れ
## 実用性レビュー
## 目的別評価
### Safety value
安全資料として使えるかを評価してください。
### Learning value
学習資料として深いかを評価してください。
### Actionability
実務・相談・改善策に使えるかを評価してください。
### Clinical hypothesis value
処方・生薬・証・症状クラスターの仮説形成に使えるかを評価してください。
### Public safety
一般向けに出してよいかを評価してください。
### Evidence readiness
根拠確認が済んでいるかを評価してください。
### Next research
次に何を調査すべきかを評価してください。
## この結果が使える目的
## この結果が不十分な目的
## ユーザーの本来目的に照らした不足
## 次に必要なDeep Research
## 改訂版成果物
ここには、レビュー文ではなく、ユーザーがそのまま使える最終成果物だけを入れてください。
会議ログ、メタ評価、根拠レビューの説明は他の見出しに分け、改訂版成果物には混ぜないでください。
可能なら、相談前メモ、チェックリスト、質問リスト、プロンプト案など、コピーして使える形式にしてください。
## 追加Deep Researchプロンプト案
追加調査案は、安全性だけに偏らせず、必ず以下のカテゴリに分けてください。
### 安全性を補う調査
### 根拠を補う調査
### 実用性を高める調査
### 学習価値を高める調査
### 改善仮説を作る調査
## 次アクション
## 結論の自信度
## 自信度の理由

出口カードで正確に抽出できるよう、該当する本文を以下のHTMLコメントで必ず囲んでください。コメントは削除せず、そのまま出力してください。
<!-- AI_BOARD:DR_REVIEW_ADOPTION:START -->
採用可否
<!-- AI_BOARD:DR_REVIEW_ADOPTION:END -->
<!-- AI_BOARD:DR_REVIEW_CONDITIONS:START -->
採用条件
<!-- AI_BOARD:DR_REVIEW_CONDITIONS:END -->
<!-- AI_BOARD:DR_REVIEW_USABLE:START -->
採用できる内容
<!-- AI_BOARD:DR_REVIEW_USABLE:END -->
<!-- AI_BOARD:DR_REVIEW_FIXES:START -->
修正すべき内容
<!-- AI_BOARD:DR_REVIEW_FIXES:END -->
<!-- AI_BOARD:DR_REVIEW_RISK:START -->
危険な内容
危険表現・誤情報・広告表現の隔離表
<!-- AI_BOARD:DR_REVIEW_RISK:END -->
<!-- AI_BOARD:DR_REVIEW_SOURCE_REVIEW:START -->
情報源レビュー
<!-- AI_BOARD:DR_REVIEW_SOURCE_REVIEW:END -->
<!-- AI_BOARD:DR_REVIEW_CLAIM_EVIDENCE:START -->
主張・根拠対応レビュー
<!-- AI_BOARD:DR_REVIEW_CLAIM_EVIDENCE:END -->
<!-- AI_BOARD:DR_REVIEW_GAPS:START -->
抜け漏れ
<!-- AI_BOARD:DR_REVIEW_GAPS:END -->
<!-- AI_BOARD:DR_REVIEW_PRACTICALITY:START -->
実用性レビュー
<!-- AI_BOARD:DR_REVIEW_PRACTICALITY:END -->
<!-- AI_BOARD:DR_REVIEW_REVISED_ARTIFACT:START -->
改訂版成果物
<!-- AI_BOARD:DR_REVIEW_REVISED_ARTIFACT:END -->
<!-- AI_BOARD:DR_REVIEW_RESEARCH_BRIEF:START -->
# Research Brief

## Executive Summary

## Research Question

## Key Findings

## Claim / Evidence Table
この表はreview結果の整理であり、検証済みの真実や推奨ではないことを明記してください。

## Source Quality

## Risk / Safety Notes

## What Can Be Used

## What Cannot Be Used

## Open Questions

## Next Research Prompts

## Decision Ledger
入力に存在する場合のみ反映してください。存在しない場合は「未提供」または「未抽出」と書いてください。

## Answer Ledger
入力に存在する場合のみ反映してください。存在しない場合は「未提供」または「未抽出」と書いてください。
<!-- AI_BOARD:DR_REVIEW_RESEARCH_BRIEF:END -->
<!-- AI_BOARD:DR_REVIEW_OPINION_REQUEST:START -->
# ChatGPTに意見をもらう用カード
全文ログではなく、この軽量カードを使って相談してください。

## 相談したいこと
Research Brief、採用可否、未解決Issue、次アクションを前提に、追加で第三者視点の確認をもらいたいことを書いてください。

## 現在の結論
Research Briefと採用可否を短く要約してください。

## 採用可否
採用可否を転記してください。

## 使える内容
採用できる内容、改訂版成果物、用途別安全変換版から、相談に使いたい内容だけを短く整理してください。

## 未解決Issue
Issue / 未解決論点を転記してください。

## 次アクション候補
次アクションと追加Deep Researchプロンプト案を短く整理してください。

## 判断してほしい観点
- この結論は用途に対して過不足がないか
- 危険な内容と使える内容が分離できているか
- 次に深掘りすべき調査が妥当か

## 回答形式
- 良い点
- 懸念点
- 追加で確認すべきこと
- 次に使うカードやプロンプトへの修正案
<!-- AI_BOARD:DR_REVIEW_OPINION_REQUEST:END -->
<!-- AI_BOARD:DR_REVIEW_PUBLIC_SAFE_ARTIFACT:START -->
一般ユーザー向けに安全加工した成果物。
処方名・生薬名・証・症例報告の処方名は原則出さない。
主治医に聞く質問、薬剤師に伝える薬歴、すぐ受診すべきサイン、自己判断で避けることを中心にする。
<!-- AI_BOARD:DR_REVIEW_PUBLIC_SAFE_ARTIFACT:END -->
<!-- AI_BOARD:DR_REVIEW_PHARMACY_SAFETY_ARTIFACT:START -->
薬剤師・漢方相談員・薬局スタッフ向けの安全確認メモ。
薬歴整理、副作用確認、受診勧奨、主治医確認につなげる内容。
診断・処方判断・服薬変更指示はしない。
<!-- AI_BOARD:DR_REVIEW_PHARMACY_SAFETY_ARTIFACT:END -->
<!-- AI_BOARD:DR_REVIEW_PRO_INTERNAL_ARTIFACT:START -->
漢方医・医師・専門職向けの内部学習資料。
処方名・生薬名・証を扱ってよいが、病名処方・処方推奨・効果保証にはしない。
根拠レベル、安全性、追加調査が必要な点を併記する。
<!-- AI_BOARD:DR_REVIEW_PRO_INTERNAL_ARTIFACT:END -->
<!-- AI_BOARD:DR_REVIEW_ADDITIONAL_PROMPTS:START -->
追加Deep Researchプロンプト案
<!-- AI_BOARD:DR_REVIEW_ADDITIONAL_PROMPTS:END -->
<!-- AI_BOARD:DR_REVIEW_ISSUES:START -->
未解決Issue
<!-- AI_BOARD:DR_REVIEW_ISSUES:END -->
<!-- AI_BOARD:DR_REVIEW_NEXT_ACTION:START -->
次アクション
<!-- AI_BOARD:DR_REVIEW_NEXT_ACTION:END -->
<!-- AI_BOARD:DR_REVIEW_CONFIDENCE:START -->
結論の自信度
<!-- AI_BOARD:DR_REVIEW_CONFIDENCE:END -->
<!-- AI_BOARD:DR_REVIEW_HANDOFF:START -->
次Stepへの引き継ぎ
<!-- AI_BOARD:DR_REVIEW_HANDOFF:END -->
<!-- AI_BOARD:DR_REVIEW_HANDOFF_CARD:START -->
# 議題
次に必要なDeep Researchプロンプトを作成する

# 背景
このカードはDeep Research review由来の次調査カードです。前回レビューの採用可否、未解決Issue、追加調査案をもとに、次のDeep Researchプロンプト作成モードで新規議題カードとして使います。

# 元テーマ
元のDeep Researchテーマまたはレビュー対象

# 今回レビュー結果の採用可否
採用可否

# 追加調査が必要な理由
未解決Issue、危険な内容、修正すべき内容から整理

# 次に調べるべきテーマ
追加Deep Researchプロンプト案から選ぶ

# 次回Deep Researchの目的
今回レビューで不足した点を補う

# 対象読者
未入力または要確認

# 除外範囲
今回レビューで危険・不採用とした内容

# 安全制約
高リスク領域では安全性を優先し、根拠の弱い情報を推奨扱いしない

# 情報源条件
情報源レビューで採用した一次情報・公的情報・専門資料

# 出力形式
次回Deep Researchで欲しい成果物形式

# 未解決Issue
Issue / 未解決論点

# 次アクション
次アクション

# 仮置き条件
不明点は未入力または要確認として残す
<!-- AI_BOARD:DR_REVIEW_HANDOFF_CARD:END -->

Final Judgeでは、Deep Research結果が「何には使えるが、何には不十分か」を必ず分けてください。
病名×漢方テーマでは、安全性だけでなく、Learning value と Clinical hypothesis value を必ず評価してください。
安全資料としてはConditional Passでも、処方・生薬・証・症状クラスターの学習資料として不足する場合は Needs More Research と判定してください。
例: 安全資料としてはConditional Pass。医学的基礎資料としても良い。しかし、漢方処方・生薬・証・改善仮説の学習資料としてはNeeds More Research。次に必要なのは、処方・生薬・証・症状クラスターの整理である。`,
      note: `Deep Research結果をそのまま採用せず、情報源・根拠・抜け漏れ・安全性・実用性・学習価値・改善仮説価値を踏まえて最終判断してください。追加調査が必要な場合は、そのままDeep Researchに投げられる追加プロンプト案をカテゴリ別に出してください。`
    }
  ]
};

const aiUrls = {
  chatgpt: "https://chatgpt.com/",
  claude: "https://claude.ai/",
  gemini: "https://gemini.google.com/"
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

const deepResearchReviewFocusDefaults = [
  "情報源の信頼性",
  "主張と根拠の対応",
  "抜け漏れ",
  "安全性",
  "実用性",
  "追加調査の必要性"
];

const deepResearchReviewArtifactDefaults = [
  "採用可否",
  "修正すべき点",
  "危険な内容",
  "改訂版成果物",
  "追加Deep Researchプロンプト案",
  "次アクション"
];

const deepResearchReviewDefaultPurpose = "一般ユーザー向けに、レビュー結果を相談前メモ・専門家への質問リスト・安全なDeep Research用プロンプトとして再利用する。";

const deepResearchDecisionLedgerFields = [
  { key: "primaryAudience", label: "主読者" },
  { key: "secondaryAudience", label: "副読者" },
  { key: "expertiseLevel", label: "専門度" },
  { key: "use", label: "用途" },
  { key: "publicExposure", label: "外部公開の有無" },
  { key: "initialScope", label: "初回調査範囲" },
  { key: "excludedScope", label: "除外範囲" },
  { key: "deepDive", label: "深掘りする項目" },
  { key: "followUp", label: "後続調査に回す項目" }
];

const deepResearchReviewCompleteSectionLabels = [
  "採用可否",
  "採用条件",
  "採用できる内容",
  "修正すべき内容",
  "危険な内容",
  "危険なため使わない内容",
  "情報源レビュー",
  "主張・根拠対応レビュー",
  "抜け漏れ",
  "実用性レビュー",
  "目的別評価",
  "Safety value",
  "Learning value",
  "Actionability",
  "Clinical hypothesis value",
  "Public safety",
  "Evidence readiness",
  "Next research",
  "この結果が使える目的",
  "この結果が不十分な目的",
  "ユーザーの本来目的に照らした不足",
  "次に必要なDeep Research",
  "改訂版成果物",
  "Research Brief",
  "研究ブリーフ",
  "一般向け安全変換版",
  "薬剤師・相談員向け安全確認版",
  "専門職向け内部資料版",
  "追加Deep Researchプロンプト案",
  "追加Deep Researchプロンプト",
  "安全性を補う調査",
  "根拠を補う調査",
  "実用性を高める調査",
  "学習価値を高める調査",
  "改善仮説を作る調査",
  "未解決Issue",
  "Issue / 未解決論点",
  "未解決論点",
  "次アクション",
  "結論の自信度",
  "自信度の理由",
  "次Stepへの引き継ぎ",
  "次Stepへの入力",
  "引き継ぎ"
];

const deepResearchReviewRestoreCardConfigs = [
  { key: "adoption", label: "採用可否" },
  { key: "adoptionConditions", label: "採用条件" },
  { key: "usable", label: "採用できる内容" },
  { key: "fixes", label: "修正すべき内容" },
  { key: "dangerous", label: "危険な内容" },
  { key: "sourceReview", label: "情報源レビュー" },
  { key: "claimEvidence", label: "主張・根拠対応レビュー" },
  { key: "gaps", label: "抜け漏れ" },
  { key: "practicality", label: "実用性レビュー" },
  { key: "artifact", label: "改訂版成果物" },
  { key: "researchBrief", label: "Research Brief" },
  { key: "opinionRequest", label: "ChatGPTに意見をもらう用カード" },
  { key: "publicSafeArtifact", label: "一般向け安全変換版" },
  { key: "pharmacySafetyArtifact", label: "薬剤師・相談員向け安全確認版" },
  { key: "proInternalArtifact", label: "専門職向け内部資料版" },
  { key: "additionalPrompt", label: "追加Deep Researchプロンプト案" },
  { key: "nextActions", label: "次アクション" },
  { key: "issues", label: "Issue / 未解決論点" },
  { key: "handoffCard", label: "次調査カード" },
  { key: "confidence", label: "結論の自信度" }
];

const goldenCaseExitCardAliases = {
  "完成プロンプト": "completePrompt",
  "Deep Researchに貼る完成プロンプト": "completePrompt",
  "complete prompt": "completePrompt",
  "一括・広く深く版": "completePrompt",
  "wide deep prompt": "completePrompt",
  "2回目以降用・軽量版": "lightweight",
  "軽量版": "lightweight",
  "lightweight": "lightweight",
  "light prompt": "lightweight",
  "lightweight prompt": "lightweight",
  "ChatGPTに意見をもらう用カード": "opinionRequest",
  "意見をもらう用カード": "opinionRequest",
  "opinion request": "opinionRequest",
  "chatgpt opinion request": "opinionRequest",
  "chatgpt card": "opinionRequest",
  "opinion card": "opinionRequest",
  "一発版プロンプト": "oneShot",
  "分割版プロンプト": "split",
  "split prompt": "split",
  "推奨する実行順": "order",
  "推奨実行順": "order",
  "strategy": "order",
  "order": "order",
  "追加調査案": "additional",
  "追加Deep Researchプロンプト案": ["additional", "additionalPrompt"],
  "additional prompts": ["additional", "additionalPrompt"],
  "ユーザーへの確認質問": "questions",
  "未回答時の仮置き": "assumptions",
  "assumptions": "assumptions",
  "Decision Ledger": "decisionLedger",
  "decision ledger": "decisionLedger",
  "Answer Ledger": "answerLedger",
  "answer ledger": "answerLedger",
  "医学的基礎プロンプト": "kampoBaseline",
  "漢方病態・証プロンプト": "kampoPattern",
  "処方・生薬・症状クラスター整理プロンプト": "kampoFormula",
  "方剤別安全性・添付文書照合プロンプト": "kampoSafety",
  "一般ユーザー向け相談前メモ化プロンプト": "kampoPublic",
  "専門職向け分冊化プロンプト": "kampoProfessional",
  "採用可否": "adoption",
  "adoption": "adoption",
  "採用条件": "adoptionConditions",
  "adoption conditions": "adoptionConditions",
  "採用できる内容": "usable",
  "修正すべき内容": "fixes",
  "危険な内容": "dangerous",
  "risk": "dangerous",
  "情報源レビュー": "sourceReview",
  "source review": "sourceReview",
  "主張・根拠対応レビュー": "claimEvidence",
  "claim evidence": "claimEvidence",
  "claim evidence review": "claimEvidence",
  "抜け漏れ": "gaps",
  "実用性レビュー": "practicality",
  "改訂版成果物": "artifact",
  "revised artifact": "artifact",
  "Research Brief": "researchBrief",
  "research brief": "researchBrief",
  "研究ブリーフ": "researchBrief",
  "brief": "researchBrief",
  "knowledge brief": "researchBrief",
  "brief card": "researchBrief",
  "ChatGPT相談向け": "opinionRequest",
  "ChatGPTに意見をもらう用カード": "opinionRequest",
  "意見をもらう用カード": "opinionRequest",
  "opinion request": "opinionRequest",
  "chatgpt opinion request": "opinionRequest",
  "chatgpt card": "opinionRequest",
  "opinion card": "opinionRequest",
  "一般向け安全変換版": "publicSafeArtifact",
  "public safe artifact": "publicSafeArtifact",
  "public safe conversion": "publicSafeArtifact",
  "public memo": "publicSafeArtifact",
  "safe consultation memo": "publicSafeArtifact",
  "薬剤師・相談員向け安全確認版": "pharmacySafetyArtifact",
  "pharmacy safety artifact": "pharmacySafetyArtifact",
  "counselor safety artifact": "pharmacySafetyArtifact",
  "専門職向け内部資料版": "proInternalArtifact",
  "professional internal artifact": "proInternalArtifact",
  "pro internal artifact": "proInternalArtifact",
  "次アクション": "nextActions",
  "next action": "nextActions",
  "結論の自信度": "confidence",
  "confidence": "confidence",
  "Issue / 未解決論点": "issues",
  "issues": "issues",
  "次Stepへの引き継ぎ": "handoff",
  "handoff": "handoff",
  "次調査カード": "handoffCard",
  "Handoff Card": "handoffCard",
  "handoff card": "handoffCard"
};

const goldenCaseDefaultAllowedSafetyContextPatterns = [
  "禁止",
  "避ける",
  "しない",
  "行わない",
  "書かない",
  "除外",
  "非推奨",
  "扱わない",
  "断定しない",
  "根拠にしない",
  "含めない"
];

const goldenCaseWorkflowOptions = ["all", "core", "first-run", "review", "restore", "prompt", "exit-card"];
const goldenCaseDomainOptions = ["all", "medical-kampo", "ads-business", "deep-research-meta", "general", "uncategorized"];
const goldenCaseUseCaseOptions = [
  "all",
  "first-run-map",
  "case-report-search",
  "safety-check",
  "review-public-safe-conversion",
  "restore-log",
  "opinion-request",
  "codex-implementation",
  "business-review",
  "deep-research-meta-review",
  "review-exit-cards",
  "answer-ledger-conflict-resolution",
  "uncategorized"
];
const goldenCaseWorkflowLabels = {
  all: "すべて",
  core: "Core",
  "first-run": "初回",
  review: "Review",
  restore: "復元",
  prompt: "Prompt",
  "exit-card": "出口"
};
const goldenCaseDomainLabels = {
  all: "すべて",
  "medical-kampo": "医療漢方",
  "ads-business": "広告",
  "deep-research-meta": "メタ",
  general: "一般",
  uncategorized: "未分類"
};
const goldenCaseUseCaseLabels = {
  all: "すべて",
  "first-run-map": "初回全体地図",
  "case-report-search": "症例検索",
  "safety-check": "安全性確認",
  "review-public-safe-conversion": "一般向け変換",
  "restore-log": "復元",
  "opinion-request": "意見相談",
  "codex-implementation": "実装指示",
  "business-review": "実務レビュー",
  "deep-research-meta-review": "メタレビュー",
  "review-exit-cards": "Review出口",
  "answer-ledger-conflict-resolution": "矛盾解決",
  uncategorized: "未分類"
};

function normalizeGoldenCaseCategoryId(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/[_\s]+/g, "-");
  const aliases = {
    all: "all",
    "all-categories": "all",
    core: "core",
    first: "first-run",
    "first-run": "first-run",
    firstrun: "first-run",
    "firstrun": "first-run",
    review: "review",
    restore: "restore",
    prompt: "prompt",
    "exit-card": "exit-card",
    exitcard: "exit-card",
    "first-run-map": "first-run-map",
    firstrunmap: "first-run-map",
    "case-report-search": "case-report-search",
    casereportsearch: "case-report-search",
    "safety-check": "safety-check",
    safetycheck: "safety-check",
    "review-public-safe-conversion": "review-public-safe-conversion",
    publicsafeconversion: "review-public-safe-conversion",
    "restore-log": "restore-log",
    restorelog: "restore-log",
    "opinion-request": "opinion-request",
    opinionrequest: "opinion-request",
    "codex-implementation": "codex-implementation",
    codeximplementation: "codex-implementation",
    "business-review": "business-review",
    businessreview: "business-review",
    "deep-research-meta-review": "deep-research-meta-review",
    deepresearchmetareview: "deep-research-meta-review",
    "review-exit-cards": "review-exit-cards",
    reviewexitcards: "review-exit-cards",
    "answer-ledger-conflict-resolution": "answer-ledger-conflict-resolution",
    answerledgerconflictresolution: "answer-ledger-conflict-resolution",
    medical: "medical-kampo",
    kampo: "medical-kampo",
    "medical-kampo": "medical-kampo",
    medicalkampo: "medical-kampo",
    ads: "ads-business",
    ad: "ads-business",
    "ads-business": "ads-business",
    adsbusiness: "ads-business",
    business: "ads-business",
    meta: "deep-research-meta",
    "meta-research": "deep-research-meta",
    "deep-research-meta": "deep-research-meta",
    deepresearchmeta: "deep-research-meta",
    general: "general",
    uncategorized: "uncategorized"
  };
  return aliases[normalized] || normalized;
}

function getGoldenCaseWorkflowCategory(goldenCase = {}) {
  return normalizeGoldenCaseCategoryId(goldenCase.workflowCategory || inferGoldenCaseWorkflowCategory(goldenCase));
}

function getGoldenCaseDomainCategory(goldenCase = {}) {
  return normalizeGoldenCaseCategoryId(goldenCase.domainCategory || inferGoldenCaseDomainCategory(goldenCase));
}

function getGoldenCaseUseCase(goldenCase = {}) {
  return normalizeGoldenCaseCategoryId(goldenCase.useCase || inferGoldenCaseUseCase(goldenCase));
}

function formatGoldenCaseWorkflowCategory(value) {
  const normalized = normalizeGoldenCaseCategoryId(value);
  return goldenCaseWorkflowLabels[normalized] || String(value || "未分類");
}

function formatGoldenCaseDomainCategory(value) {
  const normalized = normalizeGoldenCaseCategoryId(value);
  return goldenCaseDomainLabels[normalized] || String(value || "未分類");
}

function formatGoldenCaseUseCase(value) {
  const normalized = normalizeGoldenCaseCategoryId(value);
  return goldenCaseUseCaseLabels[normalized] || String(value || "未分類");
}

function inferGoldenCaseCategory(goldenCase = {}) {
  const mode = goldenCase.mode || "";
  const id = `${goldenCase.caseId || goldenCase.id || ""} ${goldenCase.title || ""} ${goldenCase.notes || ""}`;
  if (/review/i.test(mode) || /review|レビュー|変換|間質性肺炎/i.test(id)) return "Review";
  if (/wide|one.?shot|一括|初回/i.test(id)) return "First Run";
  if (/kampo|漢方|線維筋痛|起立性|間質性肺炎/i.test(id)) return "Medical Kampo";
  return "Core";
}

function inferGoldenCaseWorkflowCategory(goldenCase = {}) {
  const legacy = String(goldenCase.category || "");
  const mode = String(goldenCase.mode || "");
  const id = `${goldenCase.caseId || goldenCase.id || ""} ${goldenCase.title || ""} ${goldenCase.notes || ""}`;
  if (/review/i.test(legacy) || /review/i.test(mode) || /review|レビュー|変換/i.test(id)) return "review";
  if (/restore|復元/i.test(legacy + id)) return "restore";
  if (/first|初回|wide|one.?shot|一括/i.test(legacy + id)) return "first-run";
  if (/prompt/i.test(legacy + id)) return "prompt";
  if (/exit/i.test(legacy + id)) return "exit-card";
  return "core";
}

function inferGoldenCaseDomainCategory(goldenCase = {}) {
  const legacy = String(goldenCase.category || "");
  const id = `${goldenCase.caseId || goldenCase.id || ""} ${goldenCase.title || ""} ${goldenCase.notes || ""} ${goldenCase.initialTopic || ""}`;
  if (/medical|kampo|漢方|線維筋痛|起立性|間質性肺炎/i.test(legacy + id)) return "medical-kampo";
  if (/ads|広告|google/i.test(legacy + id)) return "ads-business";
  if (/meta|quality|golden|research.*strategy|deep research/i.test(legacy + id)) return "deep-research-meta";
  if (!legacy && !id.trim()) return "uncategorized";
  return "general";
}

function inferGoldenCaseUseCase(goldenCase = {}) {
  const id = `${goldenCase.caseId || goldenCase.id || ""} ${goldenCase.title || ""} ${goldenCase.notes || ""}`;
  if (/case.?report|症例/i.test(id)) return "case-report-search";
  if (/safety|安全/i.test(id)) return "safety-check";
  if (/public|一般向け|safe.?conversion|安全変換/i.test(id)) return "review-public-safe-conversion";
  if (/restore|復元/i.test(id)) return "restore-log";
  if (/opinion|意見/i.test(id)) return "opinion-request";
  if (/codex|implementation|実装/i.test(id)) return "codex-implementation";
  if (/google|広告|business/i.test(id)) return "business-review";
  if (/quality|meta|品質|メタ/i.test(id)) return "deep-research-meta-review";
  if (/exit.?card|出口/i.test(id)) return "review-exit-cards";
  if (/conflict|矛盾/i.test(id)) return "answer-ledger-conflict-resolution";
  if (/first|wide|one.?shot|初回|一括/i.test(id)) return "first-run-map";
  return "uncategorized";
}

const goldenCaseFallbacks = [
  {
    id: "drp-kampo-fallback",
    caseId: "drp-kampo-fallback",
    title: "Fallback Golden Case: Deep Research設計",
    category: "Core",
    mode: "deepResearchPrompt",
    theme: "線維筋痛症の漢方",
    initialTopic: "線維筋痛症の漢方",
    steeringNotes: [],
    steeringMemos: [],
    expectedDecisionLedger: [],
    expectedAnswerLedger: [],
    expectedPromptIncludes: [],
    expectedPromptExcludes: [],
    expectedExitCards: [
      "完成プロンプト",
      "Decision Ledger",
      "Answer Ledger"
    ],
    notes: "docs/golden-cases.json の読み込みに失敗した場合の最小fallback。"
  }
];

let goldenCases = goldenCaseFallbacks.map(normalizeGoldenCaseDefinition);
const goldenCaseLoadState = {
  loaded: false,
  failed: false,
  error: "",
  source: "loading"
};

function normalizeGoldenCaseDefinition(goldenCase) {
  const id = goldenCase.id || goldenCase.caseId || "";
  const theme = goldenCase.theme || goldenCase.initialTopic || "";
  const steeringNotes = goldenCase.steeringNotes || goldenCase.steeringMemos || [];
  return {
    ...goldenCase,
    id,
    caseId: goldenCase.caseId || id,
    category: goldenCase.category || inferGoldenCaseCategory(goldenCase),
    workflowCategory: getGoldenCaseWorkflowCategory(goldenCase),
    domainCategory: getGoldenCaseDomainCategory(goldenCase),
    displayName: goldenCase.displayName || goldenCase.title || goldenCase.caseId || id,
    useCase: getGoldenCaseUseCase(goldenCase),
    useCaseLabel: goldenCase.useCaseLabel || formatGoldenCaseUseCase(getGoldenCaseUseCase(goldenCase)),
    oneLinePurpose: goldenCase.oneLinePurpose || goldenCase.notes || "",
    theme,
    initialTopic: goldenCase.initialTopic || theme,
    steeringNotes: Array.isArray(steeringNotes) ? steeringNotes : [],
    steeringMemos: Array.isArray(goldenCase.steeringMemos) ? goldenCase.steeringMemos : (Array.isArray(steeringNotes) ? steeringNotes : []),
    expectedDecisionLedger: Array.isArray(goldenCase.expectedDecisionLedger) ? goldenCase.expectedDecisionLedger : [],
    expectedAnswerLedger: Array.isArray(goldenCase.expectedAnswerLedger) ? goldenCase.expectedAnswerLedger : [],
    expectedPromptIncludes: Array.isArray(goldenCase.expectedPromptIncludes) ? goldenCase.expectedPromptIncludes : [],
    expectedPromptExcludes: Array.isArray(goldenCase.expectedPromptExcludes) ? goldenCase.expectedPromptExcludes : [],
    prohibitedRecommendationPatterns: Array.isArray(goldenCase.prohibitedRecommendationPatterns) ? goldenCase.prohibitedRecommendationPatterns : [],
    allowedSafetyContextPatterns: Array.isArray(goldenCase.allowedSafetyContextPatterns) ? goldenCase.allowedSafetyContextPatterns : [],
    expectedExitCards: Array.isArray(goldenCase.expectedExitCards) ? goldenCase.expectedExitCards : [],
    expectedOrderIncludes: Array.isArray(goldenCase.expectedOrderIncludes) ? goldenCase.expectedOrderIncludes : [],
    expectedAssumptionsIncludes: Array.isArray(goldenCase.expectedAssumptionsIncludes) ? goldenCase.expectedAssumptionsIncludes : [],
    expectedFinalQa: Array.isArray(goldenCase.expectedFinalQa) ? goldenCase.expectedFinalQa : []
  };
}
const deepResearchReviewFormDefs = {
  focus: "deepResearchReviewFocus",
  risk: "deepResearchReviewRisk",
  artifact: "deepResearchReviewArtifact"
};

const state = loadState();

const els = {
  topicEntryTitle: document.getElementById("topicEntryTitle"),
  roughTopicHint: document.getElementById("roughTopicHint"),
  roughTopicLabel: document.getElementById("roughTopicLabel"),
  roughTopic: document.getElementById("roughTopic"),
  topicPromptLabel: document.getElementById("topicPromptLabel"),
  topicPromptText: document.getElementById("topicPromptText"),
  copyTopicPromptButton: document.getElementById("copyTopicPromptButton"),
  openTopicChatGptButton: document.getElementById("openTopicChatGptButton"),
  openTopicClaudeButton: document.getElementById("openTopicClaudeButton"),
  openTopicGeminiButton: document.getElementById("openTopicGeminiButton"),
  draftTopicCardButton: document.getElementById("draftTopicCardButton"),
  topicPromptStatus: document.getElementById("topicPromptStatus"),
  deepResearchReviewInputPanel: document.getElementById("deepResearchReviewInputPanel"),
  deepResearchReviewOriginalPrompt: document.getElementById("deepResearchReviewOriginalPrompt"),
  deepResearchReviewResult: document.getElementById("deepResearchReviewResult"),
  deepResearchReviewPurpose: document.getElementById("deepResearchReviewPurpose"),
  deepResearchReviewNotes: document.getElementById("deepResearchReviewNotes"),
  researchBriefTheme: document.getElementById("researchBriefTheme"),
  researchBriefPurpose: document.getElementById("researchBriefPurpose"),
  researchBriefAudience: document.getElementById("researchBriefAudience"),
  researchBriefExternal: document.getElementById("researchBriefExternal"),
  researchBriefRaw: document.getElementById("researchBriefRaw"),
  researchBriefPrompt: document.getElementById("researchBriefPrompt"),
  researchBriefOutput: document.getElementById("researchBriefOutput"),
  researchBriefSaveRawButton: document.getElementById("researchBriefSaveRawButton"),
  researchBriefCopyPromptButton: document.getElementById("researchBriefCopyPromptButton"),
  researchBriefSaveBriefButton: document.getElementById("researchBriefSaveBriefButton"),
  researchBriefCopyBriefButton: document.getElementById("researchBriefCopyBriefButton"),
  researchBriefDownloadButton: document.getElementById("researchBriefDownloadButton"),
  researchBriefTopicCardButton: document.getElementById("researchBriefTopicCardButton"),
  researchBriefStatus: document.getElementById("researchBriefStatus"),
  applyDeepResearchReviewFormButton: document.getElementById("applyDeepResearchReviewFormButton"),
  deepResearchReviewFormStatus: document.getElementById("deepResearchReviewFormStatus"),
  deepResearchReviewImportLog: document.getElementById("deepResearchReviewImportLog"),
  applyDeepResearchReviewImportButton: document.getElementById("applyDeepResearchReviewImportButton"),
  clearDeepResearchReviewImportButton: document.getElementById("clearDeepResearchReviewImportButton"),
  deepResearchReviewImportStatus: document.getElementById("deepResearchReviewImportStatus"),
  generatedTopicCard: document.getElementById("generatedTopicCard"),
  generatedTopicCardLabel: document.getElementById("generatedTopicCardLabel"),
  applyGeneratedTopicButton: document.getElementById("applyGeneratedTopicButton"),
  generatedTopicStatus: document.getElementById("generatedTopicStatus"),
  modeSelect: document.getElementById("modeSelect"),
  modeSelectAdvanced: document.getElementById("modeSelectAdvanced"),
  deepResearchTabDescription: document.getElementById("deepResearchTabDescription"),
  modeShortcutButtons: Array.from(document.querySelectorAll("[data-mode-shortcut]")),
  deepResearchTabButtons: Array.from(document.querySelectorAll("[data-deep-research-tab]")),
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
  promptPanel: document.getElementById("promptPanel"),
  promptContextModePanel: document.getElementById("promptContextModePanel"),
  promptContextModeSelect: document.getElementById("promptContextModeSelect"),
  promptContextModeWarning: document.getElementById("promptContextModeWarning"),
  promptLengthInfo: document.getElementById("promptLengthInfo"),
  promptText: document.getElementById("promptText"),
  copyPromptButton: document.getElementById("copyPromptButton"),
  openChatGptButton: document.getElementById("openChatGptButton"),
  openClaudeButton: document.getElementById("openClaudeButton"),
  openGeminiButton: document.getElementById("openGeminiButton"),
  copyStatus: document.getElementById("copyStatus"),
  answerText: document.getElementById("answerText"),
  steeringText: document.getElementById("steeringText"),
  saveAnswerButton: document.getElementById("saveAnswerButton"),
  answerStatus: document.getElementById("answerStatus"),
  deepResearchLedgerPanel: document.getElementById("deepResearchLedgerPanel"),
  deepResearchLedgerSummary: document.getElementById("deepResearchLedgerSummary"),
  copyCurrentDecisionLedgerButton: document.getElementById("copyCurrentDecisionLedgerButton"),
  copyCurrentAnswerLedgerButton: document.getElementById("copyCurrentAnswerLedgerButton"),
  deepResearchLedgerStatus: document.getElementById("deepResearchLedgerStatus"),
  currentDecisionLedgerText: document.getElementById("currentDecisionLedgerText"),
  currentAnswerLedgerText: document.getElementById("currentAnswerLedgerText"),
  logPreview: document.getElementById("logPreview"),
  deepResearchReviewCompletePanel: document.getElementById("deepResearchReviewCompletePanel"),
  copyDeepResearchReviewFullButton: document.getElementById("copyDeepResearchReviewFullButton"),
  copyDeepResearchReviewDecisionButton: document.getElementById("copyDeepResearchReviewDecisionButton"),
  copyDeepResearchReviewConditionsButton: document.getElementById("copyDeepResearchReviewConditionsButton"),
  copyDeepResearchReviewUsableButton: document.getElementById("copyDeepResearchReviewUsableButton"),
  copyDeepResearchReviewFixesButton: document.getElementById("copyDeepResearchReviewFixesButton"),
  copyDeepResearchReviewDangerousButton: document.getElementById("copyDeepResearchReviewDangerousButton"),
  copyDeepResearchReviewSourceButton: document.getElementById("copyDeepResearchReviewSourceButton"),
  copyDeepResearchReviewClaimEvidenceButton: document.getElementById("copyDeepResearchReviewClaimEvidenceButton"),
  copyDeepResearchReviewGapsButton: document.getElementById("copyDeepResearchReviewGapsButton"),
  copyDeepResearchReviewPracticalityButton: document.getElementById("copyDeepResearchReviewPracticalityButton"),
  copyDeepResearchReviewArtifactButton: document.getElementById("copyDeepResearchReviewArtifactButton"),
  copyDeepResearchReviewResearchBriefButton: document.getElementById("copyDeepResearchReviewResearchBriefButton"),
  copyDeepResearchReviewOpinionRequestButton: document.getElementById("copyDeepResearchReviewOpinionRequestButton"),
  copyDeepResearchReviewPublicSafeButton: document.getElementById("copyDeepResearchReviewPublicSafeButton"),
  copyDeepResearchReviewPharmacySafetyButton: document.getElementById("copyDeepResearchReviewPharmacySafetyButton"),
  copyDeepResearchReviewProInternalButton: document.getElementById("copyDeepResearchReviewProInternalButton"),
  copyDeepResearchReviewPracticalButton: document.getElementById("copyDeepResearchReviewPracticalButton"),
  copyDeepResearchReviewAdditionalPromptButton: document.getElementById("copyDeepResearchReviewAdditionalPromptButton"),
  copyDeepResearchReviewIssuesButton: document.getElementById("copyDeepResearchReviewIssuesButton"),
  copyDeepResearchReviewNextActionsButton: document.getElementById("copyDeepResearchReviewNextActionsButton"),
  copyDeepResearchReviewConfidenceButton: document.getElementById("copyDeepResearchReviewConfidenceButton"),
  copyDeepResearchReviewHandoffButton: document.getElementById("copyDeepResearchReviewHandoffButton"),
  copyDeepResearchReviewHandoffCardButton: document.getElementById("copyDeepResearchReviewHandoffCardButton"),
  startDeepResearchPromptFromReviewHandoffButton: document.getElementById("startDeepResearchPromptFromReviewHandoffButton"),
  startNewDeepResearchReviewButton: document.getElementById("startNewDeepResearchReviewButton"),
  deepResearchReviewCompleteStatus: document.getElementById("deepResearchReviewCompleteStatus"),
  deepResearchReviewAdoptionText: document.getElementById("deepResearchReviewAdoptionText"),
  deepResearchReviewAdoptionConditionsText: document.getElementById("deepResearchReviewAdoptionConditionsText"),
  deepResearchReviewUsableText: document.getElementById("deepResearchReviewUsableText"),
  deepResearchReviewFixesText: document.getElementById("deepResearchReviewFixesText"),
  deepResearchReviewDangerousText: document.getElementById("deepResearchReviewDangerousText"),
  deepResearchReviewSourceText: document.getElementById("deepResearchReviewSourceText"),
  deepResearchReviewClaimEvidenceText: document.getElementById("deepResearchReviewClaimEvidenceText"),
  deepResearchReviewGapsText: document.getElementById("deepResearchReviewGapsText"),
  deepResearchReviewPracticalityText: document.getElementById("deepResearchReviewPracticalityText"),
  deepResearchReviewArtifactText: document.getElementById("deepResearchReviewArtifactText"),
  deepResearchReviewResearchBriefCard: document.getElementById("deepResearchReviewResearchBriefCard"),
  deepResearchReviewResearchBriefText: document.getElementById("deepResearchReviewResearchBriefText"),
  deepResearchReviewOpinionRequestText: document.getElementById("deepResearchReviewOpinionRequestText"),
  deepResearchReviewPublicSafeText: document.getElementById("deepResearchReviewPublicSafeText"),
  deepResearchReviewPharmacySafetyText: document.getElementById("deepResearchReviewPharmacySafetyText"),
  deepResearchReviewProInternalText: document.getElementById("deepResearchReviewProInternalText"),
  deepResearchReviewAdditionalPromptText: document.getElementById("deepResearchReviewAdditionalPromptText"),
  deepResearchReviewIssuesText: document.getElementById("deepResearchReviewIssuesText"),
  deepResearchReviewNextActionsText: document.getElementById("deepResearchReviewNextActionsText"),
  deepResearchReviewConfidenceText: document.getElementById("deepResearchReviewConfidenceText"),
  deepResearchReviewHandoffText: document.getElementById("deepResearchReviewHandoffText"),
  deepResearchReviewHandoffCardText: document.getElementById("deepResearchReviewHandoffCardText"),
  deepResearchCopyPanel: document.getElementById("deepResearchCopyPanel"),
  deepResearchCopyRecommendation: document.getElementById("deepResearchCopyRecommendation"),
  copyDeepResearchPromptButton: document.getElementById("copyDeepResearchPromptButton"),
  copyDeepResearchLightweightButton: document.getElementById("copyDeepResearchLightweightButton"),
  copyDeepResearchOpinionRequestButton: document.getElementById("copyDeepResearchOpinionRequestButton"),
  copyDeepResearchOneShotButton: document.getElementById("copyDeepResearchOneShotButton"),
  copyDeepResearchSplitButton: document.getElementById("copyDeepResearchSplitButton"),
  copyDeepResearchOrderButton: document.getElementById("copyDeepResearchOrderButton"),
  copyDeepResearchAdditionalButton: document.getElementById("copyDeepResearchAdditionalButton"),
  copyDeepResearchQuestionsButton: document.getElementById("copyDeepResearchQuestionsButton"),
  copyDeepResearchAssumptionsButton: document.getElementById("copyDeepResearchAssumptionsButton"),
  copyDeepResearchDecisionLedgerButton: document.getElementById("copyDeepResearchDecisionLedgerButton"),
  copyDeepResearchAnswerLedgerButton: document.getElementById("copyDeepResearchAnswerLedgerButton"),
  deepResearchCopyStatus: document.getElementById("deepResearchCopyStatus"),
  deepResearchCompletePromptText: document.getElementById("deepResearchCompletePromptText"),
  deepResearchLightweightText: document.getElementById("deepResearchLightweightText"),
  deepResearchOpinionRequestText: document.getElementById("deepResearchOpinionRequestText"),
  deepResearchOneShotText: document.getElementById("deepResearchOneShotText"),
  deepResearchSplitText: document.getElementById("deepResearchSplitText"),
  deepResearchOrderText: document.getElementById("deepResearchOrderText"),
  deepResearchAdditionalText: document.getElementById("deepResearchAdditionalText"),
  deepResearchQuestionsText: document.getElementById("deepResearchQuestionsText"),
  deepResearchAssumptionsText: document.getElementById("deepResearchAssumptionsText"),
  deepResearchDecisionLedgerText: document.getElementById("deepResearchDecisionLedgerText"),
  deepResearchAnswerLedgerText: document.getElementById("deepResearchAnswerLedgerText"),
  deepResearchKampoExitDetails: document.getElementById("deepResearchKampoExitDetails"),
  copyDeepResearchKampoBaselineButton: document.getElementById("copyDeepResearchKampoBaselineButton"),
  copyDeepResearchKampoPatternButton: document.getElementById("copyDeepResearchKampoPatternButton"),
  copyDeepResearchKampoFormulaButton: document.getElementById("copyDeepResearchKampoFormulaButton"),
  copyDeepResearchKampoSafetyButton: document.getElementById("copyDeepResearchKampoSafetyButton"),
  copyDeepResearchKampoPublicButton: document.getElementById("copyDeepResearchKampoPublicButton"),
  copyDeepResearchKampoProfessionalButton: document.getElementById("copyDeepResearchKampoProfessionalButton"),
  deepResearchKampoBaselineText: document.getElementById("deepResearchKampoBaselineText"),
  deepResearchKampoPatternText: document.getElementById("deepResearchKampoPatternText"),
  deepResearchKampoFormulaText: document.getElementById("deepResearchKampoFormulaText"),
  deepResearchKampoSafetyText: document.getElementById("deepResearchKampoSafetyText"),
  deepResearchKampoPublicText: document.getElementById("deepResearchKampoPublicText"),
  deepResearchKampoProfessionalText: document.getElementById("deepResearchKampoProfessionalText"),
  goldenCasePanel: document.getElementById("goldenCasePanel"),
  goldenCaseLoadInfo: document.getElementById("goldenCaseLoadInfo"),
  goldenCaseCategorySelect: document.getElementById("goldenCaseCategorySelect"),
  goldenCaseDomainSelect: document.getElementById("goldenCaseDomainSelect"),
  goldenCaseUseCaseSelect: document.getElementById("goldenCaseUseCaseSelect"),
  goldenCaseSummary: document.getElementById("goldenCaseSummary"),
  goldenCaseList: document.getElementById("goldenCaseList"),
  goldenCaseSelect: document.getElementById("goldenCaseSelect"),
  reloadGoldenCasesButton: document.getElementById("reloadGoldenCasesButton"),
  loadGoldenCaseTopicButton: document.getElementById("loadGoldenCaseTopicButton"),
  copyGoldenCaseSteeringButton: document.getElementById("copyGoldenCaseSteeringButton"),
  refreshGoldenCaseButton: document.getElementById("refreshGoldenCaseButton"),
  copyGoldenCaseEvaluationButton: document.getElementById("copyGoldenCaseEvaluationButton"),
  goldenCaseStatus: document.getElementById("goldenCaseStatus"),
  goldenCaseExpectedText: document.getElementById("goldenCaseExpectedText"),
  goldenCaseActualLedgerText: document.getElementById("goldenCaseActualLedgerText"),
  goldenCaseActualExitCardsText: document.getElementById("goldenCaseActualExitCardsText"),
  goldenCaseFinalQaText: document.getElementById("goldenCaseFinalQaText"),
  goldenCaseCheckText: document.getElementById("goldenCaseCheckText"),
  markdownPanel: document.getElementById("markdownPanel"),
  markdownText: document.getElementById("markdownText"),
  copyMarkdownButton: document.getElementById("copyMarkdownButton"),
  shareMarkdownButton: document.getElementById("shareMarkdownButton"),
  downloadMarkdownButton: document.getElementById("downloadMarkdownButton"),
  markdownStatus: document.getElementById("markdownStatus"),
  setupToggleButton: document.getElementById("setupToggleButton"),
  setupPanel: document.getElementById("setupPanel"),
  setupDoneCheckbox: document.getElementById("setupDoneCheckbox"),
  resetButton: document.getElementById("resetButton"),
  appCacheVersion: document.getElementById("appCacheVersion"),
  preparationBody: document.querySelector(".step-zero"),
  preparationPanel: document.querySelector(".step-zero") ? document.querySelector(".step-zero").closest(".panel") : null,
  stepActions: document.querySelector(".step-actions"),
  deepResearchReviewCompleteGrid: document.querySelector(".review-complete-grid")
};

const deepResearchTabMeta = {
  prompt: {
    label: "作成",
    fullLabel: "Deep Researchプロンプト作成",
    description: "Deep Researchプロンプト作成: 初回は広く深く、2回目以降は軽量版を自動推奨します。"
  },
  review: {
    label: "レビュー",
    fullLabel: "Deep Research結果レビュー",
    description: "Deep Research結果レビュー: 出力を貼って、採用可否・根拠・抜け漏れ・次調査を確認します。"
  },
  restore: {
    label: "復元",
    fullLabel: "保存済みログから出口カードを復元",
    description: "保存済みログから出口カードを復元: 保存したFinal JudgeログやAI会議ログから出口カードを再表示します。"
  },
  golden: {
    label: "Cases",
    fullLabel: "Golden Case Runner",
    description: "Golden Case Runner: カテゴリ別にGolden Caseを確認します。"
  }
};

function initializeDeepResearchTabUi() {
  els.deepResearchTabButtons.forEach((button) => {
    const meta = deepResearchTabMeta[button.dataset.deepResearchTab];
    if (!meta) return;
    button.textContent = meta.label;
    button.title = meta.fullLabel;
    button.setAttribute("aria-label", meta.fullLabel);
  });

  if (!els.deepResearchTabDescription && els.deepResearchTabButtons.length) {
    const description = document.createElement("p");
    description.id = "deepResearchTabDescription";
    description.className = "hint deep-research-tab-description";
    const shortcuts = els.deepResearchTabButtons[0].closest(".deep-research-shortcuts");
    if (shortcuts) shortcuts.insertAdjacentElement("afterend", description);
    els.deepResearchTabDescription = description;
  }

  if (!els.modeSelectAdvanced && els.modeSelect) {
    const label = document.querySelector("label[for=\"modeSelect\"]");
    const hint = els.modeSelect.nextElementSibling && els.modeSelect.nextElementSibling.classList.contains("hint")
      ? els.modeSelect.nextElementSibling
      : null;
    const details = document.createElement("details");
    details.id = "modeSelectAdvanced";
    details.className = "mode-select-advanced";
    const summary = document.createElement("summary");
    summary.textContent = "その他の会議モード";
    details.appendChild(summary);
    if (label && label.parentElement) {
      label.parentElement.insertBefore(details, label);
      details.appendChild(label);
    } else {
      els.modeSelect.parentElement.insertBefore(details, els.modeSelect);
    }
    details.appendChild(els.modeSelect);
    if (hint) {
      hint.textContent = "通常のbasic / decision / reviewを使う場合だけ開いて選びます。Deep Research系は上のタブで切り替えます。";
      details.appendChild(hint);
    }
    els.modeSelectAdvanced = details;
  }
}

function initializeGoldenCaseFilterUi() {
  if (!els.goldenCaseCategorySelect) return;
  const controls = els.goldenCaseCategorySelect.closest(".golden-case-controls");
  const workflowLabel = document.querySelector("label[for=\"goldenCaseCategorySelect\"]");
  if (workflowLabel) workflowLabel.textContent = "工程";
  els.goldenCaseCategorySelect.setAttribute("aria-label", "Golden Case workflow category");
  if (controls && workflowLabel && workflowLabel.parentElement === controls) {
    const field = document.createElement("div");
    field.className = "golden-case-filter-field";
    controls.insertBefore(field, workflowLabel);
    field.appendChild(workflowLabel);
    field.appendChild(els.goldenCaseCategorySelect);
  }

  if (!els.goldenCaseDomainSelect && controls) {
    const field = document.createElement("div");
    field.className = "golden-case-filter-field";
    const domainLabel = document.createElement("label");
    domainLabel.htmlFor = "goldenCaseDomainSelect";
    domainLabel.textContent = "分野";
    const domainSelect = document.createElement("select");
    domainSelect.id = "goldenCaseDomainSelect";
    domainSelect.setAttribute("aria-label", "Golden Case domain category");
    field.appendChild(domainLabel);
    field.appendChild(domainSelect);
    controls.appendChild(field);
    els.goldenCaseDomainSelect = domainSelect;
  }

  if (!els.goldenCaseUseCaseSelect && controls) {
    const field = document.createElement("div");
    field.className = "golden-case-filter-field";
    const useCaseLabel = document.createElement("label");
    useCaseLabel.htmlFor = "goldenCaseUseCaseSelect";
    useCaseLabel.textContent = "用途";
    const useCaseSelect = document.createElement("select");
    useCaseSelect.id = "goldenCaseUseCaseSelect";
    useCaseSelect.setAttribute("aria-label", "Golden Case use case");
    field.appendChild(useCaseLabel);
    field.appendChild(useCaseSelect);
    controls.appendChild(field);
    els.goldenCaseUseCaseSelect = useCaseSelect;
  }

  if (!els.goldenCaseSummary && els.goldenCaseSelect) {
    const summary = document.createElement("div");
    summary.id = "goldenCaseSummary";
    summary.className = "golden-case-summary";
    els.goldenCaseSelect.insertAdjacentElement("afterend", summary);
    els.goldenCaseSummary = summary;
  }

  if (!els.goldenCaseList && els.goldenCaseSummary) {
    const list = document.createElement("div");
    list.id = "goldenCaseList";
    list.className = "golden-case-list";
    list.setAttribute("aria-label", "Golden Case list");
    els.goldenCaseSummary.insertAdjacentElement("afterend", list);
    els.goldenCaseList = list;
  }
}

function updateDeepResearchReviewImportCopy() {
  const card = document.querySelector(".review-import-card");
  if (!card) return;
  const summary = card.querySelector("summary");
  const hint = card.querySelector(".hint");
  const label = card.querySelector("label[for=\"deepResearchReviewImportLog\"]");
  if (summary) summary.textContent = "保存済みログから出口カードを復元";
  if (hint) {
    hint.textContent = "外部保存したAI会議ログ、またはStep 8 Final Judge回答を貼ると、Research Brief・改訂版成果物・一般向け安全変換版・次調査カードなどを再表示します。現在の会議ログやStep回答は上書きしません。";
  }
  if (label) label.textContent = "保存済みAI会議ログ / Final Judge回答";
  if (els.deepResearchReviewImportLog) {
    els.deepResearchReviewImportLog.placeholder = "AI会議ログ全体、または Step 8 Final Judge の回答を貼ります。DR_REVIEW_* マーカー付きログを推奨します。";
  }
  if (els.applyDeepResearchReviewImportButton) els.applyDeepResearchReviewImportButton.textContent = "出口カードを復元";
  if (els.clearDeepResearchReviewImportButton) els.clearDeepResearchReviewImportButton.textContent = "復元表示をクリア";
}

function init() {
  if (els.appCacheVersion) {
    els.appCacheVersion.textContent = APP_VERSION_LABEL;
    els.appCacheVersion.title = `App cache: ${APP_CACHE_NAME}`;
    els.appCacheVersion.setAttribute("aria-label", `App cache: ${APP_CACHE_NAME}`);
  }
  initializeDeepResearchTabUi();
  initializeGoldenCaseFilterUi();
  els.topicCard.value = state.topicCard;
  els.modeSelect.value = state.mode;
  els.setupDoneCheckbox.checked = state.setupDone;
  fillQuickFields(state.quickFields);
  fillDeepResearchReviewForm(state.deepResearchReviewForm);
  updateResearchBriefPromptPreview();
  void loadResearchBriefDraft();
  updateDeepResearchReviewImportCopy();
  if (els.deepResearchReviewImportLog) els.deepResearchReviewImportLog.value = state.deepResearchReviewImportLog || "";
  if (els.promptContextModeSelect) els.promptContextModeSelect.value = state.promptContextMode || "full";
  els.topicPromptText.value = generateTopicCardPrompt(els.roughTopic.value, state.mode);
  populateGoldenCaseSelect();
  void loadGoldenCases();
  bindEvents();
  setupExternalLinkDiagnostics();
  setupWorkflowLayoutControls();
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
  els.draftTopicCardButton.addEventListener("click", draftTopicCardFromRoughTopic);
  [els.deepResearchReviewOriginalPrompt, els.deepResearchReviewResult, els.deepResearchReviewPurpose, els.deepResearchReviewNotes]
    .forEach((el) => {
      if (el) el.addEventListener("input", saveDeepResearchReviewForm);
    });
  Object.values(deepResearchReviewFormDefs).forEach((name) => {
    document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
      input.addEventListener("change", saveDeepResearchReviewForm);
    });
  });
  if (els.applyDeepResearchReviewFormButton) {
    els.applyDeepResearchReviewFormButton.addEventListener("click", applyDeepResearchReviewFormCard);
  }
  [
    els.researchBriefTheme,
    els.researchBriefPurpose,
    els.researchBriefAudience,
    els.researchBriefExternal,
    els.researchBriefRaw,
    els.researchBriefOutput
  ].forEach((el) => {
    if (el) el.addEventListener("input", updateResearchBriefPromptPreview);
    if (el && el.tagName === "SELECT") el.addEventListener("change", updateResearchBriefPromptPreview);
  });
  if (els.researchBriefSaveRawButton) {
    els.researchBriefSaveRawButton.addEventListener("click", saveResearchBriefRaw);
  }
  if (els.researchBriefCopyPromptButton) {
    els.researchBriefCopyPromptButton.addEventListener("click", copyResearchBriefPrompt);
  }
  if (els.researchBriefSaveBriefButton) {
    els.researchBriefSaveBriefButton.addEventListener("click", saveResearchBriefOutput);
  }
  if (els.researchBriefCopyBriefButton) {
    els.researchBriefCopyBriefButton.addEventListener("click", copyResearchBriefMarkdown);
  }
  if (els.researchBriefDownloadButton) {
    els.researchBriefDownloadButton.addEventListener("click", downloadResearchBriefMarkdown);
  }
  if (els.researchBriefTopicCardButton) {
    els.researchBriefTopicCardButton.addEventListener("click", applyResearchBriefTopicCard);
  }
  if (els.deepResearchReviewImportLog) {
    els.deepResearchReviewImportLog.addEventListener("input", saveDeepResearchReviewImportLog);
  }
  if (els.applyDeepResearchReviewImportButton) {
    els.applyDeepResearchReviewImportButton.addEventListener("click", applyDeepResearchReviewImportedLog);
  }
  if (els.clearDeepResearchReviewImportButton) {
    els.clearDeepResearchReviewImportButton.addEventListener("click", clearDeepResearchReviewImportedLog);
  }
  els.applyGeneratedTopicButton.addEventListener("click", applyGeneratedTopicCard);
  els.modeSelect.addEventListener("change", changeMode);
  els.modeShortcutButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.modeShortcut;
      if (!modeSteps[mode]) return;
      els.modeSelect.value = mode;
      changeMode();
    });
  });
  els.deepResearchTabButtons.forEach((button) => {
    button.addEventListener("click", () => handleDeepResearchTabClick(button.dataset.deepResearchTab));
  });
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
  els.topicCard.addEventListener("paste", handleTopicCardPaste);
  els.backStepButton.addEventListener("click", goBackStep);
  els.retryStepButton.addEventListener("click", retryCurrentStep);
  if (els.promptContextModeSelect) {
    els.promptContextModeSelect.addEventListener("change", changePromptContextMode);
  }
  els.copyPromptButton.addEventListener("click", () => copyText(els.promptText.value, els.promptText, els.copyStatus));
  els.openChatGptButton.addEventListener("click", () => copyAndOpen("chatgpt"));
  els.openClaudeButton.addEventListener("click", () => copyAndOpen("claude"));
  els.openGeminiButton.addEventListener("click", () => copyAndOpen("gemini"));
  els.steeringText.addEventListener("input", saveCurrentSteeringNote);
  els.saveAnswerButton.addEventListener("click", saveAnswerAndNext);
  els.copyDeepResearchPromptButton.addEventListener("click", copyDeepResearchPrompt);
  if (els.copyDeepResearchReviewFullButton) {
    els.copyDeepResearchReviewFullButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("full"));
  }
  if (els.copyCurrentDecisionLedgerButton) {
    els.copyCurrentDecisionLedgerButton.addEventListener("click", () => copyCurrentDeepResearchLedger("decision"));
  }
  if (els.copyCurrentAnswerLedgerButton) {
    els.copyCurrentAnswerLedgerButton.addEventListener("click", () => copyCurrentDeepResearchLedger("answer"));
  }
  if (els.copyDeepResearchReviewDecisionButton) {
    els.copyDeepResearchReviewDecisionButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("adoption"));
  }
  if (els.copyDeepResearchReviewConditionsButton) {
    els.copyDeepResearchReviewConditionsButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("adoptionConditions"));
  }
  if (els.copyDeepResearchReviewUsableButton) {
    els.copyDeepResearchReviewUsableButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("usable"));
  }
  if (els.copyDeepResearchReviewFixesButton) {
    els.copyDeepResearchReviewFixesButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("fixes"));
  }
  if (els.copyDeepResearchReviewDangerousButton) {
    els.copyDeepResearchReviewDangerousButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("dangerous"));
  }
  if (els.copyDeepResearchReviewSourceButton) {
    els.copyDeepResearchReviewSourceButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("sourceReview"));
  }
  if (els.copyDeepResearchReviewClaimEvidenceButton) {
    els.copyDeepResearchReviewClaimEvidenceButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("claimEvidence"));
  }
  if (els.copyDeepResearchReviewGapsButton) {
    els.copyDeepResearchReviewGapsButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("gaps"));
  }
  if (els.copyDeepResearchReviewPracticalityButton) {
    els.copyDeepResearchReviewPracticalityButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("practicality"));
  }
  if (els.copyDeepResearchReviewArtifactButton) {
    els.copyDeepResearchReviewArtifactButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("artifact"));
  }
  if (els.copyDeepResearchReviewResearchBriefButton) {
    els.copyDeepResearchReviewResearchBriefButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("researchBrief"));
  }
  if (els.copyDeepResearchReviewOpinionRequestButton) {
    els.copyDeepResearchReviewOpinionRequestButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("opinionRequest"));
  }
  if (els.copyDeepResearchReviewPublicSafeButton) {
    els.copyDeepResearchReviewPublicSafeButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("publicSafeArtifact"));
  }
  if (els.copyDeepResearchReviewPharmacySafetyButton) {
    els.copyDeepResearchReviewPharmacySafetyButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("pharmacySafetyArtifact"));
  }
  if (els.copyDeepResearchReviewProInternalButton) {
    els.copyDeepResearchReviewProInternalButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("proInternalArtifact"));
  }
  if (els.copyDeepResearchReviewPracticalButton) {
    els.copyDeepResearchReviewPracticalButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("practical"));
  }
  if (els.copyDeepResearchReviewAdditionalPromptButton) {
    els.copyDeepResearchReviewAdditionalPromptButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("additionalPrompt"));
  }
  if (els.copyDeepResearchReviewIssuesButton) {
    els.copyDeepResearchReviewIssuesButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("issues"));
  }
  if (els.copyDeepResearchReviewNextActionsButton) {
    els.copyDeepResearchReviewNextActionsButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("nextActions"));
  }
  if (els.copyDeepResearchReviewConfidenceButton) {
    els.copyDeepResearchReviewConfidenceButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("confidence"));
  }
  if (els.copyDeepResearchReviewHandoffButton) {
    els.copyDeepResearchReviewHandoffButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("handoff"));
  }
  if (els.copyDeepResearchReviewHandoffCardButton) {
    els.copyDeepResearchReviewHandoffCardButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("handoffCard"));
  }
  if (els.startDeepResearchPromptFromReviewHandoffButton) {
    els.startDeepResearchPromptFromReviewHandoffButton.addEventListener("click", startDeepResearchPromptFromReviewHandoff);
  }
  if (els.startNewDeepResearchReviewButton) {
    els.startNewDeepResearchReviewButton.addEventListener("click", startNewDeepResearchReview);
  }
  if (els.copyDeepResearchOneShotButton) {
    els.copyDeepResearchOneShotButton.addEventListener("click", () => copyDeepResearchPromptCompletePart("oneShot"));
  }
  if (els.copyDeepResearchLightweightButton) {
    els.copyDeepResearchLightweightButton.addEventListener("click", () => copyDeepResearchPromptCompletePart("lightweight"));
  }
  if (els.copyDeepResearchOpinionRequestButton) {
    els.copyDeepResearchOpinionRequestButton.addEventListener("click", () => copyDeepResearchPromptCompletePart("opinionRequest"));
  }
  if (els.copyDeepResearchSplitButton) {
    els.copyDeepResearchSplitButton.addEventListener("click", () => copyDeepResearchPromptCompletePart("split"));
  }
  if (els.copyDeepResearchOrderButton) {
    els.copyDeepResearchOrderButton.addEventListener("click", () => copyDeepResearchPromptCompletePart("order"));
  }
  if (els.copyDeepResearchAdditionalButton) {
    els.copyDeepResearchAdditionalButton.addEventListener("click", () => copyDeepResearchPromptCompletePart("additional"));
  }
  if (els.copyDeepResearchQuestionsButton) {
    els.copyDeepResearchQuestionsButton.addEventListener("click", () => copyDeepResearchPromptCompletePart("questions"));
  }
  if (els.copyDeepResearchAssumptionsButton) {
    els.copyDeepResearchAssumptionsButton.addEventListener("click", () => copyDeepResearchPromptCompletePart("assumptions"));
  }
  if (els.copyDeepResearchDecisionLedgerButton) {
    els.copyDeepResearchDecisionLedgerButton.addEventListener("click", () => copyDeepResearchPromptCompletePart("decisionLedger"));
  }
  if (els.copyDeepResearchAnswerLedgerButton) {
    els.copyDeepResearchAnswerLedgerButton.addEventListener("click", () => copyDeepResearchPromptCompletePart("answerLedger"));
  }
  if (els.copyDeepResearchKampoBaselineButton) {
    els.copyDeepResearchKampoBaselineButton.addEventListener("click", () => copyDeepResearchPromptCompletePart("kampoBaseline"));
  }
  if (els.copyDeepResearchKampoPatternButton) {
    els.copyDeepResearchKampoPatternButton.addEventListener("click", () => copyDeepResearchPromptCompletePart("kampoPattern"));
  }
  if (els.copyDeepResearchKampoFormulaButton) {
    els.copyDeepResearchKampoFormulaButton.addEventListener("click", () => copyDeepResearchPromptCompletePart("kampoFormula"));
  }
  if (els.copyDeepResearchKampoSafetyButton) {
    els.copyDeepResearchKampoSafetyButton.addEventListener("click", () => copyDeepResearchPromptCompletePart("kampoSafety"));
  }
  if (els.copyDeepResearchKampoPublicButton) {
    els.copyDeepResearchKampoPublicButton.addEventListener("click", () => copyDeepResearchPromptCompletePart("kampoPublic"));
  }
  if (els.copyDeepResearchKampoProfessionalButton) {
    els.copyDeepResearchKampoProfessionalButton.addEventListener("click", () => copyDeepResearchPromptCompletePart("kampoProfessional"));
  }
  if (els.goldenCaseSelect) {
    els.goldenCaseSelect.addEventListener("change", renderGoldenCasePanel);
  }
  if (els.goldenCaseCategorySelect) {
    els.goldenCaseCategorySelect.addEventListener("change", () => {
      populateGoldenCaseSelect();
      renderGoldenCasePanel();
    });
  }
  if (els.goldenCaseDomainSelect) {
    els.goldenCaseDomainSelect.addEventListener("change", () => {
      populateGoldenCaseSelect();
      renderGoldenCasePanel();
    });
  }
  if (els.goldenCaseUseCaseSelect) {
    els.goldenCaseUseCaseSelect.addEventListener("change", () => {
      populateGoldenCaseSelect();
      renderGoldenCasePanel();
    });
  }
  if (els.reloadGoldenCasesButton) {
    els.reloadGoldenCasesButton.addEventListener("click", reloadGoldenCases);
  }
  if (els.loadGoldenCaseTopicButton) {
    els.loadGoldenCaseTopicButton.addEventListener("click", loadSelectedGoldenCaseTopic);
  }
  if (els.copyGoldenCaseSteeringButton) {
    els.copyGoldenCaseSteeringButton.addEventListener("click", copySelectedGoldenCaseSteering);
  }
  if (els.refreshGoldenCaseButton) {
    els.refreshGoldenCaseButton.addEventListener("click", () => {
      renderGoldenCasePanel();
      setStatus(els.goldenCaseStatus, "現在の会議出力からActualを更新しました。");
    });
  }
  if (els.copyGoldenCaseEvaluationButton) {
    els.copyGoldenCaseEvaluationButton.addEventListener("click", copyGoldenCaseEvaluation);
  }
  els.copyMarkdownButton.addEventListener("click", () => copyText(els.markdownText.value, els.markdownText, els.markdownStatus));
  els.shareMarkdownButton.addEventListener("click", shareMarkdown);
  els.downloadMarkdownButton.addEventListener("click", downloadMarkdown);
  if (els.setupToggleButton) {
    els.setupToggleButton.addEventListener("click", toggleSetupPanel);
  }
  if (els.appCacheVersion) {
    els.appCacheVersion.addEventListener("click", showAppCacheVersionDetail);
  }
  els.setupDoneCheckbox.addEventListener("change", changeSetupDone);
  els.resetButton.addEventListener("click", resetMeeting);
}

function setupWorkflowLayoutControls() {
  if (els.preparationPanel && els.preparationBody && !els.togglePreparationButton) {
    els.preparationPanel.classList.add("preparation-panel");
    const title = els.preparationPanel.querySelector("h2");
    const titleRow = document.createElement("div");
    titleRow.className = "panel-title-row";
    if (title) {
      els.preparationPanel.insertBefore(titleRow, title);
      titleRow.appendChild(title);
    } else {
      els.preparationPanel.insertBefore(titleRow, els.preparationPanel.firstChild);
    }
    const toggleButton = document.createElement("button");
    toggleButton.id = "togglePreparationButton";
    toggleButton.className = "panel-toggle-button";
    toggleButton.type = "button";
    toggleButton.addEventListener("click", togglePreparationCollapsed);
    titleRow.appendChild(toggleButton);
    els.togglePreparationButton = toggleButton;
  }

  if (els.stepActions && !els.jumpToReviewResultsButton) {
    const jumpButton = document.createElement("button");
    jumpButton.id = "jumpToReviewResultsButton";
    jumpButton.className = "result-jump-button primary";
    jumpButton.type = "button";
    jumpButton.textContent = "レビュー完了画面へ移動";
    jumpButton.hidden = true;
    jumpButton.addEventListener("click", () => scrollToElement(els.deepResearchReviewCompletePanel));
    els.stepActions.appendChild(jumpButton);
    els.jumpToReviewResultsButton = jumpButton;
  }

  if (els.deepResearchReviewCompletePanel && !els.toggleReviewResultsButton) {
    const buttonGrid = els.deepResearchReviewCompletePanel.querySelector(".button-grid");
    if (buttonGrid) {
      const toggleButton = document.createElement("button");
      toggleButton.id = "toggleReviewResultsButton";
      toggleButton.className = "panel-toggle-button";
      toggleButton.type = "button";
      toggleButton.addEventListener("click", toggleReviewResultsCollapsed);
      buttonGrid.appendChild(toggleButton);
      els.toggleReviewResultsButton = toggleButton;
    }
  }
}

function togglePreparationCollapsed() {
  state.preparationCollapsed = !state.preparationCollapsed;
  persist(state.preparationCollapsed ? "準備セクションを閉じました" : "準備セクションを開きました");
  render();
}

function toggleReviewResultsCollapsed() {
  state.reviewResultsCollapsed = !state.reviewResultsCollapsed;
  persist(state.reviewResultsCollapsed ? "成果物詳細を閉じました" : "成果物詳細を開きました");
  render();
}

function collapsePreparationAfterTopicApplied() {
  state.preparationCollapsed = true;
}

function renderWorkflowLayout(complete) {
  if (els.preparationBody) {
    const collapsed = Boolean(state.preparationCollapsed);
    els.preparationBody.hidden = collapsed;
    if (els.preparationPanel) els.preparationPanel.classList.toggle("is-collapsed", collapsed);
    if (els.togglePreparationButton) {
      els.togglePreparationButton.textContent = collapsed ? "準備を開く" : "準備を閉じる";
      els.togglePreparationButton.setAttribute("aria-expanded", String(!collapsed));
    }
  }

  const hasImportedFinal = Boolean(String(state.deepResearchReviewImportedFinalAnswer || "").trim());
  const hasReviewResults = state.mode === "deepResearchReview" && (complete || hasImportedFinal);
  if (els.jumpToReviewResultsButton) {
    els.jumpToReviewResultsButton.hidden = !hasReviewResults;
  }
  if (els.deepResearchReviewCompleteGrid) {
    els.deepResearchReviewCompleteGrid.hidden = hasReviewResults && Boolean(state.reviewResultsCollapsed);
  }
  if (els.toggleReviewResultsButton) {
    els.toggleReviewResultsButton.hidden = !hasReviewResults;
    els.toggleReviewResultsButton.textContent = state.reviewResultsCollapsed ? "成果物詳細を開く" : "成果物詳細を閉じる";
    els.toggleReviewResultsButton.setAttribute("aria-expanded", String(!state.reviewResultsCollapsed));
  }
}

function updateTopicPrompt() {
  els.topicPromptText.value = generateTopicCardPrompt(els.roughTopic.value, state.mode);
}

function generateTopicCardPrompt(roughTopic, mode = state.mode) {
  const topic = roughTopic.trim() || "未入力";
  if (mode === "deepResearchPrompt") {
    return generateDeepResearchTopicCardPrompt(topic);
  }
  if (mode === "deepResearchReview") {
    return generateDeepResearchReviewTopicCardPrompt(topic);
  }
  return generateGeneralTopicCardPrompt(topic);
}

function generateGeneralTopicCardPrompt(topic) {
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

function generateDeepResearchTopicCardPrompt(topic) {
  return `あなたはAI会議室の事前整理担当です。
ユーザーの雑なテーマを、Deep Researchプロンプト作成モードで使える「議題カード」に整理してください。

## ユーザーの雑テーマ
${topic}

## 目的
この議題カードは、Deep Researchに直接投げるものではありません。
Deep Researchプロンプト作成モードで、最終的なDeep Research用プロンプトを作るための前提整理として使います。

## 作成する議題カード
以下の見出しで作成してください。

# 調べたいテーマ
# 背景
# 想定読者・利用者
# 利用場面
# 最終成果物
# 最終的に判断したいこと
# 調査範囲
# 除外範囲
# 重視する観点
# 除外したいこと
# 希望する出力形式
# Deep Researchで明らかにしたい問い
# 情報源の条件
# 高リスク領域
# 一発調査か分割調査かの希望
# 未入力・要確認事項

病名・医療・漢方テーマが疑われる場合は、続けて以下も追加してください。

# 病名テーマ Deep Research設計カード
## 病名
## 調べたい方向
- 医学的基礎
- 安全確認
- 漢方医学的病態
- 処方・生薬・証
- 症例報告・専門家経験知
- エビデンス
- 一般向け相談前メモ
- 専門職向け内部資料
## 今回の最優先目的
## 想定読者
- 一般ユーザー
- 漢方相談員
- 薬剤師
- 医師・漢方医
- 研究者
- 内部研修担当者
## 利用場面
- 内部学習
- 勉強会
- 相談準備
- 症例検討
- 患者説明
- Web公開
- 販売促進ではない
## 出してほしい成果物
- チェックリスト
- 症状クラスター表
- 証・病態表
- 処方群表
- 生薬表
- 安全性表
- 質問リスト
- 症例検討テンプレート
- 追加Deep Researchプロンプト
## 情報源の扱い
- ガイドライン:
- PMDA・添付文書:
- 論文:
- 症例報告:
- 専門家解説:
- 標準医療を否定するページ・受診不要を示唆するページ:
- 個人ブログ・体験談・SNS投稿:
- 販売ページ・広告LP:
- 危険表現・誤情報の隔離分析:
## 除外したいこと
- 病名処方
- 処方ランキング
- 治癒保証
- 標準治療否定
- 服薬変更指示
- 一般向けの処方推奨
## 初回調査後に判定すること
- この結果は何には使えるか
- 何には不十分か
- 次に必要なのは安全補完か、漢方知識補完か、処方・生薬補完か

## 作成方針
- 不明な情報は勝手に断定しない
- 不明な箇所は「未入力」または「要確認」と書く
- ユーザーがすぐ編集できるように簡潔に書く
- 一般論ではなく、Deep Researchプロンプト作成に使いやすい形にする
- 「最終的に判断したいこと」と「除外したいこと」を特に明確にする
- 読者、利用場面、最終成果物が不明なら「要確認」と書く
- 調査範囲が広すぎる可能性がある場合は、分割調査の候補を書く
- 医療・法律・金融・個人情報など高リスク領域が疑われる場合は明示する
- 病名×漢方テーマが疑われる場合は、安全確認だけでなく、漢方医学的病態、処方・生薬・証、症状クラスター、学習価値、改善仮説の補完が必要かを書く
- 「情報源の条件」には、優先したい情報源、根拠として使わない情報源、危険表現として隔離分析したい情報源が不明なら「要確認」と書く
- 標準医療を否定するページ、受診不要を示唆するページ、医師の診断・治療を代替すると示唆するページ、販売ページ、広告LP、個人ブログ、体験談、SNS投稿は根拠にしない。ただし、患者・保護者が触れている危険表現や広告表現の把握目的なら、根拠とは別枠で扱う
- Deep Researchにそのまま投げる完成プロンプトではなく、その前段の議題カードとして作る

## 出力形式
議題カードだけを出力してください。
余計な説明は不要です。`;
}

function generateDeepResearchReviewTopicCardPrompt(topic) {
  return `あなたはAI会議室の事前整理担当です。
ユーザーが貼ったDeep Research結果、元プロンプト、または雑なレビュー依頼を、Deep Research reviewモードで使える「議題カード」に整理してください。

## ユーザーの入力
${topic}

## 目的
この議題カードは、Deep Research結果をそのまま採用せず、情報源・根拠・主張の対応・安全性・実用性をレビューするために使います。
調査結果の要約だけでなく、採用可否、危険な内容、修正すべき内容、追加調査の必要性をAI会議で判断しやすい形にしてください。

## 作成する議題カード
以下の見出しで作成してください。

# 議題
# 背景
# 元のDeep Researchプロンプト
# レビュー対象
# 結果を使う目的
# 判断したいこと
# 制約
# 使える資源
# やらないこと
# 欲しくない回答
# 判断基準
# 回答の粒度
# 出力形式

## 作成方針
- Deep Research結果を無批判に採用しない
- 元のDeep Researchプロンプトが不明なら「未入力」と書く
- レビュー対象が不明なら「未入力」と書く
- 結果を使う目的が不明なら「要確認」と書く
- 調査結果の情報源・根拠レベル・古さを確認する前提にする
- 主要な主張と根拠の対応を確認する前提にする
- 医療、法律、金融、セキュリティなど高リスク領域では安全性レビューを必須にする
- 標準医療を否定する表現、受診不要を示唆する表現、医師の診断・治療を代替すると示唆する表現、販売誘導表現は、根拠ではなく危険表現レビューとして隔離する前提にする
- 「採用できる内容」「修正すべき内容」「危険な内容」を分けやすくする
- 出力形式には「情報源レビュー」「主張・根拠対応レビュー」「追加Deep Researchプロンプト案」を含める
- 追加Deep Researchが必要な場合に備えて、追加調査論点も整理する
- ユーザーがそのままAI会議室に貼れるように簡潔に書く

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
  collapsePreparationAfterTopicApplied();
  persist("議題カードを反映しました");
  setStatus(els.generatedTopicStatus, "議題カード欄へ反映しました。Step 1のプロンプトへ移動します。");
  render();
  scrollToElement(els.promptPanel);
}

function applyDeepResearchReviewFormCard() {
  const values = readDeepResearchReviewForm();
  state.deepResearchReviewForm = values;
  if (!values.result.trim()) {
    setStatus(els.deepResearchReviewFormStatus, "Deep Research reviewでは、レビュー対象となるDeep Research結果を入力してください。", "error");
    persist();
    return;
  }
  if (els.topicCard.value.trim() && !confirm("現在の議題カードをDeep Research reviewフォームの内容で上書きします。よろしいですか？")) {
    persist();
    return;
  }
  const draft = buildDeepResearchReviewTopicCardFromForm(values);
  state.topicCard = draft;
  els.topicCard.value = draft;
  collapsePreparationAfterTopicApplied();
  persist("Deep Research reviewフォームから議題カードを作成しました");
  setStatus(els.deepResearchReviewFormStatus, "議題カード欄へ反映しました。Step 1のプロンプトへ移動します。");
  render();
  scrollToElement(els.promptPanel);
}

function draftTopicCardFromRoughTopic() {
  const roughTopic = els.roughTopic.value.trim();
  if (state.mode === "deepResearchReview") {
    const values = readDeepResearchReviewForm();
    state.deepResearchReviewForm = values;
    if (hasDeepResearchReviewFormInput(values)) {
      if (!values.result.trim()) {
        setStatus(els.deepResearchReviewFormStatus, "Deep Research reviewでは、レビュー対象となるDeep Research結果を入力してください。", "error");
        persist();
        return;
      }
      if (els.topicCard.value.trim() && !confirm("現在の議題カードをDeep Research reviewフォームの内容で上書きします。よろしいですか？")) {
        persist();
        return;
      }
      const draft = buildDeepResearchReviewTopicCardFromForm(values);
      state.topicCard = draft;
      els.topicCard.value = draft;
      collapsePreparationAfterTopicApplied();
      persist("Deep Research reviewフォームから仮カードを作成しました");
      setStatus(els.topicPromptStatus, "Deep Research reviewフォームから仮カードを作成しました。Step 1のプロンプトへ移動します。");
      setStatus(els.deepResearchReviewFormStatus, "議題カード欄へ反映しました。");
      render();
      scrollToElement(els.promptPanel);
      return;
    }
    if (els.topicCard.value.trim() && !confirm("現在の議題カードを上書きします。よろしいですか？")) {
      persist();
      return;
    }
    const draft = buildDraftTopicCardFromRoughTopic(roughTopic || "Deep Research結果をレビューする", state.mode);
    state.topicCard = draft;
    els.topicCard.value = draft;
    collapsePreparationAfterTopicApplied();
    persist("Deep Research review用の仮カードを作成しました");
    setStatus(els.topicPromptStatus, "Deep Research review用の仮カードを議題カード欄へ反映しました。Step 1のプロンプトへ移動します。");
    render();
    scrollToElement(els.promptPanel);
    return;
  }
  if (!roughTopic) {
    setStatus(els.topicPromptStatus, "雑なテーマを入力してください。", "error");
    return;
  }
  if (els.topicCard.value.trim() && !confirm("現在の議題カードを上書きします。よろしいですか？")) {
    return;
  }
  const draft = buildDraftTopicCardFromRoughTopic(roughTopic, state.mode);
  state.topicCard = draft;
  els.topicCard.value = draft;
  collapsePreparationAfterTopicApplied();
  persist("雑なテーマから仮カードを作成しました");
  setStatus(els.topicPromptStatus, "仮カードを議題カード欄へ反映しました。Step 1のプロンプトへ移動します。");
  render();
  scrollToElement(els.promptPanel);
}

function buildDraftTopicCardFromRoughTopic(roughTopic, mode = state.mode) {
  if (mode === "deepResearchPrompt") {
    return `# 調べたいテーマ
${roughTopic}

# 背景
未入力

# 最終的に判断したいこと
要確認

# 使う場面
要確認

# 重視する観点
要確認

# 除外したいこと
要確認

# 希望する出力形式
要確認

# Deep Researchで明らかにしたい問い
要確認

# 情報源の条件
要確認

# 未入力・要確認事項
- 背景
- 最終的に判断したいこと
- 使う場面
- 重視する観点
- 除外したいこと
- Deep Researchで明らかにしたい問い
- 情報源の条件
- 希望する出力形式`;
  }
  if (mode === "deepResearchReview") {
    return `# 議題
Deep Research結果をレビューする

# 背景
Deep Researchで調査結果を得た。
この結果をそのまま使うのではなく、情報源、根拠、主張の対応、安全性、抜け漏れ、実用性を確認したい。

# 元のDeep Researchプロンプト
未入力

# レビュー対象
未入力

# 結果を使う目的
要確認

# 判断したいこと
- 調査結果は信頼できるか
- 主張と根拠が対応しているか
- 情報源は十分か
- 古い情報や根拠の弱い情報が混ざっていないか
- 危険な結論や過剰な断定がないか
- 元の調査質問に答えているか
- 実務で使える成果物になっているか
- 追加調査が必要か

# 制約
- 調査結果を無批判に採用しない
- 情報源と根拠レベルを確認する
- 主張と根拠の対応を確認する
- 高リスク領域では安全性を優先する
- 必要なら追加Deep Researchプロンプトを作る

# 使える資源
- 元のDeep Researchプロンプト
- Deep Research結果
- Deep Research内で示された情報源
- ユーザーの利用目的

# やらないこと
- 調査結果をそのまま最終結論にしない
- 根拠の弱い情報を推奨扱いしない
- 危険な内容を成果物に混ぜない
- 単なる要約で終わらせない

# 欲しくない回答
- ただの要約
- 情報源を確認しない感想
- 主張と根拠の対応を見ない結論
- 危険な内容と使える内容を分けない回答
- 追加調査の要否を示さない回答

# 判断基準
- 情報源の信頼性
- 主張と根拠の対応
- 根拠レベル
- 情報の新しさ
- 元の質問への回答度
- 安全性
- 実用性
- 追加調査の必要性
- 成果物として使えるか

# 回答の粒度
- 重要度つきで問題点を整理する
- 採用できる内容、修正すべき内容、危険な内容を分ける
- 最終的に使える成果物へ変換する

# 出力形式
- 採用可否
- 採用できる内容
- 修正すべき内容
- 危険な内容
- 情報源レビュー
- 主張・根拠対応レビュー
- 抜け漏れ
- 実用性レビュー
- 改訂版成果物
- 追加Deep Researchプロンプト案
- 次アクション
- 結論の自信度`;
  }
  return `# 議題
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
}

function handleTopicCardPaste() {
  window.setTimeout(() => {
    const pasted = els.topicCard.value.trim();
    if (!pasted) return;
    state.topicCard = els.topicCard.value;
    collapsePreparationAfterTopicApplied();
    persist("貼り付けた議題カードを反映しました。Step 1のプロンプトへ移動します。");
    render();
    scrollToElement(els.promptPanel);
  }, 0);
}

function loadState() {
  const fallback = {
    mode: DEFAULT_MODE,
    topicCard: templates.general,
    setupDone: false,
    quickFields: defaultQuickFields(),
    deepResearchReviewForm: defaultDeepResearchReviewForm(),
    deepResearchReviewImportLog: "",
    deepResearchReviewImportedFinalAnswer: "",
    promptContextMode: "full",
    preparationCollapsed: false,
    reviewResultsCollapsed: false,
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
      deepResearchReviewForm: normalizeDeepResearchReviewForm(parsed.deepResearchReviewForm),
      deepResearchReviewImportLog: "",
      deepResearchReviewImportedFinalAnswer: "",
      promptContextMode: parsed.promptContextMode === "light" ? "light" : "full",
      preparationCollapsed: typeof parsed.preparationCollapsed === "boolean" ? parsed.preparationCollapsed : fallback.preparationCollapsed,
      reviewResultsCollapsed: typeof parsed.reviewResultsCollapsed === "boolean" ? parsed.reviewResultsCollapsed : fallback.reviewResultsCollapsed,
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

function defaultDeepResearchReviewForm() {
  return {
    originalPrompt: "",
    result: "",
    purpose: "",
    focus: [],
    risk: [],
    artifact: [],
    notes: ""
  };
}

function normalizeDeepResearchReviewForm(value) {
  const defaults = defaultDeepResearchReviewForm();
  if (!value || typeof value !== "object") return defaults;
  return {
    originalPrompt: typeof value.originalPrompt === "string" ? value.originalPrompt : "",
    result: typeof value.result === "string" ? value.result : "",
    purpose: typeof value.purpose === "string" ? value.purpose : "",
    focus: Array.isArray(value.focus) ? value.focus.filter((item) => typeof item === "string") : [],
    risk: Array.isArray(value.risk) ? value.risk.filter((item) => typeof item === "string") : [],
    artifact: Array.isArray(value.artifact) ? value.artifact.filter((item) => typeof item === "string") : [],
    notes: typeof value.notes === "string" ? value.notes : ""
  };
}

function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map((input) => input.value);
}

function setCheckedValues(name, values) {
  const selected = new Set(Array.isArray(values) ? values : []);
  document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.checked = selected.has(input.value);
  });
}

function readDeepResearchReviewForm() {
  return {
    originalPrompt: els.deepResearchReviewOriginalPrompt ? els.deepResearchReviewOriginalPrompt.value : "",
    result: els.deepResearchReviewResult ? els.deepResearchReviewResult.value : "",
    purpose: els.deepResearchReviewPurpose ? els.deepResearchReviewPurpose.value : "",
    focus: getCheckedValues(deepResearchReviewFormDefs.focus),
    risk: getCheckedValues(deepResearchReviewFormDefs.risk),
    artifact: getCheckedValues(deepResearchReviewFormDefs.artifact),
    notes: els.deepResearchReviewNotes ? els.deepResearchReviewNotes.value : ""
  };
}

function fillDeepResearchReviewForm(values) {
  const normalized = normalizeDeepResearchReviewForm(values);
  if (els.deepResearchReviewOriginalPrompt) els.deepResearchReviewOriginalPrompt.value = normalized.originalPrompt;
  if (els.deepResearchReviewResult) els.deepResearchReviewResult.value = normalized.result;
  if (els.deepResearchReviewPurpose) els.deepResearchReviewPurpose.value = normalized.purpose;
  if (els.deepResearchReviewNotes) els.deepResearchReviewNotes.value = normalized.notes;
  setCheckedValues(deepResearchReviewFormDefs.focus, normalized.focus);
  setCheckedValues(deepResearchReviewFormDefs.risk, normalized.risk);
  setCheckedValues(deepResearchReviewFormDefs.artifact, normalized.artifact);
}

function saveDeepResearchReviewForm() {
  state.deepResearchReviewForm = readDeepResearchReviewForm();
  persist();
}

function saveDeepResearchReviewImportLog() {
  state.deepResearchReviewImportLog = els.deepResearchReviewImportLog ? els.deepResearchReviewImportLog.value : "";
  persist();
}

function readResearchBriefDraft() {
  return {
    id: RESEARCH_BRIEF_LATEST_ID,
    theme: els.researchBriefTheme ? els.researchBriefTheme.value.trim() : "",
    purpose: els.researchBriefPurpose ? els.researchBriefPurpose.value.trim() : "",
    audience: els.researchBriefAudience ? els.researchBriefAudience.value.trim() : "",
    externalUse: els.researchBriefExternal ? els.researchBriefExternal.value : "外部公開しない",
    raw: els.researchBriefRaw ? els.researchBriefRaw.value : "",
    brief: els.researchBriefOutput ? els.researchBriefOutput.value : "",
    updatedAt: new Date().toISOString()
  };
}

function fillResearchBriefDraft(draft = {}) {
  if (els.researchBriefTheme) els.researchBriefTheme.value = draft.theme || "";
  if (els.researchBriefPurpose) els.researchBriefPurpose.value = draft.purpose || "";
  if (els.researchBriefAudience) els.researchBriefAudience.value = draft.audience || "";
  if (els.researchBriefExternal) els.researchBriefExternal.value = draft.externalUse || "外部公開しない";
  if (els.researchBriefRaw) els.researchBriefRaw.value = draft.raw || "";
  if (els.researchBriefOutput) els.researchBriefOutput.value = draft.brief || "";
  updateResearchBriefPromptPreview();
}

function buildResearchBriefPrompt(draft = readResearchBriefDraft()) {
  const theme = draft.theme || "未入力";
  const purpose = draft.purpose || "未入力";
  const audience = draft.audience || "未入力";
  const externalUse = draft.externalUse || "未入力";
  const raw = String(draft.raw || "").trim() || "未入力";
  return `あなたはDeep Research結果をResearch Briefへ圧縮する編集担当です。

目的:
Deep Research全文をそのままAI会議に渡さず、再利用しやすい短いResearch Briefに変換してください。

調査テーマ:
${theme}

用途:
${purpose}

想定読者:
${audience}

外部公開有無:
${externalUse}

重要ルール:
- 原文の主張を無批判に採用しない
- 事実、推論、未確認事項を分ける
- Claim / Evidence Table は「検証済みの真実」ではなく、原文とレビュー用の整理として書く
- 医療・健康・安全に関わる内容では、推奨や断定に見える表現を避ける
- What Can Be Used と What Cannot Be Used を必ず分離する
- Open Questions と Next Research Prompts を必ず残す
- Decision Ledger / Answer Ledger が原文に存在する場合のみ反映する。なければ「未提供」と書く
- Deep Research原文全文を要約しすぎず、AI会議に渡すための判断材料だけを抽出する

出力形式:
# Research Brief

## Executive Summary

## Research Question

## Key Findings

## Claim / Evidence Table
| Claim | Evidence / Source Mentioned | Evidence Strength | Review Note |
|---|---|---|---|

## Source Quality

## Risk / Safety Notes

## What Can Be Used

## What Cannot Be Used

## Open Questions

## Next Research Prompts

## Decision Ledger

## Answer Ledger

Deep Research原文:
${raw}`;
}

function updateResearchBriefPromptPreview() {
  if (!els.researchBriefPrompt) return;
  els.researchBriefPrompt.value = buildResearchBriefPrompt(readResearchBriefDraft());
}

function openResearchBriefDb() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB is not available"));
      return;
    }
    const request = indexedDB.open(RESEARCH_BRIEF_DB_NAME, RESEARCH_BRIEF_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(RESEARCH_BRIEF_STORE)) {
        db.createObjectStore(RESEARCH_BRIEF_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB open failed"));
  });
}

async function saveResearchBriefDraftToStorage(draft) {
  const payload = { ...draft, id: RESEARCH_BRIEF_LATEST_ID, updatedAt: new Date().toISOString() };
  try {
    const db = await openResearchBriefDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(RESEARCH_BRIEF_STORE, "readwrite");
      tx.objectStore(RESEARCH_BRIEF_STORE).put(payload);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error("IndexedDB write failed"));
    });
    db.close();
    return "IndexedDB";
  } catch {
    try {
      localStorage.setItem(RESEARCH_BRIEF_FALLBACK_KEY, JSON.stringify(payload));
      return "localStorage";
    } catch {
      throw new Error("Research Brief storage failed");
    }
  }
}

async function loadResearchBriefDraftFromStorage() {
  try {
    const db = await openResearchBriefDb();
    const result = await new Promise((resolve, reject) => {
      const tx = db.transaction(RESEARCH_BRIEF_STORE, "readonly");
      const request = tx.objectStore(RESEARCH_BRIEF_STORE).get(RESEARCH_BRIEF_LATEST_ID);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error("IndexedDB read failed"));
    });
    db.close();
    if (result) return result;
  } catch {
    // Fall back below.
  }
  try {
    return JSON.parse(localStorage.getItem(RESEARCH_BRIEF_FALLBACK_KEY) || "null");
  } catch {
    return null;
  }
}

async function loadResearchBriefDraft() {
  const draft = await loadResearchBriefDraftFromStorage();
  if (!draft) {
    updateResearchBriefPromptPreview();
    return;
  }
  fillResearchBriefDraft(draft);
  setStatus(els.researchBriefStatus, "保存済みResearch Brief下書きを読み込みました。");
}

async function saveResearchBriefRaw() {
  const draft = readResearchBriefDraft();
  if (!draft.raw.trim()) {
    setStatus(els.researchBriefStatus, "Deep Research結果原本を貼ってください。", "error");
    return;
  }
  try {
    const savedTo = await saveResearchBriefDraftToStorage(draft);
    updateResearchBriefPromptPreview();
    setStatus(els.researchBriefStatus, `Deep Research原本を保存しました（${savedTo}）。AI会議にはまだ渡していません。`);
  } catch {
    setStatus(els.researchBriefStatus, "保存に失敗しました。原本が長すぎる場合はMarkdownファイルとして外部保存してください。", "error");
  }
}

async function copyResearchBriefPrompt() {
  updateResearchBriefPromptPreview();
  await copyPlainText(els.researchBriefPrompt ? els.researchBriefPrompt.value : "", els.researchBriefStatus, "Brief生成プロンプトをコピーしました。");
}

async function saveResearchBriefOutput() {
  const draft = readResearchBriefDraft();
  if (!draft.brief.trim()) {
    setStatus(els.researchBriefStatus, "Research Brief出力を貼ってください。", "error");
    return;
  }
  try {
    const savedTo = await saveResearchBriefDraftToStorage(draft);
    setStatus(els.researchBriefStatus, `Research Briefを保存しました（${savedTo}）。`);
  } catch {
    setStatus(els.researchBriefStatus, "保存に失敗しました。BriefをMarkdownとしてコピーまたは保存してください。", "error");
  }
}

function buildResearchBriefMarkdown(draft = readResearchBriefDraft()) {
  const brief = String(draft.brief || "").trim() || "# Research Brief\n\n未入力";
  return `---
theme: ${draft.theme || "未入力"}
purpose: ${draft.purpose || "未入力"}
audience: ${draft.audience || "未入力"}
externalUse: ${draft.externalUse || "未入力"}
updatedAt: ${new Date().toISOString()}
---

${brief}`;
}

async function copyResearchBriefMarkdown() {
  await copyPlainText(buildResearchBriefMarkdown(), els.researchBriefStatus, "Research Brief Markdownをコピーしました。");
}

function downloadResearchBriefMarkdown() {
  const draft = readResearchBriefDraft();
  const title = safeFilename(draft.theme || "research_brief");
  const blob = new Blob([buildResearchBriefMarkdown(draft)], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${formatDate(new Date())}_${title}_research_brief.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  setStatus(els.researchBriefStatus, "Research Brief Markdownを保存しました。");
}

function buildResearchBriefTopicCard(draft = readResearchBriefDraft()) {
  const brief = String(draft.brief || "").trim();
  return `# 議題
Research BriefをもとにDeep Research結果をレビューする

# 背景
Deep Research全文は原本として別途保存済みです。
このAI会議には、Deep Research全文ではなくResearch Brief、未解決論点、判断したいことだけを渡します。

# 調査テーマ
${draft.theme || "未入力"}

# 用途
${draft.purpose || "未入力"}

# 読者
${draft.audience || "未入力"}

# 外部公開有無
${draft.externalUse || "未入力"}

# Research Brief
${brief || "未入力"}

# 未解決論点
- Research BriefのOpen Questionsを確認する
- 根拠が弱い主張を分ける
- 追加Deep Researchが必要な範囲を決める

# 判断したいこと
- Briefだけで採用判断できる内容は何か
- Deep Research原文に戻って確認すべき内容は何か
- 危険な内容、根拠の弱い内容、使える内容は何か
- 次に作る成果物は何か

# 制約
- Deep Research全文をAI会議に直接渡さない
- Briefにない主張は採用しない
- 医療・安全に関わる内容は断定しない
- 必要なら原本・情報源・追加Deep Researchで確認する
- 使える内容、使えない内容、未確認事項を分ける

# 出力形式
- 採用可否
- 使える内容
- 使えない内容
- 未解決論点
- 追加Deep Researchプロンプト案
- 次アクション`;
}

async function applyResearchBriefTopicCard() {
  const draft = readResearchBriefDraft();
  if (!draft.brief.trim()) {
    setStatus(els.researchBriefStatus, "AI会議に渡す前に、Research Brief出力を貼ってください。Deep Research全文は直接渡しません。", "error");
    return;
  }
  state.mode = "deepResearchReview";
  state.topicCard = buildResearchBriefTopicCard(draft);
  state.currentStep = 1;
  state.answers = {};
  state.steeringNotes = {};
  state.deepResearchReviewImportedFinalAnswer = "";
  state.deepResearchReviewImportLog = "";
  state.preparationCollapsed = true;
  state.reviewResultsCollapsed = false;
  if (els.modeSelect) els.modeSelect.value = state.mode;
  if (els.topicCard) els.topicCard.value = state.topicCard;
  updateTopicPrompt();
  try {
    await saveResearchBriefDraftToStorage(draft);
  } catch {
    // The topic card is still usable even if local draft persistence fails.
  }
  persist("Research BriefからAI会議用の議題カードを生成しました。");
  setStatus(els.researchBriefStatus, "AI会議用議題カードを生成しました。Deep Research全文は含めていません。");
  render();
  scrollToElement(els.promptPanel);
}

function extractDeepResearchReviewFinalJudgeAnswer(text) {
  const source = String(text || "").trim().replace(/\r\n/g, "\n");
  if (!source) return "";
  if (/AI_BOARD:DR_REVIEW_[A-Z_]+:START/u.test(source)) return source;
  const stepMatch = source.match(/(?:^|\n)##\s*Step\s*8\s*:[^\n]*\n/);
  if (stepMatch) {
    const headingStart = stepMatch.index + (stepMatch[0].startsWith("\n") ? 1 : 0);
    const headingEnd = stepMatch.index + stepMatch[0].length;
    const rest = source.slice(headingEnd);
    const nextStepIndex = rest.search(/\n##\s*Step\s+\d+\s*:/);
    const answer = nextStepIndex >= 0 ? rest.slice(0, nextStepIndex) : rest;
    return answer
      .replace(/\n###\s*ユーザーの軌道修正メモ[\s\S]*$/u, "")
      .trim() || source.slice(headingStart).trim();
  }
  if (
    /(?:^|\n)##\s*採用可否/u.test(source) ||
    /(?:^|\n)##\s*改訂版成果物/u.test(source) ||
    /(?:^|\n)##\s*追加Deep Researchプロンプト案/u.test(source)
  ) {
    return source;
  }
  return "";
}

function applyDeepResearchReviewImportedLog() {
  if (!els.deepResearchReviewImportLog) return;
  const raw = els.deepResearchReviewImportLog.value.trim();
  if (!raw) {
    setStatus(els.deepResearchReviewImportStatus, "保存済みAI会議ログ、またはStep 8 Final Judgeの回答を貼ってください。", "error");
    return;
  }
  const finalAnswer = extractDeepResearchReviewFinalJudgeAnswer(raw);
  if (!finalAnswer) {
    setStatus(els.deepResearchReviewImportStatus, "復元できる出口カードが見つかりませんでした。DR_REVIEW_* マーカー付きのFinal Judgeログを貼ってください。", "error");
    return;
  }
  state.mode = "deepResearchReview";
  state.deepResearchReviewImportLog = raw;
  state.deepResearchReviewImportedFinalAnswer = finalAnswer;
  state.preparationCollapsed = true;
  state.reviewResultsCollapsed = false;
  els.modeSelect.value = state.mode;
  const restoredLabels = getDeepResearchReviewRestoredCardLabels(buildDeepResearchReviewCompleteParts(finalAnswer));
  if (!restoredLabels.length) {
    state.deepResearchReviewImportedFinalAnswer = "";
    setStatus(els.deepResearchReviewImportStatus, "復元できる出口カードが見つかりませんでした。DR_REVIEW_* マーカー付きのFinal Judgeログを貼ってください。", "error");
    render();
    return;
  }
  render();
  setStatus(els.deepResearchReviewImportStatus, `復元しました: ${restoredLabels.join(" / ")}`);
  scrollToElement(els.deepResearchReviewCompletePanel);
}

function clearDeepResearchReviewImportedLog() {
  state.deepResearchReviewImportLog = "";
  state.deepResearchReviewImportedFinalAnswer = "";
  if (els.deepResearchReviewImportLog) els.deepResearchReviewImportLog.value = "";
  persist("Deep Research reviewの読み込みをクリアしました");
  render();
  setStatus(els.deepResearchReviewImportStatus, "復元表示をクリアしました。現在の会議Step回答は変更していません。");
}

function hasDeepResearchReviewFormInput(values = readDeepResearchReviewForm()) {
  return Boolean(
    values.originalPrompt.trim() ||
    values.result.trim() ||
    values.purpose.trim() ||
    values.notes.trim() ||
    values.focus.length ||
    values.risk.length ||
    values.artifact.length
  );
}

function listOrDefault(values, defaults, emptyValue) {
  if (Array.isArray(values) && values.length) return values.join(" / ");
  if (Array.isArray(defaults) && defaults.length) return defaults.join(" / ");
  return emptyValue;
}

function buildDeepResearchReviewTopicCardFromForm(values) {
  const normalized = normalizeDeepResearchReviewForm(values);
  const originalPrompt = normalized.originalPrompt.trim() || "未入力";
  const researchResult = normalized.result.trim();
  const usagePurpose = normalized.purpose.trim() || deepResearchReviewDefaultPurpose;
  const reviewFocus = listOrDefault(normalized.focus, deepResearchReviewFocusDefaults);
  const riskAreas = normalized.risk.length ? normalized.risk.join(" / ") : "要確認";
  const desiredArtifacts = listOrDefault(normalized.artifact, deepResearchReviewArtifactDefaults);
  const notes = normalized.notes.trim() || "未入力";

  return `# 議題
Deep Research結果をレビューする

# 背景
Deep Researchで調査結果を得た。
この結果をそのまま使うのではなく、情報源、根拠、主張の対応、安全性、抜け漏れ、実用性を確認したい。

# 元のDeep Researchプロンプト
${originalPrompt}

# レビュー対象
${researchResult}

# 結果を使う目的
${usagePurpose}

# 特に確認したい観点
${reviewFocus}

# 高リスク領域
${riskAreas}

# 最終的に欲しい成果物
${desiredArtifacts}

# 補足・制約
${notes}

# 判断したいこと
- 調査結果は信頼できるか
- 主張と根拠が対応しているか
- 情報源は十分か
- 古い情報や根拠の弱い情報が混ざっていないか
- 危険な結論や過剰な断定がないか
- 元の調査質問に答えているか
- 実務で使える成果物になっているか
- 追加調査が必要か

# 制約
- 調査結果を無批判に採用しない
- 情報源と根拠レベルを確認する
- 主張と根拠の対応を確認する
- 高リスク領域では安全性を優先する
- 必要なら追加Deep Researchプロンプトを作る
- 危険な内容、根拠の弱い内容、採用できる内容を分ける
- 単なる要約で終わらせない

# 使える資源
- 元のDeep Researchプロンプト
- Deep Research結果
- Deep Research内で示された情報源
- ユーザーの利用目的
- ユーザーが指定した確認観点
- ユーザーが指定した最終成果物

# やらないこと
- 調査結果をそのまま最終結論にしない
- 根拠の弱い情報を推奨扱いしない
- 危険な内容を成果物に混ぜない
- 単なる要約で終わらせない
- 情報源を確認せずに採用判断しない

# 欲しくない回答
- ただの要約
- 情報源を確認しない感想
- 主張と根拠の対応を見ない結論
- 危険な内容と使える内容を分けない回答
- 追加調査の要否を示さない回答
- 元の調査目的とのズレを確認しない回答

# 判断基準
- 情報源の信頼性
- 主張と根拠の対応
- 根拠レベル
- 情報の新しさ
- 元の質問への回答度
- 安全性
- 実用性
- 追加調査の必要性
- 成果物として使えるか

# 回答の粒度
- 重要度つきで問題点を整理する
- 採用できる内容、修正すべき内容、危険な内容を分ける
- 主張・根拠対応表を作る
- 抜け漏れを明示する
- 最終的に使える成果物へ変換する
- 必要なら追加Deep Researchプロンプト案を作る

# 出力形式
- 採用可否
- 採用できる内容
- 修正すべき内容
- 危険な内容
- 情報源レビュー
- 主張・根拠対応レビュー
- 抜け漏れ
- 実用性レビュー
- 改訂版成果物
- 追加Deep Researchプロンプト案
- 次アクション
- 結論の自信度`;
}

function persist(message) {
  state.updatedAt = new Date().toISOString();
  try {
    const snapshot = {
      ...state,
      deepResearchReviewImportLog: "",
      deepResearchReviewImportedFinalAnswer: ""
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    if (message) setStatus(els.saveStatus, message);
  } catch {
    setStatus(els.saveStatus, "localStorage保存に失敗しました。画面操作は継続できます。", "warn");
  }
}

function renderSetupPanel() {
  els.setupDoneCheckbox.checked = state.setupDone;
  if (els.setupToggleButton) {
    els.setupToggleButton.textContent = state.setupDone ? "初期設定済み" : "初期設定";
    els.setupToggleButton.classList.toggle("muted", state.setupDone);
  }
}

function toggleSetupPanel() {
  els.setupPanel.hidden = !els.setupPanel.hidden;
}

function showAppCacheVersionDetail() {
  alert(`App cache: ${APP_CACHE_NAME}`);
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
  state.mode = modeSteps[mode] ? mode : DEFAULT_MODE;
  if (state.mode === "deepResearchPrompt") {
    state.deepResearchActiveTab = "prompt";
    state.promptContextMode = inferDeepResearchPromptContextMode();
  } else if (state.mode === "deepResearchReview") {
    state.deepResearchActiveTab = "review";
  } else {
    state.deepResearchActiveTab = "";
  }
  state.currentStep = normalizeStep(state.currentStep, state.mode);
  els.modeSelect.value = state.mode;
  updateTopicPrompt();
  persist(`会議モードを ${modeLabels[state.mode]} に変更しました`);
  render();
}

function changePromptContextMode() {
  state.promptContextMode = els.promptContextModeSelect && els.promptContextModeSelect.value === "light" ? "light" : "full";
  persist("プロンプト形式を変更しました");
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
  collapsePreparationAfterTopicApplied();
  persist("かんたん入力フォームから議題カードを作成しました");
  setStatus(els.quickCardStatus, "議題カード欄へ反映しました。Step 1のプロンプトへ移動します。");
  render();
  scrollToElement(els.promptPanel);
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
  collapsePreparationAfterTopicApplied();
  persist("テンプレートを適用しました");
  els.templateSelect.value = "";
  render();
}

function currentStepIndex() {
  return normalizeStep(state.currentStep, state.mode) - 1;
}

function getStepsForMode(mode) {
  return modeSteps[mode] || modeSteps[DEFAULT_MODE] || modeSteps.basic;
}

function switchModeFromDeepResearchTab(mode) {
  if (!modeSteps[mode]) return false;
  const before = state.mode;
  els.modeSelect.value = mode;
  changeMode();
  return state.mode === mode || before === mode;
}

function handleDeepResearchTabClick(tab) {
  if (tab === "prompt") {
    if (switchModeFromDeepResearchTab("deepResearchPrompt")) {
      state.deepResearchActiveTab = "prompt";
      state.promptContextMode = inferDeepResearchPromptContextMode();
      persist();
      render();
      scrollToElement(els.topicEntryTitle);
    }
    return;
  }
  if (tab === "review") {
    if (switchModeFromDeepResearchTab("deepResearchReview")) {
      state.deepResearchActiveTab = "review";
      persist();
      render();
      scrollToElement(els.deepResearchReviewInputPanel || els.topicEntryTitle);
    }
    return;
  }
  if (tab === "restore") {
    if (switchModeFromDeepResearchTab("deepResearchReview")) {
      state.deepResearchActiveTab = "restore";
      persist();
      render();
      scrollToElement(els.deepResearchReviewImportLog || els.deepResearchReviewInputPanel);
    }
    return;
  }
  if (tab === "golden") {
    state.deepResearchActiveTab = "golden";
    persist();
    renderModeShortcuts();
    scrollToElement(els.goldenCasePanel);
  }
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
  renderDeepResearchReviewInputPanel();
  renderModeEntryCopy();
  renderModeShortcuts();
  renderPromptContextModePanel(step);
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
  els.logPreview.textContent = buildMeetingLog(state.answers, state.steeringNotes) || "まだ会議ログはありません。";
  els.markdownText.value = generateMarkdown();
  renderDeepResearchReviewCompletePanel();
  renderDeepResearchLedgerPanel();
  renderDeepResearchCopyPanel();
  renderGoldenCasePanel();
  renderWorkflowLayout(complete);
  applyExitCardDisclosures();
  hardenExternalLinks(document);
}

function renderDeepResearchReviewInputPanel() {
  if (!els.deepResearchReviewInputPanel) return;
  els.deepResearchReviewInputPanel.hidden = state.mode !== "deepResearchReview";
}

function renderModeShortcuts() {
  const activeTab = state.deepResearchActiveTab || (state.mode === "deepResearchPrompt" ? "prompt" : state.mode === "deepResearchReview" ? "review" : "");
  els.modeShortcutButtons.forEach((button) => {
    const active = button.dataset.modeShortcut === state.mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  els.deepResearchTabButtons.forEach((button) => {
    const tab = button.dataset.deepResearchTab;
    const meta = deepResearchTabMeta[tab];
    if (meta) {
      button.textContent = meta.label;
      button.title = meta.fullLabel;
      button.setAttribute("aria-label", meta.fullLabel);
    }
    const active =
      (tab === "prompt" && state.mode === "deepResearchPrompt" && activeTab === "prompt") ||
      (tab === "review" && state.mode === "deepResearchReview" && activeTab === "review") ||
      (tab === "restore" && state.mode === "deepResearchReview" && activeTab === "restore") ||
      (tab === "golden" && activeTab === "golden");
    button.classList.toggle("is-active", active);
    button.classList.toggle("primary", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });
  if (els.deepResearchTabDescription) {
    els.deepResearchTabDescription.textContent = (deepResearchTabMeta[activeTab] || deepResearchTabMeta.prompt).description;
  }
  if (els.modeSelectAdvanced) {
    els.modeSelectAdvanced.open = !["deepResearchPrompt", "deepResearchReview"].includes(state.mode);
  }
}

function renderModeEntryCopy() {
  const reviewCopy = {
    title: "Deep Research結果を貼る",
    hint: "Deep Researchの出力、調査結果、レポート本文を貼ってください。不足・矛盾・根拠・追加調査候補をレビューします。",
    roughLabel: "1. Deep Researchの出力・調査結果・レビュー依頼を貼る",
    roughPlaceholder: "例）Deep Research結果本文を貼る\n例）元プロンプトと調査結果を貼る\n例）この調査結果を成果物化できるかレビューしたい",
    promptLabel: "2. Deep Research review用の議題カード作成プロンプト",
    draftButton: "AIを使わずレビュー用カードにする",
    generatedLabel: "3. AIが作ったレビュー用議題カードを貼る",
    applyButton: "レビューを開始",
    reviewFormButton: "レビューを開始"
  };
  const promptCopy = {
    title: "まずテーマを書く",
    hint: "雑な一言でOKです。Deep Research用の調査設計カードに整えます。",
    roughLabel: "1. 調べたいことを雑に書く",
    roughPlaceholder: "例）漢方相談でDeep Researchをどう使うか\n例）線維筋痛症の漢方\n例）起立性調節障害の漢方相談",
    promptLabel: "2. AIに貼る作成プロンプト（自動生成）",
    draftButton: "AIを使わず仮カードにする",
    generatedLabel: "3. AIが作った議題カードを貼る",
    applyButton: "4. 議題カード欄へ反映",
    reviewFormButton: "Deep Research review用議題カードを作る"
  };
  const defaultCopy = {
    title: "まずテーマを書く",
    hint: "雑な一言でOKです。AIが選択中の会議モードで使いやすい議題カードに整えます。",
    roughLabel: "1. 話したいこと・調べたいこと・レビューしたい結果を雑に書く",
    roughPlaceholder: "例）集客について\n例）LINE相談を増やしたい\n例）仕様をレビューしたい",
    promptLabel: "2. AIに貼る作成プロンプト（自動生成）",
    draftButton: "AIを使わず仮カードにする",
    generatedLabel: "3. AIが作った議題カードを貼る",
    applyButton: "4. 議題カード欄へ反映",
    reviewFormButton: "Deep Research review用議題カードを作る"
  };
  const copy = state.mode === "deepResearchReview"
    ? reviewCopy
    : state.mode === "deepResearchPrompt"
      ? promptCopy
      : defaultCopy;
  if (els.topicEntryTitle) els.topicEntryTitle.textContent = copy.title;
  if (els.roughTopicHint) els.roughTopicHint.textContent = copy.hint;
  if (els.roughTopicLabel) els.roughTopicLabel.textContent = copy.roughLabel;
  if (els.roughTopic) els.roughTopic.placeholder = copy.roughPlaceholder;
  if (els.topicPromptLabel) els.topicPromptLabel.textContent = copy.promptLabel;
  if (els.draftTopicCardButton) els.draftTopicCardButton.textContent = copy.draftButton;
  if (els.generatedTopicCardLabel) els.generatedTopicCardLabel.textContent = copy.generatedLabel;
  if (els.applyGeneratedTopicButton) els.applyGeneratedTopicButton.textContent = copy.applyButton;
  if (els.applyDeepResearchReviewFormButton) els.applyDeepResearchReviewFormButton.textContent = copy.reviewFormButton;
}

function renderPromptContextModePanel(step) {
  if (!els.promptContextModePanel || !els.promptContextModeSelect) return;
  const canShow = Boolean(step);
  els.promptContextModePanel.hidden = !canShow;
  els.promptContextModeSelect.value = state.promptContextMode === "light" ? "light" : "full";
  if (els.promptContextModeWarning) {
    const showWarning = canShow && state.currentStep === 1;
    els.promptContextModeWarning.hidden = !showWarning;
    if (showWarning) {
      els.promptContextModeWarning.textContent = state.mode === "deepResearchReview"
        ? "Step 1 はレビュー対象を初めて構造化するため、完全版の使用を推奨します。"
        : "Step 1 は議題カードを初めて扱うため、完全版の使用を推奨します。";
    }
  }
  if (els.promptLengthInfo) {
    if (!canShow) {
      els.promptLengthInfo.textContent = "";
      return;
    }
    const fullPrompt = generateFullPrompt(state.currentStep, state.topicCard, state.answers, state.steeringNotes);
    const lightPrompt = generateLightPrompt(state.currentStep, step, state.answers);
    els.promptLengthInfo.textContent = `完全版: ${formatCharacterCount(fullPrompt.length)}文字 / 軽量版: ${formatCharacterCount(lightPrompt.length)}文字`;
  }
}

function isDeepResearchFollowupTopicCard() {
  const text = [
    state.topicCard,
    els.topicCard ? els.topicCard.value : "",
    state.deepResearchReviewImportedFinalAnswer
  ].map((value) => String(value || "")).join("\n");
  return /Deep Research review由来|2回目以降用|軽量版|次調査カード|Handoff Card|未解決Issue|前回レビュー|追加調査が必要|DR_REVIEW/u.test(text);
}

function inferDeepResearchPromptContextMode() {
  return isDeepResearchFollowupTopicCard() ? "light" : "full";
}

function getDeepResearchPromptRecommendation() {
  if (inferDeepResearchPromptContextMode() === "light") {
    return {
      mode: "light",
      message: "推奨: 2回目以降・軽量版。review由来の次調査カードや未解決Issueを前提に、必要部分だけ深掘りします。"
    };
  }
  return {
    mode: "full",
    message: "推奨: 初回・広く深く用。一括で全体地図を作り、Deep Research reviewで抜け漏れを確認します。"
  };
}

function getDeepResearchPromptOpenExitCards() {
  if (inferDeepResearchPromptContextMode() === "light") {
    return new Set([
      "deepResearchLightweightText",
      "deepResearchSplitText",
      "deepResearchOrderText"
    ]);
  }
  return new Set([
    "deepResearchCompletePromptText",
    "deepResearchLightweightText",
    "deepResearchOrderText"
  ]);
}

const deepResearchPromptExitCardOrder = new Map([
  ["deepResearchCompletePromptText", 1],
  ["deepResearchLightweightText", 2],
  ["deepResearchSplitText", 3],
  ["deepResearchOrderText", 4],
  ["deepResearchAdditionalText", 5],
  ["deepResearchDecisionLedgerText", 6],
  ["deepResearchAnswerLedgerText", 7],
  ["deepResearchAssumptionsText", 8],
  ["deepResearchOpinionRequestText", 9],
  ["deepResearchOneShotText", 10],
  ["deepResearchQuestionsText", 11]
]);

const deepResearchReviewOpenExitCards = new Set([
  "deepResearchReviewAdoptionText",
  "deepResearchReviewPublicSafeText",
  "deepResearchReviewArtifactText",
  "deepResearchReviewResearchBriefText",
  "deepResearchReviewOpinionRequestText",
  "deepResearchReviewHandoffCardText",
  "deepResearchReviewNextActionsText"
]);

function applyExitCardDisclosures() {
  applyExitCardMetadata();
  applyExitCardDisclosuresForPanel(els.deepResearchCopyPanel, getDeepResearchPromptOpenExitCards(), deepResearchPromptExitCardOrder);
  applyExitCardDisclosuresForPanel(els.deepResearchReviewCompletePanel, deepResearchReviewOpenExitCards);
}

const exitCardMetadata = {
  deepResearchCompletePromptText: ["Deep Research向け", "重い", "初回・広く深く用"],
  deepResearchLightweightText: ["Deep Research向け", "軽い", "2回目以降の推奨"],
  deepResearchOpinionRequestText: ["ChatGPT相談向け", "軽い"],
  deepResearchOrderText: ["Deep Research向け", "軽い"],
  deepResearchOneShotText: ["Deep Research向け", "重い", "初回用"],
  deepResearchSplitText: ["Deep Research向け", "中"],
  deepResearchAdditionalText: ["Deep Research向け", "中"],
  deepResearchQuestionsText: ["ChatGPT相談向け", "軽い"],
  deepResearchAssumptionsText: ["保存・復元用", "軽い"],
  deepResearchDecisionLedgerText: ["保存・復元用", "軽い"],
  deepResearchAnswerLedgerText: ["保存・復元用", "軽い"],
  deepResearchReviewAdoptionText: ["保存・復元用", "軽い"],
  deepResearchReviewArtifactText: ["保存・復元用", "中"],
  deepResearchReviewResearchBriefText: ["保存・復元用", "中"],
  deepResearchReviewOpinionRequestText: ["ChatGPT相談向け", "軽い"],
  deepResearchReviewPublicSafeText: ["保存・復元用", "中"],
  deepResearchReviewPharmacySafetyText: ["保存・復元用", "中"],
  deepResearchReviewProInternalText: ["保存・復元用", "中"],
  deepResearchReviewAdditionalPromptText: ["Deep Research向け", "中"],
  deepResearchReviewHandoffCardText: ["Deep Research向け", "軽い"],
  deepResearchReviewNextActionsText: ["保存・復元用", "軽い"],
  deepResearchReviewDangerousText: ["保存・復元用", "軽い"],
  deepResearchReviewFixesText: ["保存・復元用", "軽い"],
  deepResearchReviewSourceText: ["保存・復元用", "中"],
  deepResearchReviewClaimEvidenceText: ["保存・復元用", "中"],
  deepResearchReviewGapsText: ["保存・復元用", "軽い"],
  deepResearchReviewPracticalityText: ["保存・復元用", "軽い"],
  deepResearchReviewConfidenceText: ["保存・復元用", "軽い"],
  deepResearchReviewIssuesText: ["保存・復元用", "軽い"],
  deepResearchReviewHandoffText: ["保存・復元用", "軽い"],
  deepResearchReviewAdoptionConditionsText: ["保存・復元用", "軽い"],
  deepResearchReviewUsableText: ["保存・復元用", "軽い"]
};

function applyExitCardMetadata() {
  Object.entries(exitCardMetadata).forEach(([textId, tags]) => {
    const body = document.getElementById(textId);
    const card = body?.closest(".review-complete-card");
    if (!body || !card || card.querySelector(".exit-card-tags")) return;
    const tagWrap = document.createElement("div");
    tagWrap.className = "exit-card-tags";
    tags.forEach((tag, index) => {
      const span = document.createElement("span");
      span.className = index === 0 ? "exit-card-tag recommended" : "exit-card-tag";
      span.textContent = tag;
      tagWrap.appendChild(span);
    });
    const hint = Array.from(card.children).find((child) => child.classList?.contains("hint"));
    card.insertBefore(tagWrap, hint ? hint.nextSibling : body);
  });
}

function resetExitCardDisclosureState(panel) {
  if (!panel) return;
  panel.querySelectorAll(".collapsible-exit-card").forEach((card) => {
    delete card.dataset.exitDisclosureInitialized;
  });
}

function applyExitCardDisclosuresForPanel(panel, openTextIds, displayOrder = null) {
  if (!panel || panel.hidden) return;
  panel.querySelectorAll(".review-complete-card").forEach((card) => {
    const body = card.querySelector(".review-complete-text");
    if (!body || !body.id) return;
    if (displayOrder && displayOrder.has(body.id)) {
      card.style.order = String(displayOrder.get(body.id));
    }
    const header = ensureExitCardHeader(card);
    if (!header) return;
    card.classList.add("collapsible-exit-card");
    let toggle = card.querySelector(".exit-card-toggle-button");
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "exit-card-toggle-button compact";
      toggle.setAttribute("aria-controls", body.id);
      toggle.addEventListener("click", () => {
        setExitCardCollapsed(card, !card.classList.contains("is-collapsed"));
      });
      const actions = header.querySelector(".exit-card-actions");
      if (actions) {
        actions.insertBefore(toggle, actions.firstChild);
      } else {
        const firstButton = header.querySelector("button");
        header.insertBefore(toggle, firstButton || null);
      }
    }
    if (card.dataset.exitDisclosureInitialized !== "true") {
      setExitCardCollapsed(card, !openTextIds.has(body.id));
      card.dataset.exitDisclosureInitialized = "true";
    } else {
      setExitCardCollapsed(card, card.classList.contains("is-collapsed"));
    }
  });
}

function ensureExitCardHeader(card) {
  const existingHeader = card.querySelector(".exit-card-header");
  if (existingHeader) return existingHeader;
  const heading = card.querySelector("h3");
  if (!heading) return null;
  const header = document.createElement("div");
  header.className = "exit-card-header";
  heading.parentNode.insertBefore(header, heading);
  header.appendChild(heading);
  return header;
}

function setExitCardCollapsed(card, collapsed) {
  card.classList.toggle("is-collapsed", collapsed);
  const toggle = card.querySelector(".exit-card-toggle-button");
  if (!toggle) return;
  toggle.textContent = collapsed ? "開く" : "閉じる";
  toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
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

function generatePrompt(stepNumber, topicCard, answers, steeringNotes) {
  const step = getSteps()[stepNumber - 1];
  if (state.promptContextMode === "light") {
    return generateLightPrompt(stepNumber, step, answers);
  }
  return generateFullPrompt(stepNumber, topicCard, answers, steeringNotes);
}

function generateFullPrompt(stepNumber, topicCard, answers, steeringNotes) {
  const step = getSteps()[stepNumber - 1];
  const meetingLog = buildMeetingLogBefore(answers, steeringNotes, stepNumber) || "まだ会議ログはありません。";
  const deepResearchDecisionLedgerBlock = state.mode === "deepResearchPrompt" ? `

${buildDecisionLedgerPromptBlock(stepNumber, answers, steeringNotes)}

${buildDeepResearchDecisionLedgerOutputRule()}` : "";
  const deepResearchReviewArtifactBlock = state.mode === "deepResearchReview" ? `

## Deep Research review共通出力
各Stepの最後に、必ず以下を含めてください。

### 成果物更新
このStepで更新されたレビュー成果物、対応表、改訂案、判定、追加調査案を簡潔に示してください。

### Issue / 未解決論点
残っている問題、根拠が弱い点、危険な内容、追加確認が必要な点を重要度つきで整理してください。

### 次Stepへの引き継ぎ
次の担当AIが前提にすべき内容、採用してよい内容、保留すべき内容、見落としてはいけない制約を明示してください。` : "";
  return `あなたはAI会議室の ${step.role}です。

## 会議モード
${modeLabels[state.mode] || modeLabels.basic}

## 議題カード
${topicCard.trim() || "# 議題\\n"}
${deepResearchDecisionLedgerBlock}

## これまでの会議ログ
${meetingLog}

## 今回の担当
${step.role} - ${step.title}

## 指示
${step.instruction}${deepResearchReviewArtifactBlock}

## 注意
${step.note}`;
}

function generateLightPrompt(stepNumber, step, answers) {
  if (state.mode === "deepResearchReview") {
    return generateDeepResearchReviewLightPrompt(stepNumber, step, answers);
  }
  return generateGenericLightPrompt(stepNumber, step, answers);
}

function generateGenericLightPrompt(stepNumber, step, answers) {
  const previousAnswer = stepNumber > 1 ? String(answers[String(stepNumber - 1)] || "").trim() : "";
  const fallbackHandoff = "前Stepの引き継ぎは未抽出です。直前の会議ログを参照して続けてください。";
  const handoff = extractMarkdownSubsection(previousAnswer, ["次Stepへの引き継ぎ", "次Stepへの入力", "次アクション", "次に確認すべきこと"]) || fallbackHandoff;
  const issues = extractMarkdownSubsection(previousAnswer, ["Issue / 未解決論点", "未解決Issue", "未解決論点", "残論点", "保留論点"]) || fallbackHandoff;
  const artifact = extractMarkdownSubsection(previousAnswer, ["成果物更新", "採用案", "暫定結論", "最終結論", "結論"]) || fallbackHandoff;
  const deepResearchDecisionLedgerBlock = state.mode === "deepResearchPrompt" ? `

${buildDecisionLedgerPromptBlock(stepNumber, answers, state.steeringNotes)}

${buildDeepResearchDecisionLedgerOutputRule()}` : "";

  return `このプロンプトは、同じチャットスレッド内で前の会議ログが共有されている前提の軽量版です。新規チャット、別AI、別モデルに渡す場合は完全版を使ってください。
前の会議ログを前提に続けてください。

## 会議モード
${modeLabels[state.mode] || modeLabels.basic}
${deepResearchDecisionLedgerBlock}

## 今回の担当
${step.role} - ${step.title}

## 前Stepからの引き継ぎ
${handoff}

## 前Stepの主な論点
${issues}

## 前Stepの成果物・結論
${artifact}

## 指示
${step.instruction}

## 注意
${step.note}

## 出力上の注意
- 同じ内容の繰り返しを避け、今回Stepの役割に集中してください。
- 必要な判断、修正、次アクションを明確にしてください。
- 次のStepがある場合は、引き継ぐべき前提や未解決論点を最後に短く整理してください。`;
}

function generateDeepResearchReviewLightPrompt(stepNumber, step, answers) {
  const previousAnswer = stepNumber > 1 ? String(answers[String(stepNumber - 1)] || "").trim() : "";
  const fallbackHandoff = "前Stepの引き継ぎは未抽出です。直前の会議ログを参照して続けてください。";
  const handoff = extractMarkdownSubsection(previousAnswer, ["次Stepへの引き継ぎ", "次Stepへの入力"]) || fallbackHandoff;
  const issues = extractMarkdownSubsection(previousAnswer, ["Issue / 未解決論点", "未解決Issue", "未解決論点"]) ||
    fallbackHandoff;
  const artifact = extractMarkdownSubsection(previousAnswer, ["成果物更新"]) ||
    fallbackHandoff;
  const finalJudgeSummary = step.role.includes("Final Judge") ? buildDeepResearchReviewArtifactSummary(answers, stepNumber) : "";
  const finalJudgeSummaryBlock = finalJudgeSummary ? `

## これまでの判定サマリ
Final Judge は最終判断のため、軽量版でも各Stepの成果物更新を集約して参照してください。
${finalJudgeSummary}` : "";

  const artifactBlock = `

## 前Stepの成果物更新
${artifact}${finalJudgeSummaryBlock}`;

  return `このプロンプトは、同じチャットスレッド内で前の会議ログが共有されている前提の軽量版です。新規チャット、別AI、別モデルに渡す場合は完全版を使ってください。
前の会議ログを前提に続けてください。

## 今回の担当
${step.role}

## 前Stepからの引き継ぎ
${handoff}

## 未解決Issue
${issues}${artifactBlock}

## 指示
${step.instruction}

## 共通安全制約カプセル
- 調査結果を無批判に採用しない
- 情報源と根拠レベルを確認する
- 主張と根拠の対応を見る
- 根拠の弱い情報を推奨扱いしない
- 危険な内容と採用できる内容を分ける
- 高リスク領域では安全性を優先する
- 必要なら追加Deep Researchプロンプト案を作る
- Deep Research結果を単なる要約で終わらせず、検証して成果物に変換する

## 共通出力
最後に必ず以下を含めてください。

### 成果物更新
このStepで更新されたレビュー成果物、対応表、改訂案、判定を簡潔に示してください。

### Issue / 未解決論点
残っている問題、懸念、追加確認が必要な点を重要度つきで整理してください。

### 次Stepへの引き継ぎ
次の担当AIが前提にすべき内容、採用してよい内容、保留すべき内容、見落としてはいけない制約を明示してください。

## 注意
${step.note}`;
}

function buildDeepResearchReviewArtifactSummary(answers, beforeStep) {
  const steps = getStepsForMode("deepResearchReview");
  const parts = [];
  const maxStep = Math.min(beforeStep - 1, steps.length);
  for (let i = 1; i <= maxStep; i += 1) {
    const answer = String(answers[String(i)] || "").trim();
    if (!answer) continue;
    const artifact = extractMarkdownSubsection(answer, ["成果物更新"]);
    if (!artifact) continue;
    const step = steps[i - 1];
    parts.push(`### Step ${i}: ${step ? step.role : "Step"}\n${artifact}`);
  }
  return parts.join("\n\n") || "これまでの成果物更新は未抽出です。直前までの会議ログを参照して最終判断してください。";
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
  if (state.mode === "deepResearchReview" && state.deepResearchReviewImportedFinalAnswer) {
    state.deepResearchReviewImportedFinalAnswer = "";
  }
  state.answers[String(state.currentStep)] = answer;
  saveCurrentSteeringNote();
  if (state.currentStep < totalSteps) {
    state.currentStep += 1;
    setStatus(els.answerStatus, "回答を保存しました。次Stepのプロンプトを生成しました。");
  } else {
    if (state.mode === "deepResearchReview") state.reviewResultsCollapsed = false;
    setStatus(els.answerStatus, `Step ${totalSteps}を保存しました。会議完了です。`);
  }
  persist();
  render();
  scrollAfterAnswerSave();
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

function scrollAfterAnswerSave() {
  const target = isComplete()
    ? (state.mode === "deepResearchReview"
      ? els.deepResearchReviewCompletePanel
      : (state.mode === "deepResearchPrompt" ? els.deepResearchCopyPanel : els.markdownPanel))
    : els.promptPanel;
  scrollToElement(target);
}

function scrollToElement(el) {
  if (!el) return;
  window.requestAnimationFrame(() => {
    el.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

async function copyAndOpen(service) {
  const ok = await copyText(els.promptText.value, els.promptText, els.copyStatus, false);
  if (!ok) {
    setStatus(els.copyStatus, "コピーに失敗しました。先に手動でプロンプトをコピーしてください。", "error");
    return;
  }
  window.open(aiUrls[service], "_blank", "noopener,noreferrer");
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

function flashCopyButton(button) {
  if (!(button instanceof HTMLButtonElement)) return;
  if (!button.closest(".review-complete-card")) return;
  const previousText = button.textContent;
  button.textContent = "コピーしました";
  button.classList.add("copy-success");
  window.setTimeout(() => {
    if (!button.isConnected) return;
    button.textContent = previousText;
    button.classList.remove("copy-success");
  }, 1400);
}

async function copyPlainText(text, statusEl, successMessage) {
  const activeButton = document.activeElement;
  const buffer = document.createElement("textarea");
  buffer.value = text;
  buffer.setAttribute("readonly", "");
  buffer.style.position = "fixed";
  buffer.style.left = "-9999px";
  buffer.style.top = "0";
  document.body.appendChild(buffer);
  const ok = await copyText(text, buffer, statusEl, false);
  document.body.removeChild(buffer);
  if (ok) {
    setStatus(statusEl, successMessage || "コピーしました");
    flashCopyButton(activeButton);
  }
  return ok;
}

function getDeepResearchReviewFinalAnswer() {
  const imported = String(state.deepResearchReviewImportedFinalAnswer || "").trim();
  if (state.mode === "deepResearchReview" && imported) return imported;
  const finalStep = String(getTotalSteps());
  return String(state.answers[finalStep] || "").trim();
}

function normalizeMarkdownHeading(line) {
  return String(line || "")
    .trim()
    .replace(/^#{1,6}\s*/, "")
    .replace(/\s*[:：]\s*$/, "")
    .trim();
}

function getMarkdownHeadingLevel(line) {
  const match = String(line || "").match(/^(#{1,6})\s+/);
  return match ? match[1].length : 0;
}

function extractAiBoardBlock(text, key) {
  const source = String(text || "");
  const startMarker = `<!-- AI_BOARD:${key}:START -->`;
  const endMarker = `<!-- AI_BOARD:${key}:END -->`;
  const startIndex = source.indexOf(startMarker);
  if (startIndex < 0) return "";
  const contentStart = startIndex + startMarker.length;
  const endIndex = source.indexOf(endMarker, contentStart);
  if (endIndex < 0) return "";
  return source.slice(contentStart, endIndex).trim();
}

function extractMarkdownSubsection(text, aliases) {
  const lines = String(text || "").split(/\r?\n/);
  let startIndex = -1;
  let startLevel = 0;
  for (let i = 0; i < lines.length; i += 1) {
    const normalized = normalizeMarkdownHeading(lines[i]);
    if (aliases.includes(normalized)) {
      startIndex = i;
      startLevel = getMarkdownHeadingLevel(lines[i]) || 3;
      break;
    }
  }
  if (startIndex < 0) return "";
  const body = [];
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const level = getMarkdownHeadingLevel(lines[i]);
    if (level && level <= startLevel) break;
    body.push(lines[i]);
  }
  return body.join("\n").trim();
}

const researchBriefRequiredSections = [
  "Executive Summary",
  "Research Question",
  "Key Findings",
  "Claim / Evidence Table",
  "Source Quality",
  "Risk / Safety Notes",
  "What Can Be Used",
  "What Cannot Be Used",
  "Open Questions",
  "Next Research Prompts",
  "Decision Ledger",
  "Answer Ledger"
];

function hasResearchBriefSections(text) {
  const headings = new Set(
    String(text || "")
      .split(/\r?\n/)
      .map((line) => normalizeMarkdownHeading(line))
      .filter(Boolean)
  );
  return researchBriefRequiredSections.every((section) => headings.has(section));
}

function createEmptyDecisionLedger() {
  return deepResearchDecisionLedgerFields.reduce((ledger, field) => {
    ledger[field.key] = [];
    return ledger;
  }, {});
}

function getDecisionLedgerLabelMap() {
  const map = deepResearchDecisionLedgerFields.reduce((result, field) => {
    result[field.label] = field.key;
    return result;
  }, {});
  Object.assign(map, {
    "対象読者": "primaryAudience",
    "読者": "primaryAudience",
    "主な読者": "primaryAudience",
    "メイン読者": "primaryAudience",
    "副読者": "secondaryAudience",
    "補助読者": "secondaryAudience",
    "専門性": "expertiseLevel",
    "専門レベル": "expertiseLevel",
    "専門度": "expertiseLevel",
    "外部公開": "publicExposure",
    "公開範囲": "publicExposure",
    "後続調査": "followUp",
    "後続調査項目": "followUp",
    "深掘り項目": "deepDive"
  });
  return map;
}

function splitDecisionLedgerValues(value) {
  return String(value || "")
    .replace(/^[-*]\s*/, "")
    .split(/\s*(?:\/|、|,|，|\n)\s*/u)
    .map((item) => item.trim())
    .filter((item) => item && !/^(未確定|未入力|要確認|なし|該当なし)$/u.test(item));
}

function normalizeLooseText(text) {
  return String(text || "").trim().toLowerCase();
}

function isAffirmativeAnswer(text) {
  return /^(?:はい|yes|y|ok|okay|了解|それでok|そのまま|すべてok|全部ok|問題ない|よい|良い)$/iu.test(normalizeLooseText(text));
}

function isNegativeAnswer(text) {
  return /^(?:いいえ|no|n|違う|ちがう|不可|だめ|ダメ)$/iu.test(normalizeLooseText(text));
}

function parseQuestionBlock(block, type) {
  const questions = [];
  const lines = String(block || "").split(/\r?\n/);
  let fallbackNumber = 1;
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || /^#+\s*/.test(trimmed)) return;
    const numbered = trimmed.match(/^(?:[-*]\s*)?(?:Q)?(\d+)\s*[.)）．:：、-]?\s*(.+)$/iu);
    if (numbered) {
      questions.push({
        number: Number(numbered[1]),
        text: numbered[2].trim(),
        type
      });
      fallbackNumber = Math.max(fallbackNumber, Number(numbered[1]) + 1);
      return;
    }
    const bullet = trimmed.match(/^[-*]\s*(.+)$/u);
    if (bullet) {
      questions.push({
        number: fallbackNumber,
        text: bullet[1].trim(),
        type
      });
      fallbackNumber += 1;
    }
  });
  return questions;
}

function extractConfirmationQuestions(answer) {
  const block = extractMarkdownSubsection(answer, ["ユーザーへの確認質問"]);
  if (!block) return [];
  const required = extractMarkdownSubsection(block, ["必須確認"]) || "";
  const optional = extractMarkdownSubsection(block, ["任意確認"]) || "";
  const questions = [
    ...parseQuestionBlock(required, "必須確認"),
    ...parseQuestionBlock(optional, "任意確認")
  ];
  if (questions.length) return questions;
  return parseQuestionBlock(block, "確認質問");
}

function findQuestionsForSteeringStep(answers = {}, stepNumber) {
  for (let i = stepNumber - 1; i >= 1; i -= 1) {
    const questions = extractConfirmationQuestions(answers[String(i)] || "");
    if (questions.length) return questions;
  }
  const sameStepQuestions = extractConfirmationQuestions(answers[String(stepNumber)] || "");
  return sameStepQuestions;
}

function getQuestionByNumber(questions, number) {
  return questions.find((question) => question.number === Number(number));
}

function addAnswerLedgerEntry(entries, question, answer, sourceStep) {
  if (!question || !String(answer || "").trim()) return;
  const normalizedAnswer = String(answer).trim();
  const exists = entries.some((entry) =>
    entry.sourceStep === sourceStep &&
    entry.number === question.number &&
    entry.answer === normalizedAnswer
  );
  if (exists) return;
  entries.push({
    sourceStep,
    number: question.number,
    question: question.text,
    type: question.type,
    answer: normalizedAnswer
  });
}

function expandQuestionNumberRange(start, end) {
  const from = Number(start);
  const to = Number(end);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return [];
  const min = Math.min(from, to);
  const max = Math.max(from, to);
  return Array.from({ length: max - min + 1 }, (_, index) => min + index);
}

function parseSteeringAnswersAgainstQuestions(note, questions, sourceStep) {
  const entries = [];
  const text = String(note || "").trim();
  if (!text || !questions.length) return entries;

  if (/^(?:それでOK|そのまま|全部OK|すべてOK|すべてyes|全部yes|了解|OK)$/iu.test(text)) {
    questions.forEach((question) => addAnswerLedgerEntry(entries, question, "はい。提示案で進める。", sourceStep));
    return entries;
  }

  const rangePattern = /(\d+)\s*[〜~\-－]\s*(\d+)\s*(?:は|を|も|すべて|全部)?\s*(yes|はい|ok|OK|了解|除外|初回から|後続|不要|なし)?/giu;
  let rangeMatch;
  while ((rangeMatch = rangePattern.exec(text)) !== null) {
    const answer = rangeMatch[3] || "はい";
    expandQuestionNumberRange(rangeMatch[1], rangeMatch[2]).forEach((number) => {
      addAnswerLedgerEntry(entries, getQuestionByNumber(questions, number), answer, sourceStep);
    });
  }

  const singlePattern = /(?:^|[\s\n,、。])(?:Q)?(\d+)\s*(?:は|を|:|：)?\s*([^\n,、。]+)/giu;
  let singleMatch;
  while ((singleMatch = singlePattern.exec(text)) !== null) {
    const answer = singleMatch[2].trim();
    if (/^\d+\s*[〜~\-－]/u.test(singleMatch[0])) continue;
    addAnswerLedgerEntry(entries, getQuestionByNumber(questions, singleMatch[1]), answer, sourceStep);
  }

  return entries;
}

function buildAnswerLedger(answers = {}, steeringNotes = {}, upToStepNumber) {
  const entries = [];
  const maxStep = Math.max(0, Math.min(upToStepNumber, getStepsForMode("deepResearchPrompt").length));
  for (let i = 1; i <= maxStep; i += 1) {
    const note = String(steeringNotes[String(i)] || "").trim();
    if (!note) continue;
    const questions = findQuestionsForSteeringStep(answers, i);
    parseSteeringAnswersAgainstQuestions(note, questions, i).forEach((entry) => entries.push(entry));
  }
  return entries;
}

function formatAnswerLedger(entries) {
  if (!entries.length) return "- 未抽出";
  return entries
    .map((entry) => `- Q${entry.number}: ${entry.question}\n  A${entry.number}: ${entry.answer}`)
    .join("\n");
}

function inferDecisionLedgerFromAnswerLedger(entries) {
  const ledger = createEmptyDecisionLedger();
  entries.forEach((entry) => {
    const question = entry.question || "";
    const answer = entry.answer || "";
    const combined = `${question} ${answer}`;
    const affirmative = isAffirmativeAnswer(answer) || /^(?:はい|yes|ok|OK|了解)/u.test(answer);
    const negative = isNegativeAnswer(answer);

    if (/漢方医/u.test(combined)) addDecisionLedgerValue(ledger, "primaryAudience", "漢方医");
    else if (/医師/u.test(combined) && !negative) addDecisionLedgerValue(ledger, "primaryAudience", "医師");
    if (/薬剤師/u.test(combined) && !negative) addDecisionLedgerValue(ledger, "secondaryAudience", "薬剤師");
    if (/漢方相談員|相談員/u.test(combined) && !negative) addDecisionLedgerValue(ledger, "secondaryAudience", "漢方相談員");
    if (/漢方薬局スタッフ|薬局スタッフ/u.test(combined) && !negative) addDecisionLedgerValue(ledger, "secondaryAudience", "漢方薬局スタッフ");
    if (/内部研修担当者|研修担当/u.test(combined) && !negative) addDecisionLedgerValue(ledger, "secondaryAudience", "内部研修担当者");
    if (/専門度|専門性|上級|上級者|専門職向け|高度/u.test(combined)) {
      if (/上級|上級者|専門職向け|高度/u.test(combined)) addDecisionLedgerValue(ledger, "expertiseLevel", "上級者向け");
      else if (/中級/u.test(combined)) addDecisionLedgerValue(ledger, "expertiseLevel", "中級者向け");
    }

    if (/内部資料|内部研修|社内資料|院内資料/u.test(combined)) {
      addDecisionLedgerValue(ledger, "use", "内部学習・相談準備用");
      addDecisionLedgerValue(ledger, "publicExposure", "外部公開しない");
      addDecisionLedgerValue(ledger, "excludedScope", "患者配布 / Web公開 / 販売促進");
    }
    if (/外部.*出さない|外部公開.*しない|公開しない|外部には出さない/u.test(combined)) {
      addDecisionLedgerValue(ledger, "publicExposure", "外部公開しない");
      addDecisionLedgerValue(ledger, "excludedScope", "患者配布 / Web公開 / 販売促進");
    }
    if (/患者配布|Web公開|販売促進/u.test(question) && (affirmative || /除外|しない|なし|不要/u.test(answer))) {
      addDecisionLedgerValue(ledger, "excludedScope", "患者配布 / Web公開 / 販売促進");
    }

    if (/処方|生薬|証|クラスター|病態/u.test(combined)) {
      if (/初回|最初から|初回から/u.test(answer) || (/初回/u.test(question) && affirmative)) {
        addDecisionLedgerValue(ledger, "initialScope", "医学的基礎 / 安全確認 / 症状クラスター / 漢方病態 / 代表処方群・生薬候補の概観");
        addDecisionLedgerValue(ledger, "deepDive", "安全確認 / 受診勧奨 / 相談者分類 / 症状クラスター / 問診項目 / 漢方医学的病態 / 証 / 処方群 / 生薬 / 処方意図");
        addDecisionLedgerValue(ledger, "followUp", "方剤別PMDA・添付文書照合 / 症例報告網羅 / エビデンス評価");
      } else if (/後続|追加調査|次回/u.test(question) && affirmative) {
        addDecisionLedgerValue(ledger, "followUp", "処方・生薬・証・症状クラスター整理");
      } else {
        addDecisionLedgerValue(ledger, "deepDive", "処方・生薬・証・症状クラスター整理");
      }
    }
    if (/除外/u.test(answer) && /病名処方|処方ランキング|患者配布|Web公開|販売促進|服薬変更/u.test(question)) {
      addDecisionLedgerValue(ledger, "excludedScope", question);
    }
  });
  return normalizeDecisionLedger(ledger);
}

function addDecisionLedgerValue(ledger, key, value) {
  if (!ledger[key]) ledger[key] = [];
  splitDecisionLedgerValues(value).forEach((item) => {
    if (!ledger[key].includes(item)) ledger[key].push(item);
  });
}

function mergeDecisionLedgers(base, next) {
  const merged = createEmptyDecisionLedger();
  deepResearchDecisionLedgerFields.forEach((field) => {
    [...(base[field.key] || []), ...(next[field.key] || [])].forEach((item) => {
      addDecisionLedgerValue(merged, field.key, item);
    });
  });
  return normalizeDecisionLedger(merged);
}

function normalizeDecisionLedger(ledger) {
  const normalized = createEmptyDecisionLedger();
  deepResearchDecisionLedgerFields.forEach((field) => {
    (ledger[field.key] || []).forEach((item) => addDecisionLedgerValue(normalized, field.key, item));
  });

  normalized.primaryAudience = normalized.primaryAudience.map((item) => {
    if (/漢方医/u.test(item)) return "漢方医";
    if (/医師/u.test(item)) return "医師";
    if (/一般/u.test(item)) return "一般ユーザー";
    return item.replace(/向け$/u, "");
  });
  normalized.secondaryAudience = normalized.secondaryAudience.map((item) => {
    if (/薬剤師/u.test(item)) return "薬剤師";
    if (/漢方相談員|相談員/u.test(item)) return "漢方相談員";
    if (/漢方薬局スタッフ|薬局スタッフ/u.test(item)) return "漢方薬局スタッフ";
    if (/内部研修担当者|研修担当/u.test(item)) return "内部研修担当者";
    return item.replace(/向け$/u, "");
  });
  normalized.expertiseLevel = normalized.expertiseLevel.map((item) => {
    if (/上級|専門職|高度/u.test(item)) return "上級者向け";
    if (/中級/u.test(item)) return "中級者向け";
    if (/初級|初心者|一般/u.test(item)) return "初学者・一般向け";
    return item;
  });
  deepResearchDecisionLedgerFields.forEach((field) => {
    normalized[field.key] = [...new Set(normalized[field.key])];
  });

  if (normalized.publicExposure.includes("外部公開しない")) {
    addDecisionLedgerValue(normalized, "excludedScope", "患者配布 / Web公開 / 販売促進");
  }
  if (normalized.primaryAudience.includes("漢方医")) {
    normalized.secondaryAudience = normalized.secondaryAudience.filter((item) => item !== "漢方医" && item !== "漢方医向け");
    if (normalized.use.some((item) => /内部/u.test(item))) {
      addDecisionLedgerValue(normalized, "secondaryAudience", "薬剤師 / 漢方相談員 / 漢方薬局スタッフ / 内部研修担当者");
    }
  }
  if (normalized.use.some((item) => /内部資料|内部学習|内部研修|相談準備/u.test(item))) {
    addDecisionLedgerValue(normalized, "use", "内部学習・相談準備用");
    addDecisionLedgerValue(normalized, "publicExposure", "外部公開しない");
    addDecisionLedgerValue(normalized, "excludedScope", "患者配布 / Web公開 / 販売促進");
  }

  const hasFormulaOverview = normalized.initialScope.some((item) =>
    /代表処方群|処方.*生薬|症状クラスター|漢方病態/u.test(item)
  );
  if (hasFormulaOverview) {
    normalized.followUp = normalized.followUp.filter((item) =>
      !/処方.*生薬.*証.*(?:クラスター|症状クラスター)|症状クラスター.*処方|代表処方群.*概観/u.test(item)
    );
  }

  return normalized;
}

function parseDecisionLedgerBlock(text) {
  const ledger = createEmptyDecisionLedger();
  const block = extractMarkdownSubsection(text, [
    "確定済み条件 / Decision Ledger",
    "Decision Ledger",
    "確定済み条件"
  ]);
  if (!block) return ledger;

  const labelMap = getDecisionLedgerLabelMap();
  block.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const match = trimmed.match(/^(?:[-*]\s*)?([^:：|]+?)\s*[:：|]\s*(.+)$/u);
    if (!match) return;
    const label = match[1].trim().replace(/^#+\s*/, "");
    const key = labelMap[label];
    if (!key) return;
    addDecisionLedgerValue(ledger, key, match[2]);
  });

  return normalizeDecisionLedger(ledger);
}

function inferDecisionLedgerFromSteering(note) {
  const ledger = createEmptyDecisionLedger();
  const text = String(note || "").trim();
  if (!text) return ledger;

  if (/漢方医/u.test(text)) addDecisionLedgerValue(ledger, "primaryAudience", "漢方医");
  else if (/医師/u.test(text)) addDecisionLedgerValue(ledger, "primaryAudience", "医師");
  if (/薬剤師/u.test(text)) addDecisionLedgerValue(ledger, "secondaryAudience", "薬剤師");
  if (/漢方相談員|相談員/u.test(text)) addDecisionLedgerValue(ledger, "secondaryAudience", "漢方相談員");
  if (/漢方薬局スタッフ|薬局スタッフ/u.test(text)) addDecisionLedgerValue(ledger, "secondaryAudience", "漢方薬局スタッフ");
  if (/内部研修担当者|研修担当/u.test(text)) addDecisionLedgerValue(ledger, "secondaryAudience", "内部研修担当者");
  if (/一般(?:ユーザー|患者|向け)/u.test(text)) addDecisionLedgerValue(ledger, "primaryAudience", "一般ユーザー");
  if (/専門度|専門性|上級|上級者|専門職向け|高度/u.test(text)) {
    if (/上級|上級者|専門職向け|高度/u.test(text)) addDecisionLedgerValue(ledger, "expertiseLevel", "上級者向け");
    else if (/中級/u.test(text)) addDecisionLedgerValue(ledger, "expertiseLevel", "中級者向け");
    else if (/初級|初心者|一般向け/u.test(text)) addDecisionLedgerValue(ledger, "expertiseLevel", "初学者・一般向け");
  }

  if (/内部資料|内部研修|社内資料|院内資料/u.test(text)) {
    addDecisionLedgerValue(ledger, "use", "内部学習・相談準備用");
    addDecisionLedgerValue(ledger, "publicExposure", "外部公開しない");
    addDecisionLedgerValue(ledger, "excludedScope", "患者配布 / Web公開 / 販売促進");
  }
  if (/患者配布/u.test(text) && /除外|しない|ではない|不要/u.test(text)) addDecisionLedgerValue(ledger, "excludedScope", "患者配布");
  if (/Web公開|外部公開/u.test(text) && /除外|しない|ではない|不要/u.test(text)) addDecisionLedgerValue(ledger, "excludedScope", "Web公開");
  if (/販売促進/u.test(text) && /除外|しない|ではない|不要/u.test(text)) addDecisionLedgerValue(ledger, "excludedScope", "販売促進");

  if (/医学的基礎|安全確認/u.test(text)) addDecisionLedgerValue(ledger, "initialScope", "医学的基礎 / 安全確認");
  if (/初回|最初から|初回から|3\s*(?:は|を)?\s*(?:できれば|可能なら)?\s*初回/u.test(text)) {
    if (/処方|生薬|証|クラスター|病態/u.test(text) || /3\s*(?:は|を)?\s*(?:できれば|可能なら)?\s*初回/u.test(text)) {
      addDecisionLedgerValue(ledger, "initialScope", "医学的基礎 / 安全確認 / 症状クラスター / 漢方病態 / 代表処方群・生薬候補の概観");
      addDecisionLedgerValue(ledger, "deepDive", "安全確認 / 受診勧奨 / 相談者分類 / 症状クラスター / 問診項目 / 漢方医学的病態 / 証 / 処方群 / 生薬 / 処方意図");
      addDecisionLedgerValue(ledger, "followUp", "方剤別PMDA・添付文書照合 / 症例報告網羅 / エビデンス評価");
    }
  } else if (/処方|生薬|証|クラスター|病態/u.test(text)) {
    if (/追加調査|後続|次回|候補/u.test(text)) {
      addDecisionLedgerValue(ledger, "deepDive", "処方・生薬・証・症状クラスター整理");
      addDecisionLedgerValue(ledger, "followUp", "処方・生薬・証・症状クラスター整理");
    } else {
      addDecisionLedgerValue(ledger, "deepDive", "処方・生薬・証・症状クラスター整理");
    }
  }

  if (/方剤別|PMDA|添付文書/u.test(text)) addDecisionLedgerValue(ledger, "followUp", "方剤別PMDA・添付文書照合");
  if (/症例報告/u.test(text)) addDecisionLedgerValue(ledger, "followUp", "症例報告網羅");
  if (/エビデンス|RCT|レビュー論文|システマティックレビュー/u.test(text)) addDecisionLedgerValue(ledger, "followUp", "エビデンス評価");
  if (/病名処方|処方ランキング|治癒保証|標準治療否定|服薬変更指示/u.test(text)) {
    addDecisionLedgerValue(ledger, "excludedScope", "病名処方 / 処方ランキング / 治癒保証 / 標準治療否定 / 服薬変更指示");
  }

  return normalizeDecisionLedger(ledger);
}

function buildDecisionLedger(answers = {}, steeringNotes = {}, upToStepNumber) {
  let ledger = createEmptyDecisionLedger();
  ledger = mergeDecisionLedgers(ledger, inferDecisionLedgerFromAnswerLedger(buildAnswerLedger(answers, steeringNotes, upToStepNumber)));
  const maxStep = Math.max(0, Math.min(upToStepNumber, getStepsForMode("deepResearchPrompt").length));
  for (let i = 1; i <= maxStep; i += 1) {
    ledger = mergeDecisionLedgers(ledger, parseDecisionLedgerBlock(answers[String(i)] || ""));
    ledger = mergeDecisionLedgers(ledger, inferDecisionLedgerFromSteering(steeringNotes[String(i)] || ""));
  }
  return normalizeDecisionLedger(ledger);
}

function hasDecisionLedgerValue(ledger) {
  return deepResearchDecisionLedgerFields.some((field) => (ledger[field.key] || []).length);
}

function formatDecisionLedger(ledger) {
  const normalized = normalizeDecisionLedger(ledger || createEmptyDecisionLedger());
  return deepResearchDecisionLedgerFields
    .map((field) => `- ${field.label}: ${(normalized[field.key] || []).join(" / ") || "未確定"}`)
    .join("\n");
}

function buildDecisionLedgerPromptBlock(stepNumber, answers, steeringNotes) {
  const answerLedger = buildAnswerLedger(answers, steeringNotes, stepNumber);
  const ledger = buildDecisionLedger(answers, steeringNotes, stepNumber);
  const status = hasDecisionLedgerValue(ledger)
    ? "以下はユーザーの軌道修正メモや過去Stepで確定した条件です。前Stepの引き継ぎより優先してください。"
    : "まだ確定済み条件はありません。今回Stepでユーザーの軌道修正メモや確定条件があれば必ず更新してください。";
  return `## 回答済み質問 / Answer Ledger
直前までの確認質問とユーザーの省略回答を対応づけた一覧です。
${formatAnswerLedger(answerLedger)}

## 確定済み条件 / Decision Ledger
${status}
${formatDecisionLedger(ledger)}`;
}

function buildDeepResearchDecisionLedgerOutputRule() {
  return `## Deep Research設計 Decision Ledger ルール
ユーザーの軌道修正メモは、以後のStepで必ず守る確定条件として扱ってください。
Decision Ledgerは前Stepの引き継ぎより優先します。
回答済み・確定済みの項目は「ユーザーへの確認質問」で再質問しないでください。
矛盾がある場合は、Decision Ledgerを優先して修正してください。
主読者・副読者・専門度は必ず分けて扱ってください。主読者が「漢方医」の場合、薬剤師・漢方相談員・漢方薬局スタッフは副読者として扱い、主読者として横並びにしないでください。

各Stepの回答末尾には、必ず以下を含めてください。

### 成果物更新
このStepで更新した調査設計成果物を示してください。

### 回答済み質問 / Answer Ledger
ユーザーが番号や省略表現で回答した確認質問を、Q番号・質問本文・回答の形で整理してください。回答済みの質問は再質問しないでください。

### 確定済み条件 / Decision Ledger
- 主読者:
- 副読者:
- 専門度:
- 用途:
- 外部公開の有無:
- 初回調査範囲:
- 除外範囲:
- 深掘りする項目:
- 後続調査に回す項目:

### 次Stepへの引き継ぎ
次Stepに渡す前提を示してください。ただしDecision Ledgerと矛盾する内容は書かないでください。`;
}

function extractDeepResearchReviewSection(text, aliases) {
  const lines = String(text || "").split(/\r?\n/);
  let startIndex = -1;
  let matchedHeading = "";
  let startLevel = 0;
  for (let i = 0; i < lines.length; i += 1) {
    const normalized = normalizeMarkdownHeading(lines[i]);
    if (aliases.includes(normalized)) {
      startIndex = i;
      matchedHeading = normalized;
      startLevel = getMarkdownHeadingLevel(lines[i]) || 2;
      break;
    }
  }
  if (startIndex < 0) return "";

  const body = [];
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    const level = getMarkdownHeadingLevel(line);
    const normalized = normalizeMarkdownHeading(line);
    const isKnownSection = deepResearchReviewCompleteSectionLabels.includes(normalized);
    if (level && level <= startLevel && normalized && normalized !== matchedHeading && isKnownSection) {
      break;
    }
    body.push(line);
  }
  return body.join("\n").trim();
}

function extractDeepResearchReviewResearchBrief(text) {
  const source = String(text || "");
  const marker = extractAiBoardBlock(source, "DR_REVIEW_RESEARCH_BRIEF");
  if (marker) return marker;
  const body = extractMarkdownSubsection(source, ["Research Brief", "研究ブリーフ"]);
  if (!body) return "";
  const candidate = `# Research Brief\n\n${body}`.trim();
  return hasResearchBriefSections(candidate) ? candidate : "";
}

function buildDeepResearchReviewCompleteParts(sourceOverride) {
  const full = sourceOverride === undefined ? getDeepResearchReviewFinalAnswer() : String(sourceOverride || "").trim();
  const parts = {
    full,
    adoption: extractAiBoardBlock(full, "DR_REVIEW_DECISION") || extractAiBoardBlock(full, "DR_REVIEW_ADOPTION") || extractDeepResearchReviewSection(full, ["採用可否"]),
    adoptionConditions: extractAiBoardBlock(full, "DR_REVIEW_CONDITIONS") || extractDeepResearchReviewSection(full, ["採用条件"]),
    usable: extractAiBoardBlock(full, "DR_REVIEW_USABLE") || extractDeepResearchReviewSection(full, ["採用できる内容"]),
    fixes: extractAiBoardBlock(full, "DR_REVIEW_FIXES") || extractDeepResearchReviewSection(full, ["修正すべき内容"]),
    dangerous: extractAiBoardBlock(full, "DR_REVIEW_RISK") || extractAiBoardBlock(full, "DR_REVIEW_DANGEROUS") || extractDeepResearchReviewSection(full, ["危険な内容", "危険なため使わない内容"]),
    sourceReview: extractAiBoardBlock(full, "DR_REVIEW_SOURCE_REVIEW") || extractDeepResearchReviewSection(full, ["情報源レビュー"]),
    claimEvidence: extractAiBoardBlock(full, "DR_REVIEW_CLAIM_EVIDENCE") || extractDeepResearchReviewSection(full, ["主張・根拠対応レビュー"]),
    gaps: extractAiBoardBlock(full, "DR_REVIEW_GAPS") || extractDeepResearchReviewSection(full, ["抜け漏れ"]),
    practicality: extractAiBoardBlock(full, "DR_REVIEW_PRACTICALITY") || extractDeepResearchReviewSection(full, ["実用性レビュー"]),
    artifact: extractAiBoardBlock(full, "DR_REVIEW_REVISED_ARTIFACT") || extractAiBoardBlock(full, "DR_REVIEW_ARTIFACT") || extractAiBoardBlock(full, "DR_REVIEW_REFINED_ARTIFACT") || extractDeepResearchReviewSection(full, ["改訂版成果物"]),
    researchBrief: extractDeepResearchReviewResearchBrief(full),
    additionalPrompt: extractAiBoardBlock(full, "DR_REVIEW_ADDITIONAL_PROMPTS") || extractAiBoardBlock(full, "DR_REVIEW_ADDITIONAL_PROMPT") || extractDeepResearchReviewSection(full, ["追加Deep Researchプロンプト案", "追加Deep Researchプロンプト"]),
    issues: extractAiBoardBlock(full, "DR_REVIEW_ISSUES") || extractDeepResearchReviewSection(full, ["Issue / 未解決論点", "未解決Issue", "未解決論点"]),
    nextActions: extractAiBoardBlock(full, "DR_REVIEW_NEXT_ACTION") || extractAiBoardBlock(full, "DR_REVIEW_NEXT_ACTIONS") || extractDeepResearchReviewSection(full, ["次アクション"]),
    confidence: extractAiBoardBlock(full, "DR_REVIEW_CONFIDENCE") || extractDeepResearchReviewSection(full, ["結論の自信度"]),
    handoff: extractAiBoardBlock(full, "DR_REVIEW_HANDOFF") || extractDeepResearchReviewSection(full, ["次Stepへの引き継ぎ", "次Stepへの入力", "引き継ぎ"])
  };
  parts.publicSafeArtifact = extractAiBoardBlock(full, "DR_REVIEW_PUBLIC_SAFE_ARTIFACT") || buildDeepResearchReviewPurposeArtifact(parts, "public");
  parts.pharmacySafetyArtifact = extractAiBoardBlock(full, "DR_REVIEW_PHARMACY_SAFETY_ARTIFACT") || buildDeepResearchReviewPurposeArtifact(parts, "pharmacy");
  parts.proInternalArtifact = extractAiBoardBlock(full, "DR_REVIEW_PRO_INTERNAL_ARTIFACT") || buildDeepResearchReviewPurposeArtifact(parts, "professional");
  parts.opinionRequest = extractAiBoardBlock(full, "DR_REVIEW_OPINION_REQUEST") || buildDeepResearchReviewOpinionRequest(parts);
  parts.handoffCard = extractAiBoardBlock(full, "DR_REVIEW_HANDOFF_CARD") || buildDeepResearchReviewHandoffCard(parts);
  return parts;
}

function getDeepResearchReviewRestoredCardLabels(parts) {
  return deepResearchReviewRestoreCardConfigs
    .filter(({ key }) => Boolean(String(parts?.[key] || "").trim()))
    .map(({ label }) => label);
}

function buildDeepResearchReviewPurposeArtifact(parts, type) {
  const configs = {
    public: {
      title: "一般向け安全変換版",
      lead: "既存の改訂版成果物・危険な内容・次アクションから、一般ユーザーに渡す前提で安全側に抜き出したfallbackです。処方名・生薬名・証の自己判断には使わないでください。",
      sections: [
        ["一般向けに使う内容", parts.artifact],
        ["危険なためそのまま出さない内容", parts.dangerous],
        ["次アクション", parts.nextActions]
      ]
    },
    pharmacy: {
      title: "薬剤師・相談員向け安全確認版",
      lead: "既存の改訂版成果物・情報源レビュー・未解決Issueから、薬歴整理、副作用確認、受診勧奨、主治医確認に使う前提で抜き出したfallbackです。",
      sections: [
        ["安全確認メモ", parts.artifact],
        ["情報源レビュー", parts.sourceReview],
        ["未解決Issue", parts.issues]
      ]
    },
    professional: {
      title: "専門職向け内部資料版",
      lead: "既存の改訂版成果物・主張根拠対応・追加調査案から、内部学習用に抜き出したfallbackです。病名処方・処方推奨・効果保証には使わないでください。",
      sections: [
        ["内部資料として使う内容", parts.artifact],
        ["主張・根拠対応レビュー", parts.claimEvidence],
        ["追加Deep Researchプロンプト案", parts.additionalPrompt]
      ]
    }
  };
  const config = configs[type] || configs.public;
  const body = config.sections
    .filter(([, value]) => String(value || "").trim())
    .map(([heading, value]) => `## ${heading}\n${String(value).trim()}`)
    .join("\n\n");
  if (!body.trim()) return "";
  return `# ${config.title}\n${config.lead}\n\n${body}`;
}

function buildDeepResearchReviewOpinionRequest(parts) {
  const sections = [
    ["現在の結論", parts.researchBrief || parts.adoption || parts.artifact],
    ["採用可否", parts.adoption],
    ["使える内容", parts.usable || parts.artifact || parts.publicSafeArtifact],
    ["未解決Issue", parts.issues],
    ["次アクション候補", [parts.nextActions, parts.additionalPrompt].filter(Boolean).join("\n\n")],
    ["判断してほしい観点", [
      "- Research Briefと採用可否を前提に、用途に対して過不足がないか",
      "- 危険な内容と使える内容が分離できているか",
      "- 次に深掘りすべき調査や次調査カードが妥当か"
    ].join("\n")],
    ["回答形式", [
      "- 良い点",
      "- 懸念点",
      "- 追加で確認すべきこと",
      "- 次に使うカードやプロンプトへの修正案"
    ].join("\n")]
  ];
  const body = sections
    .map(([heading, value]) => `## ${heading}\n${String(value || "未抽出").trim()}`)
    .join("\n\n");
  return `# ChatGPTに意見をもらう用カード
全文ログではなく、この軽量カードを使って相談してください。Research Brief、採用可否、Issue、次アクションだけを抜き出した相談用カードです。

## 相談したいこと
このDeep Research review結果を、次の作業に使う前に第三者視点で確認してください。

${body}`;
}

function buildDeepResearchReviewHandoffCard(parts) {
  const topic = extractMarkdownSubsection(state.topicCard, ["議題", "調べたいテーマ"]) || "Deep Research結果レビュー";
  const originalPrompt = extractMarkdownSubsection(state.topicCard, ["元のDeep Researchプロンプト"]) || "未入力";
  const target = extractMarkdownSubsection(state.topicCard, ["レビュー対象"]) || "今回のDeep Research結果";
  const usage = extractMarkdownSubsection(state.topicCard, ["結果を使う目的", "使う場面"]) || "未入力";
  const outputFormat = extractMarkdownSubsection(state.topicCard, ["出力形式"]) || "Deep Researchプロンプト作成モードで、完成プロンプトと追加調査案を作る";
  const reviewFocus = extractMarkdownSubsection(state.topicCard, ["特に確認したい観点", "判断基準"]) || "未入力";
  const adoption = parts.adoption || "未抽出";
  const additional = parts.additionalPrompt || "未抽出";
  const issues = parts.issues || "未抽出";
  const nextActions = parts.nextActions || "未抽出";
  const risk = parts.dangerous || "未抽出";
  const fixes = parts.fixes || "未抽出";
  const sourceReview = parts.sourceReview || "未抽出";
  return `# 議題
次に必要なDeep Researchプロンプトを作成する

# 背景
Deep Research reviewで、調査結果の採用可否・危険な内容・未解決Issue・追加調査案を確認した。次は、このレビュー結果をもとにDeep Researchプロンプト作成モードで次回調査プロンプトを設計する。

# 由来
前回のDeep Research review由来 / 2回目以降用・軽量版向けの次調査カード。新しいDeep Researchプロンプト作成モードの議題カードとして使う。
Decision Ledger / Answer Ledger は新規Deep Research設計側で再構築する。

# 元テーマ
${topic}

# 元のDeep Researchプロンプト
${originalPrompt}

# レビュー対象
${target}

# 今回レビュー結果の採用可否
${adoption}

# 追加調査が必要な理由
## 未解決Issue
${issues}

## 修正すべき内容
${fixes}

## 危険な内容
${risk}

# 次に調べるべきテーマ
${additional}

# 次回Deep Researchの目的
${usage}

# 対象読者
未入力

# 除外範囲
- 今回レビューで危険な内容として分離された主張
- 根拠の弱い情報を推奨扱いすること
- 調査結果を無批判に採用すること

# 安全制約
- 情報源と根拠レベルを確認する
- 主張と根拠の対応を見る
- 危険な内容と採用できる内容を分ける
- 高リスク領域では安全性を優先する
- 根拠の弱い情報を推奨扱いしない

# 情報源条件
## 優先情報源
${sourceReview}

# 出力形式
${outputFormat}

# 未解決Issue
${issues}

# 次アクション
${nextActions}

# 仮置き条件
- 対象読者：未入力
- 追加調査テーマ：追加Deep Researchプロンプト案から選ぶ
- レビュー観点：${reviewFocus}
- 不明な前提は断定せず「未入力」または「要確認」として残す`;
}

function setReviewCompleteText(el, value) {
  if (!el) return;
  el.textContent = value || "未抽出";
}

function renderDeepResearchReviewCompletePanel() {
  if (!els.deepResearchReviewCompletePanel) return;
  const finalStep = getSteps()[getTotalSteps() - 1];
  const hasImportedFinal = Boolean(String(state.deepResearchReviewImportedFinalAnswer || "").trim());
  const canShow = state.mode === "deepResearchReview" && finalStep.role.includes("Final Judge") && (isComplete() || hasImportedFinal);
  els.deepResearchReviewCompletePanel.hidden = !canShow;
  if (!canShow) {
    resetExitCardDisclosureState(els.deepResearchReviewCompletePanel);
    [
      els.deepResearchReviewAdoptionText,
      els.deepResearchReviewAdoptionConditionsText,
      els.deepResearchReviewUsableText,
      els.deepResearchReviewFixesText,
      els.deepResearchReviewDangerousText,
      els.deepResearchReviewSourceText,
      els.deepResearchReviewClaimEvidenceText,
      els.deepResearchReviewGapsText,
      els.deepResearchReviewPracticalityText,
      els.deepResearchReviewArtifactText,
      els.deepResearchReviewResearchBriefText,
      els.deepResearchReviewOpinionRequestText,
      els.deepResearchReviewPublicSafeText,
      els.deepResearchReviewPharmacySafetyText,
      els.deepResearchReviewProInternalText,
      els.deepResearchReviewAdditionalPromptText,
      els.deepResearchReviewIssuesText,
      els.deepResearchReviewNextActionsText,
      els.deepResearchReviewConfidenceText,
      els.deepResearchReviewHandoffText,
      els.deepResearchReviewHandoffCardText
    ].forEach((el) => setReviewCompleteText(el, ""));
    if (els.deepResearchReviewResearchBriefCard) els.deepResearchReviewResearchBriefCard.hidden = true;
    setStatus(els.deepResearchReviewCompleteStatus, "");
    return;
  }

  const parts = buildDeepResearchReviewCompleteParts();
  setReviewCompleteText(els.deepResearchReviewAdoptionText, parts.adoption);
  setReviewCompleteText(els.deepResearchReviewAdoptionConditionsText, parts.adoptionConditions);
  setReviewCompleteText(els.deepResearchReviewUsableText, parts.usable);
  setReviewCompleteText(els.deepResearchReviewFixesText, parts.fixes);
  setReviewCompleteText(els.deepResearchReviewDangerousText, parts.dangerous);
  setReviewCompleteText(els.deepResearchReviewSourceText, parts.sourceReview);
  setReviewCompleteText(els.deepResearchReviewClaimEvidenceText, parts.claimEvidence);
  setReviewCompleteText(els.deepResearchReviewGapsText, parts.gaps);
  setReviewCompleteText(els.deepResearchReviewPracticalityText, parts.practicality);
  setReviewCompleteText(els.deepResearchReviewArtifactText, parts.artifact);
  setReviewCompleteText(els.deepResearchReviewResearchBriefText, parts.researchBrief);
  if (els.deepResearchReviewResearchBriefCard) {
    els.deepResearchReviewResearchBriefCard.hidden = !Boolean(String(parts.researchBrief || "").trim());
  }
  setReviewCompleteText(els.deepResearchReviewOpinionRequestText, parts.opinionRequest);
  setReviewCompleteText(els.deepResearchReviewPublicSafeText, parts.publicSafeArtifact);
  setReviewCompleteText(els.deepResearchReviewPharmacySafetyText, parts.pharmacySafetyArtifact);
  setReviewCompleteText(els.deepResearchReviewProInternalText, parts.proInternalArtifact);
  setReviewCompleteText(els.deepResearchReviewAdditionalPromptText, parts.additionalPrompt);
  setReviewCompleteText(els.deepResearchReviewIssuesText, parts.issues);
  setReviewCompleteText(els.deepResearchReviewNextActionsText, parts.nextActions);
  setReviewCompleteText(els.deepResearchReviewConfidenceText, parts.confidence);
  setReviewCompleteText(els.deepResearchReviewHandoffText, parts.handoff);
  setReviewCompleteText(els.deepResearchReviewHandoffCardText, parts.handoffCard);
}

function getDeepResearchReviewCopyPayload(kind) {
  const parts = buildDeepResearchReviewCompleteParts();
  const payloads = {
    adoption: { text: parts.adoption || parts.full, label: "採用可否" },
    adoptionConditions: { text: parts.adoptionConditions || parts.full, label: "採用条件" },
    usable: { text: parts.usable || parts.full, label: "採用できる内容" },
    fixes: { text: parts.fixes || parts.full, label: "修正すべき内容" },
    dangerous: { text: parts.dangerous || parts.full, label: "危険な内容" },
    sourceReview: { text: parts.sourceReview || parts.full, label: "情報源レビュー" },
    claimEvidence: { text: parts.claimEvidence || parts.full, label: "主張・根拠対応レビュー" },
    gaps: { text: parts.gaps || parts.full, label: "抜け漏れ" },
    practicality: { text: parts.practicality || parts.full, label: "実用性レビュー" },
    artifact: { text: parts.artifact || parts.full, label: "改訂版成果物" },
    researchBrief: { text: parts.researchBrief || "", label: "Research Brief / 研究ブリーフ" },
    opinionRequest: { text: parts.opinionRequest || parts.full, label: "ChatGPTに意見をもらう用カード" },
    publicSafeArtifact: { text: parts.publicSafeArtifact || parts.full, label: "一般向け安全変換版" },
    pharmacySafetyArtifact: { text: parts.pharmacySafetyArtifact || parts.full, label: "薬剤師・相談員向け安全確認版" },
    proInternalArtifact: { text: parts.proInternalArtifact || parts.full, label: "専門職向け内部資料版" },
    practical: { text: parts.artifact || parts.full, label: "実用版" },
    additionalPrompt: { text: parts.additionalPrompt || parts.full, label: "追加Deep Researchプロンプト案" },
    issues: { text: parts.issues || parts.full, label: "未解決Issue" },
    nextActions: { text: parts.nextActions || parts.full, label: "次アクション" },
    confidence: { text: parts.confidence || parts.full, label: "結論の自信度" },
    handoff: { text: parts.handoff || parts.full, label: "次Stepへの引き継ぎ" },
    handoffCard: { text: parts.handoffCard || parts.full, label: "次調査カード" }
  };
  if (kind === "full") return { text: parts.full, label: "レビュー全文" };
  if (payloads[kind]) return payloads[kind];
  return { text: parts.full, label: "レビュー全文" };
}

async function copyDeepResearchReviewCompletePart(kind) {
  const payload = getDeepResearchReviewCopyPayload(kind);
  if (!payload.text) {
    setStatus(els.deepResearchReviewCompleteStatus, "コピーできるFinal Judgeの回答がまだありません。", "warn");
    return;
  }
  await copyPlainText(payload.text, els.deepResearchReviewCompleteStatus, `${payload.label}をコピーしました。`);
}

function startDeepResearchPromptFromReviewHandoff() {
  const payload = getDeepResearchReviewCopyPayload("handoffCard");
  const handoffCard = ensureDeepResearchReviewHandoffForDesign(String(payload.text || "").trim());
  if (!handoffCard) {
    setStatus(els.deepResearchReviewCompleteStatus, "新規Deep Research設計に使える次調査カードがまだありません。", "warn");
    return;
  }
  const hasExistingLog = countCompletedAnswers() > 0 || Object.values(state.steeringNotes || {}).some((value) => String(value || "").trim());
  if (hasExistingLog && !confirm("現在の会議ログをクリアして、この次調査カードで新規Deep Research設計を開始しますか？")) {
    return;
  }
  state.mode = "deepResearchPrompt";
  state.currentStep = 1;
  state.topicCard = handoffCard;
  state.setupDone = true;
  state.answers = {};
  state.steeringNotes = {};
  state.promptContextMode = "light";
  state.deepResearchActiveTab = "prompt";
  state.deepResearchReviewImportLog = "";
  state.deepResearchReviewImportedFinalAnswer = "";
  collapsePreparationAfterTopicApplied();
  if (els.modeSelect) els.modeSelect.value = state.mode;
  if (els.topicCard) els.topicCard.value = state.topicCard;
  updateTopicPrompt();
  persist("次調査カードをDeep Researchプロンプト作成モードの議題カードとして読み込みました。");
  render();
  scrollToElement(els.promptPanel);
}

function ensureDeepResearchReviewHandoffForDesign(card) {
  const text = String(card || "").trim();
  if (!text) return "";
  if (/Deep Research review由来/u.test(text) && /2回目以降用・軽量版向け/u.test(text)) return text;
  return `# 引き継ぎ種別
Deep Research review由来 / 2回目以降用・軽量版向け

# 注意
このカードは前回レビュー結果をもとに、次のDeep Researchプロンプト作成モードで新規議題カードとして使う。Decision Ledger / Answer Ledger は新規会議側で再構築する。

${text}`;
}

function startNewDeepResearchReview() {
  if (!confirm("新しいDeep Research reviewを開始します。現在の会議ログをクリアしますか？")) return;
  state.mode = "deepResearchReview";
  state.currentStep = 1;
  state.topicCard = templates.deepResearchReview;
  state.answers = {};
  state.steeringNotes = {};
  state.deepResearchReviewForm = defaultDeepResearchReviewForm();
  state.deepResearchReviewImportLog = "";
  state.deepResearchReviewImportedFinalAnswer = "";
  state.promptContextMode = "full";
  state.preparationCollapsed = false;
  state.reviewResultsCollapsed = false;
  els.modeSelect.value = state.mode;
  els.topicCard.value = state.topicCard;
  fillDeepResearchReviewForm(state.deepResearchReviewForm);
  if (els.deepResearchReviewImportLog) els.deepResearchReviewImportLog.value = "";
  updateTopicPrompt();
  persist("新しいDeep Research reviewを開始しました");
  render();
  scrollToElement(els.deepResearchReviewInputPanel || els.promptPanel);
}

function buildCurrentDeepResearchLedgerParts() {
  const currentStep = normalizeStep(state.currentStep, "deepResearchPrompt");
  const answerEntries = buildAnswerLedger(state.answers, state.steeringNotes, currentStep);
  const decisionLedger = formatDecisionLedger(buildDecisionLedger(state.answers, state.steeringNotes, currentStep));
  const answerLedger = formatAnswerLedger(answerEntries);
  return {
    decisionLedger,
    answerLedger,
    answeredCount: answerEntries.length
  };
}

function renderDeepResearchLedgerPanel() {
  if (!els.deepResearchLedgerPanel) return;
  const canShow = state.mode === "deepResearchPrompt";
  els.deepResearchLedgerPanel.hidden = !canShow;
  if (!canShow) {
    setReviewCompleteText(els.currentDecisionLedgerText, "");
    setReviewCompleteText(els.currentAnswerLedgerText, "");
    if (els.deepResearchLedgerSummary) els.deepResearchLedgerSummary.textContent = "";
    setStatus(els.deepResearchLedgerStatus, "");
    return;
  }

  const parts = buildCurrentDeepResearchLedgerParts();
  setReviewCompleteText(els.currentDecisionLedgerText, parts.decisionLedger);
  setReviewCompleteText(els.currentAnswerLedgerText, parts.answerLedger);
  if (els.deepResearchLedgerSummary) {
    els.deepResearchLedgerSummary.textContent = parts.answeredCount
      ? `回答済み質問: ${parts.answeredCount}件。Decision Ledgerは次Stepプロンプトで前Step引き継ぎより優先されます。`
      : "回答済み質問はまだありません。軌道修正メモを書くとAnswer Ledger / Decision Ledgerに反映されます。";
  }
}

async function copyCurrentDeepResearchLedger(kind) {
  const parts = buildCurrentDeepResearchLedgerParts();
  const isAnswer = kind === "answer";
  const text = isAnswer ? parts.answerLedger : parts.decisionLedger;
  const label = isAnswer ? "Answer Ledger" : "Decision Ledger";
  if (!String(text || "").trim() || (isAnswer && /^-\s*未抽出/u.test(text))) {
    setStatus(els.deepResearchLedgerStatus, `${label}はまだ未抽出です。`, "warn");
    return;
  }
  await copyPlainText(text, els.deepResearchLedgerStatus, `${label}をコピーしました。`);
}

function renderDeepResearchCopyPanel() {
  const canCopy = state.mode === "deepResearchPrompt" && isComplete();
  els.deepResearchCopyPanel.hidden = !canCopy;
  if (!canCopy) {
    resetExitCardDisclosureState(els.deepResearchCopyPanel);
    clearDeepResearchPromptCompleteTexts();
    if (els.deepResearchCopyRecommendation) els.deepResearchCopyRecommendation.textContent = "";
    return;
  }
  const recommendation = getDeepResearchPromptRecommendation();
  if (els.deepResearchCopyRecommendation) {
    els.deepResearchCopyRecommendation.textContent = recommendation.message;
    els.deepResearchCopyRecommendation.classList.toggle("warn", recommendation.mode === "light");
  }
  const parts = buildDeepResearchPromptCompleteParts();
  setReviewCompleteText(els.deepResearchCompletePromptText, parts.completePrompt);
  setReviewCompleteText(els.deepResearchLightweightText, parts.lightweight);
  setReviewCompleteText(els.deepResearchOpinionRequestText, parts.opinionRequest);
  setReviewCompleteText(els.deepResearchOneShotText, parts.oneShot);
  setReviewCompleteText(els.deepResearchSplitText, parts.split);
  setReviewCompleteText(els.deepResearchOrderText, parts.order);
  setReviewCompleteText(els.deepResearchAdditionalText, parts.additional);
  setReviewCompleteText(els.deepResearchQuestionsText, parts.questions);
  setReviewCompleteText(els.deepResearchAssumptionsText, parts.assumptions);
  setReviewCompleteText(els.deepResearchDecisionLedgerText, parts.decisionLedger);
  setReviewCompleteText(els.deepResearchAnswerLedgerText, parts.answerLedger);
  setReviewCompleteText(els.deepResearchKampoBaselineText, parts.kampoBaseline);
  setReviewCompleteText(els.deepResearchKampoPatternText, parts.kampoPattern);
  setReviewCompleteText(els.deepResearchKampoFormulaText, parts.kampoFormula);
  setReviewCompleteText(els.deepResearchKampoSafetyText, parts.kampoSafety);
  setReviewCompleteText(els.deepResearchKampoPublicText, parts.kampoPublic);
  setReviewCompleteText(els.deepResearchKampoProfessionalText, parts.kampoProfessional);
  if (els.deepResearchKampoExitDetails) {
    els.deepResearchKampoExitDetails.hidden = !shouldShowDeepResearchKampoExit(parts);
  }
}

async function copyDeepResearchPrompt() {
  await copyDeepResearchPromptCompletePart("complete");
}

function clearDeepResearchPromptCompleteTexts() {
  [
    els.deepResearchCompletePromptText,
    els.deepResearchLightweightText,
    els.deepResearchOpinionRequestText,
    els.deepResearchOneShotText,
    els.deepResearchSplitText,
    els.deepResearchOrderText,
    els.deepResearchAdditionalText,
    els.deepResearchQuestionsText,
    els.deepResearchAssumptionsText,
    els.deepResearchDecisionLedgerText,
    els.deepResearchAnswerLedgerText,
    els.deepResearchKampoBaselineText,
    els.deepResearchKampoPatternText,
    els.deepResearchKampoFormulaText,
    els.deepResearchKampoSafetyText,
    els.deepResearchKampoPublicText,
    els.deepResearchKampoProfessionalText
  ].forEach((el) => setReviewCompleteText(el, ""));
  if (els.deepResearchKampoExitDetails) els.deepResearchKampoExitDetails.hidden = true;
}

function getDeepResearchPromptFinalAnswer() {
  const finalStep = String(getTotalSteps());
  return String(state.answers[finalStep] || "").trim();
}

function buildDeepResearchPromptCompleteParts() {
  const full = getDeepResearchPromptFinalAnswer();
  const completePrompt = extractDeepResearchPrompt();
  const computedAnswerLedger = formatAnswerLedger(buildAnswerLedger(state.answers, state.steeringNotes, getTotalSteps()));
  const computedDecisionLedger = formatDecisionLedger(buildDecisionLedger(state.answers, state.steeringNotes, getTotalSteps()));
  const oneShot = extractAiBoardBlock(full, "DR_PROMPT_ONE_SHOT") || extractMarkdownSubsection(full, ["一発版", "一発版プロンプト", "一発版Deep Researchプロンプト"]);
  const lightweight = extractAiBoardBlock(full, "DR_PROMPT_LIGHTWEIGHT") || extractMarkdownSubsection(full, ["2回目以降用・軽量版プロンプト", "2回目以降用・軽量版", "軽量版プロンプト"]);
  const opinionRequest = extractAiBoardBlock(full, "DR_PROMPT_OPINION_REQUEST") || extractMarkdownSubsection(full, ["ChatGPTに意見をもらう用カード", "意見をもらう用カード"]);
  const split = extractAiBoardBlock(full, "DR_PROMPT_SPLIT") || extractMarkdownSubsection(full, ["分割版", "分割版プロンプト", "分割版Deep Researchプロンプト"]);
  const additional = extractAiBoardBlock(full, "DR_PROMPT_ADDITIONAL") || extractMarkdownSubsection(full, ["追加調査案", "追加Deep Researchプロンプト案", "追加Deep Researchプロンプト"]);
  const order = extractAiBoardBlock(full, "DR_PROMPT_ORDER") || extractMarkdownSubsection(full, ["推奨する調査構成", "推奨する実行順", "次アクション"]);
  const questions = extractAiBoardBlock(full, "DR_PROMPT_QUESTIONS") || extractMarkdownSubsection(full, ["ユーザーへの確認質問"]);
  const assumptions = extractAiBoardBlock(full, "DR_PROMPT_ASSUMPTIONS") || extractMarkdownSubsection(full, ["未回答の場合の仮置き"]);
  const extractedDecisionLedger = extractAiBoardBlock(full, "DR_PROMPT_DECISION_LEDGER") || extractMarkdownSubsection(full, ["確定済み条件 / Decision Ledger", "Decision Ledger", "確定済み条件"]);
  const extractedAnswerLedger = extractAiBoardBlock(full, "DR_PROMPT_ANSWER_LEDGER") || extractMarkdownSubsection(full, ["回答済み質問 / Answer Ledger", "Answer Ledger", "回答済み質問"]);
  const decisionLedger = /^確定済み条件\s*\/\s*Decision Ledger$/u.test(extractedDecisionLedger || "") ? computedDecisionLedger : (extractedDecisionLedger || computedDecisionLedger);
  const answerLedger = /^回答済み質問\s*\/\s*Answer Ledger$/u.test(extractedAnswerLedger || "") ? computedAnswerLedger : (extractedAnswerLedger || computedAnswerLedger);
  return {
    full,
    completePrompt,
    lightweight,
    opinionRequest: opinionRequest || buildDeepResearchPromptOpinionRequest({ completePrompt, lightweight, order, additional, decisionLedger, answerLedger, questions, assumptions }),
    oneShot: oneShot || completePrompt,
    split,
    order,
    additional,
    questions,
    assumptions,
    decisionLedger,
    answerLedger,
    kampoBaseline: extractAiBoardBlock(full, "DR_KAMPO_BASELINE") || extractMarkdownSubsection(full, ["医学的基礎プロンプト", "病名の医学的基礎・医療連携", "医学的基礎"]),
    kampoPattern: extractAiBoardBlock(full, "DR_KAMPO_PATTERN") || extractMarkdownSubsection(full, ["漢方病態・証プロンプト", "漢方医学的病態把握", "漢方医学的病態", "証の整理"]),
    kampoFormula: extractAiBoardBlock(full, "DR_KAMPO_FORMULA") || extractMarkdownSubsection(full, ["処方・生薬・症状クラスター整理プロンプト", "処方・生薬・証・症状クラスター整理", "改善仮説を作る調査"]),
    kampoSafety: extractAiBoardBlock(full, "DR_KAMPO_SAFETY") || extractMarkdownSubsection(full, ["方剤別安全性・添付文書照合プロンプト", "方剤別安全性・添付文書照合", "安全性を補う調査"]),
    kampoPublic: extractAiBoardBlock(full, "DR_KAMPO_PUBLIC") || extractMarkdownSubsection(full, ["一般ユーザー向け相談前メモ化プロンプト", "一般ユーザー向け相談前メモ化", "実用性を高める調査"]),
    kampoProfessional: extractAiBoardBlock(full, "DR_KAMPO_PROFESSIONAL") || extractMarkdownSubsection(full, ["専門職向け分冊化プロンプト", "専門職向け分冊化", "学習価値を高める調査"])
  };
}

function shouldShowDeepResearchKampoExit(parts) {
  const source = [
    state.topicCard,
    parts.full,
    parts.kampoBaseline,
    parts.kampoPattern,
    parts.kampoFormula,
    parts.kampoSafety,
    parts.kampoPublic,
    parts.kampoProfessional
  ].join("\n");
  return /漢方|処方|生薬|方剤|証|病名|症状クラスター/u.test(source);
}

function buildDeepResearchPromptOpinionRequest(parts) {
  const currentConclusion = parts.lightweight || parts.completePrompt || "未抽出";
  return `# ChatGPTに意見をもらう用カード
全文ログではなく、この軽量カードを使って相談してください。完成プロンプト全文を毎回送らず、確定条件・未解決点・次アクションだけを確認するためのカードです。

## 相談したいこと
このDeep Research設計が、目的・読者・調査範囲・安全制約に対して過不足ないか確認してください。

## 現在の結論
${currentConclusion}

## 採用可否
Deep Researchプロンプト作成モードのFinal QA結果を前提に、現時点では設計案として採用候補です。

## 使える内容
${parts.order || parts.additional || "未抽出"}

## 未解決Issue
${parts.questions || parts.assumptions || "未抽出"}

## 次アクション候補
${parts.additional || parts.order || "未抽出"}

## 判断してほしい観点
- 本命プロンプトを初回調査に使ってよいか
- 軽量版を2回目以降に使う前提が明確か
- 分割調査案や追加調査候補に漏れがないか

## 回答形式
- 良い点
- 懸念点
- 追加した方がよい制約
- 修正した方がよいプロンプト文`;
}

function getDeepResearchPromptCopyPayload(kind) {
  const parts = buildDeepResearchPromptCompleteParts();
  const fallback = parts.completePrompt || parts.full;
  const payloads = {
    complete: { text: parts.completePrompt || parts.oneShot || parts.full, label: "完成プロンプト" },
    lightweight: { text: parts.lightweight || fallback, label: "2回目以降用・軽量版" },
    opinionRequest: { text: parts.opinionRequest || parts.lightweight || fallback, label: "ChatGPTに意見をもらう用カード" },
    oneShot: { text: parts.oneShot || fallback, label: "一発版プロンプト" },
    split: { text: parts.split || fallback, label: "分割版プロンプト" },
    order: { text: parts.order || fallback, label: "推奨する実行順" },
    additional: { text: parts.additional || fallback, label: "追加調査案" },
    questions: { text: parts.questions || fallback, label: "ユーザーへの確認質問" },
    assumptions: { text: parts.assumptions || fallback, label: "未回答時の仮置き" },
    decisionLedger: { text: parts.decisionLedger || fallback, label: "Decision Ledger" },
    answerLedger: { text: parts.answerLedger || fallback, label: "Answer Ledger" },
    kampoBaseline: { text: parts.kampoBaseline || fallback, label: "医学的基礎プロンプト" },
    kampoPattern: { text: parts.kampoPattern || fallback, label: "漢方病態・証プロンプト" },
    kampoFormula: { text: parts.kampoFormula || parts.additional || fallback, label: "処方・生薬・症状クラスター整理プロンプト" },
    kampoSafety: { text: parts.kampoSafety || parts.additional || fallback, label: "方剤別安全性・添付文書照合プロンプト" },
    kampoPublic: { text: parts.kampoPublic || parts.additional || fallback, label: "一般ユーザー向け相談前メモ化プロンプト" },
    kampoProfessional: { text: parts.kampoProfessional || parts.additional || fallback, label: "専門職向け分冊化プロンプト" }
  };
  return payloads[kind] || payloads.complete;
}

async function copyDeepResearchPromptCompletePart(kind) {
  const payload = getDeepResearchPromptCopyPayload(kind);
  if (!payload.text) {
    setStatus(els.deepResearchCopyStatus, "コピーできる出口カードがまだありません。", "warn");
    return;
  }
  await copyPlainText(payload.text, els.deepResearchCopyStatus, `${payload.label}をコピーしました。`);
}

async function loadGoldenCases(showStatus = false) {
  if (!els.goldenCasePanel) return;
  goldenCaseLoadState.loaded = false;
  goldenCaseLoadState.failed = false;
  goldenCaseLoadState.error = "";
  goldenCaseLoadState.source = "loading";
  renderGoldenCaseLoadInfo();
  try {
    const jsonUrl = `./golden-cases.json?reload=${Date.now()}`;
    let response;
    try {
      response = await fetchWithTimeout(jsonUrl, { cache: "no-store" }, GOLDEN_CASE_FETCH_TIMEOUT_MS);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      throw createGoldenCaseLoadError("JSON fetch failed", error);
    }

    let loaded;
    try {
      loaded = await response.json();
      if (!Array.isArray(loaded)) throw new Error("golden-cases.json must be an array");
    } catch (error) {
      throw createGoldenCaseLoadError("JSON parse failed", error);
    }

    let normalized;
    try {
      normalized = loaded.map(normalizeGoldenCaseDefinition).filter((goldenCase) => goldenCase.id);
      if (!normalized.length) throw new Error("golden-cases.json has no usable cases");
    } catch (error) {
      throw createGoldenCaseLoadError("Golden Case normalize failed", error);
    }

    goldenCases = normalized;
    goldenCaseLoadState.loaded = true;
    goldenCaseLoadState.failed = false;
    goldenCaseLoadState.error = "";
    goldenCaseLoadState.source = "json";
    populateGoldenCaseSelect();
    renderGoldenCasePanel();
    if (showStatus) {
      setStatus(els.goldenCaseStatus, `Golden Case JSONを読み込みました: ${goldenCases.length}件`);
    }
  } catch (error) {
    goldenCases = goldenCaseFallbacks.map(normalizeGoldenCaseDefinition);
    goldenCaseLoadState.loaded = false;
    goldenCaseLoadState.failed = true;
    goldenCaseLoadState.error = formatGoldenCaseLoadError(error);
    goldenCaseLoadState.source = "fallback";
    populateGoldenCaseSelect();
    renderGoldenCasePanel();
    setStatus(els.goldenCaseStatus, goldenCaseLoadState.error, "warn");
  }
}

async function reloadGoldenCases() {
  setStatus(els.goldenCaseStatus, "Golden Case JSONを再読み込みしています...");
  if (els.reloadGoldenCasesButton) {
    els.reloadGoldenCasesButton.disabled = true;
    els.reloadGoldenCasesButton.textContent = "再読み込み中...";
  }
  try {
    await loadGoldenCases(true);
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    setStatus(els.goldenCaseStatus, `Golden Case JSON reload failed: ${message}`, "warn");
  } finally {
    if (els.reloadGoldenCasesButton) {
      els.reloadGoldenCasesButton.disabled = false;
      els.reloadGoldenCasesButton.textContent = "Golden Case JSONを再読み込み";
    }
  }
}

function fetchWithTimeout(resource, options = {}, timeoutMs = 8000) {
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const fetchOptions = controller ? { ...options, signal: controller.signal } : options;
  let timeoutId = null;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      if (controller) controller.abort();
      reject(new Error(`request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  return Promise.race([fetch(resource, fetchOptions), timeout]).finally(() => {
    if (timeoutId !== null) clearTimeout(timeoutId);
  });
}

function createGoldenCaseLoadError(type, error) {
  const message = error && error.message ? error.message : String(error);
  const wrapped = new Error(`${type}: ${message}`);
  wrapped.goldenCaseLoadType = type;
  wrapped.originalError = error;
  return wrapped;
}

function formatGoldenCaseLoadError(error) {
  const message = error && error.message ? error.message : String(error);
  if (error && error.goldenCaseLoadType) return message;
  return `Golden Case internal error: ${message}`;
}

function getSelectedGoldenCaseCategory() {
  return els.goldenCaseCategorySelect ? (els.goldenCaseCategorySelect.value || "all") : "all";
}

function getSelectedGoldenCaseDomainCategory() {
  return els.goldenCaseDomainSelect ? (els.goldenCaseDomainSelect.value || "all") : "all";
}

function getSelectedGoldenCaseUseCase() {
  return els.goldenCaseUseCaseSelect ? (els.goldenCaseUseCaseSelect.value || "all") : "all";
}

function getVisibleGoldenCases() {
  const workflow = normalizeGoldenCaseCategoryId(getSelectedGoldenCaseCategory());
  const domain = normalizeGoldenCaseCategoryId(getSelectedGoldenCaseDomainCategory());
  const useCase = normalizeGoldenCaseCategoryId(getSelectedGoldenCaseUseCase());
  return goldenCases.filter((goldenCase) => {
    const workflowMatches = !workflow || workflow === "all" || getGoldenCaseWorkflowCategory(goldenCase) === workflow;
    const domainMatches = !domain || domain === "all" || getGoldenCaseDomainCategory(goldenCase) === domain;
    const useCaseMatches = !useCase || useCase === "all" || getGoldenCaseUseCase(goldenCase) === useCase;
    return workflowMatches && domainMatches && useCaseMatches;
  });
}

function populateGoldenCaseCategorySelect() {
  if (!els.goldenCaseCategorySelect) return;
  const selected = normalizeGoldenCaseCategoryId(els.goldenCaseCategorySelect.value || "all");
  const counts = countGoldenCaseCategories(goldenCases, getGoldenCaseWorkflowCategory);
  els.goldenCaseCategorySelect.textContent = "";
  goldenCaseWorkflowOptions.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = `${formatGoldenCaseWorkflowCategory(category)} ${counts[category] || 0}`;
    els.goldenCaseCategorySelect.appendChild(option);
  });
  els.goldenCaseCategorySelect.value = goldenCaseWorkflowOptions.includes(selected) ? selected : "all";
}

function populateGoldenCaseDomainCategorySelect() {
  if (!els.goldenCaseDomainSelect) return;
  const selected = normalizeGoldenCaseCategoryId(els.goldenCaseDomainSelect.value || "all");
  const counts = countGoldenCaseCategories(goldenCases, getGoldenCaseDomainCategory);
  els.goldenCaseDomainSelect.textContent = "";
  goldenCaseDomainOptions.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = `${formatGoldenCaseDomainCategory(category)} ${counts[category] || 0}`;
    els.goldenCaseDomainSelect.appendChild(option);
  });
  els.goldenCaseDomainSelect.value = goldenCaseDomainOptions.includes(selected) ? selected : "all";
}

function populateGoldenCaseUseCaseSelect() {
  if (!els.goldenCaseUseCaseSelect) return;
  const selected = normalizeGoldenCaseCategoryId(els.goldenCaseUseCaseSelect.value || "all");
  const counts = countGoldenCaseCategories(goldenCases, getGoldenCaseUseCase);
  els.goldenCaseUseCaseSelect.textContent = "";
  goldenCaseUseCaseOptions.forEach((useCase) => {
    const option = document.createElement("option");
    option.value = useCase;
    option.textContent = `${formatGoldenCaseUseCase(useCase)} ${counts[useCase] || 0}`;
    els.goldenCaseUseCaseSelect.appendChild(option);
  });
  els.goldenCaseUseCaseSelect.value = goldenCaseUseCaseOptions.includes(selected) ? selected : "all";
}

function countGoldenCaseCategories(cases, getter) {
  const counts = { all: cases.length };
  cases.forEach((goldenCase) => {
    const category = normalizeGoldenCaseCategoryId(getter(goldenCase) || "uncategorized");
    counts[category] = (counts[category] || 0) + 1;
  });
  return counts;
}

function populateGoldenCaseSelect() {
  if (!els.goldenCaseSelect) return;
  const selected = els.goldenCaseSelect.value || (goldenCases[0] ? goldenCases[0].id : "");
  populateGoldenCaseCategorySelect();
  populateGoldenCaseDomainCategorySelect();
  populateGoldenCaseUseCaseSelect();
  const visibleCases = getVisibleGoldenCases();
  els.goldenCaseSelect.textContent = "";
  if (visibleCases.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "該当するGolden Caseはありません";
    option.disabled = true;
    els.goldenCaseSelect.appendChild(option);
    renderGoldenCaseList();
    return;
  }
  visibleCases.forEach((goldenCase) => {
    const option = document.createElement("option");
    option.value = goldenCase.id;
    const workflow = formatGoldenCaseWorkflowCategory(goldenCase.workflowCategory);
    const domain = formatGoldenCaseDomainCategory(goldenCase.domainCategory);
    const useCase = goldenCase.useCaseLabel || formatGoldenCaseUseCase(goldenCase.useCase);
    option.textContent = `[${useCase} / ${workflow} / ${domain}] ${goldenCase.displayName || goldenCase.title}`;
    if (goldenCase.oneLinePurpose) option.title = goldenCase.oneLinePurpose;
    els.goldenCaseSelect.appendChild(option);
  });
  if (visibleCases.some((goldenCase) => goldenCase.id === selected)) {
    els.goldenCaseSelect.value = selected;
  } else if (visibleCases[0]) {
    els.goldenCaseSelect.value = visibleCases[0].id;
  }
  renderGoldenCaseList();
}

function getSelectedGoldenCase() {
  if (!goldenCases.length) return null;
  const selectedId = els.goldenCaseSelect ? els.goldenCaseSelect.value : goldenCases[0].id;
  const visibleCases = getVisibleGoldenCases();
  if (visibleCases.length === 0) return null;
  return goldenCases.find((goldenCase) => goldenCase.id === selectedId) || visibleCases[0] || goldenCases[0];
}

function renderGoldenCasePanel() {
  if (!els.goldenCasePanel) return;
  renderGoldenCaseLoadInfo();
  const goldenCase = getSelectedGoldenCase();
  renderGoldenCaseSummary(goldenCase);
  renderGoldenCaseList();
  if (!goldenCase) {
    [
      els.goldenCaseExpectedText,
      els.goldenCaseActualLedgerText,
      els.goldenCaseActualExitCardsText,
      els.goldenCaseFinalQaText,
      els.goldenCaseCheckText
    ].forEach((el) => setReviewCompleteText(el, ""));
    return;
  }

  const actual = buildGoldenCaseActual(goldenCase);
  const evaluation = evaluateGoldenCase(goldenCase, actual);
  setReviewCompleteText(els.goldenCaseExpectedText, formatGoldenCaseExpected(goldenCase));
  setReviewCompleteText(els.goldenCaseActualLedgerText, actual.ledger);
  setReviewCompleteText(els.goldenCaseActualExitCardsText, actual.exitCards);
  setReviewCompleteText(els.goldenCaseFinalQaText, actual.finalQa);
  setReviewCompleteText(els.goldenCaseCheckText, formatGoldenCaseEvaluation(goldenCase, actual, evaluation));
}

function renderGoldenCaseSummary(goldenCase) {
  if (!els.goldenCaseSummary) return;
  if (!goldenCase) {
    els.goldenCaseSummary.textContent = "";
    return;
  }
  const title = document.createElement("strong");
  title.className = "golden-case-title";
  title.textContent = goldenCase.displayName || goldenCase.title || goldenCase.caseId || "";
  const purpose = document.createElement("p");
  purpose.className = "golden-case-purpose";
  purpose.textContent = goldenCase.oneLinePurpose || "このGolden Caseの用途説明は未設定です。";
  const badges = document.createElement("div");
  badges.className = "golden-case-badges";
  [
    goldenCase.useCaseLabel || formatGoldenCaseUseCase(goldenCase.useCase),
    formatGoldenCaseWorkflowCategory(goldenCase.workflowCategory),
    formatGoldenCaseDomainCategory(goldenCase.domainCategory)
  ].forEach((label) => {
    const badge = document.createElement("span");
    badge.className = "golden-case-badge";
    badge.textContent = label;
    badges.appendChild(badge);
  });
  const id = document.createElement("small");
  id.className = "golden-case-id";
  id.textContent = `case: ${goldenCase.caseId || goldenCase.id}`;
  els.goldenCaseSummary.replaceChildren(title, purpose, badges, id);
}

function createGoldenCaseBadge(label) {
  const badge = document.createElement("span");
  badge.className = "golden-case-badge";
  badge.textContent = label;
  return badge;
}

function renderGoldenCaseList() {
  if (!els.goldenCaseList) return;
  const visibleCases = getVisibleGoldenCases();
  const selectedId = els.goldenCaseSelect ? els.goldenCaseSelect.value : "";
  if (!visibleCases.length) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "No Golden Case matches the selected filters.";
    els.goldenCaseList.replaceChildren(empty);
    return;
  }
  const cards = visibleCases.map((goldenCase) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "golden-case-list-card";
    if (goldenCase.id === selectedId) card.classList.add("is-active");
    card.setAttribute("aria-pressed", goldenCase.id === selectedId ? "true" : "false");
    card.title = goldenCase.oneLinePurpose || goldenCase.title || goldenCase.id;
    card.addEventListener("click", () => {
      if (els.goldenCaseSelect) els.goldenCaseSelect.value = goldenCase.id;
      renderGoldenCasePanel();
    });

    const title = document.createElement("strong");
    title.className = "golden-case-title";
    title.textContent = goldenCase.displayName || goldenCase.title || goldenCase.caseId || goldenCase.id;

    const purpose = document.createElement("span");
    purpose.className = "golden-case-purpose";
    purpose.textContent = goldenCase.oneLinePurpose || "このGolden Caseの用途説明は未設定です。";

    const badges = document.createElement("span");
    badges.className = "golden-case-badges";
    [
      goldenCase.useCaseLabel || formatGoldenCaseUseCase(goldenCase.useCase),
      formatGoldenCaseWorkflowCategory(goldenCase.workflowCategory),
      formatGoldenCaseDomainCategory(goldenCase.domainCategory)
    ].forEach((label) => badges.appendChild(createGoldenCaseBadge(label)));

    const id = document.createElement("small");
    id.className = "golden-case-id";
    id.textContent = `case: ${goldenCase.caseId || goldenCase.id}`;

    card.replaceChildren(title, purpose, badges, id);
    return card;
  });
  els.goldenCaseList.replaceChildren(...cards);
}

function renderGoldenCaseLoadInfo() {
  if (!els.goldenCaseLoadInfo) return;
  const caseIds = goldenCases.map((goldenCase) => goldenCase.id || goldenCase.caseId).filter(Boolean);
  if (goldenCaseLoadState.source === "loading") {
    els.goldenCaseLoadInfo.classList.remove("warn");
    els.goldenCaseLoadInfo.textContent = [
      "Loading docs/golden-cases.json...",
      `fallback cases available: ${goldenCases.length}`,
      `timeout: ${GOLDEN_CASE_FETCH_TIMEOUT_MS / 1000}s`,
      `App cache: ${APP_CACHE_NAME}`
    ].join("\n");
    return;
  }
  const usingFallback = goldenCaseLoadState.failed || !goldenCaseLoadState.loaded;
  els.goldenCaseLoadInfo.classList.toggle("warn", usingFallback);
  if (!usingFallback) {
    els.goldenCaseLoadInfo.textContent = [
      `Loaded from docs/golden-cases.json: ${goldenCases.length} cases`,
      `caseIds: ${caseIds.join(", ") || "(none)"}`,
      `App cache: ${APP_CACHE_NAME}`
    ].join("\n");
    return;
  }
  els.goldenCaseLoadInfo.textContent = [
    "Fallback mode: golden-cases.json load failed",
    `Error: ${goldenCaseLoadState.error || "not loaded"}`,
    `fallback cases: ${goldenCases.length}`,
    `caseIds: ${caseIds.join(", ") || "(none)"}`,
    `App cache: ${APP_CACHE_NAME}`,
    "これは通常状態ではありません。local server / Service Worker cache / JSON parseを確認してください。"
  ].join("\n");
}

function formatGoldenCaseExpected(goldenCase) {
  const answerLedger = goldenCase.expectedAnswerLedger || [];
  const promptIncludes = goldenCase.expectedPromptIncludes || [];
  const promptExcludes = goldenCase.expectedPromptExcludes || [];
  const prohibitedPatterns = goldenCase.prohibitedRecommendationPatterns || [];
  const expectedFinalQa = goldenCase.expectedFinalQa || [];
  return [
    `# ${goldenCase.displayName || goldenCase.title}`,
    "",
    `## 用途\n- 用途: ${goldenCase.useCaseLabel || formatGoldenCaseUseCase(goldenCase.useCase)}\n- 説明: ${goldenCase.oneLinePurpose || "未設定"}\n- caseId: ${goldenCase.caseId || goldenCase.id}`,
    "",
    `## カテゴリ\n- 工程: ${formatGoldenCaseWorkflowCategory(goldenCase.workflowCategory)}\n- 分野: ${formatGoldenCaseDomainCategory(goldenCase.domainCategory)}\n- 互換カテゴリ: ${goldenCase.category || "未設定"}`,
    "",
    `## 入力テーマ\n${goldenCase.theme || goldenCase.initialTopic || ""}`,
    "",
    `## 途中の軌道修正\n${(goldenCase.steeringNotes || []).map((note) => `- ${note}`).join("\n")}`,
    "",
    `## 期待Decision Ledger\n${(goldenCase.expectedDecisionLedger || []).map((item) => `- ${item}`).join("\n")}`,
    "",
    `## 期待Answer Ledger\n${answerLedger.length ? answerLedger.map((item) => `- ${item}`).join("\n") : "- 未設定"}`,
    "",
    `## 期待出口カード\n${goldenCase.expectedExitCards.map((item) => `- ${item}`).join("\n")}`,
    "",
    `## 完成プロンプトに含むべき文言\n${promptIncludes.length ? promptIncludes.map((item) => `- ${item}`).join("\n") : "- 未設定"}`,
    "",
    `## 完成プロンプトに含めない文言\n${promptExcludes.length ? promptExcludes.map((item) => `- ${item}`).join("\n") : "- 未設定"}`,
    "",
    `## 推奨・断定として出ていたらNG\n${prohibitedPatterns.length ? prohibitedPatterns.map((item) => `- ${item}`).join("\n") : "- 未設定"}`,
    "",
    `## 期待Final QA\n${expectedFinalQa.length ? expectedFinalQa.map((item) => `- ${item}`).join("\n") : "- 未設定"}`
  ].join("\n");
}

function buildGoldenCaseActual(goldenCase) {
  if (state.mode !== goldenCase.mode) {
    const message = `対象モード: ${modeLabels[goldenCase.mode] || goldenCase.mode}\n現在のモード: ${modeLabels[state.mode] || state.mode}\n\nこのGolden Caseを確認するには「入力テーマをセット」で対象モードに切り替えてください。`;
    return {
      modeMismatch: true,
      ledger: message,
      exitCards: message,
      finalQa: message,
      combined: message,
      decisionLedger: "",
      answerLedger: "",
      completePrompt: "",
      exitCardValues: {}
    };
  }

  if (goldenCase.mode === "deepResearchPrompt") {
    const parts = buildDeepResearchPromptCompleteParts();
    const exitCardValues = {
      completePrompt: parts.completePrompt,
      lightweight: parts.lightweight,
      opinionRequest: parts.opinionRequest,
      oneShot: parts.oneShot,
      split: parts.split,
      order: parts.order,
      additional: parts.additional,
      questions: parts.questions,
      assumptions: parts.assumptions,
      decisionLedger: parts.decisionLedger,
      answerLedger: parts.answerLedger,
      kampoBaseline: parts.kampoBaseline,
      kampoPattern: parts.kampoPattern,
      kampoFormula: parts.kampoFormula,
      kampoSafety: parts.kampoSafety,
      kampoPublic: parts.kampoPublic,
      kampoProfessional: parts.kampoProfessional
    };
    const ledger = [
      parts.decisionLedger ? `## Decision Ledger\n${parts.decisionLedger}` : "## Decision Ledger\n未抽出",
      parts.answerLedger ? `## Answer Ledger\n${parts.answerLedger}` : "## Answer Ledger\n未抽出"
    ].join("\n\n");
    const exitCards = formatGoldenCaseExitCards([
      ["完成プロンプト", exitCardValues.completePrompt],
      ["2回目以降用・軽量版", exitCardValues.lightweight],
      ["ChatGPTに意見をもらう用カード", exitCardValues.opinionRequest],
      ["一発版プロンプト", exitCardValues.oneShot],
      ["分割版プロンプト", exitCardValues.split],
      ["推奨する実行順", exitCardValues.order],
      ["追加調査案", exitCardValues.additional],
      ["ユーザーへの確認質問", exitCardValues.questions],
      ["未回答時の仮置き", exitCardValues.assumptions],
      ["Decision Ledger", exitCardValues.decisionLedger],
      ["Answer Ledger", exitCardValues.answerLedger],
      ["医学的基礎プロンプト", exitCardValues.kampoBaseline],
      ["漢方病態・証プロンプト", exitCardValues.kampoPattern],
      ["処方・生薬・症状クラスター整理プロンプト", exitCardValues.kampoFormula],
      ["方剤別安全性・添付文書照合プロンプト", exitCardValues.kampoSafety],
      ["一般ユーザー向け相談前メモ化プロンプト", exitCardValues.kampoPublic],
      ["専門職向け分冊化プロンプト", exitCardValues.kampoProfessional]
    ]);
    const finalQa = extractMarkdownSubsection(parts.full, ["矛盾検出", "Final QA", "最終確認"]) || "未抽出";
    return {
      ledger,
      exitCards,
      finalQa,
      combined: [ledger, exitCards, finalQa].join("\n\n"),
      decisionLedger: parts.decisionLedger || "",
      answerLedger: parts.answerLedger || "",
      completePrompt: parts.completePrompt || parts.oneShot || parts.full || "",
      exitCardValues
    };
  }

  if (goldenCase.mode === "deepResearchReview") {
    const parts = buildDeepResearchReviewCompleteParts();
    const exitCardValues = {
      adoption: parts.adoption,
      adoptionConditions: parts.adoptionConditions,
      usable: parts.usable,
      fixes: parts.fixes,
      dangerous: parts.dangerous,
      sourceReview: parts.sourceReview,
      claimEvidence: parts.claimEvidence,
      gaps: parts.gaps,
      practicality: parts.practicality,
      artifact: parts.artifact,
      researchBrief: parts.researchBrief,
      opinionRequest: parts.opinionRequest,
      publicSafeArtifact: parts.publicSafeArtifact,
      pharmacySafetyArtifact: parts.pharmacySafetyArtifact,
      proInternalArtifact: parts.proInternalArtifact,
      additionalPrompt: parts.additionalPrompt,
      nextActions: parts.nextActions,
      confidence: parts.confidence,
      issues: parts.issues,
      handoff: parts.handoff,
      handoffCard: parts.handoffCard
    };
    const ledger = "Deep Research reviewにはDecision Ledger / Answer Ledgerはありません。Final Judge出口カードを確認してください。";
    const exitCards = formatGoldenCaseExitCards([
      ["採用可否", exitCardValues.adoption],
      ["採用条件", exitCardValues.adoptionConditions],
      ["採用できる内容", exitCardValues.usable],
      ["修正すべき内容", exitCardValues.fixes],
      ["危険な内容", exitCardValues.dangerous],
      ["情報源レビュー", exitCardValues.sourceReview],
      ["主張・根拠対応レビュー", exitCardValues.claimEvidence],
      ["抜け漏れ", exitCardValues.gaps],
      ["実用性レビュー", exitCardValues.practicality],
      ["改訂版成果物", exitCardValues.artifact],
      ["Research Brief", exitCardValues.researchBrief],
      ["ChatGPTに意見をもらう用カード", exitCardValues.opinionRequest],
      ["一般向け安全変換版", exitCardValues.publicSafeArtifact],
      ["薬剤師・相談員向け安全確認版", exitCardValues.pharmacySafetyArtifact],
      ["専門職向け内部資料版", exitCardValues.proInternalArtifact],
      ["追加Deep Researchプロンプト案", exitCardValues.additionalPrompt],
      ["次アクション", exitCardValues.nextActions],
      ["結論の自信度", exitCardValues.confidence],
      ["Issue / 未解決論点", exitCardValues.issues],
      ["次Stepへの引き継ぎ", exitCardValues.handoff],
      ["次調査カード", exitCardValues.handoffCard]
    ]);
    const finalQa = parts.handoff || parts.full || "未抽出";
    return {
      ledger,
      exitCards,
      finalQa,
      combined: [ledger, exitCards, finalQa].join("\n\n"),
      decisionLedger: "",
      answerLedger: "",
      completePrompt: parts.artifact || parts.full || "",
      exitCardValues
    };
  }

  const fallback = "このGolden CaseのActual抽出は未対応です。";
  return {
    ledger: fallback,
    exitCards: fallback,
    finalQa: fallback,
    combined: fallback,
    decisionLedger: "",
    answerLedger: "",
    completePrompt: "",
    exitCardValues: {}
  };
}

function formatGoldenCaseExitCards(items) {
  return items
    .map(([label, value]) => `## ${label}\n${value && String(value).trim() ? String(value).trim() : "未抽出"}`)
    .join("\n\n");
}

function evaluateGoldenCase(goldenCase, actual) {
  const failures = [];
  const warnings = [];
  const checkedItems = [];
  const actualDecisionLedger = actual.decisionLedger || actual.ledger || "";
  const actualAnswerLedger = actual.answerLedger || actual.ledger || "";
  const actualCompletePrompt = actual.completePrompt || actual.exitCardValues?.completePrompt || actual.combined || "";
  const actualCombined = actual.combined || "";

  if (actual.modeMismatch) {
    warnings.push("対象モードと現在のモードが違うため、Actualは未評価です。");
  }

  checkGoldenCaseExpectations({
    label: "Decision Ledger",
    expectations: goldenCase.expectedDecisionLedger || [],
    actualText: actualDecisionLedger,
    fallbackText: actualCombined,
    failures,
    warnings,
    checkedItems
  });

  checkGoldenCaseExpectations({
    label: "Answer Ledger",
    expectations: goldenCase.expectedAnswerLedger || [],
    actualText: actualAnswerLedger,
    fallbackText: [actualDecisionLedger, actualCompletePrompt].join("\n\n"),
    failures,
    warnings,
    checkedItems,
    fallbackAsWarning: true
  });

  checkGoldenCaseExpectations({
    label: "完成プロンプト必須文言",
    expectations: goldenCase.expectedPromptIncludes || [],
    actualText: actualCompletePrompt,
    fallbackText: actualCombined,
    failures,
    warnings,
    checkedItems
  });

  checkGoldenCaseExpectations({
    label: "次調査カード必須文言",
    expectations: goldenCase.expectedHandoffCardIncludes || goldenCase.expected?.handoffCardIncludes || [],
    actualText: actual.exitCardValues?.handoffCard || "",
    fallbackText: actualCombined,
    failures,
    warnings,
    checkedItems,
    fallbackAsWarning: true
  });

  checkGoldenCaseExpectations({
    label: "推奨実行順",
    expectations: goldenCase.expectedOrderIncludes || [],
    actualText: actual.exitCardValues?.order || "",
    fallbackText: actualCompletePrompt,
    failures,
    warnings,
    checkedItems,
    fallbackAsWarning: true
  });

  checkGoldenCaseExpectations({
    label: "未回答時の仮置き",
    expectations: goldenCase.expectedAssumptionsIncludes || [],
    actualText: actual.exitCardValues?.assumptions || "",
    fallbackText: actualCompletePrompt,
    failures,
    warnings,
    checkedItems,
    fallbackAsWarning: true
  });

  checkGoldenCaseExitCards(goldenCase, actual, failures, warnings, checkedItems);
  checkGoldenCaseForbiddenPatterns(goldenCase, actualCompletePrompt, failures, warnings, checkedItems);

  checkGoldenCaseExpectations({
    label: "Final QA",
    expectations: goldenCase.expectedFinalQa || [],
    actualText: actual.finalQa || "",
    fallbackText: actualCombined,
    failures,
    warnings,
    checkedItems,
    fallbackAsWarning: true
  });

  return {
    pass: failures.length === 0,
    failures,
    warnings,
    checkedItems,
    summary: `Overall: ${failures.length ? "Fail" : "Pass"} / failures ${failures.length} / warnings ${warnings.length} / checked ${checkedItems.length}`
  };
}

function checkGoldenCaseExpectations({ label, expectations, actualText, fallbackText, failures, warnings, checkedItems, fallbackAsWarning = false }) {
  if (!expectations.length) return;
  expectations.forEach((expectation) => {
    const foundInPrimary = goldenCaseTextMatchesExpectation(actualText, expectation);
    const foundInFallback = !foundInPrimary && fallbackText && goldenCaseTextMatchesExpectation(fallbackText, expectation);
    const ok = foundInPrimary || foundInFallback;
    checkedItems.push(`${ok ? "OK" : "Fail"} - ${label}: ${expectation}`);
    if (!ok) {
      failures.push(`欠落: ${label} / ${expectation}`);
    } else if (!foundInPrimary && foundInFallback && fallbackAsWarning) {
      warnings.push(`${label}の専用欄では未検出だが、関連出力内で検出: ${expectation}`);
    }
  });
}

function checkGoldenCaseExitCards(goldenCase, actual, failures, warnings, checkedItems) {
  const expectedExitCards = goldenCase.expectedExitCards || [];
  expectedExitCards.forEach((label) => {
    const value = getGoldenCaseExitCardValue(actual, label);
    const ok = Boolean(value && value.trim() && value.trim() !== "未抽出");
    checkedItems.push(`${ok ? "OK" : "Fail"} - 出口カード: ${label}`);
    if (!ok) failures.push(`出口カード未抽出: ${label}`);
  });
}

function getGoldenCaseExitCardValue(actual, label) {
  const keys = goldenCaseExitCardAliases[label] || label;
  const keyList = Array.isArray(keys) ? keys : [keys];
  for (const key of keyList) {
    const value = actual.exitCardValues?.[key];
    if (value) return String(value);
  }
  return "";
}

function checkGoldenCaseForbiddenPatterns(goldenCase, actualText, failures, warnings, checkedItems) {
  const safetyPatterns = [
    ...goldenCaseDefaultAllowedSafetyContextPatterns,
    ...(goldenCase.allowedSafetyContextPatterns || [])
  ];
  const legacyExcludes = goldenCase.expectedPromptExcludes || [];
  legacyExcludes.forEach((phrase) => {
    const matches = findGoldenCaseUnsafeLiteralMatches(actualText, phrase, safetyPatterns);
    const ok = matches.length === 0;
    checkedItems.push(`${ok ? "OK" : "Fail"} - 禁止文言: ${phrase}`);
    matches.forEach((context) => failures.push(`禁止文言を安全文脈外で検出: ${phrase}\n  近傍: ${context}`));
  });

  const patterns = goldenCase.prohibitedRecommendationPatterns || [];
  patterns.forEach((pattern) => {
    const matches = findGoldenCaseUnsafeRegexMatches(actualText, pattern, safetyPatterns);
    const ok = matches.length === 0;
    checkedItems.push(`${ok ? "OK" : "Fail"} - 推奨・断定NGパターン: ${pattern}`);
    matches.forEach((context) => failures.push(`推奨・断定NGパターンを安全文脈外で検出: ${pattern}\n  近傍: ${context}`));
  });

  if (!legacyExcludes.length && !patterns.length) {
    warnings.push("禁止文言・推奨断定パターンは未設定です。");
  }
}

function findGoldenCaseUnsafeLiteralMatches(text, phrase, safetyPatterns) {
  const source = String(text || "");
  const candidates = buildGoldenCaseNeedles(phrase).map(String).filter(Boolean);
  if (!candidates.length) return [];
  return candidates.flatMap((candidate) => {
    const matches = [];
    let index = source.indexOf(candidate);
    while (index >= 0) {
      const context = getGoldenCaseContext(source, index, candidate.length);
      if (!goldenCaseContextIsSafe(context, safetyPatterns)) matches.push(context);
      index = source.indexOf(candidate, index + Math.max(candidate.length, 1));
    }
    return matches;
  });
}

function findGoldenCaseUnsafeRegexMatches(text, pattern, safetyPatterns) {
  const source = String(text || "");
  if (!source.trim()) return [];
  let regex;
  try {
    regex = new RegExp(pattern, "giu");
  } catch (error) {
    return [`正規表現エラー: ${pattern} (${error.message})`];
  }
  const unsafe = [];
  let match;
  while ((match = regex.exec(source)) !== null) {
    const context = getGoldenCaseContext(source, match.index, match[0].length);
    if (!goldenCaseContextIsSafe(context, safetyPatterns)) unsafe.push(context);
    if (!match[0]) regex.lastIndex += 1;
  }
  return unsafe;
}

function getGoldenCaseContext(text, index, length) {
  const source = String(text || "");
  const start = Math.max(0, index - 60);
  const end = Math.min(source.length, index + length + 60);
  return source.slice(start, end).replace(/\s+/g, " ").trim();
}

function goldenCaseContextIsSafe(context, safetyPatterns) {
  return safetyPatterns.some((pattern) => {
    try {
      return new RegExp(pattern, "iu").test(context);
    } catch (_) {
      return String(context || "").includes(String(pattern));
    }
  });
}

function goldenCaseTextMatchesExpectation(text, expectation) {
  const normalizedText = normalizeGoldenCaseText(text);
  const candidates = buildGoldenCaseNeedles(expectation).map(normalizeGoldenCaseText).filter(Boolean);
  return candidates.some((needle) => normalizedText.includes(needle));
}

function formatGoldenCaseEvaluation(goldenCase, actual, evaluation, options = {}) {
  const caseId = goldenCase.caseId || goldenCase.id || "";
  const lines = [
    "# Golden Case自動判定",
    "",
    `caseId: ${caseId}`,
    `title: ${goldenCase.title}`,
    `Overall: ${evaluation.pass ? "Pass" : "Fail"}`,
    `failures: ${evaluation.failures.length}`,
    `warnings: ${evaluation.warnings.length}`,
    `checkedItems: ${evaluation.checkedItems.length}`,
    "",
    "## Failures",
    evaluation.failures.length ? evaluation.failures.map((item) => `- ${item}`).join("\n") : "- なし",
    "",
    "## Warnings",
    evaluation.warnings.length ? evaluation.warnings.map((item) => `- ${item}`).join("\n") : "- なし",
    "",
    "## Checked Items",
    evaluation.checkedItems.length ? evaluation.checkedItems.map((item) => `- ${item}`).join("\n") : "- なし",
    "",
    "## Expected vs Actual",
    `- Decision Ledger期待: ${(goldenCase.expectedDecisionLedger || []).length}件 / Actual文字数: ${String(actual.decisionLedger || "").length}`,
    `- Answer Ledger期待: ${(goldenCase.expectedAnswerLedger || []).length}件 / Actual文字数: ${String(actual.answerLedger || "").length}`,
    `- 完成プロンプト必須文言: ${(goldenCase.expectedPromptIncludes || []).length}件 / Actual文字数: ${String(actual.completePrompt || "").length}`
  ];

  if (options.includeActual) {
    lines.push(
      "",
      "## Actual Decision Ledger",
      actual.decisionLedger || actual.ledger || "未抽出",
      "",
      "## Actual Answer Ledger",
      actual.answerLedger || actual.ledger || "未抽出"
    );
  }

  return lines.join("\n");
}

function buildGoldenCaseCheck(goldenCase, actualText) {
  const positiveGroups = [
    ["Decision Ledger", goldenCase.expectedDecisionLedger || []],
    ["Answer Ledger", goldenCase.expectedAnswerLedger || []],
    ["出口カード", goldenCase.expectedExitCards || []],
    ["完成プロンプト必須文言", goldenCase.expectedPromptIncludes || []],
    ["Final QA", goldenCase.expectedFinalQa || []]
  ];
  const normalizedActual = normalizeGoldenCaseText(actualText);
  const lines = [];
  const failedMessages = [];
  let failedCount = 0;
  positiveGroups.forEach(([label, expectations]) => {
    if (!expectations.length) return;
    lines.push(`## ${label}`);
    expectations.forEach((expectation) => {
      const candidates = buildGoldenCaseNeedles(expectation).map(normalizeGoldenCaseText);
      const ok = candidates.some((needle) => needle && normalizedActual.includes(needle));
      if (!ok) {
        failedCount += 1;
        failedMessages.push(`- 欠落: ${label} / ${expectation}`);
      }
      lines.push(`${ok ? "OK" : "Fail"} - ${expectation}`);
    });
    lines.push("");
  });

  const excludes = goldenCase.expectedPromptExcludes || [];
  if (excludes.length) {
    lines.push("## 完成プロンプトに含めない文言");
    excludes.forEach((expectation) => {
      const candidates = buildGoldenCaseNeedles(expectation).map(normalizeGoldenCaseText);
      const found = candidates.some((needle) => needle && normalizedActual.includes(needle));
      if (found) {
        failedCount += 1;
        failedMessages.push(`- 禁止文言を検出: ${expectation}`);
      }
      lines.push(`${found ? "Fail" : "OK"} - ${expectation}`);
    });
    lines.push("");
  }

  if (!lines.length) return "期待値がありません。";
  return [
    `判定: ${failedCount ? "Fail" : "Pass"}`,
    `失敗条件数: ${failedCount}`,
    "",
    "## 失敗した条件一覧",
    failedMessages.length ? failedMessages.join("\n") : "- なし",
    "",
    ...lines
  ].join("\n").trim();
}

function buildGoldenCaseLegacyCheck(goldenCase, actualText) {
  const expectations = [
    ...(goldenCase.expectedDecisionLedger || []),
    ...(goldenCase.expectedExitCards || []),
    ...(goldenCase.expectedFinalQa || [])
  ];
  if (!expectations.length) return "期待値がありません。";
  const normalizedActual = normalizeGoldenCaseText(actualText);
  return expectations.map((expectation) => {
    const candidates = buildGoldenCaseNeedles(expectation).map(normalizeGoldenCaseText);
    const ok = candidates.some((needle) => needle && normalizedActual.includes(needle));
    return `${ok ? "OK" : "要確認"} - ${expectation}`;
  }).join("\n");
}

function buildGoldenCaseNeedles(expectation) {
  const value = String(expectation).includes("：")
    ? String(expectation).split("：").slice(1).join("：").trim()
    : String(expectation).includes(":")
      ? String(expectation).split(":").slice(1).join(":").trim()
      : "";
  return value ? [expectation, value] : [expectation];
}

function normalizeGoldenCaseText(value) {
  return String(value || "")
    .replace(/[：:]/g, ":")
    .replace(/[、，,／\/・\s]/g, "")
    .trim();
}

function loadSelectedGoldenCaseTopic() {
  const goldenCase = getSelectedGoldenCase();
  if (!goldenCase) return;
  if (state.mode !== goldenCase.mode && countCompletedAnswers() > 0 && !confirm("Golden Caseの対象モードへ切り替えます。既存ログは消しませんが、表示Step名が変わる可能性があります。続けますか？")) {
    return;
  }
  state.mode = goldenCase.mode;
  state.currentStep = normalizeStep(state.currentStep, state.mode);
  if (els.modeSelect) els.modeSelect.value = state.mode;
  if (els.roughTopic) els.roughTopic.value = goldenCase.theme;
  if (els.topicPromptText) els.topicPromptText.value = generateTopicCardPrompt(goldenCase.theme, state.mode);
  persist("Golden Caseの入力テーマをセットしました");
  render();
  setStatus(els.goldenCaseStatus, "入力テーマと対象モードをセットしました。会議ログは変更していません。");
  scrollToElement(els.goldenCasePanel);
}

async function copySelectedGoldenCaseSteering() {
  const goldenCase = getSelectedGoldenCase();
  if (!goldenCase) return;
  const text = goldenCase.steeringNotes.join("\n");
  await copyPlainText(text, els.goldenCaseStatus, "軌道修正メモをコピーしました。");
}

async function copyGoldenCaseEvaluation() {
  const goldenCase = getSelectedGoldenCase();
  if (!goldenCase) return;
  const actual = buildGoldenCaseActual(goldenCase);
  const evaluation = evaluateGoldenCase(goldenCase, actual);
  const text = formatGoldenCaseEvaluation(goldenCase, actual, evaluation, { includeActual: true });
  await copyPlainText(text, els.goldenCaseStatus, "Golden Case判定結果をコピーしました。");
}

function extractDeepResearchPrompt() {
  const answer = String(state.answers[String(getTotalSteps())] || "").trim();
  if (!answer) return "";
  const tagged = extractAiBoardBlock(answer, "DR_PROMPT_COMPLETE");
  if (tagged) return tagged;

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
    "## Deep Researchにそのまま貼れる完成プロンプト",
    "## Deep Research用プロンプト案"
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

function isExternalHttpUrl(url) {
  return (url.protocol === "http:" || url.protocol === "https:") && url.origin !== window.location.origin;
}

function getExternalLinkContext(link) {
  const context = link.closest("[data-exit-card-key], .review-complete-card, .deep-research-copy-card, .panel, section, article, [id]");
  if (!context) return "unknown";
  const id = context.id ? `#${context.id}` : "";
  const dataLabel = context.dataset ? context.dataset.exitCardKey || context.dataset.cardKey || "" : "";
  const heading = context.querySelector("h2, h3, h4, summary, legend")?.textContent?.trim() || "";
  const classLabel = typeof context.className === "string" ? context.className.trim().split(/\s+/).slice(0, 3).join(".") : "";
  return [id, dataLabel, heading, classLabel].filter(Boolean).join(" / ") || context.tagName.toLowerCase();
}

function hardenExternalLinks(root = document) {
  if (!root || typeof root.querySelectorAll !== "function") return;
  root.querySelectorAll("a[href]").forEach((link) => {
    let url;
    try {
      url = new URL(link.getAttribute("href") || "", window.location.href);
    } catch (error) {
      return;
    }
    if (!isExternalHttpUrl(url)) return;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.dataset.externalLink = "true";
    if (!link.title) link.title = `外部サイトを開きます: ${url.hostname}`;
  });
}

function setupExternalLinkDiagnostics() {
  hardenExternalLinks(document);
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const link = target ? target.closest("a[href]") : null;
    if (!link) return;
    let url;
    try {
      url = new URL(link.getAttribute("href") || "", window.location.href);
    } catch (error) {
      return;
    }
    if (!isExternalHttpUrl(url)) return;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    console.info("[AI Board] external link click", {
      href: url.href,
      hostname: url.hostname,
      linkText: link.textContent.trim().slice(0, 120),
      context: getExternalLinkContext(link)
    });
  }, true);
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

function formatCharacterCount(value) {
  return Number(value || 0).toLocaleString("ja-JP");
}

function resetMeeting() {
  if (!confirm("現在の会議内容をリセットします。よろしいですか？")) return;
  state.mode = "basic";
  state.topicCard = templates.general;
  state.quickFields = defaultQuickFields();
  state.deepResearchReviewForm = defaultDeepResearchReviewForm();
  state.deepResearchReviewImportLog = "";
  state.deepResearchReviewImportedFinalAnswer = "";
  state.promptContextMode = "full";
  state.preparationCollapsed = false;
  state.reviewResultsCollapsed = false;
  state.currentStep = 1;
  state.answers = {};
  state.steeringNotes = {};
  els.modeSelect.value = state.mode;
  fillQuickFields(state.quickFields);
  fillDeepResearchReviewForm(state.deepResearchReviewForm);
  if (els.deepResearchReviewImportLog) els.deepResearchReviewImportLog.value = "";
  els.topicCard.value = state.topicCard;
  els.steeringText.value = "";
  persist("新規会議を開始しました");
  render();
}

function setStatus(el, message, type = "") {
  if (!el) return;
  el.textContent = message || "";
  el.classList.toggle("error", type === "error");
  el.classList.toggle("warn", type === "warn");
}

init();
