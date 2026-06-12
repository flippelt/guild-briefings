import { useCallback, useEffect, useRef, useState } from 'react'
import type { Briefing, BriefingCharacter, GuildOverride, Party, Quest, Recap } from '../types'
import { EMPTY_BRIEFING } from '../types'
import { fetchDdbCharacter } from '../ddb/fetchDdb'

const KEY = 'guild.briefing.v2'

/** Modo demonstração (ativado no build do GitHub Pages via VITE_DEMO): nada é
 *  salvo e a party demo recarrega a cada acesso. */
export const DEMO_MODE = import.meta.env.VITE_DEMO === 'true'

// Fonte do seed e publicação. No GitHub Pages (público) ficam só o estático e
// sem publicar; na mesa (Netlify) define-se VITE_BRIEFING_URL=/api/briefing e
// VITE_PUBLISH_URL=/api/publish (ver netlify.toml).
const STATIC_BRIEFING_URL = `${import.meta.env.BASE_URL}briefing.json`
const BRIEFING_SRC = (import.meta.env.VITE_BRIEFING_URL as string | undefined) || STATIC_BRIEFING_URL
const PUBLISH_URL = import.meta.env.VITE_PUBLISH_URL as string | undefined
export const CAN_PUBLISH = !!PUBLISH_URL
const PUBLISH_KEY_STORE = 'guild.publishKey'

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
          q.status === 'pausada' || q.status === 'concluida' || q.status === 'parcial' || q.status === 'falhou'
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
  const isISODate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s)
  const recaps = Array.isArray(obj.recaps)
    ? (obj.recaps as unknown[]).filter(isObj).map((r) => {
        const rawDate = typeof r.date === 'string' ? r.date : undefined
        let session = typeof r.session === 'string' ? r.session : undefined
        let date: string | undefined
        // Migração: o campo antigo `date` era texto livre ("Sessão/data"). Datas
        // ISO viram o seletor; o resto vira `session` (se ainda não houver).
        if (rawDate) {
          if (isISODate(rawDate)) date = rawDate
          else if (!session) session = rawDate
        }
        return {
          id: typeof r.id === 'string' && r.id ? r.id : newId(),
          title: typeof r.title === 'string' ? r.title : 'Crônica',
          body: typeof r.body === 'string' ? r.body : '',
          ...(session ? { session } : {}),
          ...(date ? { date } : {}),
        }
      }) as Recap[]
    : []
  const guildName = typeof obj.guildName === 'string' ? obj.guildName : undefined
  const crest = obj.crest === 'd20' ? 'd20' : undefined
  const bootTitle = typeof obj.bootTitle === 'string' && obj.bootTitle.trim() ? obj.bootTitle.trim() : undefined
  const version = typeof obj.version === 'number' ? obj.version : 0
  const guilds = Array.isArray(obj.guilds)
    ? (obj.guilds as unknown[]).filter(isObj).filter((g) => typeof g.name === 'string' && g.name).map(normGuild)
    : []
  return {
    party, parties, quests, recaps, version,
    ...(guildName ? { guildName } : {}),
    ...(crest ? { crest } : {}),
    ...(bootTitle ? { bootTitle } : {}),
    ...(guilds.length ? { guilds } : {}),
  }
}

/** Mescla por chave: o publicado prevalece nos ids em comum; itens só-locais
 *  (ainda não publicados) são preservados; novos do publicado entram. */
function mergeById<T>(local: T[], seed: T[], key: (x: T) => string): T[] {
  const seedMap = new Map(seed.map((i) => [key(i), i]))
  const used = new Set<string>()
  const out: T[] = local.map((li) => {
    const k = key(li)
    if (seedMap.has(k)) { used.add(k); return seedMap.get(k) as T }
    return li
  })
  for (const si of seed) if (!used.has(key(si))) out.push(si)
  return out
}

/** Adota o conteúdo publicado SEM apagar adições locais ainda não publicadas
 *  (evita perder quests/crônicas/personagens criados no aparelho). */
function mergeBriefing(cur: Briefing, seed: Briefing): Briefing {
  return {
    ...seed,
    party: mergeById(cur.party, seed.party, (c) => c.id),
    parties: mergeById(cur.parties, seed.parties, (p) => p.id),
    quests: mergeById(cur.quests, seed.quests, (q) => q.id),
    recaps: mergeById(cur.recaps, seed.recaps, (r) => r.id),
    ...((cur.guilds?.length || seed.guilds?.length)
      ? { guilds: mergeById(cur.guilds ?? [], seed.guilds ?? [], (g) => g.name) }
      : {}),
    version: seed.version,
  }
}

/** Busca o seed publicado: tenta a fonte ao vivo (função da mesa) e cai pro
 *  briefing.json estático do deploy. */
