import { mbtiResultados } from '../data/content'
import { IconBadge } from './Icon'
import Reveal from './Reveal'

export default function Goals({ onNavigate }) {
  return (
    <>
      <section className="hero hero-sm">
        <h1>Goals: Objetivos y asignación de personal</h1>
      </section>

      <section className="section split">
        <Reveal>
          <div className="card panel">
            <h2>¿Qué son los goals u objetivos?</h2>
            <p>
              Un goal u objetivo es un resultado concreto que una persona o un equipo se compromete a
              alcanzar. Un buen objetivo es claro, medible y está alineado con la misión del área, de
              modo que cada integrante sabe qué se espera de su trabajo y cómo contribuye al resultado
              general.
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="card panel">
            <h2>¿Por qué asignar el personal?</h2>
            <p>
              Asignar a cada integrante un cargo de acuerdo con sus habilidades y su perfil permite
              aprovechar mejor las fortalezas del equipo, evitar que se dupliquen tareas y dejar claro
              quién responde por cada parte del trabajo. A cada cargo le corresponde un objetivo propio
              que aporta al objetivo general del Área de Software.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="band dark divider">
        <Reveal as="h2" className="band-title">
          Asignación de cargos y objetivos
        </Reveal>
      </section>

      <section className="section concl-stack">
        {mbtiResultados.map((m, i) => (
          <Reveal key={m.positionId}>
            <article className="card panel concl-block">
              <div className="concl-head">
                <IconBadge name="target" tone={i % 2 === 0 ? 'purple' : 'teal'} />
                <div>
                  <span className="concl-tag">{m.role}</span>
                  <h3 className="tight">{m.name}</h3>
                </div>
              </div>
              <p>
                <strong>Objetivo:</strong> {m.objetivo}
              </p>
              <button type="button" className="view-cargo-link" onClick={() => onNavigate?.(m.positionId)}>
                Ver descripción del cargo ↗
              </button>
            </article>
          </Reveal>
        ))}
      </section>
    </>
  )
}
