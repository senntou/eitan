# eitan 改善計画

対象コミット: `97b914c` (Phase・カテゴリ分けと学習UIを拡張)

このドキュメントは実装担当（Claude Sonnet 等）がそのまま着手できる粒度で書いてある。
上から順に「なぜ」「何を」「どう作るか」「どの順で commit するか」を並べてある。

---

## 0. 現状の課題（コード上の根拠つき）

### 学習フローが遠回り

| 現象 | 根拠 |
| --- | --- |
| 答えを見た後、例文・解説にもう1タップ必要 | `src/components/StudyCard.tsx:51-55` の `例文・解説を見る` トグル |
| 1語あたり最大3タップ（答え→解説→次へ）かかる | 同 `StudyCard.tsx:44-67` |
| そもそも例文・解説を持つ語が 50語中 11語しかない | `src/data/words.ts` の `example:` 出現数 = 11 |
| セッションが終わらない（無限ループ） | `src/App.tsx:36` の `(s.index + 1) % s.words.length` |
| 学習結果がどこにも残らない | 保存しているのは ☆ の ID 集合だけ（`src/hooks/useStarredWords.ts`） |

### レベル分けになっていない

- `PHASES` は 16個ある（`src/data/phases.ts`）が、単語があるのは Phase 1 のみ。
  `PhaseSelect.tsx:17` は件数に関係なく全部 `<option>` に出すので、
  **「Phase 2 (0語)」〜「Phase 16 (0語)」という空選択肢が15個並ぶ**。
- `CATEGORIES` の4分類（オフィス / 法務 / 財務 / 運用）は**意味のジャンル分けであって難易度ではない**
  （`src/data/categories.ts`）。ユーザーが期待している「難易度順のレベル」とは軸が違う。
- 「1レベル100問」という単位が存在しない。Phase 1 は 50語。

### トップ / 設定画面が見づらい

- 起動直後にいきなり `StudySettings` のフォームが出る（`App.tsx:82`）。
  ネイティブ `<select>` 1つ + ラジオボタン3グループ（計6個）が縦に並ぶだけで、
  **「何をするアプリか」「今どこまで進んだか」が一切見えない**。
- ラジオボタンのタップ領域が実質 16px 程度でスマホで押しづらい（`App.css:85-91`）。
- ヘッダーに `<h1>` + タブ + Phase セレクトが密集していて情報の優先度がない。

### 見た目まわり

- `index.css` で `color-scheme: light dark` を宣言しているのに CSS 変数はライト固定。
  **ダークモード端末ではフォームコントロールだけ暗くなり、地の色は明るいままでちぐはぐになる**。
- `#666` `#888` `#555` などのハードコード色が CSS 全体に散っている（App.css 12箇所）。
- セーフエリア（iPhone のホームバー）非対応。`padding-bottom: 48px` 決め打ち（`App.css:4`）。

### 開発基盤

- テストが1つもない。`package.json` に test スクリプトなし。
- CI は build と deploy のみ（`.github/workflows/deploy.yml`）。lint も走っていない。

---

## 1. 目指す形（このリリースのゴール）

1. **レベル制**: 難易度順の Level 1..N、**1レベル = ちょうど100語**。
2. **1タップ学習**: カードをめくったら意味・例文・和訳・メモが**一度に全部出る**。
3. **セッションが終わる**: 出題数を決めて、終わったら結果画面が出る。
4. **進捗が残る**: 語ごとに「習得済み / あやふや / 未学習」を保存し、レベルごとに可視化。
5. **ホーム画面がある**: レベル一覧＋進捗が最初に見える。設定は「詳細設定」に畳む。
6. **見た目を作り直す**: デザイントークン、ダークモード、タップ領域44px、セーフエリア。

やらないこと（明示的にスコープ外）は §10 に書いた。

---

## 2. データモデル刷新

### 2-1. `Word` 型

`src/data/words.ts`:

