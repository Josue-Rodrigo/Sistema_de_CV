import { useEffect, useState } from 'react'
import api from '../api'
import { Users, FileText, CheckCircle, TrendingUp, Activity, BarChart3, AlertCircle, RefreshCw } from 'lucide-react'
import { useAuth } from '../AuthContext'

export default function Dashboard({ setPagina }) {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [cargando, setCargando] = useState(true)

  const cargar = () => {
    setCargando(true)
    api.get('/api/dashboard')
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [])

  const cards = data ? [
    { icon: <FileText size={28}/>, titulo: 'Total CVs Dataset', valor: data.total_cvs.toLocaleString(), color: 'bg-blue-600' },
    { icon: <Activity size={28}/>, titulo: 'Categorías',       valor: data.total_categorias.toString(), color: 'bg-purple-600' },
    { icon: <BarChart3 size={28}/>,  titulo: 'CVs Analizados', valor: data.total_analizados.toLocaleString(), color: 'bg-green-600' },
    { icon: <TrendingUp size={28}/>,  titulo: 'Analizados hoy',valor: data.analisis_hoy.toString(), color: 'bg-orange-600' },
    { icon: <Users size={28}/>,    titulo: 'Usuarios',         valor: data.total_usuarios.toString(), color: 'bg-cyan-600' },
  ] : []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel Principal</h1>
          <p className="text-sm text-gray-500 mt-1">
            Bienvenido, <span className="font-medium text-gray-700">{user?.full_name || user?.username}</span>
            {user?.role === 'admin' && <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">Admin</span>}
          </p>
        </div>
        <button onClick={cargar} disabled={cargando}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
          <RefreshCw size={14} className={cargando ? 'animate-spin' : ''}/> Actualizar
        </button>
      </div>

      {cargando && !data ? (
        <div className="flex items-center justify-center h-64 text-gray-500">Cargando datos...</div>
      ) : !data ? (
        <div className="flex items-center justify-center h-64 text-red-500 gap-2">
          <AlertCircle size={24}/> Error al cargar datos del servidor
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            {cards.map((c, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition">
                <div className={`${c.color} text-white p-3 rounded-xl`}>{c.icon}</div>
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{c.titulo}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-0.5">{c.valor}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">¿Qué hace este sistema?</h2>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  Analiza el texto de un CV y predice automáticamente el área profesional usando Machine Learning
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  Utiliza un modelo Random Forest entrenado con más de {data.total_cvs.toLocaleString()} currículos reales
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  Muestra el nivel de confianza de la predicción en porcentaje
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  Historial de análisis con búsqueda, filtros y exportación
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  Sistema multiusuario con roles (admin/analista)
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">¿Cómo usarlo?</h2>
              <ol className="space-y-3 text-gray-600 text-sm">
                <li className="flex items-start gap-3">
                  <span className="bg-blue-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  Ve a la sección <strong>Analizar CV</strong>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-blue-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  Pega el texto del currículo o sube un archivo PDF/DOCX/TXT
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-blue-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  Presiona <strong>Analizar</strong> y el modelo predice la categoría profesional
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-blue-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">4</span>
                  Revisa el resultado en pantalla y en el historial de análisis
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Atajos rápidos</h2>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setPagina('predecir')}
                  className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition text-blue-700">
                  <FileText size={24}/>
                  <span className="text-sm font-medium">Analizar CV</span>
                </button>
                <button onClick={() => setPagina('historial')}
                  className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition text-green-700">
                  <Activity size={24}/>
                  <span className="text-sm font-medium">Historial</span>
                </button>
                <button onClick={() => setPagina('estadisticas')}
                  className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition text-purple-700">
                  <BarChart3 size={24}/>
                  <span className="text-sm font-medium">Estadísticas</span>
                </button>
                {user?.role === 'admin' && (
                  <button onClick={() => setPagina('usuarios')}
                    className="flex flex-col items-center gap-2 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition text-amber-700">
                    <Users size={24}/>
                    <span className="text-sm font-medium">Usuarios</span>
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Información del modelo</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Algoritmo</span>
                  <span className="font-medium text-gray-800">Random Forest</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">CVs entrenados</span>
                  <span className="font-medium text-gray-800">{data.total_cvs.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Categorías</span>
                  <span className="font-medium text-gray-800">{data.total_categorias}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Análisis realizados</span>
                  <span className="font-medium text-gray-800">{data.total_analizados}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Usuarios registrados</span>
                  <span className="font-medium text-gray-800">{data.total_usuarios}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
