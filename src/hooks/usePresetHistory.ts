import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'richmoji-preset-history'
const MAX_HISTORY = 5

// プリセット使用履歴を管理するカスタムフック
export function usePresetHistory() {
  const [history, setHistory] = useState<string[]>([])

  // LocalStorageから履歴を読み込む
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, MAX_HISTORY))
        }
      }
    } catch {
      // 読み込み失敗時は空の履歴を使用
    }
  }, [])

  // 履歴に追加
  const addToHistory = useCallback((presetId: string) => {
    setHistory(prev => {
      // 既存の同じIDを削除し、先頭に追加
      const filtered = prev.filter(id => id !== presetId)
      const newHistory = [presetId, ...filtered].slice(0, MAX_HISTORY)

      // LocalStorageに保存
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
      } catch {
        // 保存失敗時は無視
      }

      return newHistory
    })
  }, [])

  // 履歴をクリア
  const clearHistory = useCallback(() => {
    setHistory([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // 削除失敗時は無視
    }
  }, [])

  return { history, addToHistory, clearHistory }
}
