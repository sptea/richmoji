import { useState, useCallback, useEffect, useMemo } from 'react'
import { EmojiState, DEFAULT_EMOJI_STATE, DEFAULT_BACKGROUND_IMAGE, DEFAULT_ANIMATION_STATE, DEFAULT_TEXT_OFFSET, FontId, ShadowPresetId, StylePreset, AnimationEffectId, FONTS, TextOffset } from '../types/emoji'
import { calculateAutoFitSize } from '../utils/canvas'
import { FontActions, StrokeActions, BackgroundImageActions, AnimationActions } from '../types/editor'

const STORAGE_KEY = 'richmoji_background_image'

// LocalStorageから背景画像を読み込む
function loadBackgroundImageFromStorage(): Partial<EmojiState> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      return {
        backgroundImage: {
          ...DEFAULT_BACKGROUND_IMAGE,
          ...data,
        },
      }
    }
  } catch {
    // パースエラー時は無視
  }
  return {}
}

// 背景画像をLocalStorageに保存
function saveBackgroundImageToStorage(backgroundImage: EmojiState['backgroundImage']): void {
  try {
    if (backgroundImage.data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(backgroundImage))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // ストレージ容量超過などのエラーを無視
  }
}

export function useEmojiState() {
  const [state, setState] = useState<EmojiState>(() => ({
    ...DEFAULT_EMOJI_STATE,
    ...loadBackgroundImageFromStorage(),
  }))
  const [autoFit, setAutoFit] = useState(true)

  // 自動フィットが有効な場合、テキストやフォントが変わったらサイズを再計算
  useEffect(() => {
    if (!autoFit) return

    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const font = FONTS.find(f => f.id === state.font.id)
    const fontFamily = font?.family || 'sans-serif'
    const autoSize = calculateAutoFitSize(ctx, state.text, fontFamily)

    setState(prev => {
      if (prev.font.size === autoSize) return prev
      return { ...prev, font: { ...prev.font, size: autoSize } }
    })
  }, [autoFit, state.text, state.font.id])

  // 背景画像が変更されたらLocalStorageに保存
  useEffect(() => {
    saveBackgroundImageToStorage(state.backgroundImage)
  }, [state.backgroundImage])

  const setText = useCallback((text: string) => {
    setState(prev => ({ ...prev, text }))
  }, [])

  const setFontId = useCallback((id: FontId) => {
    setState(prev => ({ ...prev, font: { ...prev.font, id } }))
  }, [])

  const setFontSize = useCallback((size: number) => {
    setState(prev => ({ ...prev, font: { ...prev.font, size } }))
  }, [])

  const toggleBold = useCallback(() => {
    setState(prev => ({ ...prev, font: { ...prev.font, bold: !prev.font.bold } }))
  }, [])

  const toggleItalic = useCallback(() => {
    setState(prev => ({ ...prev, font: { ...prev.font, italic: !prev.font.italic } }))
  }, [])

  const setTextColor = useCallback((textColor: string) => {
    setState(prev => ({ ...prev, textColor }))
  }, [])

  const setTextOpacity = useCallback((textOpacity: number) => {
    setState(prev => ({ ...prev, textOpacity }))
  }, [])

  const setTextOffset = useCallback((textOffset: TextOffset) => {
    setState(prev => ({ ...prev, textOffset }))
  }, [])

  const resetTextOffset = useCallback(() => {
    setState(prev => ({ ...prev, textOffset: DEFAULT_TEXT_OFFSET }))
  }, [])

  const setBackgroundColor = useCallback((backgroundColor: string) => {
    setState(prev => ({ ...prev, backgroundColor }))
  }, [])

  const setStrokeEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, stroke: { ...prev.stroke, enabled } }))
  }, [])

  const setStrokeColor = useCallback((color: string) => {
    setState(prev => ({ ...prev, stroke: { ...prev.stroke, color } }))
  }, [])

  const setStrokeWidth = useCallback((width: number) => {
    setState(prev => ({ ...prev, stroke: { ...prev.stroke, width } }))
  }, [])

  const setShadow = useCallback((shadow: ShadowPresetId) => {
    setState(prev => ({ ...prev, shadow }))
  }, [])

  // 背景画像関連のセッター
  const setBackgroundImageData = useCallback((data: string | null) => {
    setState(prev => ({
      ...prev,
      backgroundImage: { ...prev.backgroundImage, data },
    }))
  }, [])

  const setBackgroundImageScale = useCallback((scale: number) => {
    setState(prev => ({
      ...prev,
      backgroundImage: { ...prev.backgroundImage, scale },
    }))
  }, [])

  const setBackgroundImageOffset = useCallback((offsetX: number, offsetY: number) => {
    setState(prev => ({
      ...prev,
      backgroundImage: { ...prev.backgroundImage, offsetX, offsetY },
    }))
  }, [])

  const setBackgroundImageOpacity = useCallback((opacity: number) => {
    setState(prev => ({
      ...prev,
      backgroundImage: { ...prev.backgroundImage, opacity },
    }))
  }, [])

  const clearBackgroundImage = useCallback(() => {
    setState(prev => ({
      ...prev,
      backgroundImage: DEFAULT_BACKGROUND_IMAGE,
    }))
  }, [])

  // アニメーション関連のセッター
  const toggleAnimationEffect = useCallback((effectId: AnimationEffectId) => {
    setState(prev => {
      const effects = prev.animation.effects.includes(effectId)
        ? prev.animation.effects.filter(id => id !== effectId)
        : [...prev.animation.effects, effectId]
      return {
        ...prev,
        animation: {
          ...prev.animation,
          effects,
          enabled: effects.length > 0,
        },
      }
    })
  }, [])

  const setAnimationSpeed = useCallback((speed: number) => {
    setState(prev => ({
      ...prev,
      animation: { ...prev.animation, speed },
    }))
  }, [])

  const clearAnimation = useCallback(() => {
    setState(prev => ({
      ...prev,
      animation: DEFAULT_ANIMATION_STATE,
    }))
  }, [])

  const resetState = useCallback(() => {
    setState(DEFAULT_EMOJI_STATE)
  }, [])

  const applyPreset = useCallback((preset: StylePreset) => {
    setState(prev => {
      const newState = { ...prev }
      if (preset.state.textColor !== undefined) newState.textColor = preset.state.textColor
      if (preset.state.textOpacity !== undefined) newState.textOpacity = preset.state.textOpacity
      if (preset.state.backgroundColor !== undefined) newState.backgroundColor = preset.state.backgroundColor
      if (preset.state.stroke !== undefined) newState.stroke = preset.state.stroke
      if (preset.state.shadow !== undefined) newState.shadow = preset.state.shadow
      if (preset.state.font !== undefined) newState.font = { ...prev.font, ...preset.state.font }
      return newState
    })
  }, [])

  // グループ化されたアクション（useMemoで参照を安定化）
  const fontActions: FontActions = useMemo(() => ({
    onIdChange: setFontId,
    onSizeChange: setFontSize,
    onBoldToggle: toggleBold,
    onItalicToggle: toggleItalic,
  }), [setFontId, setFontSize, toggleBold, toggleItalic])

  const strokeActions: StrokeActions = useMemo(() => ({
    onEnabledChange: setStrokeEnabled,
    onColorChange: setStrokeColor,
    onWidthChange: setStrokeWidth,
  }), [setStrokeEnabled, setStrokeColor, setStrokeWidth])

  const backgroundImageActions: BackgroundImageActions = useMemo(() => ({
    onChange: setBackgroundImageData,
    onScaleChange: setBackgroundImageScale,
    onOffsetChange: setBackgroundImageOffset,
    onOpacityChange: setBackgroundImageOpacity,
    onClear: clearBackgroundImage,
  }), [setBackgroundImageData, setBackgroundImageScale, setBackgroundImageOffset, setBackgroundImageOpacity, clearBackgroundImage])

  const animationActions: AnimationActions = useMemo(() => ({
    onToggleEffect: toggleAnimationEffect,
    onSpeedChange: setAnimationSpeed,
    onClear: clearAnimation,
  }), [toggleAnimationEffect, setAnimationSpeed, clearAnimation])

  return {
    state,
    autoFit,
    setAutoFit,
    setText,
    setTextColor,
    setTextOpacity,
    setTextOffset,
    resetTextOffset,
    setBackgroundColor,
    fontActions,
    strokeActions,
    backgroundImageActions,
    animationActions,
    setShadow,
    applyPreset,
    resetState,
  }
}
