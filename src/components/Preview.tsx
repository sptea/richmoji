import { useRef, useEffect, useState } from 'react'
import { EmojiState, FONTS } from '../types/emoji'
import { drawEmoji, loadImage } from '../utils/canvas'

interface PreviewProps {
  state: EmojiState
  onDownload: () => void
  compact?: boolean
}

type BackgroundType = 'checker' | 'white' | 'dark'

export function Preview({ state, onDownload, compact = false }: PreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [background, setBackground] = useState<BackgroundType>('checker')
  const [bgImageElement, setBgImageElement] = useState<HTMLImageElement | null>(null)

  // 背景画像を読み込む
  useEffect(() => {
    if (state.backgroundImage.data) {
      loadImage(state.backgroundImage.data).then(setBgImageElement).catch(() => setBgImageElement(null))
    } else {
      setBgImageElement(null)
    }
  }, [state.backgroundImage.data])

  // Canvasを描画
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    drawEmoji(ctx, state, bgImageElement || undefined)
  }, [state, bgImageElement])

  const getBackgroundStyle = (type: BackgroundType) => {
    switch (type) {
      case 'checker':
        return {
          backgroundImage: `
            linear-gradient(45deg, #ccc 25%, transparent 25%),
            linear-gradient(-45deg, #ccc 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ccc 75%),
            linear-gradient(-45deg, transparent 75%, #ccc 75%)
          `,
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
          backgroundColor: '#fff',
        }
      case 'white':
        return { backgroundColor: '#ffffff' }
      case 'dark':
        return { backgroundColor: '#1a1a1a' }
    }
  }

  const font = FONTS.find(f => f.id === state.font.id)

  // コンパクトモード（狭い画面用フローティング）
  if (compact) {
    return (
      <div className="bg-white rounded-xl shadow-xl p-4">
        {/* タイトル */}
        <div className="mb-2">
          <h1 className="text-sm font-bold text-gray-900">RichMoji</h1>
          <p className="text-xs text-gray-500">Slack絵文字ジェネレーター</p>
        </div>

        {/* メインプレビュー（192px = 128 * 1.5） */}
        <div
          className="rounded-lg overflow-hidden border border-gray-300 mb-3"
          style={{
            width: 192,
            height: 192,
            ...getBackgroundStyle(background),
          }}
        >
          <canvas
            ref={canvasRef}
            width={128}
            height={128}
            style={{ width: 192, height: 192, imageRendering: 'crisp-edges' }}
          />
        </div>

        {/* 背景切り替え（コンパクト） */}
        <div className="flex gap-1 mb-3">
          {(['checker', 'white', 'dark'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setBackground(type)}
              className={`flex-1 px-2 py-1.5 text-xs rounded ${
                background === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {type === 'checker' ? '透明' : type === 'white' ? '白' : '黒'}
            </button>
          ))}
        </div>

        {/* ダウンロードボタン */}
        <button
          onClick={onDownload}
          className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          PNGをダウンロード
        </button>
      </div>
    )
  }

  // 通常モード（広い画面用サイドバー）
  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* タイトル */}
      <h1 className="text-lg font-bold text-gray-900 mb-1">RichMoji</h1>
      <p className="text-xs text-gray-500 mb-4">Slack絵文字ジェネレーター</p>

      {/* 背景切り替え */}
      <div className="flex gap-1 mb-3">
        {(['checker', 'white', 'dark'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setBackground(type)}
            className={`flex-1 px-2 py-1 text-xs rounded ${
              background === type
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {type === 'checker' ? '透明' : type === 'white' ? '白' : '黒'}
          </button>
        ))}
      </div>

      {/* メインプレビュー（128px） */}
      <div className="flex justify-center mb-4">
        <div
          className="rounded-lg overflow-hidden border border-gray-300"
          style={{
            width: 128,
            height: 128,
            ...getBackgroundStyle(background),
          }}
        >
          <canvas
            ref={canvasRef}
            width={128}
            height={128}
            style={{ width: 128, height: 128 }}
          />
        </div>
      </div>

      {/* Slack風プレビュー（ダーク/ライト） */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-12">ライト</span>
          <div
            className="flex-1 rounded p-2 flex items-center gap-2"
            style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
          >
            <div
              className="rounded overflow-hidden flex-shrink-0"
              style={{
                width: 20,
                height: 20,
                ...getBackgroundStyle('checker'),
              }}
            >
              <canvas
                width={128}
                height={128}
                style={{ width: 20, height: 20 }}
                ref={el => {
                  if (el) {
                    const ctx = el.getContext('2d')
                    if (ctx) drawEmoji(ctx, state, bgImageElement || undefined)
                  }
                }}
              />
            </div>
            <span className="text-sm text-gray-900 truncate">{font?.name || 'Font'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-12">ダーク</span>
          <div
            className="flex-1 rounded p-2 flex items-center gap-2"
            style={{ backgroundColor: '#1a1a1a' }}
          >
            <div
              className="rounded overflow-hidden flex-shrink-0"
              style={{
                width: 20,
                height: 20,
                ...getBackgroundStyle('checker'),
              }}
            >
              <canvas
                width={128}
                height={128}
                style={{ width: 20, height: 20 }}
                ref={el => {
                  if (el) {
                    const ctx = el.getContext('2d')
                    if (ctx) drawEmoji(ctx, state, bgImageElement || undefined)
                  }
                }}
              />
            </div>
            <span className="text-sm text-gray-100 truncate">{font?.name || 'Font'}</span>
          </div>
        </div>
      </div>

      {/* ダウンロードボタン */}
      <button
        onClick={onDownload}
        className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
      >
        PNGをダウンロード
      </button>
    </div>
  )
}
