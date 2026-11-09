import { Target } from '../components/Target'

function Shell({ children }) {
  return (
    <Target id="shell" className="shell">
      <header className="shell-bar">Shell layout</header>
      <div className="shell-body">{children}</div>
    </Target>
  )
}

function Card({ header, footer, children }) {
  return (
    <Target id="slots-demo" className="slot-card">
      <div className="slot-header">{header}</div>
      <div className="slot-body">{children}</div>
      <div className="slot-footer">{footer}</div>
    </Target>
  )
}

export function CompositionDemo() {
  return (
    <div className="demo-stack">
      <Shell>
        <p>Caller supplies this content via <code>children</code>.</p>
      </Shell>

      <Card
        header={<strong>Named header slot</strong>}
        footer={<button type="button" className="btn ghost">footer action</button>}
      >
        Body content lives between named slots.
      </Card>

      <Target id="note-card" className="note">
        Share behavior with hooks. Share structure by nesting — not by extending classes.
      </Target>
    </div>
  )
}
