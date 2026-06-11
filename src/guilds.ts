/** Guildas/quest givers e seus lemas — usados no carimbo do Salão e no selo de
 *  cera da quest aberta. Escolha determinística pelo seed (id da quest). */
import type { GuildOverride } from './types'

export interface Guild {
  name: string
  motto: string
  /** Quest giver que "assina" o pergaminho (assinatura fictícia). */
  signer: string
  /** Cargo do assinante na guilda (fonte normal, sob a assinatura). */
  role: string
  /** Fonte de assinatura (varia por quest giver). */
  signFont: string
  /** Símbolo do selo/carimbo (padrão ✦ no selo, ★ no carimbo). */
  glyph?: string
}

export const GUILDS: Guild[] = [
  { name: 'Guilda dos Aventureiros', motto: 'À glória e ao butim', signer: 'Aldous Vane', role: 'Mestre da Guilda', signFont: "'Bastliga One', cursive" },
  { name: 'Guilda do Comércio', motto: 'Toda dívida se paga', signer: 'Vex Marlowe', role: 'Mestre Mercador', signFont: "'Autograf', cursive" },
  { name: 'Guarda Real', motto: 'Pela coroa e a lei', signer: 'Sera Dunholt', role: 'Capitã da Guarda Real', signFont: "'The Scientist', cursive" },
  { name: 'Ordem da Bússola', motto: 'Sempre adiante', signer: 'Ravia Korr', role: 'Mestra da Ordem', signFont: "'Attallia', cursive" },
  { name: 'Círculo Arcano', motto: 'O saber sela o pacto', signer: 'Lyrith Mourn', role: 'Arquimaga do Círculo', signFont: "'Patricia Wilcie', cursive" },
  { name: 'Conselho Real', motto: 'Pelo bem do reino', signer: 'Loras Venn', role: 'Conselheiro Real', signFont: "'Montreuil', cursive" },
  { name: 'Guarda da Cidade', motto: 'Vigília sobre os muros', signer: 'Bram Holt', role: 'Capitão da Guarda', signFont: "'Honofly', cursive" },
]

export function guildForSeed(seed: string): { guild: Guild; variant: number } {
  const h = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0)
  return { guild: GUILDS[h % GUILDS.length]!, variant: (h % 6) + 1 }
}

/** Guilda de uma quest: usa o override do briefing (se houver) ou escolhe pelo
 *  seed (id). O override mantém guildas de campanha fora do código. */
export function guildForQuest(q: { id: string; guild?: GuildOverride }): { guild: Guild; variant: number } {
  const base = guildForSeed(q.id)
  if (q.guild && q.guild.name) {
    const { variant, ...g } = q.guild
    return { guild: g, variant: variant ?? base.variant }
  }
  return base
}
