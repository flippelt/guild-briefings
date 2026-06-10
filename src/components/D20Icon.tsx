/**
 * Ícone de d20 (icosaedro em vista de topo, SEM números) — silhueta em traço.
 * Herda a cor via `currentColor` e dimensiona por `font-size` (svg = 1em).
 * Usado como brasão alternativo da companhia (briefing.crest === 'd20').
 */
export function D20Icon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="4.5"
      strokeLinejoin="round"
      strokeLinecap="round"
      role="img"
      aria-hidden="true"
    >
      {/* contorno hexagonal */}
      <polygon points="50,4 90,27 90,73 50,96 10,73 10,27" />
      {/* face superior (triângulo central) */}
      <polygon points="50,30 74,70 26,70" />
      {/* arestas que sugerem as faces ao redor */}
      <line x1="50" y1="4" x2="50" y2="30" />
      <line x1="90" y1="27" x2="74" y2="70" />
      <line x1="10" y1="27" x2="26" y2="70" />
      <line x1="50" y1="96" x2="26" y2="70" />
      <line x1="50" y1="96" x2="74" y2="70" />
    </svg>
  )
}
