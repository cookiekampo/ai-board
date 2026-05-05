# Golden Cases

## Interstitial pneumonia kampo review Golden Case

- `interstitial_pneumonia_kampo_review_public_memo` is a Deep Research review regression case for interstitial pneumonia and kampo consultation.
- This case does not verify medical correctness.
- It verifies review exit card structure, safety constraints, and the rewrite policy for public-facing user memos.
- It checks that public-facing outputs do not overexpose formula names, crude drugs, or sho/pattern terminology.
- Formula-specific safety should be handed off to a follow-up Deep Research task for PMDA, latest package insert, and interview form confirmation.

このファイルは、AI会議室の重要な回帰テスト用ケースを記録する開発メモです。
ブラウザUIの `Golden Case Runner / 開発者用` でも、同じ期待値の一部を確認できます。

Golden Case Runner は完全なAI自動実行テストではありません。
ただし、現在の Decision Ledger / Answer Ledger / 出口カード抽出結果に対して、軽い自動Pass/Fail判定を行います。
期待値とActualを並べ、失敗条件・警告・確認済み項目を見ながら、過去の失敗ケースが再発していないか確認するための補助です。

---

## Golden Case 1: 線維筋痛症の漢方 / 漢方医向け

### 対象モード

Deep Researchプロンプト作成モード

### 入力テーマ

線維筋痛症の漢方

### 途中の軌道修正

- 1 漢方医
- 3 できれば初回から
- 1 yes
- 2 yes
- 3 yes
- 専門度 上級者向け
- 出力は長めになっても良い
- 処方群は広めに拾う
- 根拠は初回から

### 期待Decision Ledger

- 主読者：漢方医
- 副読者：薬剤師、漢方相談員、漢方薬局スタッフ、内部研修担当者
- 専門度：上級者向け
- 用途：内部学習・相談準備用
- 外部公開の有無：外部公開しない。患者配布・Web公開・販売促進は除外
- 初回調査範囲：医学的基礎・安全確認・受診勧奨・問診項目・症状クラスターに加え、証・処方群・生薬・処方意図も初回から含める
- 除外範囲：診断、個別処方判断、服薬変更指示、病名処方、処方ランキング、標準治療否定、販売促進
- 深掘りする項目：安全確認、受診勧奨、相談者分類、症状クラスター、問診項目、漢方医学的病態、証、処方群、生薬、処方意図
- 後続調査に回す項目：方剤別安全性の詳細、PMDA・添付文書照合、症例報告の網羅、エビデンスレビュー、問診票テンプレート化

### 期待出口カード

- 完成プロンプト
- 一発版プロンプト
- 分割版プロンプト
- 追加調査案
- Decision Ledger
- Answer Ledger

### 期待Final QA

- 古い仮置きの「漢方相談員・薬剤師向け」が主読者として残らない
- 最終プロンプトの対象読者が漢方医向けになる
- 処方・生薬・証・症状クラスターの概観が初回範囲に含まれる
- 方剤別PMDA照合、症例報告網羅、エビデンス評価は後続調査に残る

### 失敗とみなす条件

- 最終プロンプトの主読者が「漢方相談員・薬剤師向け」のまま残る
- 専門度「上級者向け」がDecision Ledgerまたは最終プロンプトに反映されない
- 「3は初回から」が無視され、処方・生薬・証・症状クラスターが後続調査だけに回る
- 外部公開、患者配布、Web公開、販売促進が除外されない
- Answer Ledgerが番号回答と直前質問を対応づけない
- Decision LedgerとFinal QAが矛盾しているのに `## 矛盾検出` が「なし」になる

---

## Golden Case 2: 線維筋痛症の漢方相談 / 漢方相談員向け

### 対象モード

Deep Researchプロンプト作成モード

### 入力テーマ

線維筋痛症の漢方相談

### 途中の軌道修正

- 医師ではない漢方相談員向け
- 処方や生薬は深掘りしない
- 安全確認と受診勧奨を中心にしたい
- 外部公開しない

### 期待Decision Ledger

- 主読者：漢方相談員
- 専門度：相談実務者向け
- 用途：内部学習・相談準備用
- 外部公開の有無：しない
- 初回調査範囲：安全確認、受診勧奨、問診項目、症状クラスター
- 処方・生薬：深掘りしない
- 除外範囲：診断、処方判断、服薬変更指示、病名処方

### 期待Final QA

- 主読者が漢方相談員になる
- 処方・生薬を深掘りしない
- 安全確認と受診勧奨を中心にする
- 外部公開しない

