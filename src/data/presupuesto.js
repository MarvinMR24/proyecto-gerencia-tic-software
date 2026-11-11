// Presupuesto del Área de Software — proyección a cuatro meses, en Bolivianos (Bs).

export const META = {
  area: 'Software',
  responsable: 'Subgerencia de Software',
  meses: 4,
  moneda: 'Bolivianos (Bs)',
}

const equipos = [
  {
    concepto: 'Computadora portátil para desarrollo',
    unidad: 'Unidad',
    cantidad: 3,
    unitario: 6500,
    obs: 'Equipos para desarrolladores',
    que: 'Laptop con procesador de varios núcleos, 16 GB de RAM o más y disco SSD, preparada para programar.',
    porque:
      'Es la herramienta principal de cada desarrollador: escribir código, ejecutar la aplicación localmente, correr pruebas y participar en reuniones remotas desde cualquier lugar.',
  },
  {
    concepto: 'Estación de trabajo de alto rendimiento',
    unidad: 'Unidad',
    cantidad: 1,
    unitario: 8500,
    obs: 'Compilación, pruebas y tareas exigentes',
    que: 'Computadora de escritorio con mayor potencia de procesamiento y memoria que una laptop.',
    porque:
      'Se reserva para tareas pesadas: compilar el proyecto completo, levantar varios contenedores a la vez, ejecutar pruebas automatizadas y simular carga sin frenar los equipos personales.',
  },
  {
    concepto: 'Monitor externo',
    unidad: 'Unidad',
    cantidad: 2,
    unitario: 1200,
    obs: 'Productividad y pruebas de interfaz',
    que: 'Pantalla adicional que se conecta a la laptop o a la estación de trabajo.',
    porque:
      'Tener código y aplicación lado a lado aumenta la productividad, y permite revisar cómo se ve la interfaz en pantallas grandes y distintas resoluciones.',
  },
  {
    concepto: 'Sistema de alimentación ininterrumpida (UPS)',
    unidad: 'Unidad',
    cantidad: 2,
    unitario: 650,
    obs: 'Protección eléctrica de equipos',
    que: 'Batería de respaldo que mantiene encendidos los equipos durante cortes o variaciones de luz.',
    porque:
      'Evita que un apagón dañe el hardware o haga perder trabajo no guardado, y da minutos suficientes para apagar los equipos de forma segura.',
  },
  {
    concepto: 'Unidad SSD externa para respaldos',
    unidad: 'Unidad',
    cantidad: 1,
    unitario: 850,
    obs: 'Respaldo local complementario',
    que: 'Disco de estado sólido portátil, rápido y resistente a golpes.',
    porque:
      'Guarda una copia local de código, bases de datos y documentos. Complementa los respaldos en la nube: si falla internet o el proveedor, la información sigue disponible.',
  },
]

