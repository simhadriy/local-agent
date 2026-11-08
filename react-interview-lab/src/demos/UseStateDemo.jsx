import { useRef, useState } from 'react'
import { Target } from '../components/Target'

export function UseStateDemo() {
  const [count, setCount] = useState(0)
  const [label, setLabel] = useState('clicks')
  const renders = useRef(0)
  renders.current += 1

  return (
    <div className="demo-stack">
      <Target id="counter-value" className="stat-block">
        <span className="stat-label">count</span>
        <strong className="stat-value">{count}</strong>
        <span className="stat-sub">{label}</span>
      </Target>

      <div className="btn-row">
        <Target id="counter-btn" as="button" className="btn primary" onClick={() => setCount((c) => c + 1)}>
          Increment
        </Target>
        <Target
          id="batch-btn"
          as="button"
          className="btn ghost"
          onClick={() => {
            setCount((c) => c + 1)
            setCount((c) => c + 1)
            setLabel('batched')
          }}
        >
          +2 batched
        </Target>
        <button className="btn ghost" type="button" onClick={() => { setCount(0); setLabel('clicks') }}>
          Reset
        </button>
      </div>

      <Target id="render-badge" className="chip accent">
        renders this session: {renders.current}
      </Target>
    </div>
  )
}
