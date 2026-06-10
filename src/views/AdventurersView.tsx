import { useState } from 'react'
import type { BriefingCharacter, Party } from '../types'
import { WantedPoster } from '../components/WantedPoster'
import { ImportPanel } from '../components/ImportPanel'
import { ManualAddForm } from '../components/ManualAddForm'

export function AdventurersView({
  party,
  parties,
  onImport,
  onAdd,
  onUpdate,
  onRemove,
  onAddParty,
  onRenameParty,
  onRemoveParty,
}: {
  party: BriefingCharacter[]
  parties: Party[]
  onImport: (c: BriefingCharacter) => void
  onAdd: (c: BriefingCharacter) => void
  onUpdate: (id: string, patch: Partial<BriefingCharacter>) => void
  onRemove: (id: string) => void
  onAddParty: (name: string) => void
  onRenameParty: (id: string, name: string) => void
  onRemoveParty: (id: string) => void
}) {
  const [newParty, setNewParty] = useState('')

  const addParty = () => {
    if (!newParty.trim()) return
    onAddParty(newParty.trim())
    setNewParty('')
  }

  const unassigned = party.filter((c) => !c.partyId || !parties.some((p) => p.id === c.partyId))

  const Posters = ({ list }: { list: BriefingCharacter[] }) => (
    <div className="roster roster--posters">
      {list.map((c) => (
        <WantedPoster
          key={c.id}
          c={c}
          parties={parties}
          onUpdate={(patch) => onUpdate(c.id, patch)}
          onRemove={() => onRemove(c.id)}
        />
      ))}
    </div>
  )

  return (
    <div className="view">
      <div className="intake">
        <ImportPanel onImport={onImport} />
        <ManualAddForm onAdd={onAdd} />
      </div>

      <div className="parties-bar">
        <span className="parties-bar__label">Equipes:</span>
        {parties.map((p) => (
          <span className="party-chip" key={p.id}>
            <button
              className="party-chip__name"
              title="Renomear equipe"
              onClick={() => {
                const name = prompt('Nome da equipe:', p.name)
                if (name && name.trim()) onRenameParty(p.id, name.trim())
              }}
            >
              {p.name}
            </button>
            <button className="party-chip__x" title="Remover equipe" onClick={() => onRemoveParty(p.id)}>✕</button>
          </span>
        ))}
        <span className="parties-bar__add">
          <input
            value={newParty}
            onChange={(e) => setNewParty(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addParty()}
            placeholder="nova equipe…"
          />
          <button onClick={addParty} disabled={!newParty.trim()}>+</button>
        </span>
      </div>

      {party.length === 0 ? (
        <p className="empty">A companhia está vazia. Importe uma ficha do D&amp;D Beyond ou adicione manual.</p>
      ) : (
        <>
          {parties.map((p) => {
            const members = party.filter((c) => c.partyId === p.id)
            return (
              <section className="party-group" key={p.id}>
                <h2 className="section-label">{p.name} ({members.length})</h2>
                {members.length === 0 ? (
                  <p className="muted">Nenhum aventureiro nesta equipe ainda. Defina a equipe no cartaz (editar).</p>
                ) : (
                  <Posters list={members} />
                )}
              </section>
            )
          })}
          <section className="party-group">
            {parties.length > 0 && <h2 className="section-label">Sem equipe ({unassigned.length})</h2>}
            <Posters list={unassigned} />
          </section>
        </>
      )}
    </div>
  )
}
