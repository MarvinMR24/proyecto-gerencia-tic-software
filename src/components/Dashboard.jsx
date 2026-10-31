import { useRef, useState } from 'react'
import {
  TOOLS,
  CATEGORIES,
  CATEGORY_COLORS,
  LICENSE_COLORS,
  STATUSES,
  costByCategory,
  statusByCategory,
  licenseByCategory,
  totalCost,
  countBy,
  csvUrl,
} from '../data/inventario'
import Reveal from './Reveal'

// Cuando se agregue el libro de Tableau (.twbx) a /public, poner aquí su ruta, ej. '/dashboard.twbx'.
const TABLEAU_URL = null

const usd = (n) => `$${n.toLocaleString('en-US')}`

// Rellenos claros llevan texto oscuro, como en Tableau.
const DARK_TEXT_FILLS = new Set(['#76b7b2', '#edc948', '#f28e2b'])
const labelColor = (fill) => (DARK_TEXT_FILLS.has(fill) ? '#1c1834' : '#ffffff')

function useTooltip() {
  const ref = useRef(null)
  const [tip, setTip] = useState(null)

  function show(e, content) {
    const box = ref.current.getBoundingClientRect()
    const x = e.clientX - box.left
    setTip({ x, y: e.clientY - box.top, flip: x > box.width - 220, content })
  }

  const node = tip && (
    <div className={`chart-tooltip ${tip.flip ? 'flip' : ''}`} style={{ left: tip.x, top: tip.y }}>
      {tip.content}
    </div>
  )

  return { ref, show, hide: () => setTip(null), node }
}

