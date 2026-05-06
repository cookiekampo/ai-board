# Manual Smoke Tests

このファイルは、Golden Case CLIでは拾えないブラウザUIの手動確認リストです。
Golden Caseはプロンプト構造、Ledger反映、出口カード抽出の回帰確認用であり、クリック操作やブラウザ固有挙動までは保証しません。

## Deep Research review から次調査カードで新規Deep Research設計を開始する

### 前提

- モード: `Deep Research結果レビュー`
- Step 8 `Final Judge` まで完了している、または過去ログ / Final Judge回答から出口カードを読み込んでいる
- Final Judge出力に `次調査カード` がある、またはfallback生成できるだけの `追加Deep Researchプロンプト案` / `Issue / 未解決論点` / `次アクション` がある

### 1. Deep Research review Final Judge後に確認すること

- `レビュー完了 / 出口カード` パネルが表示される
- `次調査カード` が表示される
- `次調査カード` に `議題カードとしてコピー` ボタンが表示される
- `次調査カード` に `このカードで新規Deep Research設計を開始` ボタンが表示される
- `議題カードとしてコピー` を押すと、次調査カード本文だけがコピーされる

### 2. 新規Deep Research設計開始ボタンの確認

- 既存ログがある状態で `このカードで新規Deep Research設計を開始` を押す
- 確認ダイアログが表示される
- キャンセルすると、現在のモード、会議ログ、議題カードが変わらない
- OKすると、モードが `Deep Researchプロンプト作成` に切り替わる
- 議題カード入力欄に次調査カード本文が入る
- Step 1のプロンプトがDeep Researchプロンプト作成モード用になる
- Decision Ledger / Answer Ledger は前回reviewのものを引き継がず、新規会議側で再構築される
- 前回review由来であることが議題カード本文に明記されている

### 3. 次調査カード本文の確認

次調査カード本文に、少なくとも以下が含まれていることを確認する。

- Deep Research review由来であること
- 元テーマ
- 前回レビューの採用可否
- 追加調査が必要な理由
- 次に調べるべきテーマ
- 次回Deep Researchの目的
- 対象読者
- 除外範囲
- 安全制約
- 情報源条件
- 出力形式
- 未解決Issue
- 仮置き条件

### 4. Golden Caseでは保証しないこと

Golden Case CLI / ブラウザRunnerは、以下を保証しない。

- UIクリック動作
- 確認ダイアログの表示とキャンセル/OKの状態遷移
- ブラウザのclipboard挙動
- Service Workerキャッシュ更新が実ブラウザに反映されたか
- iPhone / PC / プライベートブラウザ間の表示差
- 実際のDeep Research調査品質
- 医療内容、法律内容、金融内容などの正しさ

## 外部リンクと自動遷移の確認

Deep Research結果やAI回答に外部URLが含まれる場合、アプリ本体が勝手に外部サイトへ遷移しないことを確認する。

### 確認手順

1. Deep Research review または Deep Researchプロンプト作成モードの議題カード / 回答欄 / 出口カードに、外部URLを含むテキストを貼る
2. 画面を表示しただけで外部サイトが開かないことを確認する
3. 外部リンクとして表示されている箇所がある場合、リンクのDOMに `target="_blank"` と `rel="noopener noreferrer"` が付いていることを確認する
4. 外部リンクをクリックした場合、新規タブで開くことを確認する
5. DevTools Consoleに `[AI Board] external link click` が出ることを確認する
6. Consoleログに `href`、`hostname`、`linkText`、`context` が出ることを確認する
7. アプリ本体のタブが `medical.nikkeibp.co.jp` などの外部ドメインへ自動遷移していないことを確認する

### 情報源分類の確認

会員制医療サイト、標準医療を否定するページ、受診不要を示唆するページ、販売ページ、広告LP、個人ブログ、体験談、SNS投稿は、医学的根拠・処方根拠・安全性根拠として扱わない。
ただし、相談現場で触れられやすい誤情報、危険表現、受診回避につながる主張、販売誘導表現を把握する目的に限り、本文根拠とは別枠の危険表現レビューとして扱える。

### Golden Caseでは保証しないこと

Golden Case CLIは、外部リンクが実ブラウザでクリックされたか、ブラウザが新規タブを開いたか、Service Workerキャッシュが実端末で更新されたかまでは保証しない。
外部リンク挙動は、この手動Smoke Testで確認する。

## Service Worker更新確認

- `docs/service-worker.js` の `CACHE_NAME` が更新されている
- 通常ブラウザで古い表示が残る場合は、アプリの再読み込み、Service Worker更新、またはサイトデータ削除を試す
- プライベートブラウザでも表示が変わらない場合は、GitHub Pages / 配信元の反映待ち、または開いているURLのブランチ・デプロイ先違いを確認する
- 外部リンク確認後も古いリンク表示や旧JS挙動が残る場合は、Service Worker更新とサイトデータ削除を行う

## Golden Case fallback / JSON reload check

