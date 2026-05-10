# Morning Gym Coach (v0.1)

## アプリの目的
朝ジムでスマホに脱線せず、30〜45分で1回の脚トレを完走するための個人用iPhoneアプリ。

## v0.1の機能
- 固定脚メニュー表示
- セット入力（重量 / 回数 / RIR）
- RIR 5択（4+,3,2,1,0）とRIR→RPE変換
- 記録後に休憩タイマー自動開始
- 次セット指示（最大3行）
- 痛みボタン（種目終了 + 当日オールアウト禁止）
- 直前セット修正 / 削除
- ローカル保存（UserDefaults）
- トレ後まとめで予定と実績差分表示

## v0.1でやらないこと
- 外部AI API連携（OpenAI/Claude等）
- アプリ内自由チャット
- 複雑なグラフ
- 動画ライブラリ
- ChatGPTインポート/エクスポート
- coach_update.jsonインポート
- アクセスガイド関連の実装
## 初期脚メニュー（脚 / 45分）
1. スクワット（heavy_compound, barbell_total）
   - 40kg, 3セット, 6-8回, target RIR [3,2,1], rest 180秒
   - RIR0禁止 / オールアウト禁止
2. ブルガリアンスクワット（heavy_compound, dumbbell_each_hand）
   - 片手10kg, 2セット, 片脚8-10回, target RIR [2,1], rest 120秒
   - **重量は片手あたり**（片手10kgなら左右それぞれ10kg）
   - RIR0禁止 / オールアウト禁止
3. レッグエクステンション（isolation, machine_stack）
   - 30kg, 2セット, 12-15回, target RIR [1,0], rest 60秒
   - 最終セットのみRIR0可 / オールアウト可

## RIR/RPEルール
- RIR 4+ => RPE 6
- RIR 3 => RPE 7
- RIR 2 => RPE 8
- RIR 1 => RPE 9
- RIR 0 => RPE 10

## 安全ルール
- heavy_compound（スクワット/ブルガリアン）でRIR0禁止
- レッグエクステンション最終セットのみRIR0許可
- painボタン押下後は当日オールアウト/レストポーズ禁止
- all_out_allowed=false の種目でRIR0を許可しない

## 今後の追加予定
- 履歴一覧
- CSV/JSONエクスポート
- 複数メニュー（曜日別）
- Apple Watch連携
