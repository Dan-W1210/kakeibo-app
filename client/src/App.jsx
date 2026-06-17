import { useEffect, useMemo, useState } from 'react'
import { readReceipt } from './api.js'
import ReceiptUpload from './components/ReceiptUpload.jsx'
import ItemTable from './components/ItemTable.jsx'
import CategoryPieChart from './components/CategoryPieChart.jsx'
import MonthlyBarChart from './components/MonthlyBarChart.jsx'

const STORAGE_KEY = 'kakeibo-app.records'

// localStorage から保存済みのレコードを読み込む
function loadRecords() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export default function App() {
  // 1件 = 1商品。{ id, name, price, category, date, shop }
  const [records, setRecords] = useState(loadRecords)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // レコードが変わるたびに localStorage へ保存（リロードしても消えない）
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  }, [records])

  // レシート画像を読み取り、商品ごとのレコードへ展開して追加する
  async function handleReceipt(dataUrl) {
    setLoading(true)
    setError('')
    try {
      const result = await readReceipt(dataUrl)
      const date = result.date || new Date().toISOString().slice(0, 10)
      const newRecords = (result.items || []).map((item, i) => ({
        id: `${Date.now()}-${i}`,
        name: item.name,
        price: Number(item.price) || 0,
        category: item.category || 'その他',
        date,
        shop: result.shop || '',
      }))
      if (newRecords.length === 0) {
        setError('レシートから商品を読み取れませんでした。')
        return
      }
      setRecords((prev) => [...newRecords, ...prev])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // レコードを削除する
  function deleteRecord(id) {
    setRecords((prev) => prev.filter((r) => r.id !== id))
  }

  // 全削除
  function clearAll() {
    if (window.confirm('すべての記録を削除しますか？')) {
      setRecords([])
    }
  }

  // 合計金額
  const total = useMemo(
    () => records.reduce((sum, r) => sum + r.price, 0),
    [records],
  )

  return (
    <div className="app">
      <header className="app-header">
        <h1>レシート家計簿</h1>
        <p className="app-summary">
          記録 {records.length} 件 / 合計 {total.toLocaleString()} 円
        </p>
      </header>

      <main className="app-main">
        <ReceiptUpload onRead={handleReceipt} loading={loading} />
        {error && <p className="error">{error}</p>}

        {records.length > 0 && (
          <>
            <section className="charts">
              <div className="chart-card">
                <h2>カテゴリ別</h2>
                <CategoryPieChart records={records} />
              </div>
              <div className="chart-card">
                <h2>月別支出</h2>
                <MonthlyBarChart records={records} />
              </div>
            </section>

            <section className="table-section">
              <div className="table-header">
                <h2>明細</h2>
                <button className="btn-clear" onClick={clearAll}>
                  全削除
                </button>
              </div>
              <ItemTable records={records} onDelete={deleteRecord} />
            </section>
          </>
        )}
      </main>
    </div>
  )
}
