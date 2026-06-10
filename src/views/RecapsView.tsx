import { useState } from 'react'
import type { Recap } from '../types'
import { RecapCard } from '../components/RecapCard'
import { newId } from '../store/briefing'

export function RecapsView({
  recaps,
  onAdd,
  onUpdate,
  onRemove,
}: {
  recaps: Recap[]
  onAdd: (r: Recap) => void
  onUpdate: (id: string, patch: Partial<Recap>) => void
  onRemove: (id: string) => void
}) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [body, setBody] = useState('')

  const add = () => {
    if (!title.trim() || !body.trim()) return
    onAdd({
      id: newId(),
      title: title.trim(),
      body: body.trim(),
      ...(date.trim() ? { date: date.trim() } : {}),
    })
    setTitle('')
    setDate('')
    setBody('')
  }

  return (
    <div className="view">
      <div className="quick-add quick-add--col">
        <div className="row">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título da crônica…" style={{ flex: 2 }} />
          <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="Sessão / data" style={{ flex: 1 }} />
        </div>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="O que aconteceu na sessão…" />
        <button onClick={add} disabled={!title.trim() || !body.trim()}>+ crônica</button>
      </div>

      {recaps.length === 0 ? (
        <p className="empty">Sem crônicas ainda. Registre o que rolou nas sessões.</p>
      ) : (
        <div className="chronicle">
          {recaps.map((r) => (
            <RecapCard key={r.id} r={r} onUpdate={(p) => onUpdate(r.id, p)} onRemove={() => onRemove(r.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
