// バックエンドの API を呼び出す関数群

// レシート画像（data URL）をサーバへ送り、読み取り結果を取得する
export async function readReceipt(dataUrl) {
  const res = await fetch('/api/receipt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataUrl }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'レシートの読み取りに失敗しました。')
  }
  return data // { shop, date, items: [{ name, price, category }], total }
}
