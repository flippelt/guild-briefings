import type { Quest } from '../types'
import { guildForQuest } from '../guilds'

/**
 * Selo de cera (cera em CSS + camada SVG gravada): guilda emissora, lema,
 * "CONCLUÍDA"/"PARCIAL" e enfeites. Geometria ancorada no centro (60,60):
 * guilda e lema com o centro do texto sobre o MESMO raio (47) via
 * dominant-baseline central, e o rótulo exatamente no centro, dentro do anel
 * interno. Vai no rodapé do pergaminho da quest aberta. Guilda vem do override
 * da quest ou do seed; o enfeite lateral é o glifo da guilda (padrão ✦).
 */
export function QuestSeal({ quest }: { quest: Quest }) {
  const { guild, variant } = guildForQuest(quest)
  const mod = quest.status === 'parcial' ? 'parcial' : quest.status === 'falhou' ? 'falhou' : ''
  const label = mod === 'parcial' ? 'PARCIAL' : mod === 'falhou' ? 'FALHOU' : 'CONCLUÍDA'
  const glyph = guild.glyph ?? '✦'
  return (
    <span
      className={`quest-seal wax--${variant}${mod ? ` quest-seal--${mod}` : ''}`}
      role="img"
      aria-label={`${label} — ${guild.name}`}
    >
      <span className="wax__blob" />
      <svg className="wax__stamp" viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <path id="qs-top" d="M 13,60 A 47,47 0 0 1 107,60" />
          <path id="qs-bot" d="M 13,60 A 47,47 0 0 0 107,60" />
        </defs>
        <g className="wax__engrave">
          <circle className="wax__ring2" cx="60" cy="60" r="53" />
          <circle className="wax__ring2 wax__ring2--in" cx="60" cy="60" r="40" />
          <text className="wax__ring">
            <textPath href="#qs-top" startOffset="50%">{guild.name.toUpperCase()}</textPath>
          </text>
          <text className="wax__motto">
            <textPath href="#qs-bot" startOffset="50%">{guild.motto.toUpperCase()}</textPath>
          </text>
          <text className="wax__fleur" x="13" y="60">{glyph}</text>
          <text className="wax__fleur" x="107" y="60">{glyph}</text>
          <text className="wax__label" x="60" y="60">{label}</text>
        </g>
      </svg>
    </span>
  )
}
