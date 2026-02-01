import { AnimationEffectId, AnimationState } from '../types/emoji'

const CANVAS_SIZE = 128

// アニメーションフレームの変換情報
export interface AnimationTransform {
  // 位置オフセット
  offsetX: number
  offsetY: number
  // スケール
  scale: number
  // 回転（ラジアン）
  rotation: number
  // 透明度
  opacity: number
  // 色相シフト（0-360）
  hueShift: number
  // 表示する文字数（タイピング効果用）
  visibleChars: number | null
  // ネオン効果の強度
  glowIntensity: number
  // 文字ごとのY方向オフセット（波打ち効果用）
  charOffsets: number[] | null
}

// デフォルトの変換（変換なし）
export const DEFAULT_TRANSFORM: AnimationTransform = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  rotation: 0,
  opacity: 1,
  hueShift: 0,
  visibleChars: null,
  glowIntensity: 0,
  charOffsets: null,
}

// イージング関数
function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

function easeOutBounce(t: number): number {
  const n1 = 7.5625
  const d1 = 2.75
  if (t < 1 / d1) {
    return n1 * t * t
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375
  }
}

// 各効果の計算関数
function calculateBlink(progress: number): Partial<AnimationTransform> {
  // 0-0.5: 表示, 0.5-1: 非表示
  return { opacity: progress < 0.5 ? 1 : 0 }
}

function calculatePulse(progress: number): Partial<AnimationTransform> {
  // 1.0 → 1.2 → 1.0
  const scale = 1 + 0.2 * Math.sin(progress * Math.PI * 2)
  return { scale }
}

function calculateBounce(progress: number): Partial<AnimationTransform> {
  // 上下に跳ねる
  const bounce = Math.abs(Math.sin(progress * Math.PI * 2))
  const offsetY = -20 * easeOutBounce(bounce)
  return { offsetY }
}

function calculateShake(progress: number): Partial<AnimationTransform> {
  // 左右に振動
  const shake = Math.sin(progress * Math.PI * 8) * (1 - progress * 0.5)
  return { offsetX: shake * 8 }
}

function calculateScrollH(progress: number): Partial<AnimationTransform> {
  // 左から右へスクロール（滑らかなループ）
  // 0 → 0.5: 中央から右へ移動して画面外へ
  // 0.5 → 1: 左の画面外から中央へ戻る
  const cycle = progress * 2
  let offsetX: number
  if (cycle < 1) {
    // 中央(0) → 右端(128)
    offsetX = cycle * CANVAS_SIZE
  } else {
    // 左端(-128) → 中央(0)
    offsetX = (cycle - 2) * CANVAS_SIZE
  }
  return { offsetX }
}

function calculateScrollV(progress: number): Partial<AnimationTransform> {
  // 上から下へスクロール（滑らかなループ）
  const cycle = progress * 2
  let offsetY: number
  if (cycle < 1) {
    // 中央(0) → 下端(128)
    offsetY = cycle * CANVAS_SIZE
  } else {
    // 上端(-128) → 中央(0)
    offsetY = (cycle - 2) * CANVAS_SIZE
  }
  return { offsetY }
}

function calculateRainbow(progress: number): Partial<AnimationTransform> {
  // 色相を0-360度でシフト
  return { hueShift: progress * 360 }
}

function calculateRotate(progress: number): Partial<AnimationTransform> {
  // 360度回転
  return { rotation: progress * Math.PI * 2 }
}

function calculateFade(progress: number): Partial<AnimationTransform> {
  // フェードイン/アウト
  const opacity = easeInOutSine(Math.abs(Math.sin(progress * Math.PI)))
  return { opacity }
}

function calculateZoom(progress: number): Partial<AnimationTransform> {
  // 小→大→小
  const scale = 0.5 + 0.5 * easeInOutSine(Math.abs(Math.sin(progress * Math.PI)))
  return { scale }
}

function calculateTyping(progress: number, textLength: number): Partial<AnimationTransform> {
  // 一文字ずつ表示
  // 最後の30%は全文字表示を保証（ループ前に全文字が見える時間を確保）
  if (progress >= 0.7) {
    return { visibleChars: textLength }
  }
  // 最初の70%で0からtextLengthまで表示
  // +1して範囲を広げ、floorで切り捨て
  const visibleChars = Math.min(textLength, Math.floor((progress / 0.7) * (textLength + 1)))
  return { visibleChars }
}

