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
