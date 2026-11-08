import { useState } from 'react'
import { Target } from '../components/Target'

const seed = () => [
  { id: 'a1', text: 'useState' },
  { id: 'b2', text: 'useEffect' },
  { id: 'c3', text: 'keys' },
]

export function ListsKeysDemo() {
  const [items, setItems] = useState(seed)
  const [mode, setMode] = useState('id')

  const shuffle = () => setItems((prev) => [...prev].sort(() => Math.random() - 0.5))
  const prepend = () =>
    setItems((prev) => [{ id: crypto.randomUUID().slice(0, 4), text: 'new' }, ...prev])

  return (
    <div className="demo-stack">
      <Target id="mode-toggle" className="btn-row">
        <button
          type="button"
          className={`btn ${mode === 'id' ? 'primary' : 'ghost'}`}
          onClick={() => setMode('id')}
        >
          key = id
        </button>
        <button
          type="button"
          className={`btn ${mode === 'index' ? 'primary' : 'ghost'}`}
          onClick={() => setMode('index')}
        >
          key = index (broken)
        </button>
      </Target>

      <div className="btn-row">
        <button type="button" className="btn ghost" onClick={shuffle}>Shuffle</button>
        <button type="button" className="btn ghost" onClick={prepend}>Prepend</button>
        <button type="button" className="btn ghost" onClick={() => setItems(seed())}>Reset</button>
      </div>

      <Target id="list-panel" className="list-panel">
        <Target id="id-list" className="list-col">
          {items.map((item, index) => (
            <label key={mode === 'id' ? item.id : index} className="list-row">
              <span className="mono muted">{mode === 'id' ? item.id : index}</span>
              <input defaultValue={item.text} />
            </label>
          ))}
        </Target>
      </Target>

      <p className="hint">
        Type in a row, then Shuffle or Prepend. With index keys, your text sticks to the wrong topic.
      </p>
    </div>
  )
}
