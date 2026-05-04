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
- 個人ブログ・体験談：
- 販売ページ：

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
      instruction: `Deep Researchで優先すべき情報源、補助的に使う情報源、除外すべき情報源を設計してください。
情報源ごとの実務上の扱いも明確にしてください。

必ず以下を含めてください。
- 優先すべき情報源
- 補助的に使う情報源
- 原則除外する情報源
- 一次情報が必要な論点
- 最新性が重要な論点
- 情報源ごとの扱い
- 根拠が弱い場合の扱い
- Deep Researchプロンプトに入れる情報源指定文

医療・漢方では、診療ガイドライン、学会資料、PMDA、添付文書、PubMed等の論文、システマティックレビュー、専門医向け資料を優先候補にしてください。
個人ブログ、体験談、販売ページ、広告的クリニック記事、効果を断定するページは原則除外または注意扱いにしてください。

必ず最後に以下を含めてください。
## 成果物更新
## 次Stepへの引き継ぎ
## ユーザーへの確認質問
### 必須確認
最大3つまで。
### 任意確認
必要な場合のみ。
### 未回答の場合の仮置き`,
      note: `情報源指定が弱いと、Deep Researchは一般論や広告寄り情報に流れます。優先度と除外条件を明確にしてください。`
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
- 販売ページは根拠にしない
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
## 推奨する調査構成
病名×漢方テーマでは、医学的基礎、安全確認、漢方医学的病態、処方群・生薬・証、症状クラスター、症例報告・専門家経験知、エビデンス、読者別成果物化を必要に応じて分けてください。
## 情報源設計
## 安全制約・禁止事項
リスク判定は 低 / 中 / 高 のいずれかで明記してください。
## 補完軸の判定
安全性、根拠、実用性、学習価値、改善仮説のうち、今回優先する軸を明記してください。
## Deep Research用プロンプト案
### 一発版
### 分割版
必要な場合のみ、各回のプロンプトを分けてください。
## Deep Researchに貼る完成プロンプト
ここから下をDeep Researchに貼ってください。
---
本文
---
ここまで
## 避けるべき出力
## 次アクション
## 追加調査案
### 安全性を補う調査
### 根拠を補う調査
### 実用性を高める調査
### 学習価値を高める調査
### 改善仮説を作る調査
## ユーザーへの確認質問
### 必須確認
最大3つまで。質問で処理を止めず、未回答時の仮置きも示してください。
### 任意確認
必要な場合のみ。
### 未回答の場合の仮置き

Final QAでは以下を確認してください。
- 目的が曖昧ではないか
- 読者が曖昧ではないか
- 一発か分割か判定されているか
- 情報源が指定されているか
- 高リスク領域の安全制約があるか
- 出力形式が明確か
- 避けるべき出力が明記されているか
- 未確定事項が最後の質問欄に集約されているか`,
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
必ず以下を含めてください。
- 信頼できる情報源
- 根拠が弱い情報源
- 古い情報
- 出典不明の主張
- 一次情報で確認すべき主張
- 根拠レベル
- 追加確認すべき情報源

根拠レベルは以下を基本にしてください。
- A: 公的機関・一次情報・公式資料
- B: ガイドライン・専門機関資料
- C: 査読論文・レビュー論文
- D: 専門家解説・医療機関資料
- E: メーカー公式情報
- F: 一般記事・個人ブログ・体験談`,
      note: `情報源の種類、古さ、一次情報かどうかを分け、根拠が弱い情報を結論の中心に置かないでください。`
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
- 専門家確認が必要な内容
- 禁止すべき使い方
- 個人情報・機密情報の懸念
- 安全に使うための制約`,
      note: `危険な内容と使える内容を混ぜないでください。高リスク領域では安全性を優先してください。`
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
必ず以下を含めてください。
- 採用できる内容
- 削るべき内容
- 修正すべき内容
- 改訂版成果物
- 注意事項
- 追加Deep Researchプロンプト案`,
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
## 情報源レビュー
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
  "自信度の理由"
];

