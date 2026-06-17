import { useRef, useState } from 'react'

// レシート画像をアップロードするコンポーネント
// 選択された画像を data URL に変換し、onRead に渡す
export default function ReceiptUpload({ onRead, loading }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState('')

  function handleChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      setPreview(dataUrl)
      onRead(dataUrl)
    }
    reader.readAsDataURL(file)
    // 同じファイルを連続で選べるように入力をリセット
    e.target.value = ''
  }

  return (
    <section className="upload">
      <button
        className="btn-upload"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
      >
        {loading ? '読み取り中...' : 'レシート画像をアップロード'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        hidden
      />
      {preview && (
        <img className="upload-preview" src={preview} alt="アップロードしたレシート" />
      )}
    </section>
  )
}
