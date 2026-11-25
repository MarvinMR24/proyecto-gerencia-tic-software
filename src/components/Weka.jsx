import {
  tecnicas,
  usosOrganizacion,
  atributos,
  pasos,
  reglas,
  arbol,
  evaluacion,
  clusters,
  hallazgos,
  recomendacionesWeka,
  arffNominalUrl,
  arffNumericoUrl,
  videos,
  recursos,
} from '../data/weka'
import { IconBadge } from './Icon'
import Reveal from './Reveal'
import ChartNote from './ChartNote'

const CLASS_COLORS = { Activa: '#59a14f', 'En Evaluación': '#4e79a7', Deprecada: '#e15759' }

function Leaf({ hoja }) {
  return (
    <span className="tree-leaf" style={{ '--leaf': CLASS_COLORS[hoja.clase] }}>
      {hoja.clase}
      <small>
        {hoja.n} herramientas{hoja.e ? ` · ${hoja.e} error` : ''}
      </small>
    </span>
  )
}

function TreeNode({ node }) {
  return (
    <div className="tree-node">
      <span className="tree-question">{node.pregunta}</span>
      <ul className="tree-branches">
        {node.ramas.map((r) => (
          <li key={r.respuesta}>
            <span className="tree-answer">{r.respuesta}</span>
            {r.hoja ? <Leaf hoja={r.hoja} /> : <TreeNode node={r} />}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ResultCard({ number, title, children }) {
  return (
    <section className="section">
      <Reveal>
        <div className="card dash-card">
          <div className="dash-card-head">
            <span className="step-number dash-number">{number}</span>
            <h2>{title}</h2>
          </div>
          {children}
        </div>
      </Reveal>
    </section>
  )
}

export default function Weka() {
  return (
    <>
      <section className="hero hero-sm">
        <h1>Patrones WEKA</h1>
      </section>

      <section className="section split">
        <Reveal>
          <div className="card panel">
            <h2>¿Qué es WEKA?</h2>
            <p>
              WEKA (Waikato Environment for Knowledge Analysis) es un software libre desarrollado por la Universidad de
              Waikato, en Nueva Zelanda, que reúne algoritmos de minería de datos y aprendizaje automático. Permite
              cargar un conjunto de datos, prepararlo y aplicar técnicas para descubrir <strong>patrones</strong>:
              relaciones, reglas y grupos que no se ven a simple vista en una tabla.
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="card panel">
            <h2>¿Qué es un patrón?</h2>
            <p>
              Un patrón es una regularidad que se repite en los datos y que permite explicar o predecir un
              comportamiento. Por ejemplo, que las herramientas que dejan de actualizarse terminan deprecadas. WEKA
              encuentra estos patrones con tres familias principales de técnicas: asociación, clasificación y
              agrupamiento.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="band dark divider">
        <Reveal as="h2" className="band-title">
          Tipos de patrones
        </Reveal>
      </section>
      <section className="section">
        <div className="grid grid-3">
          {tecnicas.map((t, i) => (
            <Reveal key={t.title} delay={i * 80}>
              <article className="card">
                <IconBadge name={t.icon} tone={i % 2 === 0 ? 'purple' : 'teal'} />
                <h3 className="tight">{t.title}</h3>
                <p className="small muted">Algoritmo en WEKA: {t.algoritmo}</p>
                <p className="small">{t.text}</p>
                <p className="small weka-example">
                  <strong>Ejemplo:</strong> {t.ejemplo}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="band teal divider">
        <Reveal as="h2" className="band-title light">
          ¿Para qué sirve en una organización?
        </Reveal>
      </section>
      <section className="section">
        <div className="grid grid-4">
          {usosOrganizacion.map((u, i) => (
            <Reveal key={u.title} delay={i * 70}>
              <article className="card">
                <IconBadge name={u.icon} tone={i % 2 === 0 ? 'teal' : 'purple'} size={48} />
                <h3 className="tight">{u.title}</h3>
                <p className="small">{u.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="band dark divider">
        <Reveal as="h2" className="band-title">
          Aplicación a nuestro inventario
        </Reveal>
      </section>
      <section className="section">
        <div className="grid grid-4">
          {pasos.map((p, i) => (
            <Reveal key={p.title} delay={i * 70}>
              <div className="card step-card">
                <span className="step-number">{i + 1}</span>
                <h3 className="tight">{p.title}</h3>
                <p className="small">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="card panel">
            <h2>Atributos analizados</h2>
            <p className="small muted">
              Cada una de las 100 herramientas del inventario se describió con estos atributos. Los derivados se
              calcularon a partir de las fechas y costos del inventario, tomando como referencia el 18/11/2026.
            </p>
            <div className="chart-scroll">
              <table className="chart-table weka-table">
                <thead>
                  <tr>
                    <th>Atributo</th>
                    <th>Tipo</th>
                    <th>Valores</th>
                  </tr>
                </thead>
                <tbody>
                  {atributos.map((a) => (
                    <tr key={a.nombre}>
                      <td>
                        <code>{a.nombre}</code>
                      </td>
                      <td>{a.tipo}</td>
                      <td>{a.detalle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="band teal divider">
        <Reveal as="h2" className="band-title light">
          Resultados del análisis
        </Reveal>
      </section>

      <ResultCard number={1} title="Reglas de asociación (Apriori)">
        <p className="small muted">
          Soporte: cuántas herramientas cumplen la regla completa sobre cuántas cumplen la condición. Confianza: qué
          porcentaje de las veces se cumple. Lift: cuántas veces más probable es el resultado gracias a la condición
          (mayor que 1 indica una relación real).
        </p>
        <div className="chart-scroll">
          <table className="chart-table weka-table">
            <thead>
              <tr>
                <th>Si…</th>
                <th>Entonces…</th>
                <th>Soporte</th>
                <th>Confianza</th>
                <th>Lift</th>
              </tr>
            </thead>
            <tbody>
              {reglas.map((r) => (
                <tr key={r.si + r.entonces}>
                  <td>{r.si}</td>
                  <td>
                    <strong>{r.entonces}</strong>
                  </td>
                  <td>{r.soporte}</td>
                  <td>{r.confianza}%</td>
                  <td>{r.lift.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ChartNote title="¿Qué se ve en la tabla?">
          <p>
            Cada fila es una regla que WEKA encontró en el inventario. La más fuerte es la primera: todas las
            herramientas desactualizadas están deprecadas (100% de confianza y un lift de 12,5, es decir, es 12,5
            veces más probable que una herramienta esté deprecada si está desactualizada). También se ve que las
            herramientas nuevas suelen estar en evaluación, que todos los Asistentes IA son de suscripción y que
            todos los Frameworks son open source.
          </p>
        </ChartNote>
      </ResultCard>

      <ResultCard number={2} title="Árbol de decisión del estado (J48)">
        <div className="weka-tree-wrap">
          <TreeNode node={arbol} />
        </div>
        <div className="weka-eval">
          <div className="card kpi-tile">
            <span className="kpi-value">{evaluacion.aciertoCV}%</span>
            <span className="kpi-label">de acierto en validación cruzada (10 particiones)</span>
          </div>
          <div className="chart-scroll">
            <table className="chart-table weka-matrix">
              <caption>Matriz de confusión (filas: estado real, columnas: estado predicho)</caption>
              <thead>
                <tr>
                  <th />
                  {evaluacion.clases.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {evaluacion.matriz.map((fila, i) => (
                  <tr key={evaluacion.clases[i]}>
                    <th>{evaluacion.clases[i]}</th>
                    {fila.map((v, j) => (
                      <td key={j} className={i === j ? 'is-hit' : v ? 'is-miss' : ''}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <ChartNote title="¿Qué se ve en el árbol y la matriz?">
          <p>
            El árbol se lee de arriba hacia abajo respondiendo preguntas. La primera es si la herramienta se
            actualizó en los últimos 150 días: si la respuesta es no, está deprecada (8 casos, sin errores). Si es
            sí, se mira su antigüedad: las antiguas e intermedias están activas y las nuevas están en evaluación.
            Los números entre paréntesis indican cuántas herramientas llegan a cada hoja.
          </p>
          <p>
            La matriz de confusión compara el estado real (filas) con el que predijo el árbol (columnas). Las
            casillas de la diagonal son aciertos y las demás son errores: el árbol solo se equivocó en 2 de 100
            herramientas, confundiendo una activa con una en evaluación y viceversa.
          </p>
        </ChartNote>
      </ResultCard>

      <ResultCard number={3} title="Grupos de herramientas (SimpleKMeans, k = 3)">
        <div className="grid grid-3">
          {clusters.map((c) => (
            <article key={c.nombre} className="weka-cluster" style={{ '--cluster': c.color }}>
              <h3 className="tight">{c.nombre}</h3>
              <div className="weka-cluster-stats">
                <span>
                  <strong>{c.n}</strong> herramientas
                </span>
                <span>
                  <strong>${c.costo.toLocaleString('en-US')}</strong> costo promedio
                </span>
                <span>
                  <strong>{c.antiguedad.toFixed(1)}</strong> años de antigüedad
                </span>
                <span>
                  <strong>{c.dias}</strong> días sin actualizar
                </span>
              </div>
              <ul className="small">
                {c.rasgos.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <ChartNote title="¿Qué se ve en los grupos?">
          <p>
            SimpleKMeans separó las 100 herramientas en tres grupos parecidos entre sí. En rojo están las
            herramientas de pago, que concentran casi todo el gasto. En naranja, las open source heredadas: son
            gratuitas pero las más antiguas y las que más tiempo llevan sin actualizarse, y ahí están 7 de las 8
            deprecadas. En verde, los frameworks y librerías open source, sin costo y actualizados con frecuencia.
            Esto muestra que el mayor riesgo de obsolescencia no está en lo que se paga, sino en las herramientas
            gratuitas más viejas.
          </p>
        </ChartNote>
      </ResultCard>

      <section className="section">
        <div className="split">
          <Reveal>
            <div className="card panel">
              <h2>Hallazgos</h2>
              <ul className="concl-list small">
                {hallazgos.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="card panel">
              <h2>¿Qué haremos con estos resultados?</h2>
              <ol className="concl-list small">
                {recomendacionesWeka.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="band dark divider">
        <Reveal as="h2" className="band-title">
          Videos para aprender WEKA
        </Reveal>
      </section>
      <section className="section">
        <div className="grid grid-2">
          {videos.map((v, i) => (
            <Reveal key={v.id} delay={(i % 2) * 120}>
              <div className="card video-card">
                <span className="concl-tag">{v.tema}</span>
                <h3>{v.title}</h3>
                <div className="video-frame">
                  <iframe
                    src={`https://www.youtube.com/embed/${v.id}`}
                    title={v.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                <p className="small muted weka-video-author">Por {v.autor}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="band teal divider">
        <Reveal as="h2" className="band-title light">
          Páginas y documentos de consulta
        </Reveal>
      </section>
      <section className="section">
        <div className="grid grid-3">
          {recursos.map((r, i) => (
            <Reveal key={r.url} delay={(i % 3) * 80}>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="card weka-resource">
                <IconBadge name={r.icon} tone={i % 2 === 0 ? 'purple' : 'teal'} size={44} />
                <span className="concl-tag">{r.tipo}</span>
                <h3 className="tight">{r.title}</h3>
                <p className="small">{r.text}</p>
                <span className="view-cargo-link">Abrir ↗</span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="band dark divider">
        <Reveal className="cta-inventario">
          <h2 className="band-title">Datos para WEKA</h2>
          <div className="dash-downloads">
            <a href={arffNominalUrl} download="inventario_nominal.arff" className="cta-inventario-link">
              Descargar ARFF nominal ↓
            </a>
            <a href={arffNumericoUrl} download="inventario_numerico.arff" className="cta-inventario-link is-secondary">
              Descargar ARFF numérico ↓
            </a>
          </div>
        </Reveal>
      </section>
    </>
  )
}
