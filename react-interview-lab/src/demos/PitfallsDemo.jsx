import { useEffect, useState } from 'react'
import { Target } from '../components/Target'

export function PitfallsDemo() {
  const [count, setCount] = useState(0)
  const [fixed, setFixed] = useState(true)
  const [items, setItems] = useState(['alpha', 'beta'])
  const [loopArmed, setLoopArmed] = useState(false)
  const [loopTicks, setLoopTicks] = useState(0)

  const schedule = () => {
    setTimeout(() => {
      if (fixed) setCount((c) => c + 1)
      else setCount(count + 1)
    }, 800)
  }

  useEffect(() => {
    if (!loopArmed) return undefined
    if (loopTicks >= 12) {
      setLoopArmed(false)
      return undefined
    }
    const id = setTimeout(() => setLoopTicks((t) => t + 1), 80)
    return () => clearTimeout(id)
  }, [loopArmed, loopTicks])

  const mutateWrong = () => {
    items.push(`x${items.length}`)
    setItems(items)
  }

  const mutateRight = () => {
    setItems((prev) => [...prev, `x${prev.length}`])
  }

  return (
    <div className="demo-stack">
      <div className="btn-row">
        <button type="button" className={`btn ${fixed ? 'primary' : 'ghost'}`} onClick={() => setFixed(true)}>
          fixed mode
        </button>
        <button type="button" className={`btn ${!fixed ? 'primary' : 'ghost'}`} onClick={() => setFixed(false)}>
          buggy mode
        </button>
      </div>

      <Target id="stale-panel" className="child-card">
        <span className="stat-label">stale closure</span>
        <strong className="stat-value">{count}</strong>
        <div className="btn-row">
          <button type="button" className="btn ghost" onClick={() => setCount((c) => c + 1)}>+1 now</button>
          <button type="button" className="btn primary" onClick={schedule}>+1 after 800ms</button>
        </div>
        <p className="hint">
          {fixed
            ? 'Functional update always sees latest count.'
            : 'Click +1 now, then quickly schedule — buggy mode may ignore the click.'}
        </p>
      </Target>

      <Target id="loop-panel" className="child-card">
        <span className="stat-label">effect retrigger demo (capped)</span>
        <strong>{loopTicks} ticks</strong>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            setLoopTicks(0)
            setLoopArmed(true)
          }}
        >
          arm feedback loop
        </button>
        <p className="hint">Setting state that the effect depends on retriggers it — here it stops at 12.</p>
      </Target>

      <Target id="mutate-panel" className="child-card">
        <span className="stat-label">immutability</span>
        <code className="mono">{JSON.stringify(items)}</code>
        <div className="btn-row">
          <button type="button" className="btn ghost" onClick={fixed ? mutateRight : mutateWrong}>
            {fixed ? 'immutable push' : 'mutate in place'}
          </button>
          <button type="button" className="btn ghost" onClick={() => setItems(['alpha', 'beta'])}>reset</button>
        </div>
      </Target>
    </div>
  )
}