```ts
import type { TagId } from './tags'

export type PartOfSpeech = 'v' | 'n' | 'adj' | 'adv' | 'prep' | 'phrase'

export type Word = {
  /** 全体で一意・不変。既存 ID は絶対に振り直さない（localStorage の進捗が壊れる） */
  id: number
  word: string
  /** 主要な訳。多くても2つまで、読点区切り */
  meaning: string
  pos: PartOfSpeech
  /** 1..N。難易度順。旧 phase */
  level: number
  /** レベル内の並び順 1..100 */
  order: number
  /** 旧 category。ジャンルタグ。複数可。フィルタと一覧表示にのみ使う */
  tags: TagId[]
  /** 必須。全語に付ける */
  example: string
  /** 必須。example の和訳 */
  exampleJa: string
  /** 任意。コロケーション・語法・引っかけポイント */
  note?: string
}
```

変更点まとめ:

- `phase: number` → `level: number` に rename、**意味を「難易度順のレベル」に変える**。
- `order: number` を追加（レベル内の並び順を data 側で固定する）。
- `category: CategoryId`（単数）→ `tags: TagId[]`（複数）。
  カテゴリを「難易度の軸」から降格させて、単なる分類タグにする。
- `example` / `exampleJa` を**必須化**。これが「1タップで解説まで出す」体験の前提。
  `example` が空の語があると、めくった後のカードがスカスカになって改善の意味がなくなる。
- `pos`（品詞）を追加。一覧とカードで `動` `名` `形` のバッジを出すため。

### 2-2. `src/data/categories.ts` → `src/data/tags.ts`

```ts
export type TagId = 'office' | 'legal' | 'finance' | 'operations' | 'hr' | 'logistics'
export const TAGS: { id: TagId; label: string; short: string }[] = [
  { id: 'office',     label: 'オフィス・一般業務', short: 'オフィス' },
  { id: 'legal',      label: '契約・法務',        short: '法務' },
  { id: 'finance',    label: '財務・会計',        short: '財務' },
  { id: 'operations', label: '業務管理・運用',    short: '運用' },
  { id: 'hr',         label: '人事・採用',        short: '人事' },
  { id: 'logistics',  label: '物流・製造',        short: '物流' },
]
```

一覧のバッジは `short` を使う（現状 `word-row-category` に「オフィス・一般業務」が入って
行が折り返している。`App.css:250` の `flex-wrap: wrap` はその場しのぎ）。

### 2-3. `src/data/phases.ts` → `src/data/levels.ts`

```ts
export type Level = {
  id: number
  title: string        // 'Level 1'
  subtitle: string     // '基礎 100 語'
  description: string  // 'TOEIC 500〜600点で確実に取りたい頻出語'
}

export const LEVELS: Level[] = [
  { id: 1, title: 'Level 1', subtitle: '基礎 100 語', description: 'TOEIC 500〜600 点帯の頻出語' },
  { id: 2, title: 'Level 2', subtitle: '標準 100 語', description: 'TOEIC 600〜700 点帯の頻出語' },
  { id: 3, title: 'Level 3', subtitle: '応用 100 語', description: 'TOEIC 700〜800 点帯の頻出語' },
  { id: 4, title: 'Level 4', subtitle: '発展 100 語', description: 'TOEIC 800 点超で差がつく語' },
]
```

**重要: `LEVELS` は「単語が実在するレベルだけ」を持つ。**
現状のように空の Phase を16個ハードコードして 0語 の選択肢を並べるのはやめる。
データ整合性テスト（§8）で `LEVELS` と `words` の対応を強制する。

### 2-4. 既存50語の扱い

既存 ID 1〜50 は**そのまま維持**する（進捗データの互換のため）。やることは:

1. 50語を難易度で Level 1 / Level 2 に振り分ける
   （例: `acquire` `assess` `inventory` は L1、`arbitrary` `jeopardize` `contingency` は L2）。
2. 全語に `example` / `exampleJa` / `pos` を付ける（現状 39語が例文なし）。
3. 各レベルが**ちょうど100語**になるまで新規語を追加する（ID は 51 から連番）。

---

## 3. 進捗ストア

### 3-1. 保存する内容

`src/storage/progress.ts` を新設。`useStarredWords.ts` は廃止してこちらに統合する。

```ts
export type WordProgress = {
  /** 出題された回数 */
  seen: number
  /** 「わかった」を選んだ累計 */
  known: number
  /** 「わからない」を選んだ累計 */
  unknown: number
  /** 「わかった」の連続回数。「わからない」で 0 にリセット */
  streak: number
  /** 最終回答時刻 (epoch ms) */
  lastAt: number
  /** 手動の ☆ */
  starred: boolean
}

export type ProgressStore = {
  version: 2
  words: Record<number, WordProgress>
}

const KEY = 'eitan.progress.v2'
const LEGACY_KEY = 'eitan.starredWordIds'
```

