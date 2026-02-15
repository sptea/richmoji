// フォント定義
export const FONTS = [
  // ゴシック系
  { id: 'noto-sans-jp', name: 'Noto Sans JP', family: 'Noto Sans JP', category: 'ゴシック', noBold: false },
  { id: 'm-plus-rounded', name: 'M PLUS Rounded 1c', family: 'M PLUS Rounded 1c', category: '丸ゴシック', noBold: false },
  { id: 'dela-gothic-one', name: 'Dela Gothic One', family: 'Dela Gothic One', category: '極太ゴシック', noBold: true },
  // 明朝・上品系
  { id: 'noto-serif-jp', name: 'Noto Serif JP', family: 'Noto Serif JP', category: '明朝', noBold: false },
  // 手書き・カジュアル
  { id: 'kiwi-maru', name: 'Kiwi Maru', family: 'Kiwi Maru', category: '手書き風', noBold: false },
  { id: 'yusei-magic', name: 'Yusei Magic', family: 'Yusei Magic', category: 'マジック', noBold: true },
  { id: 'hachi-maru-pop', name: 'Hachi Maru Pop', family: 'Hachi Maru Pop', category: 'レトロかわいい', noBold: true },
  // 個性・インパクト
  { id: 'reggae-one', name: 'Reggae One', family: 'Reggae One', category: 'インパクト', noBold: true },
  { id: 'mochiy-pop-one', name: 'Mochiy Pop One', family: 'Mochiy Pop One', category: 'POP', noBold: true },
  { id: 'dot-gothic-16', name: 'DotGothic16', family: 'DotGothic16', category: 'ドット', noBold: true },
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
  effects: AnimationEffectId[]                  // 選択された効果ID（複数同時適用可能）
  effectSpeeds: Record<string, number>          // 効果ごとの速度 { pulse: 1.0, rainbow: 2.0 }
  enabled: boolean                              // アニメーション有効/無効
}

