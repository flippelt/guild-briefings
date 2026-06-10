import { guildForSeed } from '../guilds'

/**
 * Selo de cera (cera em CSS + camada SVG gravada em relevo): guilda emissora,
 * lema, "CONCLUÍDA" e enfeites — tudo no MESMO material da cera, "elevado" pelo
 * filtro #waxEmboss. Geometria ancorada no centro (60,60): guilda e lema com o
 * centro do texto sobre o MESMO raio (47) via dominant-baseline central, e
 * "CONCLUÍDA" exatamente no centro, dentro do anel interno. Vai no rodapé do
 * pergaminho da quest aberta. Guilda/forma variam pelo seed (id da quest).
 */
export function QuestSeal({ seed = '' }: { seed?: string }) {
  const { guild, variant } = guildForSeed(seed)
  return (
    <span className={`quest-seal wax--${variant}`} role="img" aria-label={`Concluída — ${guild.name}`}>
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
          <text className="wax__fleur" x="13" y="60">✦</text>
          <text className="wax__fleur" x="107" y="60">✦</text>
          <text className="wax__label" x="60" y="60">CONCLUÍDA</text>
        </g>
      </svg>
    </span>
  )
}
