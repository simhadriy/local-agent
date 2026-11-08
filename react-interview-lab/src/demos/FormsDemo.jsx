import { useState } from 'react'
import { Target } from '../components/Target'

export function FormsDemo() {
  const [form, setForm] = useState({
    name: 'Yaswanth',
    role: 'Frontend',
    level: 'mid',
  })

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="demo-stack">
      <Target id="form-fields" className="form-grid">
        <Target id="name-input" className="field">
          <label htmlFor="name">name</label>
          <input id="name" name="name" value={form.name} onChange={onChange} />
        </Target>
        <div className="field">
          <label htmlFor="role">role</label>
          <input id="role" name="role" value={form.role} onChange={onChange} />
        </div>
        <div className="field">
          <label htmlFor="level">level</label>
          <select id="level" name="level" value={form.level} onChange={onChange}>
            <option value="junior">junior</option>
            <option value="mid">mid</option>
            <option value="senior">senior</option>
          </select>
        </div>
      </Target>

      <Target id="preview-card" className="preview">
        <span className="stat-label">derived preview</span>
        <p>
          <strong>{form.name || '—'}</strong> · {form.role || '—'} · {form.level}
        </p>
        <code className="mono">{JSON.stringify(form)}</code>
      </Target>
    </div>
  )
}
