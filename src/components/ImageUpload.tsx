import { useRef, useState, useCallback, DragEvent, ChangeEvent } from 'react'
import { BackgroundImage } from '../types/emoji'

interface ImageUploadProps {
  backgroundImage: BackgroundImage
  onImageChange: (data: string | null) => void
  onScaleChange: (scale: number) => void
  onOffsetChange: (offsetX: number, offsetY: number) => void
  onOpacityChange: (opacity: number) => void
  onClear: () => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function ImageUpload({
  backgroundImage,
  onImageChange,
  onScaleChange,
  onOffsetChange,
  onOpacityChange,
  onClear,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDraggingImage, setIsDraggingImage] = useState(false)
  const dragStartPos = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null)

  // ファイルを処理してBase64に変換
  const processFile = useCallback((file: File) => {
    setError(null)

    // ファイルタイプをチェック
    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
      setError('PNG または JPEG ファイルのみ対応しています')
      return
    }

    // ファイルサイズをチェック
    if (file.size > MAX_FILE_SIZE) {
      setError('ファイルサイズは10MB以下にしてください')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        onImageChange(result)
      }
    }
    reader.onerror = () => {
      setError('ファイルの読み込みに失敗しました')
    }
    reader.readAsDataURL(file)
  }, [onImageChange])

  // ファイル選択
  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }, [processFile])

  // ドラッグ&ドロップ
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      processFile(file)
    }
  }, [processFile])

  // 画像位置調整のドラッグ
  const handleImageDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDraggingImage(true)
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: backgroundImage.offsetX,
      offsetY: backgroundImage.offsetY,
    }
  }, [backgroundImage.offsetX, backgroundImage.offsetY])

  const handleImageDragMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingImage || !dragStartPos.current) return

    const dx = e.clientX - dragStartPos.current.x
    const dy = e.clientY - dragStartPos.current.y

    // プレビュースケール（128px = キャンバスサイズ）を考慮
    const scale = 1
    const newOffsetX = Math.max(-128, Math.min(128, dragStartPos.current.offsetX + dx * scale))
    const newOffsetY = Math.max(-128, Math.min(128, dragStartPos.current.offsetY + dy * scale))

    onOffsetChange(newOffsetX, newOffsetY)
  }, [isDraggingImage, onOffsetChange])

  const handleImageDragEnd = useCallback(() => {
    setIsDraggingImage(false)
    dragStartPos.current = null
  }, [])

  return (
    <div className="space-y-3">
      {/* 画像がない場合: アップロードエリア */}
      {!backgroundImage.data && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-gray-500 space-y-2">
            <div className="text-3xl">📷</div>
            <div>
              <span className="text-blue-500 font-medium">クリックして選択</span>
              <span> または ドラッグ&ドロップ</span>
            </div>
            <div className="text-sm text-gray-400">PNG / JPEG（最大10MB）</div>
          </div>
        </div>
      )}

      {/* 画像がある場合: プレビューと調整 */}
      {backgroundImage.data && (
        <div className="space-y-3">
          {/* プレビュー＆位置調整エリア */}
          <div
            className="relative w-32 h-32 mx-auto border border-gray-300 rounded-lg overflow-hidden cursor-move"
            style={{
              backgroundImage: `
                linear-gradient(45deg, #ccc 25%, transparent 25%),
                linear-gradient(-45deg, #ccc 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #ccc 75%),
                linear-gradient(-45deg, transparent 75%, #ccc 75%)
              `,
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
              backgroundColor: '#fff',
            }}
            onMouseDown={handleImageDragStart}
            onMouseMove={handleImageDragMove}
            onMouseUp={handleImageDragEnd}
            onMouseLeave={handleImageDragEnd}
          >
            <img
              src={backgroundImage.data}
              alt="背景画像"
              className="absolute pointer-events-none"
              style={{
                transform: `scale(${backgroundImage.scale}) translate(${backgroundImage.offsetX / backgroundImage.scale}px, ${backgroundImage.offsetY / backgroundImage.scale}px)`,
                transformOrigin: 'center',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: backgroundImage.opacity,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center">ドラッグで位置を調整</p>

          {/* 拡大率スライダー */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-16">拡大率</span>
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.1}
              value={backgroundImage.scale}
              onChange={(e) => onScaleChange(Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-right text-gray-700">{Math.round(backgroundImage.scale * 100)}%</span>
          </div>

          {/* 透明度スライダー */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-16">透明度</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={backgroundImage.opacity}
              onChange={(e) => onOpacityChange(Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-right text-gray-700">{Math.round(backgroundImage.opacity * 100)}%</span>
          </div>

          {/* 操作ボタン */}
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors text-sm"
            >
              画像を変更
            </button>
            <button
              onClick={onClear}
              className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors text-sm"
            >
              削除
            </button>
          </div>
        </div>
      )}

      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* エラーメッセージ */}
      {error && (
        <div className="text-sm text-red-500 text-center">{error}</div>
      )}
    </div>
  )
}
