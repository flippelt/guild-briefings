import { useState } from 'react'
import type { Briefing } from '../types'
import { questAssignee } from '../types'
import { QuestStamp } from '../components/QuestStamp'
import { QuestModal } from '../components/QuestModal'

/** Salão = quadro de avisos: quests pregadas. Concluídas ganham um carimbo de
 *  tinta. Clicar no bilhete abre a quest (pergaminho com assinatura + selo de
 *  cera). */
export function StatusView({ briefing }: { briefing: Briefing }) {
  const { party, parties, quests } = briefing
  const [openId, setOpenId] = useState<string | null>(null)
  const done = (s: string) => s === 'concluida' || s === 'parcial'
  const ordered = [...quests].sort((a, b) => Number(done(a.status)) - Number(done(b.status)))
  const open = quests.find((q) => q.id === openId) ?? null

  return (
    <div className="view">
      <div className="board">
        {quests.length === 0 ? (
          <p className="board__empty">O quadro está vazio. Pregue uma quest na aba Quests.</p>
        ) : (
          <div className="board__notes">
            {ordered.map((q, i) => {
              const who = questAssignee(q, parties, party)
              return (
                <article
                  key={q.id}
                  className={`note note--${q.status}`}
                  style={{ transform: `rotate(${((i % 5) - 2) * 1.3}deg)` }}
                >
                  <button
                    className="note__open"
                    aria-label={`Abrir: ${q.title}`}
                    onClick={() => setOpenId(q.id)}
                  />
                  <span className="note__pin" aria-hidden="true" />
                  <h3 className="note__title">{q.title}</h3>
                  {q.objective && <p className="note__obj">{q.objective}</p>}
                  {who && <p className="note__who">⚔ {who}</p>}
                  {q.reward && <p className="note__reward">✦ {q.reward}</p>}
                  {q.status === 'pausada' && <span className="note__stamp note__stamp--hold">em espera</span>}
                  {(q.status === 'concluida' || q.status === 'parcial' || q.status === 'falhou') && <QuestStamp quest={q} />}
                </article>
              )
            })}
          </div>
        )}
      </div>

      {open && (
        <QuestModal q={open} who={questAssignee(open, parties, party)} onClose={() => setOpenId(null)} />
      )}
    </div>
  )
}
