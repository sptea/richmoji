import { EmojiState, FONTS, SHADOW_PRESETS, BackgroundImage, TextLayoutMode } from '../types/emoji'
import { AnimationTransform, applyHueShift, DEFAULT_TRANSFORM } from './animation'

const CANVAS_SIZE = 128
const FILL_PADDING = 4 // フィルモード時の余白

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

// フィルモード用のスケール係数を計算
function calculateFillScale(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  fontSize: number,
  layoutMode: TextLayoutMode
): { scaleX: number; scaleY: number } {
  if (layoutMode === 'normal') {
    return { scaleX: 1, scaleY: 1 }
  }

  const lineHeight = fontSize * 1.2
  const totalHeight = lines.length * lineHeight
  const maxLineWidth = Math.max(...lines.map(line => ctx.measureText(line).width))

  const targetWidth = CANVAS_SIZE - FILL_PADDING * 2
  const targetHeight = CANVAS_SIZE - FILL_PADDING * 2

  const scaleX = targetWidth / maxLineWidth
  const scaleY = targetHeight / totalHeight

  if (layoutMode === 'fill-stretch') {
    // 縦横独立にスケーリング（引き伸ばし）
    return { scaleX, scaleY }
  } else {
    // fill-fit: 縦横比を保って最大化
    const uniformScale = Math.min(scaleX, scaleY)
    return { scaleX: uniformScale, scaleY: uniformScale }
  }
}

