import { createContext, useContext, useMemo, useState } from 'react'
import { Target } from '../components/Target'

const ThemeContext = createContext(null)

function DeepChild() {
  const { theme, user } = useContext(ThemeContext)
  return (
    <Target id="deep-child" className={`deep-child theme-${theme}`}>
      <span className="stat-label">deep child via useContext</span>
      <strong>{user}</strong>
      <span>theme: {theme}</span>
    </Target>
  )
}

function Mid() {
  return (
    <div className="mid-wrap">
      <span className="muted mono">Mid — no theme props</span>
      <DeepChild />
    </div>
  )
}

export function ContextDemo() {
  const [theme, setTheme] = useState('dusk')
  const [user, setUser] = useState('yaswanth')

  const value = useMemo(() => ({ theme, user }), [theme, user])

  return (
    <div className="demo-stack">
      <div className="btn-row">
        <button type="button" className="btn ghost" onClick={() => setTheme((t) => (t === 'dusk' ? 'dawn' : 'dusk'))}>
          toggle theme
        </button>
        <button type="button" className="btn ghost" onClick={() => setUser((u) => (u === 'yaswanth' ? 'interviewer' : 'yaswanth'))}>
          swap user
        </button>
      </div>

      <Target id="theme-provider" className="provider-frame">
        <span className="stat-label">ThemeContext.Provider</span>
        <ThemeContext.Provider value={value}>
          <Mid />
        </ThemeContext.Provider>
      </Target>

      <Target id="drill-note" className="note">
        Mid never received theme or user as props — Context skipped the drill.
      </Target>
    </div>
  )
}
