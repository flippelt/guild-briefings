import { useState } from 'react'
import type { CSSProperties } from 'react'
import { D20Icon } from './D20Icon'

const LINES = [
  'Acendem-se as velas do salão…',
  'O grande livro é aberto sobre a mesa…',
  'A companhia é convocada.',
]

/**
 * Abertura diegética. As linhas são "escritas" por uma varredura de máscara da
 * esquerda pra direita, com a borda da frente suave — simula a pena correndo e
 * a tinta assentando no papel (em vez do pop digital, letra a letra).
 */
export function BootScreen({ onDone, crest }: { onDone: () => void; crest?: 'fleur' | 'd20' }) {
  const [line, setLine] = useState(0)

  const handleEnd = () => {
    if (line < LINES.length - 1) setTimeout(() => setLine((l) => l + 1), 360)
    else setTimeout(onDone, 750)
  }

  const current = LINES[line] ?? ''
  // Duração proporcional ao tamanho da linha → ritmo de escrita constante.
  const dur = `${Math.max(1, current.length * 0.085).toFixed(2)}s`

  return (
    <div className="boot" onClick={onDone} role="button" aria-label="Pular abertura">
      <div className="boot__sigil" aria-hidden="true">{crest === 'd20' ? <D20Icon /> : '⚜'}</div>
      <h1 className="boot__title">GUILD BRIEFINGS</h1>
      <div className="boot__lines">
        {LINES.slice(0, line).map((l) => (
          <p key={l} className="boot__line boot__line--done">{l}</p>
        ))}
        <p
          key={line}
          className="boot__line boot__line--writing"
          style={{ '--dur': dur } as CSSProperties}
          onAnimationEnd={handleEnd}
        >
          {current}
        </p>
      </div>
      <p className="boot__skip">toque para entrar</p>
    </div>
  )
}
