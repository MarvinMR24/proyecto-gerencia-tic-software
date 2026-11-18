import { mbtiResultados, team } from '../data/content'
import Reveal from './Reveal'

const DOMAIN = 'ucb.edu.bo'

// nombre.apellido@ucb.edu.bo, sin tildes ni eñes.
function emailFor(fullName) {
  const [nombre, apellido] = fullName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(' ')
  return `${nombre}.${apellido}@${DOMAIN}`
}

// Docente de la materia. Completar `name` con "Nombre Apellido" (sin el "Ing.").
const DOCENTE = {
  name: null,
  title: 'Ing.',
  role: 'Docente · Gerencia de las TIC',
}

const initials = (name) =>
  name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')

function ContactCard({ name, title, role, gradient }) {
  const email = emailFor(name)
  return (
    <article className="card team-card contact-card">
      <div className={`avatar ${gradient}`}>{initials(name)}</div>
      <h3 className="tight">{title ? `${title} ${name}` : name}</h3>
      <p className="muted small">{role}</p>
      <a href={`mailto:${email}`} className="contact-email">
        {email}
      </a>
    </article>
  )
}

export default function Contactos() {
  const gradients = Object.fromEntries(team.map((m) => [m.name, m.gradient]))

  return (
    <>
      <section className="hero hero-sm">
        <h1>Contactos</h1>
      </section>

      <section className="section">
        <Reveal>
          <div className="card panel">
            <h2>¿Cómo comunicarse con nosotros?</h2>
            <p>
              Cada integrante del Área de Software puede ser contactado por su correo institucional de la Universidad
              Católica Boliviana. Haz clic sobre cualquier correo para escribirle directamente.
            </p>
          </div>
        </Reveal>
      </section>

      {DOCENTE.name && (
        <>
          <section className="band dark divider">
            <Reveal as="h2" className="band-title">
              Docente
            </Reveal>
          </section>
          <section className="section">
            <div className="contact-single">
              <Reveal>
                <ContactCard name={DOCENTE.name} title={DOCENTE.title} role={DOCENTE.role} gradient="grad-b" />
              </Reveal>
            </div>
          </section>
        </>
      )}

      <section className="band teal divider">
        <Reveal as="h2" className="band-title light">
          Equipo del Área de Software
        </Reveal>
      </section>
      <section className="section">
        <div className="grid grid-3">
          {mbtiResultados.map((m, i) => (
            <Reveal key={m.name} delay={i * 70}>
              <ContactCard name={m.name} role={m.role} gradient={gradients[m.name] || 'grad-a'} />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