// デフォルトアニメーション設定
export const DEFAULT_ANIMATION_STATE: AnimationState = {
  effects: [],
  effectSpeeds: {},
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

// テキスト位置オフセット
export interface TextOffset {
  x: number  // X方向オフセット (-64 - 64)
  y: number  // Y方向オフセット (-64 - 64)
}

// デフォルトテキスト位置
export const DEFAULT_TEXT_OFFSET: TextOffset = {
  x: 0,
  y: 0,
}

// テキストレイアウトモード
export type TextLayoutMode = 'normal' | 'fill-stretch' | 'fill-fit'

// テキストレイアウトモード定義
export const TEXT_LAYOUT_MODES = [
  { id: 'normal', name: '通常', description: '自動サイズ調整' },
  { id: 'fill-stretch', name: 'ストレッチ', description: '縦横引き伸ばし' },
  { id: 'fill-fit', name: '最大化', description: '比率を保って最大' },
] as const

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
  textOffset: TextOffset
  layoutMode: TextLayoutMode
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
  textOffset: DEFAULT_TEXT_OFFSET,
  layoutMode: 'normal',
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

// カラーテーマID
export type ColorThemeId =
  | 'default'
  | 'pastel'
  | 'vivid'
  | 'cool'
  | 'warm'
  | 'monochrome'
  | 'retro'
  | 'neon'

// カラーテーマ
export interface ColorTheme {
  id: ColorThemeId
  name: string
  colors: readonly string[]
}

// カラーテーマ定義（8テーマ）
export const COLOR_THEMES: readonly ColorTheme[] = [
  {
    id: 'default',
    name: 'デフォルト',
    colors: [
      '#000000', '#ffffff', '#ff0000', '#00ff00',
      '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
      '#ff6600', '#ff0066', '#6600ff', '#00ff66',
      '#666666', '#999999', '#cccccc', '#333333',
    ],
  },
  {
    id: 'pastel',
    name: 'パステル',
    colors: [
      '#ffb6c1', '#f4a7b9', '#c9a0dc', '#b399d4',
      '#89c3eb', '#87ceeb', '#81c784', '#a5d6a7',
      '#fff176', '#ffcc80', '#ffab91', '#f48fb1',
      '#ffffff', '#e8e8e8', '#bdbdbd', '#9e9e9e',
    ],
  },
  {
    id: 'vivid',
    name: 'ビビッド',
    colors: [
      '#ff0000', '#ff4500', '#ff8c00', '#ffd700',
      '#adff2f', '#00ff00', '#00fa9a', '#00ffff',
      '#1e90ff', '#0000ff', '#8a2be2', '#ff00ff',
      '#ff1493', '#000000', '#ffffff', '#808080',
    ],
  },
  {
    id: 'cool',
    name: 'クール',
    colors: [
      '#001f3f', '#003366', '#0066cc', '#0099ff',
      '#00ccff', '#66ffff', '#006666', '#009999',
      '#00cc99', '#339966', '#336699', '#6666cc',
      '#9966cc', '#663399', '#333333', '#ffffff',
    ],
  },
  {
    id: 'warm',
    name: 'ウォーム',
    colors: [
      '#8b0000', '#b22222', '#cd5c5c', '#f08080',
      '#ff4500', '#ff6347', '#ff7f50', '#ffa07a',
      '#ff8c00', '#ffa500', '#ffd700', '#ffff00',
      '#8b4513', '#a0522d', '#d2691e', '#f5deb3',
    ],
  },
  {
    id: 'monochrome',
    name: 'モノクロ',
    colors: [
      '#000000', '#1a1a1a', '#333333', '#4d4d4d',
      '#666666', '#808080', '#999999', '#b3b3b3',
      '#cccccc', '#d9d9d9', '#e6e6e6', '#f2f2f2',
      '#ffffff', '#fafafa', '#f5f5f5', '#ebebeb',
    ],
  },
  {
    id: 'retro',
    name: 'レトロ',
    colors: [
      '#704214', '#8b7355', '#c4a661', '#d2b48c',
      '#bc8f8f', '#cd853f', '#daa520', '#b8860b',
      '#6b8e23', '#808000', '#556b2f', '#8fbc8f',
      '#708090', '#778899', '#2f4f4f', '#f5f5dc',
    ],
  },
  {
    id: 'neon',
    name: 'ネオン',
    colors: [
      '#ff00ff', '#ff1493', '#ff69b4', '#ff6ec7',
      '#39ff14', '#00ff00', '#7fff00', '#ccff00',
      '#00ffff', '#00bfff', '#1e90ff', '#6a5acd',
      '#ffff00', '#ffd700', '#ff8c00', '#000000',
    ],
  },
] as const

// デフォルトのプリセットカラー（後方互換性のため維持）
export const PRESET_COLORS = COLOR_THEMES[0].colors

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
  // 新フォント活用プリセット
  {
    id: 'retro-game',
    name: 'レトロゲーム',
    state: {
      textColor: '#ffffff',
      textOpacity: 1,
      backgroundColor: '#000000',
      stroke: { enabled: false, color: '#ffffff', width: 2 },
      shadow: 'none',
      font: { id: 'dot-gothic-16', size: 48, bold: false, italic: false },
    },
  },
  {
    id: 'magic-marker',
    name: 'マジック',
    state: {
      textColor: '#000000',
      textOpacity: 1,
      backgroundColor: 'transparent',
      stroke: { enabled: false, color: '#ffffff', width: 2 },
      shadow: 'none',
      font: { id: 'yusei-magic', size: 48, bold: false, italic: false },
    },
  },
  {
    id: 'shouting',
    name: '叫び',
    state: {
      textColor: '#ff0000',
      textOpacity: 1,
      backgroundColor: 'transparent',
      stroke: { enabled: true, color: '#ffffff', width: 3 },
      shadow: 'hard',
      font: { id: 'dela-gothic-one', size: 48, bold: false, italic: false },
    },
  },
  {
    id: 'kawaii',
    name: 'かわいい',
    state: {
      textColor: '#ff69b4',
      textOpacity: 1,
      backgroundColor: 'transparent',
      stroke: { enabled: true, color: '#ffffff', width: 2 },
      shadow: 'soft',
      font: { id: 'hachi-maru-pop', size: 44, bold: false, italic: false },
    },
  },
  {
    id: 'pop-cute',
    name: 'ポップかわいい',
    state: {
      textColor: '#ff6600',
      textOpacity: 1,
      backgroundColor: 'transparent',
      stroke: { enabled: true, color: '#ffffff', width: 2 },
      shadow: 'soft',
      font: { id: 'mochiy-pop-one', size: 44, bold: false, italic: false },
    },
  },
  // 季節・イベント系
  {
    id: 'sakura',
    name: '桜',
    state: {
      textColor: '#ff69b4',
      textOpacity: 1,
      backgroundColor: '#fff0f5',
      stroke: { enabled: true, color: '#ffffff', width: 2 },
      shadow: 'none',
      font: { id: 'kiwi-maru', size: 44, bold: false, italic: false },
    },
  },
  {
    id: 'summer',
    name: 'サマー',
    state: {
      textColor: '#0066cc',
      textOpacity: 1,
      backgroundColor: '#87ceeb',
      stroke: { enabled: true, color: '#ffffff', width: 2 },
      shadow: 'none',
      font: { id: 'm-plus-rounded', size: 48, bold: true, italic: false },
    },
  },
  {
    id: 'halloween',
    name: 'ハロウィン',
    state: {
      textColor: '#ff6600',
      textOpacity: 1,
      backgroundColor: '#000000',
      stroke: { enabled: true, color: '#9932cc', width: 2 },
      shadow: 'hard',
      font: { id: 'reggae-one', size: 48, bold: false, italic: false },
    },
  },
  {
    id: 'christmas',
    name: 'クリスマス',
    state: {
      textColor: '#ff0000',
      textOpacity: 1,
      backgroundColor: '#228b22',
      stroke: { enabled: true, color: '#ffffff', width: 2 },
      shadow: 'none',
      font: { id: 'm-plus-rounded', size: 48, bold: true, italic: false },
    },
  },
  {
    id: 'new-year',
    name: '正月',
    state: {
      textColor: '#ffd700',
      textOpacity: 1,
      backgroundColor: '#cc0000',
      stroke: { enabled: true, color: '#ffffff', width: 2 },
      shadow: 'none',
      font: { id: 'noto-serif-jp', size: 44, bold: true, italic: false },
    },
  },
  // 業務・ビジネス系
  {
    id: 'warning',
    name: '警告',
    state: {
      textColor: '#000000',
      textOpacity: 1,
      backgroundColor: '#ffcc00',
      stroke: { enabled: false, color: '#ffffff', width: 2 },
      shadow: 'none',
      font: { id: 'noto-sans-jp', size: 48, bold: true, italic: false },
    },
  },
  {
    id: 'success',
    name: '成功',
    state: {
      textColor: '#ffffff',
      textOpacity: 1,
      backgroundColor: '#28a745',
      stroke: { enabled: false, color: '#ffffff', width: 2 },
      shadow: 'none',
      font: { id: 'noto-sans-jp', size: 48, bold: true, italic: false },
    },
  },
  {
    id: 'error',
    name: 'エラー',
    state: {
      textColor: '#ffffff',
      textOpacity: 1,
      backgroundColor: '#dc3545',
      stroke: { enabled: false, color: '#ffffff', width: 2 },
      shadow: 'none',
      font: { id: 'noto-sans-jp', size: 48, bold: true, italic: false },
    },
  },
  {
    id: 'info',
    name: '情報',
    state: {
      textColor: '#ffffff',
      textOpacity: 1,
      backgroundColor: '#17a2b8',
      stroke: { enabled: false, color: '#ffffff', width: 2 },
      shadow: 'none',
      font: { id: 'noto-sans-jp', size: 48, bold: true, italic: false },
    },
  },
]
