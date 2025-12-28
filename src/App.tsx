import { useCallback } from 'react'
import { Preview } from './components/Preview'
import { Editor } from './components/Editor'
import { useEmojiState } from './hooks/useEmojiState'
import { FONTS } from './types/emoji'
import { calculateAutoFitSize, downloadAsPng, loadImage, drawEmoji } from './utils/canvas'
import { downloadAsGif } from './utils/gif'

function App() {
  const {
    state,
    setText,
    setFontId,
    setFontSize,
    toggleBold,
    toggleItalic,
    setTextColor,
    setTextOpacity,
    setBackgroundColor,
    setBackgroundImageData,
    setBackgroundImageScale,
    setBackgroundImageOffset,
    setBackgroundImageOpacity,
    clearBackgroundImage,
    setStrokeEnabled,
    setStrokeColor,
    setStrokeWidth,
    setShadow,
    toggleAnimationEffect,
    setAnimationSpeed,
    clearAnimation,
    applyPreset,
  } = useEmojiState()

  const handleDownload = useCallback(async () => {
    // 背景画像がある場合は読み込む
    let bgImageElement: HTMLImageElement | undefined
    if (state.backgroundImage.data) {
      try {
        bgImageElement = await loadImage(state.backgroundImage.data)
      } catch {
        // 画像読み込みに失敗した場合は無視
      }
    }

    // ファイル名は入力テキストの最初の行（または'emoji'）
    const filename = state.text.split('\n')[0].trim() || 'emoji'

    // アニメーションが有効な場合はGIF、そうでなければPNG
    if (state.animation.enabled && state.animation.effects.length > 0) {
      await downloadAsGif(state, bgImageElement, filename)
    } else {
      // 出力用のCanvasを作成
      const canvas = document.createElement('canvas')
      canvas.width = 128
      canvas.height = 128
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // 描画
      drawEmoji(ctx, state, bgImageElement)
      downloadAsPng(canvas, filename)
    }
  }, [state])

  const handleAutoFit = useCallback(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const font = FONTS.find(f => f.id === state.font.id)
    const fontFamily = font?.family || 'sans-serif'
    const newSize = calculateAutoFitSize(ctx, state.text, fontFamily)
    setFontSize(newSize)
  }, [state.text, state.font.id, setFontSize])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 広い画面: 2カラム / 狭い画面: 1カラム + フローティングプレビュー */}
      <main className="max-w-6xl mx-auto p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:gap-6">
          {/* エディター（左/メイン） */}
          {/* 狭い画面: フローティングプレビュー分の余白を下に追加 */}
          <div className="flex-1 lg:max-w-2xl pb-56 lg:pb-0">
            <Editor
              text={state.text}
              fontId={state.font.id}
              fontSize={state.font.size}
              bold={state.font.bold}
              italic={state.font.italic}
              textColor={state.textColor}
              textOpacity={state.textOpacity}
              backgroundColor={state.backgroundColor}
              backgroundImage={state.backgroundImage}
              strokeEnabled={state.stroke.enabled}
              strokeColor={state.stroke.color}
              strokeWidth={state.stroke.width}
              shadow={state.shadow}
              animation={state.animation}
              onTextChange={setText}
              onFontIdChange={setFontId}
              onFontSizeChange={setFontSize}
              onBoldToggle={toggleBold}
              onItalicToggle={toggleItalic}
              onTextColorChange={setTextColor}
              onTextOpacityChange={setTextOpacity}
              onBackgroundColorChange={setBackgroundColor}
              onBackgroundImageChange={setBackgroundImageData}
              onBackgroundImageScaleChange={setBackgroundImageScale}
              onBackgroundImageOffsetChange={setBackgroundImageOffset}
              onBackgroundImageOpacityChange={setBackgroundImageOpacity}
              onBackgroundImageClear={clearBackgroundImage}
              onStrokeEnabledChange={setStrokeEnabled}
              onStrokeColorChange={setStrokeColor}
              onStrokeWidthChange={setStrokeWidth}
              onShadowChange={setShadow}
              onToggleAnimationEffect={toggleAnimationEffect}
              onAnimationSpeedChange={setAnimationSpeed}
              onAnimationClear={clearAnimation}
              onAutoFit={handleAutoFit}
              onApplyPreset={applyPreset}
            />
          </div>

          {/* プレビュー（右/フローティング） */}
          {/* 広い画面: sticky配置 / 狭い画面: fixed配置 */}
          <div className="hidden lg:block lg:w-72">
            <div className="sticky top-6">
              <Preview state={state} onDownload={handleDownload} />
            </div>
          </div>
        </div>
      </main>

      {/* 狭い画面用フローティングプレビュー */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Preview state={state} onDownload={handleDownload} compact />
      </div>
    </div>
  )
}

export default App
