// フォント定義
export const FONTS = [
  { id: 'noto-sans-jp', name: 'Noto Sans JP', family: 'Noto Sans JP', category: 'ゴシック', noBold: false },
  { id: 'm-plus-rounded', name: 'M PLUS Rounded 1c', family: 'M PLUS Rounded 1c', category: '丸ゴシック', noBold: false },
  { id: 'noto-serif-jp', name: 'Noto Serif JP', family: 'Noto Serif JP', category: '明朝', noBold: false },
  { id: 'kiwi-maru', name: 'Kiwi Maru', family: 'Kiwi Maru', category: '手書き風', noBold: false },
  { id: 'reggae-one', name: 'Reggae One', family: 'Reggae One', category: 'インパクト', noBold: true },
] as const

export type FontId = typeof FONTS[number]['id']

// 影プリセット
export const SHADOW_PRESETS = {
  none: { enabled: false, blur: 0, offsetX: 0, offsetY: 0, color: 'rgba(0,0,0,0.5)' },
  soft: { enabled: true, blur: 4, offsetX: 2, offsetY: 2, color: 'rgba(0,0,0,0.3)' },
  hard: { enabled: true, blur: 0, offsetX: 3, offsetY: 3, color: 'rgba(0,0,0,0.8)' },
  long: { enabled: true, blur: 0, offsetX: 4, offsetY: 4, color: 'rgba(0,0,0,0.6)' },
} as const

export type ShadowPresetId = keyof typeof SHADOW_PRESETS

// アニメーション効果（15種類）
export const ANIMATION_EFFECTS = [
  { id: 'blink', name: '点滅', description: '表示/非表示を繰り返す' },
  { id: 'pulse', name: 'パルス', description: '拡大縮小を繰り返す' },
  { id: 'bounce', name: 'バウンス', description: '上下に跳ねる' },
  { id: 'shake', name: 'シェイク', description: '左右に振動' },
  { id: 'scroll-h', name: '横スクロール', description: '左から右に流れる' },
  { id: 'scroll-v', name: '縦スクロール', description: '上から下に流れる' },
  { id: 'rainbow', name: 'レインボー', description: '色が虹色に変化' },
  { id: 'rotate', name: '回転', description: 'くるくる回転' },
  { id: 'fade', name: 'フェード', description: 'フェードイン/アウト' },
  { id: 'zoom', name: '拡大', description: '小→大にズーム' },
  { id: 'typing', name: 'タイピング', description: '一文字ずつ表示' },
  { id: 'wave', name: '波打ち', description: '文字が波のように動く' },
  { id: 'neon', name: 'ネオン', description: '光るネオン効果' },
  { id: 'wobble', name: '揺らぎ', description: 'ぐにゃぐにゃ揺れる' },
  { id: 'pop', name: '飛び出し', description: 'ポンと飛び出す' },
] as const

export type AnimationEffectId = typeof ANIMATION_EFFECTS[number]['id']

// アニメーション設定
export interface AnimationState {
  effects: AnimationEffectId[]  // 複数同時適用可能
  speed: number                 // 速度 (0.5 - 2.0)
  enabled: boolean              // アニメーション有効/無効
}

// デフォルトアニメーション設定
export const DEFAULT_ANIMATION_STATE: AnimationState = {
  effects: [],
  speed: 1,
  enabled: false,
}

// 背景画像の状態
export interface BackgroundImage {
  data: string | null  // Base64エンコードされた画像データ
  scale: number        // 拡大率 (0.1 - 3.0)
  offsetX: number      // X方向オフセット (-128 - 128)
  offsetY: number      // Y方向オフセット (-128 - 128)
  opacity: number      // 透明度 (0 - 1)
}

// 絵文字の状態
export interface EmojiState {
  text: string
  font: {
    id: FontId
    size: number
    bold: boolean
    italic: boolean
  }
  textColor: string
  textOpacity: number
  backgroundColor: string
  backgroundImage: BackgroundImage
  stroke: {
    enabled: boolean
    color: string
    width: number
  }
  shadow: ShadowPresetId
  animation: AnimationState
}

