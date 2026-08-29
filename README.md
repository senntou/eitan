# eitan - 英単語帳 Web アプリ

TOEIC 800 点レベルを目安にした英単語学習アプリです。Level 1〜4、各ちょうど 100 語(合計 400 語)を収録しています。

## 機能

- **ホーム**: レベルごとの習得状況を一覧表示。「続きから」で最後に学習したレベルへ直行
- **レベル詳細**: 出題数・出題範囲(すべて / 未習得のみ / あやふやのみ / ☆のみ)・出題順・出題モード・タグ絞り込みを設定して学習を開始
- **学習**: カードをタップすると意味・例文・和訳・メモが一度に表示。「わかった」「わからない」の2択で次へ進む(1語あたり最大2タップ)。キーボード操作(Space/Enter でめくる、←→ または 1/2 で回答、S で☆)にも対応
- **結果**: 正答率と間違えた単語を表示。「間違えた語をもう一周」でそのまま復習セッションへ
- **一覧**: レベルごとの単語一覧。検索、習得状況ドット、行タップで例文・メモを展開表示
- **復習**: ☆を付けた語と「あやふや」判定の語を横断して学習できるタブ
- 学習の進捗(習得 / あやふや / ☆)と直前の学習設定はブラウザの `localStorage` に保存されます(サーバー不要)

## 単語データの追加・編集

- `src/data/words/level1.ts` 〜 `level4.ts` にレベルごとの単語を定義しています。`src/data/words/index.ts` で結合され、`level`→`order` の順にソートされます。
- 各単語には `id`(全体で一意・不変)、`word`、`meaning`、`pos`(品詞)、`level`、`order`(レベル内の並び順 1..100)、`tags`(`src/data/tags.ts` のジャンルタグ)、`example`/`exampleJa`(必須)、`note`(任意)が必要です。
- **既存の `id` は絶対に振り直さないでください**。`localStorage` に保存された進捗が `id` に紐づいているため、振り直すと学習履歴が壊れます。
- レベルを新設する場合は `src/data/levels.ts` の `LEVELS` にも追加してください。`src/data/words.test.ts` が「`LEVELS` に定義された各レベルがちょうど100語」であることや ID・単語の重複がないことを検証します。

## 開発

```bash
npm install
npm run dev
```

## テスト・Lint

```bash
npm run lint       # oxlint
npx tsc -b         # 型チェック
npm run test       # vitest
npm run build      # 本番ビルド
```

`main` への push と PR で GitHub Actions (`.github/workflows/ci.yml`) が上記を自動実行します。

## デプロイ (GitHub Pages)

`main` ブランチに push すると `.github/workflows/deploy.yml` が自動的に
ビルドして GitHub Pages に公開します。

初回のみ、リポジトリの Settings → Pages で Source を
**GitHub Actions** に設定してください。

公開 URL: `https://senntou.github.io/eitan/`
