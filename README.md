# eitan - 英単語帳 Web アプリ

TOEIC 800 点レベルを目安にした英単語学習アプリの MVP です。

## 機能 (MVP)

- **学習タブ**: 単語 → タップで意味を表示 → ☆ で復習リストに登録 → 次の単語へ
- **一覧タブ**: 収録単語の一覧表示、復習リストのみの絞り込み
- 収録単語数: 50 語 (`src/data/words.ts` に追記すれば増やせます)
- 復習リストはブラウザの `localStorage` に保存されます(サーバー不要)

## 開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

## デプロイ (GitHub Pages)

`main` ブランチに push すると `.github/workflows/deploy.yml` が自動的に
ビルドして GitHub Pages に公開します。

初回のみ、リポジトリの Settings → Pages で Source を
**GitHub Actions** に設定してください。

公開 URL: `https://senntou.github.io/eitan/`
