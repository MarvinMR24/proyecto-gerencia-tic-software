import { CATEGORIES, STATUSES } from '../data/inventario'

export const VALID_LICENSES = ['Licencia Comercial', 'Open Source', 'Suscripción']

/**
 * Sanitiza cadenas de texto para prevenir inyecciones y caracteres no imprimibles.
 */
export function sanitizeString(val) {
  if (val == null) return ''
  return String(val)
    .replace(/[<>]/g, '') // Remueve tags básicos para evitar inyección en renderizado
    .trim()
}

/**
 * Valida un formato de fecha YYYY-MM-DD.
 */
export function isValidDateStr(str) {
  if (!str || typeof str !== 'string') return false
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str.trim())
  if (!match) return false
  const [, y, m, d] = match
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  return (
    date.getFullYear() === Number(y) &&
    date.getMonth() === Number(m) - 1 &&
    date.getDate() === Number(d)
  )
}

/**
 * Validador estricto de Host / Herramienta de Monitoreo antes de carga a BD.
 * 
 * Reglas de integridad:
 * 1. Esquema y presencia de campos obligatorios.
 * 2. Tipos de datos estrictos (costo numérico positivo, strings no vacíos).
 * 3. Catálogos restringidos (categorías, estados, licencias).
 * 4. Coherencia cronológica (adquisición <= hoy; expiración >= adquisición).
 * 5. Unicidad de nombre contra hosts existentes.
 */
export function validateHost(raw, existingHosts = []) {
  const errors = {}

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      isValid: false,
      errors: { payload: 'El payload recibido no es un objeto JSON válido.' },
      sanitized: null,
    }
  }

  // 1. Nombre
  const nombre = sanitizeString(raw.nombre)
  if (!nombre) {
    errors.nombre = 'El nombre de la herramienta/host es obligatorio.'
  } else if (nombre.length < 2 || nombre.length > 60) {
    errors.nombre = 'El nombre debe tener entre 2 y 60 caracteres.'
  } else if (!/^[a-zA-Z0-9\s._\-+/#]+$/.test(nombre)) {
    errors.nombre = 'El nombre contiene caracteres especiales no permitidos.'
  } else {
    // Comprobar colisión de nombres (si no es el mismo ID)
    const duplicate = existingHosts.some(
      (h) => h.nombre.toLowerCase() === nombre.toLowerCase() && h.id !== raw.id
    )
    if (duplicate) {
      errors.nombre = `Ya existe un host registrado con el nombre "${nombre}".`
    }
  }

  // 2. Categoría
  const categoria = sanitizeString(raw.categoria)
  if (!categoria) {
    errors.categoria = 'La categoría de desarrollo es obligatoria.'
  } else if (!CATEGORIES.includes(categoria)) {
    errors.categoria = `Categoría no válida. Debe ser una de: ${CATEGORIES.join(', ')}.`
  }

  // 3. Estado
  const estado = sanitizeString(raw.estado)
  if (!estado) {
    errors.estado = 'El estado de funcionamiento es obligatorio.'
  } else if (!STATUSES.includes(estado)) {
    errors.estado = `Estado inválido. Debe ser: ${STATUSES.join(', ')}.`
  }

  // 4. Versión
  const version = sanitizeString(raw.version)
  if (!version) {
    errors.version = 'La versión aprobada es obligatoria.'
  } else if (version.length > 30) {
    errors.version = 'La versión no debe superar 30 caracteres.'
  }

  // 5. Tipo de Licencia
  const licencia = sanitizeString(raw.licencia)
  if (!licencia) {
    errors.licencia = 'El tipo de licencia es obligatorio.'
  } else if (!VALID_LICENSES.includes(licencia)) {
    errors.licencia = `Licencia inválida. Debe ser: ${VALID_LICENSES.join(', ')}.`
  }

  // 6. Costo Total (USD)
  const rawCosto = raw.costo
  let costo = 0
  if (rawCosto === '' || rawCosto === null || rawCosto === undefined) {
    errors.costo = 'El costo es obligatorio (puede ser 0 para Open Source).'
  } else {
    costo = Number(rawCosto)
    if (Number.isNaN(costo)) {
      errors.costo = 'El costo debe ser un valor numérico válido.'
    } else if (costo < 0) {
      errors.costo = 'El costo no puede ser un valor negativo.'
    } else if (costo > 500000) {
      errors.costo = 'El costo excede el límite máximo permitido ($500,000 USD).'
    } else if (licencia === 'Open Source' && costo > 0) {
      errors.costo = 'Las herramientas Open Source deben tener costo 0 USD según las políticas de gobernanza.'
    }
  }

  // 7. Fecha de Adquisición
  const adquisicion = sanitizeString(raw.adquisicion)
  if (!adquisicion) {
    errors.adquisicion = 'La fecha de adquisición es obligatoria.'
  } else if (!isValidDateStr(adquisicion)) {
    errors.adquisicion = 'Formato de fecha de adquisición inválido. Use AAAA-MM-DD.'
  } else {
    const dAdq = new Date(`${adquisicion}T00:00:00`)
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    if (dAdq > today) {
      errors.adquisicion = 'La fecha de adquisición no puede ser una fecha futura.'
    }
  }

  // 8. Fecha de Expiración
  const expiracion = raw.expiracion ? sanitizeString(raw.expiracion) : null
  if (expiracion) {
    if (!isValidDateStr(expiracion)) {
      errors.expiracion = 'Formato de fecha de expiración inválido. Use AAAA-MM-DD.'
    } else if (isValidDateStr(adquisicion)) {
      const dAdq = new Date(`${adquisicion}T00:00:00`)
      const dExp = new Date(`${expiracion}T00:00:00`)
      if (dExp <= dAdq) {
        errors.expiracion = 'La fecha de expiración debe ser posterior a la fecha de adquisición.'
      }
    }
  } else if (licencia === 'Suscripción') {
    errors.expiracion = 'Para licencias por Suscripción es mandatorio ingresar la fecha de expiración.'
  }

  // 9. Fecha de Última Actualización
  const ultimaActualizacion = raw.ultimaActualizacion
    ? sanitizeString(raw.ultimaActualizacion)
    : adquisicion
  if (!isValidDateStr(ultimaActualizacion)) {
    errors.ultimaActualizacion = 'Formato de fecha de última actualización inválido. Use AAAA-MM-DD.'
  }

  const isValid = Object.keys(errors).length === 0

  return {
    isValid,
    errors,
    sanitized: isValid
      ? {
          id: raw.id ? Number(raw.id) : Date.now(),
          nombre,
          categoria,
          estado,
          version,
          licencia,
          costo,
          adquisicion,
          expiracion: expiracion || null,
          ultimaActualizacion,
        }
      : null,
  }
}