- Golden Case Runner should show `Loaded from docs/golden-cases.json: 7 cases` or the current expected case count.
- If `Fallback mode: golden-cases.json load failed` appears, check the error type shown in the panel.
- If the error includes `Cannot access ... before initialization`, treat it as an app.js JavaScript initialization-order bug, not as a JSON or Service Worker problem.
- After pressing `Golden Case JSONを再読み込み`, the UI must return to either a success state or a failure state.
- If `再読み込みしています...` remains visible, check fetch timeout handling, the `finally` path, and Service Worker cache state.
- The App cache shown in the Runner should match the current `CACHE_NAME`.

## Deep Research shortcuts and lightweight exit cards

Golden Caseでは拾えない、実ブラウザ上の初期導線と出口カードの確認項目です。

### 1. Deep Research系ショートカット

- 画面上部のモード選択エリアに `Deep Researchプロンプト作成` と `Deep Research結果レビュー` のショートカットが表示される。
- `Deep Researchプロンプト作成` を押すと、会議モードが Deep Researchプロンプト作成モードに切り替わる。
- `Deep Research結果レビュー` を押すと、会議モードが Deep Research reviewモードに切り替わる。
- 既存の会議モードselectも残っており、ショートカットとselectの選択状態が一致する。
- 初回表示では Deep Researchプロンプト作成モードが選ばれている。

### 2. Deep Research review入力導線

- Deep Research reviewモードを選ぶと、入力欄の見出しが `Deep Research結果を貼る` になる。
- 説明文が、Deep Researchの出力やレポート本文をレビューする用途になっている。
- placeholderが、Deep Research結果・元プロンプト・レビュー依頼を貼る想定になっている。
- 開始ボタンの文言が `レビューを開始` になる。
- Deep Research reviewモードでは、`雑テーマ` や通常の議題カード作成だけに見える文言が残らない。
- basic / decision / review に切り替えたとき、既存の通常導線が壊れていない。

### 3. Deep Research設計モードの出口カード

- Final QA後に、`本命プロンプト` と `2回目以降用・軽量版` が別カードで表示される。
- `本命プロンプト` は初期状態で開いている。
- `2回目以降用・軽量版` は初期状態で開いている。
- `推奨する実行順` は初期状態で開いている。
- `一発版`、`分割版`、`追加調査案`、`Decision Ledger`、`Answer Ledger`、`未回答時の仮置き` は補助カードとして閉じている。
- 各カードのコピーボタンで、該当カード本文だけがコピーされる。
- コピー後に一時的にコピー完了が分かる表示になる。

### 4. 軽量版プロンプトの内容

- 軽量版に Decision Ledger が含まれる。
- 軽量版に Answer Ledgerの重要回答が含まれる。
- 軽量版に今回の調査テーマ、確定条件、今回だけ深掘りする範囲、除外範囲、出力形式、安全制約が含まれる。
- 軽量版に、前回結果を前提に重複調査を避ける指示が含まれる。

### 5. Deep Research reviewから次調査カードで設計モードへ移る導線

- Deep Research reviewのFinal Judge後に、次調査カードが表示される。
- 次調査カードには `Deep Research review由来` と `2回目以降用・軽量版向け` が明記される。
- `この次調査カードで新規Deep Research設計を開始` を押すと、Deep Researchプロンプト作成モードに切り替わる。
- topicCard欄に次調査カード本文が入る。
- 新規側のDecision Ledger / Answer Ledgerは、前回reviewのものを直接引き継がず、新規Deep Research設計側で再構築される。

## Deep Research review Research Brief card

- Deep Research review完了後に `Research Brief / 研究ブリーフ` カードが表示される。
- Research Briefカードは初期展開され、個別コピーできる。
- Brief内に以下の12セクションがある。
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
- Claim / Evidence Tableが、検証済みの真実や推奨ではなくreview結果の整理として書かれている。
- What Can Be Used と What Cannot Be Used が分離されている。
- Next Research Prompts に追加調査プロンプトまたは次調査の方向性が残る。
- Decision Ledger / Answer Ledger がない場合、推測で生成されず `未提供` または `未抽出` と表示される。
- 一般向け安全変換版とは別カードとして表示される。
- Golden Case Runnerで `research brief` がPassする。

## Deep Research default strategy and canonical Golden Cases

## Deep Research review purpose-specific exit cards

- Deep Research review完了画面で「一般向け安全変換版」「薬剤師・相談員向け安全確認版」「専門職向け内部資料版」が表示される。
- 一般向け安全変換版には、処方推奨・生薬名からの自己判断・証の自己判定・好転反応としての様子見が出ていないことを確認する。
- 薬剤師・相談員向け安全確認版は、薬歴整理、副作用確認、受診勧奨、主治医確認につながる内容になっている。
- 専門職向け内部資料版は、処方名・生薬名・証を扱う場合でも病名処方、処方推奨、効果保証にしていない。
- 各カードのコピー按钮が動き、コピー後に一時的な完了表示が出る。
- 次調査カードからDeep Research設計モードへ渡す既存導線が壊れていない。

