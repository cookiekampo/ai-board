# AI会議室 / AI Board

AI会議室は、1つの議題に対して複数AIが役割を持って議論し、最後に意思決定に使える結論をMarkdownで出力するCLIツールです。

目的はAI同士の自由な雑談ではなく、以下を明確に出すことです。

- 結論
- 採用案
- 却下案
- 主な理由
- 未解決論点
- 追加確認事項
- 次アクション

## 1. MVPスコープ

v0.1では以下のみ実装します。

- CLI実行
- `topic.txt` から議題を読み込む
- `config.json` から設定を読み込む
- OpenAI APIのみで動作
- Proposer / Critic / Judge の3役固定
- 2ラウンド固定
- 実行前に設定を表示し、確認後にAPIを呼ぶ
- 結果をMarkdownで `output/` に保存
- エラー時は途中結果を保存
- 出力ファイルに `meeting_id` を付与する
- OpenAI Responses APIの保存設定は `store: false` を既定にする
- Judgeの最終出力はJSON Schemaで受け取り、Python側でMarkdownに整形する

## 2. v0.1で実装しないもの

- GUI
- Web検索
- Anthropic実接続
- 複数モード
- Deep Research連携
- ブラウザ操作
- 過去ログ学習
- 厳密なコスト上限管理
- 議題ごとの役割自動選択
- Dev Reviewer

## 2.1 半手動モード

API課金を使わず、現在契約しているChatGPT / Claudeの画面を使うための半手動モードを用意します。

半手動モードでは、AIへの送信はユーザーがWeb画面で行い、CLIは以下だけを担当します。

- 次に貼るプロンプトを生成する
- Proposer / Critic / Judge の順序を管理する
- 各AIの返答を貼り戻して会議ログとして保持する
- 最後にMarkdownで保存する

APIキー、`.env`、OpenAI APIは使いません。

実行:

```powershell
python manual_debate.py
```

流れ:

1. CLIがProposer用プロンプトを表示する
2. ユーザーがChatGPTなどに貼る
3. 返答をCLIへ貼り戻す
4. CLIがCritic用プロンプトを表示する
5. ユーザーがClaudeなどに貼る
6. 返答をCLIへ貼り戻す
7. これを2ラウンド分繰り返す
8. `output/YYYYMMDD_NNN_ai_board_manual.md` に保存する

返答の貼り戻しでは、入力完了時に単独行で `/end` と入力します。中止する場合は `/cancel` と入力します。

### iPhone対応の半手動Webモード

iPhoneから使う場合は、PCでWebサーバーを起動し、同じWi-Fi上のiPhoneブラウザからアクセスします。

実行:

```powershell
python web_manual.py
```

Windowsで起動した画面がすぐ閉じる場合は、以下をダブルクリックするか、PowerShellから実行してください。

```powershell
.\start_web_manual.bat
```

起動すると以下のようなURLが表示されます。

```text
PC:      http://127.0.0.1:8765
iPhone:  http://192.168.x.x:8765
```

iPhoneでは `iPhone:` に表示されたURLをSafariなどで開きます。

Web画面では以下を行えます。

- 次に貼るプロンプトを表示する
- プロンプトをコピーする
- ChatGPT / Claudeアプリの返答を貼り戻す
- 次のターンへ進む
- 最後に `output/YYYYMMDD_NNN_ai_board_web_manual.md` に保存する

注意:

- PCとiPhoneは同じWi-Fiに接続する
- Windowsファイアウォールが接続を止める場合がある
- API課金は発生しない
- ChatGPT / ClaudeのWeb/アプリ利用制限は消費する
- iPhoneからPC内のローカルサーバーへアクセスするため、外出先から直接使う用途ではない

iPhoneで「コピー」ボタンが効かない場合は、ブラウザの制限でClipboard APIが使えない状態です。その場合は「プロンプトだけを開く」を押し、表示された本文を長押ししてコピーしてください。長押しコピーが難しい場合は、本文を少し選択してから選択範囲のハンドルを広げます。

