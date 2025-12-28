import { FONTS, PRESET_COLORS, STYLE_PRESETS, FontId, ShadowPresetId, StylePreset, BackgroundImage } from '../types/emoji'
import { ImageUpload } from './ImageUpload'

interface EditorProps {
  text: string
  fontId: FontId
  fontSize: number
  bold: boolean
  italic: boolean
  textColor: string
  textOpacity: number
  backgroundColor: string
  backgroundImage: BackgroundImage
  strokeEnabled: boolean
  strokeColor: string
  strokeWidth: number
  shadow: ShadowPresetId
  onTextChange: (text: string) => void
  onFontIdChange: (id: FontId) => void
  onFontSizeChange: (size: number) => void
  onBoldToggle: () => void
  onItalicToggle: () => void
  onTextColorChange: (color: string) => void
  onTextOpacityChange: (opacity: number) => void
  onBackgroundColorChange: (color: string) => void
  onBackgroundImageChange: (data: string | null) => void
  onBackgroundImageScaleChange: (scale: number) => void
  onBackgroundImageOffsetChange: (offsetX: number, offsetY: number) => void
  onBackgroundImageOpacityChange: (opacity: number) => void
  onBackgroundImageClear: () => void
  onStrokeEnabledChange: (enabled: boolean) => void
  onStrokeColorChange: (color: string) => void
  onStrokeWidthChange: (width: number) => void
  onShadowChange: (shadow: ShadowPresetId) => void
  onAutoFit: () => void
  onApplyPreset: (preset: StylePreset) => void
}

export function Editor({
  text,
  fontId,
  fontSize,
  bold,
  italic,
  textColor,
  textOpacity,
  backgroundColor,
  backgroundImage,
  strokeEnabled,
  strokeColor,
  strokeWidth,
  shadow,
  onTextChange,
  onFontIdChange,
  onFontSizeChange,
  onBoldToggle,
  onItalicToggle,
  onTextColorChange,
  onTextOpacityChange,
  onBackgroundColorChange,
  onBackgroundImageChange,
  onBackgroundImageScaleChange,
  onBackgroundImageOffsetChange,
  onBackgroundImageOpacityChange,
  onBackgroundImageClear,
  onStrokeEnabledChange,
  onStrokeColorChange,
  onStrokeWidthChange,
  onShadowChange,
  onAutoFit,
  onApplyPreset,
}: EditorProps) {
  const currentFont = FONTS.find(f => f.id === fontId)

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* スタイルプリセット */}
      <Section title="スタイルプリセット">
        <div className="grid grid-cols-4 gap-2">
          {STYLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </Section>

      {/* テキスト入力 */}
      <Section title="テキスト">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="絵文字にするテキストを入力..."
          className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </Section>

      {/* フォント選択 */}
      <Section title="フォント">
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            {FONTS.map((font) => (
              <button
                key={font.id}
                onClick={() => onFontIdChange(font.id)}
                className={`p-3 text-left rounded-lg border transition-colors ${
                  fontId === font.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span
                  className="text-lg"
                  style={{ fontFamily: `"${font.family}", sans-serif` }}
                >
                  あア亜Aa
                </span>
                <span className="text-sm text-gray-500 ml-2">{font.name}</span>
              </button>
            ))}
          </div>

          {/* 太字・斜体 */}
          <div className="flex gap-2">
            <button
              onClick={onBoldToggle}
              disabled={currentFont?.noBold}
              className={`px-4 py-2 rounded font-bold transition-colors ${
                bold
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } ${currentFont?.noBold ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              B
            </button>
            <button
              onClick={onItalicToggle}
              className={`px-4 py-2 rounded italic transition-colors ${
                italic
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              I
            </button>
          </div>
        </div>
      </Section>

      {/* 文字サイズ */}
      <Section title="文字サイズ">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={8}
              max={128}
              value={fontSize}
              onChange={(e) => onFontSizeChange(Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-right text-gray-700">{fontSize}px</span>
          </div>
          <button
            onClick={onAutoFit}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
          >
            自動フィット
          </button>
        </div>
      </Section>

      {/* 文字色 */}
      <Section title="文字色">
        <div className="space-y-3">
          <div className="grid grid-cols-8 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onTextColorChange(color)}
                className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${
                  textColor === color ? 'border-blue-500' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={textColor}
              onChange={(e) => onTextColorChange(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={textColor}
              onChange={(e) => onTextColorChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">透明度</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={textOpacity}
              onChange={(e) => onTextOpacityChange(Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-right text-gray-700">{Math.round(textOpacity * 100)}%</span>
          </div>
        </div>
      </Section>

      {/* 背景色 */}
      <Section title="背景色">
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => onBackgroundColorChange('transparent')}
              className={`px-3 py-2 rounded border-2 transition-colors ${
                backgroundColor === 'transparent'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300'
              }`}
              style={{
                backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
              }}
            >
              透明
            </button>
            {PRESET_COLORS.slice(0, 8).map((color) => (
              <button
                key={color}
                onClick={() => onBackgroundColorChange(color)}
                className={`w-10 h-10 rounded border-2 transition-transform hover:scale-110 ${
                  backgroundColor === color ? 'border-blue-500' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded"
              placeholder="transparent or #ffffff"
            />
          </div>
        </div>
      </Section>

      {/* 背景画像 */}
      <Section title="背景画像">
        <ImageUpload
          backgroundImage={backgroundImage}
          onImageChange={onBackgroundImageChange}
          onScaleChange={onBackgroundImageScaleChange}
          onOffsetChange={onBackgroundImageOffsetChange}
          onOpacityChange={onBackgroundImageOpacityChange}
          onClear={onBackgroundImageClear}
        />
      </Section>

      {/* 縁取り */}
      <Section title="縁取り">
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={strokeEnabled}
              onChange={(e) => onStrokeEnabledChange(e.target.checked)}
              className="w-5 h-5 rounded"
            />
            <span>縁取りを有効にする</span>
          </label>
          {strokeEnabled && (
            <>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">色</span>
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => onStrokeColorChange(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">太さ</span>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={strokeWidth}
                  onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-12 text-right text-gray-700">{strokeWidth}px</span>
              </div>
            </>
          )}
        </div>
      </Section>

      {/* 影 */}
      <Section title="影">
        <div className="flex gap-2 flex-wrap">
          {(['none', 'soft', 'hard', 'long'] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => onShadowChange(preset)}
              className={`px-4 py-2 rounded border-2 transition-colors ${
                shadow === preset
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {preset === 'none' ? 'なし' : preset === 'soft' ? 'ソフト' : preset === 'hard' ? 'ハード' : '長い'}
            </button>
          ))}
        </div>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      {children}
    </div>
  )
}
