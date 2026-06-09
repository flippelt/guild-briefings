import { useState } from 'react'
import type { BriefingCharacter } from '../types'
import { parseDdbJson } from '../ddb/parseDdb'

/**
 * Import por JSON colado do D&D Beyond. Sem fetch (evita CORS/ToS): o usuário
 * abre o JSON público do personagem e cola aqui.
 */
export function ImportPanel({ onImport }: { onImport: (c: BriefingCharacter) => void }) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const importNow = () => {
    setError(null)
    try {
      onImport(parseDdbJson(text))
      setText('')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <details className="panel">
      <summary>Importar do D&amp;D Beyond</summary>
      <div className="panel__body">
        <p className="muted">
          Abra o personagem (precisa estar <strong>público</strong>) em
          {' '}
          <code>character-service.dndbeyond.com/character/v5/character/&lt;ID&gt;</code>, copie todo
          o JSON e cole abaixo. O ID está na URL da ficha no D&amp;D Beyond.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Cole o JSON do personagem aqui…'
          rows={6}
          spellCheck={false}
        />
        <div className="row">
          <button onClick={importNow} disabled={!text.trim()}>Importar</button>
          {error && <span className="error">{error}</span>}
        </div>
      </div>
    </details>
  )
}