### 失敗とみなす条件

- 主読者が漢方医向けのまま残る
- 処方・生薬・証の深掘りが初回調査の中心になる
- 安全確認と受診勧奨が後続調査だけに回る
- 外部公開しない条件がFinal QAに反映されない

---

## Golden Case 3: 起立性調節障害の漢方 / 漢方医向け

### 対象モード

Deep Researchプロンプト作成モード

### 入力テーマ

起立性調節障害の漢方

### 途中の軌道修正

- 1 漢方医
- 用途は内部のみ
- 専門度 上級者向け
- 初回では方剤候補名を出さない
- 病名処方・処方ランキングは禁止

### 期待Decision Ledger

- 主読者：漢方医
- 用途：内部のみ
- 専門度：上級者向け
- 初回調査範囲：医学的基礎・安全確認・受診勧奨・医療連携・問診項目・症状クラスター・漢方医学的病態・証・改善仮説
- 初回では方剤候補名を出さない
- 除外範囲：患者配布、Web公開、販売促進、病名処方、処方ランキング

### 期待Answer Ledger

- 漢方医
- 内部のみ
- 上級者向け
- 初回では方剤候補名を出さない

### 期待出口カード

- 完成プロンプト
- 一発版プロンプト
- 分割版プロンプト
- 追加調査案
- Decision Ledger
- Answer Ledger

### 完成プロンプトに含むべき文言

- 方剤候補名は初回では出さない
- 病名処方・処方ランキングを禁止
- 漢方医
- 上級者向け
- 内部のみ

### 完成プロンプトに含めない文言

- 患者配布用として作成
- Web公開用として作成
- 販売促進を目的とする
- 方剤候補名を初回から列挙
- 処方ランキング形式で提示

### 期待Final QA

- 主読者が漢方医向けになる
- 専門度が上級者向けになる
- 初回では方剤候補名を出さない
- 病名処方・処方ランキングを禁止する

### 失敗とみなす条件

- 完成プロンプトに「方剤候補名は初回では出さない」が入らない
- 完成プロンプトに「病名処方・処方ランキングを禁止」が入らない
- 主読者が漢方医以外になる
- 患者配布、Web公開、販売促進が許可されたように見える
- 初回調査で方剤候補名の列挙や処方ランキングを要求する

---

## 手動確認手順

1. ブラウザで `Golden Case Runner / 開発者用` を開く。
2. Golden Caseを選ぶ。
3. `入力テーマをセット` で対象モードと雑テーマ欄をセットする。
4. 必要に応じて `軌道修正メモをコピー` で途中回答欄へ貼る。
5. 会議を進める。
6. Final QA完了後、Golden Case Runnerの `Actual Decision / Answer Ledger` と `Actual Exit Cards` を確認する。
7. `自動判定` の Overall / Failures / Warnings / Checked Items を確認する。
8. 必要なら `判定結果をコピー` で、caseId、Pass/Fail、失敗条件、警告、Actual Ledgerをコピーする。

---

## Node CLIチェック

Golden Case定義の唯一の正は `docs/golden-cases.json` です。
ブラウザUIのGolden Case Runnerは、現在の画面上のFinal QA結果や出口カードを目視確認するために使います。
Node CLIは、JSON定義の破損確認と、保存済みFinal QA Markdownに対する軽量なPass/Fail確認に使います。

### ケース一覧

```bash
node scripts/check-golden-cases.mjs --list
```

`caseId`、タイトル、対象モード、入力テーマを表示します。

### JSON定義の検証

```bash
node scripts/check-golden-cases.mjs --validate
```

確認内容:

- JSONとして読めるか
- 配列で1件以上あるか
- `caseId` が存在し、重複していないか
- `initialTopic` が存在するか
- `steeringMemos` が配列か
- 期待値フィールドが存在し、配列型になっているか

### Final QA Markdownの判定

```bash
node scripts/check-golden-cases.mjs --case <caseId> --actual <path-to-finalqa.md>
```

指定したGolden Caseの期待値と、保存済みFinal QA Markdownを照合します。
マーカーがある場合は `<!-- AI_BOARD:... -->` を優先し、ない場合はMarkdown見出しから可能な範囲で抽出します。

主な抽出対象:

