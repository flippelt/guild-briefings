import { useState } from 'react'
import type { AbilityKey, BriefingCharacter } from '../types'
import { ABILITY_LABEL, ABILITY_ORDER } from '../types'

const newId = () => {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
  return c?.randomUUID ? c.randomUUID() : `m-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
}

const numOrUndef = (s: string) => (s.trim() === '' ? undefined : Number(s))

/** Adição manual de personagem (qualquer sistema / sem DDB). */
export function ManualAddForm({ onAdd }: { onAdd: (c: BriefingCharacter) => void }) {
  const [name, setName] = useState('')
  const [player, setPlayer] = useState('')
  const [race, setRace] = useState('')
  const [className, setClassName] = useState('')
  const [level, setLevel] = useState('1')
  const [hp, setHp] = useState('')
  const [ac, setAc] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [backstory, setBackstory] = useState('')
  const [abilities, setAbilities] = useState<Record<AbilityKey, string>>({
    str: '', dex: '', con: '', int: '', wis: '', cha: '',
  })

  const reset = () => {
    setName(''); setPlayer(''); setRace(''); setClassName(''); setLevel('1'); setHp(''); setAc('')
    setAvatarUrl(''); setBackstory('')
    setAbilities({ str: '', dex: '', con: '', int: '', wis: '', cha: '' })
  }

  const add = () => {
    if (!name.trim()) return
    const lvl = Math.max(1, Number(level) || 1)
    const abilityEntries = ABILITY_ORDER.filter((k) => abilities[k].trim() !== '')
    const hasAbilities = abilityEntries.length > 0
    const maxHp = numOrUndef(hp)
    const c: BriefingCharacter = {
      id: newId(),
      name: name.trim(),
      ...(player.trim() ? { player: player.trim() } : {}),
      ...(race.trim() ? { race: race.trim() } : {}),
      classes: className.trim() ? [{ name: className.trim(), level: lvl }] : [],
      level: lvl,
      ...(hasAbilities
        ? {
            abilities: ABILITY_ORDER.reduce(
              (acc, k) => ({ ...acc, [k]: Number(abilities[k]) || 10 }),
              {} as Record<AbilityKey, number>,
            ),
          }
        : {}),
      ...(maxHp !== undefined ? { hp: maxHp, maxHp } : {}),
      ...(numOrUndef(ac) !== undefined ? { ac: numOrUndef(ac) } : {}),
      ...(avatarUrl.trim() ? { avatarUrl: avatarUrl.trim() } : {}),
      ...(backstory.trim() ? { backstory: backstory.trim() } : {}),
      source: 'manual',
    }
    onAdd(c)
    reset()
  }

  return (
    <details className="panel">
      <summary>Adicionar manual</summary>
      <div className="panel__body">
        <div className="grid2">
          <label className="field"><span>Nome*</span><input value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label className="field"><span>Jogador</span><input value={player} onChange={(e) => setPlayer(e.target.value)} /></label>
          <label className="field"><span>Raça/Povo</span><input value={race} onChange={(e) => setRace(e.target.value)} /></label>
          <label className="field"><span>Classe</span><input value={className} onChange={(e) => setClassName(e.target.value)} /></label>
          <label className="field"><span>Nível</span><input type="number" value={level} onChange={(e) => setLevel(e.target.value)} /></label>
          <label className="field"><span>PV</span><input type="number" value={hp} onChange={(e) => setHp(e.target.value)} /></label>
          <label className="field"><span>CA</span><input type="number" value={ac} onChange={(e) => setAc(e.target.value)} /></label>
        </div>
        <div className="manual-abilities">
          {ABILITY_ORDER.map((k) => (
            <label className="field field--abil" key={k}>
              <span>{ABILITY_LABEL[k]}</span>
              <input
                type="number"
                value={abilities[k]}
                onChange={(e) => setAbilities((a) => ({ ...a, [k]: e.target.value }))}
              />
            </label>
          ))}
        </div>
        <label className="field"><span>Retrato (URL da imagem)</span><input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" /></label>
        <label className="field"><span>História</span><textarea value={backstory} onChange={(e) => setBackstory(e.target.value)} rows={3} placeholder="A lenda por trás do aventureiro…" /></label>
        <div className="row">
          <button onClick={add} disabled={!name.trim()}>+ adicionar</button>
        </div>
      </div>
    </details>
  )
}