### 3-2. 習得判定

```ts
export type Mastery = 'unseen' | 'learning' | 'mastered'

export function masteryOf(p: WordProgress | undefined): Mastery {
  if (!p || p.seen === 0) return 'unseen'
  return p.streak >= 2 ? 'mastered' : 'learning'
}
```

「2回連続でわかった → 習得済み」。シンプルに保つ。SRS（間隔反復）は入れない（§10）。

### 3-3. マイグレーション

初回ロード時に `eitan.progress.v2` が無ければ `eitan.starredWordIds` を読み、
その ID を `{ seen:0, known:0, unknown:0, streak:0, lastAt:0, starred:true }` として取り込む。
取り込み後も LEGACY_KEY は消さない（ロールバック用に1リリース分残す）。

### 3-4. 実装上の注意

- 現状の `useStarredWords.ts` は `useEffect` で state 変更のたびに全書き込みしている。
  進捗は語ごとの更新が頻繁になるので、**書き込みは更新関数の中で明示的に行う**（`useEffect` 依存にしない）。
- `localStorage` へのアクセスは全部 try/catch で包む（プライベートブラウジングで throw する）。
- Context（`ProgressProvider`）で配って、`useProgress()` フックで読む。props バケツリレーを増やさない。

### 3-5. 学習設定の保存

`src/storage/settings.ts`。`eitan.settings.v1` に `{ direction, order, count, scope }` を保存し、
次回起動時に復元する。**毎回設定し直させない**のが「使いやすさ」の要。

---

## 4. 画面構成

`src/App.tsx` の `tab: 'study' | 'list'` を廃止し、画面 enum に置き換える。

```
Home（レベル一覧）
 └ LevelDetail（レベル詳細＋出題設定）
     └ Study（学習中）
         └ Result（結果）
WordList（単語一覧）
Review（復習リスト = ☆ + あやふや）
```

ナビゲーションは**下部タブバー**（ホーム / 一覧 / 復習）。
学習中と結果画面ではタブバーを隠して、画面上部に「× 中断」だけ置く。

React Router は入れない（バンドルを増やす価値がない）。
`useState` の画面スタックで十分。ブラウザバック対応が欲しければ
`history.pushState` + `popstate` を薄く噛ませる（優先度低）。

### 4-1. Home（新規）

```
┌────────────────────────────┐
│  英単語帳                        │
│  習得 42 / 400 語                │
│  ▓▓▓░░░░░░░░░░░░░░░  11%        │
├────────────────────────────┤
│  [ ▶ 続きから  Level 2 ]        │  ← 最後に学習したレベルへ直行
├────────────────────────────┤
│ ┌──────────────────────┐ │
│ │ Level 1   基礎 100 語        │ │
│ │ TOEIC 500〜600点帯          │ │
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓░░░  78/100    │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ Level 2   標準 100 語        │ │
│ │ ▓▓▓░░░░░░░░░░░  18/100     │ │
│ └──────────────────────┘ │
│ ...                              │
└────────────────────────────┘
```

- 各レベルカードは丸ごとボタン（最低 64px 高）。
- 進捗バーは `mastered` 数 / レベル総語数。
- 100% のレベルにはチェックマーク。
- **ロック機構は入れない**（前レベル未完でも選べる）。学習の邪魔になるだけ。

### 4-2. LevelDetail（`StudySettings` の作り直し）

```
← Level 2  標準 100 語
   習得 18 / 100    あやふや 7    未学習 75

   [ 学習をはじめる ]        ← 前回設定で即スタート。一番目立つ大ボタン
   20問 / ランダム / 英→日   ← 現在の設定をテキストで1行表示

   ▸ 詳細設定                ← デフォルト折りたたみ
```

詳細設定を開くと:

| 設定 | 選択肢 | UI |
| --- | --- | --- |
| 出題数 | 10 / 20 / 50 / 全部 | セグメンテッドコントロール |
| 出題範囲 | すべて / 未習得のみ / あやふやのみ / ☆のみ | セグメンテッドコントロール（2×2） |
| 出題順 | 順番通り / ランダム | セグメンテッドコントロール |
| 出題モード | 英→日 / 日→英 | セグメンテッドコントロール |
| タグ絞り込み | 複数選択チップ | トグルチップ |

