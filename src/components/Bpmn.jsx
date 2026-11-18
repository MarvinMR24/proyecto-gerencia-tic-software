import Reveal from './Reveal'

const LANE_COLOR = { devlead: '#e0249f', scrum: '#7c3aed', devteam: '#1c8f93', qa: '#2563eb' }

const LANES = [
  { id: 'devlead', label: 'Dev Lead', y: 0, h: 260 },
  { id: 'scrum', label: 'Scrum Master', y: 260, h: 240 },
  { id: 'devteam', label: 'Dev Team', y: 500, h: 340 },
  { id: 'qa', label: 'QA', y: 840, h: 320 },
]

const VIEW_W = 3950
const VIEW_H = 1180

const NODES = {
  start: { lane: 'devlead', type: 'start', x: 310, y: 175 },
  recibir: { lane: 'devlead', type: 'task', x: 580, y: 175, label: 'Recibir y analizar requerimientos' },
  validar: { lane: 'devlead', type: 'task', x: 850, y: 175, label: 'Validar y priorizar Requerimiento' },
  evaluar: { lane: 'devlead', type: 'task', x: 2470, y: 175, label: 'Evaluar Desarrollo' },
  devolverAvance: { lane: 'devlead', type: 'task', x: 2740, y: 55, label: 'Devolver avance' },
  gwAprobado: { lane: 'devlead', type: 'gateway', x: 2740, y: 175, label: '¿Aprobado?' },
  aprobarDesarrollo: { lane: 'devlead', type: 'task', x: 3010, y: 175, label: 'Aprobar Desarrollo' },
  analizarDevolucion: { lane: 'devlead', type: 'task', x: 3280, y: 175, label: 'Analizar Devolución' },
  asignarCorreccion: { lane: 'devlead', type: 'task', x: 3550, y: 175, label: 'Asignar Corrección' },

  backlog: { lane: 'scrum', type: 'task', x: 850, y: 380, label: 'Incorporar al Backlog' },
  planificar: { lane: 'scrum', type: 'task', x: 1120, y: 380, label: 'Planificar Sprint' },
  asignarTareas: { lane: 'scrum', type: 'task', x: 1390, y: 380, label: 'Asignar Tareas' },
  corregirDevolucion: { lane: 'scrum', type: 'task', x: 3550, y: 380, label: 'Corregir devolución' },

  analizarTarea: { lane: 'devteam', type: 'task', x: 1390, y: 610, label: 'Analizar la tarea' },
  desarrollar: { lane: 'devteam', type: 'task', x: 1660, y: 610, label: 'Desarrollar Funcionalidad' },
  ejecutarPruebas: { lane: 'devteam', type: 'task', x: 1930, y: 610, label: 'Ejecutar Pruebas de Caja Blanca' },
  gwExitosas: { lane: 'devteam', type: 'gateway', x: 2200, y: 610, label: '¿Pruebas Exitosas?', labelAbove: true },
  pruebaExitosa: { lane: 'devteam', type: 'task', x: 2470, y: 610, label: 'Prueba Exitosa' },
  corregirPruebas: { lane: 'devteam', type: 'task', x: 2200, y: 740, label: 'Corregir Pruebas' },
  corregirFuncionalidad: { lane: 'devteam', type: 'task', x: 2740, y: 740, label: 'Corregir funcionalidad' },

  testear: { lane: 'qa', type: 'task', x: 3010, y: 960, label: 'Testear Software' },
  gwAprobadas: { lane: 'qa', type: 'gateway', x: 3280, y: 960, label: '¿Pruebas Aprobadas?', labelAbove: true },
  aprobarVersion: { lane: 'qa', type: 'task', x: 3550, y: 960, label: 'Aprobar Versión y enviar a Producción' },
  end: { lane: 'qa', type: 'end', x: 3800, y: 960 },
  registrarDevolucion: { lane: 'qa', type: 'task', x: 3280, y: 1080, label: 'Registrar Devolución' },
}

const SIZE = {
  task: { hw: 90, hh: 42 },
  gateway: { hw: 38, hh: 38 },
  start: { hw: 26, hh: 26 },
  end: { hw: 26, hh: 26 },
}

