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
  /** Party/equipe a que pertence (id em Briefing.parties). */
  partyId?: string
  /** História/background do personagem (mostrada ao abrir o cartaz). */
  backstory?: string
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

// ---------- Parties / equipes ----------

export interface Party {
  id: string
  name: string
}

// ---------- Quests ----------

export type QuestStatus = 'ativa' | 'pausada' | 'parcial' | 'concluida'

/** Guilda emissora específica de uma quest (sobrepõe a escolha por seed). Mantém
 *  conteúdo de campanha (ex.: guildas privadas) fora do código, no briefing.json. */
export interface GuildOverride {
  name: string
  motto: string
  signer: string
  role: string
  signFont: string
  /** Símbolo do selo/carimbo (padrão ✦/★). */
  glyph?: string
  /** Forma da cera (1–6); se ausente, deriva do seed. */
  variant?: number
}

export interface Quest {
  id: string
  title: string
  /** Objetivo/descrição curta. */
  objective?: string
  status: QuestStatus
  /** Guilda emissora específica (sobrepõe a escolha por seed). */
  guild?: GuildOverride
  /** Recompensa prometida. */
  reward?: string
  /** Party encarregada (id em Briefing.parties) — mostra o nome da equipe. */
  partyId?: string
  /** Aventureiros avulsos encarregados (ids) — quando não é uma party. */
  adventurerIds?: string[]
  notes?: string
}

export const QUEST_STATUS_LABEL: Record<QuestStatus, string> = {
  ativa: 'Ativa',
  pausada: 'Em espera',
  parcial: 'Parcial',
  concluida: 'Concluída',
}

export const QUEST_STATUSES: QuestStatus[] = ['ativa', 'pausada', 'parcial', 'concluida']

// ---------- Crônicas / recontagens ----------

export interface Recap {
  id: string
  title: string
  /** Data/sessão (texto livre: "Sessão 12" ou "14 Mirtul"). */
  date?: string
  body: string
}

// ---------- Briefing (bundle persistido / seed) ----------

export interface Briefing {
  party: BriefingCharacter[]
  parties: Party[]
  quests: Quest[]
  recaps: Recap[]
  /** Nome da companhia/guilda (cabeçalho). */
  guildName?: string
  /** Brasão exibido no topo: flor-de-lis (padrão) ou d20. */
  crest?: 'fleur' | 'd20'
  /** Título exibido no boot (padrão "GUILD BRIEFINGS"). */
  bootTitle?: string
  /** Versão dos dados (epoch ms). O app re-semeia do deploy quando a versão do
   *  briefing.json publicado é maior que a guardada no localStorage. O export
   *  carimba uma versão nova automaticamente. */
  version?: number
}

export const EMPTY_BRIEFING: Briefing = { party: [], parties: [], quests: [], recaps: [] }

/** Texto de quem está encarregado de uma quest: nome da party, ou nomes dos
 *  aventureiros avulsos. Vazio se ninguém atribuído. */
export function questAssignee(
  q: Quest,
  parties: Party[],
  party: BriefingCharacter[],
): string {
  if (q.partyId) {
    const p = parties.find((x) => x.id === q.partyId)
    if (p) return p.name
  }
  if (q.adventurerIds && q.adventurerIds.length > 0) {
    const names = q.adventurerIds
      .map((id) => party.find((c) => c.id === id)?.name)
      .filter((n): n is string => !!n)
    if (names.length > 0) return names.join(', ')
  }
  return ''
}
