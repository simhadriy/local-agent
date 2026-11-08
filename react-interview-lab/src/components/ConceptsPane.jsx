import { useEffect, useRef } from 'react'

export function ConceptsPane({ topic, activeId, onActive, doneMap, onToggleDone }) {
  const itemRefs = useRef({})

  useEffect(() => {
    const first = topic.concepts[0]
    if (!first) return
    const frame = requestAnimationFrame(() => {
      const el = itemRefs.current[first.id]
      if (el) onActive(first.id, first.target, el)
    })
    return () => cancelAnimationFrame(frame)
  }, [topic.id, topic.concepts, onActive])

  return (
    <aside className="concepts-pane">
      <div className="concepts-head">
        <p className="eyebrow">Concepts → demo</p>
        <h2>Point at the left</h2>
        <p className="concepts-sub">
          Hover or focus a concept. The beam highlights the matching region in the live demo.
        </p>
      </div>

      <ol className="concept-list">
        {topic.concepts.map((concept, index) => {
          const active = activeId === concept.id
          const done = Boolean(doneMap[`${topic.id}:${concept.id}`])
          return (
            <li key={concept.id}>
              <div
                className={`concept-card ${active ? 'is-active' : ''} ${done ? 'is-done' : ''}`}
                ref={(el) => {
                  itemRefs.current[concept.id] = el
                }}
                role="button"
                tabIndex={0}
                onMouseEnter={() => onActive(concept.id, concept.target, itemRefs.current[concept.id])}
                onFocus={() => onActive(concept.id, concept.target, itemRefs.current[concept.id])}
                onClick={() => onActive(concept.id, concept.target, itemRefs.current[concept.id])}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onActive(concept.id, concept.target, itemRefs.current[concept.id])
                  }
                }}
              >
                <div className="concept-meta">
                  <span className="concept-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="concept-target mono">→ {concept.target}</span>
                </div>
                <h3>{concept.title}</h3>
                <p>{concept.body}</p>
                <blockquote>
                  <span className="say-label">Say in interview</span>
                  {concept.say}
                </blockquote>
                <button
                  type="button"
                  className="mark-done"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleDone(`${topic.id}:${concept.id}`)
                  }}
                >
                  {done ? 'Got it' : 'Mark learned'}
                </button>
              </div>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}
