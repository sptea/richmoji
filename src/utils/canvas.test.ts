import { describe, it, expect } from 'vitest'
import { FONTS, SHADOW_PRESETS, DEFAULT_EMOJI_STATE, STYLE_PRESETS } from '../types/emoji'

// Canvasの描画テストはjsdomでは難しいため、
// 型定義とロジックのテストに限定する

describe('emoji.ts 型定義', () => {
  describe('FONTS', () => {
    it('10種類のフォントが定義されている', () => {
      expect(FONTS).toHaveLength(10)
    })

    it('各フォントに必須プロパティがある', () => {
      FONTS.forEach(font => {
        expect(font).toHaveProperty('id')
        expect(font).toHaveProperty('name')
        expect(font).toHaveProperty('family')
        expect(font).toHaveProperty('category')
      })
    })

    it('単一ウェイトのフォントはnoBoldフラグを持つ', () => {
      // 単一ウェイトのフォント（太字なし）
      const noBoldFonts = ['reggae-one', 'dela-gothic-one', 'yusei-magic', 'hachi-maru-pop', 'mochiy-pop-one', 'dot-gothic-16']
      noBoldFonts.forEach(id => {
        const font = FONTS.find(f => f.id === id)
        expect(font?.noBold).toBe(true)
      })
    })

    it('太字対応フォントはnoBoldがfalse', () => {
      // 太字対応フォント
      const boldFonts = ['noto-sans-jp', 'm-plus-rounded', 'noto-serif-jp', 'kiwi-maru']
      boldFonts.forEach(id => {
        const font = FONTS.find(f => f.id === id)
        expect(font?.noBold).toBe(false)
      })
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
      expect(DEFAULT_EMOJI_STATE.text).toBe('りち\nもじ')
      expect(DEFAULT_EMOJI_STATE.font.id).toBe('noto-sans-jp')
      expect(DEFAULT_EMOJI_STATE.backgroundColor).toBe('transparent')
      expect(DEFAULT_EMOJI_STATE.stroke.enabled).toBe(false)
      expect(DEFAULT_EMOJI_STATE.shadow).toBe('none')
    })
  })

  describe('STYLE_PRESETS', () => {
    it('22種類のスタイルプリセットが定義されている', () => {
      expect(STYLE_PRESETS).toHaveLength(22)
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
