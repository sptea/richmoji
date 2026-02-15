import { GIFEncoder, quantize, applyPalette } from 'gifenc'
import { EmojiState } from '../types/emoji'
import { drawEmoji } from './canvas'
import { calculateFrameTransform, TOTAL_FRAMES, FRAME_DELAY } from './animation'
import { saveFile } from './download'

const CANVAS_SIZE = 128

// GIFを生成してダウンロード
export async function downloadAsGif(
  state: EmojiState,
  bgImageElement: HTMLImageElement | undefined,
  filename: string
): Promise<void> {
  const totalFrames = TOTAL_FRAMES
  const delay = FRAME_DELAY

  // GIFエンコーダーを初期化
  const gif = GIFEncoder()

  // 各フレームを生成
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_SIZE
  canvas.height = CANVAS_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context not available')

  // テキストの長さ（改行を除く）
  const textLength = state.text.replace(/\n/g, '').length

  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
    // フレームの変換を計算
    const transform = calculateFrameTransform(
      state.animation,
      frameIndex,
      totalFrames,
      textLength
    )

    // フレームを描画
    drawEmoji(ctx, state, bgImageElement, transform)

    // ピクセルデータを取得
    const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    const { data } = imageData

    // RGBA形式のまま処理（アルファチャンネルを白背景と合成）
    // gifencはRGBA形式（4バイト/ピクセル）を期待している
    const rgbaData = new Uint8Array(CANVAS_SIZE * CANVAS_SIZE * 4)
    for (let i = 0; i < CANVAS_SIZE * CANVAS_SIZE; i++) {
      const r = data[i * 4]
      const g = data[i * 4 + 1]
      const b = data[i * 4 + 2]
      const a = data[i * 4 + 3] / 255

      // アルファブレンド（白背景）して完全不透明に
      rgbaData[i * 4] = Math.round(r * a + 255 * (1 - a))
      rgbaData[i * 4 + 1] = Math.round(g * a + 255 * (1 - a))
      rgbaData[i * 4 + 2] = Math.round(b * a + 255 * (1 - a))
      rgbaData[i * 4 + 3] = 255 // 完全不透明
    }

    // 256色パレットに量子化
    const palette = quantize(rgbaData, 256)
    const indexedPixels = applyPalette(rgbaData, palette)

    // フレームを追加（最初のフレームでrepeat: 0を設定して無限ループ）
    // dispose: 2 = フレームを背景色に戻す（アニメーションの正常な表示に必要）
    gif.writeFrame(indexedPixels, CANVAS_SIZE, CANVAS_SIZE, {
      palette,
      delay,
      dispose: 2,
      ...(frameIndex === 0 ? { repeat: 0 } : {}),
    })
  }

  // GIFを完成
  gif.finish()

  // Blobを作成してダウンロード
  const bytes = gif.bytes()
  const blob = new Blob([bytes], { type: 'image/gif' })
  saveFile(blob, filename, 'image/gif', 'gif')
}
