import { useEffect, useRef, useState } from 'react'
import { META, CATEGORIES, TOTAL, ONE_TIME, MONTHLY, isMonthly, monthlyBreakdown, bs } from '../data/presupuesto'
import { Icon, IconBadge } from './Icon'
import Reveal from './Reveal'

const pct = (n, of = TOTAL) => `${((n / of) * 100).toFixed(1)}%`

/* Número que cuenta desde 0 cuando entra en pantalla. */
function CountUp({ value, format = bs, duration = 1200 }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const start = performance.now()
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration)
        setShown(value * (1 - Math.pow(1 - t, 3)))
        if (t < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    })
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value, duration])

  return <span ref={ref}>{format(shown)}</span>
}

/* ---------- Dona de distribución ---------- */
function Donut({ hover, onHover, onSelect }) {
  const R = 90
  const STROKE = 34
  const C = 2 * Math.PI * R
  const offsets = CATEGORIES.map((_, i) =>
    CATEGORIES.slice(0, i).reduce((s, c) => s + (c.total / TOTAL) * C, 0)
  )
  const focus = hover
  const focused = CATEGORIES.find((c) => c.id === focus)

  return (
    <div className="budget-donut">
      <svg viewBox="0 0 240 240" role="img" aria-label="Distribución del presupuesto por categoría">
        <circle cx="120" cy="120" r={R} fill="none" stroke="var(--lavender-bg)" strokeWidth={STROKE} />
        {CATEGORIES.map((c, i) => {
          const len = (c.total / TOTAL) * C
          return (
            <circle
              key={c.id}
              cx="120"
              cy="120"
              r={R}
              fill="none"
              stroke={c.color}
              strokeWidth={focus === c.id ? STROKE + 10 : STROKE}
              strokeDasharray={`${Math.max(len - 3, 0)} ${C}`}
              strokeDashoffset={-offsets[i]}
              transform="rotate(-90 120 120)"
              className="budget-donut-seg"
              style={{ opacity: focus && focus !== c.id ? 0.35 : 1 }}
              onMouseEnter={() => onHover(c.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelect(c.id)}
            />
          )
        })}
      </svg>
      <div className="budget-donut-center">
        {focused ? (
          <>
            <span className="budget-donut-label">{focused.nombre}</span>
            <strong>{bs(focused.total)}</strong>
            <span className="budget-donut-label">{pct(focused.total)} del total</span>
          </>
        ) : (
          <>
            <span className="budget-donut-label">Total general</span>
            <strong>{bs(TOTAL)}</strong>
            <span className="budget-donut-label">{META.meses} meses</span>
          </>
        )}
      </div>
    </div>
  )
}

/* ---------- Ítem expandible ---------- */
function ItemCard({ item, color, catTotal, open, onToggle }) {
  return (
    <div className={`budget-item ${open ? 'open' : ''}`} style={{ '--cat': color }}>
      <button type="button" className="budget-item-head" onClick={onToggle} aria-expanded={open}>
        <div className="budget-item-title">
          <strong>{item.concepto}</strong>
          <span className="budget-item-obs">{item.obs}</span>
        </div>
        <div className="budget-item-amount">
          <strong>{bs(item.total)}</strong>
          <span>{pct(item.total, catTotal)} de la categoría</span>
        </div>
        <span className="budget-item-caret" aria-hidden="true">
          +
        </span>
      </button>
      <div className="budget-item-bar">
        <span style={{ width: `${(item.total / catTotal) * 100}%` }} />
      </div>
      <div className="budget-item-body">
        <div className="budget-item-body-inner">
          <div className="budget-calc">
            <span>
              <small>Cantidad</small>
              {item.cantidad} {item.unidad === 'Mes' ? 'meses' : item.unidad === 'Lote' ? 'lote' : item.cantidad > 1 ? 'unidades' : 'unidad'}
            </span>
            <span className="budget-calc-op">×</span>
            <span>
              <small>Costo unitario</small>
              {bs(item.unitario)}
              {isMonthly(item) && '/mes'}
            </span>
            <span className="budget-calc-op">=</span>
            <span className="budget-calc-total">
              <small>Costo total</small>
              {bs(item.total)}
            </span>
          </div>
          <dl className="budget-facts">
            <dt>¿Qué es?</dt>
            <dd>{item.que}</dd>
            <dt>¿Por qué lo necesitamos?</dt>
            <dd>{item.porque}</dd>
          </dl>
        </div>
      </div>
    </div>
  )
}

/* ---------- Explorador de categorías ---------- */
function Explorer({ active, onSelect }) {
  const cat = CATEGORIES.find((c) => c.id === active)

  return (
    <div className="card budget-explorer" id="budget-explorer">
      <div className="budget-tabs" role="tablist">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={c.id === active}
            className={`budget-tab ${c.id === active ? 'active' : ''}`}
            style={{ '--cat': c.color }}
            onClick={() => onSelect(c.id)}
          >
            <Icon name={c.icon} size={18} />
            {c.nombre}
          </button>
        ))}
      </div>

      <CategoryPanel key={cat.id} cat={cat} />
    </div>
  )
}