**ネイティブ `<select>` とラジオボタンは全部やめる。**
`role="radiogroup"` + `role="radio"` を付けたボタン群（セグメンテッドコントロール）にする。
共通コンポーネント `src/components/ui/SegmentedControl.tsx` を作って使い回す。

対象語数が0になる組み合わせでは「学習をはじめる」を無効化し、
「条件に合う単語がありません」と理由を出す（現状は `disabled` だけで理由が出ない）。

### 4-3. Study（学習中）

§5 で詳述。

### 4-4. Result（新規）

```
   Level 2  20問 おつかれさま

   わかった 14 / 20        70%
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░

   わからなかった単語 (6)
   ・ arbitrary   恣意的な
   ・ jeopardize  危険にさらす
   ...

   [ 間違えた6語をもう一周 ]
   [ レベルに戻る ]
```

`間違えた語をもう一周` が結果画面の主役。ここが繰り返し学習の入口になる。

### 4-5. WordList（改修）

- **検索ボックスを追加**（英単語・意味の部分一致）。100語あると検索なしでは使えない。
- レベル切り替えはタブ or セグメント。
- 行に習得状態のドット（未学習=グレー / あやふや=オレンジ / 習得=グリーン）。
- **行タップで展開**して例文・和訳・メモを表示（現状は一覧から例文に到達できない）。
- 現状の `word-row` は `flex-wrap` で折り返して行の高さがバラバラになる。
  `display: grid` の2行レイアウト（1行目: ☆ / 単語 / 品詞 / 状態、2行目: 意味 / タグ）に作り替える。

### 4-6. Review（新規タブ）

☆ が付いた語 + `mastery === 'learning'` の語を横断（全レベル）で集めて、
そのまま学習セッションを開始できる画面。現状の「出題範囲: 復習リストのみ」を独立させたもの。

---

## 5. 学習カードの詳細仕様（最重要）

### 5-1. インタラクション

```
【めくる前】
┌────────────────────────┐
│  Level 2      8 / 20        × │   ← 進捗バー + 中断
│ ▓▓▓▓▓▓░░░░░░░░░░░░           │
│                             ☆ │   ← ☆はカード右上に常時。めくる前でも押せる
│                               │
│        jeopardize             │
│           〔動〕               │
│                               │
│      タップして答えを見る       │
└────────────────────────┘
     [      答えを見る      ]        ← カード本体タップでも同じ

【めくった後】── 1タップでここまで全部出る
┌────────────────────────┐
│  Level 2      8 / 20        × │
│ ▓▓▓▓▓▓░░░░░░░░░░░░           │
│                             ★ │
│        jeopardize             │
│        危険にさらす            │
│ ───────────────── │
│ Missing the deadline could    │
│ jeopardize the entire project.│
│ 締め切りに間に合わないとプロ    │
│ ジェクト全体が危うくなる。      │
│                               │
│ 💡 ビジネス文脈でリスクを表す時に │
│    頻出。名詞は jeopardy。      │
└────────────────────────┘
  [ わからない ]  [ わかった ]
```

### 5-2. 仕様

- **めくるのは1タップ。めくったら意味・例文・和訳・メモを同時に出す。**
  `showDetail` state は削除。`例文・解説を見る` ボタンも削除。
- **カード本体をタップしてもめくれる**（下のボタンだけでなく、面積の大きいカード自体を押せる）。
- めくった後のアクションは **2択のみ**:
  - `わからない` → `unknown++`, `streak = 0`, 自動で ☆ を付ける、次へ
  - `わかった` → `known++`, `streak++`, 次へ
  どちらも「次へ」を兼ねるので、**1語あたり2タップで完結**（現状は最大3タップ）。
- ☆ はカード右上のアイコンボタンに移す（アクション行を2ボタンに保つため）。
  `わからない` が自動で ☆ を付けるので、手動 ☆ は「わかったけど不安」用の補助。
- **カードの高さを固定**（`min-height: 320px` 程度）。めくった瞬間にボタンの位置が動くと押し間違える。
- `例文中の対象語を `<mark>` でハイライト`する（`word` の語幹一致で雑にやる。活用形は
  `jeopardize` / `jeopardized` くらいまで拾えれば十分）。
