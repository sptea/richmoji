import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEmojiState } from './useEmojiState'
import { DEFAULT_EMOJI_STATE, STYLE_PRESETS } from '../types/emoji'

// LocalStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('useEmojiState', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('初期状態', () => {
    it('初期状態はDEFAULT_EMOJI_STATEに基づく', () => {
      const { result } = renderHook(() => useEmojiState())

      expect(result.current.state.text).toBe(DEFAULT_EMOJI_STATE.text)
      expect(result.current.state.font.id).toBe(DEFAULT_EMOJI_STATE.font.id)
      expect(result.current.state.textColor).toBe(DEFAULT_EMOJI_STATE.textColor)
      expect(result.current.state.backgroundColor).toBe(DEFAULT_EMOJI_STATE.backgroundColor)
    })

    it('autoFitの初期値はtrue', () => {
      const { result } = renderHook(() => useEmojiState())

      expect(result.current.autoFit).toBe(true)
    })
  })

  describe('テキスト操作', () => {
    it('setText: テキストが更新される', () => {
      const { result } = renderHook(() => useEmojiState())

      act(() => {
        result.current.setText('新しいテキスト')
      })

      expect(result.current.state.text).toBe('新しいテキスト')
    })

    it('setTextColor: テキスト色が更新される', () => {
      const { result } = renderHook(() => useEmojiState())

      act(() => {
        result.current.setTextColor('#ff0000')
      })

      expect(result.current.state.textColor).toBe('#ff0000')
    })

    it('setTextOpacity: テキスト透明度が更新される', () => {
      const { result } = renderHook(() => useEmojiState())

      act(() => {
        result.current.setTextOpacity(0.5)
      })

      expect(result.current.state.textOpacity).toBe(0.5)
    })
  })

  describe('フォント操作（fontActions）', () => {
    it('onIdChange: フォントIDが更新される', () => {
      const { result } = renderHook(() => useEmojiState())

      act(() => {
        result.current.fontActions.onIdChange('m-plus-rounded')
      })

      expect(result.current.state.font.id).toBe('m-plus-rounded')
    })

    it('onSizeChange: フォントサイズが更新される', () => {
      const { result } = renderHook(() => useEmojiState())

      act(() => {
        result.current.fontActions.onSizeChange(64)
      })

      expect(result.current.state.font.size).toBe(64)
    })

    it('onBoldToggle: 太字がトグルされる', () => {
      const { result } = renderHook(() => useEmojiState())
      const initialBold = result.current.state.font.bold

      act(() => {
        result.current.fontActions.onBoldToggle()
      })

      expect(result.current.state.font.bold).toBe(!initialBold)
    })

    it('onItalicToggle: 斜体がトグルされる', () => {
      const { result } = renderHook(() => useEmojiState())
      const initialItalic = result.current.state.font.italic

      act(() => {
        result.current.fontActions.onItalicToggle()
      })

      expect(result.current.state.font.italic).toBe(!initialItalic)
    })
  })

  describe('縁取り操作（strokeActions）', () => {
    it('onEnabledChange: 縁取りの有効/無効が切り替わる', () => {
      const { result } = renderHook(() => useEmojiState())

      act(() => {
        result.current.strokeActions.onEnabledChange(true)
      })

      expect(result.current.state.stroke.enabled).toBe(true)
    })

    it('onColorChange: 縁取り色が更新される', () => {
      const { result } = renderHook(() => useEmojiState())

      act(() => {
        result.current.strokeActions.onColorChange('#00ff00')
      })

      expect(result.current.state.stroke.color).toBe('#00ff00')
    })

    it('onWidthChange: 縁取り幅が更新される', () => {
      const { result } = renderHook(() => useEmojiState())

      act(() => {
        result.current.strokeActions.onWidthChange(5)
      })

      expect(result.current.state.stroke.width).toBe(5)
    })
  })

  describe('背景画像操作（backgroundImageActions）', () => {
    it('onChange: 背景画像データが設定される', () => {
      const { result } = renderHook(() => useEmojiState())
      const testImageData = 'data:image/png;base64,test'

      act(() => {
        result.current.backgroundImageActions.onChange(testImageData)
      })

      expect(result.current.state.backgroundImage.data).toBe(testImageData)
    })

    it('onScaleChange: スケールが更新される', () => {
      const { result } = renderHook(() => useEmojiState())

      act(() => {
        result.current.backgroundImageActions.onScaleChange(1.5)
      })

      expect(result.current.state.backgroundImage.scale).toBe(1.5)
    })

    it('onOffsetChange: オフセットが更新される', () => {
      const { result } = renderHook(() => useEmojiState())

      act(() => {
        result.current.backgroundImageActions.onOffsetChange(10, 20)
      })

      expect(result.current.state.backgroundImage.offsetX).toBe(10)
      expect(result.current.state.backgroundImage.offsetY).toBe(20)
    })

    it('onOpacityChange: 透明度が更新される', () => {
      const { result } = renderHook(() => useEmojiState())

      act(() => {
        result.current.backgroundImageActions.onOpacityChange(0.7)
      })

      expect(result.current.state.backgroundImage.opacity).toBe(0.7)
    })

    it('onClear: 背景画像がクリアされる', () => {
      const { result } = renderHook(() => useEmojiState())

      // まず画像を設定
      act(() => {
        result.current.backgroundImageActions.onChange('data:image/png;base64,test')
        result.current.backgroundImageActions.onScaleChange(2)
      })

      // クリア
      act(() => {
        result.current.backgroundImageActions.onClear()
      })

      expect(result.current.state.backgroundImage.data).toBeNull()
      expect(result.current.state.backgroundImage.scale).toBe(1)
    })
  })

  describe('アニメーション操作（animationActions）', () => {
    it('onToggleEffect: 効果がトグルされる（追加）', () => {
      const { result } = renderHook(() => useEmojiState())

      act(() => {
        result.current.animationActions.onToggleEffect('blink')
      })

      expect(result.current.state.animation.effects).toContain('blink')
      expect(result.current.state.animation.effectSpeeds['blink']).toBe(1.0)
      expect(result.current.state.animation.enabled).toBe(true)
    })

    it('onToggleEffect: 効果がトグルされる（削除）', () => {
      const { result } = renderHook(() => useEmojiState())

      // 追加
      act(() => {
        result.current.animationActions.onToggleEffect('blink')
      })

      // 削除
      act(() => {
        result.current.animationActions.onToggleEffect('blink')
      })

      expect(result.current.state.animation.effects).not.toContain('blink')
      expect(result.current.state.animation.effectSpeeds['blink']).toBeUndefined()
      expect(result.current.state.animation.enabled).toBe(false)
    })

    it('onEffectSpeedChange: 効果ごとの速度が更新される', () => {
      const { result } = renderHook(() => useEmojiState())

      // まず効果を追加
      act(() => {
        result.current.animationActions.onToggleEffect('blink')
      })

      // 速度を変更
      act(() => {
        result.current.animationActions.onEffectSpeedChange('blink', 2)
      })

      expect(result.current.state.animation.effectSpeeds['blink']).toBe(2)
    })

    it('onClear: アニメーションがクリアされる', () => {
      const { result } = renderHook(() => useEmojiState())

      // まず効果を追加
      act(() => {
        result.current.animationActions.onToggleEffect('blink')
        result.current.animationActions.onEffectSpeedChange('blink', 2)
      })

      // クリア
      act(() => {
        result.current.animationActions.onClear()
      })

      expect(result.current.state.animation.effects).toHaveLength(0)
      expect(result.current.state.animation.enabled).toBe(false)
      expect(result.current.state.animation.effectSpeeds).toEqual({})
    })
  })

  describe('影操作', () => {
    it('setShadow: 影プリセットが更新される', () => {
      const { result } = renderHook(() => useEmojiState())

      act(() => {
        result.current.setShadow('soft')
      })

      expect(result.current.state.shadow).toBe('soft')
    })
  })

  describe('プリセット適用', () => {
    it('applyPreset: プリセットが正しく適用される', () => {
      const { result } = renderHook(() => useEmojiState())
      const preset = STYLE_PRESETS.find(p => p.id === 'pop-red')!

      act(() => {
        result.current.applyPreset(preset)
      })

      expect(result.current.state.textColor).toBe(preset.state.textColor)
      expect(result.current.state.stroke.enabled).toBe(preset.state.stroke?.enabled)
      expect(result.current.state.shadow).toBe(preset.state.shadow)
    })

    it('applyPreset: 未定義のプロパティは変更されない', () => {
      const { result } = renderHook(() => useEmojiState())

      // まずテキストを変更
      act(() => {
        result.current.setText('カスタムテキスト')
      })

      // プリセットを適用（textは含まれない）
      const preset = STYLE_PRESETS[0]
      act(() => {
        result.current.applyPreset(preset)
      })

      // テキストは変更されていないはず
      expect(result.current.state.text).toBe('カスタムテキスト')
    })
  })

  describe('状態リセット', () => {
    it('resetState: 状態がデフォルトに戻る', () => {
      const { result } = renderHook(() => useEmojiState())

      // 状態を変更
      act(() => {
        result.current.setText('変更後テキスト')
        result.current.setTextColor('#ff0000')
        result.current.fontActions.onIdChange('kiwi-maru')
      })

      // リセット
      act(() => {
        result.current.resetState()
      })

      expect(result.current.state.text).toBe(DEFAULT_EMOJI_STATE.text)
      expect(result.current.state.textColor).toBe(DEFAULT_EMOJI_STATE.textColor)
      expect(result.current.state.font.id).toBe(DEFAULT_EMOJI_STATE.font.id)
    })
  })

  describe('アクションオブジェクトの参照安定性', () => {
    it('fontActionsの参照が安定している', () => {
      const { result, rerender } = renderHook(() => useEmojiState())
      const initialFontActions = result.current.fontActions

      // 再レンダリング
      rerender()

      expect(result.current.fontActions).toBe(initialFontActions)
    })

    it('strokeActionsの参照が安定している', () => {
      const { result, rerender } = renderHook(() => useEmojiState())
      const initialStrokeActions = result.current.strokeActions

      rerender()

      expect(result.current.strokeActions).toBe(initialStrokeActions)
    })

    it('backgroundImageActionsの参照が安定している', () => {
      const { result, rerender } = renderHook(() => useEmojiState())
      const initialBgImageActions = result.current.backgroundImageActions

      rerender()

      expect(result.current.backgroundImageActions).toBe(initialBgImageActions)
    })

    it('animationActionsの参照が安定している', () => {
      const { result, rerender } = renderHook(() => useEmojiState())
      const initialAnimationActions = result.current.animationActions

      rerender()

      expect(result.current.animationActions).toBe(initialAnimationActions)
    })
  })
})
