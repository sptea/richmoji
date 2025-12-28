import { ANIMATION_EFFECTS, AnimationEffectId, AnimationState } from '../types/emoji'

interface AnimationSelectorProps {
  animation: AnimationState
  onToggleEffect: (effectId: AnimationEffectId) => void
  onSpeedChange: (speed: number) => void
  onClear: () => void
}

export function AnimationSelector({
  animation,
  onToggleEffect,
  onSpeedChange,
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

      {/* 選択中の効果 */}
      {hasEffects && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">選択中:</span>
            {animation.effects.map((effectId) => {
              const effect = ANIMATION_EFFECTS.find(e => e.id === effectId)
              return (
                <span
                  key={effectId}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {effect?.name}
                  <button
                    onClick={() => onToggleEffect(effectId)}
                    className="hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              )
            })}
          </div>

          {/* 速度スライダー */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">速度</span>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={animation.speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-right text-gray-700">{animation.speed}x</span>
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
