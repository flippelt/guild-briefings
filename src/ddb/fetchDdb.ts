import type { BriefingCharacter } from '../types'
import { parseDdbCharacter } from './parseDdb'

/** Extrai o ID numérico do personagem de um link do D&D Beyond (ou aceita o
 *  próprio ID). Ex.: https://www.dndbeyond.com/characters/123456789 → "123456789". */
export function extractCharacterId(input: string): string | null {
  const s = (input ?? '').trim()
  if (/^\d+$/.test(s)) return s
  const m = s.match(/dndbeyond\.com\/characters\/(\d+)/i)
  if (m) return m[1]!
  const m2 = s.match(/character\/v\d+\/character\/(\d+)/i)
  if (m2) return m2[1]!
  return null
}

async function tryFetchJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

/**
 * Busca a ficha pública do D&D Beyond a partir de um link/ID. Tenta, em ordem:
 *  1. direto (caso o endpoint permita CORS);
 *  2. a Netlify Function do próprio deploy (`/.netlify/functions/ddb-character`);
 *  3. um proxy público de CORS (fallback pra dev/demo).
 * O personagem precisa estar marcado como **público** no D&D Beyond.
 */
export async function fetchDdbCharacter(input: string): Promise<BriefingCharacter> {
  const id = extractCharacterId(input)
  if (!id) {
    throw new Error('Link/ID não reconhecido. Cole o endereço do personagem no D&D Beyond.')
  }

  const direct = `https://character-service.dndbeyond.com/character/v5/character/${id}`
  const candidates = [
    direct,
    `/.netlify/functions/ddb-character?id=${id}`,
    `https://corsproxy.io/?url=${encodeURIComponent(direct)}`,
  ]

  for (const url of candidates) {
    const data = await tryFetchJson(url)
    if (data == null) continue
    try {
      return parseDdbCharacter(data)
    } catch {
      // resposta veio mas não é uma ficha válida (erro/privado) — tenta a próxima
    }
  }

  throw new Error(
    'Não consegui buscar a ficha. Confirme que o personagem está público — ou cole o JSON manualmente.',
  )
}
