import { useState, useCallback, useEffect } from 'react'
import { EmojiState, DEFAULT_EMOJI_STATE, DEFAULT_BACKGROUND_IMAGE, DEFAULT_ANIMATION_STATE, FontId, ShadowPresetId, StylePreset, AnimationEffectId } from '../types/emoji'

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

  return {
    state,
    setText,
    setFontId,
    setFontSize,
    toggleBold,
    toggleItalic,
    setTextColor,
    setTextOpacity,
    setBackgroundColor,
    setStrokeEnabled,
    setStrokeColor,
    setStrokeWidth,
    setShadow,
    setBackgroundImageData,
    setBackgroundImageScale,
    setBackgroundImageOffset,
    setBackgroundImageOpacity,
    clearBackgroundImage,
    toggleAnimationEffect,
    setAnimationSpeed,
    clearAnimation,
    resetState,
    applyPreset,
  }
}
