import { useState } from 'react'
import type { Briefing } from './types'
import { useBriefing, DEMO_MODE } from './store/briefing'
import { BootScreen } from './components/BootScreen'
import { StatusView } from './views/StatusView'
import { AdventurersView } from './views/AdventurersView'
import { QuestsView } from './views/QuestsView'
import { RecapsView } from './views/RecapsView'

type Tab = 'status' | 'party' | 'quests' | 'recaps'

const TABS: { id: Tab; label: string; sigil: string }[] = [
  { id: 'status', label: 'Salão', sigil: '⚜' },
  { id: 'party', label: 'Aventureiros', sigil: '⚔' },
  { id: 'quests', label: 'Quests', sigil: '✦' },
  { id: 'recaps', label: 'Crônicas', sigil: '✒' },
]

function exportBriefing(b: Briefing) {
  const blob = new Blob([JSON.stringify(b, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'briefing.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function App() {
  const b = useBriefing()
  const [tab, setTab] = useState<Tab>('status')
  const [booted, setBooted] = useState(() => sessionStorage.getItem('guild.booted') === '1')

  if (!booted) {
    return (
      <BootScreen
        onDone={() => {
          sessionStorage.setItem('guild.booted', '1')
          setBooted(true)
        }}
      />
    )
  }

  const { briefing } = b

  return (
    <div className="app">
      <div className="bg" aria-hidden="true">
        <span className="bg__glow" />
        <span className="bg__embers" />
        <span className="bg__grain" />
      </div>

      <header className="masthead">
        <div className="masthead__crest" aria-hidden="true">⚜</div>
        <div className="masthead__id">
          <h1 className="masthead__title">{briefing.guildName || 'Companhia Errante'}</h1>
          {DEMO_MODE ? (
            <span className="masthead__demo" title="Demonstração — nada é salvo; reseta a cada acesso">
              demonstração · nada é salvo
            </span>
          ) : (
            <button
              className="masthead__rename"
              title="Renomear companhia"
              onClick={() => {
                const name = prompt('Nome da companhia / guilda:', briefing.guildName ?? '')
                if (name !== null) b.setGuildName(name.trim())
              }}
            >
              renomear
            </button>
          )}
        </div>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={'tab' + (tab === t.id ? ' tab--on' : '')}
            onClick={() => setTab(t.id)}
          >
            <span className="tab__sigil" aria-hidden="true">{t.sigil}</span>
            <span className="tab__label">{t.label}</span>
          </button>
        ))}
      </nav>

      <main className="stage">
        {tab === 'status' && <StatusView briefing={briefing} />}
        {tab === 'party' && (
          <AdventurersView
            party={briefing.party}
            parties={briefing.parties}
            onImport={b.addCharacter}
            onAdd={b.addCharacter}
            onUpdate={b.updateCharacter}
            onRemove={b.removeCharacter}
            onAddParty={b.addParty}
            onRenameParty={b.renameParty}
            onRemoveParty={b.removeParty}
          />
        )}
        {tab === 'quests' && (
          <QuestsView
            quests={briefing.quests}
            parties={briefing.parties}
            party={briefing.party}
            onAdd={b.addQuest}
            onUpdate={b.updateQuest}
            onRemove={b.removeQuest}
          />
        )}
        {tab === 'recaps' && (
          <RecapsView recaps={briefing.recaps} onAdd={b.addRecap} onUpdate={b.updateRecap} onRemove={b.removeRecap} />
        )}
      </main>

      <footer className="app__footer">
        <span className="muted">
          {briefing.party.length} aventureiro(s) · {briefing.quests.length} quest(s) · {briefing.recaps.length} crônica(s)
        </span>
        <div className="row">
          <button className="ghost" onClick={() => exportBriefing(briefing)} title="Baixar briefing.json">
            exportar dossiê
          </button>
          <button
            className="ghost danger"
            onClick={() => {
              if (confirm('Limpar todo o dossiê (aventureiros, quests e crônicas)?')) b.clearAll()
            }}
          >
            limpar
          </button>
        </div>
      </footer>
    </div>
  )
}
