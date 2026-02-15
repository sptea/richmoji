// ファイルダウンロード関連のユーティリティ

const MAX_FILENAME_LENGTH = 50

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

// showSaveFilePicker APIの型定義
interface FilePickerOptions {
  suggestedName?: string
  types?: Array<{
    description: string
    accept: Record<string, string[]>
  }>
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: BufferSource | Blob | string): Promise<void>
  close(): Promise<void>
}

interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>
}

declare global {
  interface Window {
    showSaveFilePicker?: (options?: FilePickerOptions) => Promise<FileSystemFileHandle>
  }
}

// ファイル保存ダイアログを使ってダウンロード（フォールバック付き）
export async function saveFile(
  blob: Blob,
  suggestedName: string,
  mimeType: string,
  extension: string
): Promise<void> {
  // showSaveFilePicker が使える場合はダイアログを表示
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: `${suggestedName}.${extension}`,
        types: [
          {
            description: extension.toUpperCase() + ' Image',
            accept: { [mimeType]: [`.${extension}`] },
          },
        ],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return
    } catch (err) {
      // ユーザーがキャンセルした場合
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      // その他のエラーはフォールバック
      console.warn('showSaveFilePicker failed, falling back:', err)
    }
  }

  // フォールバック: 従来のダウンロード方式
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = `${suggestedName}.${extension}`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}
