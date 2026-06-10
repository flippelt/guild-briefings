import { guildForSeed } from '../guilds'

/**
 * Carimbo de tinta (selo de borracha) do bilhete concluído no Salão.
 * Tudo ancorado no MESMO centro (50,50): guilda e lema têm o centro do texto
 * sobre o MESMO raio (38.5) via dominant-baseline central (a guilda no arco de
 * cima, o lema no de baixo) → simétricos por construção. "CONCLUÍDA" centrado
 * exatamente em (50,50). Tinta com falhas leves (#stampInk).
 */
export function QuestStamp({ seed = '' }: { seed?: string }) {
  const { guild } = guildForSeed(seed)
  return (
    <svg className="qstamp" viewBox="0 0 100 100" role="img" aria-label={`Concluída — ${guild.name}`}>
      <defs>
        <path id="qst-top" d="M 11.5,50 A 38.5,38.5 0 0 1 88.5,50" />
        <path id="qst-bot" d="M 11.5,50 A 38.5,38.5 0 0 0 88.5,50" />
      </defs>
      <g className="qstamp__ink">
        <circle className="qstamp__ring" cx="50" cy="50" r="45" />
        <circle className="qstamp__ring qstamp__ring--in" cx="50" cy="50" r="34" />
        <text className="qstamp__arc">
          <textPath href="#qst-top" startOffset="50%">{guild.name.toUpperCase()}</textPath>
        </text>
        <text className="qstamp__arc qstamp__arc--sm">
          <textPath href="#qst-bot" startOffset="50%">{guild.motto.toUpperCase()}</textPath>
        </text>
        <text className="qstamp__star" x="11.5" y="50">★</text>
        <text className="qstamp__star" x="88.5" y="50">★</text>
        <line className="qstamp__bar" x1="18" y1="44" x2="82" y2="44" />
        <line className="qstamp__bar" x1="18" y1="56" x2="82" y2="56" />
        <text className="qstamp__label" x="50" y="50">CONCLUÍDA</text>
      </g>
    </svg>
  )
}
