# Golden Case Fixture: 線維筋痛症Deep Research結果レビュー

このfixtureは、Deep Research reviewモードの出口カード抽出・Ledger構造・コピー導線の回帰確認用です。
医療内容の正しさを保証するものではありません。

## 採用可否
<!-- AI_BOARD:DR_REVIEW_ADOPTION:START -->
Conditional Pass。
安全資料・医学的基礎資料としては条件付きで採用できる。
ただし、漢方処方・生薬・証・症状クラスターの学習資料としては Needs More Research。
<!-- AI_BOARD:DR_REVIEW_ADOPTION:END -->

## 採用条件
<!-- AI_BOARD:DR_REVIEW_CONDITIONS:START -->
- 診断、処方決定、服薬開始・中止・変更の判断に使わない。
- 個別方剤名や副作用名は、PMDA・添付文書・専門家確認がある場合のみ扱う。
- 一般向けに出す場合は処方名を前面に出さず、相談準備用の質問に変換する。
<!-- AI_BOARD:DR_REVIEW_CONDITIONS:END -->

## 採用できる内容
<!-- AI_BOARD:DR_REVIEW_USABLE:START -->
- 標準医療との連携を優先する方針。
- 相談前に症状、服薬、既往歴、困りごとを整理する方針。
- 追加調査を安全性・根拠・実用性・学習価値・改善仮説に分ける方針。
<!-- AI_BOARD:DR_REVIEW_USABLE:END -->

## 修正すべき内容
<!-- AI_BOARD:DR_REVIEW_FIXES:START -->
- 「安全に使える」と断定せず「相談準備の補助として使える」に弱める。
- 方剤名が出る箇所は、病名処方やランキングに見えないようにする。
- 一般向け成果物と専門職向け内部資料を分ける。
<!-- AI_BOARD:DR_REVIEW_FIXES:END -->

## 危険な内容
<!-- AI_BOARD:DR_REVIEW_RISK:START -->
| 情報タイプ | 典型的な主張 | なぜ危険か | 相談時の安全な返答方針 |
|---|---|---|---|
| 標準医療を否定するページ | 薬を使わず漢方だけで治る | 受診遅れや治療中断につながる | 医師に相談し、補助的情報として扱う |
| 販売ページ | この処方が第一選択 | 広告表現で根拠が弱い | 根拠には使わず、患者が見た情報として確認する |
<!-- AI_BOARD:DR_REVIEW_RISK:END -->

## 情報源レビュー
<!-- AI_BOARD:DR_REVIEW_SOURCE_REVIEW:START -->
PMDA、添付文書、診療ガイドライン、学会資料、論文は根拠候補として扱う。
販売ページ、個人ブログ、体験談は根拠にしない。ただし誤情報・危険表現レビューの隔離表では扱える。
<!-- AI_BOARD:DR_REVIEW_SOURCE_REVIEW:END -->

## 主張・根拠対応レビュー
<!-- AI_BOARD:DR_REVIEW_CLAIM_EVIDENCE:START -->
- 「相談準備に使う」は根拠と目的が対応している。
- 「処方群・生薬の学習資料として十分」は根拠不足。
- 方剤別安全性は個別添付文書照合が必要。
<!-- AI_BOARD:DR_REVIEW_CLAIM_EVIDENCE:END -->

## 抜け漏れ
<!-- AI_BOARD:DR_REVIEW_GAPS:START -->
- 症状クラスターと証の対応が不足。
- 代表処方群と生薬構成の整理が不足。
- 症例報告・専門家経験知は別枠で追加調査が必要。
<!-- AI_BOARD:DR_REVIEW_GAPS:END -->

## 実用性レビュー
<!-- AI_BOARD:DR_REVIEW_PRACTICALITY:START -->
相談前メモとしては使えるが、漢方医向け内部学習資料としては浅い。
出口成果物は一般向け相談メモと専門職向け追加調査プロンプトに分ける。
<!-- AI_BOARD:DR_REVIEW_PRACTICALITY:END -->

## 改訂版成果物
<!-- AI_BOARD:DR_REVIEW_REVISED_ARTIFACT:START -->
### 相談前メモ
- 主な困りごと：
- いつから：
- 標準医療で確認済みのこと：
- 服薬中の薬：
- 漢方相談で確認したいこと：

