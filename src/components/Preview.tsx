import { useRef, useEffect, useState, useCallback } from 'react'
import { EmojiState, COLOR_THEMES, ColorThemeId, TextLayoutMode, TEXT_LAYOUT_MODES } from '../types/emoji'
import { drawEmoji, loadImage } from '../utils/canvas'
import { calculateFrameTransform, TOTAL_FRAMES, FRAME_DELAY } from '../utils/animation'

// 明るい色かどうかを判定（チェックマークの色を決めるため）
function isLightColor(color: string): boolean {
  const hex = color.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const luminance = (r * 299 + g * 587 + b * 114) / 1000
  return luminance > 128
}

interface PreviewProps {
  state: EmojiState
  onDownload: () => void
  compact?: boolean
  text: string
  textColor: string
  backgroundColor: string
  fontSize: number
  autoFit: boolean
  textOpacity: number
  textOffset: { x: number; y: number }
  layoutMode: TextLayoutMode
  onTextChange: (text: string) => void
  onTextColorChange: (color: string) => void
  onBackgroundColorChange: (color: string) => void
  onFontSizeChange: (size: number) => void
  onAutoFitChange: (autoFit: boolean) => void
  onTextOpacityChange: (opacity: number) => void
  onTextOffsetChange: (offset: { x: number; y: number }) => void
  onTextOffsetReset: () => void
  onLayoutModeChange: (mode: TextLayoutMode) => void
}

type BackgroundType = 'checker' | 'white' | 'dark'

