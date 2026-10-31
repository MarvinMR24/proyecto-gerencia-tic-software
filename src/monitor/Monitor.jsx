import { useEffect, useMemo, useState } from 'react'
import { TOOLS, CATEGORIES } from '../data/inventario'

// Severidades y colores por defecto de Zabbix.
const SEVERITIES = [
  { id: 5, name: 'Desastre', color: '#e45959' },
  { id: 4, name: 'Alta', color: '#e97659' },
  { id: 3, name: 'Media', color: '#ffa059' },
  { id: 2, name: 'Advertencia', color: '#ffc859' },
  { id: 1, name: 'Información', color: '#7499ff' },
  { id: 0, name: 'No clasificado', color: '#97aab3' },
]
const SEV = Object.fromEntries(SEVERITIES.map((s) => [s.id, s]))

const DAY = 86400000
const POLL_MS = 5000
const HISTORY = 40
const LATENCY_LIMIT = 800

const parseDate = (s) => new Date(`${s}T00:00:00`)
const daysUntil = (s, now) => Math.ceil((parseDate(s) - now) / DAY)
const daysSince = (s, now) => Math.floor((now - parseDate(s)) / DAY)
const isUp = (t) => t.estado !== 'Deprecada'

function fmtDate(d) {
  return d.toLocaleString('es-BO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function fmtDuration(ms) {
  const d = Math.floor(ms / DAY)
  const h = Math.floor((ms % DAY) / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${Math.max(m, 0)}m`
}

// Latencia base estable por herramienta (seudoaleatoria a partir del id).
const baseLatency = (id) => 60 + ((id * 7919) % 280)

function nextLatency(id) {
  const base = baseLatency(id)
  if (Math.random() < 0.006) return Math.round(base * 3 + 650 + Math.random() * 400)
  return Math.round(base * (0.8 + Math.random() * 0.4))
}

function initSeries() {
  const now = Date.now()
  const series = {}
  for (const t of TOOLS) {
    if (!isUp(t)) continue
    series[t.id] = Array.from({ length: HISTORY }, (_, i) => ({
      t: now - (HISTORY - 1 - i) * POLL_MS,
      v: Math.round(baseLatency(t.id) * (0.8 + Math.random() * 0.4)),
    }))
  }
  return series
}

// Triggers que dependen solo de los datos del inventario.
function inventoryProblems(now) {
  const out = []
  for (const t of TOOLS) {
    const base = { host: t.nombre, group: t.categoria, hostId: t.id }

    if (t.estado === 'Deprecada') {
      out.push({ ...base, key: `dep-${t.id}`, severity: 4, name: 'Herramienta deprecada sigue en el inventario', since: parseDate(t.ultimaActualizacion) })
    }
    if (t.estado === 'En Evaluación') {
      out.push({ ...base, key: `eval-${t.id}`, severity: 1, name: 'Herramienta en evaluación, pendiente de decisión', since: parseDate(t.adquisicion) })
    }
    if (t.expiracion) {
      const left = daysUntil(t.expiracion, now)
      const rule =
        left < 0 ? { severity: 5, name: 'Licencia expirada', days: 0 }
        : left <= 30 ? { severity: 4, name: `Licencia expira en ${left} días (≤ 30)`, days: 30 }
        : left <= 60 ? { severity: 3, name: `Licencia expira en ${left} días (≤ 60)`, days: 60 }
        : left <= 90 ? { severity: 2, name: `Licencia expira en ${left} días (≤ 90)`, days: 90 }
        : null
      if (rule) {
        out.push({ ...base, key: `exp-${t.id}`, severity: rule.severity, name: rule.name, since: new Date(parseDate(t.expiracion) - rule.days * DAY) })
      }
    }
    const stale = daysSince(t.ultimaActualizacion, now)
    if (stale > 180) {
      out.push({ ...base, key: `stale-${t.id}`, severity: 2, name: `Versión sin actualizar hace ${stale} días (> 180)`, since: new Date(parseDate(t.ultimaActualizacion).getTime() + 180 * DAY) })
    }
  }
  return out
}

function latencyProblems(series) {
  const out = []
  for (const t of TOOLS) {
    const points = series[t.id]
    if (!points) continue
    let i = points.length - 1
    if (points[i].v <= LATENCY_LIMIT) continue
    while (i > 0 && points[i - 1].v > LATENCY_LIMIT) i--
    out.push({
      host: t.nombre, group: t.categoria, hostId: t.id, key: `lat-${t.id}`, severity: 3,
      name: `Latencia de verificación alta (${points[points.length - 1].v} ms > ${LATENCY_LIMIT} ms)`,
      since: new Date(points[i].t),
    })
  }
  return out
}

function SeverityBadge({ id }) {
  const s = SEV[id]
  return (
    <span className="zx-sev" style={{ background: s.color }}>
      {s.name}
    </span>
  )
}

function Availability({ up }) {
  return <span className={`zx-avail ${up ? 'up' : 'down'}`}>ZBX</span>
}

/* ---------- Widgets ---------- */
function Widget({ title, children, className = '' }) {
  return (
    <section className={`zx-widget ${className}`}>
      <header className="zx-widget-head">{title}</header>
      <div className="zx-widget-body">{children}</div>
    </section>
  )
}

function SeveritySummary({ problems }) {
  return (
    <div className="zx-sev-grid">
      {SEVERITIES.map((s) => {
        const n = problems.filter((p) => p.severity === s.id).length
        return (
          <div key={s.id} className={`zx-sev-tile ${n ? '' : 'empty'}`} style={{ '--sev': s.color }}>
            <strong>{n}</strong>
            <span>{s.name}</span>
          </div>
        )
      })}
    </div>
  )
}

function HostAvailability() {
  const up = TOOLS.filter(isUp).length
  const down = TOOLS.length - up
  return (
    <div className="zx-avail-widget">
      <div className="zx-avail-cell up"><strong>{up}</strong><span>Disponibles</span></div>
      <div className="zx-avail-cell down"><strong>{down}</strong><span>No disponibles</span></div>
      <div className="zx-avail-cell"><strong>{TOOLS.length}</strong><span>Total</span></div>
    </div>
  )
}

function GroupMatrix({ problems }) {
  const sevs = SEVERITIES.slice(0, 5)
  return (
    <div className="zx-table-wrap">
      <table className="zx-table">
        <thead>
          <tr>
            <th>Grupo de hosts</th>
            {sevs.map((s) => <th key={s.id}>{s.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map((g) => (
            <tr key={g}>
              <td>{g}</td>
              {sevs.map((s) => {
                const n = problems.filter((p) => p.group === g && p.severity === s.id).length
                return (
                  <td key={s.id}>
                    {n > 0 && <span className="zx-count" style={{ background: s.color }}>{n}</span>}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LatencyGraph({ series }) {
  const W = 640
  const H = 220
  const M = { top: 16, right: 12, bottom: 26, left: 44 }
  const ids = Object.keys(series)
  const avg = series[ids[0]].map((_, i) => ({
    t: series[ids[0]][i].t,
    v: ids.reduce((s, id) => s + series[id][i].v, 0) / ids.length,
  }))
  const max = Math.max(400, Math.ceil(Math.max(...avg.map((p) => p.v)) / 100) * 100)
  const x = (i) => M.left + (i / (avg.length - 1)) * (W - M.left - M.right)
  const y = (v) => M.top + (1 - v / max) * (H - M.top - M.bottom)
  const ticks = [0, max / 2, max]
  const line = avg.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ')
  const last = avg[avg.length - 1]

  return (
    <div>
      <div className="zx-graph-legend">
        <span className="zx-graph-key" /> Latencia promedio · último valor <strong>{Math.round(last.v)} ms</strong>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="zx-graph" role="img" aria-label="Latencia promedio de verificación">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} className="zx-graph-grid" />
            <text x={M.left - 8} y={y(t) + 4} textAnchor="end" className="zx-graph-axis">{Math.round(t)}</text>
          </g>
        ))}
        <path d={`${line} L${x(avg.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} className="zx-graph-area" />
        <path d={line} className="zx-graph-line" />
        <text x={M.left} y={H - 6} className="zx-graph-axis">−{Math.round(((avg.length - 1) * POLL_MS) / 1000)} s</text>
        <text x={W - M.right} y={H - 6} textAnchor="end" className="zx-graph-axis">ahora</text>
      </svg>
    </div>
  )
}

function ExpiringLicenses({ now }) {
  const rows = TOOLS.filter((t) => t.expiracion)
    .map((t) => ({ ...t, left: daysUntil(t.expiracion, now) }))
    .sort((a, b) => a.left - b.left)
    .slice(0, 8)
  return (
    <div className="zx-table-wrap">
      <table className="zx-table">
        <thead>
          <tr><th>Host</th><th>Expira</th><th>Días</th></tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id}>
              <td>{t.nombre}</td>
              <td>{t.expiracion}</td>
              <td className={t.left <= 60 ? 'zx-text-bad' : ''}>{t.left}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------- Vistas ---------- */
function ProblemsTable({ problems, now, acks, onAck, limit }) {
  const rows = limit ? problems.slice(0, limit) : problems
  if (!rows.length) return <p className="zx-empty">Sin problemas.</p>
  return (
    <div className="zx-table-wrap">
      <table className="zx-table zx-problems">
        <thead>
          <tr>
            <th>Desde</th><th>Severidad</th><th>Host</th><th>Problema</th><th>Duración</th><th>Reconocido</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.key}>
              <td className="zx-nowrap">{fmtDate(p.since)}</td>
              <td><SeverityBadge id={p.severity} /></td>
              <td className="zx-nowrap">{p.host}</td>
              <td>{p.name}</td>
              <td className="zx-nowrap">{fmtDuration(now - p.since)}</td>
              <td>
                <button type="button" className={`zx-ack ${acks[p.key] ? 'yes' : ''}`} onClick={() => onAck(p.key)}>
                  {acks[p.key] ? 'Sí' : 'No'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DashboardView({ problems, series, now, acks, onAck }) {
  return (
    <div className="zx-dash">
      <Widget title="Problemas por severidad" className="span-2"><SeveritySummary problems={problems} /></Widget>
      <Widget title="Disponibilidad de hosts"><HostAvailability /></Widget>
      <Widget title="Latencia de verificación (todos los hosts activos)" className="span-2"><LatencyGraph series={series} /></Widget>
      <Widget title="Licencias próximas a expirar"><ExpiringLicenses now={now} /></Widget>
      <Widget title="Problemas por grupo de hosts" className="span-3"><GroupMatrix problems={problems} /></Widget>
      <Widget title="Problemas actuales" className="span-3">
        <ProblemsTable problems={problems} now={now} acks={acks} onAck={onAck} limit={10} />
      </Widget>
    </div>
  )
}

function ProblemsView({ problems, now, acks, onAck }) {
  const [group, setGroup] = useState('')
  const [minSev, setMinSev] = useState(0)
  const [hideAck, setHideAck] = useState(false)
  const rows = problems.filter(
    (p) => (!group || p.group === group) && p.severity >= minSev && !(hideAck && acks[p.key])
  )
  return (
    <>
      <div className="zx-filters">
        <label>
          Grupo
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="">Todos</option>
            {CATEGORIES.map((g) => <option key={g}>{g}</option>)}
          </select>
        </label>
        <label>
          Severidad mínima
          <select value={minSev} onChange={(e) => setMinSev(Number(e.target.value))}>
            {[...SEVERITIES].reverse().map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label className="zx-check">
          <input type="checkbox" checked={hideAck} onChange={(e) => setHideAck(e.target.checked)} />
          Ocultar reconocidos
        </label>
        <span className="zx-filter-count">{rows.length} problemas</span>
      </div>
      <Widget title="Problemas"><ProblemsTable problems={rows} now={now} acks={acks} onAck={onAck} /></Widget>
    </>
  )
}

function HostsView({ problems, series }) {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('')
  const q = query.trim().toLowerCase()
  const rows = TOOLS.filter((t) => (!group || t.categoria === group) && (!q || t.nombre.toLowerCase().includes(q)))
  return (
    <>
      <div className="zx-filters">
        <label>
          Nombre
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar host…" />
        </label>
        <label>
          Grupo
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="">Todos</option>
            {CATEGORIES.map((g) => <option key={g}>{g}</option>)}
          </select>
        </label>
        <span className="zx-filter-count">{rows.length} hosts</span>
      </div>
      <Widget title="Hosts">
        <div className="zx-table-wrap">
          <table className="zx-table">
            <thead>
              <tr><th>Nombre</th><th>Grupo</th><th>Disponibilidad</th><th>Estado</th><th>Versión</th><th>Licencia</th><th>Latencia</th><th>Problemas</th></tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const own = problems.filter((p) => p.hostId === t.id)
                const worst = own.reduce((m, p) => Math.max(m, p.severity), -1)
                const pts = series[t.id]
                return (
                  <tr key={t.id}>
                    <td className="zx-nowrap">{t.nombre}</td>
                    <td className="zx-nowrap">{t.categoria}</td>
                    <td><Availability up={isUp(t)} /></td>
                    <td>{t.estado}</td>
                    <td className="zx-mono">{t.version}</td>
                    <td className="zx-nowrap">{t.licencia}</td>
                    <td className="zx-mono">{pts ? `${pts[pts.length - 1].v} ms` : '—'}</td>
                    <td>{own.length > 0 && <span className="zx-count" style={{ background: SEV[worst].color }}>{own.length}</span>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Widget>
    </>
  )
}

function LatestDataView({ series, now }) {
  const [group, setGroup] = useState(CATEGORIES[0])
  const hosts = TOOLS.filter((t) => t.categoria === group)
  return (
    <>
      <div className="zx-filters">
        <label>
          Grupo de hosts
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            {CATEGORIES.map((g) => <option key={g}>{g}</option>)}
          </select>
        </label>
      </div>
      <Widget title={`Últimos datos · ${group}`}>
        <div className="zx-table-wrap">
          <table className="zx-table">
            <thead>
              <tr><th>Host</th><th>Item</th><th>Último chequeo</th><th>Último valor</th><th>Cambio</th></tr>
            </thead>
            <tbody>
              {hosts.flatMap((t) => {
                const pts = series[t.id]
                const last = pts?.[pts.length - 1]
                const prev = pts?.[pts.length - 2]
                const items = [
                  { name: 'Disponibilidad del agente', value: isUp(t) ? 'Disponible (1)' : 'No disponible (0)', check: now },
                  { name: 'Latencia de verificación', value: last ? `${last.v} ms` : '—', change: last && prev ? last.v - prev.v : null, check: last ? new Date(last.t) : null },
                  { name: 'Estado de funcionamiento', value: t.estado, check: now },
                  { name: 'Días para expirar licencia', value: t.expiracion ? daysUntil(t.expiracion, now) : 'Perpetua', check: now },
                  { name: 'Días desde última actualización', value: daysSince(t.ultimaActualizacion, now), check: now },
                  { name: 'Costo anual (USD)', value: `$${t.costo.toLocaleString('en-US')}`, check: now },
                ]
                return items.map((it, i) => (
                  <tr key={`${t.id}-${it.name}`} className={i === 0 ? 'zx-host-first' : ''}>
                    <td className="zx-nowrap">{i === 0 ? t.nombre : ''}</td>
                    <td>{it.name}</td>
                    <td className="zx-nowrap">{it.check ? new Date(it.check).toLocaleTimeString('es-BO') : '—'}</td>
                    <td className="zx-mono">{it.value}</td>
                    <td className="zx-mono">{it.change != null ? `${it.change > 0 ? '+' : ''}${it.change}` : ''}</td>
                  </tr>
                ))
              })}
            </tbody>
          </table>
        </div>
      </Widget>
    </>
  )
}

const VIEWS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'problems', label: 'Problemas' },
  { id: 'hosts', label: 'Hosts' },
  { id: 'latest', label: 'Últimos datos' },
]

export default function Monitor() {
  const [view, setView] = useState('dashboard')
  const [now, setNow] = useState(() => new Date())
  const [series, setSeries] = useState(initSeries)
  const [acks, setAcks] = useState({})

  useEffect(() => {
    const timer = setInterval(() => {
      const t = Date.now()
      setNow(new Date(t))
      setSeries((prev) => {
        const next = {}
        for (const id of Object.keys(prev)) {
          next[id] = [...prev[id].slice(1), { t, v: nextLatency(Number(id)) }]
        }
        return next
      })
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [])

  const problems = useMemo(
    () => [...inventoryProblems(now), ...latencyProblems(series)].sort((a, b) => b.severity - a.severity || b.since - a.since),
    [now, series]
  )

  const toggleAck = (key) => setAcks((a) => ({ ...a, [key]: !a[key] }))
  const props = { problems, series, now, acks, onAck: toggleAck }

  return (
    <div className="zx-app">
      <aside className="zx-side">
        <div className="zx-brand">
          <span className="zx-brand-mark">IA</span>
          <div>
            <strong>IATECH Monitor</strong>
            <small>Simulación estilo Zabbix</small>
          </div>
        </div>
        <nav className="zx-menu">
          <span className="zx-menu-title">Monitoreo</span>
          {VIEWS.map((v) => (
            <button key={v.id} type="button" className={view === v.id ? 'active' : ''} onClick={() => setView(v.id)}>
              {v.label}
              {v.id === 'problems' && <span className="zx-menu-badge">{problems.length}</span>}
            </button>
          ))}
        </nav>
        <a className="zx-back" href="/">← Volver al sitio</a>
      </aside>

      <main className="zx-main">
        <header className="zx-top">
          <h1>{VIEWS.find((v) => v.id === view).label}</h1>
          <span className="zx-live"><span className="zx-live-dot" /> En vivo · actualizado {now.toLocaleTimeString('es-BO')}</span>
        </header>

        {view === 'dashboard' && <DashboardView {...props} />}
        {view === 'problems' && <ProblemsView {...props} />}
        {view === 'hosts' && <HostsView {...props} />}
        {view === 'latest' && <LatestDataView {...props} />}

        <footer className="zx-foot">
          Datos de {TOOLS.length} herramientas del inventario de desarrollo · la latencia es simulada en el navegador.
        </footer>
      </main>
    </div>
  )
}