### 専門職向け内部メモ
- 安全資料として採用可能。
- 処方・生薬・証・症状クラスターは追加調査が必要。
- 患者配布・Web公開・販売促進には使わない。
<!-- AI_BOARD:DR_REVIEW_REVISED_ARTIFACT:END -->

## 追加Deep Researchプロンプト案
<!-- AI_BOARD:DR_REVIEW_ADDITIONAL_PROMPTS:START -->
### 学習価値を高める調査
線維筋痛症に関連して言及される症状クラスター、証、処方群、生薬、処方意図を、病名処方や処方ランキングにせず整理してください。

### 改善仮説を作る調査
線維筋痛症の広範痛、疲労、睡眠障害、不安、冷え、しびれなどの症状クラスターを、漢方医学的病態軸と関連づけて整理してください。
<!-- AI_BOARD:DR_REVIEW_ADDITIONAL_PROMPTS:END -->

## 次アクション
<!-- AI_BOARD:DR_REVIEW_NEXT_ACTION:START -->
1. 改訂版成果物は相談前メモとして使う。
2. 漢方医向け内部学習資料にする前に、症状クラスター・証・処方群・生薬の追加Deep Researchを行う。
3. 方剤別安全性は後続でPMDA・添付文書照合する。
<!-- AI_BOARD:DR_REVIEW_NEXT_ACTION:END -->

## 結論の自信度
<!-- AI_BOARD:DR_REVIEW_CONFIDENCE:START -->
0.80。
安全資料としての方向性は安定しているが、処方・生薬・証の学習価値は追加調査が必要。
<!-- AI_BOARD:DR_REVIEW_CONFIDENCE:END -->

### Issue / 未解決論点
<!-- AI_BOARD:DR_REVIEW_ISSUES:START -->
- 処方・生薬・証の整理不足。
- 方剤別PMDA照合が未完了。
- 症例報告・専門家経験知の扱いが未整理。
<!-- AI_BOARD:DR_REVIEW_ISSUES:END -->

### 次Stepへの引き継ぎ
<!-- AI_BOARD:DR_REVIEW_HANDOFF:START -->
次に必要なのは、安全補完だけではなく、漢方医学的病態・証・処方群・生薬・症状クラスターの追加調査である。
<!-- AI_BOARD:DR_REVIEW_HANDOFF:END -->

## 次調査カード
<!-- AI_BOARD:DR_REVIEW_HANDOFF_CARD:START -->
# 議題
線維筋痛症Deep Research結果を受けて、次に必要なDeep Researchプロンプトを作成する

# 元テーマ
線維筋痛症の漢方

# 今回レビュー結果の採用可否
Conditional Pass。安全資料・医学的基礎資料としては条件付き採用。漢方処方・生薬・証・症状クラスターの学習資料としてはNeeds More Research。

# 追加調査が必要な理由
- 処方・生薬・証の整理不足。
- 方剤別PMDA照合が未完了。
- 症例報告・専門家経験知の扱いが未整理。

# 次に調べるべきテーマ
線維筋痛症に関連して言及される症状クラスター、証、処方群、生薬、処方意図を、病名処方や処方ランキングにせず整理する。

# 次回Deep Researchの目的
漢方医・薬剤師・漢方相談実務者が、線維筋痛症に関連する症状を漢方医学的にどう捉え、どのような処方群・生薬がどの症候に関連して語られるかを学ぶための内部資料を作る。

# 対象読者
漢方医、薬剤師、漢方相談実務者

# 除外範囲
- 患者配布
- Web公開
- 販売促進
- 病名処方
- 処方ランキング
- 服薬変更指示

# 安全制約
- 診断、処方決定、服薬開始・中止・変更の指示は行わない
- 根拠の弱い情報を推奨扱いしない
- 危険な内容と採用できる内容を分ける

# 優先情報源
PMDA、添付文書、診療ガイドライン、学会資料、論文、症例報告、専門家解説

# 出力形式
- 症状クラスター表
- 証・病態軸整理表
- 処方群整理表
- 生薬整理表
- 情報源別の信頼性分類

# 未解決Issue
- 処方・生薬・証の整理不足
- 方剤別PMDA照合
- 症例報告・専門家経験知の扱い

# 仮置き条件
- 外部公開しない内部資料として扱う
- 処方候補は推奨ではなく学習用の仮説として扱う
<!-- AI_BOARD:DR_REVIEW_HANDOFF_CARD:END -->
