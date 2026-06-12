import { useState } from 'react'

/** Botão "Publicar" — envia o estado atual pra todos os aparelhos (mesa).
 *  Aparece só quando a publicação está configurada (backend da mesa). */
export function PublishButton({
  onPublish,
  label = '⇪ publicar',
}: {
  onPublish: () => Promise<{ ok: boolean; error?: string }>
  label?: string
}) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const go = async () => {
    if (busy) return
    setBusy(true)
    setMsg('')
    const r = await onPublish()
    setBusy(false)
    if (r.error === 'cancelado') return
    setMsg(r.ok ? '✓ publicado' : r.error || 'falhou')
    if (r.ok) setTimeout(() => setMsg(''), 2500)
  }

  return (
    <span className="publish">
      <button className="ghost" onClick={go} disabled={busy} title="Publicar tudo pra todos os aparelhos da mesa">
        {busy ? 'publicando…' : label}
      </button>
      {msg && <span className="publish__msg muted">{msg}</span>}
    </span>
  )
}
