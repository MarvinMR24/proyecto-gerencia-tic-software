import { IconBadge } from './Icon'
import Reveal from './Reveal'

const COMPONENTS = [
  {
    icon: 'server',
    title: 'Zabbix Server',
    text: 'El núcleo del sistema. Recibe los datos, evalúa los triggers, genera los problemas y dispara las acciones (alertas, scripts, escalamientos).',
  },
  {
    icon: 'cube',
    title: 'Zabbix Agent',
    text: 'Programa liviano instalado en cada servidor o equipo. Recoge métricas locales (CPU, memoria, disco, procesos, logs) y las envía al servidor.',
  },
  {
    icon: 'layers',
    title: 'Zabbix Proxy',
    text: 'Recolector intermedio para sedes remotas o redes separadas. Junta los datos localmente y los reenvía al servidor, aliviando su carga.',
  },
  {
    icon: 'database',
    title: 'Base de datos',
    text: 'MySQL o PostgreSQL. Guarda la configuración, el historial de métricas, las tendencias y los eventos.',
  },
  {
    icon: 'chart',
    title: 'Frontend web',
    text: 'Interfaz en PHP para configurar todo y ver dashboards, gráficos, mapas de red y la lista de problemas en tiempo real.',
  },
]

const CONCEPTS = [
  { title: 'Host', text: 'Cualquier cosa que se monitorea: un servidor, un servicio, una aplicación o, en nuestro caso, una herramienta del inventario.' },
  { title: 'Item', text: 'Una métrica concreta que se mide en un host, como el uso de CPU, la disponibilidad o los días que faltan para que expire una licencia.' },
  { title: 'Trigger', text: 'Una regla sobre un item que define cuándo hay un problema, por ejemplo "la licencia expira en menos de 60 días".' },
  { title: 'Severidad', text: 'Cada trigger tiene un nivel: No clasificado, Información, Advertencia, Media, Alta o Desastre.' },
  { title: 'Acción', text: 'Lo que pasa cuando se dispara un problema: enviar un correo, un mensaje a Slack o Telegram, abrir un ticket o ejecutar un script.' },
  { title: 'Template', text: 'Una plantilla reutilizable de items, triggers y gráficos que se aplica a muchos hosts a la vez.' },
]

const STEPS = [
  { title: 'Recolectar', text: 'Los agentes (o chequeos sin agente como SNMP, HTTP, ICMP o APIs) toman las métricas cada cierto intervalo.' },
  { title: 'Almacenar', text: 'El servidor guarda cada valor en la base de datos como historial y lo resume en tendencias.' },
  { title: 'Evaluar', text: 'Cada nuevo valor se compara contra los triggers configurados para detectar problemas.' },
  { title: 'Reaccionar', text: 'Si un trigger se activa, se crea un problema y se ejecutan las acciones: alertas, escalamientos o autorreparación.' },
]

const USES = [
  'Disponibilidad de la plataforma clínica (web y app) y de sus APIs de citas e historias clínicas.',
  'Recursos de los servidores en AWS: CPU, memoria, disco, base de datos y colas.',
  'Expiración de licencias y suscripciones del inventario de herramientas de desarrollo.',
  'Herramientas deprecadas que siguen en uso y versiones sin actualizar por mucho tiempo.',
  'Certificados SSL, DNS y protección de Cloudflare.',
]

export default function Monitoreo() {
  return (
    <>
      <section className="hero hero-sm">
        <h1>Monitoreo</h1>
      </section>

      <section className="section split">
        <Reveal>
          <div className="card panel">
            <h2>¿Qué es Zabbix?</h2>
            <p>
              Zabbix es una plataforma de monitoreo de código abierto y de nivel empresarial. Vigila en tiempo real
              servidores, redes, servicios en la nube, bases de datos y aplicaciones, y avisa al equipo apenas algo
              falla o está por fallar. Es gratuita, no tiene límite de equipos monitoreados y la usan desde pequeñas
              empresas hasta bancos y operadoras de telecomunicaciones.
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="card panel">
            <h2>¿Para qué lo usamos?</h2>
            <p>
              En el Área de Software usamos Zabbix para saber, antes que los centros médicos, si algo no está
              funcionando. Monitoreamos:
            </p>
            <ul className="position-list">
              {USES.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <section className="band teal divider">
        <Reveal as="h2" className="band-title light">
          ¿Cómo funciona?
        </Reveal>
      </section>
      <section className="section">
        <div className="grid grid-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 70}>
              <div className="card centered step-card">
                <span className="step-number">{i + 1}</span>
                <h3 className="tight">{s.title}</h3>
                <p className="small">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="band dark divider">
        <Reveal as="h2" className="band-title">
          Arquitectura
        </Reveal>
      </section>
      <section className="section">
        <div className="grid grid-5">
          {COMPONENTS.map((c, i) => (
            <Reveal key={c.title} delay={i * 70}>
              <div className="card centered">
                <IconBadge name={c.icon} tone={i % 2 === 0 ? 'purple' : 'teal'} size={52} />
                <h3 className="tight">{c.title}</h3>
                <p className="small">{c.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="band teal divider">
        <Reveal as="h2" className="band-title light">
          Conceptos clave
        </Reveal>
      </section>
      <section className="section">
        <div className="grid grid-3">
          {CONCEPTS.map((c, i) => (
            <Reveal key={c.title} delay={i * 60}>
              <div className="card">
                <h3>{c.title}</h3>
                <p className="small">{c.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section split">
        <Reveal>
          <div className="card panel">
            <h2>Nuestra implementación</h2>
            <p>
              Armamos un panel de monitoreo al estilo Zabbix sobre el inventario de herramientas de desarrollo. Cada
              herramienta es un host, agrupado por categoría, con items de disponibilidad, días para expirar la
              licencia, días sin actualizar y costo. Los triggers marcan como problema las herramientas deprecadas,
              las licencias por vencer y las versiones desactualizadas.
            </p>
            <p className="small">
              Es una simulación solo de frontend: un servidor Zabbix real necesita procesos corriendo todo el tiempo
              (servidor, agentes y base de datos), algo que Vercel no ofrece porque solo sirve sitios estáticos y
              funciones de corta duración. Para producción, Zabbix va en una instancia propia (por ejemplo en AWS) y
              este panel podría leer sus datos por la API de Zabbix.
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="card video-card">
            <h3>¿Qué es Zabbix y para qué sirve?</h3>
            <div className="video-frame">
              <iframe
                src="https://www.youtube.com/embed/6wdCafLzaCI"
                title="¿Qué es Zabbix y para qué sirve?"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section">
        <div className="grid grid-2">
          <Reveal>
            <div className="card video-card">
              <h3>Introducción a Zabbix</h3>
              <div className="video-frame">
                <iframe
                  src="https://www.youtube.com/embed/iU-_8l66KDw"
                  title="Introducción a Zabbix"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="card video-card">
              <h3>Zabbix: Quick Overview (inglés)</h3>
              <div className="video-frame">
                <iframe
                  src="https://www.youtube.com/embed/MWM447XYmtU"
                  title="Zabbix - Quick Overview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="band dark divider">
        <Reveal className="cta-inventario">
          <h2 className="band-title">Ver el monitor en vivo</h2>
          <a href="/monitoreo.html" target="_blank" rel="noopener noreferrer" className="cta-inventario-link">
            Abrir panel de monitoreo ↗
          </a>
        </Reveal>
      </section>
    </>
  )
}
