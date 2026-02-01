// Editor コンポーネント用のグループ化された型定義
import { FontId, ShadowPresetId, StylePreset, BackgroundImage, AnimationState, AnimationEffectId } from './emoji'

// フォント設定（状態）
export interface FontSettings {
  id: FontId
  size: number
  bold: boolean
  italic: boolean
}

// フォント操作（アクション）
export interface FontActions {
  onIdChange: (id: FontId) => void
  onSizeChange: (size: number) => void
  onBoldToggle: () => void
  onItalicToggle: () => void
}

// 縁取り設定（状態）
export interface StrokeSettings {
  enabled: boolean
  color: string
  width: number
}

// 縁取り操作（アクション）
export interface StrokeActions {
  onEnabledChange: (enabled: boolean) => void
  onColorChange: (color: string) => void
  onWidthChange: (width: number) => void
}

// 背景画像操作（アクション）
export interface BackgroundImageActions {
  onChange: (data: string | null) => void
  onScaleChange: (scale: number) => void
  onOffsetChange: (offsetX: number, offsetY: number) => void
  onOpacityChange: (opacity: number) => void
  onClear: () => void
}

// アニメーション操作（アクション）
export interface AnimationActions {
  onToggleEffect: (effectId: AnimationEffectId) => void
  onEffectSpeedChange: (effectId: AnimationEffectId, speed: number) => void
  onClear: () => void
}

// Editor コンポーネントの Props
export interface EditorProps {
  // フォント
  font: FontSettings
  fontActions: FontActions
  // 縁取り
  stroke: StrokeSettings
  strokeActions: StrokeActions
  // 影
  shadow: ShadowPresetId
  onShadowChange: (shadow: ShadowPresetId) => void
  // 背景画像
  backgroundImage: BackgroundImage
  backgroundImageActions: BackgroundImageActions
  // アニメーション
  animation: AnimationState
  animationActions: AnimationActions
  // プリセット適用
  onApplyPreset: (preset: StylePreset) => void
}
