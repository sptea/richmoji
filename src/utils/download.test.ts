import { describe, it, expect } from 'vitest'
import { generateFilename } from './download'

describe('generateFilename', () => {
  it('空テキストの場合はemojiを返す', () => {
    expect(generateFilename('')).toBe('emoji')
    expect(generateFilename('   ')).toBe('emoji')
  })

  it('1行のテキストはそのまま返す', () => {
    expect(generateFilename('こんにちは')).toBe('こんにちは')
  })

  it('複数行は"-"で結合する', () => {
    expect(generateFilename('こん\nにちは')).toBe('こん-にちは')
    expect(generateFilename('A\nB\nC')).toBe('A-B-C')
  })

  it('空行は除去される', () => {
    expect(generateFilename('A\n\nB')).toBe('A-B')
    expect(generateFilename('A\n  \nB')).toBe('A-B')
  })

  it('各行の前後の空白はトリムされる', () => {
    expect(generateFilename('  A  \n  B  ')).toBe('A-B')
  })

  it('長すぎる場合は省略される', () => {
    const longText = 'あ'.repeat(60)
    const result = generateFilename(longText)
    expect(result.length).toBe(50)
    expect(result.endsWith('…')).toBe(true)
  })

  it('ファイル名に使えない文字は除去される', () => {
    expect(generateFilename('A<B>C')).toBe('ABC')
    expect(generateFilename('A:B/C\\D')).toBe('ABCD')
    expect(generateFilename('A|B?C*D')).toBe('ABCD')
    expect(generateFilename('A"B')).toBe('AB')
  })
})
