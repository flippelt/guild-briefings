import { useState } from 'react'
import type { BriefingCharacter, Party, Quest } from '../types'
import { QuestCard } from '../components/QuestCard'
import { newId } from '../store/briefing'

export function QuestsView({
  quests,
  parties,
  party,
  onAdd,
  onUpdate,
  onRemove,
}: {
  quests: Quest[]
  parties: Party[]
  party: BriefingCharacter[]
  onAdd: (q: Quest) => void
  onUpdate: (id: string, patch: Partial<Quest>) => void
  onRemove: (id: string) => void
}) {
  const [title, setTitle] = useState('')
  const [objective, setObjective] = useState('')

  const add = () => {
    if (!title.trim()) return
    onAdd({
      id: newId(),
      title: title.trim(),
      status: 'ativa',
      ...(objective.trim() ? { objective: objective.trim() } : {}),
    })
    setTitle('')
    setObjective('')
  }

  const active = quests.filter((q) => q.status === 'ativa')
  const others = quests.filter((q) => q.status !== 'ativa')

  return (
    <div className="view">
      <div className="quick-add">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nova quest…" onKeyDown={(e) => e.key === 'Enter' && add()} />
        <input value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Objetivo (opcional)" />
        <button onClick={add} disabled={!title.trim()}>+ quest</button>
      </div>

      {quests.length === 0 ? (
        <p className="empty">Nenhuma quest. Adicione a primeira acima.</p>
      ) : (
        <>
          <h2 className="section-label">Ativas ({active.length})</h2>
          <div className="cards">
            {active.length === 0 ? <p className="muted">Nenhuma quest ativa.</p> :
              active.map((q) => <QuestCard key={q.id} q={q} parties={parties} party={party} onUpdate={(p) => onUpdate(q.id, p)} onRemove={() => onRemove(q.id)} />)}
          </div>
          {others.length > 0 && (
            <>
              <h2 className="section-label">Em espera / concluídas ({others.length})</h2>
              <div className="cards">
                {others.map((q) => <QuestCard key={q.id} q={q} parties={parties} party={party} onUpdate={(p) => onUpdate(q.id, p)} onRemove={() => onRemove(q.id)} />)}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
