import { useCallback, useEffect, useState } from 'react'
import type { Briefing, BriefingCharacter, GuildOverride, Party, Quest, Recap } from '../types'
import { EMPTY_BRIEFING } from '../types'

const KEY = 'guild.briefing.v2'

/** Modo demonstração (ativado no build do GitHub Pages via VITE_DEMO): nada é
 *  salvo e a party demo recarrega a cada acesso. */
export const DEMO_MODE = import.meta.env.VITE_DEMO === 'true'

export const newId = (): string => {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
  return c?.randomUUID ? c.randomUUID() : `g-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
}

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object'
}

/** Normaliza a guilda emissora inline de uma quest (override do briefing.json). */
function normGuild(g: Record<string, unknown>): GuildOverride {
  const s = (k: string) => (typeof g[k] === 'string' ? (g[k] as string) : '')
  return {
    name: s('name'),
    motto: s('motto'),
    signer: s('signer'),
    role: s('role'),
    signFont: s('signFont') || "'EB Garamond', serif",
    ...(typeof g.glyph === 'string' ? { glyph: g.glyph } : {}),
    ...(typeof g.variant === 'number' ? { variant: g.variant } : {}),
  }
}

function normChar(c: Record<string, unknown>): BriefingCharacter {
  return {
    ...(c as unknown as BriefingCharacter),
    id: typeof c.id === 'string' && c.id ? c.id : newId(),
    name: typeof c.name === 'string' ? c.name : 'Sem nome',
    classes: Array.isArray(c.classes) ? (c.classes as BriefingCharacter['classes']) : [],
    level: typeof c.level === 'number' ? c.level : 1,
    source: c.source === 'ddb' ? 'ddb' : 'manual',
  }
}

/** Aceita o bundle { party, quests, recaps } OU um array legado (= party). */
export function normalizeBriefing(data: unknown): Briefing {
  const obj: Record<string, unknown> = Array.isArray(data)
    ? { party: data }
    : isObj(data)
      ? data
      : {}
  const party = Array.isArray(obj.party) ? obj.party.filter(isObj).map(normChar) : []
  const parties = Array.isArray(obj.parties)
    ? (obj.parties as unknown[]).filter(isObj).map((p) => ({
        id: typeof p.id === 'string' && p.id ? p.id : newId(),
        name: typeof p.name === 'string' ? p.name : 'Party',
      })) as Party[]
    : []
  const quests = Array.isArray(obj.quests)
    ? (obj.quests as unknown[]).filter(isObj).map((q) => ({
        id: typeof q.id === 'string' && q.id ? q.id : newId(),
        title: typeof q.title === 'string' ? q.title : 'Quest',
        status:
          q.status === 'pausada' || q.status === 'concluida' || q.status === 'parcial'
            ? q.status
            : 'ativa',
        ...(typeof q.objective === 'string' ? { objective: q.objective } : {}),
        ...(typeof q.reward === 'string' ? { reward: q.reward } : {}),
        ...(typeof q.partyId === 'string' ? { partyId: q.partyId } : {}),
        ...(Array.isArray(q.adventurerIds)
          ? { adventurerIds: (q.adventurerIds as unknown[]).filter((x): x is string => typeof x === 'string') }
          : {}),
        ...(typeof q.notes === 'string' ? { notes: q.notes } : {}),
        ...(isObj(q.guild) && typeof q.guild.name === 'string' && q.guild.name
          ? { guild: normGuild(q.guild) }
          : {}),
      })) as Quest[]
    : []
  const recaps = Array.isArray(obj.recaps)
    ? (obj.recaps as unknown[]).filter(isObj).map((r) => ({
        id: typeof r.id === 'string' && r.id ? r.id : newId(),
        title: typeof r.title === 'string' ? r.title : 'Crônica',
        body: typeof r.body === 'string' ? r.body : '',
        ...(typeof r.date === 'string' ? { date: r.date } : {}),
      })) as Recap[]
    : []
  const guildName = typeof obj.guildName === 'string' ? obj.guildName : undefined
  const crest = obj.crest === 'd20' ? 'd20' : undefined
  const bootTitle = typeof obj.bootTitle === 'string' && obj.bootTitle.trim() ? obj.bootTitle.trim() : undefined
  const version = typeof obj.version === 'number' ? obj.version : 0
  return { party, parties, quests, recaps, version, ...(guildName ? { guildName } : {}), ...(crest ? { crest } : {}), ...(bootTitle ? { bootTitle } : {}) }
}

function load(): Briefing {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return normalizeBriefing(JSON.parse(raw))
  } catch {
    /* ignora */
  }
  return { ...EMPTY_BRIEFING }
}

export function useBriefing() {
  const [briefing, setBriefing] = useState<Briefing>(() => (DEMO_MODE ? { ...EMPTY_BRIEFING } : load()))

  useEffect(() => {
    if (DEMO_MODE) return // demo não persiste
    try {
      localStorage.setItem(KEY, JSON.stringify(briefing))
    } catch {
      /* ignora */
    }
  }, [briefing])

  // Carrega o briefing.json do deploy a cada início e adota se:
  //  - o storage local está vazio (1ª visita), OU
  //  - a versão publicada é mais nova que a guardada (auto-refresh entre
  //    aparelhos: publicar dados novos atualiza todos, sem limpar localStorage).
  // Caso contrário, mantém o estado local (edições não publicadas são preservadas).
  // No modo demo, o estado começa vazio → sempre adota o briefing.json.
  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}briefing.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || data == null) return
        const seed = normalizeBriefing(data)
        const hasContent = seed.party.length || seed.quests.length || seed.recaps.length
        if (!hasContent) return
        setBriefing((cur) => {
          const curEmpty = !(cur.party.length || cur.quests.length || cur.recaps.length)
          const newer = (seed.version ?? 0) > (cur.version ?? 0)
          return curEmpty || newer ? seed : cur
        })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const patch = useCallback((p: Partial<Briefing>) => setBriefing((b) => ({ ...b, ...p })), [])

  return {
    briefing,
    setGuildName: useCallback((name: string) => patch({ guildName: name || undefined }), [patch]),

    addCharacter: useCallback((c: BriefingCharacter) => setBriefing((b) => ({ ...b, party: [...b.party, c] })), []),
    updateCharacter: useCallback(
      (id: string, p: Partial<BriefingCharacter>) =>
        setBriefing((b) => ({ ...b, party: b.party.map((c) => (c.id === id ? { ...c, ...p } : c)) })),
      [],
    ),
    removeCharacter: useCallback(
      (id: string) =>
        setBriefing((b) => ({
          ...b,
          party: b.party.filter((c) => c.id !== id),
          quests: b.quests.map((q) =>
            q.adventurerIds?.includes(id)
              ? { ...q, adventurerIds: q.adventurerIds.filter((x) => x !== id) }
              : q,
          ),
        })),
      [],
    ),

    addParty: useCallback(
      (name: string) =>
        setBriefing((b) => ({ ...b, parties: [...b.parties, { id: newId(), name }] })),
      [],
    ),
    renameParty: useCallback(
      (id: string, name: string) =>
        setBriefing((b) => ({ ...b, parties: b.parties.map((p) => (p.id === id ? { ...p, name } : p)) })),
      [],
    ),
    removeParty: useCallback(
      (id: string) =>
        setBriefing((b) => ({
          ...b,
          parties: b.parties.filter((p) => p.id !== id),
          party: b.party.map((c) => (c.partyId === id ? { ...c, partyId: undefined } : c)),
          quests: b.quests.map((q) => (q.partyId === id ? { ...q, partyId: undefined } : q)),
        })),
      [],
    ),

    addQuest: useCallback((q: Quest) => setBriefing((b) => ({ ...b, quests: [...b.quests, q] })), []),
    updateQuest: useCallback(
      (id: string, p: Partial<Quest>) =>
        setBriefing((b) => ({ ...b, quests: b.quests.map((q) => (q.id === id ? { ...q, ...p } : q)) })),
      [],
    ),
    removeQuest: useCallback(
      (id: string) => setBriefing((b) => ({ ...b, quests: b.quests.filter((q) => q.id !== id) })),
      [],
    ),

    addRecap: useCallback((r: Recap) => setBriefing((b) => ({ ...b, recaps: [r, ...b.recaps] })), []),
    updateRecap: useCallback(
      (id: string, p: Partial<Recap>) =>
        setBriefing((b) => ({ ...b, recaps: b.recaps.map((r) => (r.id === id ? { ...r, ...p } : r)) })),
      [],
    ),
    removeRecap: useCallback(
      (id: string) => setBriefing((b) => ({ ...b, recaps: b.recaps.filter((r) => r.id !== id) })),
      [],
    ),

    clearAll: useCallback(() => setBriefing({ ...EMPTY_BRIEFING }), []),
  }
}
