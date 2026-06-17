# レシート家計簿アプリ

レシート画像をアップロードすると Claude API（`claude-haiku-4-5`）が内容を自動で読み取り、
商品名・金額・日付を一覧表示し、カテゴリ別に自動分類して円グラフ・月別棒グラフで集計する家計簿アプリです。

## 構成

```
kakeibo-app/
├── server/   # バックエンド（Node.js + Express）。Claude API を呼び出す
└── client/   # フロントエンド（React + Vite + Chart.js）
```

- APIキーはサーバの `server/.env` のみで管理し、ブラウザからは直接 Claude API を呼びません。
- 登録データはブラウザの localStorage に保存され、リロードしても消えません。

## セットアップ

### 1. バックエンド

```bash
cd server
npm install
cp .env.example .env   # .env を作成し、ANTHROPIC_API_KEY を設定
npm run dev            # http://localhost:3001 で起動
```

### 2. フロントエンド（別ターミナル）

```bash
cd client
npm install
npm run dev            # http://localhost:5173 で起動（/api は 3001 へプロキシ）
```

ブラウザで http://localhost:5173 を開き、レシート画像をアップロードしてください。

## 技術スタック

- フロントエンド: React 18 / Vite 5 / Chart.js（react-chartjs-2）
- バックエンド: Node.js / Express / @anthropic-ai/sdk
- AIモデル: Claude `claude-haiku-4-5`（vision + 構造化出力）
