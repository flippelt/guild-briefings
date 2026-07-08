/**
 * Ícone de d20 (icosaedro em vista 3/4, SEM números) — silhueta em traço.
 * Geometria derivada da projeção real de um icosaedro (eixo de face 3-dobras,
 * com remoção de linhas ocultas), orientada com um vértice no topo: face
 * superior, linha equatorial, face central apontando para baixo e a tampa
 * inferior — o visual clássico de um dado d20, com as faces proporcionais.
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
      {/* contorno hexagonal (silhueta do icosaedro) */}
      <polygon points="50,6 88,28 88,72 50,94 12,72 12,28" />
      {/* linha equatorial */}
      <line x1="26.5" y1="36.4" x2="73.5" y2="36.4" />
      {/* face superior (triângulo do topo) */}
      <line x1="50" y1="6" x2="26.5" y2="36.4" />
      <line x1="50" y1="6" x2="73.5" y2="36.4" />
      {/* ombros até o equador */}
      <line x1="12" y1="28" x2="26.5" y2="36.4" />
      <line x1="88" y1="28" x2="73.5" y2="36.4" />
      {/* laterais inferiores até o equador */}
      <line x1="12" y1="72" x2="26.5" y2="36.4" />
      <line x1="88" y1="72" x2="73.5" y2="36.4" />
      {/* face central apontando para baixo */}
      <line x1="26.5" y1="36.4" x2="50" y2="77.2" />
      <line x1="73.5" y1="36.4" x2="50" y2="77.2" />
      {/* tampa inferior (até o vértice de baixo) */}
      <line x1="50" y1="77.2" x2="50" y2="94" />
      <line x1="12" y1="72" x2="50" y2="77.2" />
      <line x1="88" y1="72" x2="50" y2="77.2" />
    </svg>
  )
}
