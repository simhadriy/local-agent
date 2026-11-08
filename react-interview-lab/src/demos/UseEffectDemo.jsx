import { useEffect, useState } from 'react'
import { Target } from '../components/Target'

export function UseEffectDemo() {
  const [query, setQuery] = useState('react')
  const [enabled, setEnabled] = useState(true)
  const [log, setLog] = useState([])

  const push = (msg) =>
    setLog((prev) => [`${new Date().toLocaleTimeString()}  ${msg}`, ...prev].slice(0, 8))

  useEffect(() => {
    if (!enabled) return undefined
    push(`effect run · query="${query}"`)
    const id = setTimeout(() => push(`async done · "${query}"`), 600)
    return () => {
      clearTimeout(id)
      push(`cleanup · was "${query}"`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, enabled])

  return (
    <div className="demo-stack">
      <Target id="query-input" className="field">
        <label htmlFor="q">query dependency</label>
        <input
          id="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="type to change deps"
        />
      </Target>

      <div className="btn-row">
        <button className="btn ghost" type="button" onClick={() => setEnabled((v) => !v)}>
          effects {enabled ? 'on' : 'off'}
        </button>
        <Target id="cleanup-chip" className="chip">
          cleanup clears the timer
        </Target>
      </div>

      <Target id="effect-log" className="log">
        {log.length === 0 ? <span className="muted">effect log appears here…</span> : log.map((line, i) => (
          <div key={`${i}-${line}`}>{line}</div>
        ))}
      </Target>

      <Target id="strict-note" className="note">
        Dev Strict Mode may double-fire mount + cleanup. That is intentional.
      </Target>
    </div>
  )
}
