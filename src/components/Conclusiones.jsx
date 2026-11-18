import { TOOLS, totalCost } from '../data/inventario'
import { TOTAL as presupuestoTotal, META, bs } from '../data/presupuesto'
import { IconBadge } from './Icon'
import Reveal from './Reveal'

const usd = (n) => `$${n.toLocaleString('en-US')}`

const conclusiones = [
  {
    icon: 'compass',
    tag: 'Fundamentos',
    title: 'Gestión de la tecnología y CTI',
    text: 'La gestión de la tecnología no se limita a comprar herramientas: implica planificar, adoptar, mantener y retirar tecnología de forma ordenada. Entender la relación entre ciencia, tecnología e innovación nos permitió ver al Área de Software como un espacio donde el conocimiento se convierte en soluciones concretas para el sector salud.',
  },
  {
    icon: 'target',
    tag: 'Dirección',
    title: 'Misión, visión y organización',
    text: 'Definir una misión y una visión enfocadas en el área médica le dio un propósito común al equipo. El organigrama y la descripción de posiciones aclaran quién es responsable de qué, evitando duplicar tareas y dejando visibles las líneas de reporte desde la Subgerencia hasta cada rol técnico.',
  },
  {
    icon: 'people',
    tag: 'Personas',
    title: 'MBTI y el perfil del equipo',
    text: 'Los resultados del MBTI muestran un equipo diverso: perfiles estratégicos (ENTJ, INTJ) que planifican y dirigen, un perfil práctico (ISTP) para resolver problemas técnicos, un perfil comunicativo (ENFP) para el soporte y un perfil cuidadoso (ISFJ) para mantener el entorno estable. Esta mezcla coincide con los roles asignados y es una fortaleza del área.',
  },
  {
    icon: 'cycle',
    tag: 'Procesos',
    title: 'Scrum, IDEF0 y BPMN',
    text: 'Scrum ofrece un marco ágil para entregar valor en ciclos cortos. IDEF0 nos ayudó a ver la función principal del área con sus entradas, controles, salidas y mecanismos, y BPMN a detallar paso a paso el flujo de desarrollo, desde el requerimiento hasta producción. Usarlos juntos da una visión general y una visión detallada del mismo proceso.',
  },
  {
    icon: 'chart',
    tag: 'Datos',
    title: 'Inventario y dashboard',
    text: `El inventario registra ${TOOLS.length} herramientas con un costo anual de ${usd(totalCost)}. El dashboard revela que el gasto está concentrado en la categoría Entorno / CLI (casi la mitad del total), que la mayoría de las herramientas son open source y están activas, y que los puntos a atender son pocos y concretos: las deprecadas de Cliente SQL y Librería UI y los asistentes de IA en evaluación.`,
  },
  {
    icon: 'dna',
    tag: 'Patrones',
    title: 'Minería de datos con WEKA',
    text: 'Aplicar Apriori, J48 y SimpleKMeans al inventario mostró que la falta de actualización es la señal más clara de obsolescencia: las 8 herramientas deprecadas llevan más de 150 días sin actualizarse. Con solo dos preguntas, un árbol de decisión predice el estado de una herramienta con 98% de acierto.',
  },
  {
    icon: 'shield',
    tag: 'Operación',
    title: 'Monitoreo y soporte externo',
    text: 'Zabbix permite pasar de reaccionar a los problemas a anticiparlos, vigilando la plataforma clínica, los servidores en AWS y la expiración de licencias. A la vez, el área depende de proveedores externos (nube, seguridad, pagos, comunicación y soporte), por lo que conocer qué cubre cada uno es clave para la continuidad del servicio.',
  },
  {
    icon: 'card',
    tag: 'Recursos',
    title: 'Presupuesto del área',
    text: `El presupuesto proyectado a ${META.meses} meses suma ${bs(presupuestoTotal)}. Cerca de tres cuartas partes corresponden a inversión única (equipos y compras que se hacen una sola vez), mientras que los servicios recurrentes representan una porción menor, lo que hace al área sostenible una vez realizada la inversión inicial.`,
  },
]

const recomendaciones = [
  'Revisar periódicamente las herramientas de Entorno / CLI, que concentran el mayor gasto, y evaluar alternativas open source o planes más económicos donde sea posible.',
  'Reemplazar las herramientas deprecadas de Cliente SQL y Librería UI y tomar una decisión sobre los asistentes de IA que siguen en evaluación, ya que todos son de suscripción.',
  'Conectar el inventario con Zabbix para recibir alertas automáticas antes de que una licencia o suscripción expire y cuando una herramienta pase 150 días sin actualizarse.',
  'Mantener actualizados los diagramas IDEF0 y BPMN cada vez que cambie el proceso de desarrollo, para que sigan siendo una guía real del trabajo del equipo.',
  'Aprovechar los perfiles MBTI al asignar tareas y al formar parejas de trabajo, combinando perfiles estratégicos con perfiles prácticos y de comunicación.',
  'Aplicar Scrum de forma constante, con retrospectivas al final de cada sprint, para detectar mejoras en el proceso y en la comunicación del equipo.',
  'Hacer seguimiento mensual del presupuesto comparando lo planificado con lo ejecutado, y priorizar la capacitación y certificación del equipo en las tecnologías que ya usamos.',
  'Contar con un plan de contingencia documentado y probado para responder ante caídas de servicios, pérdida de información o fallas de proveedores externos.',
]

export default function Conclusiones() {
  return (
    <>
      <section className="hero hero-sm">
        <h1>Conclusiones y Recomendaciones</h1>
      </section>

      <section className="section">
        <Reveal>
          <div className="card panel">
            <h2>Una mirada a todo el proyecto</h2>
            <p>
              A lo largo de este sitio construimos el Área de Software de Silk Road desde sus bases: qué es la gestión de
              la tecnología, hacia dónde queremos ir, cómo nos organizamos, quiénes somos, cómo trabajamos, con qué
              herramientas contamos, cómo las vigilamos y cuánto cuesta sostener todo. Estas son las conclusiones a las
              que llegamos y las recomendaciones que proponemos para seguir mejorando.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="band dark divider">
        <Reveal as="h2" className="band-title">
          Conclusiones
        </Reveal>
      </section>
      <section className="section">
        <div className="grid grid-2">
          {conclusiones.map((c, i) => (
            <Reveal key={c.title} delay={(i % 2) * 90}>
              <article className="card">
                <IconBadge name={c.icon} tone={i % 2 === 0 ? 'purple' : 'teal'} />
                <span className="concl-tag">{c.tag}</span>
                <h3 className="tight">{c.title}</h3>
                <p className="small">{c.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="card panel">
            <h2>Conclusión general</h2>
            <p>
              El Área de Software cuenta con una dirección clara, un equipo con perfiles complementarios, procesos
              documentados y una visión basada en datos de sus herramientas y costos. El principal reto ya no es
              construir la estructura, sino mantenerla viva: medir, revisar y ajustar de forma continua para que la
              tecnología siga respondiendo a las necesidades del área médica.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="band teal divider">
        <Reveal as="h2" className="band-title light">
          Recomendaciones
        </Reveal>
      </section>
      <section className="section">
        <Reveal>
          <div className="card panel">
            <ol className="concl-list">
              {recomendaciones.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ol>
          </div>
        </Reveal>
      </section>
    </>
  )
}