function TipRow({ color, value, label }) {
  return (
    <div className="chart-tooltip-row">
      <span className="chart-tooltip-key" style={{ background: color }} />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

/* ---------- 1. Barras: costo por categoría ---------- */
function CostBarChart() {
  const { ref, show, hide, node } = useTooltip()
  const W = 760
  const H = 420
  const M = { top: 28, right: 12, bottom: 44, left: 56 }
  const max = 24000
  const ticks = [0, 4000, 8000, 12000, 16000, 20000, 24000]
  const plotW = W - M.left - M.right
  const plotH = H - M.top - M.bottom
  const band = plotW / costByCategory.length
  const barW = band * 0.62
  const y = (v) => M.top + plotH - (v / max) * plotH

  return (
    <div className="chart-box" ref={ref} onPointerLeave={hide}>
      <div className="chart-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg chart-svg-wide" role="img" aria-label="Costo USD por categoría de herramienta">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} className={t === 0 ? 'chart-baseline' : 'chart-grid'} />
              <text x={M.left - 10} y={y(t) + 4} textAnchor="end" className="chart-axis">
                {t / 1000}K
              </text>
            </g>
          ))}
          <text transform={`translate(16 ${M.top + plotH / 2}) rotate(-90)`} textAnchor="middle" className="chart-axis-title">
            Costo total USD
          </text>

          {costByCategory.map((d, i) => {
            const x = M.left + i * band + (band - barW) / 2
            const top = y(d.costo)
            const h = M.top + plotH - top
            const r = Math.min(4, h)
            const color = CATEGORY_COLORS[d.categoria]
            const share = ((d.costo / totalCost) * 100).toFixed(0)
            return (
              <g
                key={d.categoria}
                className="chart-mark"
                tabIndex={0}
                onPointerMove={(e) =>
                  show(e, (
                    <>
                      <TipRow color={color} value={usd(d.costo)} label={d.categoria} />
                      <div className="chart-tooltip-sub">{share}% del costo total</div>
                    </>
                  ))
                }
              >
                <rect x={M.left + i * band} y={M.top} width={band} height={plotH} fill="transparent" />
                {h > 0 && (
                  <path
                    d={`M${x},${top + h} V${top + r} Q${x},${top} ${x + r},${top} H${x + barW - r} Q${x + barW},${top} ${x + barW},${top + r} V${top + h} Z`}
                    fill={color}
                  />
                )}
                <text x={x + barW / 2} y={top - 8} textAnchor="middle" className="chart-value">
                  {usd(d.costo)}
                </text>
                <text x={x + barW / 2} y={H - 16} textAnchor="middle" className="chart-axis chart-axis-cat">
                  {d.categoria}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      {node}
    </div>
  )
}

/* ---------- 2. Treemap: cantidad por categoría y estado ---------- */
function squarify(items, rect) {
  const total = items.reduce((s, i) => s + i.value, 0)
  const scale = (rect.w * rect.h) / total
  const rest = items.map((i) => ({ ...i, area: i.value * scale }))
  const out = []
  let { x, y, w, h } = rect
  let row = []

  const worst = (r, side) => {
    const s = r.reduce((a, n) => a + n.area, 0)
    const mx = Math.max(...r.map((n) => n.area))
    const mn = Math.min(...r.map((n) => n.area))
    return Math.max((side * side * mx) / (s * s), (s * s) / (side * side * mn))
  }

  const layoutRow = () => {
    const s = row.reduce((a, n) => a + n.area, 0)
    if (w >= h) {
      const colW = s / h
      let cy = y
      for (const n of row) {
        const nh = n.area / colW
        out.push({ ...n, x, y: cy, w: colW, h: nh })
        cy += nh
      }
      x += colW
      w -= colW
    } else {
      const rowH = s / w
      let cx = x
      for (const n of row) {
        const nw = n.area / rowH
        out.push({ ...n, x: cx, y, w: nw, h: rowH })
        cx += nw
      }
      y += rowH
      h -= rowH
    }
    row = []
  }

  while (rest.length) {
    const side = Math.min(w, h)
    if (row.length === 0 || worst([...row, rest[0]], side) <= worst(row, side)) {
      row.push(rest.shift())
    } else {
      layoutRow()
    }
  }
  if (row.length) layoutRow()
  return out
}

function StatusTreemap() {
  const { ref, show, hide, node } = useTooltip()
  const W = 1000
  const H = 620
  const GAP = 3

  const groups = squarify(
    [...statusByCategory].sort((a, b) => b.total - a.total).map((c) => ({ ...c, value: c.total })),
    { x: 0, y: 0, w: W, h: H }
  )

  const cells = groups.flatMap((g) =>
    squarify(
      STATUSES.filter((s) => g.estados[s])
        .map((estado) => ({ categoria: g.categoria, total: g.total, estado, value: g.estados[estado] }))
        .sort((a, b) => b.value - a.value),
      { x: g.x + GAP, y: g.y + GAP, w: g.w - GAP * 2, h: g.h - GAP * 2 }
    )
  )

  return (
    <div className="chart-box" ref={ref} onPointerLeave={hide}>
      <div className="chart-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg chart-svg-wide" role="img" aria-label="Cantidad de herramientas por categoría y estado">
          {cells.map((c) => {
            const color = CATEGORY_COLORS[c.categoria]
            const ink = labelColor(color)
            // Solo se etiqueta si el texto entra en el rectángulo (ancho aproximado por carácter).
            const textW = Math.max(c.categoria.length * 7.5, `${c.estado} · ${c.value}`.length * 6.6)
            const roomy = c.h > 52 && textW + 20 < c.w
            return (
              <g
                key={`${c.categoria}-${c.estado}`}
                className="chart-mark"
                tabIndex={0}
                onPointerMove={(e) =>
                  show(e, (
                    <>
                      <TipRow color={color} value={`${c.value} herramientas`} label={`${c.categoria} · ${c.estado}`} />
                      <div className="chart-tooltip-sub">
                        {Math.round((c.value / c.total) * 100)}% de la categoría
                      </div>
                    </>
                  ))
                }
              >
                <rect x={c.x + 1} y={c.y + 1} width={Math.max(c.w - 2, 0)} height={Math.max(c.h - 2, 0)} rx="4" fill={color} />
                {roomy && (
                  <text x={c.x + 12} y={c.y + 24} fill={ink} className="treemap-label">
                    <tspan x={c.x + 12}>{c.categoria}</tspan>
                    <tspan x={c.x + 12} dy="20" className="treemap-sub">
                      {c.estado} · {c.value}
                    </tspan>
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
      {node}
      <p className="chart-note">
        Los rectángulos sin etiqueta son grupos pequeños; pasa el cursor sobre ellos para ver su estado y cantidad.
      </p>
    </div>
  )
}

/* ---------- 3. Tortas: licencia por categoría ---------- */
const LICENSES = Object.keys(LICENSE_COLORS)
const MAX_TOTAL = Math.max(...licenseByCategory.map((c) => c.total))
const MAX_R = 64
const radiusFor = (n) => Math.sqrt(n / MAX_TOTAL) * MAX_R

function slicePath(cx, cy, r, a0, a1) {
  if (a1 - a0 >= Math.PI * 2 - 1e-6) {
    return `M${cx},${cy - r} A${r},${r} 0 1 1 ${cx - 0.01},${cy - r} Z`
  }
  const p = (a) => [cx + r * Math.sin(a), cy - r * Math.cos(a)]
  const [x0, y0] = p(a0)
  const [x1, y1] = p(a1)
  return `M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1},${y1} Z`
}

function LicensePies() {
  const { ref, show, hide, node } = useTooltip()
  const COL = 140
  const W = COL * licenseByCategory.length
  const H = 230
  const cy = 130

  return (
    <div className="chart-box" ref={ref} onPointerLeave={hide}>
      <div className="chart-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg chart-svg-wide" role="img" aria-label="Tipo de licencia por categoría">
          {licenseByCategory.map((c, i) => {
            const cx = COL * i + COL / 2
            const r = radiusFor(c.total)
            let angle = 0
            return (
              <g key={c.categoria}>
                <text x={cx} y={30} textAnchor="middle" className="chart-axis chart-axis-cat">
                  {c.categoria}
                </text>
                <text x={cx} y={H - 10} textAnchor="middle" className="chart-axis">
                  {c.total} herramientas
                </text>
                {LICENSES.filter((l) => c.licencias[l]).map((l) => {
                  const n = c.licencias[l]
                  const a0 = angle
                  angle += (n / c.total) * Math.PI * 2
                  return (
                    <path
                      key={l}
                      d={slicePath(cx, cy, r, a0, angle)}
                      fill={LICENSE_COLORS[l]}
                      className="chart-mark pie-slice"
                      tabIndex={0}
                      onPointerMove={(e) =>
                        show(e, (
                          <>
                            <TipRow color={LICENSE_COLORS[l]} value={`${n} de ${c.total}`} label={l} />
                            <div className="chart-tooltip-sub">{c.categoria}</div>
                          </>
                        ))
                      }
                    />
                  )
                })}
              </g>
            )
          })}
        </svg>
      </div>
      {node}
      <div className="chart-legend">
        {LICENSES.map((l) => (
          <span key={l} className="chart-legend-item">
            <span className="chart-legend-swatch" style={{ background: LICENSE_COLORS[l] }} />
            {l}
          </span>
        ))}
        <span className="chart-legend-item muted">Tamaño del círculo = cantidad de herramientas</span>
      </div>
    </div>
  )
}

/* ---------- Tabla de datos ---------- */
function DataTable() {
  return (
    <details className="chart-table-wrap">
      <summary>Ver tabla de datos por categoría</summary>
      <div className="chart-scroll">
        <table className="chart-table">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Herramientas</th>
              <th>Costo USD</th>
              {STATUSES.map((s) => (
                <th key={s}>{s}</th>
              ))}
              {LICENSES.map((l) => (
                <th key={l}>{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((cat, i) => (
              <tr key={cat}>
                <td>
                  <span className="chart-legend-swatch" style={{ background: CATEGORY_COLORS[cat] }} />
                  {cat}
                </td>
                <td>{statusByCategory[i].total}</td>
                <td>{usd(costByCategory[i].costo)}</td>
                {STATUSES.map((s) => (
                  <td key={s}>{statusByCategory[i].estados[s] || 0}</td>
                ))}
                {LICENSES.map((l) => (
                  <td key={l}>{licenseByCategory[i].licencias[l] || 0}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}

function ChartSection({ number, title, children, analysis }) {
  return (
    <section className="section">
      <Reveal>
        <div className="card dash-card">
          <div className="dash-card-head">
            <span className="step-number dash-number">{number}</span>
            <h2>{title}</h2>
          </div>
          {children}
          <div className="dash-analysis">
            <h3>Análisis</h3>
            {analysis}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export default function Dashboard() {
  const estados = countBy(TOOLS, 'estado')
  const kpis = [
    { label: 'Herramientas en inventario', value: TOOLS.length },
    { label: 'Costo total anual', value: usd(totalCost) },
    { label: 'Activas', value: estados['Activa'] || 0 },
    { label: 'En evaluación', value: estados['En Evaluación'] || 0 },
    { label: 'Deprecadas', value: estados['Deprecada'] || 0 },
  ]

  return (
    <>
      <section className="hero hero-sm">
        <h1>Dashboard</h1>
      </section>

      <section className="section">
        <div className="grid grid-5 kpi-row">
          {kpis.map((k, i) => (
            <Reveal key={k.label} delay={i * 60}>
              <div className="card kpi-tile">
                <span className="kpi-value">{k.value}</span>
                <span className="kpi-label">{k.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="band teal divider">
        <Reveal as="h2" className="band-title light">
          Inventario de herramientas de desarrollo
        </Reveal>
      </section>

      <ChartSection
        number={1}
        title="Costo en USD por categoría de herramienta"
        analysis={
          <p>
            El gráfico muestra que el gasto en herramientas de desarrollo está muy concentrado: Entorno / CLI pesa
            $19,363 y representa casi la mitad (49%) del costo total de $39,301, mientras que ninguna otra categoría
            pasa de $6,100. Le siguen Librería UI ($6,074), Asistente IA ($5,148) y Cliente API ($4,354), y más abajo
            Cliente SQL ($2,645) e IDE ($1,717). Framework aparece prácticamente en cero porque sus 22 herramientas son
            open source. Esto indica que la categoría Entorno / CLI, donde están herramientas como Datadog, GitHub
            Enterprise, SonarQube y Snyk, es la que más conviene revisar al optimizar costos. También conviene vigilar
            el Asistente IA, que con solo 7 herramientas ya iguala a categorías mucho más grandes.
          </p>
        }
      >
        <CostBarChart />
      </ChartSection>

      <ChartSection
        number={2}
        title="Cantidad de herramientas por categoría y estado"
        analysis={
          <p>
            Cada rectángulo es un grupo de herramientas: mientras más grande, más herramientas tiene. Lo que más se ve
            es que la gran mayoría está activa. Entorno / CLI es el bloque más grande, con 30 herramientas activas,
            seguido de Framework con 19 y Librería UI con 12. Los problemas son pocos y se concentran en lugares
            concretos. Cliente SQL tiene 3 herramientas deprecadas, es decir, ya no se mantienen y habría que
            reemplazarlas, y Librería UI tiene 2 más. Asistente IA es la categoría con más movimiento, porque 4 de sus
            7 herramientas siguen en evaluación y todavía no se decide si se adoptan. En resumen, el inventario está
            sano, y lo que conviene revisar son las herramientas deprecadas de Cliente SQL y Librería UI, y definir qué
            pasará con las de Asistente IA que están en evaluación.
          </p>
        }
      >
        <StatusTreemap />
      </ChartSection>

      <ChartSection
        number={3}
        title="Clasificación por cantidad, tipo de licencia y costo"
        analysis={
          <p>
            Cada círculo es una categoría: mientras más grande, más herramientas tiene, y los colores muestran qué tipo
            de licencia usan (azul: comercial, naranja: open source, rojo: suscripción). Predomina el naranja, es
            decir, la mayoría de las herramientas es gratuita. Framework es 100% open source (22 herramientas) y
            Entorno / CLI, la categoría más grande, tiene 21 de 33 open source. Asistente IA es lo contrario: sus 7
            herramientas son todas por suscripción, por eso es la categoría con más costo recurrente en relación con
            su tamaño. Cliente SQL es la única con más licencias comerciales (4 de 11), y en IDE predominan las
            suscripciones (3 de 4).
          </p>
        }
      >
        <LicensePies />
      </ChartSection>

      <section className="section">
        <Reveal>
          <DataTable />
        </Reveal>
      </section>

      <section className="band dark divider">
        <Reveal className="cta-inventario">
          <h2 className="band-title">Descargas</h2>
          <div className="dash-downloads">
            {TABLEAU_URL ? (
              <a href={TABLEAU_URL} download className="cta-inventario-link">
                Descargar dashboard de Tableau ↓
              </a>
            ) : (
              <span className="cta-inventario-link is-disabled" aria-disabled="true">
                Dashboard de Tableau · próximamente
              </span>
            )}
            <a href={csvUrl} download="inventario_herramientas_desarrollo.csv" className="cta-inventario-link is-secondary">
              Descargar inventario (CSV) ↓
            </a>
          </div>
        </Reveal>
      </section>
    </>
  )
}
