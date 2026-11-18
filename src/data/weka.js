// Análisis de minería de datos sobre el inventario de herramientas de desarrollo (100 registros).
// Datos de entrada: src/assets/weka/*.arff, generados desde inventario_herramientas_desarrollo.csv
// con fecha de referencia 18/11/2026.

import arffNominalUrl from '../assets/weka/inventario_nominal.arff?url'
import arffNumericoUrl from '../assets/weka/inventario_numerico.arff?url'

export { arffNominalUrl, arffNumericoUrl }

export const tecnicas = [
  {
    icon: 'layers',
    title: 'Asociación',
    algoritmo: 'Apriori',
    text: 'Busca combinaciones de características que aparecen juntas con frecuencia y las expresa como reglas "si ocurre A, entonces ocurre B". Es la técnica clásica del análisis de la canasta de compras.',
    ejemplo: 'Si una herramienta es un Asistente IA, entonces es de suscripción.',
  },
  {
    icon: 'dna',
    title: 'Clasificación',
    algoritmo: 'J48 (árbol de decisión)',
    text: 'Aprende a partir de casos ya conocidos a predecir una clase, por ejemplo el estado de una herramienta. El resultado es un árbol de preguntas sencillas que cualquier persona puede seguir.',
    ejemplo: '¿La herramienta lleva meses sin actualizarse? Entonces probablemente está deprecada.',
  },
  {
    icon: 'target',
    title: 'Agrupamiento',
    algoritmo: 'SimpleKMeans',
    text: 'Forma grupos (clusters) de elementos parecidos entre sí sin que nadie le diga de antemano cuáles son los grupos. Sirve para descubrir segmentos que no eran evidentes.',
    ejemplo: 'Separar las herramientas de pago de las gratuitas y, dentro de estas, las heredadas.',
  },
]

export const usosOrganizacion = [
  { icon: 'chart', title: 'Decisiones basadas en datos', text: 'Convierte registros acumulados (ventas, inventarios, tickets, licencias) en reglas y tendencias que respaldan las decisiones de la gerencia.' },
  { icon: 'shield', title: 'Prevención de riesgos', text: 'Permite anticipar problemas, como clientes que abandonan, fraudes o, en nuestro caso, herramientas que están por quedar obsoletas.' },
  { icon: 'card', title: 'Optimización de costos', text: 'Identifica grupos de gasto y patrones de consumo para negociar, consolidar o eliminar lo que no aporta valor.' },
  { icon: 'people', title: 'Sin necesidad de programar', text: 'Su interfaz gráfica (Explorer) permite que analistas sin experiencia en programación apliquen algoritmos y comparen resultados.' },
]

export const atributos = [
  { nombre: 'categoria', tipo: 'Nominal', detalle: 'Asistente IA, Cliente API, Cliente SQL, Entorno / CLI, Framework, IDE, Librería UI' },
  { nombre: 'licencia', tipo: 'Nominal', detalle: 'Open Source, Suscripción, Licencia Comercial' },
  { nombre: 'rango_costo', tipo: 'Nominal (derivado)', detalle: 'Gratis ($0), Bajo (hasta $500), Medio (hasta $1.500), Alto (más de $1.500)' },
  { nombre: 'antiguedad', tipo: 'Nominal (derivado)', detalle: 'Nueva (menos de 1 año), Intermedia (1 a 4 años), Antigua (4 años o más) desde la adquisición' },
  { nombre: 'actualizacion', tipo: 'Nominal (derivado)', detalle: 'Reciente (actualizada en los últimos 150 días) o Desactualizada' },
  { nombre: 'estado', tipo: 'Clase', detalle: 'Activa, En Evaluación, Deprecada' },
]

export const pasos = [
  { title: 'Preparar', text: 'Exportamos el inventario (100 herramientas) a formato ARFF, el formato nativo de WEKA, y derivamos atributos como antigüedad, rango de costo y nivel de actualización.' },
  { title: 'Asociar', text: 'Ejecutamos Apriori con soporte mínimo de 5 herramientas y confianza mínima de 90% para encontrar reglas entre los atributos.' },
  { title: 'Clasificar', text: 'Entrenamos un árbol J48 para predecir el estado de cada herramienta y lo validamos con validación cruzada de 10 particiones.' },
  { title: 'Agrupar', text: 'Aplicamos SimpleKMeans con k = 3 sobre costo, antigüedad, días sin actualizar, categoría y licencia, con los valores normalizados.' },
]

