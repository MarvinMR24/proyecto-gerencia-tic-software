import { orgChart } from '../data/content'
import { Icon, IconBadge } from './Icon'
import Reveal from './Reveal'
import ChartNote from './ChartNote'

function Node({ role, positionId, tier, onNavigate }) {
  return (
    <button type="button" className={`org-node tier-${tier}`} onClick={() => onNavigate(positionId)}>
      <span className="org-node-icon">
        <Icon name="people" size={20} />
      </span>
      <strong>{role}</strong>
      <span className="org-node-cta">Ver descripción del puesto ↗</span>
    </button>
  )
}

export default function Organigrama({ onNavigate }) {
  const { root, note } = orgChart

  return (
    <>
      <section className="hero hero-sm">
        <h1>Organización</h1>
      </section>

      <section className="section split">
        <Reveal>
          <div className="card panel">
            <h2>¿Qué es un organigrama?</h2>
            <p>
              Un organigrama es la representación gráfica de la estructura de una organización.
              Muestra los cargos que la componen, cómo se relacionan entre sí y las líneas de
              autoridad que conectan cada puesto con quien lo supervisa.
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="card panel">
            <h2>¿Para qué sirve?</h2>
            <p>
              Ayuda a entender rápidamente quién reporta a quién, ordena la distribución de
              responsabilidades sin duplicidades, facilita la comunicación interna y sirve como
              guía para ubicar a cualquier persona nueva dentro del equipo.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="grid grid-3">
          <Reveal>
            <div className="card centered">
              <IconBadge name="layers" tone="purple" />
              <h3>Tipo vertical</h3>
              <p className="small">
                Nuestro organigrama es de tipo <strong>vertical</strong>: la máxima autoridad se
                ubica arriba y las líneas de mando descienden hacia los niveles de menor
                jerarquía, de arriba hacia abajo.
              </p>
            </div>
          </Reveal>
          <Reveal delay={70}>
            <div className="card centered">
              <IconBadge name="chart" tone="teal" />
              <h3>3 niveles jerárquicos</h3>
              <p className="small">
                Dirección (Subgerencia), jefatura (Liderazgo de Desarrollo) y equipo operativo
                (desarrollo, soporte y herramientas).
              </p>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <div className="card centered">
              <IconBadge name="users" tone="purple" />
              <h3>Estructura lineal</h3>
              <p className="small">
                Cada cargo reporta a un único superior, lo que mantiene una sola línea de mando y
                simplifica la toma de decisiones.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="band dark divider">
        <Reveal as="h2" className="band-title">
          Estructura del área de Software
        </Reveal>
      </section>

      <section className="section">
        <div className="org-wrap">
          <div className="org-chart">
            <Reveal>
              <div className="org-row">
                <Node role={root.role} positionId={root.positionId} tier="1" onNavigate={onNavigate} />
              </div>
            </Reveal>
            <div className="org-connector" />
            <Reveal delay={120}>
              <div className="org-row">
                <Node role={root.child.role} positionId={root.child.positionId} tier="2" onNavigate={onNavigate} />
              </div>
            </Reveal>
            <div className="org-connector org-connector-wide" />
            <Reveal delay={240}>
              <div className="org-row org-row-branch">
                {root.child.children.map((c) => (
                  <Node key={c.role} role={c.role} positionId={c.positionId} tier="3" onNavigate={onNavigate} />
                ))}
              </div>
            </Reveal>
          </div>
          <p className="muted centered note">{note}</p>
          <ChartNote title="¿Qué se ve en el organigrama?">
            <p>
              El organigrama muestra la jerarquía del Área de Software en tres niveles. Arriba está la
              Subgerencia de Software, que dirige el área. Debajo está el Líder de Desarrollo, que recibe
              los lineamientos de la Subgerencia y coordina al equipo técnico. En el tercer nivel están
              los tres cargos operativos: Desarrollador de Sistemas, Analista de Soporte al Desarrollo y
              Especialista de Herramientas de Desarrollo, que reportan al Líder de Desarrollo. Las líneas
              indican a quién reporta cada cargo.
            </p>
          </ChartNote>
        </div>
      </section>
    </>
  )
}