/**
 * Validador de telemetría / métrica puntual de un agente entrante.
 */
export function validateMetricSample(raw, existingHosts = []) {
  const errors = {}

  if (!raw || typeof raw !== 'object') {
    return {
      isValid: false,
      errors: { payload: 'La lectura de métrica no es un objeto válido.' },
      sanitized: null,
    }
  }

  const hostId = Number(raw.hostId)
  if (!hostId || Number.isNaN(hostId)) {
    errors.hostId = 'Se requiere un hostId numérico válido.'
  } else if (existingHosts.length > 0 && !existingHosts.some((h) => h.id === hostId)) {
    errors.hostId = `El host con ID ${hostId} no está registrado en la base de datos.`
  }

  const latency = Number(raw.latency ?? raw.v)
  if (latency == null || Number.isNaN(latency)) {
    errors.latency = 'El valor de latencia debe ser un número entero.'
  } else if (latency < 1 || latency > 15000) {
    errors.latency = `Latencia fuera de rango operativo admisible (1 ms a 15,000 ms). Recibido: ${latency} ms.`
  }

  let t = raw.t ?? raw.timestamp ?? Date.now()
  t = Number(t)
  if (Number.isNaN(t)) {
    errors.timestamp = 'Marca de tiempo (timestamp) inválida.'
  } else {
    const now = Date.now()
    const diff = t - now
    if (diff > 120000) {
      errors.timestamp = 'La marca de tiempo se encuentra en el futuro (> 2 minutos de desfase).'
    } else if (now - t > 86400000 * 7) {
      errors.timestamp = 'La métrica es demasiado antigua (> 7 días) para ingesta en tiempo real.'
    }
  }

  const isValid = Object.keys(errors).length === 0

  return {
    isValid,
    errors,
    sanitized: isValid
      ? {
          hostId,
          v: Math.round(latency),
          t,
        }
      : null,
  }
}