export const reglas = [
  { si: 'Actualización = Desactualizada', entonces: 'Estado = Deprecada', soporte: '8 / 8', confianza: 100, lift: 12.5 },
  { si: 'Antigüedad = Nueva y Costo = Bajo', entonces: 'Estado = En Evaluación', soporte: '6 / 6', confianza: 100, lift: 8.33 },
  { si: 'Antigüedad = Nueva', entonces: 'Estado = En Evaluación', soporte: '12 / 13', confianza: 92, lift: 7.69 },
  { si: 'Categoría = Asistente IA', entonces: 'Licencia = Suscripción', soporte: '7 / 7', confianza: 100, lift: 3.7 },
  { si: 'Estado = Deprecada', entonces: 'Antigüedad = Antigua', soporte: '8 / 8', confianza: 100, lift: 1.64 },
  { si: 'Categoría = Framework', entonces: 'Licencia = Open Source', soporte: '22 / 22', confianza: 100, lift: 1.59 },
  { si: 'Antigüedad = Intermedia', entonces: 'Estado = Activa', soporte: '26 / 26', confianza: 100, lift: 1.25 },
  { si: 'Costo = Alto', entonces: 'Estado = Activa', soporte: '9 / 9', confianza: 100, lift: 1.25 },
]

// Árbol J48 (estado). (n / e) = herramientas que llegan a la hoja / mal clasificadas.
export const arbol = {
  pregunta: '¿Actualizada en los últimos 150 días?',
  ramas: [
    {
      respuesta: 'No',
      hoja: { clase: 'Deprecada', n: 8, e: 0 },
    },
    {
      respuesta: 'Sí',
      pregunta: '¿Antigüedad?',
      ramas: [
        { respuesta: 'Antigua', hoja: { clase: 'Activa', n: 53, e: 0 } },
        { respuesta: 'Intermedia', hoja: { clase: 'Activa', n: 26, e: 0 } },
        { respuesta: 'Nueva', hoja: { clase: 'En Evaluación', n: 13, e: 1 } },
      ],
    },
  ],
}

export const evaluacion = {
  aciertoCV: 98,
  clases: ['Activa', 'En Evaluación', 'Deprecada'],
  // filas = clase real, columnas = clase predicha
  matriz: [
    [79, 1, 0],
    [1, 11, 0],
    [0, 0, 8],
  ],
}

export const clusters = [
  {
    nombre: 'Herramientas de pago',
    color: '#e15759',
    n: 32,
    costo: 1175,
    antiguedad: 3.3,
    dias: 73,
    rasgos: ['27 por suscripción y 5 con licencia comercial', 'Todos los Asistentes IA están aquí', 'Concentra casi todo el gasto del inventario', '26 activas y 6 en evaluación'],
  },
  {
    nombre: 'Open source heredadas',
    color: '#f28e2b',
    n: 35,
    costo: 36,
    antiguedad: 5.3,
    dias: 156,
    rasgos: ['Gratuitas y con más de 5 años en uso', 'Sobre todo Entorno / CLI y Cliente SQL', 'Son las que más tiempo llevan sin actualizarse', 'Contienen 7 de las 8 herramientas deprecadas'],
  },
  {
    nombre: 'Frameworks y librerías open source',
    color: '#59a14f',
    n: 33,
    costo: 14,
    antiguedad: 4.0,
    dias: 89,
    rasgos: ['Los 22 Frameworks y 7 Librerías UI', 'Prácticamente sin costo', 'Se actualizan con frecuencia', '27 activas, 5 en evaluación y 1 deprecada'],
  },
]

