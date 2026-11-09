import { TOOLS } from '../data/inventario'
import { validateHost, validateMetricSample } from './monitorValidator'

const DB_NAME = 'IATECH_Monitor_DB'
const DB_VERSION = 1

let dbInstance = null
let memoryFallback = null

function hasIndexedDB() {
  return typeof window !== 'undefined' && 'indexedDB' in window
}

function initMemoryFallback() {
  if (!memoryFallback) {
    memoryFallback = {
      hosts: [...TOOLS],
      metrics: [],
      quarantine: [],
    }
  }
  return memoryFallback
}

/**
 * Abre o inicializa la base de datos IndexedDB local.
 */
export function openDatabase() {
  if (!hasIndexedDB()) {
    initMemoryFallback()
    return Promise.resolve(null)
  }

  if (dbInstance) {
    return Promise.resolve(dbInstance)
  }

  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // Store para Hosts de monitoreo
      if (!db.objectStoreNames.contains('hosts')) {
        const hostStore = db.createObjectStore('hosts', { keyPath: 'id' })
        hostStore.createIndex('categoria', 'categoria', { unique: false })
        hostStore.createIndex('estado', 'estado', { unique: false })
      }

      // Store para telemetría / métricas
      if (!db.objectStoreNames.contains('metrics')) {
        const metricStore = db.createObjectStore('metrics', { keyPath: 'id', autoIncrement: true })
        metricStore.createIndex('hostId', 'hostId', { unique: false })
        metricStore.createIndex('t', 't', { unique: false })
      }

      // Store para bitácora de cuarentena (datos rechazados en validación)
      if (!db.objectStoreNames.contains('quarantine')) {
        const qStore = db.createObjectStore('quarantine', { keyPath: 'id', autoIncrement: true })
        qStore.createIndex('timestamp', 'timestamp', { unique: false })
        qStore.createIndex('type', 'type', { unique: false })
      }
    }

    request.onsuccess = (event) => {
      dbInstance = event.target.result
      resolve(dbInstance)
    }

    request.onerror = (event) => {
      console.warn('No fue posible abrir IndexedDB, usando almacenamiento en memoria.', event.target.error)
      initMemoryFallback()
      resolve(null)
    }
  })
}

/**
 * Inicializa la base de datos y la llena con las herramientas iniciales si está vacía.
 */
export async function initDb() {
  const db = await openDatabase()
  if (!db) {
    return initMemoryFallback().hosts
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(['hosts'], 'readwrite')
    const store = tx.objectStore('hosts')
    const countReq = store.count()

    countReq.onsuccess = () => {
      if (countReq.result === 0) {
        // Sembrar con el inventario base
        for (const tool of TOOLS) {
          store.put(tool)
        }
      }
    }

    tx.oncomplete = () => {
      getAllHosts().then(resolve).catch(reject)
    }

    tx.onerror = () => {
      resolve([...TOOLS])
    }
  })
}

/**
 * Obtiene todos los hosts almacenados en la base de datos.
 */
export async function getAllHosts() {
  const db = await openDatabase()
  if (!db) {
    return [...initMemoryFallback().hosts]
  }

  return new Promise((resolve) => {
    const tx = db.transaction(['hosts'], 'readonly')
    const store = tx.objectStore('hosts')
    const req = store.getAll()

    req.onsuccess = () => {
      resolve(req.result || [])
    }
    req.onerror = () => {
      resolve([...TOOLS])
    }
  })
}

/**
 * Guarda en la bitácora de cuarentena un payload rechazado por la capa de validación.
 */
async function recordQuarantine(entry) {
  const record = {
    ...entry,
    timestamp: Date.now(),
  }

  const db = await openDatabase()
  if (!db) {
    const mem = initMemoryFallback()
    mem.quarantine.unshift({ ...record, id: Date.now() + Math.random() })
    return record
  }

  return new Promise((resolve) => {
    const tx = db.transaction(['quarantine'], 'readwrite')
    const store = tx.objectStore('quarantine')
    const req = store.add(record)
    req.onsuccess = () => resolve(record)
    req.onerror = () => resolve(record)
  })
}

/**
 * Valida un host entrante y lo guarda en la base de datos SOLO si pasa la validación.
 * Si falla, rechaza la carga y lo manda a cuarentena.
 */