- 日→英モード時は、めくる前の面に意味だけ出し、例文は**めくるまで隠す**（答えが見えてしまうため）。

### 5-3. キーボード / ジェスチャ

- `Space` / `Enter`: めくる → めくった後は「わかった」
- `←` or `1`: わからない、`→` or `2`: わかった
- `S`: ☆ トグル
- 左右スワイプは**入れない**（誤爆しやすい。優先度低）。

### 5-4. セッション終了

`src/App.tsx:36` の剰余ループを削除。
`index + 1 >= words.length` になったら `Result` 画面へ遷移する。
セッション中の回答結果は `Map<wordId, 'known' | 'unknown'>` でセッション state に保持し、
結果画面と「もう一周」で使う。

---

## 6. UI デザイン刷新

### 6-1. デザイントークン（`src/index.css`）

ハードコード色を全部変数に寄せる。ダークモードは変数の上書きだけで完結させる。

```css
:root {
  color-scheme: light dark;

  /* 面 */
  --bg:        #f5f6fa;
  --surface:   #ffffff;
  --surface-2: #eef0f6;

  /* 文字 */
  --fg:        #14161f;
  --fg-muted:  #5b6072;
  --fg-subtle: #8b90a3;

  /* 線 */
  --border:       #e3e5ef;
  --border-strong:#c9ccdb;

  /* アクセント */
  --accent:      #4f46e5;
  --accent-fg:   #ffffff;
  --accent-soft: #eeecff;

  /* 状態色 */
  --ok:      #16a34a;   --ok-soft:      #e7f6ec;
  --warn:    #d97706;   --warn-soft:    #fdf1de;
  --star:    #eab308;   --star-soft:    #fdf6dd;

  /* 形 */
  --radius:    14px;
  --radius-lg: 20px;
  --shadow:    0 1px 2px rgb(20 22 31 / 6%), 0 8px 24px rgb(20 22 31 / 6%);

  /* 余白 */
  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px; --sp-5: 24px; --sp-6: 32px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg:        #0f1117;
    --surface:   #191c25;
    --surface-2: #222634;
    --fg:        #e9eaf0;
    --fg-muted:  #a1a6ba;
    --fg-subtle: #6f7488;
    --border:        #2b2f3d;
    --border-strong: #3c4152;
    --accent:      #7c74f5;
    --accent-fg:   #0f1117;
    --accent-soft: #23213f;
    --ok:   #4ade80;  --ok-soft:   #16281c;
    --warn: #fbbf24;  --warn-soft: #2b2110;
    --star: #facc15;  --star-soft: #2b2610;
    --shadow: 0 1px 2px rgb(0 0 0 / 40%), 0 8px 24px rgb(0 0 0 / 32%);
  }
}
```

**ルール: `App.css` に生の16進カラーを書かない。** 現状の `#666` `#888` `#555` `#ccc` は全部置換。

### 6-2. モバイル対応

- 全てのタップ可能要素に `min-height: 44px`（Apple HIG の最小タップ領域）。
  現状のラジオボタンとインライン ☆（`App.css:263-271`, `font-size:1.3rem` のみ）が違反。
- `input` / `select` は `font-size: 16px` 以上（iOS Safari の自動ズーム防止）。
- 下部タブバーとメインの下端に `padding-bottom: env(safe-area-inset-bottom)`。
- `.app { max-width: 480px }` は維持しつつ、640px 以上では一覧を2カラムにする（任意）。
- `@media (prefers-reduced-motion: reduce)` でトランジションを無効化。

### 6-3. アニメーション（控えめに）

- カードのめくり: `opacity` + `translateY(4px)` の 160ms フェードのみ。3D フリップはやらない。
- 進捗バー: `width` を 240ms `ease-out`。
- ボタンの押下: `transform: scale(0.98)`。

### 6-4. アクセシビリティ

- セグメンテッドコントロールに `role="radiogroup"` / `role="radio"` / `aria-checked`。
- ☆ ボタンに `aria-pressed` と正しい `aria-label`
  （現状 `WordList.tsx:44` は状態に関わらず「復習リストに登録」固定）。
- 進捗バーに `role="progressbar"` + `aria-valuenow/min/max`。
- カードをめくった時に `aria-live="polite"` で解答を読み上げ。
- フォーカスリング（`:focus-visible`）を明示。現状 outline 指定なし。

