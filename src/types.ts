export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'

export type AbilityScores = Record<AbilityKey, number>

export interface CharacterClass {
  name: string
  level: number
  subclass?: string
}

/** Personagem no formato do briefing — subconjunto enxuto pra exibir na mesa. */
export interface BriefingCharacter {
  id: string
  name: string
  race?: string
  classes: CharacterClass[]
  /** Nível total (soma das classes). */
  level: number
  abilities?: AbilityScores
  hp?: number
  maxHp?: number
  ac?: number
  avatarUrl?: string
  /** Jogador (pessoa real), opcional. */
  player?: string
  notes?: string
  /** De onde veio: import do DDB ou entrada manual. */
  source: 'ddb' | 'manual'
}

export const ABILITY_ORDER: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

export const ABILITY_LABEL: Record<AbilityKey, string> = {
  str: 'FOR',
  dex: 'DES',
  con: 'CON',
  int: 'INT',
  wis: 'SAB',
  cha: 'CAR',
}

/** Modificador de atributo (5e): floor((score - 10) / 2). */
export const abilityMod = (score: number): number => Math.floor((score - 10) / 2)

/** Bônus de proficiência por nível (5e). */
export const proficiencyBonus = (level: number): number => Math.floor((Math.max(1, level) - 1) / 4) + 2

/** Linha de classe legível: "Ranger (Hunter) 5 / Rogue 2". */
export function classLine(classes: CharacterClass[]): string {
  return classes
    .map((c) => `${c.name}${c.subclass ? ` (${c.subclass})` : ''} ${c.level}`)
    .join(' / ')
}
