import { FONTS, STYLE_PRESETS, StylePreset } from '../types/emoji'
import { EditorProps } from '../types/editor'
import { ImageUpload } from './ImageUpload'
import { AnimationSelector } from './AnimationSelector'
import { usePresetHistory } from '../hooks/usePresetHistory'

export function Editor({
  font,
  fontActions,
  stroke,
  strokeActions,
  shadow,
  onShadowChange,
  backgroundImage,
  backgroundImageActions,
  animation,
  animationActions,
  onApplyPreset,
}: EditorProps) {
  const currentFont = FONTS.find(f => f.id === font.id)
  const { history, addToHistory } = usePresetHistory()

  // 履歴に基づいてプリセットを取得
  const recentPresets = history
    .map(id => STYLE_PRESETS.find(p => p.id === id))
    .filter((p): p is StylePreset => p !== undefined)

  // プリセット適用時に履歴に追加
  const handleApplyPreset = (preset: StylePreset) => {
    addToHistory(preset.id)
    onApplyPreset(preset)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* スタイルプリセット */}
      <Section title="スタイルプリセット">
        <div className="space-y-3">
          {/* 最近使った */}
          {recentPresets.length > 0 && (
            <div>
              <div className="text-xs text-gray-400 mb-1.5">最近使った</div>
              <div className="grid grid-cols-5 gap-1.5">
                {recentPresets.map((preset) => (
                  <PresetButton
                    key={`recent-${preset.id}`}
                    preset={preset}
                    onClick={() => handleApplyPreset(preset)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* すべて */}
          <div>
            {recentPresets.length > 0 && (
              <div className="text-xs text-gray-400 mb-1.5">すべて</div>
            )}
            <div className="grid grid-cols-4 gap-2">
              {STYLE_PRESETS.map((preset) => (
                <PresetButton
                  key={preset.id}
                  preset={preset}
                  onClick={() => handleApplyPreset(preset)}
                />
              ))}
            </div>
          </div>
        </div>
      </Section>

      <GroupHeader title="文字" />

      {/* フォント選択 */}
      <Section title="フォント">
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-1.5">
            {FONTS.map((f) => (
              <button
                key={f.id}
                onClick={() => fontActions.onIdChange(f.id)}
                className={`px-2 py-1 text-left rounded border-2 transition-colors ${
                  font.id === f.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className="text-sm font-medium leading-tight"
                  style={{ fontFamily: `"${f.family}", sans-serif` }}
                >
                  あア亜
                </div>
                <div className="text-xs text-gray-500 truncate leading-tight">{f.name}</div>
              </button>
            ))}
          </div>

          {/* 太字・斜体 */}
          <div className="flex gap-2">
            <button
              onClick={fontActions.onBoldToggle}
              disabled={currentFont?.noBold}
              className={`px-4 py-2 rounded font-bold transition-colors ${
                font.bold
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } ${currentFont?.noBold ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              B
            </button>
            <button
              onClick={fontActions.onItalicToggle}
              className={`px-4 py-2 rounded italic transition-colors ${
                font.italic
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              I
            </button>
          </div>
        </div>
      </Section>

      {/* 縁取り */}
      <Section title="縁取り">
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={stroke.enabled}
              onChange={(e) => strokeActions.onEnabledChange(e.target.checked)}
              className="w-5 h-5 rounded"
            />
            <span>縁取りを有効にする</span>
          </label>
          {stroke.enabled && (
            <>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">色</span>
                <input
                  type="color"
                  value={stroke.color}
                  onChange={(e) => strokeActions.onColorChange(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">太さ</span>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={stroke.width}
                  onChange={(e) => strokeActions.onWidthChange(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-12 text-right text-gray-700">{stroke.width}px</span>
              </div>
            </>
          )}
        </div>
      </Section>

      {/* 影 */}
      <Section title="影">
        <div className="flex gap-1.5">
          {(['none', 'soft', 'hard', 'long'] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => onShadowChange(preset)}
              className={`px-3 py-1 rounded border-2 transition-colors text-sm ${
                shadow === preset
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {preset === 'none' ? 'なし' : preset === 'soft' ? 'ソフト' : preset === 'hard' ? 'ハード' : '長い'}
            </button>
          ))}
        </div>
      </Section>

      <GroupHeader title="背景" />

      {/* 背景画像 */}
      <Section title="背景画像">
        <ImageUpload
          backgroundImage={backgroundImage}
          onImageChange={backgroundImageActions.onChange}
          onScaleChange={backgroundImageActions.onScaleChange}
          onOffsetChange={backgroundImageActions.onOffsetChange}
          onOpacityChange={backgroundImageActions.onOpacityChange}
          onClear={backgroundImageActions.onClear}
        />
      </Section>

      <GroupHeader title="効果" />

      {/* アニメーション */}
      <Section title="アニメーション">
        <AnimationSelector
          animation={animation}
          onToggleEffect={animationActions.onToggleEffect}
          onSpeedChange={animationActions.onSpeedChange}
          onClear={animationActions.onClear}
        />
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

function GroupHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs text-gray-400 font-medium">{title}</span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  )
}

function PresetButton({ preset, onClick }: { preset: StylePreset; onClick: () => void }) {
  const presetFont = FONTS.find(f => f.id === preset.state.font?.id)
  const fontFamily = presetFont?.family || 'sans-serif'
  const isBold = preset.state.font?.bold ?? false
  const textColor = preset.state.textColor || '#000000'
  const bgColor = preset.state.backgroundColor || 'transparent'
  const hasStroke = preset.state.stroke?.enabled
  const strokeColor = preset.state.stroke?.color || '#000000'

  return (
    <button
      onClick={onClick}
      className="px-3 py-3 text-sm rounded-lg border border-gray-200 hover:border-blue-500 hover:scale-105 transition-all overflow-hidden"
      style={{
        fontFamily: `"${fontFamily}", sans-serif`,
        fontWeight: isBold ? 'bold' : 'normal',
        color: textColor,
        backgroundColor: bgColor === 'transparent' ? '#f9fafb' : bgColor,
        textShadow: hasStroke
          ? `1px 1px 0 ${strokeColor}, -1px -1px 0 ${strokeColor}, 1px -1px 0 ${strokeColor}, -1px 1px 0 ${strokeColor}`
          : undefined,
      }}
    >
      {preset.name}
    </button>
  )
}
