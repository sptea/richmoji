import { describe, it, expect } from 'vitest'
import { GIFEncoder, quantize, applyPalette } from 'gifenc'
import { AnimationState } from '../types/emoji'
import { calculateFrameTransform, TOTAL_FRAMES } from './animation'

describe('GIF生成', () => {
  describe('gifenc基本動作', () => {
    it('GIFエンコーダーが正しく初期化される', () => {
      const gif = GIFEncoder()
      expect(gif).toBeDefined()
      expect(typeof gif.writeFrame).toBe('function')
      expect(typeof gif.finish).toBe('function')
      expect(typeof gif.bytes).toBe('function')
    })

    it('単一フレームのGIFが生成できる', () => {
      const gif = GIFEncoder()
      const size = 4

      // 赤い4x4画像を作成（RGBA形式）
      const rgbaData = new Uint8Array(size * size * 4)
      for (let i = 0; i < size * size; i++) {
        rgbaData[i * 4] = 255     // R
        rgbaData[i * 4 + 1] = 0   // G
        rgbaData[i * 4 + 2] = 0   // B
        rgbaData[i * 4 + 3] = 255 // A
      }

      const palette = quantize(rgbaData, 256)
      const indexedPixels = applyPalette(rgbaData, palette)

      gif.writeFrame(indexedPixels, size, size, { palette, delay: 100 })
      gif.finish()

      const bytes = gif.bytes()
      expect(bytes.length).toBeGreaterThan(0)

      // GIFヘッダーを確認 (GIF89a)
      expect(String.fromCharCode(bytes[0], bytes[1], bytes[2])).toBe('GIF')
      expect(String.fromCharCode(bytes[3], bytes[4], bytes[5])).toBe('89a')
    })

    it('複数フレームのGIFが生成できる', () => {
      const gif = GIFEncoder()
      const size = 4
      const frameCount = 5

      for (let frame = 0; frame < frameCount; frame++) {
        // 各フレームで異なる色（RGBA形式）
        const rgbaData = new Uint8Array(size * size * 4)
        for (let i = 0; i < size * size; i++) {
          rgbaData[i * 4] = (frame * 50) % 256
          rgbaData[i * 4 + 1] = 0
          rgbaData[i * 4 + 2] = 0
          rgbaData[i * 4 + 3] = 255
        }

        const palette = quantize(rgbaData, 256)
        const indexedPixels = applyPalette(rgbaData, palette)

        gif.writeFrame(indexedPixels, size, size, {
          palette,
          delay: 100,
          ...(frame === 0 ? { repeat: 0 } : {}),
        })
      }

      gif.finish()
      const bytes = gif.bytes()

      // 複数フレームなのでサイズが大きくなるはず
      expect(bytes.length).toBeGreaterThan(100)
    })

    it('repeat: 0 でNETSCAPE拡張ブロックが含まれる', () => {
      const gif = GIFEncoder()
      const size = 4

      const rgbaData = new Uint8Array(size * size * 4)
      for (let i = 0; i < size * size; i++) {
        rgbaData[i * 4] = 255
        rgbaData[i * 4 + 1] = 0
        rgbaData[i * 4 + 2] = 0
        rgbaData[i * 4 + 3] = 255
      }

      const palette = quantize(rgbaData, 256)
      const indexedPixels = applyPalette(rgbaData, palette)

      // repeat: 0 を設定
      gif.writeFrame(indexedPixels, size, size, {
        palette,
        delay: 100,
        repeat: 0,
      })
      gif.finish()

      const bytes = gif.bytes()
      const bytesString = Array.from(bytes).map(b => String.fromCharCode(b)).join('')

      // NETSCAPE2.0 拡張ブロックを検索（ループ制御用）
      const hasNetscape = bytesString.includes('NETSCAPE2.0') || bytesString.includes('NETSCAPE')
      expect(hasNetscape).toBe(true)
    })

    it('GIFのGraphic Control Extension（遅延時間）を確認', () => {
      const gif = GIFEncoder()
      const size = 4
      const frameCount = 3
      const delayTime = 100 // 100ms = 10 in GIF units (1/100 sec)

      for (let frame = 0; frame < frameCount; frame++) {
        const rgbaData = new Uint8Array(size * size * 4)
        for (let i = 0; i < size * size; i++) {
          rgbaData[i * 4] = frame * 80
          rgbaData[i * 4 + 1] = 0
          rgbaData[i * 4 + 2] = 0
          rgbaData[i * 4 + 3] = 255
        }

        const palette = quantize(rgbaData, 256)
        const indexedPixels = applyPalette(rgbaData, palette)

        gif.writeFrame(indexedPixels, size, size, {
          palette,
          delay: delayTime,
          ...(frame === 0 ? { repeat: 0 } : {}),
        })
      }

      gif.finish()
      const bytes = gif.bytes()

      // Graphic Control Extension を探す (0x21 0xF9)
      let gceCount = 0
      for (let i = 0; i < bytes.length - 1; i++) {
        if (bytes[i] === 0x21 && bytes[i + 1] === 0xF9) {
          gceCount++
        }
      }

      // 各フレームにGraphic Control Extensionがあるはず
      expect(gceCount).toBe(frameCount)
    })

    it('Image Descriptorが各フレームに存在する', () => {
      const gif = GIFEncoder()
      const size = 4
      const frameCount = 5

      for (let frame = 0; frame < frameCount; frame++) {
        const rgbaData = new Uint8Array(size * size * 4)
        for (let i = 0; i < size * size; i++) {
          rgbaData[i * 4] = frame * 50
          rgbaData[i * 4 + 1] = 0
          rgbaData[i * 4 + 2] = 0
          rgbaData[i * 4 + 3] = 255
        }

        const palette = quantize(rgbaData, 256)
        const indexedPixels = applyPalette(rgbaData, palette)

        gif.writeFrame(indexedPixels, size, size, {
          palette,
          delay: 100,
          ...(frame === 0 ? { repeat: 0 } : {}),
        })
      }

      gif.finish()
      const bytes = gif.bytes()

      // Image Descriptor を探す (0x2C)
      let imageDescCount = 0
      for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] === 0x2C) {
          imageDescCount++
        }
      }

      // 各フレームにImage Descriptorがあるはず
      expect(imageDescCount).toBe(frameCount)
    })
  })

  describe('TOTAL_FRAMES', () => {
    it('20フレーム固定', () => {
      expect(TOTAL_FRAMES).toBe(20)
    })
  })

  describe('アニメーションフレーム生成', () => {
    it('pulseエフェクトで各フレームのscaleが異なる', () => {
      const animation = {
        enabled: true,
        effects: ['pulse'] as const,
        effectSpeeds: { pulse: 1 },
      }
      const totalFrames = TOTAL_FRAMES
      const textLength = 4

      const scales: number[] = []
      for (let i = 0; i < totalFrames; i++) {
        const transform = calculateFrameTransform(
          { ...animation, effects: [...animation.effects] },
          i,
          totalFrames,
          textLength
        )
        scales.push(transform.scale)
      }

      // 全てのscaleが同じではないはず（アニメーションしている）
      const uniqueScales = new Set(scales)
      expect(uniqueScales.size).toBeGreaterThan(1)
    })

    it('blinkエフェクトでopacityが変化する', () => {
      const animation = {
        enabled: true,
        effects: ['blink'] as const,
        effectSpeeds: { blink: 1 },
      }
      const totalFrames = TOTAL_FRAMES
      const textLength = 4

      const opacities: number[] = []
      for (let i = 0; i < totalFrames; i++) {
        const transform = calculateFrameTransform(
          { ...animation, effects: [...animation.effects] },
          i,
          totalFrames,
          textLength
        )
        opacities.push(transform.opacity)
      }

      // opacityが0と1の両方を含むはず
      expect(opacities).toContain(0)
      expect(opacities).toContain(1)
    })

    it('アニメーション無効時は全フレーム同じ変換', () => {
      const animation = {
        enabled: false,
        effects: ['pulse'] as const,
        effectSpeeds: { pulse: 1 },
      }
      const totalFrames = TOTAL_FRAMES
      const textLength = 4

      const transforms = []
      for (let i = 0; i < totalFrames; i++) {
        transforms.push(calculateFrameTransform(
          { ...animation, effects: [...animation.effects] },
          i,
          totalFrames,
          textLength
        ))
      }

      // 全て同じ変換（デフォルト値）
      for (const t of transforms) {
        expect(t.scale).toBe(1)
        expect(t.opacity).toBe(1)
        expect(t.offsetX).toBe(0)
        expect(t.offsetY).toBe(0)
      }
    })

    it('effects空配列時は全フレーム同じ変換', () => {
      const animation = {
        enabled: true,
        effects: [] as const,
        effectSpeeds: {},
      }
      const totalFrames = TOTAL_FRAMES
      const textLength = 4

      const transforms = []
      for (let i = 0; i < totalFrames; i++) {
        transforms.push(calculateFrameTransform(
          { ...animation, effects: [...animation.effects] },
          i,
          totalFrames,
          textLength
        ))
      }

      // 全て同じ変換（デフォルト値）
      for (const t of transforms) {
        expect(t.scale).toBe(1)
        expect(t.opacity).toBe(1)
      }
    })

    it('typingエフェクトでvisibleCharsが変化する', () => {
      const animation = {
        enabled: true,
        effects: ['typing'] as const,
        effectSpeeds: { typing: 1 },
      }
      const totalFrames = TOTAL_FRAMES
      const textLength = 4 // 4文字のテキスト

      const visibleCharsList: (number | null)[] = []
      for (let i = 0; i < totalFrames; i++) {
        const transform = calculateFrameTransform(
          { ...animation, effects: [...animation.effects] },
          i,
          totalFrames,
          textLength
        )
        visibleCharsList.push(transform.visibleChars)
      }

      // 最初のフレームは0文字
      expect(visibleCharsList[0]).toBe(0)
      // 最後のフレームは全文字表示（Math.roundで調整済み）
      expect(visibleCharsList[totalFrames - 1]).toBe(textLength)
      // visibleCharsが変化している
      const uniqueValues = new Set(visibleCharsList)
      expect(uniqueValues.size).toBeGreaterThan(1)
      // 全ての値が0からtextLengthの範囲内
      for (const v of visibleCharsList) {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(textLength)
      }
    })

    it('textLength=0の時typingエフェクトは常にvisibleChars=0', () => {
      const animation = {
        enabled: true,
        effects: ['typing'] as const,
        effectSpeeds: { typing: 1 },
      }
      const totalFrames = TOTAL_FRAMES
      const textLength = 0 // 空テキスト

      for (let i = 0; i < totalFrames; i++) {
        const transform = calculateFrameTransform(
          { ...animation, effects: [...animation.effects] },
          i,
          totalFrames,
          textLength
        )
        // 空テキストの場合、全フレームで0
        expect(transform.visibleChars).toBe(0)
      }
    })

    it('rotateエフェクトでrotationが変化する', () => {
      const animation = {
        enabled: true,
        effects: ['rotate'] as const,
        effectSpeeds: { rotate: 1 },
      }
      const totalFrames = TOTAL_FRAMES
      const textLength = 4

      const rotations: number[] = []
      for (let i = 0; i < totalFrames; i++) {
        const transform = calculateFrameTransform(
          { ...animation, effects: [...animation.effects] },
          i,
          totalFrames,
          textLength
        )
        rotations.push(transform.rotation)
      }

      // rotationが変化している
      const uniqueRotations = new Set(rotations)
      expect(uniqueRotations.size).toBeGreaterThan(1)
      // 最初は0、最後は2π近く
      expect(rotations[0]).toBeCloseTo(0, 5)
      expect(rotations[totalFrames - 1]).toBeCloseTo(Math.PI * 2 * (totalFrames - 1) / totalFrames, 2)
    })

    it('効果ごとに異なる速度で動作する', () => {
      const animation: AnimationState = {
        enabled: true,
        effects: ['pulse', 'rainbow'],
        effectSpeeds: { pulse: 1, rainbow: 2 }, // rainbowは2倍速
      }
      const totalFrames = TOTAL_FRAMES
      const textLength = 4

      // frame 5 (progress = 0.25)
      // pulse: progress 0.25 → scale変化
      // rainbow: progress (0.25 * 2) % 1 = 0.5 → hueShift 180
      const transform = calculateFrameTransform(animation, 5, totalFrames, textLength)
      expect(transform.hueShift).toBe(180)
    })
  })
})