const deepResearchReviewFormDefs = {
  focus: "deepResearchReviewFocus",
  risk: "deepResearchReviewRisk",
  artifact: "deepResearchReviewArtifact"
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
  deepResearchReviewInputPanel: document.getElementById("deepResearchReviewInputPanel"),
  deepResearchReviewOriginalPrompt: document.getElementById("deepResearchReviewOriginalPrompt"),
  deepResearchReviewResult: document.getElementById("deepResearchReviewResult"),
  deepResearchReviewPurpose: document.getElementById("deepResearchReviewPurpose"),
  deepResearchReviewNotes: document.getElementById("deepResearchReviewNotes"),
  applyDeepResearchReviewFormButton: document.getElementById("applyDeepResearchReviewFormButton"),
  deepResearchReviewFormStatus: document.getElementById("deepResearchReviewFormStatus"),
  deepResearchReviewImportLog: document.getElementById("deepResearchReviewImportLog"),
  applyDeepResearchReviewImportButton: document.getElementById("applyDeepResearchReviewImportButton"),
  clearDeepResearchReviewImportButton: document.getElementById("clearDeepResearchReviewImportButton"),
  deepResearchReviewImportStatus: document.getElementById("deepResearchReviewImportStatus"),
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
  shortcutChatGptButton: document.getElementById("shortcutChatGptButton"),
  shortcutClaudeButton: document.getElementById("shortcutClaudeButton"),
  shortcutGeminiButton: document.getElementById("shortcutGeminiButton"),
  copyStatus: document.getElementById("copyStatus"),
  answerText: document.getElementById("answerText"),
  steeringText: document.getElementById("steeringText"),
  saveAnswerButton: document.getElementById("saveAnswerButton"),
  answerStatus: document.getElementById("answerStatus"),
  logPreview: document.getElementById("logPreview"),
  deepResearchReviewCompletePanel: document.getElementById("deepResearchReviewCompletePanel"),
  copyDeepResearchReviewFullButton: document.getElementById("copyDeepResearchReviewFullButton"),
  copyDeepResearchReviewArtifactButton: document.getElementById("copyDeepResearchReviewArtifactButton"),
  copyDeepResearchReviewPracticalButton: document.getElementById("copyDeepResearchReviewPracticalButton"),
  copyDeepResearchReviewAdditionalPromptButton: document.getElementById("copyDeepResearchReviewAdditionalPromptButton"),
  copyDeepResearchReviewIssuesButton: document.getElementById("copyDeepResearchReviewIssuesButton"),
  startNewDeepResearchReviewButton: document.getElementById("startNewDeepResearchReviewButton"),
  deepResearchReviewCompleteStatus: document.getElementById("deepResearchReviewCompleteStatus"),
  deepResearchReviewAdoptionText: document.getElementById("deepResearchReviewAdoptionText"),
  deepResearchReviewAdoptionConditionsText: document.getElementById("deepResearchReviewAdoptionConditionsText"),
  deepResearchReviewUsableText: document.getElementById("deepResearchReviewUsableText"),
  deepResearchReviewDangerousText: document.getElementById("deepResearchReviewDangerousText"),
  deepResearchReviewArtifactText: document.getElementById("deepResearchReviewArtifactText"),
  deepResearchReviewAdditionalPromptText: document.getElementById("deepResearchReviewAdditionalPromptText"),
  deepResearchReviewIssuesText: document.getElementById("deepResearchReviewIssuesText"),
  deepResearchReviewNextActionsText: document.getElementById("deepResearchReviewNextActionsText"),
  deepResearchCopyPanel: document.getElementById("deepResearchCopyPanel"),
  deepResearchPromptText: document.getElementById("deepResearchPromptText"),
  copyDeepResearchPromptButton: document.getElementById("copyDeepResearchPromptButton"),
  shortcutDeepResearchChatGptButton: document.getElementById("shortcutDeepResearchChatGptButton"),
  deepResearchCopyStatus: document.getElementById("deepResearchCopyStatus"),
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
  preparationBody: document.querySelector(".step-zero"),
  preparationPanel: document.querySelector(".step-zero") ? document.querySelector(".step-zero").closest(".panel") : null,
  stepActions: document.querySelector(".step-actions"),
  deepResearchReviewCompleteGrid: document.querySelector(".review-complete-grid")
};

init();

