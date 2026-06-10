import { useState } from 'react'
import type { BriefingCharacter, Party, Quest, QuestStatus } from '../types'
import { QUEST_STATUS_LABEL, QUEST_STATUSES, questAssignee } from '../types'

export function QuestCard({
  q,
  parties,
  party,
  onUpdate,
  onRemove,
}: {
  q: Quest
  parties: Party[]
  party: BriefingCharacter[]
  onUpdate: (patch: Partial<Quest>) => void
  onRemove: () => void
}) {
  const [editing, setEditing] = useState(false)
  const who = questAssignee(q, parties, party)

  const setParty = (pid: string) =>
    onUpdate({ partyId: pid || undefined, ...(pid ? { adventurerIds: undefined } : {}) })

  const toggleAdv = (id: string) => {
    const cur = q.adventurerIds ?? []
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    onUpdate({ adventurerIds: next.length ? next : undefined })
  }

  if (editing) {
    return (
      <article className="quest quest--editing">
        <input defaultValue={q.title} onChange={(e) => onUpdate({ title: e.target.value })} placeholder="Título" />
        <textarea defaultValue={q.objective ?? ''} rows={2} onChange={(e) => onUpdate({ objective: e.target.value || undefined })} placeholder="Objetivo" />
        <input defaultValue={q.reward ?? ''} onChange={(e) => onUpdate({ reward: e.target.value || undefined })} placeholder="Recompensa" />
        <label className="field">
          <span>Equipe encarregada</span>
          <select value={q.partyId ?? ''} onChange={(e) => setParty(e.target.value)}>
            <option value="">(nenhuma — escolher aventureiros)</option>
            {parties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        {!q.partyId && party.length > 0 && (
          <div className="quest__advpick">
            <span className="field-hint">Aventureiros nesta quest:</span>
            <div className="quest__advlist">
              {party.map((c) => (
                <label key={c.id} className="checkrow">
                  <input
                    type="checkbox"
                    checked={(q.adventurerIds ?? []).includes(c.id)}
                    onChange={() => toggleAdv(c.id)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>
        )}
        <select value={q.status} onChange={(e) => onUpdate({ status: e.target.value as QuestStatus })}>
          {QUEST_STATUSES.map((s) => <option key={s} value={s}>{QUEST_STATUS_LABEL[s]}</option>)}
        </select>
        <div className="row">
          <button onClick={() => setEditing(false)}>concluir</button>
          <button className="ghost danger" onClick={onRemove}>remover</button>
        </div>
      </article>
    )
  }

  return (
    <article className={`quest quest--${q.status}`}>
      <div className="quest__head">
        <span className={`badge badge--${q.status}`}>{QUEST_STATUS_LABEL[q.status]}</span>
        <h3 className="quest__title">{q.title}</h3>
      </div>
      {q.objective && <p className="quest__objective">{q.objective}</p>}
      {who && <p className="quest__who">⚔ {who}</p>}
      {q.reward && <p className="quest__reward">✦ {q.reward}</p>}
      {q.notes && <p className="quest__notes">{q.notes}</p>}
      <div className="quest__actions">
        <button className="ghost" onClick={() => setEditing(true)}>editar</button>
      </div>
    </article>
  )
}
