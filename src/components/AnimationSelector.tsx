import { ANIMATION_EFFECTS, AnimationEffectId, AnimationState } from '../types/emoji'

interface AnimationSelectorProps {
  animation: AnimationState
  onToggleEffect: (effectId: AnimationEffectId) => void
  onEffectSpeedChange: (effectId: AnimationEffectId, speed: number) => void
  onClear: () => void
}

// 選択可能な速度（シームレスなループのため整数のみ）
const SPEED_OPTIONS = [1, 2, 3, 4] as const

export function AnimationSelector({
  animation,
  onToggleEffect,
  onEffectSpeedChange,
  onClear,
}: AnimationSelectorProps) {
  const hasEffects = animation.effects.length > 0

  return (
    <div className="space-y-4">
      {/* 効果選択グリッド */}
      <div className="grid grid-cols-3 gap-2">
        {ANIMATION_EFFECTS.map((effect) => {
          const isSelected = animation.effects.includes(effect.id)
          return (
            <button
              key={effect.id}
              onClick={() => onToggleEffect(effect.id)}
              className={`p-2 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">{effect.name}</div>
              <div className="text-xs text-gray-500 truncate">{effect.description}</div>
            </button>
          )
        })}
      </div>

      {/* 選択中の効果と速度設定 */}
      {hasEffects && (
        <div className="space-y-3">
          <span className="text-sm text-gray-600">選択中の効果</span>

          {/* 効果ごとの速度設定 */}
          <div className="space-y-2">
            {animation.effects.map((effectId) => {
              const effect = ANIMATION_EFFECTS.find(e => e.id === effectId)
              const speed = animation.effectSpeeds[effectId] ?? 1

              return (
                <div
                  key={effectId}
                  className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg"
                >
                  {/* 効果名 */}
                  <span className="text-sm font-medium text-blue-800 w-20 truncate">
                    {effect?.name}
                  </span>

                  {/* 速度選択ボタン */}
                  <div className="flex gap-1 flex-1">
                    {SPEED_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => onEffectSpeedChange(effectId, s)}
                        className={`px-2 py-0.5 text-xs rounded transition-colors ${
                          speed === s
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  {/* 削除ボタン */}
                  <button
                    onClick={() => onToggleEffect(effectId)}
                    className="text-blue-400 hover:text-blue-600 text-sm"
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>

          {/* クリアボタン */}
          <button
            onClick={onClear}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors text-sm"
          >
            すべてクリア
          </button>
        </div>
      )}

      {/* ヒント */}
      {!hasEffects && (
        <p className="text-sm text-gray-500">
          効果を選択するとアニメーションGIFを作成できます（複数選択可）
        </p>
      )}
    </div>
  )
}
