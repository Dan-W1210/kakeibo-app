import { useMemo } from 'react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

// Chart.js の円グラフに必要な要素を登録
ChartJS.register(ArcElement, Tooltip, Legend)

// カテゴリ別の色（カテゴリ名 → 色）
const COLORS = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#9ca3af',
]

// カテゴリ別の合計金額を円グラフで表示する
export default function CategoryPieChart({ records }) {
  // カテゴリごとに金額を集計する
  const { labels, values } = useMemo(() => {
    const totals = {}
    for (const r of records) {
      totals[r.category] = (totals[r.category] || 0) + r.price
    }
    return {
      labels: Object.keys(totals),
      values: Object.values(totals),
    }
  }, [records])

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length]),
      },
    ],
  }

  return <Pie data={data} />
}
