// Resumen del "Plan de Contingencia" (src/assets/PLAN CONTINGENCIAS SilkRoad.md)

export const DOC_URL =
  'https://docs.google.com/document/d/1lveKOULbA2xDvQOPb8_z-EJFAbM1Q2itwTm7sXEMpZg/edit?usp=sharing'

export const generalidades = [
  {
    icon: 'target',
    title: 'Objetivo',
    text: 'Asegurar la continuidad de los procedimientos informáticos ante fallas y eventos inesperados, y restaurar los equipos e información con las menores pérdidas en el menor tiempo posible.',
  },
  {
    icon: 'layers',
    title: 'Alcance',
    text: 'Basado en la realidad de IATECH Co; sirve como punto de partida para establecer políticas de seguridad de la información y continuidad del servicio.',
  },
  {
    icon: 'rocket',
    title: 'Meta',
    text: 'Potenciar el nivel informático del área haciendo sus funciones cotidianas seguras y consistentes, para un buen funcionamiento ante cualquier contingencia.',
  },
]

export const NIVELES = ['Muy bajo', 'Bajo', 'Medio', 'Alto', 'Muy alto']

// nivel: índice en NIVELES
export const riesgos = [
  { riesgo: 'Incendio', nivel: 4 },
  { riesgo: 'Inundación', nivel: 1 },
  { riesgo: 'Robo común', nivel: 4 },
  { riesgo: 'Vandalismo, daño de equipos y archivos', nivel: 4 },
  { riesgo: 'Fallas en los equipos, daño de archivos', nivel: 4 },
  { riesgo: 'Equivocaciones, daño de archivos', nivel: 2 },
  { riesgo: 'Virus, daño de equipos y archivos', nivel: 4 },
  { riesgo: 'Terremotos, daño de equipos y archivos', nivel: 0 },
  { riesgo: 'Acceso no autorizado, filtración de información', nivel: 4 },
  { riesgo: 'Robo de datos', nivel: 4 },
  { riesgo: 'Fraude, alteración de información', nivel: 3 },
  { riesgo: 'Desastre total', nivel: 1 },
  { riesgo: 'Deslizamiento', nivel: 3 },
]

export const sistemaCritico = [
  ['Sistema', 'Plataforma Clínica Operativa (web y app), con APIs de citas e historias clínicas.'],
  ['Tecnología', 'Vue y Angular, Flask y Node.js, MongoDB, Supabase y Amazon RDS; código en GitHub.'],
  ['Volumen', '≈ 50 GB (historias clínicas, documentos e imágenes en S3), creciendo 2–3 GB al mes.'],
  ['Transacciones', '≈ 5,000 diarias · 35,000 semanales · 150,000 mensuales.'],
  ['Equipamiento', 'AWS (EC2/contenedores), RDS multizona, S3, cifrado KMS, Cloudflare y enlaces redundantes.'],
  ['Importancia', 'Muy alta: sostiene el servicio a los centros médicos y las historias clínicas electrónicas.'],
  ['Restauración', 'Copias automáticas en la nube, historial de GitHub, SSD externa y validación con pruebas funcionales.'],
]

export const fases = [
  {
    id: 'antes',
    title: 'Antes del desastre',
    icon: 'shield',
    items: [
      'Relación priorizada de sistemas de información críticos.',
      'Inventario actualizado y etiquetado de equipos por importancia.',
      'Backups del sistema operativo, software base, aplicativos y datos.',
      'Políticas de backup: periodicidad, incrementales, registro y pruebas de restauración.',
      'Equipos operativos con un responsable de seguridad por área.',
    ],
  },
  {
    id: 'durante',
    title: 'Durante el desastre',
    icon: 'spark',
    items: [
      'Plan de emergencia para escenarios de día y de noche.',
      'Vías de escape, evacuación y resguardo de activos de información.',
      'Secuencia de llamadas: bomberos, ambulancias, seguridad y personal designado.',
      'Equipos definidos con funciones claras durante el siniestro.',
      'Entrenamientos y prácticas periódicas del personal.',
    ],
  },
  {
    id: 'despues',
    title: 'Después del desastre',
    icon: 'cycle',
    items: [
      'Evaluación de daños: sistemas afectados, equipos recuperables y tiempos.',
      'Priorización de actividades estratégicas y urgentes.',
      'Ejecución en dos etapas: restaurar servicios y volver a los recursos propios.',
      'Evaluación de resultados de la recuperación.',
      'Retroalimentación y mejora del plan de acción.',
    ],
  },
]

