// gifenc の型定義
declare module 'gifenc' {
  export interface GIFEncoderInstance {
    writeFrame(
      pixels: Uint8Array,
      width: number,
      height: number,
      options?: {
        palette?: number[][]
        delay?: number
        transparent?: number
        dispose?: number
        repeat?: number  // 0 = 無限ループ, -1 = ループなし, N = N回ループ
      }
    ): void
    finish(): void
    bytes(): Uint8Array
    bytesView(): Uint8Array
  }

  export function GIFEncoder(): GIFEncoderInstance

  // 色を256色パレットに量子化
  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    options?: {
      format?: 'rgb565' | 'rgb444' | 'rgba4444'
      oneBitAlpha?: boolean | number
    }
  ): number[][]

  // RGBデータにパレットを適用してインデックス配列を返す
  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: number[][],
    format?: 'rgb565' | 'rgb444' | 'rgba4444'
  ): Uint8Array

  // 2つの色間のユークリッド距離を計算
  export function colorDistance(a: number[], b: number[]): number

  // パレット内で最も近い色のインデックスを返す
  export function nearestColorIndex(
    palette: number[][],
    color: number[]
  ): number

  // パレット内で最も近い色を返す
  export function nearestColor(
    palette: number[][],
    color: number[]
  ): number[]

  // 画像からパレットを抽出
  export function prequantize(
    rgba: Uint8Array | Uint8ClampedArray,
    options?: { roundRGB?: number; roundAlpha?: number; oneBitAlpha?: boolean | number }
  ): void

  // ディザリングを適用
  export function dither(
    rgba: Uint8Array | Uint8ClampedArray,
    width: number,
    height: number,
    palette: number[][],
    options?: {
      format?: 'rgb565' | 'rgb444' | 'rgba4444'
      algorithm?: 'floydSteinberg' | 'atkinson' | 'none'
      serpentine?: boolean
      matrix?: number[][]
    }
  ): Uint8Array
}
