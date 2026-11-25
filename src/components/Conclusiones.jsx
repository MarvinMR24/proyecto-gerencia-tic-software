import { TOOLS, totalCost } from '../data/inventario'
import { TOTAL as presupuestoTotal, META, bs } from '../data/presupuesto'
import { mbtiResultados } from '../data/content'
import { IconBadge } from './Icon'
import Reveal from './Reveal'

const usd = (n) => `$${n.toLocaleString('en-US')}`

// Conclusiones: lo que aportó el equipo (aporte Team)
const conclusiones = [
  {
    icon: 'compass',
    tag: 'Aporte del equipo',
    title: 'Conclusión general',
    intro:
      'Como equipo construimos el Área de Software de Silk Road desde sus bases: qué es la gestión de la tecnología, hacia dónde queremos ir, cómo nos organizamos, quiénes somos y cómo trabajamos.',
    items: [
      'La gestión de la tecnología no se limita a comprar herramientas: implica planificar, adoptar, mantener y retirar tecnología de forma ordenada, convirtiendo el conocimiento en soluciones concretas para el sector salud.',
      'La misión y la visión enfocadas en el área médica le dieron un propósito común al equipo, y el organigrama con la descripción de puestos dejó claro quién es responsable de qué.',
      'El MBTI mostró un equipo diverso y complementario: perfiles estratégicos (ENTJ, INTJ) que dirigen, uno práctico (ISTP) que resuelve, uno comunicativo (ENFP) para el soporte y uno cuidadoso (ISFJ) que mantiene el entorno estable.',
    ],
  },
  {
    icon: 'target',
    tag: 'Aporte del equipo',
    title: 'Conclusión del objetivo',
    intro:
      'El objetivo del área era planificar y ejecutar cada proyecto con calidad, alinear el trabajo con la estrategia de la organización y sostener en el tiempo los sistemas que construimos. Consideramos que se cumplió:',
    items: [
      'Planificar y ejecutar con calidad: Scrum nos da ciclos cortos de entrega, IDEF0 muestra la función del área con sus entradas, controles, salidas y mecanismos, y BPMN detalla el flujo desde el requerimiento hasta producción.',
      'Alinear con la organización: cada cargo tiene un objetivo, una misión personal y una línea de reporte que conecta su trabajo con la Subgerencia y con la estrategia de la empresa.',
      `Sostener en el tiempo: el presupuesto proyectado a ${META.meses} meses (${bs(presupuestoTotal)}) y el plan de contingencia aseguran los recursos y la respuesta ante fallas para que el área siga funcionando.`,
    ],
  },
  {
    icon: 'code',
    tag: 'Aporte del equipo',
    title: 'Conclusiones tecnológicas',
    intro:
      'En lo tecnológico, el equipo pasó de tener herramientas sueltas a contar con una visión basada en datos de lo que usa, lo que cuesta y lo que necesita vigilar.',
    items: [
      `El inventario registra ${TOOLS.length} herramientas con un costo anual de ${usd(totalCost)}. El dashboard muestra que el gasto se concentra en Entorno / CLI (casi la mitad del total) y que la mayoría de las herramientas son open source y están activas.`,
      'La minería de datos con WEKA (Apriori, J48 y SimpleKMeans) mostró que la falta de actualización es la señal más clara de obsolescencia: las 8 herramientas deprecadas llevan más de 150 días sin actualizarse, y un árbol de decisión predice el estado con 98% de acierto.',
      'Zabbix permite pasar de reaccionar a los problemas a anticiparlos, y conocer qué cubre cada proveedor externo (nube, seguridad, pagos, comunicación y soporte) es clave para la continuidad del servicio.',
    ],
  },
]

// Conclusiones personales: una por integrante, desde el rol que ocupa en el área
const personales = {
  'subgerente-software':
    'Como Subgerente de Software aprendí que dirigir un área no es solo repartir tareas: es darle un rumbo claro con la misión, la visión y el organigrama, y sostenerlo con números. Armar el presupuesto, revisar el dashboard de Tableau y el plan de contingencia me mostró que las decisiones de un directivo deben apoyarse en datos y anticipar riesgos, para que cada proyecto se alinee con los objetivos de la empresa y se cumpla en plazo, costo y calidad.',
  'lider-desarrollo':
    'Desde el rol de Líder de Desarrollo concluyo que la calidad técnica depende de tener un proceso claro y conocido por todos. Modelar el flujo en BPMN e IDEF0 y organizarlo con Scrum me permitió ver dónde se evalúa, se aprueba o se devuelve el trabajo, y lo importante que es traducir los lineamientos de la Subgerencia en tareas concretas y estándares que reduzcan errores antes de llegar a producción.',
  'desarrollador-sistemas':
    'Como Desarrollador de Sistemas entendí que programar es solo una parte del trabajo: también hay que probar, documentar y corregir a tiempo. El proceso BPMN, con sus pruebas de caja blanca y sus caminos de corrección, me mostró que entregar funcionalidades estables en cada sprint depende de detectar los errores lo antes posible y de trabajar coordinado con soporte y QA.',
  'analista-soporte':
    'Desde el rol de Analista de Soporte al Desarrollo concluyo que un buen soporte es el puente entre los usuarios y el equipo técnico. Conocer los proveedores externos como Zendesk, el monitoreo con Zabbix y el plan de contingencia me enseñó que responder rápido a una incidencia requiere tener canales ordenados, alertas que avisen antes que el usuario y una comunicación clara con desarrollo para cerrar cada caso.',
  'especialista-herramientas':
    'Como Especialista de Herramientas de Desarrollo y Scrum Master aprendí que un equipo solo rinde si su entorno es estable. El inventario de 100 herramientas, el análisis con WEKA y el panel de monitoreo me mostraron que hay que vigilar licencias, versiones y herramientas deprecadas de forma continua, porque la falta de actualización es la señal más clara de que una herramienta va a dejar de servir y de que el equipo puede quedarse sin trabajar.',
}