export const hallazgos = [
  'La falta de actualización es la mejor señal de obsolescencia: las 8 herramientas deprecadas, y solo ellas, llevan más de 150 días sin actualizarse (entre 344 y 644 días). Ninguna otra herramienta supera los 141 días.',
  'Toda herramienta en evaluación fue adquirida durante el último año. La única excepción es Gemini Code Assist, comprada en febrero de 2026 y ya activa.',
  'El árbol J48 predice el estado con 98% de acierto en validación cruzada usando solo dos preguntas: cuándo se actualizó por última vez y qué antigüedad tiene. Solo confundió 2 de 100 herramientas.',
  'El costo no determina el estado: las 9 herramientas más caras (más de $1.500) están todas activas, por lo que el gasto alto está justificado por el uso.',
  'Los clusters muestran que el riesgo está en las herramientas open source más antiguas y no en las de pago: ahí se concentran 7 de las 8 deprecadas.',
]

export const recomendacionesWeka = [
  'Crear una alerta automática en Zabbix cuando una herramienta pase 150 días sin actualizarse, ya que es el indicador más fiable de que va a quedar deprecada.',
  'Fijar un plazo máximo de un año para que una herramienta en evaluación se apruebe o se descarte.',
  'Revisar cada año el grupo de herramientas open source heredadas, priorizando Entorno / CLI y Cliente SQL.',
  'Volver a ejecutar este análisis cada trimestre con el inventario actualizado para confirmar que los patrones se mantienen.',
]

export const videos = [
  { id: 'N6itjmU3qeA', title: 'Introducción a WEKA', autor: 'Carlos Martínez', tema: 'Primeros pasos' },
  { id: 'FtBSgG_Z96A', title: 'Reglas de asociación en WEKA', autor: 'José Castillo', tema: 'Asociación · Apriori' },
  { id: 'CQdeP3Wa7GU', title: 'Generando árbol J48 en WEKA', autor: 'Carlos Andrés Acosta', tema: 'Clasificación · J48' },
  { id: '7TzFjcH1Gsk', title: 'Práctica de agrupamiento (clustering) en WEKA', autor: 'Rosangela Torres', tema: 'Agrupamiento · k-means' },
]

export const recursos = [
  {
    icon: 'compass',
    tipo: 'Sitio oficial',
    title: 'WEKA · Universidad de Waikato',
    text: 'Página oficial del proyecto: qué es WEKA, novedades y acceso a la descarga.',
    url: 'https://ml.cms.waikato.ac.nz/weka/',
  },
  {
    icon: 'rocket',
    tipo: 'Descarga',
    title: 'Descargar WEKA',
    text: 'Instaladores para Windows, macOS y Linux. Incluye Java, por lo que no hace falta instalarlo aparte.',
    url: 'https://waikato.github.io/weka-wiki/downloading_weka/',
  },
  {
    icon: 'book',
    tipo: 'Documentación',
    title: 'Documentación y manual',
    text: 'Manual oficial de WEKA y guías de uso de Explorer, Experimenter y KnowledgeFlow.',
    url: 'https://ml.cms.waikato.ac.nz/weka/documentation.html',
  },
  {
    icon: 'layers',
    tipo: 'PDF',
    title: 'The WEKA Workbench',
    text: 'Apéndice gratuito del libro "Data Mining: Practical Machine Learning Tools and Techniques" (Witten et al., 2016).',
    url: 'https://ml.cms.waikato.ac.nz/weka/Witten_et_al_2016_appendix.pdf',
  },
  {
    icon: 'database',
    tipo: 'Wiki',
    title: 'Formato ARFF',
    text: 'Explicación del formato de archivo que usa WEKA, el mismo de los archivos que se descargan en esta página.',
    url: 'https://waikato.github.io/weka-wiki/formats_and_processing/arff/',
  },
  {
    icon: 'chat',
    tipo: 'Curso en video',
    title: 'Data Mining with Weka (MOOC)',
    text: 'Canal oficial con los cursos gratuitos de la Universidad de Waikato, dictados por Ian Witten (en inglés).',
    url: 'https://www.youtube.com/@WekaMOOC',
  },
  {
    icon: 'bulb',
    tipo: 'Artículo',
    title: 'WEKA en Wikipedia',
    text: 'Resumen en español de la historia, características y algoritmos que incluye la herramienta.',
    url: 'https://es.wikipedia.org/wiki/Weka_(aprendizaje_autom%C3%A1tico)',
  },
]