function anchor(id, side) {
  const n = NODES[id]
  const { hw, hh } = SIZE[n.type]
  if (side === 'right') return { x: n.x + hw, y: n.y }
  if (side === 'left') return { x: n.x - hw, y: n.y }
  if (side === 'top') return { x: n.x, y: n.y - hh }
  return { x: n.x, y: n.y + hh }
}

function straight(fromId, fromSide, toId, toSide) {
  const a = anchor(fromId, fromSide)
  const b = anchor(toId, toSide)
  return `M${a.x},${a.y} L${b.x},${b.y}`
}

const EDGES = [
  { d: straight('start', 'right', 'recibir', 'left'), lane: 'devlead' },
  { d: straight('recibir', 'right', 'validar', 'left'), lane: 'devlead' },
  { d: straight('validar', 'bottom', 'backlog', 'top'), lane: 'devlead' },
  { d: straight('backlog', 'right', 'planificar', 'left'), lane: 'scrum' },
  { d: straight('planificar', 'right', 'asignarTareas', 'left'), lane: 'scrum' },
  { d: straight('asignarTareas', 'bottom', 'analizarTarea', 'top'), lane: 'scrum' },
  { d: straight('analizarTarea', 'right', 'desarrollar', 'left'), lane: 'devteam' },
  { d: straight('desarrollar', 'right', 'ejecutarPruebas', 'left'), lane: 'devteam' },
  { d: straight('ejecutarPruebas', 'right', 'gwExitosas', 'left'), lane: 'devteam' },
  { d: straight('gwExitosas', 'right', 'pruebaExitosa', 'left'), lane: 'devteam', label: 'Sí', labelPos: { x: 2298, y: 595 } },
  { d: straight('pruebaExitosa', 'top', 'evaluar', 'bottom'), lane: 'devteam' },
  { d: straight('evaluar', 'right', 'gwAprobado', 'left'), lane: 'devlead' },
  { d: straight('gwAprobado', 'right', 'aprobarDesarrollo', 'left'), lane: 'devlead', label: 'Sí', labelPos: { x: 2834, y: 160 } },
  { d: straight('aprobarDesarrollo', 'bottom', 'testear', 'top'), lane: 'devlead' },
  { d: straight('testear', 'right', 'gwAprobadas', 'left'), lane: 'qa' },
  { d: straight('gwAprobadas', 'right', 'aprobarVersion', 'left'), lane: 'qa', label: 'Sí', labelPos: { x: 3374, y: 945 } },
  { d: straight('aprobarVersion', 'right', 'end', 'left'), lane: 'qa' },

  { d: straight('gwExitosas', 'bottom', 'corregirPruebas', 'top'), lane: 'loop', label: 'No', labelPos: { x: 2232, y: 678 } },
  { d: 'M2110,740 L1900,740 L1900,652', lane: 'loop' },
  { d: straight('gwAprobado', 'top', 'devolverAvance', 'bottom'), lane: 'loop', label: 'No', labelPos: { x: 2774, y: 122 } },
  { d: straight('devolverAvance', 'bottom', 'corregirFuncionalidad', 'top'), lane: 'loop' },
  { d: 'M2650,740 L2650,790 L1930,790 L1930,652', lane: 'loop' },
  { d: straight('gwAprobadas', 'bottom', 'registrarDevolucion', 'top'), lane: 'loop', label: 'No', labelPos: { x: 3312, y: 1023 } },
  { d: straight('registrarDevolucion', 'top', 'analizarDevolucion', 'bottom'), lane: 'loop' },
  { d: straight('analizarDevolucion', 'right', 'asignarCorreccion', 'left'), lane: 'devlead' },
  { d: straight('asignarCorreccion', 'bottom', 'corregirDevolucion', 'top'), lane: 'devlead' },
  { d: 'M3550,422 L3550,815 L1960,815 L1960,652', lane: 'loop' },
]

