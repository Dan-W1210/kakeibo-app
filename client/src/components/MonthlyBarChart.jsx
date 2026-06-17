import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'

// Chart.js の棒グラフに必要な要素を登録
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

// 月別（YYYY-MM）の合計支出を棒グラフで表示する
export default function MonthlyBarChart({ records }) {
  // 月ごとに金額を集計し、月の昇順に並べる
  const { labels, values } = useMemo(() => {
    const totals = {}
    for (const r of records) {
      // 日付の先頭7文字（YYYY-MM）を月キーとする
      const month = (r.date || '').slice(0, 7) || '不明'
      totals[month] = (totals[month] || 0) + r.price
    }
    const sortedMonths = Object.keys(totals).sort()
    return {
      labels: sortedMonths,
      values: sortedMonths.map((m) => totals[m]),
    }
  }, [records])

  const data = {
    labels,
    datasets: [
      {
        label: '支出（円）',
        data: values,
        backgroundColor: '#3b82f6',
      },
    ],
  }

  const options = {
    scales: {
      y: { beginAtZero: true },
    },
    plugins: {
      legend: { display: false },
    },
  }

  return <Bar data={data} options={options} />
}
