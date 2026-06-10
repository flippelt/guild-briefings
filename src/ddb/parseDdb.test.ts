import { describe, expect, it } from 'vitest'
import { parseDdbCharacter, parseDdbJson, extractDdbData } from './parseDdb'

// Fixture mínima no formato do character-service v5 do D&D Beyond.
const fixture = {
  name: 'Aragorn',
  decorations: { avatarUrl: 'https://example.com/avatar.png' },
  stats: [
    { id: 1, value: 15 }, // STR base
    { id: 2, value: 14 }, // DEX
    { id: 3, value: 13 }, // CON base
    { id: 4, value: 10 }, // INT
    { id: 5, value: 12 }, // WIS
    { id: 6, value: 8 }, // CHA
  ],
  bonusStats: [{ id: 1, value: 1 }], // +1 STR de bônus
  overrideStats: [{ id: 6, value: 16 }], // CHA sobrescrito p/ 16
  modifiers: {
    race: [{ type: 'bonus', subType: 'constitution-score', value: 2 }], // +2 CON racial
    feat: [],
    class: [],
    background: [],
    item: [],
    condition: [],
  },
  baseHitPoints: 40,
  bonusHitPoints: 5,
  removedHitPoints: 7,
  classes: [
    { level: 5, definition: { name: 'Ranger' }, subclassDefinition: { name: 'Hunter' } },
    { level: 2, definition: { name: 'Fighter' } },
  ],
  race: { fullName: 'Wood Elf', baseRaceName: 'Elf' },
  notes: { backstory: 'Criado entre as árvores antigas, jurou caçar os que profanam a floresta.' },
}

describe('parseDdbCharacter', () => {
  it('extrai nome, raça, classes e nível total', () => {
    const c = parseDdbCharacter(fixture)
    expect(c.name).toBe('Aragorn')
    expect(c.race).toBe('Wood Elf')
    expect(c.level).toBe(7) // 5 + 2
    expect(c.classes).toEqual([
      { name: 'Ranger', level: 5, subclass: 'Hunter' },
      { name: 'Fighter', level: 2 },
    ])
    expect(c.source).toBe('ddb')
    expect(c.id).toBeTruthy()
  })

  it('aplica bônus/override/modificadores nos atributos', () => {
    const c = parseDdbCharacter(fixture)
    expect(c.abilities!.str).toBe(16) // 15 base + 1 bonus
    expect(c.abilities!.con).toBe(15) // 13 base + 2 racial
    expect(c.abilities!.cha).toBe(16) // override
    expect(c.abilities!.int).toBe(10) // base puro
  })

  it('calcula PV aproximado (base + CON*nível + bônus − dano)', () => {
    const c = parseDdbCharacter(fixture)
    // CON 15 → mod +2; 40 + 2*7 + 5 = 59 max; 59 - 7 removidos = 52
    expect(c.maxHp).toBe(59)
    expect(c.hp).toBe(52)
  })

  it('pega o avatar', () => {
    expect(parseDdbCharacter(fixture).avatarUrl).toBe('https://example.com/avatar.png')
  })

  it('pega a história (notes.backstory)', () => {
    expect(parseDdbCharacter(fixture).backstory).toMatch(/árvores antigas/)
  })

  it('desembrulha o envelope { data } do endpoint', () => {
    const enveloped = { success: true, data: fixture }
    expect(extractDdbData(enveloped)).toBe(fixture)
    expect(parseDdbCharacter(enveloped).name).toBe('Aragorn')
  })

  it('lança erro amigável sem nome', () => {
    expect(() => parseDdbCharacter({ classes: [] })).toThrow(/nome/)
  })

  it('tolera ficha mínima (sem stats/classes/hp)', () => {
    const c = parseDdbCharacter({ name: 'Goblin Anônimo' })
    expect(c.name).toBe('Goblin Anônimo')
    expect(c.level).toBe(1)
    expect(c.classes).toEqual([])
    expect(c.maxHp).toBeUndefined()
    // atributos caem em 10 (default)
    expect(c.abilities!.str).toBe(10)
  })
})

describe('parseDdbJson', () => {
  it('parseia texto JSON', () => {
    expect(parseDdbJson(JSON.stringify(fixture)).name).toBe('Aragorn')
  })
  it('lança erro em JSON malformado', () => {
    expect(() => parseDdbJson('{ não é json')).toThrow(/JSON inválido/)
  })
})
