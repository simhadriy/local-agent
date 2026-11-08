import { useEffect, useState } from 'react'

function getAnchor(el, side) {
  const r = el.getBoundingClientRect()
  if (side === 'left') {
    return { x: r.right, y: r.top + r.height / 2 }
  }
  return { x: r.left, y: r.top + r.height / 2 }
}

export function ConnectorLayer({ activeTarget, conceptEl, containerRef }) {
  const [path, setPath] = useState(null)

  useEffect(() => {
    if (!activeTarget || !conceptEl || !containerRef.current) {
      setPath(null)
      return undefined
    }

    const update = () => {
      const demoEl = containerRef.current?.querySelector(`[data-target="${activeTarget}"]`)
      const frame = containerRef.current?.getBoundingClientRect()
      if (!demoEl || !frame) {
        setPath(null)
        return
      }

      const from = getAnchor(conceptEl, 'right')
      const to = getAnchor(demoEl, 'left')
      const x1 = from.x - frame.left
      const y1 = from.y - frame.top
      const x2 = to.x - frame.left
      const y2 = to.y - frame.top
      const dx = Math.max(48, Math.abs(x2 - x1) * 0.45)
      const d = `M ${x1} ${y1} C ${x1 - dx} ${y1}, ${x2 + dx} ${y2}, ${x2} ${y2}`
      setPath({ d, x2, y2, x1, y1 })
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(containerRef.current)
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [activeTarget, conceptEl, containerRef])

  if (!path) return null

  return (
    <svg className="connectors" aria-hidden="true">
      <defs>
        <linearGradient id="beam" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2dd4a8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#2dd4a8" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path className="connector-path" d={path.d} stroke="url(#beam)" />
      <circle className="connector-dot" cx={path.x1} cy={path.y1} r="4" />
      <circle className="connector-dot end" cx={path.x2} cy={path.y2} r="5" />
    </svg>
  )
}