export function Preview({
  state,
  onDownload,
  compact = false,
  text,
  textColor,
  backgroundColor,
  fontSize,
  autoFit,
  textOpacity,
  textOffset,
  layoutMode,
  onTextChange,
  onTextColorChange,
  onBackgroundColorChange,
  onFontSizeChange,
  onAutoFitChange,
  onTextOpacityChange,
  onTextOffsetChange,
  onTextOffsetReset,
  onLayoutModeChange,
}: PreviewProps) {
  // 3つの背景用canvas refs
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([null, null, null])
  const [bgImageElement, setBgImageElement] = useState<HTMLImageElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  // ドラッグ状態
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null)

  // カラーテーマ状態
  const [colorTheme, setColorTheme] = useState<ColorThemeId>('default')
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false)
  const themeDropdownRef = useRef<HTMLDivElement>(null)
  const currentTheme = COLOR_THEMES.find(t => t.id === colorTheme) || COLOR_THEMES[0]

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target as Node)) {
        setIsThemeDropdownOpen(false)
      }
    }
    if (isThemeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isThemeDropdownOpen])

  // 背景画像を読み込む
  useEffect(() => {
    if (state.backgroundImage.data) {
      loadImage(state.backgroundImage.data).then(setBgImageElement).catch(() => setBgImageElement(null))
    } else {
      setBgImageElement(null)
    }
  }, [state.backgroundImage.data])

  // テキストの長さ（改行を除く）
  const textLength = state.text.replace(/\n/g, '').length

  // 全canvasに描画
  const drawAllCanvases = useCallback((transform?: ReturnType<typeof calculateFrameTransform>) => {
    canvasRefs.current.forEach((canvas) => {
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      drawEmoji(ctx, state, bgImageElement || undefined, transform)
    })
  }, [state, bgImageElement])

  // アニメーションループ
  const animate = useCallback((timestamp: number) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = timestamp
    }

    const duration = TOTAL_FRAMES * FRAME_DELAY // 20 * 100 = 2000ms
    const elapsed = timestamp - startTimeRef.current
    const progress = (elapsed % duration) / duration
    const frameIndex = Math.floor(progress * TOTAL_FRAMES)

    const transform = calculateFrameTransform(state.animation, frameIndex, TOTAL_FRAMES, textLength)
    drawAllCanvases(transform)

    animationFrameRef.current = requestAnimationFrame(animate)
  }, [state, textLength, drawAllCanvases])

  // Canvas描画（静止画またはアニメーション）
  useEffect(() => {
    // 前のアニメーションをキャンセル
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    startTimeRef.current = null

    if (state.animation.enabled && state.animation.effects.length > 0) {
      // アニメーション再生
      animationFrameRef.current = requestAnimationFrame(animate)
    } else {
      // 静止画描画
      drawAllCanvases()
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [state, bgImageElement, animate, drawAllCanvases])

  const isAnimated = state.animation.enabled && state.animation.effects.length > 0

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

  // ドラッグハンドラ
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, canvasSize: number) => {
    e.preventDefault()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    // キャンバスサイズから128pxへのスケール
    const scale = 128 / canvasSize
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      offsetX: textOffset.x,
      offsetY: textOffset.y,
    }
    setIsDragging(true)

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!dragStartRef.current) return
      const moveX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX
      const moveY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY
      const deltaX = (moveX - dragStartRef.current.x) * scale
      const deltaY = (moveY - dragStartRef.current.y) * scale
      // -64 から 64 の範囲に制限
      const newX = Math.max(-64, Math.min(64, dragStartRef.current.offsetX + deltaX))
      const newY = Math.max(-64, Math.min(64, dragStartRef.current.offsetY + deltaY))
      onTextOffsetChange({ x: newX, y: newY })
    }

    const handleEnd = () => {
      setIsDragging(false)
      dragStartRef.current = null
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleEnd)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleMove)
    window.addEventListener('touchend', handleEnd)
  }

  // 位置がオフセットされているか
  const hasOffset = textOffset.x !== 0 || textOffset.y !== 0

  // サイズ・透明度コントロール（インラインで使用）
  const sizeOpacityControls = (
    <div className="mb-3 space-y-1.5">
      {/* レイアウトモード */}
      <div className="flex items-center gap-1">
        {TEXT_LAYOUT_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onLayoutModeChange(mode.id)}
            className={`px-2 py-0.5 text-xs rounded transition-colors ${
              layoutMode === mode.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={mode.description}
          >
            {mode.name}
          </button>
        ))}
      </div>

      {/* 通常モードの場合のみサイズ調整を表示 */}
      {layoutMode === 'normal' && (
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={autoFit}
              onChange={(e) => onAutoFitChange(e.target.checked)}
              className="w-3.5 h-3.5 rounded"
            />
            <span className="text-xs text-gray-500">自動</span>
          </label>
          <div className="flex-1 flex items-center gap-1">
            <span className="text-xs text-gray-500">サイズ</span>
            <input
              type="range"
              min={8}
              max={128}
              value={fontSize}
              onChange={(e) => {
                if (autoFit) onAutoFitChange(false)
                onFontSizeChange(Number(e.target.value))
              }}
              className="flex-1"
            />
            <span className="text-xs text-gray-500 w-8 text-right">{fontSize}</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">透明度</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={textOpacity}
          onChange={(e) => onTextOpacityChange(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-xs text-gray-500 w-8 text-right">{Math.round(textOpacity * 100)}%</span>
      </div>
    </div>
  )

  // 色タイル（インラインで使用）
  const colorTiles = (
    <div className="mb-3">
      {/* テーマ選択（カスタムドロップダウン） */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-500">パレット</span>
        <div className="flex-1 relative" ref={themeDropdownRef}>
          <button
            onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50"
          >
            <div className="flex gap-0.5 shrink-0">
              {currentTheme.colors.slice(0, 5).map((color, i) => (
                <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
              ))}
            </div>
            <span className="flex-1 text-left truncate">{currentTheme.name}</span>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${isThemeDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isThemeDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg">
              {COLOR_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setColorTheme(theme.id)
                    setIsThemeDropdownOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-100 ${
                    colorTheme === theme.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex gap-0.5 shrink-0">
                    {theme.colors.slice(0, 5).map((color, i) => (
                      <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <span className="flex-1 text-left truncate">{theme.name}</span>
                  {colorTheme === theme.id && (
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* 文字色 */}
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">文字</span>
            <input
              type="color"
              value={textColor}
              onChange={(e) => onTextColorChange(e.target.value)}
              className="w-5 h-5 rounded cursor-pointer border border-gray-300"
            />
          </div>
          <div className="flex flex-wrap gap-0.5">
            {currentTheme.colors.map((color, index) => (
              <button
                key={`${color}-${index}`}
                onClick={() => onTextColorChange(color)}
                className={`w-4 h-4 rounded border transition-transform hover:scale-110 flex items-center justify-center ${
                  textColor === color ? 'border-blue-500 ring-1 ring-blue-200' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
              >
                {textColor === color && (
                  <svg className="w-2 h-2" viewBox="0 0 20 20" fill="currentColor" style={{ color: isLightColor(color) ? '#000' : '#fff' }}>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 背景色 */}
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">背景</span>
            <input
              type="color"
              value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              className="w-5 h-5 rounded cursor-pointer border border-gray-300"
            />
          </div>
          <div className="flex flex-wrap gap-0.5">
            <button
              onClick={() => onBackgroundColorChange('transparent')}
              className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${
                backgroundColor === 'transparent'
                  ? 'border-blue-500 ring-1 ring-blue-200'
                  : 'border-gray-300'
              }`}
              style={{
                backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                backgroundSize: '4px 4px',
                backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px',
              }}
            >
              {backgroundColor === 'transparent' && (
                <svg className="w-2 h-2" viewBox="0 0 20 20" fill="#666">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            {currentTheme.colors.slice(0, 15).map((color, index) => (
              <button
                key={`${color}-${index}`}
                onClick={() => onBackgroundColorChange(color)}
                className={`w-4 h-4 rounded border transition-transform hover:scale-110 flex items-center justify-center ${
                  backgroundColor === color ? 'border-blue-500 ring-1 ring-blue-200' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
              >
                {backgroundColor === color && (
                  <svg className="w-2 h-2" viewBox="0 0 20 20" fill="currentColor" style={{ color: isLightColor(color) ? '#000' : '#fff' }}>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // 3背景プレビュー（関数として定義、再マウント防止）
  const backgroundLabels = { checker: '透過', white: 'ライト', dark: 'ダーク' } as const
  const renderTriplePreview = (size: number) => (
    <div className="mb-3">
      <div className="flex gap-1 justify-center mb-1">
        {(['checker', 'white', 'dark'] as const).map((type) => (
          <div key={type} className="text-xs text-gray-400 text-center" style={{ width: size }}>
            {backgroundLabels[type]}
          </div>
        ))}
      </div>
      <div className="flex gap-1 justify-center">
        {(['checker', 'white', 'dark'] as const).map((type, index) => (
          <div
            key={type}
            className={`rounded-lg overflow-hidden border transition-colors ${isDragging ? 'border-blue-400' : 'border-gray-300'}`}
            style={{
              width: size,
              height: size,
              cursor: 'move',
              ...getBackgroundStyle(type),
            }}
            onMouseDown={(e) => handleDragStart(e, size)}
            onTouchStart={(e) => handleDragStart(e, size)}
          >
            <canvas
              width={128}
              height={128}
              style={{ width: size, height: size, pointerEvents: 'none' }}
              ref={el => { canvasRefs.current[index] = el }}
            />
          </div>
        ))}
      </div>
      {/* 注釈とリセットボタン */}
      <div className="flex items-center justify-between mt-1.5 px-1">
        <span className="text-xs text-gray-400">ドラッグで位置調整</span>
        {hasOffset && (
          <button
            onClick={onTextOffsetReset}
            className="text-xs text-blue-500 hover:text-blue-600"
          >
            中央に戻す
          </button>
        )}
      </div>
    </div>
  )

  // コンパクトモード（狭い画面用フローティング）
  if (compact) {
    return (
      <div className="bg-white rounded-xl shadow-xl p-3">
        {/* タイトル */}
        <div className="mb-2">
          <h1 className="text-sm font-bold text-gray-900">RichMoji</h1>
        </div>

        {/* テキスト入力 */}
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="テキスト..."
          className="w-full h-14 p-2 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
        />

        {/* 3背景プレビュー */}
        {renderTriplePreview(64)}

        {/* 色タイル */}
        {colorTiles}

        {/* サイズ・透明度 */}
        {sizeOpacityControls}

        {/* ダウンロードボタン */}
        <button
          onClick={onDownload}
          className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {isAnimated ? 'GIFをダウンロード' : 'PNGをダウンロード'}
        </button>
      </div>
    )
  }

  // 通常モード（広い画面用サイドバー）
  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* タイトル */}
      <h1 className="text-lg font-bold text-gray-900 mb-1">RichMoji</h1>
      <p className="text-xs text-gray-500 mb-3">Slack絵文字ジェネレーター</p>

      {/* テキスト入力 */}
      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="テキスト..."
        className="w-full h-16 p-2 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
      />

      {/* 3背景プレビュー */}
      {renderTriplePreview(80)}

      {/* 色タイル */}
      {colorTiles}

      {/* サイズ・透明度 */}
      {sizeOpacityControls}

      {/* ダウンロードボタン */}
      <button
        onClick={onDownload}
        className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
      >
        {isAnimated ? 'GIFをダウンロード' : 'PNGをダウンロード'}
      </button>
    </div>
  )
}
