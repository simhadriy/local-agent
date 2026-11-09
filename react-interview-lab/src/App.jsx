import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { topics } from './data/topics'
import { ConceptsPane } from './components/ConceptsPane'
import { ConnectorLayer } from './components/ConnectorLayer'
import './App.css'

const STORAGE_KEY = 'react-day-progress-v1'

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export default function App() {
  const [topicId, setTopicId] = useState(topics[0].id)
  const [activeConcept, setActiveConcept] = useState(null)
  const [activeTarget, setActiveTarget] = useState(null)
  const [conceptEl, setConceptEl] = useState(null)
  const [doneMap, setDoneMap] = useState(loadProgress)
  const stageRef = useRef(null)

  const topic = useMemo(() => topics.find((t) => t.id === topicId) ?? topics[0], [topicId])
  const Demo = topic.Demo

  const totalConcepts = topics.reduce((n, t) => n + t.concepts.length, 0)
  const doneCount = Object.values(doneMap).filter(Boolean).length
  const pct = Math.round((doneCount / totalConcepts) * 100)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doneMap))
  }, [doneMap])

  const onActive = useCallback((conceptId, target, el) => {
    setActiveConcept(conceptId)
    setActiveTarget(target)
    setConceptEl(el)
  }, [])

  const onToggleDone = useCallback((key) => {
    setDoneMap((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand-block">
          <p className="brand">React Day</p>
          <p className="tagline">Interview lab — demo left, answers right</p>
        </div>

        <div className="progress-block" aria-label="Study progress">
          <div className="progress-meta">
            <span>{doneCount}/{totalConcepts} concepts</span>
            <strong>{pct}%</strong>
          </div>
          <div className="progress-track">
            <motion.div className="progress-fill" animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
          </div>
        </div>
      </header>

      <nav className="topic-nav" aria-label="Topics">
        {topics.map((t) => {
          const topicDone = t.concepts.every((c) => doneMap[`${t.id}:${c.id}`])
          return (
            <button
              key={t.id}
              type="button"
              className={`topic-chip ${topicId === t.id ? 'is-active' : ''} ${topicDone ? 'is-done' : ''}`}
              onClick={() => setTopicId(t.id)}
            >
              <span>{t.short}</span>
              <small>{t.minutes}m</small>
            </button>
          )
        })}
      </nav>

      <section className="topic-hero">
        <div>
          <p className="eyebrow">Topic {topics.findIndex((t) => t.id === topic.id) + 1} of {topics.length}</p>
          <h1>{topic.headline}</h1>
          <p className="hero-blurb">{topic.blurb}</p>
        </div>
        <div className="hero-aside">
          <span className="mono">{topic.title}</span>
          <span className="muted">~{topic.minutes} min deep dive</span>
        </div>
      </section>

      <div className="stage" ref={stageRef}>
        <ConnectorLayer
          activeTarget={activeTarget}
          conceptEl={conceptEl}
          containerRef={stageRef}
        />

        <section className="demo-pane">
          <div className="pane-label">
            <span>Live demo</span>
            <span className="mono muted">interact → observe</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={topic.id}
              className="demo-frame"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <DemoHighlight activeTarget={activeTarget}>
                <Demo />
              </DemoHighlight>
            </motion.div>
          </AnimatePresence>
        </section>

        <ConceptsPane
          topic={topic}
          activeId={activeConcept}
          onActive={onActive}
          doneMap={doneMap}
          onToggleDone={onToggleDone}
        />
      </div>

      <footer className="footer">
        <p>
          One-day path: work left-to-right through each topic, mark concepts learned, and rehearse the
          “Say in interview” lines out loud.
        </p>
      </footer>
    </div>
  )
}

function DemoHighlight({ activeTarget, children }) {
  useEffect(() => {
    if (!activeTarget) return undefined
    const nodes = document.querySelectorAll('.demo-pane [data-target]')
    nodes.forEach((node) => {
      node.classList.toggle('target-active', node.getAttribute('data-target') === activeTarget)
    })
  }, [activeTarget, children])

  return children
}
