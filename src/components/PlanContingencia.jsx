import {
  DOC_URL,
  generalidades,
  NIVELES,
  riesgos,
  sistemaCritico,
  fases,
  contramedidas,
  erd,
  simulacros,
} from '../data/contingencia'
import { IconBadge } from './Icon'
import Reveal from './Reveal'
import ChartNote from './ChartNote'

export default function PlanContingencia() {
  return (
    <>
      <section className="hero hero-sm">
        <h1>Plan de Contingencia</h1>
      </section>

      <section className="section">
        <Reveal>
          <div className="card panel">
            <h2>Análisis de riesgos y continuidad del servicio</h2>
            <p>
              El plan define cómo el Área de Software de IATECH Co previene, enfrenta y se recupera de fallas y desastres
              que afecten a la Plataforma Clínica Operativa, para que los centros médicos sigan atendiendo con la menor
              pérdida de información y tiempo posible.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-3" style={{ marginTop: 24 }}>
          {generalidades.map((g, i) => (
            <Reveal key={g.title} delay={i * 80}>
              <div className="card contingency-card">
                <IconBadge name={g.icon} size={48} />
                <h3>{g.title}</h3>
                <p className="small">{g.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="band teal divider">
        <h2 className="band-title">Análisis de riesgos</h2>
      </section>
      <section className="section">
        <Reveal>
          <div className="card panel">
            <p className="small muted">Factor de riesgo asignado a cada amenaza identificada para el área.</p>
            <div className="chart-scroll">
              <table className="chart-table risk-matrix">
                <thead>
                  <tr>
                    <th>Riesgo</th>
                    {NIVELES.map((n) => (
                      <th key={n}>{n}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {riesgos.map((r) => (
                    <tr key={r.riesgo}>
                      <td>{r.riesgo}</td>
                      {NIVELES.map((n, i) => (
                        <td key={n}>
                          {r.nivel === i && <span className={`risk-dot risk-${i}`} aria-label={n} />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ChartNote title="¿Qué se ve en la matriz?">
              <p>
                Cada fila es una amenaza y el punto marca su nivel de riesgo, de muy bajo a muy alto. La
                mayoría se concentra en <strong>muy alto</strong>: incendio, robo, vandalismo, fallas de
                equipos, virus, acceso no autorizado y robo de datos, que son los que el plan prioriza.
                Riesgos como terremotos, inundaciones o un desastre total aparecen en niveles bajos porque son
                poco probables para el área.
              </p>
            </ChartNote>
          </div>
        </Reveal>

        <Reveal>
          <div className="card panel" style={{ marginTop: 24 }}>
            <h2>Sistema crítico a proteger</h2>
            <dl className="provider-facts contingency-facts">
              {sistemaCritico.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </section>

      <section className="band dark divider">
        <h2 className="band-title">Plan de recuperación de desastres</h2>
      </section>
      <section className="section">
        <div className="grid grid-3">
          {fases.map((f, i) => (
            <Reveal key={f.id} delay={i * 80}>
              <div className="card contingency-card">
                <IconBadge name={f.icon} size={48} />
                <h3>
                  {i + 1}. {f.title}
                </h3>
                <ul className="small">
                  {f.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="band teal divider">
        <h2 className="band-title">Riesgos y contramedidas por área</h2>
      </section>
      <section className="section">
        <Reveal>
          <div className="card panel">
            <div className="chart-scroll">
              <table className="chart-table weka-table">
                <thead>
                  <tr>
                    <th>Área</th>
                    <th>Riesgo</th>
                    <th>Contramedida</th>
                  </tr>
                </thead>
                <tbody>
                  {contramedidas.map((c) => (
                    <tr key={c.riesgo}>
                      <td>{c.area}</td>
                      <td>{c.riesgo}</td>
                      <td>{c.medida}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="band dark divider">
        <h2 className="band-title">Equipo de Recuperación de Desastres</h2>
      </section>
      <section className="section">
        <Reveal>
          <div className="card panel">
            <div className="chart-scroll">
              <table className="chart-table weka-table">
                <thead>
                  <tr>
                    <th>Área</th>
                    <th>Función en la recuperación</th>
                    <th>Integrante</th>
                  </tr>
                </thead>
                <tbody>
                  {erd.map((e) => (
                    <tr key={e.area}>
                      <td>{e.area}</td>
                      <td>{e.funcion}</td>
                      <td>
                        <strong>{e.integrante}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="card panel" style={{ marginTop: 24 }}>
            <h2>Cronograma de simulacros 2026–2027</h2>
            <p className="small muted">
              Un simulacro por área; los resultados se informan al Comité Técnico Institucional.
            </p>
            <div className="chart-scroll">
              <table className="chart-table weka-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Área</th>
                    <th>Tipo de riesgo</th>
                    <th>Prueba</th>
                  </tr>
                </thead>
                <tbody>
                  {simulacros.map((s) => (
                    <tr key={s.fecha}>
                      <td>
                        <strong>{s.fecha}</strong>
                      </td>
                      <td>{s.area}</td>
                      <td>{s.riesgo}</td>
                      <td>{s.nota}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="contingency-doc">
            <a href={DOC_URL} target="_blank" rel="noopener noreferrer" className="view-cargo-link">
              Ver documento ↗
            </a>
          </div>
        </Reveal>
      </section>
    </>
  )
}