function CategoryPanel({ cat }) {
  const [openItem, setOpenItem] = useState(0)

  return (
      <div className="budget-cat" style={{ '--cat': cat.color }}>
        <div className="budget-cat-head">
          <div className="budget-cat-icon">
            <Icon name={cat.icon} size={30} />
          </div>
          <div className="budget-cat-text">
            <div className="budget-cat-title">
              <h2>{cat.nombre}</h2>
              <span className="budget-pill">{cat.tipo}</span>
            </div>
            <p className="small">{cat.resumen}</p>
          </div>
          <div className="budget-cat-total">
            <strong>{bs(cat.total)}</strong>
            <span>
              {pct(cat.total)} del presupuesto · {cat.items.length} conceptos
            </span>
          </div>
        </div>

        <div className="budget-items">
          {cat.items.map((it, i) => (
            <ItemCard
              key={it.concepto}
              item={it}
              color={cat.color}
              catTotal={cat.total}
              open={openItem === i}
              onToggle={() => setOpenItem(openItem === i ? null : i)}
            />
          ))}
        </div>
      </div>
  )
}

/* ---------- Flujo mensual (barras apiladas) ---------- */
function MonthlyFlow() {
  const data = monthlyBreakdown()
  const totals = data.map((m) => m.reduce((s, d) => s + d.value, 0))
  const max = Math.max(...totals)
  const [tip, setTip] = useState(null)
  const accumulated = totals.map((_, i) => totals.slice(0, i + 1).reduce((a, b) => a + b, 0))

  return (
    <div className="budget-flow">
      {data.map((month, i) => (
          <div key={i} className="budget-flow-col">
            <span className="budget-flow-value">{bs(totals[i])}</span>
            <div className="budget-flow-track">
              <Reveal className="budget-flow-stack" delay={i * 120}>
                <div style={{ height: `${(totals[i] / max) * 100}%` }} className="budget-flow-bar">
                  {month
                    .filter((d) => d.value > 0)
                    .map((d) => (
                      <span
                        key={d.id}
                        style={{ flexGrow: d.value, background: d.color }}
                        onMouseEnter={() => setTip({ i, ...d })}
                        onMouseLeave={() => setTip(null)}
                      />
                    ))}
                </div>
              </Reveal>
              {tip && tip.i === i && (
                <div className="budget-flow-tip">
                  <span style={{ background: tip.color }} />
                  {tip.nombre}: <strong>{bs(tip.value)}</strong>
                </div>
              )}
            </div>
            <strong className="budget-flow-month">Mes {i + 1}</strong>
            <span className="budget-flow-acc">Acumulado {bs(accumulated[i])}</span>
          </div>
      ))}
    </div>
  )
}

/* ---------- Simulador de duración ---------- */
function Simulator() {
  const [months, setMonths] = useState(META.meses)
  const recurrent = MONTHLY * months
  const total = ONE_TIME + recurrent

  return (
    <div className="card budget-sim">
      <div className="dash-card-head">
        <IconBadge name="calendar" size={44} />
        <h2>¿Y si el proyecto dura más o menos?</h2>
      </div>
      <p className="small">
        Las compras únicas (equipos y materiales) no cambian con el tiempo, pero los servicios y la infraestructura se
        pagan cada mes. Mueve el control para ver cómo cambiaría el presupuesto con otra duración.
      </p>

      <label className="budget-sim-control">
        <span>
          Duración: <strong>{months} {months === 1 ? 'mes' : 'meses'}</strong>
          {months === META.meses && <em> (proyección actual)</em>}
        </span>
        <input type="range" min="1" max="12" value={months} onChange={(e) => setMonths(Number(e.target.value))} />
      </label>

      <div className="budget-sim-bar">
        <span className="one" style={{ flexGrow: ONE_TIME }}>
          {pct(ONE_TIME, total)}
        </span>
        <span className="rec" style={{ flexGrow: recurrent }}>
          {pct(recurrent, total)}
        </span>
      </div>

      <div className="grid grid-3 budget-sim-figs">
        <div>
          <small>Compras únicas</small>
          <strong>{bs(ONE_TIME)}</strong>
        </div>
        <div>
          <small>
            Recurrente ({bs(MONTHLY)} × {months})
          </small>
          <strong>{bs(recurrent)}</strong>
        </div>
        <div className="budget-sim-total">
          <small>Total estimado</small>
          <strong>{bs(total)}</strong>
        </div>
      </div>
    </div>
  )
}

