import { useEffect, useState } from 'react'
import { Target } from '../components/Target'

function useWindowWidth() {
  const [width, setWidth] = useState(() => window.innerWidth)

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return width
}

export function CustomHookDemo() {
  const widthA = useWindowWidth()
  const widthB = useWindowWidth()

  return (
    <div className="demo-stack">
      <Target id="hook-source" className="code-card">
        <pre>{`function useWindowWidth() {
  const [width, setWidth] = useState(...)
  useEffect(() => { /* listen + cleanup */ }, [])
  return width
}`}</pre>
      </Target>

      <div className="split-kids">
        <Target id="widget-a" className="child-card">
          <span className="stat-label">Widget A</span>
          <strong className="stat-value">{widthA}px</strong>
          <span className="muted">own hook call</span>
        </Target>
        <Target id="widget-b" className="child-card">
          <span className="stat-label">Widget B</span>
          <strong className="stat-value">{widthB}px</strong>
          <span className="muted">separate state</span>
        </Target>
      </div>

      <p className="hint">Resize the browser — both update, but each call owns its own state.</p>
    </div>
  )
}