async function fetchSeedJson(): Promise<unknown | null> {
  const urls = BRIEFING_SRC === STATIC_BRIEFING_URL ? [STATIC_BRIEFING_URL] : [BRIEFING_SRC, STATIC_BRIEFING_URL]
  for (const u of urls) {
    try {
      const r = await fetch(u, { cache: 'no-store' })
      if (!r.ok) continue
      const text = await r.text()
      if (!text.trim()) continue
      return JSON.parse(text)
    } catch {
      /* tenta o próximo */
    }
  }
  return null
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
    fetchSeedJson()
      .then((data) => {
        if (cancelled || data == null) return
        const seed = normalizeBriefing(data)
        const hasContent = seed.party.length || seed.quests.length || seed.recaps.length
        if (!hasContent) return
        setBriefing((cur) => {
          const curEmpty = !(cur.party.length || cur.quests.length || cur.recaps.length)
          if (curEmpty) return seed
          const newer = (seed.version ?? 0) > (cur.version ?? 0)
          // Mescla em vez de substituir: traz as novidades publicadas mas
          // preserva o que foi adicionado localmente e ainda não publicado.
          return newer ? mergeBriefing(cur, seed) : cur
        })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const patch = useCallback((p: Partial<Briefing>) => setBriefing((b) => ({ ...b, ...p })), [])

  // --- Publicação na mesa (backend opcional) + sync de personagens ---
  const briefingRef = useRef(briefing)
  briefingRef.current = briefing
  const autoPublishRef = useRef(false)

  const postPublish = useCallback(
    async (b: Briefing, opts?: { silent?: boolean }): Promise<{ ok: boolean; error?: string }> => {
      if (!PUBLISH_URL) return { ok: false, error: 'Publicação não configurada.' }
      let key = localStorage.getItem(PUBLISH_KEY_STORE) || ''
      if (!key) {
        if (opts?.silent) return { ok: false, error: 'sem senha salva' }
        key = (prompt('Senha de publicação da mesa:') || '').trim()
        if (!key) return { ok: false, error: 'cancelado' }
      }
      const version = Date.now()
      try {
        const r = await fetch(PUBLISH_URL, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-publish-key': key },
          body: JSON.stringify({ ...b, version }),
        })
        if (r.status === 403) {
          localStorage.removeItem(PUBLISH_KEY_STORE)
          return { ok: false, error: 'Senha incorreta.' }
        }
        if (!r.ok) return { ok: false, error: `Falha ao publicar (${r.status}).` }
        localStorage.setItem(PUBLISH_KEY_STORE, key)
        setBriefing((cur) => ({ ...cur, version }))
        return { ok: true }
      } catch {
        return { ok: false, error: 'Sem conexão com o servidor de publicação.' }
      }
    },
    [],
  )

  // Após import/sync, publica em silêncio (só se já houver senha salva).
  useEffect(() => {
    if (!autoPublishRef.current) return
    autoPublishRef.current = false
    if (CAN_PUBLISH) void postPublish(briefing, { silent: true })
  }, [briefing, postPublish])

  return {
    briefing,
    canPublish: CAN_PUBLISH,
    /** Publica o estado atual pra todos os aparelhos (pede senha na 1ª vez). */
    publish: useCallback(() => postPublish(briefingRef.current), [postPublish]),
    /** Importa um personagem (atualiza se já existir o mesmo ddbId) e auto-publica. */
    importCharacter: useCallback((c: BriefingCharacter) => {
      setBriefing((b) => {
        const exists = c.ddbId ? b.party.some((x) => x.ddbId === c.ddbId) : false
        if (exists) {
          const party = b.party.map((x) =>
            x.ddbId === c.ddbId ? { ...c, id: x.id, partyId: x.partyId, notes: x.notes ?? c.notes } : x,
          )
          return { ...b, party }
        }
        return { ...b, party: [...b.party, c] }
      })
      autoPublishRef.current = true
    }, []),
    /** Re-busca os personagens do D&D Beyond (HP, nível…) e auto-publica. */
    syncDdb: useCallback(async (): Promise<{ updated: number; failed: string[] }> => {
      const cur = briefingRef.current
      const ddbIdOf = (c: BriefingCharacter) => c.ddbId || (c.id.startsWith('ddb-') ? c.id.slice(4) : '')
      const targets = cur.party.filter((c) => c.source === 'ddb' && ddbIdOf(c))
      const fresh: Record<string, BriefingCharacter> = {}
      const failed: string[] = []
      for (const c of targets) {
        try {
          fresh[c.id] = await fetchDdbCharacter(ddbIdOf(c))
        } catch {
          failed.push(c.name)
        }
      }
      const updated = Object.keys(fresh).length
      if (updated) {
        const party = cur.party.map((x) => {
          const f = fresh[x.id]
          return f ? { ...f, id: x.id, partyId: x.partyId, notes: x.notes ?? f.notes } : x
        })
        const next: Briefing = { ...cur, party }
        setBriefing(next)
        if (CAN_PUBLISH) await postPublish(next, { silent: true })
      }
      return { updated, failed }
    }, [postPublish]),
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
