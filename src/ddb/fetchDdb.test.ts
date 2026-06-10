import { describe, expect, it } from 'vitest'
import { extractCharacterId } from './fetchDdb'

describe('extractCharacterId', () => {
  it('aceita o ID puro', () => {
    expect(extractCharacterId('123456789')).toBe('123456789')
    expect(extractCharacterId('  42 ')).toBe('42')
  })
  it('extrai de um link de personagem do D&D Beyond', () => {
    expect(extractCharacterId('https://www.dndbeyond.com/characters/123456789')).toBe('123456789')
    expect(extractCharacterId('https://www.dndbeyond.com/characters/987/builder')).toBe('987')
  })
  it('extrai do endpoint character-service', () => {
    expect(
      extractCharacterId('https://character-service.dndbeyond.com/character/v5/character/555'),
    ).toBe('555')
  })
  it('retorna null pra entrada inválida', () => {
    expect(extractCharacterId('não é link')).toBeNull()
    expect(extractCharacterId('')).toBeNull()
  })
})