Deep Researchプロンプト作成モードは、初回導線として「一括で広く深く全体地図を作る」本命プロンプトを最上位に出すことを確認する。

1. 画面上部から `Deep Researchプロンプト作成` にすぐ入れる。
2. 画面上部から `Deep Research結果レビュー` にすぐ入れる。
3. Deep Research reviewモード選択時、入力欄がレビュー対象向けの文言になる。
4. Deep Researchプロンプト作成モードの出口カードで、`本命プロンプト` が最上位に表示される。
5. 本命プロンプトには、一括版が最終確定資料ではなく `Deep Research review` 用の全体地図であることが明記される。
6. `2回目以降用・軽量版` が表示される。
7. `分割調査案` と `推奨する実行順` が表示される。
8. Deep Research reviewモードで、専門職向けの濃い結果を一般向け安全メモや相談前メモへ変換できる。
9. reviewの次調査カードから、新規Deep Research設計に渡せる。
10. Golden Case Runnerでcanonical case `deep_research_wide_deep_one_shot` が表示される。
11. Golden Case JSON再読み込みで、Loaded / fallback状態が分かり、固まらない。

Golden Caseは医療内容の正しさを保証しない。出口カード、Ledger、完成プロンプト構造の回帰確認として扱う。
- 既存ログを残すかクリアするかの確認ダイアログが必要な場合、表示とキャンセル動作を確認する。
## Saved Deep Research review log restore

Use this check when localStorage was cleared or the app is opened in a private browser.

1. Open Deep Research review mode.
2. Open `保存済みログから出口カードを復元`.
3. Paste a saved Final Judge log, preferably `test-fixtures/golden-cases/finaljudge-interstitial-pneumonia-kampo-review.md`.
4. Click `出口カードを復元`.
5. Confirm the status shows restored card names, such as Research Brief, 一般向け安全変換版, 薬剤師・相談員向け安全確認版, 専門職向け内部資料版, 次調査カード, and 追加Deep Researchプロンプト案.
6. Confirm Research Brief appears only when the saved log includes `DR_REVIEW_RESEARCH_BRIEF` or a strict Research Brief section.
7. Confirm 改訂版成果物 is not automatically converted into Research Brief.
8. Confirm each restored card copy button works and shows the temporary copied status.
9. Confirm the 次調査カード buttons still work: copy as a topic card, and start a new Deep Research design from the card.
10. Confirm starting a new design fills `topicCard` with the handoff card and switches to Deep Researchプロンプト作成 mode.
11. Confirm existing Step answers are not overwritten by restore. If a current review session has answers, they should remain until the user explicitly starts a new design or clears the session.
12. Reload the page after restoring. The restored cards may disappear because restore is a temporary preview; the external Markdown log remains the source of truth.

## Deep Research用途別コピー導線

- Deep Researchプロンプト作成モードの出口カードで、本命プロンプトに `Deep Research向け / 重い / 初回・広く深く用` が表示される。
- `2回目以降用・軽量版` に `Deep Research向け / 軽い / 2回目以降の推奨` が表示される。
- `ChatGPTに意見をもらう用カード` が表示され、全文ログではなく軽量カードで相談する文言がある。
- Deep Research review完了画面で `ChatGPTに意見をもらう用カード` が表示される。
- ChatGPT相談向けカードには Research Brief、採用可否、未解決Issue、次アクション候補が含まれる。
- 各カードのコピー按钮が動き、コピー後に `コピーしました` が表示される。
- 保存済みログ復元で `DR_REVIEW_OPINION_REQUEST` マーカー付きログを貼ると、ChatGPT相談向けカードも復元される。
- Golden Case Runner / CLIで `opinion request` がPassする。

## Deep Research tabs / lightweight operation smoke check

Use this checklist after changes to the Deep Research entry flow.

1. Confirm the top Deep Research phase tabs are visible on desktop and iPhone width:
   - Deep Researchプロンプト作成
   - Deep Research結果レビュー
   - 保存済みログ復元
   - Golden Case
2. Tap `Deep Researchプロンプト作成` and confirm the app switches to Deep Research prompt creation without using the mode select.
3. Tap `Deep Research結果レビュー` and confirm the review form / review target copy is shown.
4. Tap `保存済みログ復元` and confirm the saved review log restore area is reachable.
5. Tap `Golden Case` and confirm the Golden Case Runner is reachable.
6. For a normal first-run topic, complete Final QA and confirm the exit-card recommendation says the first-run wide/deep prompt is recommended.
7. Start a new design from a Deep Research review handoff card and confirm the recommendation changes to the lightweight follow-up prompt.
8. Confirm both full and lightweight prompt cards are still present and copyable.
9. Confirm the Golden Case category filter is visible and can filter cases by `First Run`, `Review`, and `Medical Kampo`.
10. Confirm Golden Case JSON reload still shows Loaded/fallback status and does not hang.
