import { useState } from 'react'
import type { BriefingCharacter } from '../types'
import { ABILITY_LABEL, ABILITY_ORDER, abilityMod, classLine, proficiencyBonus } from '../types'

const sign = (n: number) => (n >= 0 ? `+${n}` : `${n}`)
const numOrUndef = (s: string) => (s.trim() === '' ? undefined : Number(s))

/** Cartão de aventureiro no dossiê. Mostra retrato, classe/nível, PV/CA e
 *  atributos; edição inline dos campos que costumam precisar de ajuste. */
export function CharacterCard({
  c,
  onUpdate,
  onRemove,
}: {
  c: BriefingCharacter
  onUpdate: (patch: Partial<BriefingCharacter>) => void
  onRemove: () => void
}) {
  const [editing, setEditing] = useState(false)

  return (
    <article className="card">
      <div className="card__top">
        {c.avatarUrl ? (
          <img className="card__avatar" src={c.avatarUrl} alt="" />
        ) : (
          <div className="card__avatar card__avatar--blank" aria-hidden="true">
            {c.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="card__id">
          <h3 className="card__name">{c.name}</h3>
          <p className="card__sub">
            {[c.race, classLine(c.classes)].filter(Boolean).join(' · ') || `Nível ${c.level}`}
          </p>
          {c.player && <p className="card__player">jogador: {c.player}</p>}
        </div>
        <span className="card__level" title="Nível total">{c.level}</span>
      </div>

      <div className="card__vitals">
        <Vital label="PV" value={c.maxHp != null ? `${c.hp ?? c.maxHp}/${c.maxHp}` : '—'} />
        <Vital label="CA" value={c.ac != null ? String(c.ac) : '—'} />
        <Vital label="PROF" value={sign(proficiencyBonus(c.level))} />
      </div>

      {c.abilities && (
        <div className="card__abilities">
          {ABILITY_ORDER.map((k) => {
            const score = c.abilities![k]
            return (
              <div className="abil" key={k}>
                <span className="abil__label">{ABILITY_LABEL[k]}</span>
                <span className="abil__score">{score}</span>
                <span className="abil__mod">{sign(abilityMod(score))}</span>
              </div>
            )
          })}
        </div>
      )}

      {c.notes && !editing && <p className="card__notes">{c.notes}</p>}

      {editing ? (
        <div className="card__edit">
          <div className="grid2">
            <Field label="PV atual">
              <input type="number" defaultValue={c.hp ?? ''} onChange={(e) => onUpdate({ hp: numOrUndef(e.target.value) })} />
            </Field>
            <Field label="PV máx">
              <input type="number" defaultValue={c.maxHp ?? ''} onChange={(e) => onUpdate({ maxHp: numOrUndef(e.target.value) })} />
            </Field>
            <Field label="CA">
              <input type="number" defaultValue={c.ac ?? ''} onChange={(e) => onUpdate({ ac: numOrUndef(e.target.value) })} />
            </Field>
            <Field label="Jogador">
              <input type="text" defaultValue={c.player ?? ''} onChange={(e) => onUpdate({ player: e.target.value || undefined })} />
            </Field>
          </div>
          <Field label="Notas">
            <textarea defaultValue={c.notes ?? ''} rows={2} onChange={(e) => onUpdate({ notes: e.target.value || undefined })} />
          </Field>
          <div className="row">
            <button onClick={() => setEditing(false)}>concluir</button>
            <button className="ghost danger" onClick={onRemove}>remover</button>
          </div>
        </div>
      ) : (
        <div className="card__actions">
          <button className="ghost" onClick={() => setEditing(true)}>editar</button>
        </div>
      )}
    </article>
  )
}

function Vital({ label, value }: { label: string; value: string }) {
  return (
    <div className="vital">
      <span className="vital__label">{label}</span>
      <span className="vital__value">{value}</span>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  )
}