export const contramedidas = [
  { area: 'Subgerencia de Software', riesgo: 'Acceso no autorizado y filtración de información estratégica.', medida: 'Gestión de la confidencialidad, accesos por rol y reporte a la Gerencia General.' },
  { area: 'Líder de Desarrollo', riesgo: 'Fallas e incidencias críticas en los sistemas.', medida: 'Monitoreo con Zabbix, seguimiento de cronogramas y atención de incidencias fuera de horario.' },
  { area: 'Desarrollo de Sistemas', riesgo: 'Equivocaciones y daño de archivos de código.', medida: 'Control de versiones en GitHub, revisión con pull requests y documentación de cambios.' },
  { area: 'Soporte al Desarrollo', riesgo: 'Caída del servicio e incidencias sin atender.', medida: 'Tickets con SLA en Zendesk, pruebas funcionales y comunicación directa con desarrollo.' },
  { area: 'Herramientas de Desarrollo', riesgo: 'Fallas del entorno, herramientas deprecadas y licencias por vencer.', medida: 'Triggers de Zabbix, configuración documentada y respaldos de los entornos.' },
  { area: 'Toda el área', riesgo: 'Cortes de luz y fallas de equipos.', medida: 'UPS, SSD externa y copias en la nube.' },
  { area: 'Toda el área', riesgo: 'Caída de internet.', medida: 'Tres enlaces (Tigo, Entel y AXS) con failover automático.' },
  { area: 'Toda el área', riesgo: 'Robo de datos, ataques y virus.', medida: 'Cloudflare con WAF, cifrado KMS, IAM, red privada y análisis con Snyk y Trivy.' },
]

export const erd = [
  { area: 'Subgerencia de Software', funcion: 'Coordina el ERD, define prioridades y reporta a la Gerencia General.', integrante: 'Marvin Mollo' },
  { area: 'Líder de Desarrollo', funcion: 'Dirige la recuperación técnica de los sistemas.', integrante: 'Adrián Ordóñez' },
  { area: 'Desarrollo de Sistemas', funcion: 'Restablece funcionalidades y corrige errores del código.', integrante: 'Adrián Gonzales' },
  { area: 'Soporte al Desarrollo', funcion: 'Atiende incidencias, valida con pruebas funcionales y avisa a los centros médicos.', integrante: 'Diego Laguna' },
  { area: 'Herramientas de Desarrollo', funcion: 'Restablece entornos, repositorios, respaldos y accesos.', integrante: 'Adriana Álvarez' },
]

export const simulacros = [
  { area: 'Herramientas de Desarrollo', riesgo: 'Fallas de equipos y pérdida de archivos', fecha: '9 dic 2026', nota: 'Restaurar desde la nube y la SSD externa.' },
  { area: 'Soporte al Desarrollo', riesgo: 'Caída del enlace de internet', fecha: '13 ene 2027', nota: 'Comprobar el failover entre Tigo, Entel y AXS.' },
  { area: 'Desarrollo de Sistemas', riesgo: 'Virus y daño de archivos', fecha: '10 feb 2027', nota: 'Recuperar el código desde GitHub.' },
  { area: 'Líder de Desarrollo', riesgo: 'Incendio o corte eléctrico', fecha: '10 mar 2027', nota: 'Probar UPS, evacuación y continuidad remota.' },
  { area: 'Subgerencia de Software', riesgo: 'Acceso no autorizado y robo de datos', fecha: '14 abr 2027', nota: 'Revisar accesos, Cloudflare y cifrado.' },
]