// Recomendaciones: hacia el futuro
const recomendaciones = [
  {
    icon: 'rocket',
    tag: 'A futuro',
    title: 'Recomendaciones generales',
    items: [
      'Mantener viva la estructura del área: revisar cada año la misión, la visión, el organigrama y la descripción de puestos según crezca el equipo y cambien las necesidades del área médica.',
      'Hacer seguimiento mensual del presupuesto comparando lo planificado con lo ejecutado, para ajustar a tiempo los gastos del área.',
      'Probar el plan de contingencia con simulacros periódicos y actualizarlo cada vez que cambie un proveedor o un sistema crítico.',
      'Aprovechar los perfiles MBTI al asignar tareas y formar parejas de trabajo, combinando perfiles estratégicos con perfiles prácticos y de comunicación.',
    ],
  },
  {
    icon: 'server',
    tag: 'A futuro',
    title: 'Recomendaciones tecnológicas',
    items: [
      'Reemplazar las herramientas deprecadas de Cliente SQL y Librería UI y decidir sobre los asistentes de IA que siguen en evaluación, ya que todos son de suscripción.',
      'Revisar las herramientas de Entorno / CLI, que concentran el mayor gasto, y evaluar alternativas open source o planes más económicos.',
      'Conectar el inventario con Zabbix para recibir alertas automáticas antes de que una licencia expire o cuando una herramienta pase 150 días sin actualizarse.',
      'Volver a ejecutar el análisis en WEKA con datos nuevos para detectar a tiempo qué herramientas se están volviendo obsoletas.',
    ],
  },
  {
    icon: 'book',
    tag: 'A futuro',
    title: 'Recomendaciones académicas',
    items: [
      'Priorizar la capacitación y certificación del equipo en las tecnologías que ya usamos (nube, seguridad, monitoreo y metodologías ágiles).',
      'Mantener actualizados los diagramas IDEF0 y BPMN y usarlos como material de inducción para nuevos integrantes del área.',
      'Aplicar Scrum de forma constante, con retrospectivas al final de cada sprint, para aprender de cada ciclo y mejorar el proceso y la comunicación.',
      'Seguir profundizando en minería de datos y análisis de información como herramientas para tomar decisiones tecnológicas basadas en evidencia.',
    ],
  },
]

function Bloque({ data, tone }) {
  return (
    <article className="card panel concl-block">
      <div className="concl-head">
        <IconBadge name={data.icon} tone={tone} />
        <div>
          <span className="concl-tag">{data.tag}</span>
          <h3 className="tight">{data.title}</h3>
        </div>
      </div>
      {data.intro && <p>{data.intro}</p>}
      <ul className="concl-list">
        {data.items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </article>
  )
}

export default function Conclusiones() {
  return (
    <>
      <section className="hero hero-sm">
        <h1>Conclusiones y Recomendaciones</h1>
      </section>

      <section className="band dark divider">
        <Reveal as="h2" className="band-title">
          Conclusiones
        </Reveal>
      </section>
      <section className="section concl-stack">
        {conclusiones.map((c, i) => (
          <Reveal key={c.title}>
            <Bloque data={c} tone={i % 2 === 0 ? 'purple' : 'teal'} />
          </Reveal>
        ))}
      </section>

      <section className="band dark divider">
        <Reveal as="h2" className="band-title">
          Conclusiones personales
        </Reveal>
      </section>
      <section className="section">
        <p className="centered muted" style={{ maxWidth: 680, margin: '0 auto 32px' }}>
          Cada integrante comparte lo que concluye del proyecto desde el rol que ocupa dentro del Área de Software.
        </p>
        <div className="grid grid-2">
          {mbtiResultados.map((m, i) => (
            <Reveal key={m.positionId} delay={(i % 2) * 90}>
              <article className="card panel concl-block">
                <div className="concl-head">
                  <IconBadge name="people" tone={i % 2 === 0 ? 'purple' : 'teal'} />
                  <div>
                    <span className="concl-tag">{m.role}</span>
                    <h3 className="tight">{m.name}</h3>
                  </div>
                </div>
                <p className="small">{personales[m.positionId]}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="band teal divider">
        <Reveal as="h2" className="band-title light">
          Recomendaciones
        </Reveal>
      </section>
      <section className="section concl-stack">
        {recomendaciones.map((r, i) => (
          <Reveal key={r.title}>
            <Bloque data={r} tone={i % 2 === 0 ? 'teal' : 'purple'} />
          </Reveal>
        ))}
      </section>
    </>
  )
}
