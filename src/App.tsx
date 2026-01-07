import { useCallback } from 'react'
import { Preview } from './components/Preview'
import { Editor } from './components/Editor'
import { useEmojiState } from './hooks/useEmojiState'
import { downloadAsPng, loadImage, drawEmoji } from './utils/canvas'
import { downloadAsGif } from './utils/gif'

function App() {
  const {
    state,
    autoFit,
    setAutoFit,
    setText,
    setTextColor,
    setTextOpacity,
    setBackgroundColor,
    fontActions,
    strokeActions,
    backgroundImageActions,
    animationActions,
    setShadow,
    applyPreset,
  } = useEmojiState()

  const handleDownload = useCallback(async () => {
    try {
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
        if (!ctx) {
          throw new Error('Canvas context not available')
        }

        // 描画
        drawEmoji(ctx, state, bgImageElement)
        downloadAsPng(canvas, filename)
      }
    } catch (error) {
      console.error('ダウンロードに失敗しました:', error)
      alert('ダウンロードに失敗しました。もう一度お試しください。')
    }
  }, [state])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 広い画面: 2カラム / 狭い画面: 1カラム + フローティングプレビュー */}
      <main className="max-w-6xl mx-auto p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:gap-6">
          {/* エディター（左/メイン） */}
          {/* 狭い画面: フローティングプレビュー分の余白を下に追加 */}
          <div className="flex-1 lg:max-w-2xl pb-56 lg:pb-0">
            <Editor
              font={state.font}
              fontActions={fontActions}
              stroke={state.stroke}
              strokeActions={strokeActions}
              shadow={state.shadow}
              onShadowChange={setShadow}
              backgroundImage={state.backgroundImage}
              backgroundImageActions={backgroundImageActions}
              animation={state.animation}
              animationActions={animationActions}
              onApplyPreset={applyPreset}
            />
          </div>

          {/* プレビュー（右/フローティング） */}
          {/* 広い画面: sticky配置 / 狭い画面: fixed配置 */}
          <div className="hidden lg:block lg:w-72">
            <div className="sticky top-6">
              <Preview
                state={state}
                onDownload={handleDownload}
                text={state.text}
                textColor={state.textColor}
                backgroundColor={state.backgroundColor}
                fontSize={state.font.size}
                autoFit={autoFit}
                textOpacity={state.textOpacity}
                onTextChange={setText}
                onTextColorChange={setTextColor}
                onBackgroundColorChange={setBackgroundColor}
                onFontSizeChange={fontActions.onSizeChange}
                onAutoFitChange={setAutoFit}
                onTextOpacityChange={setTextOpacity}
              />
            </div>
          </div>
        </div>
      </main>

      {/* 狭い画面用フローティングプレビュー */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Preview
          state={state}
          onDownload={handleDownload}
          compact
          text={state.text}
          textColor={state.textColor}
          backgroundColor={state.backgroundColor}
          fontSize={state.font.size}
          autoFit={autoFit}
          textOpacity={state.textOpacity}
          onTextChange={setText}
          onTextColorChange={setTextColor}
          onBackgroundColorChange={setBackgroundColor}
          onFontSizeChange={fontActions.onSizeChange}
          onAutoFitChange={setAutoFit}
          onTextOpacityChange={setTextOpacity}
        />
      </div>
    </div>
  )
}

export default App