export const CATEGORIES = [
  {
    id: 'mano-obra',
    nombre: 'Mano de obra',
    icon: 'people',
    color: '#7c3aed',
    tipo: 'Inversión única',
    resumen:
      'Recursos destinados a habilitar el trabajo del equipo de desarrollo: los equipos con los que cada persona produce software día a día.',
    items: equipos,
  },
  {
    id: 'equipo',
    nombre: 'Equipo',
    icon: 'server',
    color: '#d6249f',
    tipo: 'Inversión única',
    resumen:
      'Hardware físico que el área compra una sola vez y queda como activo de la empresa. Se usa durante todo el proyecto y después de él.',
    items: equipos,
  },
  {
    id: 'servicios',
    nombre: 'Servicios',
    icon: 'wifi',
    color: '#0e7490',
    tipo: 'Gasto mensual',
    resumen:
      'Suscripciones que se pagan cada mes para que el equipo pueda comunicarse, colaborar y usar herramientas profesionales. Si se dejan de pagar, se pierde el acceso.',
    items: [
      {
        concepto: 'Conectividad a Internet empresarial',
        unidad: 'Mes',
        cantidad: 4,
        unitario: 450,
        obs: 'Conexión estable para desarrollo y reuniones',
        que: 'Plan de internet de uso empresarial, con mayor estabilidad y soporte que un plan doméstico.',
        porque:
          'Todo el trabajo depende de la red: subir código al repositorio, desplegar en la nube, descargar dependencias y sostener reuniones diarias de Scrum sin cortes.',
      },
      {
        concepto: 'Plataforma de repositorios y colaboración',
        unidad: 'Mes',
        cantidad: 4,
        unitario: 600,
        obs: 'Control de versiones y colaboración del equipo',
        que: 'Servicio en línea (tipo GitHub o GitLab) donde se aloja el código con todo su historial de cambios.',
        porque:
          'Permite que varios desarrolladores trabajen sobre el mismo proyecto sin pisarse, revisar el código antes de integrarlo (pull requests) y automatizar pruebas y despliegues.',
      },
      {
        concepto: 'Licencias de herramientas de desarrollo',
        unidad: 'Mes',
        cantidad: 4,
        unitario: 900,
        obs: 'IDE y herramientas profesionales',
        que: 'Suscripciones a entornos de desarrollo (IDE) y utilidades profesionales de depuración, diseño y pruebas.',
        porque:
          'Las versiones profesionales traen autocompletado avanzado, análisis de errores y soporte técnico, lo que acelera el desarrollo y reduce defectos.',
      },
      {
        concepto: 'Correo y dominio institucional del proyecto',
        unidad: 'Mes',
        cantidad: 4,
        unitario: 350,
        obs: 'Comunicación y presencia del proyecto',
        que: 'Dominio propio (por ejemplo, @silkroad…) con cuentas de correo, calendario y almacenamiento compartido.',
        porque:
          'Da una imagen profesional ante clientes y proveedores, y centraliza la comunicación oficial del equipo en cuentas que pertenecen a la organización.',
      },
    ],
  },
  {
    id: 'infraestructura',
    nombre: 'Infraestructura',
    icon: 'cloud',
    color: '#14b8a6',
    tipo: 'Gasto mensual',
    resumen:
      'Recursos en la nube donde vive y corre el sistema. En lugar de comprar servidores, se alquila capacidad mes a mes y se paga solo por lo que se usa.',
    items: [
      {
        concepto: 'Ejecución de aplicaciones en la nube',
        unidad: 'Mes',
        cantidad: 4,
        unitario: 1800,
        obs: 'Entorno de pruebas y despliegue de servicios',
        que: 'Servidores virtuales o contenedores administrados donde se ejecuta la aplicación (cómputo en la nube).',
        porque:
          'Es donde corren los entornos de pruebas y de producción. Es el rubro más alto de infraestructura porque sostiene directamente el funcionamiento del sistema.',
      },
      {
        concepto: 'Base de datos administrada',
        unidad: 'Mes',
        cantidad: 4,
        unitario: 1200,
        obs: 'Almacenamiento y administración de datos',
        que: 'Motor de base de datos que el proveedor instala, actualiza y respalda por nosotros.',
        porque:
          'Guarda toda la información del sistema. Al ser administrada, el equipo no pierde tiempo en parches, réplicas ni mantenimiento del servidor de base de datos.',
      },
      {
        concepto: 'Almacenamiento y copias de seguridad',
        unidad: 'Mes',
        cantidad: 4,
        unitario: 300,
        obs: 'Respaldos y recuperación',
        que: 'Espacio en la nube para archivos y copias automáticas de la base de datos y los servidores.',
        porque:
          'Si ocurre un error, un borrado accidental o un ataque, permite restaurar el sistema a un punto anterior y continuar operando.',
      },
      {
        concepto: 'Monitoreo, registros y seguridad',
        unidad: 'Mes',
        cantidad: 4,
        unitario: 450,
        obs: 'Observabilidad y alertas',
        que: 'Herramientas que miden el rendimiento, guardan los registros (logs) y avisan cuando algo falla.',
        porque:
          'Permite detectar caídas, lentitud o accesos sospechosos antes de que los usuarios lo noten, y encontrar rápidamente la causa de un error.',
      },
      {
        concepto: 'Red privada y conectividad segura',
        unidad: 'Mes',
        cantidad: 4,
        unitario: 250,
        obs: 'Acceso y comunicación protegida',
        que: 'Red virtual privada (VPN/VPC) que aísla los servidores del resto de internet.',
        porque:
          'Hace que la base de datos y los servicios internos solo sean accesibles por el equipo y la propia aplicación, reduciendo la superficie de ataque.',
      },
    ],
  },
  {
    id: 'materiales',
    nombre: 'Materiales',
    icon: 'layers',
    color: '#f59e0b',
    tipo: 'Compra por lote',
    resumen:
      'Insumos de bajo costo que se compran en lote y se consumen con el uso. Mantienen el espacio de trabajo ordenado y los equipos en buen estado.',
    items: [
      {
        concepto: 'Cables, adaptadores y periféricos menores',
        unidad: 'Lote',
        cantidad: 1,
        unitario: 900,
        obs: 'Accesorios de conexión y reemplazo',
        que: 'Cables HDMI/USB-C, adaptadores, mouse, teclados y otros accesorios.',
        porque:
          'Conectan laptops con monitores y periféricos, y sirven de repuesto inmediato cuando algo se daña, evitando que un cable detenga el trabajo.',
      },
      {
        concepto: 'Material de oficina y etiquetado',
        unidad: 'Lote',
        cantidad: 1,
        unitario: 500,
        obs: 'Organización y documentación',
        que: 'Papelería, pizarras, notas adhesivas y etiquetas para equipos y cables.',
        porque:
          'Apoya las ceremonias Scrum (tableros físicos, planificación) y permite identificar cada equipo para el control de inventario.',
      },
      {
        concepto: 'Material de limpieza para equipos',
        unidad: 'Lote',
        cantidad: 1,
        unitario: 350,
        obs: 'Mantenimiento preventivo básico',
        que: 'Aire comprimido, paños de microfibra, alcohol isopropílico y limpiadores de pantalla.',
        porque:
          'El polvo y la suciedad acortan la vida útil del hardware; una limpieza periódica protege la inversión en equipos.',
      },
      {
        concepto: 'Accesorios de red y organización de cableado',
        unidad: 'Lote',
        cantidad: 1,
        unitario: 700,
        obs: 'Ordenamiento del espacio de trabajo',
        que: 'Cables de red, switch pequeño, canaletas, bridas y organizadores.',
        porque:
          'Un cableado ordenado evita desconexiones accidentales, facilita el mantenimiento y mantiene un espacio de trabajo seguro.',
      },
    ],
  },
].map((c) => {
  const items = c.items.map((it) => ({ ...it, total: it.cantidad * it.unitario }))
  return { ...c, items, total: items.reduce((s, it) => s + it.total, 0) }
})

export const TOTAL = CATEGORIES.reduce((s, c) => s + c.total, 0)

// Ítems con unidad "Mes" son recurrentes; el resto es un pago único al inicio.
export const isMonthly = (item) => item.unidad === 'Mes'

export const ONE_TIME = CATEGORIES.reduce(
  (s, c) => s + c.items.filter((it) => !isMonthly(it)).reduce((a, it) => a + it.total, 0),
  0
)

export const MONTHLY = CATEGORIES.reduce(
  (s, c) => s + c.items.filter(isMonthly).reduce((a, it) => a + it.unitario, 0),
  0
)

// Gasto de cada mes por categoría: pagos únicos en el mes 1, mensuales repartidos.
export function monthlyBreakdown(months = META.meses) {
  return Array.from({ length: months }, (_, m) =>
    CATEGORIES.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      color: c.color,
      value: c.items.reduce((s, it) => s + (isMonthly(it) ? it.unitario : m === 0 ? it.total : 0), 0),
    }))
  )
}

export const bs = (n) => `Bs ${Math.round(n).toLocaleString('es-BO')}`
