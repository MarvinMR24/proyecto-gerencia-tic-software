import Reveal from './Reveal'

const COLOR = { C: '#f43f5e', I: '#38bdf8', O: '#34d399', M: '#fbbf24' }

const VIEW_W = 1200
const VIEW_H = 750
const BOX = { x: 450, y: 290, w: 300, h: 180 }

// Each ICOM is drawn as an arrow line with its name written on it.
const INPUTS = [
  'Requisitos Clínicos (HCE, Agendamiento, Citas)',
  'Datos Operativos y de Pacientes',
  'Feedback y Reportes de Errores (Bugs)',
]
const OUTPUTS = [
  'Plataforma Clínica Operativa (Módulos Web/App)',
  'Informes y Registros Médicos Digitales',
  'Datos Limpios y Estructurados para BI',
]
const CONTROLS = [
  'Normativas de Salud y Privacidad (HL7, FHIR, Protección de Datos)',
  'Estándares de Calidad y Seguridad de Software',
  'Políticas, Plazos y Presupuesto de IATECH',
]
const MECHANISMS = [
  'Equipo de Desarrollo y Gestión (Devs, QA, PO)',
  'Infraestructura Tecnológica (Cloud, Bases de Datos, IDEs)',
]

const ROW_Y = [325, 385, 445]

const ARROWS = [
  ...INPUTS.map((label, i) => ({
    code: 'I', n: i + 1, label,
    d: `M20,${ROW_Y[i]} L${BOX.x},${ROW_Y[i]}`,
    text: { x: 24, y: ROW_Y[i] - 10 },
  })),
  ...OUTPUTS.map((label, i) => ({
    code: 'O', n: i + 1, label,
    d: `M${BOX.x + BOX.w},${ROW_Y[i]} L1180,${ROW_Y[i]}`,
    text: { x: BOX.x + BOX.w + 16, y: ROW_Y[i] - 10 },
  })),
  // Controls start at staggered heights so each label sits clear of the other lines.
  ...CONTROLS.map((label, i) => {
    const x = 500 + i * 100
    const top = 70 + i * 65
    return {
      code: 'C', n: i + 1, label,
      d: `M${x},${top} L${x},${BOX.y}`,
      text: { x: x + 12, y: top + 6 },
    }
  }),
  ...MECHANISMS.map((label, i) => {
    const x = 550 + i * 100
    const bottom = 690 - i * 65
    return {
      code: 'M', n: i + 1, label,
      d: `M${x},${bottom} L${x},${BOX.y + BOX.h}`,
      text: { x: x + 12, y: bottom + 6 },
    }
  }),
]

const TITLES = [
  { code: 'C', label: 'Controles', x: 500, y: 34 },
  { code: 'I', label: 'Entradas', x: 24, y: 268 },
  { code: 'O', label: 'Salidas', x: BOX.x + BOX.w + 16, y: 268 },
  { code: 'M', label: 'Mecanismos', x: 550, y: 735 },
]

function Idef0Diagram() {
  return (
    <div className="idef0-board">
      <div className="idef0-board-head">
        <h3>IATECH · Área de Software</h3>
        <p>Nivel A-0: Gestión de Software para Servicios Clínicos</p>
      </div>

      <div className="idef0-scroll">
        <svg className="idef0-svg" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
          <defs>
            {Object.entries(COLOR).map(([code, color]) => (
              <marker key={code} id={`idef0-arrow-${code}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" fill={color} />
              </marker>
            ))}
          </defs>

          {TITLES.map((t) => (
            <text key={t.code} x={t.x} y={t.y} className="idef0-title" fill={COLOR[t.code]}>
              {t.label} ({t.code})
            </text>
          ))}

          {ARROWS.map((a) => (
            <g key={`${a.code}${a.n}`} className="idef0-arrow">
              <path d={a.d} className="idef0-line-glow" stroke={COLOR[a.code]} />
              <path d={a.d} className="idef0-line" stroke={COLOR[a.code]} markerEnd={`url(#idef0-arrow-${a.code})`} />
              <text x={a.text.x} y={a.text.y} className="idef0-label">
                <tspan className="idef0-label-code" fill={COLOR[a.code]}>
                  {a.code}
                  {a.n}
                </tspan>
                <tspan dx="8">{a.label}</tspan>
              </text>
            </g>
          ))}

          <g className="idef0-process">
            <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx="16" />
            <foreignObject x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h}>
              <div className="idef0-process-body">
                <span className="idef0-process-tag">Función</span>
                <div className="idef0-process-name">Software de Servicios Clínicos</div>
              </div>
            </foreignObject>
            <text x={BOX.x + BOX.w - 14} y={BOX.y + BOX.h - 14} textAnchor="end" className="idef0-node-id">
              A-0
            </text>
          </g>
        </svg>
      </div>
    </div>
  )
}

export default function Idef0() {
  return (
    <>
      <section className="hero hero-sm">
        <h1>IDEF0</h1>
      </section>

      <section className="section split">
        <Reveal>
          <div className="card panel">
            <h2>¿Qué es IDEF0?</h2>
            <p>
              IDEF0 (Integration Definition for Function Modeling) es un método para modelar las
              funciones de un sistema u organización. Cada función se dibuja como una caja y se
              describe con cuatro tipos de flechas, conocidas como ICOM: Entradas, Controles,
              Salidas y Mecanismos.
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="card panel">
            <h2>¿Cómo se lee?</h2>
            <p>
              Las <strong>entradas</strong> llegan por la izquierda y se transforman en{' '}
              <strong>salidas</strong> a la derecha. Los <strong>controles</strong> bajan desde
              arriba y regulan la función, mientras que los <strong>mecanismos</strong> suben
              desde abajo: son las personas y herramientas que la hacen posible.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="band teal divider">
        <Reveal as="h2" className="band-title light">
          Nuestro diagrama A-0
        </Reveal>
      </section>
      <section className="section">
        <Reveal>
          <Idef0Diagram />
        </Reveal>
      </section>

      <section className="band dark divider">
        <Reveal className="cta-inventario">
          <h2 className="band-title">¿Quieres ver el HTML original?</h2>
          <a href="/idef0.html" target="_blank" rel="noopener noreferrer" className="cta-inventario-link">
            Abrir diagrama IDEF0 ↗
          </a>
        </Reveal>
      </section>
    </>
  )
}
