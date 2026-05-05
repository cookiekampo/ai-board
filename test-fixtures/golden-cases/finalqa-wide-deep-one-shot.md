# Final QA fixture: Deep Research設計 canonical / 一括で広く深く全体地図

## 調査戦略

判定：C. 一括で全体地図 → Deep Research review → 必要部分だけ分割

このケースでは、一括で広く深く全体地図を作る初回Deep Researchを本命プロンプトにする。
一括版は最終確定資料ではありません。全体像、論点、情報源候補、安全上の赤旗を集め、Deep Research reviewにかけるためのreview用の全体地図です。
一括版だけで最終判断せず、review後に抜け漏れ、根拠の弱さ、危険箇所を確認し、必要部分だけ分割Deep Researchで深掘りします。

<!-- AI_BOARD:DR_PROMPT_DECISION_LEDGER:START -->
## 確定済み条件 / Decision Ledger

- 調査戦略：C. 一括で全体地図 → Deep Research review → 必要部分だけ分割
- 本命プロンプト：一括・広く深く版
- 一括版は最終確定資料ではなくreview用の全体地図
- 高リスク領域では安全性優先
- 除外範囲：病名処方、処方ランキング、標準治療否定、受診不要示唆、効果保証
<!-- AI_BOARD:DR_PROMPT_DECISION_LEDGER:END -->

<!-- AI_BOARD:DR_PROMPT_ANSWER_LEDGER:START -->
## 回答済み質問 / Answer Ledger

- Q1: 初回は一括で広く深く全体地図を作る方針でよいか？
  - A1: はい。一括で広く深く全体地図を作る。
- Q2: 一括結果をどう扱うか？
  - A2: Deep Research reviewにかけ、review後に必要部分だけ分割する。
<!-- AI_BOARD:DR_PROMPT_ANSWER_LEDGER:END -->

<!-- AI_BOARD:DR_PROMPT_COMPLETE:START -->
## Deep Researchに貼る完成プロンプト

あなたは医療安全と情報源評価に配慮できる調査担当者です。
以下のテーマについて、一括・広く深く版のDeep Researchを行ってください。

### 調査テーマ
間質性肺炎に対する漢方診療・漢方相談について、全体像、論点、情報源候補、安全上の赤旗を整理してください。

### この調査の位置づけ
この一括版は最終確定資料ではありません。
Deep Research reviewにかけるためのreview用の全体地図です。
一括版だけで最終判断しないでください。
調査結果は必ずDeep Research reviewにかけ、抜け漏れ、根拠の弱さ、危険箇所を確認してください。
必要に応じて、添付文書照合、症例報告、エビデンス評価、一般向け変換などを分割Deep Researchで行います。

### 優先情報源
- PMDA・添付文書
- 厚生労働省・PMDA安全性情報
- 診療ガイドライン
- 学会資料
- PubMed / J-STAGE等の論文

### 禁止事項
- 病名処方・処方ランキングを禁止
- 標準治療否定、受診不要示唆、効果保証をしない
- 「間質性肺炎にはこの漢方」と断定しない
- 診断、処方決定、服薬変更指示は行わない

### 出力形式
1. 全体像
2. 安全上の赤旗
3. 情報源候補
4. 根拠が弱い論点
5. reviewで重点確認すべき点
6. 必要部分だけ分割Deep Researchする候補
<!-- AI_BOARD:DR_PROMPT_COMPLETE:END -->

<!-- AI_BOARD:DR_PROMPT_LIGHTWEIGHT:START -->
## 2回目以降用・軽量版プロンプト

前回のDeep Research review結果とDecision Ledgerを前提に、今回だけ深掘りする範囲を調査してください。
前回確認済みの全体像は繰り返さず、未解決Issueだけに集中してください。
安全制約、除外範囲、情報源条件は維持してください。
<!-- AI_BOARD:DR_PROMPT_LIGHTWEIGHT:END -->

<!-- AI_BOARD:DR_PROMPT_SPLIT:START -->
## 分割調査案

1. 方剤別PMDA・添付文書照合
2. 症例報告・専門家経験知の探索
3. エビデンスレビュー
4. 一般ユーザー向け相談前メモ化
<!-- AI_BOARD:DR_PROMPT_SPLIT:END -->

<!-- AI_BOARD:DR_PROMPT_ORDER:START -->
## 推奨する実行順

1. 一括・広く深く版で全体地図を作る
2. Deep Research reviewで採用可否、危険な内容、抜け漏れを確認する
3. 必要部分だけ分割Deep Researchで深掘りする
4. review結果をもとに一般向け・相談員向け・薬剤師向け成果物へ変換する
<!-- AI_BOARD:DR_PROMPT_ORDER:END -->

<!-- AI_BOARD:DR_PROMPT_ADDITIONAL:START -->
## 追加調査案

### 安全性を補う調査
- 方剤別最新添付文書・PMDA照合

### 根拠を補う調査
- ガイドライン・CQ確認
- RCT・レビュー確認

### 実用性を高める調査
- 一般ユーザー向け相談前メモ化

### 学習価値を高める調査
- 漢方医学的病態・証の整理

### 改善仮説を作る調査
- 処方・生薬・症状クラスター整理
<!-- AI_BOARD:DR_PROMPT_ADDITIONAL:END -->

<!-- AI_BOARD:DR_PROMPT_ASSUMPTIONS:START -->
## 未回答の場合の仮置き

- 初回は一括・広く深く版を優先
- 一括版は最終確定資料ではなくreview用の全体地図
- review後に必要部分だけ分割Deep Researchする
<!-- AI_BOARD:DR_PROMPT_ASSUMPTIONS:END -->