// テキストを描画する
export function drawEmoji(
  ctx: CanvasRenderingContext2D,
  state: EmojiState,
  bgImageElement?: HTMLImageElement,
  transform: AnimationTransform = DEFAULT_TRANSFORM
): void {
  const { text, font, textColor, textOpacity, textOffset, layoutMode, backgroundColor, backgroundImage, stroke, shadow } = state

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

  // タイピング効果: 表示する文字数を制限（改行を除いた文字数でカウント）
  let displayText = text
  if (transform.visibleChars !== null) {
    if (transform.visibleChars === 0) {
      displayText = ''
    } else {
      let visibleCount = 0
      let sliceEnd = text.length // デフォルトは全文字
      for (let i = 0; i < text.length; i++) {
        if (text[i] !== '\n') {
          visibleCount++
        }
        if (visibleCount >= transform.visibleChars) {
          sliceEnd = i + 1
          break
        }
      }
      displayText = text.slice(0, sliceEnd)
    }
  }

  if (!displayText) return

  // フォント設定
  const fontDef = FONTS.find(f => f.id === font.id)
  const fontFamily = fontDef?.family || 'sans-serif'
  const fontWeight = font.bold && !fontDef?.noBold ? 'bold' : 'normal'
  const fontStyle = font.italic ? 'italic' : 'normal'
  ctx.font = `${fontStyle} ${fontWeight} ${font.size}px "${fontFamily}", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // テキストを行に分割
  const lines = displayText.split('\n')
  const lineHeight = font.size * 1.2
  const totalHeight = lines.length * lineHeight

  // フィルモード用スケール計算
  const fillScale = calculateFillScale(ctx, lines, font.size, layoutMode)

  // フィルモードの場合は中央配置（オフセット無効）
  const effectiveOffsetX = layoutMode === 'normal' ? textOffset.x : 0
  const effectiveOffsetY = layoutMode === 'normal' ? textOffset.y : 0

  const startY = (CANVAS_SIZE - totalHeight * fillScale.scaleY) / 2 + (lineHeight * fillScale.scaleY) / 2 + effectiveOffsetY
  const baseX = CANVAS_SIZE / 2 + effectiveOffsetX

  // 色相シフトを適用
  const effectiveTextColor = transform.hueShift !== 0
    ? applyHueShift(textColor, transform.hueShift)
    : textColor

  // 影の設定
  const shadowPreset = SHADOW_PRESETS[shadow]

  // 変換を適用
  ctx.save()
  ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2)
  ctx.translate(transform.offsetX, transform.offsetY)
  ctx.rotate(transform.rotation)
  ctx.scale(transform.scale, transform.scale)
  ctx.translate(-CANVAS_SIZE / 2, -CANVAS_SIZE / 2)

  // ネオン効果
  if (transform.glowIntensity > 0) {
    ctx.shadowColor = effectiveTextColor
    ctx.shadowBlur = 10 + transform.glowIntensity * 20
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  } else if (shadowPreset.enabled) {
    ctx.shadowColor = shadowPreset.color
    ctx.shadowBlur = shadowPreset.blur
    ctx.shadowOffsetX = shadowPreset.offsetX
    ctx.shadowOffsetY = shadowPreset.offsetY
  }

  // 波打ち効果の場合は文字ごとに描画（フィルモードでは波打ちは通常描画にフォールバック）
  if (transform.charOffsets && transform.charOffsets.length > 0 && layoutMode === 'normal') {
    drawWaveText(ctx, lines, startY, lineHeight, effectiveTextColor, textOpacity * transform.opacity, stroke, transform.charOffsets, baseX)
  } else {
    // 各行を描画
    lines.forEach((line, index) => {
      const y = startY + index * lineHeight * fillScale.scaleY

      // フィルモードの場合はスケーリングを適用
      if (fillScale.scaleX !== 1 || fillScale.scaleY !== 1) {
        ctx.save()
        ctx.translate(baseX, y)
        ctx.scale(fillScale.scaleX, fillScale.scaleY)

        // 縁取り
        if (stroke.enabled) {
          ctx.strokeStyle = stroke.color
          ctx.lineWidth = stroke.width * 2
          ctx.lineJoin = 'round'
          ctx.miterLimit = 2
          ctx.strokeText(line, 0, 0)
        }

        // テキスト本体
        ctx.fillStyle = effectiveTextColor
        ctx.globalAlpha = textOpacity * transform.opacity
        ctx.fillText(line, 0, 0)
        ctx.globalAlpha = 1
        ctx.restore()
      } else {
        // 通常描画
        // 縁取り
        if (stroke.enabled) {
          ctx.strokeStyle = stroke.color
          ctx.lineWidth = stroke.width * 2
          ctx.lineJoin = 'round'
          ctx.miterLimit = 2
          ctx.strokeText(line, baseX, y)
        }

        // テキスト本体
        ctx.fillStyle = effectiveTextColor
        ctx.globalAlpha = textOpacity * transform.opacity
        ctx.fillText(line, baseX, y)
        ctx.globalAlpha = 1
      }
    })
  }

  ctx.restore()

  // 影をリセット
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}

// 波打ち効果用のテキスト描画
function drawWaveText(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  startY: number,
  lineHeight: number,
  textColor: string,
  opacity: number,
  stroke: EmojiState['stroke'],
  charOffsets: number[],
  baseX: number
): void {
  let charIndex = 0
  const offsetX = baseX - CANVAS_SIZE / 2

  lines.forEach((line, lineIndex) => {
    const y = startY + lineIndex * lineHeight
    const chars = line.split('')
    const totalWidth = ctx.measureText(line).width
    let x = (CANVAS_SIZE - totalWidth) / 2 + offsetX

    chars.forEach((char) => {
      const charWidth = ctx.measureText(char).width
      const charX = x + charWidth / 2
      const charY = y + (charOffsets[charIndex] || 0)

      // 縁取り
      if (stroke.enabled) {
        ctx.strokeStyle = stroke.color
        ctx.lineWidth = stroke.width * 2
        ctx.lineJoin = 'round'
        ctx.miterLimit = 2
        ctx.strokeText(char, charX, charY)
      }

      // テキスト本体
      ctx.fillStyle = textColor
      ctx.globalAlpha = opacity
      ctx.fillText(char, charX, charY)
      ctx.globalAlpha = 1

      x += charWidth
      charIndex++
    })

    // 改行分のインデックスをスキップしない（改行文字は含まれない）
  })
}

// 自動フィットサイズを計算する
export function calculateAutoFitSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFamily: string,
  maxSize: number = 128,
  minSize: number = 8,
  padding: number = 4
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

// PNGとしてダウンロード（Blobを返す）
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to create blob from canvas'))
      }
    }, 'image/png')
  })
}
