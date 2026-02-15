// ファイルダウンロード関連のユーティリティ

import { zipSync } from 'fflate'

const MAX_FILENAME_LENGTH = 50
const CANVAS_SIZE = 128

// 分割サイズの型
export type SplitSize = 1 | 2 | 3

export interface SplitOption {
  size: SplitSize
  label: string
  tiles: number
}

export const SPLIT_OPTIONS: SplitOption[] = [
  { size: 1, label: '1x1', tiles: 1 },
  { size: 2, label: '2x2', tiles: 4 },
  { size: 3, label: '3x3', tiles: 9 },
]

// テキストからファイル名を生成
export function generateFilename(text: string): string {
  if (!text.trim()) return 'emoji'

  // 各行をトリムして空行を除去
  const lines = text.split('\n').map(l => l.trim()).filter(l => l)

  // "-"で結合
  let filename = lines.join('-')

  // ファイル名として使えない文字を除去
  filename = filename.replace(/[<>:"/\\|?*]/g, '')

  // 長すぎる場合は省略
  if (filename.length > MAX_FILENAME_LENGTH) {
    filename = filename.slice(0, MAX_FILENAME_LENGTH - 1) + '…'
  }

  return filename || 'emoji'
}

// ファイルをダウンロード（従来方式、ブラウザのダウンロード通知あり）
export function saveFile(
  blob: Blob,
  suggestedName: string,
  _mimeType: string,
  extension: string
): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = `${suggestedName}.${extension}`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}

// CanvasをPNG Blobに変換
function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('Failed to create blob from canvas'))
        return
      }
      blob.arrayBuffer().then(buffer => {
        resolve(new Uint8Array(buffer))
      }).catch(reject)
    }, 'image/png')
  })
}

// キャンバスを分割してZIPでダウンロード
export async function downloadSplitImages(
  sourceCanvas: HTMLCanvasElement,
  splitSize: SplitSize,
  baseFilename: string
): Promise<void> {
  if (splitSize === 1) {
    // 1x1の場合は通常ダウンロード
    const blob = await new Promise<Blob>((resolve, reject) => {
      sourceCanvas.toBlob(blob => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to create blob'))
      }, 'image/png')
    })
    saveFile(blob, baseFilename, 'image/png', 'png')
    return
  }

  // 拡大キャンバスを作成（元の画像をsplitSize倍に拡大）
  const scaledSize = CANVAS_SIZE * splitSize
  const scaledCanvas = document.createElement('canvas')
  scaledCanvas.width = scaledSize
  scaledCanvas.height = scaledSize
  const scaledCtx = scaledCanvas.getContext('2d')
  if (!scaledCtx) throw new Error('Canvas context not available')

  // 元の画像を拡大描画
  scaledCtx.imageSmoothingEnabled = false // ピクセルアートのようにシャープに
  scaledCtx.drawImage(sourceCanvas, 0, 0, scaledSize, scaledSize)

  // タイル用キャンバス
  const tileCanvas = document.createElement('canvas')
  tileCanvas.width = CANVAS_SIZE
  tileCanvas.height = CANVAS_SIZE
  const tileCtx = tileCanvas.getContext('2d')
  if (!tileCtx) throw new Error('Canvas context not available')

  // 各タイルを生成
  const files: Record<string, Uint8Array> = {}

  for (let row = 0; row < splitSize; row++) {
    for (let col = 0; col < splitSize; col++) {
      // タイルを切り出し
      tileCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
      tileCtx.drawImage(
        scaledCanvas,
        col * CANVAS_SIZE, row * CANVAS_SIZE, CANVAS_SIZE, CANVAS_SIZE,
        0, 0, CANVAS_SIZE, CANVAS_SIZE
      )

      // PNG Blobに変換
      const pngData = await canvasToPngBlob(tileCanvas)
      const filename = `${baseFilename}-${row + 1}-${col + 1}.png`
      files[filename] = pngData
    }
  }

  // ZIPを作成
  const zipped = zipSync(files)
  const zipBlob = new Blob([zipped], { type: 'application/zip' })

  // ダウンロード
  saveFile(zipBlob, baseFilename, 'application/zip', 'zip')
}