- `AI_BOARD:DR_PROMPT_COMPLETE`
- `AI_BOARD:DR_PROMPT_ONE_SHOT`
- `AI_BOARD:DR_PROMPT_SPLIT`
- `AI_BOARD:DR_PROMPT_ADDITIONAL`
- `AI_BOARD:DR_PROMPT_ORDER`
- `AI_BOARD:DR_PROMPT_DECISION_LEDGER`
- `AI_BOARD:DR_PROMPT_ANSWER_LEDGER`
- `AI_BOARD:DR_PROMPT_QUESTIONS`
- `AI_BOARD:DR_PROMPT_ASSUMPTIONS`

### JSON出力

```bash
node scripts/check-golden-cases.mjs --case <caseId> --actual <path-to-finalqa.md> --json
```

CIや将来の自動化で使いやすい形式で、判定結果、Failures、Warnings、Checked Items、抽出状況を出力します。

### fixturePathを使った判定

各Golden Caseに `fixturePath` が設定されている場合、`--actual` を省略できます。

```bash
node scripts/check-golden-cases.mjs --case <caseId>
```

fixtureは `test-fixtures/golden-cases/` に置きます。
fixtureはFinal QA出力の構造確認用であり、医療内容の正しさを保証するものではありません。

### fixture更新方針

Golden Case fixtureは、医療内容の妥当性を保証するためのものではありません。確認対象は、Deep Research設計モードの出口カード、Decision Ledger / Answer Ledger、完成プロンプト構造、マーカー抽出の回帰です。

Final QAの出力仕様を変更した場合は、fixtureも同時に更新してください。特に、出口カードUIで使う以下のマーカーは、対応するGolden Caseの `expectedExitCards` と揃える必要があります。

- `AI_BOARD:DR_PROMPT_COMPLETE`
- `AI_BOARD:DR_PROMPT_ORDER`
- `AI_BOARD:DR_PROMPT_ADDITIONAL`
- `AI_BOARD:DR_PROMPT_DECISION_LEDGER`
- `AI_BOARD:DR_PROMPT_ANSWER_LEDGER`
- `AI_BOARD:DR_PROMPT_ASSUMPTIONS`

`販売ページ`、`個人ブログ`、`体験談` などの扱いは、医学的根拠として採用するかどうかではなく、プロンプト内での情報源指定や危険表現レビューの構造が崩れていないかを確認するために使います。

### Deep Research review の出口カード

Deep Research reviewモードでは、Final Judgeの長いレビューから、ユーザーが次の作業に使う出口カードを抽出します。確認対象は医療内容の正しさではなく、以下のような成果物の切り出し構造です。

- 採用可否
- 危険な内容
- 改訂版成果物
- 追加Deep Researchプロンプト案
- 次アクション
- 結論の自信度
- Issue / 未解決論点
- 次Stepへの引き継ぎ
- 次調査カード

review用fixtureでは、以下のマーカーを優先して使います。古いログでは見出しベースのfallback抽出を許容します。

- `AI_BOARD:DR_REVIEW_ADOPTION`
- `AI_BOARD:DR_REVIEW_REVISED_ARTIFACT`
- `AI_BOARD:DR_REVIEW_ADDITIONAL_PROMPTS`
- `AI_BOARD:DR_REVIEW_NEXT_ACTION`
- `AI_BOARD:DR_REVIEW_RISK`
- `AI_BOARD:DR_REVIEW_CONFIDENCE`
- `AI_BOARD:DR_REVIEW_ISSUES`
- `AI_BOARD:DR_REVIEW_HANDOFF`
- `AI_BOARD:DR_REVIEW_HANDOFF_CARD`

`次調査カード` は、Deep Research review の結果を次の Deep Researchプロンプト作成モードへ渡すための議題カードです。採用可否、追加調査が必要な理由、次に調べるべきテーマ、未解決Issue、仮置き条件をまとめます。
Final Judgeが `AI_BOARD:DR_REVIEW_HANDOFF_CARD` を出せない古いログでは、追加Deep Researchプロンプト案、Issue / 未解決論点、次アクション、採用可否、危険な内容、修正すべき内容からfallback生成します。

運用例:

1. Deep Research結果を `Deep Research review` でレビューする。
2. Final Judge後の出口カードで `次調査カード` を確認する。
3. `このカードで新規Deep Research設計を開始` を押し、Deep Researchプロンプト作成モードの議題カードとして読み込む。
4. 次回調査の目的、除外範囲、安全制約、情報源条件、出力形式を調整してDeep Research用プロンプトを作る。

Golden Caseでは、`次調査カード` に元テーマ、次回Deep Researchの目的、対象読者、除外範囲、安全制約、情報源条件、出力形式、未解決Issue、仮置き条件が含まれることを確認します。