// デフォルト背景画像
export const DEFAULT_BACKGROUND_IMAGE: BackgroundImage = {
  data: null,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  opacity: 1,
}

// デフォルト値
export const DEFAULT_EMOJI_STATE: EmojiState = {
  text: 'りち\nもじ',
  font: {
    id: 'noto-sans-jp',
    size: 32,
    bold: true,
    italic: false,
  },
  textColor: '#000000',
  textOpacity: 1,
  backgroundColor: 'transparent',
  backgroundImage: DEFAULT_BACKGROUND_IMAGE,
  stroke: {
    enabled: false,
    color: '#ffffff',
    width: 2,
  },
  shadow: 'none',
  animation: DEFAULT_ANIMATION_STATE,
}

// プリセットカラー（16色）
export const PRESET_COLORS = [
  '#000000', '#ffffff', '#ff0000', '#00ff00',
  '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#ff6600', '#ff0066', '#6600ff', '#00ff66',
  '#666666', '#999999', '#cccccc', '#333333',
] as const

// スタイルプリセット
export interface StylePreset {
  id: string
  name: string
  state: Partial<EmojiState>
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'simple-black',
    name: 'シンプル黒',
    state: {
      textColor: '#000000',
      textOpacity: 1,
      backgroundColor: 'transparent',
      stroke: { enabled: false, color: '#ffffff', width: 2 },
      shadow: 'none',
      font: { id: 'noto-sans-jp', size: 48, bold: true, italic: false },
    },
  },
  {
    id: 'simple-white',
    name: 'シンプル白',
    state: {
      textColor: '#ffffff',
      textOpacity: 1,
      backgroundColor: 'transparent',
      stroke: { enabled: true, color: '#000000', width: 2 },
      shadow: 'none',
      font: { id: 'noto-sans-jp', size: 48, bold: true, italic: false },
    },
  },
  {
    id: 'pop-red',
    name: 'ポップ赤',
    state: {
      textColor: '#ff0000',
      textOpacity: 1,
      backgroundColor: 'transparent',
      stroke: { enabled: true, color: '#ffffff', width: 3 },
      shadow: 'hard',
      font: { id: 'm-plus-rounded', size: 48, bold: true, italic: false },
    },
  },
  {
    id: 'pop-blue',
    name: 'ポップ青',
    state: {
      textColor: '#0066ff',
      textOpacity: 1,
      backgroundColor: 'transparent',
      stroke: { enabled: true, color: '#ffffff', width: 3 },
      shadow: 'hard',
      font: { id: 'm-plus-rounded', size: 48, bold: true, italic: false },
    },
  },
  {
    id: 'elegant',
    name: 'エレガント',
    state: {
      textColor: '#333333',
      textOpacity: 1,
      backgroundColor: 'transparent',
      stroke: { enabled: false, color: '#ffffff', width: 2 },
      shadow: 'soft',
      font: { id: 'noto-serif-jp', size: 40, bold: false, italic: false },
    },
  },
  {
    id: 'handwritten',
    name: '手書き風',
    state: {
      textColor: '#333333',
      textOpacity: 1,
      backgroundColor: '#fffef0',
      stroke: { enabled: false, color: '#ffffff', width: 2 },
      shadow: 'none',
      font: { id: 'kiwi-maru', size: 44, bold: false, italic: false },
    },
  },
  {
    id: 'impact',
    name: 'インパクト',
    state: {
      textColor: '#ffff00',
      textOpacity: 1,
      backgroundColor: '#ff0000',
      stroke: { enabled: true, color: '#000000', width: 2 },
      shadow: 'none',
      font: { id: 'reggae-one', size: 48, bold: false, italic: false },
    },
  },
  {
    id: 'neon-green',
    name: 'ネオン緑',
    state: {
      textColor: '#00ff00',
      textOpacity: 1,
      backgroundColor: '#000000',
      stroke: { enabled: false, color: '#ffffff', width: 2 },
      shadow: 'soft',
      font: { id: 'noto-sans-jp', size: 48, bold: true, italic: false },
    },
  },
]
