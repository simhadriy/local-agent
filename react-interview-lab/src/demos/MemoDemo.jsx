import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { Target } from '../components/Target'

function expensiveSum(n) {
  let total = 0
  for (let i = 0; i < 200000; i += 1) total += (n + i) % 7
  return total
}

const HeavyChild = memo(function HeavyChild({ onPing, label }) {
  const renders = useRef(0)
  renders.current += 1
  return (
    <Target id="child-memo" className="child-card">
      <span className="stat-label">{label}</span>
      <strong>renders: {renders.current}</strong>
      <button type="button" className="btn ghost" onClick={onPing}>ping</button>
    </Target>
  )
})

export function MemoDemo() {
  const [tick, setTick] = useState(0)
  const [n, setN] = useState(3)
  const [stabilize, setStabilize] = useState(true)

  const unstablePing = () => undefined
  const stablePing = useCallback(() => undefined, [])
  const onPing = stabilize ? stablePing : unstablePing

  const result = useMemo(() => expensiveSum(n), [n])

  return (
    <div className="demo-stack">
      <div className="btn-row">
        <button type="button" className="btn primary" onClick={() => setTick((t) => t + 1)}>
          bump parent ({tick})
        </button>
        <button
          type="button"
          className={`btn ${stabilize ? 'primary' : 'ghost'}`}
          onClick={() => setStabilize((v) => !v)}
        >
          useCallback {stabilize ? 'on' : 'off'}
        </button>
      </div>

      <Target id="callback-btn" className="note">
        Parent bump re-renders this tree. Memoized child skips when `onPing` stays referentially equal.
      </Target>

      <HeavyChild onPing={onPing} label="React.memo child" />

      <Target id="expensive" className="field">
        <label htmlFor="n">n for useMemo work</label>
        <input
          id="n"
          type="number"
          min={0}
          max={20}
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
        />
        <span className="chip">cached result: {result}</span>
      </Target>
    </div>
  )
}
