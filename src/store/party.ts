import { useCallback, useEffect, useState } from 'react'
import type { BriefingCharacter } from '../types'

const KEY = 'guild.party.v1'

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
