import { useState } from 'react'
import type { BriefingCharacter, Party } from '../types'
import { classLine } from '../types'

/**
 * Card de jogador como "cartaz de procurado": o NOME ocupa o topo (onde iria
 * "PROCURADO"), depois o retrato, e embaixo só classe e nível. Clicar abre a
 * história (background) do personagem.
 */
export function WantedPoster({
  c,
  parties,
  onUpdate,
  onRemove,
}: {
  c: BriefingCharacter
  parties: Party[]
  onUpdate: (patch: Partial<BriefingCharacter>) => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(false)
  const meta = classLine(c.classes) || `Nível ${c.level}`

  return (
    <>
      <button className="poster" onClick={() => setOpen(true)} title="Abrir história">
        <span className="poster__name">{c.name}</span>
        <span className="poster__rule" />
        <span className="poster__frame">
          {c.avatarUrl ? (
            <img className="poster__photo" src={c.avatarUrl} alt="" />
          ) : (
            <span className="poster__photo poster__photo--blank">{c.name.charAt(0).toUpperCase()}</span>
          )}
        </span>
        <span className="poster__meta">{meta}</span>
      </button>

      {open && (
        <PosterModal
          c={c}
          meta={meta}
          parties={parties}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

function PosterModal({
  c,
  meta,
  parties,
  onUpdate,
  onRemove,
  onClose,
}: {
  c: BriefingCharacter
  meta: string
  parties: Party[]
  onUpdate: (patch: Partial<BriefingCharacter>) => void
  onRemove: () => void
  onClose: () => void
}) {
  const [editing, setEditing] = useState(false)

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__panel poster poster--lg" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Fechar">✕</button>

        <span className="poster__name">{c.name}</span>
        <span className="poster__rule" />
        <span className="poster__frame poster__frame--lg">
          {c.avatarUrl ? (
            <img className="poster__photo" src={c.avatarUrl} alt="" />
          ) : (
            <span className="poster__photo poster__photo--blank">{c.name.charAt(0).toUpperCase()}</span>
          )}
        </span>
        <span className="poster__meta">{[c.race, meta].filter(Boolean).join(' · ')}</span>

        <div className="poster__story">
          {editing ? (
            <>
              <label className="field"><span>Nome</span><input defaultValue={c.name} onChange={(e) => onUpdate({ name: e.target.value })} /></label>
              <label className="field">
                <span>Equipe</span>
                <select value={c.partyId ?? ''} onChange={(e) => onUpdate({ partyId: e.target.value || undefined })}>
                  <option value="">(sem equipe)</option>
                  {parties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>
              <label className="field"><span>Retrato (URL)</span><input defaultValue={c.avatarUrl ?? ''} onChange={(e) => onUpdate({ avatarUrl: e.target.value || undefined })} /></label>
              <label className="field"><span>História</span><textarea defaultValue={c.backstory ?? ''} rows={8} onChange={(e) => onUpdate({ backstory: e.target.value || undefined })} /></label>
            </>
          ) : c.backstory ? (
            <p className="poster__story-text">{c.backstory}</p>
          ) : (
            <p className="muted">Sem história registrada. Toque em "editar" para escrever a lenda.</p>
          )}
        </div>

        <div className="row" style={{ justifyContent: 'space-between', width: '100%' }}>
          <button className="ghost" onClick={() => setEditing((v) => !v)}>{editing ? 'concluir' : 'editar'}</button>
          <button className="ghost danger" onClick={() => { onRemove(); onClose() }}>remover</button>
        </div>
      </div>
    </div>
  )
}