function BpmnDiagram() {
  return (
    <div className="bpmn-wrap">
      <svg className="bpmn-svg" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={VIEW_W} height={VIEW_H}>
        <defs>
          {Object.entries(LANE_COLOR).map(([id, color]) => (
            <marker key={id} id={`arrow-${id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill={color} />
            </marker>
          ))}
          <marker id="arrow-loop" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="#f59e0b" />
          </marker>
        </defs>

        {LANES.map((lane) => (
          <g key={lane.id}>
            <rect x="0" y={lane.y} width={VIEW_W} height={lane.h} fill="#ffffff" />
            <rect x="0" y={lane.y} width="130" height={lane.h} fill={LANE_COLOR[lane.id]} opacity="0.12" />
            <rect x="126" y={lane.y} width="4" height={lane.h} fill={LANE_COLOR[lane.id]} />
            <text
              x="65"
              y={lane.y + lane.h / 2}
              textAnchor="middle"
              transform={`rotate(-90 65 ${lane.y + lane.h / 2})`}
              className="bpmn-lane-label"
              fill={LANE_COLOR[lane.id]}
            >
              {lane.label}
            </text>
          </g>
        ))}

        {LANES.map((lane) => (
          <line key={`sep-${lane.id}`} x1="0" y1={lane.y} x2={VIEW_W} y2={lane.y} className="bpmn-lane-sep" />
        ))}
        <line x1="0" y1={VIEW_H - 1} x2={VIEW_W} y2={VIEW_H - 1} className="bpmn-lane-sep" />
        <line x1="130" y1="0" x2="130" y2={VIEW_H} className="bpmn-lane-sep" />

        {EDGES.map((e, i) => (
          <g key={i}>
            <path
              d={e.d}
              className={`bpmn-edge ${e.lane === 'loop' ? 'bpmn-edge-loop' : 'bpmn-edge-main'}`}
              stroke={e.lane === 'loop' ? '#f59e0b' : LANE_COLOR[e.lane]}
              markerEnd={`url(#arrow-${e.lane})`}
            />
            {e.label && (
              <text x={e.labelPos.x} y={e.labelPos.y} className="bpmn-edge-label">
                {e.label}
              </text>
            )}
          </g>
        ))}

        {Object.entries(NODES).map(([id, n]) => {
          if (n.type === 'start') {
            return (
              <g key={id} className="bpmn-event bpmn-event-start">
                <circle cx={n.x} cy={n.y} r="26" />
              </g>
            )
          }
          if (n.type === 'end') {
            return (
              <g key={id} className="bpmn-event bpmn-event-end">
                <circle cx={n.x} cy={n.y} r="26" />
              </g>
            )
          }
          if (n.type === 'gateway') {
            const s = 38
            const points = `${n.x},${n.y - s} ${n.x + s},${n.y} ${n.x},${n.y + s} ${n.x - s},${n.y}`
            return (
              <g key={id} className="bpmn-node bpmn-gateway">
                <polygon points={points} />
                <text x={n.x} y={n.y + 8} textAnchor="middle" className="bpmn-gateway-mark">
                  ×
                </text>
                <foreignObject x={n.x - 90} y={n.labelAbove ? n.y - s - 54 : n.y + s + 8} width="180" height="46">
                  <div className="bpmn-gateway-label">{n.label}</div>
                </foreignObject>
              </g>
            )
          }
          return (
            <g key={id} className={`bpmn-node bpmn-task lane-${n.lane}`}>
              <rect x={n.x - 90} y={n.y - 42} width="180" height="84" rx="14" />
              <foreignObject x={n.x - 90} y={n.y - 42} width="180" height="84">
                <div className="bpmn-label">{n.label}</div>
              </foreignObject>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function Bpmn() {
  return (
    <>
      <section className="hero hero-sm">
        <h1>BPMN</h1>
      </section>

      <section className="section split">
        <Reveal>
          <div className="card panel">
            <h2>¿Qué es BPMN?</h2>
            <p>
              BPMN (Business Process Model and Notation) es un estándar gráfico para modelar
              procesos de negocio. Usa un conjunto de símbolos —eventos, tareas, compuertas de
              decisión y carriles o "lanes"— que muestran con claridad quién hace qué, en qué
              orden y bajo qué condiciones, dentro de un proceso.
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="card panel">
            <h2>¿Para qué sirve?</h2>
            <p>
              Permite documentar y comunicar procesos de forma visual y sin ambigüedades, tanto
              para perfiles técnicos como no técnicos. Facilita detectar cuellos de botella,
              estandarizar la forma de trabajar de un equipo y sirve de base para automatizar
              procesos en herramientas de gestión.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="band dark divider">
        <Reveal as="h2" className="band-title">
          Videos tutoriales
        </Reveal>
      </section>
      <section className="section">
        <div className="grid grid-2">
          <Reveal>
            <div className="card video-card">
              <h3>¿Qué es y para qué sirve BPMN?</h3>
              <div className="video-frame">
                <iframe
                  src="https://www.youtube.com/embed/NIMRIVpyKIY"
                  title="BPMN: qué es y para qué sirve"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="card video-card">
              <h3>Cómo hacer un diagrama BPMN</h3>
              <div className="video-frame">
                <iframe
                  src="https://www.youtube.com/embed/Vn9z3ZdInco"
                  title="Cómo hacer un diagrama BPMN"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="band teal divider">
        <Reveal as="h2" className="band-title light">
          Nuestro proceso: Desarrollo de Software
        </Reveal>
      </section>
      <section className="section section-wide">
        <p className="centered muted" style={{ maxWidth: 720, margin: '0 auto 24px' }}>
          Así modelamos en BPMN el flujo de trabajo del equipo, desde que llega un requerimiento
          hasta que la versión se aprueba y se envía a producción. Arrastra hacia los lados para
          recorrer el diagrama completo.
        </p>
        <Reveal>
          <BpmnDiagram />
        </Reveal>
      </section>

      <section className="section">
        <Reveal>
          <div className="card panel">
            <h2>Explicación del diagrama</h2>
            <p>
              El diagrama está dividido en cuatro carriles, uno por cada rol que participa en el
              proceso. Las flechas de color siguen el camino normal del trabajo y las flechas
              naranjas marcan los caminos de corrección, cuando algo no se aprueba y debe volver
              atrás. El proceso empieza con el círculo verde (un requerimiento nuevo) y termina en
              el círculo rojo (la versión publicada en producción).
            </p>
          </div>
        </Reveal>

        <div className="grid grid-2" style={{ marginTop: 24 }}>
          {BPMN_PASOS.map((p, i) => (
            <Reveal key={p.lane} delay={(i % 2) * 90}>
              <article className="card" style={{ borderTop: `4px solid ${LANE_COLOR[p.lane]}` }}>
                <span className="concl-tag" style={{ color: LANE_COLOR[p.lane] }}>
                  Paso {i + 1}
                </span>
                <h3 className="tight">{p.title}</h3>
                <p className="small">{p.text}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="card panel" style={{ marginTop: 24, borderTop: '4px solid #f59e0b' }}>
            <h3 className="tight">Decisiones y caminos de corrección</h3>
            <ul className="concl-list">
              <li>
                <strong>¿Pruebas exitosas?</strong> Si las pruebas de caja blanca fallan, el Dev
                Team corrige las pruebas y vuelve a ejecutarlas antes de entregar.
              </li>
              <li>
                <strong>¿Aprobado?</strong> Si el Dev Lead no aprueba el desarrollo, devuelve el
                avance y el Dev Team corrige la funcionalidad para volver a probarla.
              </li>
              <li>
                <strong>¿Pruebas aprobadas?</strong> Si QA encuentra errores, registra la
                devolución; el Dev Lead la analiza y asigna la corrección, el Scrum Master la
                organiza y el Dev Team la resuelve, repitiendo el ciclo hasta que la versión
                quede aprobada.
              </li>
            </ul>
          </div>
        </Reveal>
      </section>
    </>
  )
}

const BPMN_PASOS = [
  {
    lane: 'devlead',
    title: 'Dev Lead: recibe y prioriza',
    text: 'El proceso inicia cuando llega un requerimiento. El Dev Lead lo recibe, lo analiza para entender qué se necesita y lo valida y prioriza según su importancia para el área.',
  },
  {
    lane: 'scrum',
    title: 'Scrum Master: organiza el sprint',
    text: 'El requerimiento validado se incorpora al Backlog. El Scrum Master planifica el sprint y asigna las tareas al equipo de desarrollo.',
  },
  {
    lane: 'devteam',
    title: 'Dev Team: desarrolla y prueba',
    text: 'El Dev Team analiza la tarea, desarrolla la funcionalidad y ejecuta pruebas de caja blanca. Si son exitosas, el desarrollo pasa al Dev Lead, que lo evalúa y, si cumple, lo aprueba.',
  },
  {
    lane: 'qa',
    title: 'QA: valida y libera',
    text: 'QA testea el software aprobado. Si las pruebas son aprobadas, se aprueba la versión y se envía a producción, lo que cierra el proceso.',
  },
]
