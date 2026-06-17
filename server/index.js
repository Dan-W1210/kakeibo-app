// 家計簿アプリのバックエンドサーバ
// レシート画像を受け取り、Claude API（vision + 構造化出力）で内容を読み取って返す。
// APIキーはこのサーバの .env のみで管理し、ブラウザには一切渡さない。

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import { z } from 'zod'

const PORT = process.env.PORT || 3001

// APIキーの存在チェック（未設定なら起動時に警告）
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn(
    '[警告] ANTHROPIC_API_KEY が未設定です。server/.env を作成してキーを設定してください。',
  )
}

// Anthropic クライアント（ANTHROPIC_API_KEY を環境変数から自動で読み込む）
const client = new Anthropic()

// 自動分類で使うカテゴリの一覧。Claude にこの中から選ばせる。
const CATEGORIES = [
  '食費',
  '日用品',
  '外食',
  '交通費',
  '娯楽',
  '衣類',
  '医療',
  'その他',
]

// レシート読み取り結果のスキーマ（構造化出力で形を保証する）
const ItemSchema = z.object({
  name: z.string().describe('商品名'),
  price: z.number().describe('金額（円・税込）'),
  category: z.enum(CATEGORIES).describe('商品のカテゴリ'),
})

const ReceiptSchema = z.object({
  shop: z.string().describe('店舗名。不明なら空文字'),
  date: z.string().describe('購入日。YYYY-MM-DD 形式。不明なら空文字'),
  items: z.array(ItemSchema).describe('購入した商品の一覧'),
  total: z.number().describe('合計金額（円）'),
})

const app = express()
app.use(cors())
// 画像（base64）を受け取るため、リクエストサイズの上限を引き上げる
app.use(express.json({ limit: '15mb' }))

// ヘルスチェック用
app.get('/api/health', (req, res) => {
  res.json({ ok: true, hasApiKey: Boolean(process.env.ANTHROPIC_API_KEY) })
})

// レシート画像を読み取るエンドポイント
// リクエストボディ: { image: "data:image/png;base64,...." }
app.post('/api/receipt', async (req, res) => {
  try {
    const { image } = req.body
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: '画像データ(image)が必要です。' })
    }

    // data URL から media_type と base64 本体を取り出す
    const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/)
    if (!match) {
      return res
        .status(400)
        .json({ error: '画像は data URL 形式（data:image/...;base64,...）で送ってください。' })
    }
    const [, mediaType, base64Data] = match

    // Claude に画像を渡して、構造化出力でレシート内容を抽出させる
    // （beta.messages.parse は structured-outputs のベータヘッダを自動で付与する）
    const response = await client.beta.messages.parse({
      model: 'claude-haiku-4-5',
      max_tokens: 4096,
      system:
        'あなたはレシート読み取りアシスタントです。レシート画像から商品名・金額・購入日を正確に読み取り、' +
        '各商品を指定カテゴリのいずれかに分類してください。金額は税込の数値（円）で返してください。' +
        '読み取れない項目は空文字または0としてください。',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64Data },
            },
            {
              type: 'text',
              text: 'このレシートの内容を読み取り、商品ごとにカテゴリを分類してください。',
            },
          ],
        },
      ],
      output_format: betaZodOutputFormat(ReceiptSchema, 'receipt'),
    })

    // 構造化出力のパース結果（スキーマ検証済み）
    const parsed = response.parsed
    if (!parsed) {
      return res
        .status(502)
        .json({ error: 'レシートの読み取りに失敗しました。画像を変えて再度お試しください。' })
    }

    res.json(parsed)
  } catch (err) {
    // Claude API のエラーを種類ごとにハンドリング
    if (err instanceof Anthropic.AuthenticationError) {
      return res.status(401).json({ error: 'APIキーが無効です。server/.env を確認してください。' })
    }
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: 'APIのレート制限に達しました。少し待って再試行してください。' })
    }
    console.error('[レシート読み取りエラー]', err)
    res.status(500).json({ error: 'サーバ内部エラーが発生しました。' })
  }
})

app.listen(PORT, () => {
  console.log(`家計簿サーバを起動しました: http://localhost:${PORT}`)
})
