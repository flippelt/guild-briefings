import { useParty } from './store/party'
import { CharacterCard } from './components/CharacterCard'
import { ImportPanel } from './components/ImportPanel'
import { ManualAddForm } from './components/ManualAddForm'

export function App() {
  const { party, add, update, remove, clear } = useParty()

  return (
    <div className="app">
      <header className="masthead">
        <h1 className="masthead__title">Guild Briefings</h1>
        <p className="masthead__sub">Dossiê da companhia de aventureiros</p>
      </header>

      <section className="intake">
        <ImportPanel onImport={add} />
        <ManualAddForm onAdd={add} />
      </section>

      {party.length === 0 ? (
        <p className="empty">
          Nenhum aventureiro no dossiê. Importe uma ficha do D&amp;D Beyond ou adicione manualmente.
        </p>
      ) : (
        <>
          <div className="roster">
            {party.map((c) => (
              <CharacterCard
                key={c.id}
                c={c}
                onUpdate={(patch) => update(c.id, patch)}
                onRemove={() => remove(c.id)}
              />
            ))}
          </div>
          <footer className="app__footer">
            <span className="muted">{party.length} aventureiro(s)</span>
            <button
              className="ghost danger"
              onClick={() => {
                if (confirm('Limpar todo o dossiê?')) clear()
              }}
            >
              limpar dossiê
            </button>
          </footer>
        </>
      )}
    </div>
  )
}
