import { EmojiState, FONTS, SHADOW_PRESETS, BackgroundImage } from '../types/emoji'

const CANVAS_SIZE = 128

// 画像キャッシュ（同じ画像の再読み込みを防ぐ）
const imageCache = new Map<string, HTMLImageElement>()

// 背景画像を読み込む
export function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(dataUrl)
  if (cached) return Promise.resolve(cached)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      imageCache.set(dataUrl, img)
      resolve(img)
    }
    img.onerror = reject
    img.src = dataUrl
  })
}

// 背景画像を描画する
function drawBackgroundImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  bgImage: BackgroundImage
): void {
  const { scale, offsetX, offsetY, opacity } = bgImage

  // 画像のアスペクト比を維持しつつカバーするサイズを計算
  const imgAspect = img.width / img.height
  const canvasAspect = CANVAS_SIZE / CANVAS_SIZE

  let drawWidth: number
  let drawHeight: number

  if (imgAspect > canvasAspect) {
    // 画像が横長：高さに合わせる
    drawHeight = CANVAS_SIZE * scale
    drawWidth = drawHeight * imgAspect
  } else {
    // 画像が縦長：幅に合わせる
    drawWidth = CANVAS_SIZE * scale
    drawHeight = drawWidth / imgAspect
  }

  // 中央配置してからオフセットを適用
  const x = (CANVAS_SIZE - drawWidth) / 2 + offsetX
  const y = (CANVAS_SIZE - drawHeight) / 2 + offsetY

  ctx.save()
  ctx.globalAlpha = opacity
  ctx.drawImage(img, x, y, drawWidth, drawHeight)
  ctx.restore()
}

// テキストを描画する
export function drawEmoji(
  ctx: CanvasRenderingContext2D,
  state: EmojiState,
  bgImageElement?: HTMLImageElement
): void {
  const { text, font, textColor, textOpacity, backgroundColor, backgroundImage, stroke, shadow } = state

  // キャンバスをクリア
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

  // 背景色を描画
  if (backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  }

  // 背景画像を描画
  if (bgImageElement && backgroundImage.data) {
    drawBackgroundImage(ctx, bgImageElement, backgroundImage)
  }

  if (!text) return

  // フォント設定
  const fontDef = FONTS.find(f => f.id === font.id)
  const fontFamily = fontDef?.family || 'sans-serif'
  const fontWeight = font.bold && !fontDef?.noBold ? 'bold' : 'normal'
  const fontStyle = font.italic ? 'italic' : 'normal'
  ctx.font = `${fontStyle} ${fontWeight} ${font.size}px "${fontFamily}", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // テキストを行に分割
  const lines = text.split('\n')
  const lineHeight = font.size * 1.2
  const totalHeight = lines.length * lineHeight
  const startY = (CANVAS_SIZE - totalHeight) / 2 + lineHeight / 2

  // 影の設定
  const shadowPreset = SHADOW_PRESETS[shadow]
  if (shadowPreset.enabled) {
    ctx.shadowColor = shadowPreset.color
    ctx.shadowBlur = shadowPreset.blur
    ctx.shadowOffsetX = shadowPreset.offsetX
    ctx.shadowOffsetY = shadowPreset.offsetY
  }

  // 各行を描画
  lines.forEach((line, index) => {
    const y = startY + index * lineHeight
    const x = CANVAS_SIZE / 2

    // 縁取り
    if (stroke.enabled) {
      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.width * 2
      ctx.lineJoin = 'round'
      ctx.miterLimit = 2
      ctx.strokeText(line, x, y)
    }

    // テキスト本体
    ctx.fillStyle = textColor
    ctx.globalAlpha = textOpacity
    ctx.fillText(line, x, y)
    ctx.globalAlpha = 1
  })

  // 影をリセット
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}

// 自動フィットサイズを計算する
export function calculateAutoFitSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFamily: string,
  maxSize: number = 128,
  minSize: number = 8,
  padding: number = 8
): number {
  if (!text) return 32

  const lines = text.split('\n')
  const targetWidth = CANVAS_SIZE - padding * 2
  const targetHeight = CANVAS_SIZE - padding * 2

  for (let size = maxSize; size >= minSize; size--) {
    ctx.font = `${size}px "${fontFamily}", sans-serif`

    // 各行の幅をチェック
    const maxLineWidth = Math.max(...lines.map(line => ctx.measureText(line).width))
    const totalHeight = lines.length * size * 1.2

    if (maxLineWidth <= targetWidth && totalHeight <= targetHeight) {
      return size
    }
  }

  return minSize
}

// PNGとしてダウンロード
export function downloadAsPng(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a')
  link.download = `${filename || 'emoji'}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