実ブラウザでのクリック動作、clipboard、Service Worker更新は Golden Case では保証しません。
Deep Research review から次調査カードで新規Deep Research設計を開始する導線は、[manual-smoke-tests.md](./manual-smoke-tests.md) のチェックリストで確認してください。

Final Judgeの出力仕様を変更した場合は、Deep Research設計モード用fixtureだけでなく、Deep Research review用fixtureも更新してください。

### Research Brief / 研究ブリーフ

Deep Research reviewモードでは、Final Judge後の出口カードとして `Research Brief / 研究ブリーフ` を追加します。
これは改訂版成果物、一般向け安全変換版、専門職向け内部資料版とは別の、再利用可能な研究整理カードです。

優先マーカーは `AI_BOARD:DR_REVIEW_RESEARCH_BRIEF` です。
マーカーがない古いログでは、`# Research Brief` と以下の主要セクションが揃っている場合だけ見出し抽出します。
改訂版成果物からResearch Briefを自動生成するfallbackは行いません。

- Executive Summary
- Research Question
- Key Findings
- Claim / Evidence Table
- Source Quality
- Risk / Safety Notes
- What Can Be Used
- What Cannot Be Used
- Open Questions
- Next Research Prompts
- Decision Ledger
- Answer Ledger

Claim / Evidence Tableは、検証済みの真実や推奨ではなく、review結果の整理として扱います。
Decision Ledger / Answer Ledger は入力に存在する場合のみ反映し、存在しない場合は `未提供` または `未抽出` と明記します。

### 全ケース判定

```bash
node scripts/check-golden-cases.mjs --all
node scripts/check-golden-cases.mjs --all --json
```

`docs/golden-cases.json` の全ケースを走査し、各caseの `fixturePath` にあるFinal QA Markdownを判定します。
1件でもFailがあればexit code `1` になります。
Warningのみの場合はexit code `0` のままです。

### npm scripts

最小の `package.json` には、Golden Case確認用のscriptだけを定義しています。

```bash
npm run golden:list
npm run golden:validate
npm run golden:test
npm run golden:test -- --json
```

### CI

GitHub Actions の `Golden Cases` workflow では、push / pull_request / workflow_dispatch 時に以下を実行します。

```bash
node --check scripts/check-golden-cases.mjs
node --check docs/app.js
node --check docs/service-worker.js
node -e "JSON.parse(require('fs').readFileSync('docs/golden-cases.json','utf8'))"
npm run golden:validate
npm run golden:test
npm run golden:test -- --json
```

`package-lock.json` が存在する場合のみ `npm ci` を実行します。存在しない場合は依存インストールをスキップします。

Golden Caseは、Deep Research設計モードのプロンプト構造、Decision Ledger / Answer Ledger の反映、出口カード抽出の回帰確認です。
fixtureは個人情報や実患者情報を含めず、医療内容の正しさを保証するものではありません。

### Exit code

- `0`: Pass
- `1`: JSON構造またはGolden Case判定がFail
- `2`: JSON parse不能、引数不正、指定ファイルが読めない、指定caseIdが存在しない

### ブラウザUIとの役割分担

- ブラウザUI: 現在の会議状態と出口カードを見ながら手動確認する
- Node CLI: `docs/golden-cases.json` の破損確認と、保存済みFinal QA Markdownの軽量判定を行う

### Golden Case JSONの読み込み確認

Golden Case定義の正は `docs/golden-cases.json` です。
ブラウザUIでGolden Caseが1件しか表示されない場合は、`golden-cases.json` の読み込みに失敗し、`app.js` 内の最小fallbackだけが表示されている可能性が高いです。

Golden Case Runner上部の読み込み状態を確認してください。

- `Loaded from docs/golden-cases.json: N cases` が出ていればJSON読み込み成功
- `Fallback mode: golden-cases.json load failed` が出ていればfallback中
- fallback中は、local server、Service Worker cache、JSON parseエラーを確認する

確認手順:

1. 可能なら `file://` ではなく、local serverまたはGitHub Pagesで開く
2. `Golden Case JSONを再読み込み` ボタンを押す
3. caseId一覧に期待するケースが出るか確認する
4. 古い表示が残る場合は、Service Worker cacheを更新または削除して再読み込みする
5. CLIで `node scripts/check-golden-cases.mjs --validate --min-cases 4` を実行する

Golden Case Runnerは医療内容の正しさを保証しません。
確認対象は、出口カード、Ledger、完成プロンプト構造、マーカー抽出、期待文言の回帰です。
