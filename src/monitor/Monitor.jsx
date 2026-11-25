import { useEffect, useMemo, useState } from 'react'
import { TOOLS, CATEGORIES, STATUSES } from '../data/inventario'
import {
  initDb,
  saveHostValidated,
  saveMetricValidated,
  getQuarantineLogs,
  clearQuarantineLogs,
  resetToDefaults,
} from './monitorDb'
import {
  validateHost,
  VALID_LICENSES,
} from './monitorValidator'

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

function initSeriesForHosts(hostsList) {
  const now = Date.now()
  const series = {}
  for (const t of hostsList) {
    if (!isUp(t)) continue
    series[t.id] = Array.from({ length: HISTORY }, (_, i) => ({
      t: now - (HISTORY - 1 - i) * POLL_MS,
      v: Math.round(baseLatency(t.id) * (0.8 + Math.random() * 0.4)),
    }))
  }
  return series
}

// Triggers que dependen de los datos de inventario / base de datos.
function inventoryProblems(now, hostsList) {
  const out = []
  for (const t of hostsList) {
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

function latencyProblems(series, hostsList) {
  const out = []
  for (const t of hostsList) {
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

function HostAvailability({ hosts }) {
  const up = hosts.filter(isUp).length
  const down = hosts.length - up
  return (
    <div className="zx-avail-widget">
      <div className="zx-avail-cell up"><strong>{up}</strong><span>Disponibles</span></div>
      <div className="zx-avail-cell down"><strong>{down}</strong><span>No disponibles</span></div>
      <div className="zx-avail-cell"><strong>{hosts.length}</strong><span>Total</span></div>
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
  if (!ids.length) return <p className="zx-empty">Sin métricas disponibles.</p>

  const avg = series[ids[0]].map((_, i) => ({
    t: series[ids[0]][i].t,
    v: ids.reduce((s, id) => s + (series[id]?.[i]?.v || 0), 0) / ids.length,
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

function ExpiringLicenses({ now, hosts }) {
  const rows = hosts
    .filter((t) => t.expiracion)
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

/* ---------- Vistas Principales ---------- */
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

function DashboardView({ problems, series, now, acks, onAck, hosts }) {
  return (
    <div className="zx-dash">
      <Widget title="Problemas por severidad" className="span-2"><SeveritySummary problems={problems} /></Widget>
      <Widget title="Disponibilidad de hosts"><HostAvailability hosts={hosts} /></Widget>
      <Widget title="Latencia de verificación (todos los hosts activos)" className="span-2"><LatencyGraph series={series} /></Widget>
      <Widget title="Licencias próximas a expirar"><ExpiringLicenses now={now} hosts={hosts} /></Widget>
      <Widget title="Problemas por grupo de hosts" className="span-3"><GroupMatrix problems={problems} hosts={hosts} /></Widget>
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

function HostsView({ problems, series, hosts }) {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('')
  const q = query.trim().toLowerCase()
  const rows = hosts.filter((t) => (!group || t.categoria === group) && (!q || t.nombre.toLowerCase().includes(q)))
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

function LatestDataView({ series, now, hosts }) {
  const [group, setGroup] = useState(CATEGORIES[0])
  const filtered = hosts.filter((t) => t.categoria === group)
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
              {filtered.flatMap((t) => {
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

function createInitialHostForm() {
  const today = new Date().toISOString().slice(0, 10)
  const nextYear = new Date(Date.now() + 365 * DAY).toISOString().slice(0, 10)
  return {
    nombre: '',
    categoria: CATEGORIES[0],
    estado: 'Activa',
    version: '1.0.0',
    licencia: 'Suscripción',
    costo: '1200',
    adquisicion: today,
    expiracion: nextYear,
    ultimaActualizacion: today,
  }
}

/* ---------- Vista de Ingesta y Validación (Frontend Pre-DB) ---------- */
function IngestionView({ hosts, onHostAdded, onResetDb }) {
  const [subTab, setSubTab] = useState('form') // 'form' | 'json' | 'quarantine'
  const [quarantineLogs, setQuarantineLogs] = useState([])
  const [form, setForm] = useState(createInitialHostForm)
  const [formFeedback, setFormFeedback] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estado del simulador JSON
  const [jsonInput, setJsonInput] = useState(() => JSON.stringify({
    nombre: 'Datadog Agent Clinic',
    categoria: 'Entorno / CLI',
    estado: 'Activa',
    version: '7.45.0',
    licencia: 'Suscripción',
    costo: 2400,
    adquisicion: '2026-01-15',
    expiracion: '2027-01-15',
    ultimaActualizacion: '2026-03-01'
  }, null, 2))
  const [jsonFeedback, setJsonFeedback] = useState(null)

  // Carga de bitácora de cuarentena
  const refreshQuarantine = async () => {
    const logs = await getQuarantineLogs()
    setQuarantineLogs(logs)
  }

  useEffect(() => {
    let isMounted = true
    getQuarantineLogs().then((logs) => {
      if (isMounted) setQuarantineLogs(logs)
    })
    return () => {
      isMounted = false
    }
  }, [])

  // Manejo de envío de formulario de host
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormFeedback(null)

    // Pre-validación inmediata en frontend
    const preCheck = validateHost(form, hosts)

    if (!preCheck.isValid) {
      // Bloqueo antes de tocar la base de datos
      const res = await saveHostValidated(form)
      setFormFeedback({
        type: 'error',
        title: '⛔ Carga a la Base de Datos DENEGADA',
        message: 'Los datos no pasaron el filtro de validación en el frontend. No se realizó ninguna escritura en la base de datos.',
        errors: res.validation.errors,
      })
      await refreshQuarantine()
      setIsSubmitting(false)
      return
    }

    // Si es válido, ejecutar la persistencia en IndexedDB
    const res = await saveHostValidated(form)
    if (res.success) {
      setFormFeedback({
        type: 'success',
        title: '✅ Validación Exitosa y Carga Aprobada',
        message: `El host "${res.host.nombre}" superó todas las reglas de esquema e integridad y fue persistido en IndexedDB.`,
        sanitized: res.host,
      })
      onHostAdded(res.host)
      setForm(createInitialHostForm())
    } else {
      setFormFeedback({
        type: 'error',
        title: '⛔ Error al persistir en BD',
        message: res.message,
        errors: res.validation?.errors || {},
      })
    }
    await refreshQuarantine()
    setIsSubmitting(false)
  }

  // Ejecución del simulador de JSON
  const handleRunJsonValidation = async () => {
    setJsonFeedback(null)
    let parsed = null

    try {
      parsed = JSON.parse(jsonInput)
    } catch (err) {
      setJsonFeedback({
        status: 'PARSE_ERROR',
        verdict: 'RECHAZADO: JSON MALFORMADO',
        color: '#e45959',
        details: [`Error de sintaxis: ${err.message}`],
      })
      return
    }

    // Detectar si es métrica o host
    const isMetric = parsed && ('latency' in parsed || 'v' in parsed) && 'hostId' in parsed

    if (isMetric) {
      const res = await saveMetricValidated(parsed)
      await refreshQuarantine()
      if (res.success) {
        setJsonFeedback({
          status: 'APPROVED',
          verdict: 'APROBADO PARA BASE DE DATOS',
          color: '#59db8f',
          details: [
            'Esquema de métrica verificado.',
            `Host ID ${res.metric.hostId} validado y existente en BD.`,
            `Latencia de ${res.metric.v} ms dentro de límites operativos (1 - 15,000 ms).`,
            `Métrica persistida en el Store "metrics" de IndexedDB.`,
          ],
          data: res.metric,
        })
      } else {
        setJsonFeedback({
          status: 'REJECTED',
          verdict: 'BLOQUEADO: VIOLACIÓN DE INTEGRIDAD',
          color: '#e45959',
          details: Object.entries(res.validation.errors).map(([k, v]) => `Campo "${k}": ${v}`),
          quarantineNote: 'El registro no tocó el store de métricas. Se archivó en la bitácora de cuarentena.',
        })
      }
    } else {
      // Validar como Host
      const res = await saveHostValidated(parsed)
      await refreshQuarantine()
      if (res.success) {
        onHostAdded(res.host)
        setJsonFeedback({
          status: 'APPROVED',
          verdict: 'APROBADO PARA BASE DE DATOS',
          color: '#59db8f',
          details: [
            'Esquema de host verificado.',
            'Categoría, estado y tipo de licencia validados contra catálogo.',
            'Coherencia cronológica de fechas verificada (adquisición <= expiración).',
            'Host insertado en el Store "hosts" de IndexedDB y reflejado en el monitor.',
          ],
          data: res.host,
        })
      } else {
        setJsonFeedback({
          status: 'REJECTED',
          verdict: 'BLOQUEADO ANTES DE CARGAR A BD',
          color: '#e45959',
          details: Object.entries(res.validation.errors).map(([k, v]) => `Campo "${k}": ${v}`),
          quarantineNote: 'La transacción fue abortada. El payload quedó aislado en cuarentena.',
        })
      }
    }
  }

  // Presets para pruebas rápidas
  const loadPreset = (preset) => {
    setJsonFeedback(null)
    if (preset === 'valid_host') {
      setJsonInput(JSON.stringify({
        nombre: 'K6 Performance Tester',
        categoria: 'Cliente API',
        estado: 'Activa',
        version: '0.48.0',
        licencia: 'Open Source',
        costo: 0,
        adquisicion: '2026-02-10',
        expiracion: null,
        ultimaActualizacion: '2026-03-01'
      }, null, 2))
    } else if (preset === 'bad_cost_dates') {
      setJsonInput(JSON.stringify({
        nombre: 'Servicio Inseguro DB',
        categoria: 'IDE',
        estado: 'Activa',
        version: '1.0',
        licencia: 'Suscripción',
        costo: -1500, // ERROR: negativo
        adquisicion: '2026-10-20',
        expiracion: '2025-01-01', // ERROR: expiración anterior a adquisición
        ultimaActualizacion: '2026-10-20'
      }, null, 2))
    } else if (preset === 'injection_category') {
      setJsonInput(JSON.stringify({
        nombre: '<script>alert("hack")</script>', // ERROR: XSS y caracteres ilegales
        categoria: 'Categoria_Inexistente', // ERROR: fuera de catálogo
        estado: 'NoExiste', // ERROR: estado inválido
        version: 'v999',
        licencia: 'Gratis Ilegal', // ERROR: licencia inválida
        costo: 9999999, // ERROR: excede límite
        adquisicion: '2099-12-31', // ERROR: fecha en el futuro lejano
      }, null, 2))
    } else if (preset === 'valid_metric') {
      setJsonInput(JSON.stringify({
        hostId: hosts[0]?.id || 1,
        latency: 145,
        t: Date.now()
      }, null, 2))
    } else if (preset === 'invalid_metric') {
      setJsonInput(JSON.stringify({
        hostId: 999999, // ERROR: host no existe
        latency: 85000, // ERROR: latencia absurda (> 15000 ms)
        t: Date.now() + 86400000 // ERROR: fecha en el futuro
      }, null, 2))
    }
  }

  const handleClearQuarantine = async () => {
    await clearQuarantineLogs()
    await refreshQuarantine()
  }

  return (
    <div className="zx-ingestion">
      {/* Resumen de estado de base de datos */}
      <div className="zx-db-status-bar">
        <div className="zx-db-metric">
          <span className="zx-db-lbl">Hosts en Base de Datos:</span>
          <span className="zx-db-val highlight">{hosts.length}</span>
        </div>
        <div className="zx-db-metric">
          <span className="zx-db-lbl">Almacenamiento Local:</span>
          <span className="zx-db-val">IndexedDB (IATECH_Monitor_DB)</span>
        </div>
        <div className="zx-db-metric">
          <span className="zx-db-lbl">Payloads en Cuarentena:</span>
          <span className={`zx-db-val ${quarantineLogs.length > 0 ? 'bad' : 'good'}`}>
            {quarantineLogs.length}
          </span>
        </div>
        <div className="zx-db-actions">
          <button type="button" className="zx-btn-secondary" onClick={onResetDb}>
            Restablecer BD
          </button>
        </div>
      </div>

      {/* Banner de flujo de validación */}
      <div className="zx-pipeline-card">
        <h3>Pipeline de Validación Pre-Carga (Frontend Security & Integrity)</h3>
        <p className="small">
          Todo dato entrante (hosts o telemetría de monitoreo) es sometido a un motor de reglas en memoria.
          Si se detecta cualquier inconsistencia, error de tipo, fechas incoherentes o inyección de caracteres,
          la transacción hacia la base de datos se <strong>aborta de inmediato</strong> y el payload se desvía a cuarentena.
        </p>
        <div className="zx-pipeline-steps">
          <div className="zx-pstep">
            <span className="step-tag">Paso 1</span>
            <strong>Entrada de Datos</strong>
            <small>Formulario o payload JSON de agente</small>
          </div>
          <div className="zx-parrow">➔</div>
          <div className="zx-pstep focus">
            <span className="step-tag">Paso 2</span>
            <strong>Validador Frontend</strong>
            <small>Esquema, rangos, tipos y sanitización</small>
          </div>
          <div className="zx-parrow">➔</div>
          <div className="zx-pstep decision">
            <span className="step-tag">Paso 3</span>
            <strong>Veredicto Estricto</strong>
            <small>¿Pasa reglas de integridad?</small>
          </div>
          <div className="zx-parrow">➔</div>
          <div className="zx-pstep approved">
            <span className="step-tag">Éxito</span>
            <strong>Base de Datos</strong>
            <small>IndexedDB + render en Monitor</small>
          </div>
        </div>
      </div>

      {/* Sub-navegación interna */}
      <div className="zx-subnav">
        <button
          type="button"
          className={subTab === 'form' ? 'active' : ''}
          onClick={() => setSubTab('form')}
        >
          Formulario de Ingesta
        </button>
        <button
          type="button"
          className={subTab === 'json' ? 'active' : ''}
          onClick={() => setSubTab('json')}
        >
          Simulador de Payloads JSON
        </button>
        <button
          type="button"
          className={subTab === 'quarantine' ? 'active' : ''}
          onClick={() => setSubTab('quarantine')}
        >
          Bitácora de Cuarentena ({quarantineLogs.length})
        </button>
      </div>

      {/* SUBTAB 1: FORMULARIO */}
      {subTab === 'form' && (
        <Widget title="Registro de Nuevo Host para Monitoreo (Pre-validado)">
          <form className="zx-form" onSubmit={handleFormSubmit}>
            <div className="zx-form-grid">
              <label>
                Nombre del Host / Herramienta *
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Prometheus Server"
                  required
                />
              </label>

              <label>
                Grupo / Categoría *
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label>
                Estado de Funcionamiento *
                <select
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>

              <label>
                Versión Aprobada *
                <input
                  type="text"
                  value={form.version}
                  onChange={(e) => setForm({ ...form, version: e.target.value })}
                  placeholder="Ej: 2.14.0"
                  required
                />
              </label>

              <label>
                Tipo de Licencia *
                <select
                  value={form.licencia}
                  onChange={(e) => setForm({ ...form, licencia: e.target.value })}
                >
                  {VALID_LICENSES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </label>

              <label>
                Costo Total (USD) *
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.costo}
                  onChange={(e) => setForm({ ...form, costo: e.target.value })}
                  placeholder="Ej: 1200"
                  required
                />
              </label>

              <label>
                Fecha de Adquisición *
                <input
                  type="date"
                  value={form.adquisicion}
                  onChange={(e) => setForm({ ...form, adquisicion: e.target.value })}
                  required
                />
              </label>

              <label>
                Fecha de Expiración (Opcional si es perpetua)
                <input
                  type="date"
                  value={form.expiracion || ''}
                  onChange={(e) => setForm({ ...form, expiracion: e.target.value })}
                />
              </label>

              <label>
                Fecha de Última Actualización *
                <input
                  type="date"
                  value={form.ultimaActualizacion}
                  onChange={(e) => setForm({ ...form, ultimaActualizacion: e.target.value })}
                  required
                />
              </label>
            </div>

            <div className="zx-form-footer">
              <button type="submit" className="zx-btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Validando…' : 'Validar y Cargar a la Base de Datos'}
              </button>
              <button
                type="button"
                className="zx-btn-secondary"
                onClick={() => { setForm(createInitialHostForm()); setFormFeedback(null); }}
              >
                Limpiar Campos
              </button>
            </div>
          </form>

          {/* Feedback del resultado de la validación */}
          {formFeedback && (
            <div className={`zx-alert ${formFeedback.type === 'error' ? 'bad' : 'good'}`}>
              <h4>{formFeedback.title}</h4>
              <p>{formFeedback.message}</p>
              {formFeedback.errors && Object.keys(formFeedback.errors).length > 0 && (
                <ul className="zx-error-list">
                  {Object.entries(formFeedback.errors).map(([field, msg]) => (
                    <li key={field}>
                      <strong>{field}:</strong> {msg}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Widget>
      )}

      {/* SUBTAB 2: SIMULADOR JSON */}
      {subTab === 'json' && (
        <Widget title="Simulador de Payloads de Agente / Telemetría">
          <div className="zx-preset-bar">
            <span>Probar Escenario Rápido:</span>
            <button type="button" className="zx-btn-tag" onClick={() => loadPreset('valid_host')}>
              1. Host Válido
            </button>
            <button type="button" className="zx-btn-tag bad" onClick={() => loadPreset('bad_cost_dates')}>
              2. Costo Negativo & Fechas Invertidas
            </button>
            <button type="button" className="zx-btn-tag bad" onClick={() => loadPreset('injection_category')}>
              3. Inyección XSS & Categoría Inválida
            </button>
            <button type="button" className="zx-btn-tag" onClick={() => loadPreset('valid_metric')}>
              4. Métrica Válida (Telemetría)
            </button>
            <button type="button" className="zx-btn-tag bad" onClick={() => loadPreset('invalid_metric')}>
              5. Métrica Inválida (Latencia 85,000ms)
            </button>
          </div>

          <div className="zx-json-editor-grid">
            <div>
              <label className="zx-area-label">Payload JSON Entrante:</label>
              <textarea
                className="zx-textarea"
                rows={14}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
              />
              <div className="zx-area-actions">
                <button
                  type="button"
                  className="zx-btn-primary"
                  onClick={handleRunJsonValidation}
                >
                  Ejecutar Pipeline de Validación Pre-Carga
                </button>
              </div>
            </div>

            <div>
              <label className="zx-area-label">Diagnóstico del Validador Frontend:</label>
              <div className="zx-diagnostics-box">
                {jsonFeedback ? (
                  <div className="zx-diag-content">
                    <div className="zx-diag-header" style={{ borderColor: jsonFeedback.color }}>
                      <span className="zx-diag-verdict" style={{ color: jsonFeedback.color }}>
                        {jsonFeedback.verdict}
                      </span>
                    </div>

                    <div className="zx-diag-list">
                      <strong>Detalle de la evaluación:</strong>
                      <ul>
                        {jsonFeedback.details.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>

                    {jsonFeedback.quarantineNote && (
                      <p className="zx-diag-note">
                        🛡️ <strong>Garantía de Integridad:</strong> {jsonFeedback.quarantineNote}
                      </p>
                    )}

                    {jsonFeedback.data && (
                      <div className="zx-diag-sanitized">
                        <small>Estructura normalizada y persistida en BD:</small>
                        <pre>{JSON.stringify(jsonFeedback.data, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="zx-diag-empty">
                    <p>Haz clic en <strong>"Ejecutar Pipeline de Validación"</strong> para procesar el payload.</p>
                    <small>El validador inspeccionará tipos, rangos y coherencia sin intervención del backend.</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Widget>
      )}

      {/* SUBTAB 3: CUARENTENA */}
      {subTab === 'quarantine' && (
        <Widget title="Bitácora de Cargas Rechazadas (Cuarentena)">
          <div className="zx-quarantine-bar">
            <p className="small">
              Registros que intentaron ser cargados hacia la base de datos pero fueron interceptados y
              bloqueados por la capa de validación en el frontend.
            </p>
            {quarantineLogs.length > 0 && (
              <button type="button" className="zx-btn-secondary" onClick={handleClearQuarantine}>
                Limpiar Historial de Cuarentena
              </button>
            )}
          </div>

          {quarantineLogs.length === 0 ? (
            <p className="zx-empty">No hay registros rechazados en cuarentena. La base de datos está limpia.</p>
          ) : (
            <div className="zx-table-wrap">
              <table className="zx-table">
                <thead>
                  <tr>
                    <th>Fecha / Hora</th>
                    <th>Tipo</th>
                    <th>Motivo del Bloqueo</th>
                    <th>Errores Detectados</th>
                    <th>Payload Rechazado</th>
                  </tr>
                </thead>
                <tbody>
                  {quarantineLogs.map((log) => (
                    <tr key={log.id || log.timestamp}>
                      <td className="zx-nowrap">{fmtDate(new Date(log.timestamp))}</td>
                      <td>
                        <span className="zx-qtag">{log.type}</span>
                      </td>
                      <td>{log.reason}</td>
                      <td>
                        <ul className="zx-qerrors">
                          {log.errors && Object.entries(log.errors).map(([k, v]) => (
                            <li key={k}>
                              <code>{k}</code>: {v}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        <pre className="zx-qpayload">
                          {JSON.stringify(log.rawPayload, null, 1)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Widget>
      )}
    </div>
  )
}

const VIEWS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'problems', label: 'Problemas' },
  { id: 'hosts', label: 'Hosts' },
  { id: 'latest', label: 'Últimos datos' },
  { id: 'ingestion', label: 'Ingesta y Validación' },
]

export default function Monitor() {
  const [view, setView] = useState('dashboard')
  const [now, setNow] = useState(() => new Date())
  const [hosts, setHosts] = useState(TOOLS)
  const [series, setSeries] = useState(() => initSeriesForHosts(TOOLS))
  const [acks, setAcks] = useState({})

  // Carga inicial y reactiva desde la base de datos IndexedDB local
  useEffect(() => {
    initDb().then((dbHosts) => {
      if (dbHosts && dbHosts.length > 0) {
        setHosts(dbHosts)
        setSeries(initSeriesForHosts(dbHosts))
      }
    })
  }, [])

  // Bucle de telemetría / sondeo en vivo
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

  // Cálculo reactivo de problemas sobre los hosts vigentes en la base de datos
  const problems = useMemo(
    () => [...inventoryProblems(now, hosts), ...latencyProblems(series, hosts)].sort((a, b) => b.severity - a.severity || b.since - a.since),
    [now, series, hosts]
  )

  const toggleAck = (key) => setAcks((a) => ({ ...a, [key]: !a[key] }))

  // Al agregar un host validado
  const handleHostAdded = (newHost) => {
    setHosts((prev) => {
      const idx = prev.findIndex((h) => h.id === newHost.id)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = newHost
        return copy
      }
      return [newHost, ...prev]
    })

    // Agregar serie para el nuevo host si está activo
    if (isUp(newHost)) {
      setSeries((prev) => ({
        ...prev,
        [newHost.id]: Array.from({ length: HISTORY }, (_, i) => ({
          t: Date.now() - (HISTORY - 1 - i) * POLL_MS,
          v: Math.round(baseLatency(newHost.id) * (0.8 + Math.random() * 0.4)),
        })),
      }))
    }
  }

  // Restablecer la base de datos
  const handleResetDb = async () => {
    if (window.confirm('¿Deseas restablecer la base de datos local a su estado original de fábrica?')) {
      const restored = await resetToDefaults()
      setHosts(restored)
      setSeries(initSeriesForHosts(restored))
      alert('Base de datos restablecida con éxito.')
    }
  }

  const props = { problems, series, now, acks, onAck: toggleAck, hosts }

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
              {v.id === 'ingestion' && <span className="zx-menu-badge zx-badge-accent">Validar</span>}
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
        {view === 'ingestion' && (
          <IngestionView
            hosts={hosts}
            onHostAdded={handleHostAdded}
            onResetDb={handleResetDb}
          />
        )}

        <footer className="zx-foot">
          Datos de {hosts.length} herramientas en base de datos local (IndexedDB) · Ingesta pre-validada en frontend.
        </footer>
      </main>
    </div>
  )
}
