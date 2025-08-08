# Life Challenges Recommender Starter

このリポジトリは、Google Sheets をデータソースにして、人生の課題と学習ロードマップ（タイムライン）を Next.js で可視化するスターターです。Apps Script で CSV を公開し、Next.js アプリがそれを取得して表示します。

## 構成

- `prompts/`: ChatGPT などに課題をカテゴリ分類・JSON 化させるプロンプト例
- `sheets/`: Google Sheets のテンプレ CSV（`Roadmap.csv`, `Books.csv`）
- `apps_script/`: Google Sheets 側で利用する Apps Script（CSV 生成 + 公開）
- `web/`: Next.js タイムライン表示アプリ

## セットアップ手順

1. リポジトリを取得

```bash
git clone <this-repo-url>
cd life-challenges-recommender-starter
```

2. Google Sheets を準備
- `sheets/Roadmap.csv` と `sheets/Books.csv` を参考に、Google Sheets 上に同等のカラム構成でシートを作成してください。
- `apps_script/AppsScript.gs` のスクリプトを、対象スプレッドシートのスクリプトエディタに貼り付け、`デプロイ > ウェブアプリとしてデプロイ` で公開 URL を得ます（誰でもアクセス可を推奨）。
- 公開 URL は CSV を返すようにしてください（スクリプト内コメント参照）。

3. Web アプリのセットアップ

```bash
cd web
cp .env.example .env.local
# 取得した公開 CSV URL を .env.local に設定
# 例: NEXT_PUBLIC_ROADMAP_CSV_URL="https://.../exec?type=roadmap"
#     NEXT_PUBLIC_BOOKS_CSV_URL="https://.../exec?type=books"

npm install
npm run dev
```

4. ブラウザで表示
- `http://localhost:3000` にアクセスすると、CSV から取得したロードマップがタイムラインとして表示されます。

## データ仕様

- Roadmap.csv（または対応するシート）例カラム
  - `id`: 一意な ID
  - `title`: 課題/ステップのタイトル
  - `description`: 説明
  - `startDate`: 開始日（YYYY-MM-DD）
  - `endDate`: 終了日（YYYY-MM-DD）
  - `category`: カテゴリ名（例: Health, Career, Finance など）

- Books.csv 例カラム
  - `id`: 一意な ID
  - `title`: 書籍タイトル
  - `author`: 著者
  - `url`: リンク
  - `category`: 紐づくカテゴリ

## ライセンス

- MIT（必要に応じて変更してください）