// Texto que va debajo de un gráfico o diagrama explicando qué es lo que se ve.
export default function ChartNote({ title = '¿Qué se ve en el gráfico?', children }) {
  return (
    <div className="chart-note-box">
      <h3 className="tight">{title}</h3>
      {children}
    </div>
  )
}