---

## 7. 単語データの拡充

**これが一番工数がかかる。分割して進めること。**

### 7-1. 要件

- Level 1〜4、**各ちょうど100語**（合計400語）。
- 全語に `word` `meaning` `pos` `level` `order` `tags` `example` `exampleJa` を持たせる。
- `example` は TOEIC のビジネス文脈に沿った 8〜16語程度の自然な英文。
- `exampleJa` はその直訳寄りの和訳（意訳しすぎない）。
- `note` は語法・コロケーション・引っかけがある語だけ（全体の3〜4割が目安）。
- 重複禁止: 同じ `word` を2度出さない。派生語（`comply` / `compliance`）は
  **別レベルには置かず、同一レベル内で隣接させる**か、片方だけ採録する。

### 7-2. 難易度の基準

| Level | 目安 | 例 |
| --- | --- | --- |
| 1 | TOEIC 500〜600。Part 1〜4 の頻出基礎 | `acquire` `assess` `inventory` `submit` `schedule` |
| 2 | TOEIC 600〜700。Part 5 の定番 | `allocate` `comply` `consecutive` `initiate` `revenue` |
| 3 | TOEIC 700〜800。抽象度が上がる | `ambiguous` `constraint` `discrepancy` `subsidiary` |
| 4 | TOEIC 800超。低頻度・差がつく語 | `arbitrary` `jeopardize` `contingency` `stipulate` |

### 7-3. 進め方

1. まず **Level 1 の100語**を完成させる（既存語の一部再配置 + 新規）。
2. 次に Level 2。ここまでで一度リリース可能な状態にする。
3. Level 3、Level 4 は別コミットで追加。

**ファイル分割**: 1ファイルに400語を書くと保守できないので、
`src/data/words/level1.ts` … `level4.ts` に分け、`src/data/words/index.ts` で結合・
`order` 順にソートして `words` を export する。

### 7-4. データ整合性テスト（必須）

`src/data/words.test.ts` で以下を強制する。データ追加のたびに CI が守ってくれる状態にする。

- `id` が全体で一意
- `word` が全体で一意（大文字小文字を無視）
- 各レベルの語数がちょうど 100
- 各レベル内の `order` が 1..100 の連番で重複なし
- 全語に `example` / `exampleJa` が空文字でなく存在する
- `example` に `word` の語幹が含まれている（活用形を許すため先頭4文字の部分一致で判定）
- `tags` が空配列でなく、全要素が `TAGS` に存在する
- `LEVELS` の id 集合と `words` に現れる `level` の集合が一致する

> Level 1 だけ実装した段階で「100語ちょうど」テストが落ちるので、
> テストは `LEVELS` に定義されたレベルのみを検査する形にし、
> `LEVELS` へのレベル追加とデータ追加を同じコミットで行うこと。

---

## 8. 品質・テスト・CI

### 8-1. テスト基盤