注意:

- API課金は発生しない
- ChatGPT / ClaudeのWeb利用制限は消費する
- JSON Schemaの強制はAPI版ほど厳密ではない
- Web画面の自動操作はしない

## 2.2 静的Web版

iPhone中心で使う場合の本命として、APIなし・サーバーなしの静的Web版を `docs/` に用意します。

このアプリはAI実行ツールではなく、AI会議の進行・プロンプト生成・ログ保存補助ツールです。

配置:

```text
docs/
  index.html
  style.css
  app.js
```

運用:

1. 議題カードを書く
2. Step 1プロンプトをコピー
3. ChatGPT / Claude / Geminiなどに貼る
4. AI回答をコピー
5. 静的Web版に貼り戻す
6. 「回答を保存して次へ」を押す
7. Step 6まで繰り返す
8. Markdownをコピーまたはダウンロードする

特徴:

- APIキー不要
- API課金なし
- GitHub Pages対応
- iPhone / PCブラウザ対応
- localStorageで途中保存
- 会議ログはGitHubに保存しない

外部AIサービスを開く補助ボタン:

- コピーしてChatGPTを開く
- コピーしてClaudeを開く
- コピーしてGeminiを開く

これらはプロンプトのコピーとAIサービスのWeb版を開く補助だけを行います。自動貼り付け、自動送信、回答の自動取得は行いません。

ローカルで試す場合は、`docs/index.html` をブラウザで開きます。

## 3. 登場AI

### Proposer / 提案者

前向きな案、実行方法、メリット、実現可能性を出します。発想が必要なため、temperatureはやや高めにします。

### Critic / 批判者

提案に対して、リスク、抜け漏れ、失敗要因、コスト、現実的な問題点を指摘します。

単なる否定ではなく、以下を分けて出します。

- 致命的リスク
- 修正可能な問題
- 見落とされている前提
- 追加で確認すべきこと

### Judge / 統合者

議論全体を整理し、最終結論を出します。

以下を必ずまとめます。

- 結論
- 採用案
- 却下案
- 主な理由
- 未解決論点
- 追加確認事項
- 次アクション
- 結論の自信度

## 4. 会議フロー

```text
Round 1
1. Proposer: 初期提案
2. Critic: 批判・リスク指摘
3. Judge: 中間整理

Round 2
4. Proposer: 批判を踏まえた修正案
5. Critic: 最終チェック
6. Judge: 最終結論
```

## 5. 入力ファイル

`topic.txt` を入力として使います。

配布用テンプレートは `topic.example.txt` です。実運用では `topic.example.txt` をコピーして `topic.txt` を作り、そこに議題を書きます。

`topic.txt` は議題や背景情報を含むため、機密情報になりえます。v0.1では `.gitignore` に入れて、ローカル入力ファイルとして扱います。

推奨テンプレート:

```md
# 議題
ここに話し合いたいテーマを書く

# 背景
必要なら前提を書く

# 判断したいこと
最終的に決めたいことを書く

# 制約
予算、時間、やってはいけないことなどを書く

# 出力してほしい形式
結論 / 理由 / 次アクション など
```

## 6. 設定ファイル

`config.json` でモデル、temperature、出力先、安全設定を管理します。

```json
{
  "mode": "basic",
  "rounds": 2,
  "models": {
    "proposer": {
      "provider": "openai",
      "model": "gpt-4.1-mini",
      "temperature": 0.7
    },
    "critic": {
      "provider": "openai",
      "model": "gpt-4.1-mini",
      "temperature": 0.3
    },
    "judge": {
      "provider": "openai",
      "model": "gpt-4.1",
      "temperature": 0.2
    }
  },
  "limits": {
    "max_tokens_per_turn": 1200,
    "max_total_turns": 6,
    "show_estimated_cost": true
  },
  "output": {
    "format": "markdown",
    "save_dir": "output",
    "filename_prefix": "ai_board"
  },
  "safety": {
    "confirm_before_api_call": true,
    "save_partial_on_error": true,
    "no_secret_mode": true
  }
}
```

