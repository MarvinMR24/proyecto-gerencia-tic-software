import csvText from './inventario_herramientas_desarrollo.csv?raw'
import csvUrl from './inventario_herramientas_desarrollo.csv?url'

export { csvUrl }

// Colores tomados de los gráficos de Tableau (paleta Tableau 10).
export const CATEGORY_COLORS = {
  'Asistente IA': '#4e79a7',
  'Cliente API': '#f28e2b',
  'Cliente SQL': '#e15759',
  'Entorno / CLI': '#76b7b2',
  Framework: '#59a14f',
  IDE: '#edc948',
  'Librería UI': '#b07aa1',
}

export const LICENSE_COLORS = {
  'Licencia Comercial': '#4e79a7',
  'Open Source': '#f28e2b',
  Suscripción: '#e15759',
}

export const STATUSES = ['Activa', 'En Evaluación', 'Deprecada']

function parseCsv(text) {
  const [header, ...rows] = text.trim().split(/\r?\n/)
  const keys = header.split(',')
  return rows.map((row) => {
    const values = row.split(',')
    return Object.fromEntries(keys.map((k, i) => [k, values[i] ?? '']))
  })
}

export const TOOLS = parseCsv(csvText).map((r) => ({
  id: Number(r.id_herramienta_dev),
  nombre: r.nombre_herramienta,
  categoria: r.categoria_dev,
  estado: r.estado_funcionamiento,
  version: r.version_aprobada,
  ultimaActualizacion: r.fecha_ultima_actualizacion,
  licencia: r.tipo_licencia,
  costo: Number(r.costo_total_usd) || 0,
  adquisicion: r.fecha_adquisicion,
  expiracion: r.fecha_expiracion || null,
}))

// Categorías en orden alfabético, igual que el eje de los gráficos de Tableau.
export const CATEGORIES = Object.keys(CATEGORY_COLORS)

export function countBy(list, key) {
  const out = {}
  for (const item of list) out[item[key]] = (out[item[key]] || 0) + 1
  return out
}

export const costByCategory = CATEGORIES.map((categoria) => ({
  categoria,
  costo: TOOLS.filter((t) => t.categoria === categoria).reduce((sum, t) => sum + t.costo, 0),
}))

export const statusByCategory = CATEGORIES.map((categoria) => {
  const tools = TOOLS.filter((t) => t.categoria === categoria)
  return { categoria, total: tools.length, estados: countBy(tools, 'estado') }
})

export const licenseByCategory = CATEGORIES.map((categoria) => {
  const tools = TOOLS.filter((t) => t.categoria === categoria)
  return { categoria, total: tools.length, licencias: countBy(tools, 'licencia') }
})

export const totalCost = TOOLS.reduce((sum, t) => sum + t.costo, 0)