export async function saveHostValidated(rawHost) {
  const currentHosts = await getAllHosts()
  const validation = validateHost(rawHost, currentHosts)

  if (!validation.isValid) {
    await recordQuarantine({
      type: 'HOST_REGISTRATION',
      reason: 'Violación de reglas de validación en esquema o integridad',
      errors: validation.errors,
      rawPayload: rawHost,
    })

    return {
      success: false,
      validation,
      message: 'La carga a la base de datos fue BLOQUEADA debido a errores de validación.',
    }
  }

  const sanitizedHost = validation.sanitized
  const db = await openDatabase()

  if (!db) {
    const mem = initMemoryFallback()
    const idx = mem.hosts.findIndex((h) => h.id === sanitizedHost.id)
    if (idx >= 0) mem.hosts[idx] = sanitizedHost
    else mem.hosts.unshift(sanitizedHost)
    return {
      success: true,
      validation,
      host: sanitizedHost,
      message: 'Host validado e insertado exitosamente en la base de datos local.',
    }
  }

  return new Promise((resolve) => {
    const tx = db.transaction(['hosts'], 'readwrite')
    const store = tx.objectStore('hosts')
    const req = store.put(sanitizedHost)

    req.onsuccess = () => {
      resolve({
        success: true,
        validation,
        host: sanitizedHost,
        message: 'Host validado e insertado exitosamente en IndexedDB.',
      })
    }

    req.onerror = (ev) => {
      resolve({
        success: false,
        validation: { isValid: false, errors: { db: ev.target.error.message } },
        message: 'Error en transacción de base de datos.',
      })
    }
  })
}

/**
 * Valida una lectura puntual de telemetría y la persiste solo si es válida.
 */
export async function saveMetricValidated(rawMetric) {
  const currentHosts = await getAllHosts()
  const validation = validateMetricSample(rawMetric, currentHosts)

  if (!validation.isValid) {
    await recordQuarantine({
      type: 'METRIC_TELEMETRY',
      reason: 'Lectura de telemetría fuera de rango, fecha inválida o host desconocido',
      errors: validation.errors,
      rawPayload: rawMetric,
    })

    return {
      success: false,
      validation,
      message: 'Muestra de métrica RECHAZADA. No fue cargada a la serie de datos.',
    }
  }

  const metric = validation.sanitized
  const db = await openDatabase()

  if (!db) {
    const mem = initMemoryFallback()
    mem.metrics.push(metric)
    return {
      success: true,
      validation,
      metric,
      message: 'Métrica validada y agregada.',
    }
  }

  return new Promise((resolve) => {
    const tx = db.transaction(['metrics'], 'readwrite')
    const store = tx.objectStore('metrics')
    store.add(metric)
    tx.oncomplete = () => {
      resolve({
        success: true,
        validation,
        metric,
        message: 'Métrica validada y persistida en IndexedDB.',
      })
    }
    tx.onerror = () => {
      resolve({
        success: false,
        validation: { isValid: false, errors: { db: 'Fallo al escribir métrica en base de datos' } },
        message: 'Fallo al escribir métrica en BD',
      })
    }
  })
}

/**
 * Obtiene el historial de registros bloqueados en cuarentena.
 */
export async function getQuarantineLogs() {
  const db = await openDatabase()
  if (!db) {
    return [...initMemoryFallback().quarantine]
  }

  return new Promise((resolve) => {
    const tx = db.transaction(['quarantine'], 'readonly')
    const store = tx.objectStore('quarantine')
    const req = store.getAll()

    req.onsuccess = () => {
      const list = req.result || []
      list.sort((a, b) => b.timestamp - a.timestamp)
      resolve(list)
    }
    req.onerror = () => resolve([])
  })
}

/**
 * Limpia la bitácora de cuarentena.
 */
export async function clearQuarantineLogs() {
  const db = await openDatabase()
  if (!db) {
    initMemoryFallback().quarantine = []
    return true
  }

  return new Promise((resolve) => {
    const tx = db.transaction(['quarantine'], 'readwrite')
    const store = tx.objectStore('quarantine')
    const req = store.clear()
    req.onsuccess = () => resolve(true)
    req.onerror = () => resolve(false)
  })
}

/**
 * Restablece la base de datos a los valores de fábrica de TOOLS.
 */
export async function resetToDefaults() {
  const db = await openDatabase()
  if (!db) {
    initMemoryFallback().hosts = [...TOOLS]
    initMemoryFallback().metrics = []
    initMemoryFallback().quarantine = []
    return [...TOOLS]
  }

  return new Promise((resolve) => {
    const tx = db.transaction(['hosts', 'metrics', 'quarantine'], 'readwrite')
    const hostStore = tx.objectStore('hosts')
    hostStore.clear()
    for (const tool of TOOLS) {
      hostStore.put(tool)
    }
    tx.objectStore('metrics').clear()
    tx.objectStore('quarantine').clear()

    tx.oncomplete = () => {
      resolve([...TOOLS])
    }
  })
}