/* ---------- Tabla completa ---------- */
function FullTable() {
  return (
    <details className="card budget-table-card">
      <summary>Ver tabla completa del presupuesto</summary>
      <div className="budget-table-wrap">
        <table className="budget-table">
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Unidad</th>
              <th>Cant.</th>
              <th>Costo unit. (Bs)</th>
              <th>Costo total (Bs)</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          {CATEGORIES.map((c) => (
            <tbody key={c.id}>
              <tr className="budget-table-cat" style={{ '--cat': c.color }}>
                <th colSpan={6}>{c.nombre}</th>
              </tr>
              {c.items.map((it) => (
                <tr key={it.concepto}>
                  <td>{it.concepto}</td>
                  <td>{it.unidad}</td>
                  <td className="num">{it.cantidad}</td>
                  <td className="num">{it.unitario.toLocaleString('es-BO')}</td>
                  <td className="num">{it.total.toLocaleString('es-BO')}</td>
                  <td>{it.obs}</td>
                </tr>
              ))}
              <tr className="budget-table-sub">
                <td colSpan={4}>Total {c.nombre}</td>
                <td className="num">{c.total.toLocaleString('es-BO')}</td>
                <td />
              </tr>
            </tbody>
          ))}
          <tfoot>
            <tr>
              <td colSpan={4}>TOTAL GENERAL</td>
              <td className="num">{TOTAL.toLocaleString('es-BO')}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </details>
  )
}

export default function Presupuesto() {
  const [active, setActive] = useState(CATEGORIES[0].id)
  const [hover, setHover] = useState(null)
  const sorted = [...CATEGORIES].sort((a, b) => b.total - a.total)

  function select(id) {
    setActive(id)
    document.getElementById('budget-explorer')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <section className="hero hero-sm">
        <h1>Presupuesto del Área</h1>
        <div className="chip-row">
          <span className="chip">Área: {META.area}</span>
          <span className="chip">Responsable: {META.responsable}</span>
          <span className="chip">Proyección a {META.meses} meses</span>
          <span className="chip">Moneda: {META.moneda}</span>
        </div>
      </section>

      <section className="section">
        <div className="grid grid-4">
          {[
            { label: 'Presupuesto total', value: TOTAL, icon: 'chart' },
            { label: 'Compras únicas (mes 1)', value: ONE_TIME, icon: 'cube' },
            { label: 'Gasto recurrente por mes', value: MONTHLY, icon: 'cycle' },
            { label: 'Promedio mensual', value: TOTAL / META.meses, icon: 'calendar' },
          ].map((k, i) => (
            <Reveal key={k.label} delay={i * 80}>
              <div className="card kpi-tile budget-kpi">
                <IconBadge name={k.icon} size={44} tone={i % 2 ? 'teal' : 'purple'} />
                <span className="kpi-value">
                  <CountUp value={k.value} />
                </span>
                <span className="kpi-label">{k.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="band teal divider">
        <h2 className="band-title">¿En qué se invierte?</h2>
      </section>

      <section className="section">
        <Reveal>
          <div className="card budget-dist">
            <Donut hover={hover} onHover={setHover} onSelect={select} />
            <div className="budget-legend">
              <p className="small">
                El presupuesto se divide en cinco categorías. Pasa el cursor sobre la dona o una fila para resaltarla y
                haz clic para ver el detalle de cada concepto.
              </p>
              {sorted.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`budget-legend-row ${hover === c.id ? 'hover' : ''}`}
                  style={{ '--cat': c.color }}
                  onMouseEnter={() => setHover(c.id)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => select(c.id)}
                >
                  <span className="budget-legend-name">
                    <span className="budget-legend-dot" />
                    {c.nombre}
                  </span>
                  <span className="budget-legend-bar">
                    <span style={{ width: `${(c.total / sorted[0].total) * 100}%` }} />
                  </span>
                  <span className="budget-legend-val">
                    {bs(c.total)} <small>{pct(c.total)}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="band dark divider">
        <h2 className="band-title">Detalle por categoría</h2>
      </section>

      <section className="section">
        <Reveal>
          <Explorer active={active} onSelect={setActive} />
        </Reveal>
      </section>

      <section className="band teal divider">
        <h2 className="band-title">¿Cuándo se gasta?</h2>
      </section>

      <section className="section">
        <div className="grid grid-2 budget-time">
          <Reveal>
            <div className="card dash-card">
              <div className="dash-card-head">
                <IconBadge name="chart" size={44} />
                <h2>Flujo de gasto mensual</h2>
              </div>
              <MonthlyFlow />
              <div className="dash-analysis">
                <p>
                  El <strong>mes 1</strong> concentra la mayor salida de dinero ({pct(monthlyBreakdown()[0].reduce((s, d) => s + d.value, 0))}{' '}
                  del total) porque ahí se compran todos los equipos y materiales. Desde el mes 2 solo se pagan
                  servicios e infraestructura: {bs(MONTHLY)} fijos cada mes.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <Simulator />
          </Reveal>
        </div>
      </section>

      <section className="section budget-table-section">
        <Reveal>
          <FullTable />
        </Reveal>
      </section>
    </>
  )
}
