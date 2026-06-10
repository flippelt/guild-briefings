import { useState } from 'react'
import type { Recap } from '../types'

export function RecapCard({
  r,
  onUpdate,
  onRemove,
}: {
  r: Recap
  onUpdate: (patch: Partial<Recap>) => void
  onRemove: () => void
}) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <article className="recap recap--editing">
        <input defaultValue={r.title} onChange={(e) => onUpdate({ title: e.target.value })} placeholder="Título" />
        <input defaultValue={r.date ?? ''} onChange={(e) => onUpdate({ date: e.target.value || undefined })} placeholder="Sessão / data" />
        <textarea defaultValue={r.body} rows={5} onChange={(e) => onUpdate({ body: e.target.value })} placeholder="O que aconteceu…" />
        <div className="row">
          <button onClick={() => setEditing(false)}>concluir</button>
          <button className="ghost danger" onClick={onRemove}>remover</button>
        </div>
      </article>
    )
  }

  return (
    <article className="recap">
      <div className="recap__head">
        <h3 className="recap__title">{r.title}</h3>
        {r.date && <span className="recap__date">{r.date}</span>}
      </div>
      <p className="recap__body">{r.body}</p>
      <div className="recap__actions">
        <button className="ghost" onClick={() => setEditing(true)}>editar</button>
      </div>
    </article>
  )
}