```bash
npm i -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

`package.json` に `"test": "vitest run"`, `"test:watch": "vitest"` を追加。
`vite.config.ts` に `test: { environment: 'jsdom', setupFiles: './src/test/setup.ts' }`。

### 8-2. 最低限書くテスト

| 対象 | 内容 |
| --- | --- |
| `src/data/words.test.ts` | §7-4 の整合性チェック |
| `src/storage/progress.test.ts` | v1→v2 マイグレーション、`masteryOf` の境界、localStorage が throw しても落ちない |
| `src/components/StudyCard.test.tsx` | **1タップで意味・例文・和訳・メモが全部出る**（回帰防止の要）／「わからない」で ☆ が付く／めくる前は答えが DOM に無い |
| セッション | 最終問題で「わかった」を押すと結果画面に遷移する（無限ループの回帰防止） |
| `SegmentedControl` | クリックとキーボード操作で選択が変わる |

### 8-3. CI

`.github/workflows/ci.yml` を新設（PR と push で走らせる）:

```yaml
- run: npm ci
- run: npm run lint
- run: npx tsc -b --noEmit
- run: npm run test
- run: npm run build
```

既存の `deploy.yml` は main への push 時のみ。build 前に lint / test を通す。

---

## 9. 実装ステップ（commit 単位）

各ステップの終わりで `npm run lint && npx tsc -b && npm run test && npm run build` が
通ることを条件にする。**1コミット = 1ステップ**。

| # | コミット | 内容 | 依存 |
| --- | --- | --- | --- |
| 1 | テスト基盤導入 | vitest + testing-library、`npm run test` が空で通る、CI ワークフロー追加 | - |
| 2 | データモデル刷新 | `Word` 型変更、`levels.ts` / `tags.ts` 新設、`phases.ts` / `categories.ts` 削除、既存50語を新形式に移行（この時点では L1=50語のまま）、整合性テスト追加（語数100チェックは一旦除外） | 1 |
| 3 | 進捗ストア | `storage/progress.ts` + `ProgressProvider`、v1マイグレーション、`useStarredWords.ts` 削除、テスト | 2 |
| 4 | 学習カード刷新 | 1タップ全表示、☆をカード右上へ、2択アクション、高さ固定、例文ハイライト、キーボード操作、テスト | 3 |
| 5 | セッション＋結果画面 | 剰余ループ削除、出題数の概念、`Result` 画面、「間違えた語をもう一周」、テスト | 4 |
| 6 | 画面構成の再編 | 画面 enum、`Home`（レベル一覧＋進捗）、`LevelDetail`、下部タブバー | 5 |
| 7 | 設定UI刷新 | `SegmentedControl` 共通化、詳細設定の折りたたみ、設定の永続化、`select`/radio 全廃 | 6 |
| 8 | 一覧・復習画面 | 検索、状態ドット、行展開で例文表示、grid レイアウト化、`Review` タブ | 6 |
| 9 | デザイン刷新 | トークン整備、ダークモード、44px タップ領域、セーフエリア、focus-visible、reduced-motion | 7, 8 |
| 10 | 単語データ Level 1 | 100語に到達させる。`data/words/level1.ts` に分割。語数100チェックを有効化 | 2 |
| 11 | 単語データ Level 2 | 100語追加 | 10 |
| 12 | 単語データ Level 3・4 | 各100語追加 | 11 |
| 13 | README 更新 | 機能・データ追加手順・レベル設計を反映 | 全部 |

10〜12 は 3〜9 と並行して進められる（データとUIの依存が薄いため）。
ただしステップ2の型変更が前提。

### 最小リリース単位

**ステップ 1〜10 まで**やれば、ユーザーの不満（解説の2タップ、レベル分け、1レベル100問、
トップ/設定の見づらさ）は全部解消される。11〜13 は後追いでよい。

---

## 10. やらないこと（スコープ外）

意図的に除外する。必要になったら別計画で。

- **SRS / 間隔反復アルゴリズム**（Anki 的なスケジューリング）— 過剰。`streak >= 2` で十分。
- **音声読み上げ / 発音記号** — データ整備コストが跳ね上がる。
- **サーバー・アカウント・端末間同期** — localStorage のままで良い。GitHub Pages の構成を壊さない。
- **React Router / 状態管理ライブラリの導入** — 画面数が少なく、バンドルを増やす価値がない。
- **UI ライブラリ（MUI 等）の導入** — 自前 CSS で足りる規模。
- **選択式クイズ / タイピング入力モード** — 「特有の機能は要らない」という要望に沿って除外。
- **レベルのロック（前レベルクリアで解放）** — 学習の自由度を下げるだけ。
- **PWA / オフラインインストール** — 効果はあるが今回の不満とは無関係。
- **スワイプジェスチャ** — 誤爆リスク。キーボードショートカットで代替。

---

## 11. 実装時の注意点まとめ

- **単語 ID は絶対に振り直さない。** localStorage の進捗が全部壊れる。
- 型変更（ステップ2）で全コンポーネントがコンパイルエラーになる。
  `tsc -b` のエラーを潰し切るまで次に進まない。
- `example` 必須化は型で強制されるので、既存39語に例文を書くまでステップ2が完了しない。
  ステップ2の範囲では既存50語分だけ書けばよい（新規語はステップ10以降）。
- CSS の書き換えはステップ9でまとめてやる。それまでは既存クラス名を維持して差分を小さく保つ。
- ダークモードは実装後に DevTools の `prefers-color-scheme` エミュレーションで**必ず目視確認**する。
- カードの高さ固定は、例文が長い語（16語程度）でも崩れないことを確認する。
