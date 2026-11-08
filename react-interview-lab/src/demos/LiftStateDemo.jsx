import { useState } from 'react'
import { Target } from '../components/Target'

function toC(f) {
  return ((f - 32) * 5) / 9
}
function toF(c) {
  return (c * 9) / 5 + 32
}

function TempInput({ label, value, onChange, targetId }) {
  return (
    <Target id={targetId} className="field child-card">
      <label>{label}</label>
      <input
        type="number"
        value={Number.isNaN(value) ? '' : value}
        onChange={(e) => onChange(e.target.value === '' ? NaN : Number(e.target.value))}
      />
    </Target>
  )
}

export function LiftStateDemo() {
  const [celsius, setCelsius] = useState(20)

  return (
    <div className="demo-stack">
      <Target id="parent-panel" className="parent-panel">
        <span className="stat-label">parent owns temperature</span>
        <strong className="stat-value">{Number.isNaN(celsius) ? '—' : celsius.toFixed(1)}°C</strong>
      </Target>

      <div className="split-kids">
        <TempInput
          targetId="child-a"
          label="Celsius child"
          value={celsius}
          onChange={setCelsius}
        />
        <TempInput
          targetId="child-b"
          label="Fahrenheit child"
          value={Number.isNaN(celsius) ? NaN : toF(celsius)}
          onChange={(f) => setCelsius(Number.isNaN(f) ? NaN : toC(f))}
        />
      </div>
    </div>
  )
}
