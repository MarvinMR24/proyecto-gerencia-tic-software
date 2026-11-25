import { IconBadge } from './Icon'
import Reveal from './Reveal'

const INVENTARIO_URL = 'https://iatech-co-frontend.vercel.app'

const tipos = [
  {
    icon: 'cube',
    title: 'Materias primas',
    text: 'Insumos que todavía no se han transformado y que se usarán para producir un bien o servicio.',
  },
  {
    icon: 'gear',
    title: 'Productos en proceso',
    text: 'Bienes que ya empezaron a transformarse pero aún no están terminados.',
  },
  {
    icon: 'award',
    title: 'Productos terminados',
    text: 'Bienes listos para ser vendidos o entregados al cliente.',
  },
  {
    icon: 'server',
    title: 'Activos de TI',
    text: 'Equipos, licencias, herramientas de software y servicios en la nube que usa un área de tecnología para trabajar.',
  },
]

const metodos = [
  {
    title: 'Clasificación ABC',
    text: 'Ordena los ítems según su valor: los A son pocos pero representan la mayor parte del costo, los C son muchos pero de poco valor. Así se controla con más cuidado lo que más importa.',
  },
  {
    title: 'PEPS (FIFO)',
    text: 'Primero en entrar, primero en salir: lo que se adquirió primero es lo primero que se usa o se reemplaza. Ayuda a evitar que algo quede obsoleto sin usarse.',
  },
  {
    title: 'Cantidad económica de pedido (EOQ)',
    text: 'Calcula cuánto conviene comprar en cada pedido para que el costo total de pedir y de mantener el inventario sea el menor posible.',
  },
  {
    title: 'Punto de reorden y stock de seguridad',
    text: 'Define en qué momento hay que volver a pedir y cuánto margen mantener para no quedarse sin un recurso. En software equivale a renovar una licencia antes de que expire.',
  },
]

const ti = [
  'Saber exactamente qué herramientas, licencias y equipos tiene el área y quién los usa.',
  'Controlar los costos de suscripciones y licencias, y detectar gastos duplicados.',
  'Anticipar vencimientos de licencias y herramientas que ya no reciben actualizaciones.',
  'Tomar decisiones con datos: qué renovar, qué reemplazar y qué dar de baja.',
]

export default function Inventarios() {
  return (
    <>
      <section className="hero hero-sm">
        <h1>Inventarios</h1>
      </section>

      <section className="section split">
        <Reveal>
          <div className="card panel">
            <h2>¿Qué es un inventario?</h2>
            <p>
              Un inventario es el registro ordenado de todos los bienes y recursos que tiene una
              organización: qué son, cuántos hay, dónde están, cuánto cuestan y en qué estado se
              encuentran. Llevarlo al día permite saber con qué se cuenta en cada momento.
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="card panel">
            <h2>¿Qué es la gestión de inventarios?</h2>
            <p>
              La gestión o teoría de inventarios estudia cómo controlar esos recursos para que nunca
              falte lo necesario y tampoco sobre lo que no se usa. Busca un equilibrio entre el costo
              de tener recursos guardados y el costo de quedarse sin ellos.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="band dark divider">
        <Reveal as="h2" className="band-title">
          Tipos de inventario
        </Reveal>
      </section>
      <section className="section">
        <div className="grid grid-4">
          {tipos.map((t, i) => (
            <Reveal key={t.title} delay={i * 70}>
              <div className="card centered">
                <IconBadge name={t.icon} tone={i % 2 === 0 ? 'purple' : 'teal'} size={52} />
                <h3 className="tight">{t.title}</h3>
                <p className="small">{t.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="band teal divider">
        <Reveal as="h2" className="band-title light">
          Métodos de control
        </Reveal>
      </section>
      <section className="section">
        <div className="grid grid-2">
          {metodos.map((m, i) => (
            <Reveal key={m.title} delay={(i % 2) * 90}>
              <div className="card">
                <span className="step-number">{i + 1}</span>
                <h3 className="tight">{m.title}</h3>
                <p className="small">{m.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="card panel">
            <h2>¿Por qué es importante en un área de software?</h2>
            <p>
              En el Área de Software el inventario no son productos en un almacén, sino las
              herramientas de desarrollo, licencias, equipos y servicios que el equipo necesita.
              Tenerlos inventariados permite:
            </p>
            <ul className="concl-list">
              {ti.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <section className="band dark divider">
        <Reveal className="cta-inventario">
          <h2 className="band-title">Página de inventarios del curso</h2>
          <a href={INVENTARIO_URL} target="_blank" rel="noopener noreferrer" className="cta-inventario-link">
            Acceder al inventario ↗
          </a>
        </Reveal>
      </section>
    </>
  )
}
