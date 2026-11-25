import { team, values, techStack } from '../data/content'
import { IconBadge } from './Icon'
import Reveal from './Reveal'

export default function Inicio() {
  return (
    <>
      <section className="hero">
        <h1>
          Área de Software
          <br />
          Silk Road
        </h1>
      </section>

      <section className="section split">
        <Reveal>
          <div className="hero-visual" aria-hidden="true">
            <span className="glyph">01</span>
            <span className="glyph">10</span>
            <span className="glyph">11</span>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="card panel">
            <h2>Quiénes Somos</h2>
            <p>
              Somos un grupo de estudiantes apasionados por el desarrollo de software. Nuestro
              objetivo es aprender, innovar y crear soluciones tecnológicas que aporten valor en
              el ámbito académico y profesional. Cada integrante aporta una visión única que
              fortalece al equipo.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="card panel">
            <h2>¿Cuál es el objetivo de nuestra área?</h2>
            <p>
              El Área de Software existe para diseñar, desarrollar y mantener soluciones
              tecnológicas que respondan a las necesidades reales de la empresa. Nuestro objetivo
              es planificar y ejecutar cada proyecto con calidad, alinear el trabajo del equipo
              con los objetivos estratégicos de la organización, y sostener en el tiempo los
              sistemas que construimos, cuidando tanto la funcionalidad como la seguridad de cada
              solución.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="band dark divider">
        <Reveal as="h2" className="band-title">
          Nuestro Equipo
        </Reveal>
      </section>

      <section className="section">
        <div className="grid grid-3">
          {team.map((member, i) => (
            <Reveal key={member.name} delay={i * 70}>
              <article className="card team-card">
                <div className={`avatar ${member.gradient}`}>
                  {member.name
                    .split(' ')
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <h3>{member.name}</h3>
                <p className="small">{member.bio}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="band gradient-band">
        <div className="split">
          <Reveal>
            <div className="tech-mark" aria-hidden="true">
              <div className="tech-triangle" />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div>
              <h2 className="light">Conoce nuestras tecnologías</h2>
              <p className="light">
                El equipo utiliza un conjunto de tecnologías modernas que permiten desarrollar
                soluciones completas y eficientes. En el frontend trabajamos con{' '}
                <strong>Vue</strong> y <strong>Angular</strong>, frameworks que facilitan la
                creación de interfaces dinámicas y atractivas. Para el backend empleamos{' '}
                <strong>Flask</strong> y <strong>Node.js</strong>, herramientas que ofrecen
                flexibilidad y potencia en el desarrollo de servicios y APIs. En el manejo de
                datos contamos con <strong>MongoDB</strong>, <strong>Supabase</strong> y{' '}
                <strong>Amazon RDS</strong>, lo que nos permite gestionar información de manera
                segura y escalable, adaptándonos a diferentes necesidades de almacenamiento.
                Finalmente, centralizamos nuestro trabajo en <strong>GitHub</strong>, que funciona
                como repositorio colaborativo y asegura el control de versiones en cada proyecto.
              </p>
            </div>
          </Reveal>
        </div>
        <div className="chip-row">
          {techStack.map((t) => (
            <span key={t.label} className="chip">
              {t.label}
            </span>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="centered card-title-standalone">Nuestros Valores</h2>
      </section>

      <section className="band values-band">
        <div className="grid grid-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 70} className="value-item">
              <IconBadge name={v.icon} tone="light" size={48} />
              <h3 className="light">{v.title}</h3>
              <p className="light small">{v.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="band dark divider">
        <Reveal className="cta-inventario">
          <h2 className="band-title">¿Quieres ver el inventario?</h2>
          <a
            href="https://iatech-co-frontend.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-inventario-link"
          >
            Acceder al inventario ↗
          </a>
        </Reveal>
      </section>
    </>
  )
}