`max_cost_jpy` のような厳密な円コスト上限はv0.1では実装しません。モデル料金は変動するため、v0.1では最大出力トークンの上限だけを表示します。

## 7. meeting_id / 出力ファイル名

会議ごとに `meeting_id` を付与します。

形式:

```text
YYYYMMDD_NNN
```

例:

```text
20260503_001
```

出力ファイル例:

```text
output/20260503_001_ai_board.md
```

同日に複数回実行する場合は `_001`, `_002`, `_003` のように連番にします。

## 8. Markdown出力形式

会議ログより先に結論を表示します。

Judgeの最終結論は、モデルにMarkdownを直接書かせず、JSON Schemaに従う構造化出力として受け取ります。その後、`debate.py` 側で以下のMarkdownに整形します。

```md
# AI会議室 結論

## 1. Meeting ID

## 2. 議題

## 3. 最終結論

## 4. 採用案

## 5. 却下案

## 6. 主な理由

## 7. 次にやること

## 8. 未解決論点

## 9. 追加で確認すべきこと

## 10. 結論の自信度
高 / 中 / 低

## 11. 自信度の理由

## 12. 各AIの要約

## 13. 会議ログ
```

## 9. セキュリティ

- APIキーは `.env` で管理する
- `.env` はgitに含めない
- `topic.txt` はgitに含めない
- `output/` はgitに含めない
- `.env.example` を用意する
- 機密情報を `topic.txt` に書かない
- API利用料は各サービスのアプリ課金とは別に発生する
- 出力内容はAI生成であり、最終判断はユーザーが行う
- OpenAI API呼び出しでは `store: false` を指定する

APIに送った内容は外部サービスに送信されます。個人情報、顧客情報、未公開の機密情報、APIキー、パスワードは入力しないでください。

`no_secret_mode` は完全な秘匿情報検出ではありません。v0.1ではAPIキーやパスワードらしき文字列を簡易チェックして警告するだけです。安全性を保証する機能ではないため、送信前にユーザーが内容を確認してください。

## 10. ファイル構成

```text
ai-board/
  docs/
    index.html
    style.css
    app.js
  README.md
  .env.example
  .gitignore
  config.json
  topic.example.txt
  topic.txt        # ローカル入力用。git管理しない
  debate.py
  manual_debate.py
  web_manual.py
  start_web_manual.bat
  requirements.txt
  output/
```

MVPでは `debate.py` 1ファイルで開始します。後から必要になった時点で `src/` や `prompts/` に分割します。

## 11. セットアップ

依存関係をインストールします。

```powershell
pip install -U -r requirements.txt
```

`.env.example` を参考に `.env` を作成し、OpenAI APIキーを設定します。

```env
OPENAI_API_KEY=sk-your-openai-api-key
```

`topic.example.txt` をコピーして `topic.txt` を作成し、議題を書きます。

```powershell
Copy-Item topic.example.txt topic.txt
```

APIを呼ばずに動作確認する場合:

```powershell
python debate.py --dry-run
```

`--dry-run` でも、Judge最終結論はJSON相当の内部データからMarkdown化されます。

APIを使わず、ChatGPT / ClaudeのWeb画面へ手で貼る場合:

```powershell
python manual_debate.py
```

iPhoneブラウザから半手動で使う場合:

```powershell
python web_manual.py
```

実際にAPIを呼ぶ場合:

```powershell
python debate.py
```

確認プロンプトを省略する場合:

```powershell
python debate.py --yes
```

## 12. 完了条件

v0.1の完了条件は以下です。

- `python debate.py` で実行できる
- `topic.txt` の議題を読み込める
- 設定確認後にAPI実行できる
- 3役・2ラウンドの会議ログが生成される
- 最終結論が固定フォーマットで出力される
- Judge最終出力がJSON Schema経由で処理される
- `output/YYYYMMDD_NNN_ai_board.md` に保存される
- エラー時にも途中結果が保存される
- OpenAI API呼び出しで `store: false` が指定される
- `.env`、`topic.txt`、`output/` がgit管理対象外になっている

