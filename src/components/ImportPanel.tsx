import { useState } from 'react'
import type { BriefingCharacter } from '../types'
import { parseDdbJson } from '../ddb/parseDdb'
import { fetchDdbCharacter } from '../ddb/fetchDdb'

/**
 * Import do D&D Beyond: cola-se o LINK do personagem (público) e o app busca o
 * JSON (direto / função do Netlify / proxy). "Colar JSON" fica como fallback.
 */
export function ImportPanel({ onImport }: { onImport: (c: BriefingCharacter) => void }) {
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paste, setPaste] = useState('')
  const [pasteError, setPasteError] = useState<string | null>(null)

  const fetchNow = async () => {
    if (!link.trim() || loading) return
    setError(null)
    setLoading(true)
    try {
      onImport(await fetchDdbCharacter(link))
      setLink('')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const importPaste = () => {
    setPasteError(null)
    try {
      onImport(parseDdbJson(paste))
      setPaste('')
    } catch (e) {
      setPasteError((e as Error).message)
    }
  }

  return (
    <details className="panel">
      <summary>Importar do D&amp;D Beyond</summary>
      <div className="panel__body">
        <p className="muted">
          Cole o <strong>link do personagem</strong> (precisa estar <strong>público</strong>) e
          busque a ficha. Ex.: <code>dndbeyond.com/characters/123456789</code>
        </p>
        <div className="row">
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchNow()}
            placeholder="https://www.dndbeyond.com/characters/…"
            style={{ flex: 1, minWidth: 180 }}
          />
          <button onClick={fetchNow} disabled={loading || !link.trim()}>
            {loading ? 'Buscando…' : 'Buscar'}
          </button>
        </div>
        {error && <span className="error">{error}</span>}

        <details className="subpanel">
          <summary>ou colar o JSON manualmente</summary>
          <div className="subpanel__body">
            <textarea
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              placeholder='Cole o JSON do personagem (ex.: {"name":"…",…})'
              rows={5}
              spellCheck={false}
            />
            <div className="row">
              <button onClick={importPaste} disabled={!paste.trim()}>Importar JSON</button>
              {pasteError && <span className="error">{pasteError}</span>}
            </div>
          </div>
        </details>
      </div>
    </details>
  )
}
