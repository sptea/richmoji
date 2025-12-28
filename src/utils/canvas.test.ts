import { describe, it, expect } from 'vitest'
import { FONTS, SHADOW_PRESETS, DEFAULT_EMOJI_STATE, STYLE_PRESETS } from '../types/emoji'

// Canvasの描画テストはjsdomでは難しいため、
// 型定義とロジックのテストに限定する

describe('emoji.ts 型定義', () => {
  describe('FONTS', () => {
    it('5種類のフォントが定義されている', () => {
      expect(FONTS).toHaveLength(5)
    })

    it('各フォントに必須プロパティがある', () => {
      FONTS.forEach(font => {
        expect(font).toHaveProperty('id')
        expect(font).toHaveProperty('name')
        expect(font).toHaveProperty('family')
        expect(font).toHaveProperty('category')
      })
    })

    it('Reggae OneはnoBoldフラグを持つ', () => {
      const reggae = FONTS.find(f => f.id === 'reggae-one')
      expect(reggae?.noBold).toBe(true)
    })
  })

  describe('SHADOW_PRESETS', () => {
    it('4種類の影プリセットが定義されている', () => {
      expect(Object.keys(SHADOW_PRESETS)).toHaveLength(4)
    })

    it('noneプリセットはenabledがfalse', () => {
      expect(SHADOW_PRESETS.none.enabled).toBe(false)
    })

    it('soft/hard/longプリセットはenabledがtrue', () => {
      expect(SHADOW_PRESETS.soft.enabled).toBe(true)
      expect(SHADOW_PRESETS.hard.enabled).toBe(true)
      expect(SHADOW_PRESETS.long.enabled).toBe(true)
    })
  })

  describe('DEFAULT_EMOJI_STATE', () => {
    it('デフォルト値が正しく設定されている', () => {
      expect(DEFAULT_EMOJI_STATE.text).toBe('RichMoji')
      expect(DEFAULT_EMOJI_STATE.font.id).toBe('noto-sans-jp')
      expect(DEFAULT_EMOJI_STATE.backgroundColor).toBe('transparent')
      expect(DEFAULT_EMOJI_STATE.stroke.enabled).toBe(false)
      expect(DEFAULT_EMOJI_STATE.shadow).toBe('none')
    })
  })

  describe('STYLE_PRESETS', () => {
    it('8種類のスタイルプリセットが定義されている', () => {
      expect(STYLE_PRESETS).toHaveLength(8)
    })

    it('各プリセットに必須プロパティがある', () => {
      STYLE_PRESETS.forEach(preset => {
        expect(preset).toHaveProperty('id')
        expect(preset).toHaveProperty('name')
        expect(preset).toHaveProperty('state')
      })
    })

    it('プリセットIDがユニーク', () => {
      const ids = STYLE_PRESETS.map(p => p.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })
})