## 13. 将来拡張：Dev Reviewer

AI会議室 v0.1 では Dev Reviewer は実装しません。

ただし、v0.2以降の拡張候補として、Codex / Claude Code などの開発AIを Dev Reviewer として利用する構想を残します。

Dev Reviewer は通常の議論参加者ではなく、Judge がまとめた仕様案に対して、実装観点からレビューする役割です。

### 13.1 Dev Reviewer の役割

- 仕様が実装可能か確認する
- ファイル構成が過剰でないか確認する
- CLIとして破綻していないか確認する
- エラー処理・テスト観点を指摘する
- セキュリティ上の注意点を出す
- MVPから外すべき項目を提案する
- 実装前に人間が確認すべきことを明確にする

### 13.2 Dev Reviewer の禁止事項

- ファイルを直接変更しない
- commitしない
- `.env` や秘密情報を読まない
- 外部通信しない
- 自動で実装に進まない
- 人間の承認なしにリポジトリへ変更を加えない

### 13.3 想定フロー

1. Proposer が案を出す
2. Critic が批判する
3. Judge が仕様案をまとめる
4. Dev Reviewer が実装観点でレビューする
5. Judge が最終結論を更新する
6. 人間が承認する
7. 承認後、Codex / Claude Code に実装を依頼する

### 13.4 Dev Reviewer の出力形式

- 実装しやすい点
- 実装で詰まりそうな点
- ファイル構成の妥当性
- セキュリティ上の注意
- テストすべき項目
- MVPから外すべき項目
- 実装前に人間が確認すべきこと

### 13.5 Dev Reviewer の段階

#### 擬似Dev Reviewer

通常のLLMに「開発レビュー担当」として発言させる方式です。

リポジトリは読まず、仕様書や会議ログを元にレビューします。

メリット:

- 実装が軽い
- 権限管理が簡単
- v0.3で導入しやすい

デメリット:

- 実際のコード状態は確認できない
- 実装済みファイルとの差分や依存関係は見られない

#### 実Dev Reviewer

Codex / Claude Code にリポジトリを読ませ、実装観点でレビューさせる方式です。

ただし、最初はレビューのみとし、ファイル変更・commit・外部通信は許可しません。

メリット:

- 実際のコード構成を踏まえたレビューができる
- テスト観点や影響範囲を現実的に見られる
- 実装前の詰まりを発見しやすい

デメリット:

- 権限管理が必要
- `.env` や秘密情報の保護が必要
- コマンド実行範囲の制御が必要
- 人間承認ゲートが必須

## 14. ロードマップ

### v0.1

OpenAI APIのみで3役を回すCLI版AI会議室を作る。

- Proposer
- Critic
- Judge
- 2ラウンド固定
- Markdown出力
- `topic.txt` 入力
- `config.json` 設定

### v0.2

Claude APIをCriticとして追加可能にする。

- provider切り替え
- OpenAI / Anthropic の抽象化
- モデルごとの設定
- エラー時の途中保存強化

### v0.3

擬似Dev Reviewerを追加する。

- 通常LLMに開発レビュー担当として発言させる
- 仕様書・会議ログを元に実装観点レビュー
- ファイル編集なし
- リポジトリ読み込みなし

### v0.4

実Dev Reviewerを追加する。

- Codex / Claude Code にリポジトリを読ませる
- 実装可能性をレビューする
- ファイル編集なし
- commitなし
- `.env` 読み込み禁止
- 人間承認ゲート必須

### v0.5

承認後に実装指示を渡せるようにする。

- AI会議室の結論を実装指示に変換
- Codex / Claude Code へ渡す
- 実装前に人間が確認
- 実装後の結果を保存

### v0.6

テスト結果や実装結果をAI会議室に戻して再判断できるようにする。

- テスト結果の要約
- 失敗原因の議論
- 修正案の生成
- 次の実装指示の作成
