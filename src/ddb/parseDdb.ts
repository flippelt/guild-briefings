import type { AbilityKey, AbilityScores, BriefingCharacter, CharacterClass } from '../types'
import { abilityMod } from '../types'

/**
 * Parser do JSON de personagem do D&D Beyond (endpoint não-oficial
 * character-service v5, ou o JSON exportado/colado). Best-effort e DEFENSIVO:
 * extrai o subconjunto confiável (nome, raça, classes/nível, atributos, PV
 * aproximado, retrato). CA não é calculada (depende de itens equipados, feats
 * etc. — pouco confiável) — fica pra preencher/editar à mão.
 *
 * O schema do DDB é grande e não-oficial; tudo aqui tolera campos ausentes.
 */

const ABILITY_BY_ID: Record<number, { key: AbilityKey; ddb: string }> = {
  1: { key: 'str', ddb: 'strength' },
  2: { key: 'dex', ddb: 'dexterity' },
  3: { key: 'con', ddb: 'constitution' },
  4: { key: 'int', ddb: 'intelligence' },
  5: { key: 'wis', ddb: 'wisdom' },
  6: { key: 'cha', ddb: 'charisma' },
}

interface StatEntry {
  id?: number
  value?: number | null
}

interface DdbModifier {
  type?: string
  subType?: string
  value?: number | null
}

/** Desembrulha `{ success, data: {...} }` do endpoint, ou aceita o objeto cru. */
export function extractDdbData(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') throw new Error('JSON inválido.')
  const obj = raw as Record<string, unknown>
  if (obj.data && typeof obj.data === 'object') return obj.data as Record<string, unknown>
  return obj
}

function statValue(stats: unknown, id: number): number | null {
  if (!Array.isArray(stats)) return null
  const entry = (stats as StatEntry[]).find((s) => s?.id === id)
  return typeof entry?.value === 'number' ? entry.value : null
}

function allModifiers(c: Record<string, unknown>): DdbModifier[] {
  const m = (c.modifiers ?? {}) as Record<string, unknown>
  const groups = ['race', 'class', 'background', 'item', 'feat', 'condition']
  const out: DdbModifier[] = []
  for (const g of groups) {
    const arr = m[g]
    if (Array.isArray(arr)) out.push(...(arr as DdbModifier[]))
  }
  return out
}

function abilityScore(c: Record<string, unknown>, id: number): number {
  const base = statValue(c.stats, id) ?? 10
  const bonus = statValue(c.bonusStats, id) ?? 0
  const override = statValue(c.overrideStats, id)
  if (override != null) return override

  const ddbName = ABILITY_BY_ID[id]!.ddb
  let total = base + bonus
  for (const mod of allModifiers(c)) {
    if (mod?.subType !== `${ddbName}-score`) continue
    if (mod.type === 'bonus' && typeof mod.value === 'number') total += mod.value
    else if (mod.type === 'set' && typeof mod.value === 'number') total = Math.max(total, mod.value)
  }
  return total
}

function parseAbilities(c: Record<string, unknown>): AbilityScores {
  const out = {} as AbilityScores
  for (const idStr of Object.keys(ABILITY_BY_ID)) {
    const id = Number(idStr)
    out[ABILITY_BY_ID[id]!.key] = abilityScore(c, id)
  }
  return out
}

function parseClasses(c: Record<string, unknown>): CharacterClass[] {
  const raw = c.classes
  if (!Array.isArray(raw)) return []
  return (raw as Record<string, unknown>[])
    .map((cl) => {
      const def = (cl.definition ?? {}) as Record<string, unknown>
      const sub = (cl.subclassDefinition ?? {}) as Record<string, unknown>
      const name = typeof def.name === 'string' ? def.name : 'Classe'
      const level = typeof cl.level === 'number' ? cl.level : 0
      const subclass = typeof sub.name === 'string' ? sub.name : undefined
      return { name, level, ...(subclass ? { subclass } : {}) }
    })
    .filter((cl) => cl.level > 0)
}

function parseRace(c: Record<string, unknown>): string | undefined {
  const race = (c.race ?? {}) as Record<string, unknown>
  if (typeof race.fullName === 'string') return race.fullName
  if (typeof race.baseRaceName === 'string') return race.baseRaceName
  return undefined
}

function parseHp(c: Record<string, unknown>, abilities: AbilityScores, level: number) {
  const override = typeof c.overrideHitPoints === 'number' ? c.overrideHitPoints : null
  const base = typeof c.baseHitPoints === 'number' ? c.baseHitPoints : null
  const bonus = typeof c.bonusHitPoints === 'number' ? c.bonusHitPoints : 0
  const removed = typeof c.removedHitPoints === 'number' ? c.removedHitPoints : 0

  let maxHp: number | undefined
  if (override != null) maxHp = override
  else if (base != null) maxHp = base + abilityMod(abilities.con) * level + bonus

  if (maxHp == null) return { hp: undefined, maxHp: undefined }
  maxHp = Math.max(1, maxHp)
  const hp = Math.max(0, maxHp - removed)
  return { hp, maxHp }
}

function newId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
  return c?.randomUUID ? c.randomUUID() : `c-${Math.abs(Date.now() ^ Math.floor(Math.random() * 1e9))}`
}

/** Converte um objeto de personagem do DDB num BriefingCharacter. */
export function parseDdbCharacter(raw: unknown): BriefingCharacter {
  const c = extractDdbData(raw)
  const name = typeof c.name === 'string' && c.name.trim() ? c.name.trim() : null
  if (!name) throw new Error('Não encontrei o nome do personagem no JSON.')

  const classes = parseClasses(c)
  const level = classes.reduce((sum, cl) => sum + cl.level, 0) || 1
  const abilities = parseAbilities(c)
  const { hp, maxHp } = parseHp(c, abilities, level)
  const decorations = (c.decorations ?? {}) as Record<string, unknown>
  const avatarUrl = typeof decorations.avatarUrl === 'string' ? decorations.avatarUrl : undefined

  const notes = (c.notes ?? {}) as Record<string, unknown>
  const backstory =
    typeof notes.backstory === 'string' && notes.backstory.trim() ? notes.backstory.trim() : undefined

  return {
    id: newId(),
    name,
    ...(parseRace(c) ? { race: parseRace(c) } : {}),
    classes,
    level,
    abilities,
    ...(hp !== undefined ? { hp } : {}),
    ...(maxHp !== undefined ? { maxHp } : {}),
    ...(avatarUrl ? { avatarUrl } : {}),
    ...(backstory ? { backstory } : {}),
    source: 'ddb',
  }
}

/** Parseia texto JSON colado (lança erro amigável se inválido). */
export function parseDdbJson(text: string): BriefingCharacter {
  let obj: unknown
  try {
    obj = JSON.parse(text)
  } catch {
    throw new Error('JSON inválido — copie o objeto do personagem do D&D Beyond.')
  }
  return parseDdbCharacter(obj)
}
