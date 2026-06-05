import { Users, FileText, CheckCircle, TrendingUp } from 'lucide-react'

export default function Dashboard({ setPagina }) {
  const cards = [
    { icon: <FileText size={32}/>, titulo: 'Total CVs',        valor: '2,484', color: 'bg-blue-500' },
    { icon: <Users size={32}/>,    titulo: 'Categorías',       valor: '25',    color: 'bg-purple-500' },
    { icon: <CheckCircle size={32}/>, titulo: 'Precisión ML',  valor: '98%',   color: 'bg-green-500' },
    { icon: <TrendingUp size={32}/>,  titulo: 'Procesados hoy',valor: '12',    color: 'bg-orange-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Panel Principal</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
            <div className={`${c.color} text-white p-3 rounded-lg`}>{c.icon}</div>
            <div>
              <p className="text-gray-500 text-sm">{c.titulo}</p>
              <p className="text-2xl font-bold text-gray-800">{c.valor}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Descripción del sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">¿Qué hace este sistema?</h2>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              Analiza el texto de un CV y predice automáticamente el área profesional
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              Utiliza un modelo Random Forest entrenado con más de 2,400 currículos reales
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              Muestra el nivel de confianza de la predicción en porcentaje
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              Reduce el tiempo de selección de personal en la municipalidad
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">¿Cómo usarlo?</h2>
          <ol className="space-y-3 text-gray-600 text-sm">
            <li className="flex items-start gap-3">
              <span className="bg-blue-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">1</span>
              Ve a la sección <strong>Analizar CV</strong>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">2</span>
              Pega el texto del currículo en el campo de texto
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">3</span>
              Presiona <strong>Analizar</strong> y el modelo predice la categoría
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">4</span>
              Revisa la categoría sugerida y el nivel de confianza
            </li>
          </ol>
          <button
            onClick={() => setPagina('predecir')}
            className="mt-4 w-full bg-blue-800 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Ir a Analizar CV →
          </button>
        </div>
      </div>
    </div>
  )
}