function calculateWave(progress: number, textLength: number): Partial<AnimationTransform> {
  // 文字ごとに波のようにオフセット
  const charOffsets: number[] = []
  for (let i = 0; i < textLength; i++) {
    const phase = (progress + i / textLength) * Math.PI * 2
    charOffsets.push(Math.sin(phase) * 8)
  }
  return { charOffsets }
}

function calculateNeon(progress: number): Partial<AnimationTransform> {
  // ネオンの点滅
  const intensity = 0.5 + 0.5 * Math.sin(progress * Math.PI * 4)
  return { glowIntensity: intensity }
}

function calculateWobble(progress: number): Partial<AnimationTransform> {
  // ぐにゃぐにゃ揺れる
  const rotation = Math.sin(progress * Math.PI * 4) * 0.1
  const scale = 1 + Math.sin(progress * Math.PI * 6) * 0.05
  return { rotation, scale }
}

function calculatePop(progress: number): Partial<AnimationTransform> {
  // ポンと飛び出す
  let scale: number
  if (progress < 0.3) {
    // 小さい状態
    scale = 0.5
  } else if (progress < 0.5) {
    // 急拡大
    scale = 0.5 + (progress - 0.3) / 0.2 * 0.7
  } else if (progress < 0.7) {
    // 少し縮む
    scale = 1.2 - (progress - 0.5) / 0.2 * 0.2
  } else {
    // 元のサイズ
    scale = 1
  }
  return { scale }
}

// 効果IDから計算関数へのマッピング
const effectCalculators: Record<
  AnimationEffectId,
  (progress: number, textLength: number) => Partial<AnimationTransform>
> = {
  blink: calculateBlink,
  pulse: calculatePulse,
  bounce: calculateBounce,
  shake: calculateShake,
  'scroll-h': calculateScrollH,
  'scroll-v': calculateScrollV,
  rainbow: calculateRainbow,
  rotate: calculateRotate,
  fade: calculateFade,
  zoom: calculateZoom,
  typing: calculateTyping,
  wave: calculateWave,
  neon: calculateNeon,
  wobble: calculateWobble,
  pop: calculatePop,
}

// 複数の効果を合成してフレームの変換を計算
export function calculateFrameTransform(
  animation: AnimationState,
  frameIndex: number,
  totalFrames: number,
  textLength: number
): AnimationTransform {
  if (!animation.enabled || animation.effects.length === 0) {
    return { ...DEFAULT_TRANSFORM }
  }

  const progress = frameIndex / totalFrames
  const transform = { ...DEFAULT_TRANSFORM }

  // 各効果を適用
  for (const effectId of animation.effects) {
    const calculator = effectCalculators[effectId]
    if (calculator) {
      const partial = calculator(progress, textLength)

      // 変換を合成
      if (partial.offsetX !== undefined) transform.offsetX += partial.offsetX
      if (partial.offsetY !== undefined) transform.offsetY += partial.offsetY
      if (partial.scale !== undefined) transform.scale *= partial.scale
      if (partial.rotation !== undefined) transform.rotation += partial.rotation
      if (partial.opacity !== undefined) transform.opacity *= partial.opacity
      if (partial.hueShift !== undefined) transform.hueShift = partial.hueShift
      if (partial.visibleChars !== undefined) transform.visibleChars = partial.visibleChars
      if (partial.glowIntensity !== undefined) transform.glowIntensity = partial.glowIntensity
      if (partial.charOffsets !== undefined) transform.charOffsets = partial.charOffsets
    }
  }

  return transform
}

// GIFのフレーム数を計算（10fps固定、速度によってフレーム数を調整）
export function calculateTotalFrames(speed: number): number {
  // 速度1.0で20フレーム（2秒）、速度が速いほどフレーム数は少なく
  const baseFrames = 20
  return Math.round(baseFrames / speed)
}

// レインボー用: 色相から純粋な虹色を生成（元の色を無視）
export function applyHueShift(_color: string, hueShift: number): string {
  if (hueShift === 0) return _color

  // 色相から直接RGBを生成（彩度100%、明度50%の鮮やかな色）
  const h = (hueShift / 360) % 1
  const s = 1.0 // 彩度最大
  const l = 0.5 // 明度50%（最も鮮やか）

  // HSLをRGBに変換
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const r = hue2rgb(p, q, h + 1 / 3)
  const g = hue2rgb(p, q, h)
  const b = hue2rgb(p, q, h - 1 / 3)

  // RGBをHEXに変換
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
