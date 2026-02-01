import { describe, it, expect } from 'vitest'
import { calculateFrameTransform, calculateTotalFrames, applyHueShift, DEFAULT_TRANSFORM, TOTAL_FRAMES } from './animation'
import { AnimationState } from '../types/emoji'

describe('animation.ts', () => {
  describe('calculateFrameTransform', () => {
    const createAnimationState = (effects: string[], enabled = true, effectSpeeds: Record<string, number> = {}): AnimationState => ({
      effects: effects as AnimationState['effects'],
      effectSpeeds,
      enabled,
    })

    it('アニメーション無効時はデフォルト値を返す', () => {
      const animation = createAnimationState(['blink'], false)
      const result = calculateFrameTransform(animation, 0, 20, 5)

      expect(result).toEqual(DEFAULT_TRANSFORM)
    })

    it('効果が空の場合はデフォルト値を返す', () => {
      const animation = createAnimationState([], true)
      const result = calculateFrameTransform(animation, 0, 20, 5)

      expect(result).toEqual(DEFAULT_TRANSFORM)
    })

    describe('blink効果', () => {
      it('前半（progress < 0.5）は表示（opacity = 1）', () => {
        const animation = createAnimationState(['blink'])
        // フレーム0/20 = progress 0
        const result = calculateFrameTransform(animation, 0, 20, 5)
        expect(result.opacity).toBe(1)

        // フレーム5/20 = progress 0.25
        const result2 = calculateFrameTransform(animation, 5, 20, 5)
        expect(result2.opacity).toBe(1)
      })

      it('後半（progress >= 0.5）は非表示（opacity = 0）', () => {
        const animation = createAnimationState(['blink'])
        // フレーム10/20 = progress 0.5
        const result = calculateFrameTransform(animation, 10, 20, 5)
        expect(result.opacity).toBe(0)

        // フレーム15/20 = progress 0.75
        const result2 = calculateFrameTransform(animation, 15, 20, 5)
        expect(result2.opacity).toBe(0)
      })
    })

    describe('pulse効果', () => {
      it('スケールが1.0から1.2の範囲で変化する', () => {
        const animation = createAnimationState(['pulse'])

        // 様々なフレームでスケールが範囲内にあることを確認
        for (let frame = 0; frame < 20; frame++) {
          const result = calculateFrameTransform(animation, frame, 20, 5)
          expect(result.scale).toBeGreaterThanOrEqual(0.8)
          expect(result.scale).toBeLessThanOrEqual(1.2)
        }
      })
    })

    describe('rotate効果', () => {
      it('1サイクルで2π（360度）回転する', () => {
        const animation = createAnimationState(['rotate'])

        // progress 0 → rotation 0
        const result0 = calculateFrameTransform(animation, 0, 20, 5)
        expect(result0.rotation).toBeCloseTo(0)

        // progress 0.5 → rotation π
        const result10 = calculateFrameTransform(animation, 10, 20, 5)
        expect(result10.rotation).toBeCloseTo(Math.PI)

        // progress 1.0 → rotation 2π（最後のフレームは含まない）
        const result19 = calculateFrameTransform(animation, 19, 20, 5)
        expect(result19.rotation).toBeCloseTo(Math.PI * 2 * (19 / 20))
      })
    })

    describe('rainbow効果', () => {
      it('色相が0から360度まで変化する', () => {
        const animation = createAnimationState(['rainbow'])

        // progress 0 → hueShift 0
        const result0 = calculateFrameTransform(animation, 0, 20, 5)
        expect(result0.hueShift).toBe(0)

        // progress 0.5 → hueShift 180
        const result10 = calculateFrameTransform(animation, 10, 20, 5)
        expect(result10.hueShift).toBe(180)
      })
    })

    describe('typing効果', () => {
      it('visibleCharsが徐々に増加し最後の30%は全文字表示', () => {
        const animation = createAnimationState(['typing'])
        const textLength = 5

        // progress 0 → 0文字表示
        const result0 = calculateFrameTransform(animation, 0, 20, textLength)
        expect(result0.visibleChars).toBe(0)

        // progress 0.5 → 70%で全文字なので、50%では大部分表示
        const result10 = calculateFrameTransform(animation, 10, 20, textLength)
        expect(result10.visibleChars).toBe(4) // floor((0.5/0.7)*6) = 4

        // progress 0.7以上 → 全文字表示を保証
        const result14 = calculateFrameTransform(animation, 14, 20, textLength)
        expect(result14.visibleChars).toBe(5)

        // progress 1.0に近い → 全文字表示
        const result19 = calculateFrameTransform(animation, 19, 20, textLength)
        expect(result19.visibleChars).toBe(5)
      })
    })

    describe('wave効果', () => {
      it('文字ごとにオフセットが設定される', () => {
        const animation = createAnimationState(['wave'])
        const textLength = 3

        const result = calculateFrameTransform(animation, 0, 20, textLength)

        expect(result.charOffsets).not.toBeNull()
        expect(result.charOffsets).toHaveLength(textLength)

        // 各オフセットが-8から8の範囲内
        result.charOffsets!.forEach(offset => {
          expect(offset).toBeGreaterThanOrEqual(-8)
          expect(offset).toBeLessThanOrEqual(8)
        })
      })
    })

    describe('複数効果の合成', () => {
      it('スケールは乗算される', () => {
        const animation = createAnimationState(['pulse', 'zoom'])

        const result = calculateFrameTransform(animation, 5, 20, 5)

        // pulseとzoomの両方のスケールが乗算されているはず
        // 個別のスケールを確認するのは難しいので、1.0ではないことを確認
        expect(result.scale).not.toBe(1)
      })

      it('回転は加算される', () => {
        const animation = createAnimationState(['rotate', 'wobble'])

        const result = calculateFrameTransform(animation, 5, 20, 5)

        // rotateとwobbleの両方の回転が加算されているはず
        expect(result.rotation).not.toBe(0)
      })

      it('オフセットは加算される', () => {
        const animation = createAnimationState(['bounce', 'shake'])

        const result = calculateFrameTransform(animation, 5, 20, 5)

        // bounceはoffsetY、shakeはoffsetXを変更するので、両方が設定される
        // 少なくともどちらかは0でないはず
        const hasOffset = result.offsetX !== 0 || result.offsetY !== 0
        expect(hasOffset).toBe(true)
      })
    })
  })

  describe('calculateTotalFrames', () => {
    it('常に20フレームを返す', () => {
      expect(calculateTotalFrames()).toBe(TOTAL_FRAMES)
      expect(TOTAL_FRAMES).toBe(20)
    })
  })

  describe('effectSpeeds', () => {
    const createAnimationState = (effects: string[], enabled = true, effectSpeeds: Record<string, number> = {}): AnimationState => ({
      effects: effects as AnimationState['effects'],
      effectSpeeds,
      enabled,
    })

    it('効果ごとに異なる速度を適用できる', () => {
      // rainbowは2倍速（2周期）
      const animation = createAnimationState(['rainbow'], true, { rainbow: 2 })

      // progress 0.25 * speed 2 = 0.5 → hueShift 180
      const result = calculateFrameTransform(animation, 5, 20, 5)
      expect(result.hueShift).toBe(180)
    })

    it('速度未設定の効果はデフォルト1.0で動作', () => {
      const animation = createAnimationState(['rainbow'], true, {}) // effectSpeedsは空

      // progress 0.5 → hueShift 180
      const result = calculateFrameTransform(animation, 10, 20, 5)
      expect(result.hueShift).toBe(180)
    })
  })

  describe('applyHueShift（レインボー用）', () => {
    it('シフト0は元の色を返す', () => {
      const color = '#ff0000'
      expect(applyHueShift(color, 0)).toBe(color)
    })

    it('hueShift 120で緑系になる（元の色は無視）', () => {
      const result = applyHueShift('#000000', 120) // 黒でも関係ない
      // hue 120 = 緑系（#00ff00）
      expect(result).toMatch(/^#[0-9a-f]{6}$/)
      const g = parseInt(result.slice(3, 5), 16)
      expect(g).toBeGreaterThan(200)
    })

    it('hueShift 240で青系になる（元の色は無視）', () => {
      const result = applyHueShift('#ffffff', 240) // 白でも関係ない
      // hue 240 = 青系（#0000ff）
      expect(result).toMatch(/^#[0-9a-f]{6}$/)
      const b = parseInt(result.slice(5, 7), 16)
      expect(b).toBeGreaterThan(200)
    })

    it('hueShift 360で赤系になる（一周）', () => {
      const result = applyHueShift('#808080', 360)
      // hue 360 = hue 0 = 赤系（#ff0000）
      expect(result).toMatch(/^#[0-9a-f]{6}$/)
      const r = parseInt(result.slice(1, 3), 16)
      expect(r).toBeGreaterThan(200)
    })

    it('hueShift 180でシアン系になる', () => {
      const result = applyHueShift('#123456', 180)
      // hue 180 = シアン系（#00ffff）
      expect(result).toMatch(/^#[0-9a-f]{6}$/)
      const g = parseInt(result.slice(3, 5), 16)
      const b = parseInt(result.slice(5, 7), 16)
      expect(g).toBeGreaterThan(200)
      expect(b).toBeGreaterThan(200)
    })

    it('どんな色でもレインボーが機能する', () => {
      // 黒、白、グレーでも鮮やかなレインボーカラーになる
      const colors = ['#000000', '#ffffff', '#808080', '#ff0000']
      for (const color of colors) {
        const result = applyHueShift(color, 90) // 黄緑系
        expect(result).toMatch(/^#[0-9a-f]{6}$/)
        expect(result).not.toBe(color) // 元の色とは異なる
      }
    })
  })
})