function init() {
  els.topicCard.value = state.topicCard;
  els.modeSelect.value = state.mode;
  els.setupDoneCheckbox.checked = state.setupDone;
  fillQuickFields(state.quickFields);
  fillDeepResearchReviewForm(state.deepResearchReviewForm);
  if (els.deepResearchReviewImportLog) els.deepResearchReviewImportLog.value = state.deepResearchReviewImportLog || "";
  if (els.promptContextModeSelect) els.promptContextModeSelect.value = state.promptContextMode || "full";
  els.topicPromptText.value = generateTopicCardPrompt(els.roughTopic.value, state.mode);
  bindEvents();
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
  els.shortcutTopicChatGptButton.addEventListener("click", () => copyTopicPromptAndRunShortcut("chatgpt"));
  els.shortcutTopicClaudeButton.addEventListener("click", () => copyTopicPromptAndRunShortcut("claude"));
  els.shortcutTopicGeminiButton.addEventListener("click", () => copyTopicPromptAndRunShortcut("gemini"));
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
  els.shortcutChatGptButton.addEventListener("click", () => copyAndRunShortcut("chatgpt"));
  els.shortcutClaudeButton.addEventListener("click", () => copyAndRunShortcut("claude"));
  els.shortcutGeminiButton.addEventListener("click", () => copyAndRunShortcut("gemini"));
  els.steeringText.addEventListener("input", saveCurrentSteeringNote);
  els.saveAnswerButton.addEventListener("click", saveAnswerAndNext);
  els.copyDeepResearchPromptButton.addEventListener("click", copyDeepResearchPrompt);
  els.shortcutDeepResearchChatGptButton.addEventListener("click", copyDeepResearchPromptAndRunChatGptShortcut);
  if (els.copyDeepResearchReviewFullButton) {
    els.copyDeepResearchReviewFullButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("full"));
  }
  if (els.copyDeepResearchReviewArtifactButton) {
    els.copyDeepResearchReviewArtifactButton.addEventListener("click", () => copyDeepResearchReviewCompletePart("artifact"));
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
  if (els.startNewDeepResearchReviewButton) {
    els.startNewDeepResearchReviewButton.addEventListener("click", startNewDeepResearchReview);
  }
  els.copyMarkdownButton.addEventListener("click", () => copyText(els.markdownText.value, els.markdownText, els.markdownStatus));
  els.shareMarkdownButton.addEventListener("click", shareMarkdown);
  els.downloadMarkdownButton.addEventListener("click", downloadMarkdown);
  els.setupToggleButton.addEventListener("click", toggleSetupPanel);
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
- 個人ブログ・体験談:
- 販売ページ:
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
- 「情報源の条件」には、優先したい情報源や避けたい情報源が不明なら「要確認」と書く
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
    mode: "basic",
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
      deepResearchReviewImportLog: typeof parsed.deepResearchReviewImportLog === "string" ? parsed.deepResearchReviewImportLog : "",
      deepResearchReviewImportedFinalAnswer: typeof parsed.deepResearchReviewImportedFinalAnswer === "string" ? parsed.deepResearchReviewImportedFinalAnswer : "",
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

function extractDeepResearchReviewFinalJudgeAnswer(text) {
  const source = String(text || "").trim().replace(/\r\n/g, "\n");
  if (!source) return "";
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
    setStatus(els.deepResearchReviewImportStatus, "過去のAI会議ログ、またはStep 8 Final Judgeの回答を貼ってください。", "error");
    return;
  }
  const finalAnswer = extractDeepResearchReviewFinalJudgeAnswer(raw);
  if (!finalAnswer) {
    setStatus(els.deepResearchReviewImportStatus, "Step 8 Final Judge、またはFinal Judgeの見出し付き回答を抽出できませんでした。", "error");
    return;
  }
  state.mode = "deepResearchReview";
  state.deepResearchReviewImportLog = raw;
  state.deepResearchReviewImportedFinalAnswer = finalAnswer;
  state.preparationCollapsed = true;
  state.reviewResultsCollapsed = false;
  els.modeSelect.value = state.mode;
  persist("過去ログからDeep Research reviewの出口カードを作成しました");
  render();
  setStatus(els.deepResearchReviewImportStatus, "出口カードを作成しました。下のレビュー完了画面を確認してください。");
  scrollToElement(els.deepResearchReviewCompletePanel);
}

function clearDeepResearchReviewImportedLog() {
  state.deepResearchReviewImportLog = "";
  state.deepResearchReviewImportedFinalAnswer = "";
  if (els.deepResearchReviewImportLog) els.deepResearchReviewImportLog.value = "";
  persist("Deep Research reviewの読み込みをクリアしました");
  render();
  setStatus(els.deepResearchReviewImportStatus, "読み込みをクリアしました。");
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
  renderDeepResearchReviewInputPanel();
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
  updateRecommendedAiButtons(step.target);
  els.logPreview.textContent = buildMeetingLog(state.answers, state.steeringNotes) || "まだ会議ログはありません。";
  els.markdownText.value = generateMarkdown();
  renderDeepResearchReviewCompletePanel();
  renderDeepResearchCopyPanel();
  renderWorkflowLayout(complete);
}

function renderDeepResearchReviewInputPanel() {
  if (!els.deepResearchReviewInputPanel) return;
  els.deepResearchReviewInputPanel.hidden = state.mode !== "deepResearchReview";
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
  if (state.promptContextMode === "light") {
    return generateLightPrompt(stepNumber, step, answers);
  }
  return generateFullPrompt(stepNumber, topicCard, answers, steeringNotes);
}

