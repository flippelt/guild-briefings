import type { Quest } from '../types'
import { QUEST_STATUS_LABEL } from '../types'
import { guildForQuest } from '../guilds'
import { QuestSeal } from './QuestSeal'

/**
 * Quest aberta — o pergaminho do contrato: título, objetivo, encarregados,
 * recompensa e, no rodapé/canto, a assinatura do quest giver (fonte de
 * assinatura) com o selo de cera ao lado quando concluída.
 */
export function QuestModal({ q, who, onClose }: { q: Quest; who: string; onClose: () => void }) {
  const { guild } = guildForQuest(q)
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__panel quest-detail" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Fechar">✕</button>

        <span className={`badge badge--${q.status} quest-detail__badge`}>{QUEST_STATUS_LABEL[q.status]}</span>
        <h2 className="quest-detail__title">{q.title}</h2>
        {q.objective && <p className="quest-detail__obj">{q.objective}</p>}
        {who && <p className="quest-detail__who">⚔ {who}</p>}
        {q.reward && <p className="quest-detail__reward">✦ {q.reward}</p>}
        {q.notes && <p className="quest-detail__notes">{q.notes}</p>}

        {/* rodapé de contrato: selo de cera (quando concluída) + assinatura do
            quest giver no canto inferior direito (só o nome, em fonte de
            assinatura, sobre a linha; cargo/guilda em fonte normal) */}
        <div className="contract-foot">
          {(q.status === 'concluida' || q.status === 'parcial' || q.status === 'falhou') && <QuestSeal quest={q} />}
          <div className="contract-sign">
            <span className="contract-sign__name" style={{ fontFamily: guild.signFont }}>{guild.signer}</span>
            <span className="contract-sign__role">{guild.signer} — {guild.role}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
