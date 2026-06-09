import { useCallback, useEffect, useState } from 'react'
import type { BriefingCharacter } from '../types'

const KEY = 'guild.party.v1'
const SEEDED_KEY = 'guild.seeded.v1'

function load(): BriefingCharacter[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? (data as BriefingCharacter[]) : []
  } catch {
    return []
  }
}

const newId = () => {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
  return c?.randomUUID ? c.randomUUID() : `s-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
}

/** Normaliza uma party vinda de `party.json` (seed) — garante id/campos. */
export function normalizeSeed(data: unknown): BriefingCharacter[] {
  if (!Array.isArray(data)) return []
  return data
    .filter((c): c is Record<string, unknown> => !!c && typeof c === 'object' && typeof c.name === 'string')
    .map((c) => ({
      ...(c as unknown as BriefingCharacter),
      id: typeof c.id === 'string' && c.id ? c.id : newId(),
      classes: Array.isArray(c.classes) ? (c.classes as BriefingCharacter['classes']) : [],
      level: typeof c.level === 'number' ? c.level : 1,
      source: c.source === 'ddb' ? 'ddb' : 'manual',
    }))
}

/** Estado da party persistido no dispositivo (localStorage). */
export function useParty() {
  const [party, setParty] = useState<BriefingCharacter[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(party))
    } catch {
      // localStorage indisponível: ignora.
    }
  }, [party])

  // Seed inicial: numa primeira visita (sem nada salvo), tenta carregar uma
  // party.json embutida na build (deploys privados põem a party real lá). Só
  // tenta UMA vez — limpar o dossiê depois não re-semeia.
  useEffect(() => {
    if (localStorage.getItem(SEEDED_KEY)) return
    if (load().length > 0) {
      localStorage.setItem(SEEDED_KEY, '1')
      return
    }
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}party.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return
        const seed = normalizeSeed(data)
        if (seed.length > 0) setParty(seed)
      })
      .catch(() => {})
      .finally(() => {
        try {
          localStorage.setItem(SEEDED_KEY, '1')
        } catch {
          /* ignora */
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const add = useCallback((c: BriefingCharacter) => setParty((p) => [...p, c]), [])
  const update = useCallback(
    (id: string, patch: Partial<BriefingCharacter>) =>
      setParty((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c))),
    [],
  )
  const remove = useCallback((id: string) => setParty((p) => p.filter((c) => c.id !== id)), [])
  const clear = useCallback(() => setParty([]), [])

  return { party, add, update, remove, clear }
}