function generateFullPrompt(stepNumber, topicCard, answers, steeringNotes) {
  const step = getSteps()[stepNumber - 1];
  const meetingLog = buildMeetingLogBefore(answers, steeringNotes, stepNumber) || "まだ会議ログはありません。";
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

  return `このプロンプトは、同じチャットスレッド内で前の会議ログが共有されている前提の軽量版です。新規チャット、別AI、別モデルに渡す場合は完全版を使ってください。
前の会議ログを前提に続けてください。

## 会議モード
${modeLabels[state.mode] || modeLabels.basic}

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

async function copyPlainText(text, statusEl, successMessage) {
  const buffer = document.createElement("textarea");
  buffer.value = text;
  buffer.setAttribute("readonly", "");
  buffer.style.position = "fixed";
  buffer.style.left = "-9999px";
  buffer.style.top = "0";
  document.body.appendChild(buffer);
  const ok = await copyText(text, buffer, statusEl, false);
  document.body.removeChild(buffer);
  if (ok) setStatus(statusEl, successMessage || "コピーしました");
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

function buildDeepResearchReviewCompleteParts() {
  const full = getDeepResearchReviewFinalAnswer();
  return {
    full,
    adoption: extractDeepResearchReviewSection(full, ["採用可否"]),
    adoptionConditions: extractDeepResearchReviewSection(full, ["採用条件"]),
    usable: extractDeepResearchReviewSection(full, ["採用できる内容"]),
    dangerous: extractDeepResearchReviewSection(full, ["危険な内容", "危険なため使わない内容"]),
    artifact: extractDeepResearchReviewSection(full, ["改訂版成果物"]),
    additionalPrompt: extractDeepResearchReviewSection(full, ["追加Deep Researchプロンプト案", "追加Deep Researchプロンプト"]),
    issues: extractDeepResearchReviewSection(full, ["Issue / 未解決論点", "未解決Issue", "未解決論点"]),
    nextActions: extractDeepResearchReviewSection(full, ["次アクション"])
  };
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
    [
      els.deepResearchReviewAdoptionText,
      els.deepResearchReviewAdoptionConditionsText,
      els.deepResearchReviewUsableText,
      els.deepResearchReviewDangerousText,
      els.deepResearchReviewArtifactText,
      els.deepResearchReviewAdditionalPromptText,
      els.deepResearchReviewIssuesText,
      els.deepResearchReviewNextActionsText
    ].forEach((el) => setReviewCompleteText(el, ""));
    setStatus(els.deepResearchReviewCompleteStatus, "");
    return;
  }

  const parts = buildDeepResearchReviewCompleteParts();
  setReviewCompleteText(els.deepResearchReviewAdoptionText, parts.adoption);
  setReviewCompleteText(els.deepResearchReviewAdoptionConditionsText, parts.adoptionConditions);
  setReviewCompleteText(els.deepResearchReviewUsableText, parts.usable);
  setReviewCompleteText(els.deepResearchReviewDangerousText, parts.dangerous);
  setReviewCompleteText(els.deepResearchReviewArtifactText, parts.artifact);
  setReviewCompleteText(els.deepResearchReviewAdditionalPromptText, parts.additionalPrompt);
  setReviewCompleteText(els.deepResearchReviewIssuesText, parts.issues);
  setReviewCompleteText(els.deepResearchReviewNextActionsText, parts.nextActions);
}

function getDeepResearchReviewCopyPayload(kind) {
  const parts = buildDeepResearchReviewCompleteParts();
  if (kind === "full") return { text: parts.full, label: "レビュー全文" };
  if (kind === "artifact") return { text: parts.artifact || parts.full, label: "改訂版成果物" };
  if (kind === "practical") return { text: parts.artifact || parts.full, label: "実用版" };
  if (kind === "additionalPrompt") return { text: parts.additionalPrompt || parts.full, label: "追加Deep Researchプロンプト案" };
  if (kind === "issues") return { text: parts.issues || parts.full, label: "未解決Issue" };
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

async function copyDeepResearchPromptAndRunChatGptShortcut() {
  const prompt = els.deepResearchPromptText.value.trim();
  if (!prompt) {
    setStatus(els.deepResearchCopyStatus, "コピーできるDeep Research用プロンプトがまだありません。", "warn");
    return;
  }
  await copyTextAndRunShortcut("chatgpt", prompt, els.deepResearchPromptText, els.deepResearchCopyStatus);
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
  el.textContent = message || "";
  el.classList.toggle("error", type === "error");
  el.classList.toggle("warn", type === "warn");
}
