// 読み取った商品の明細を一覧表示するコンポーネント
export default function ItemTable({ records, onDelete }) {
  return (
    <table className="item-table">
      <thead>
        <tr>
          <th>日付</th>
          <th>商品名</th>
          <th>カテゴリ</th>
          <th className="num">金額</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {records.map((r) => (
          <tr key={r.id}>
            <td>{r.date}</td>
            <td>{r.name}</td>
            <td>
              <span className="category-tag">{r.category}</span>
            </td>
            <td className="num">{r.price.toLocaleString()} 円</td>
            <td>
              <button
                className="btn-delete"
                onClick={() => onDelete(r.id)}
                aria-label="削除"
              >
                削除
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
