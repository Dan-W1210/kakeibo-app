# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際の Claude Code (claude.ai/code) 向けガイダンスです。

## プロジェクト概要

- **プロジェクト名**: kakeibo-app
- **内容**: レシート読み込み家計簿アプリ。レシート画像をアップロードすると Claude API が内容を自動で読み取り、商品名・金額・日付を一覧表示し、カテゴリ別（食費・日用品・外食など）に自動分類して円グラフ・月別棒グラフで集計する Web アプリケーション。

## 技術スタック・構成

- **フロントエンド**: React 18 + Vite 5、グラフは Chart.js（`react-chartjs-2`）。`client/` 配下。
- **バックエンド**: Node.js + Express、`@anthropic-ai/sdk`。`server/` 配下。
- **AIモデル**: Claude `claude-haiku-4-5`（vision で画像読み取り + 構造化出力でスキーマ検証）。
- **永続化**: ブラウザの `localStorage`（キー: `kakeibo-app.records`）。リロードしても消えない。

```
kakeibo-app/
├── server/   # Express。POST /api/receipt がレシート画像を Claude で読み取る
│   ├── index.js
│   └── .env.example   # ANTHROPIC_API_KEY のテンプレート（.env は .gitignore 済み）
└── client/   # React + Vite
    └── src/
        ├── App.jsx          # 状態管理・localStorage 保存・集計
        ├── api.js           # /api/receipt 呼び出し
        └── components/      # ReceiptUpload / ItemTable / CategoryPieChart / MonthlyBarChart
```

### セキュリティ・API 方針

- **APIキーは `server/.env` のみで管理し、ブラウザからは絶対に直接 Claude API を呼ばない。** フロントは自前のバックエンド `/api/receipt` を経由する。
- `.env` は `.gitignore` に登録済み。キーをコミットしないこと。テンプレートは `server/.env.example`。
- 起動手順は [README.md](README.md) を参照。

## Git 運用ルール

- **コードを変更するたびに、必ず GitHub へプッシュする。**
  - 変更が一区切りついたら `git add` → `git commit` → `git push` を実施する。
  - コミットメッセージは変更内容が分かるように日本語で簡潔に記述する。
  - 作業を未コミット・未プッシュのまま放置しない。
- リモートリポジトリを基本（single source of truth）とし、ローカルの変更は速やかに反映する。

```bash
# 変更を反映する基本フロー
git add .
git commit -m "変更内容を簡潔に記述"
git push
```

## 設計方針・コーディング規約

- **言語**: ユーザーへの返答・コメント・UI 文言は日本語を基本とする。
- **データ分離**: 収支データ（日付・金額・カテゴリ・メモなど）はデータ構造として分離し、表示・集計ロジックから切り離す。
- **責務分割**: 入力・状態管理・集計・保存処理は責務ごとに関数／モジュールへ分割する。
- **スタイル**: スタイルは CSS に集約し、インラインスタイルは避ける。
- 外部ライブラリやフレームワークの導入は、必要になった場合に事前に方針を確認する。

## 主要機能

- レシート画像のアップロードと Claude API による自動読み取り
- 読み取った商品名・金額・日付の一覧表示
- カテゴリ別（食費・日用品・外食など）の自動分類と集計
- カテゴリ別の円グラフ・月別の棒グラフ表示（Chart.js）
- データの永続化（localStorage。リロードしても消えない）

## 補足: この環境での注意点

- Windows 環境で SSL 証明書検査により `git push` が失敗する場合は、検証を無効化せず Windows 証明書ストアを使う設定で回避する。
  - `git config http.sslBackend schannel`
