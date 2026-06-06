import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../AuthContext'
import { Clock, Search, Download, Trash2, ChevronLeft, ChevronRight, FileText, AlertCircle } from 'lucide-react'

export default function Historial() {
  const { user } = useAuth()
  const [analisis, setAnalisis] = useState([])
  const [cargando, setCargando] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState('')

  const cargar = (p = 1, q = '') => {
    setCargando(true)
    api.get(`/api/historial?page=${p}&per_page=15&q=${encodeURIComponent(q)}`)
      .then(res => {
        setAnalisis(res.data.analisis)
        setTotal(res.data.total)
        setTotalPages(res.data.pages)
        setPage(res.data.page)
      })
      .catch(() => setError('Error al cargar historial'))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar(page, busqueda) }, [])

  const buscar = (e) => {
    e.preventDefault()
    cargar(1, busqueda)
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este análisis?')) return
    try {
      await api.delete(`/api/historial/${id}`)
      cargar(page, busqueda)
    } catch { setError('Error al eliminar') }
  }

  const exportar = async (formato) => {
    try {
      const res = await api.get(`/api/historial/exportar/${formato}`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url; a.download = `historial.${formato}`
      a.click()
      URL.revokeObjectURL(url)
    } catch { setError('Error al exportar') }
  }

  if (error && analisis.length === 0) return (
    <div className="flex flex-col items-center justify-center h-64 text-red-500 gap-2">
      <AlertCircle size={32}/> <p>{error}</p>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Historial de Análisis</h1>
        <div className="flex gap-2">
          <button onClick={() => exportar('csv')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition">
            <Download size={15}/> CSV
          </button>
          <button onClick={() => exportar('json')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-800 text-white rounded-lg text-sm hover:bg-blue-700 transition">
            <Download size={15}/> JSON
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <form onSubmit={buscar} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input
              type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por categoría..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit"
            className="px-4 py-2 bg-blue-800 text-white rounded-lg text-sm hover:bg-blue-700 transition">Buscar</button>
        </form>
      </div>

      {cargando ? (
        <div className="flex items-center justify-center h-64 text-gray-500">Cargando historial...</div>
      ) : analisis.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
          <Clock size={48} className="mx-auto mb-3 text-gray-300"/>
          <p className="font-medium">No hay análisis registrados</p>
          <p className="text-sm">Los resultados aparecerán aquí después de analizar CVs.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 border-b">
                    <th className="text-left p-3">#</th>
                    <th className="text-left p-3">Usuario</th>
                    <th className="text-left p-3">Archivo</th>
                    <th className="text-left p-3">Categoría</th>
                    <th className="text-left p-3">Confianza</th>
                    <th className="text-left p-3">Método</th>
                    <th className="text-left p-3">Fecha</th>
                    <th className="text-right p-3">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {analisis.map((a, i) => (
                    <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-gray-400">{(page-1)*15 + i + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">{a.username[0]}</span>
                          </div>
                          <span className="text-gray-700">{a.username}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <FileText size={14}/>
                          {a.filename || <span className="text-gray-400 italic">texto directo</span>}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {a.categoria}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${a.confianza >= 80 ? 'bg-green-500' : a.confianza >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{width: `${a.confianza}%`}}/>
                          </div>
                          <span className="text-xs text-gray-500">{a.confianza}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${a.metodo === 'archivo' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                          {a.metodo}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500 text-xs">
                        {a.created_at ? new Date(a.created_at).toLocaleString('es-PE') : '-'}
                      </td>
                      <td className="p-3 text-right">
                        {user?.role === 'admin' && (
                          <button onClick={() => eliminar(a.id)}
                            className="text-gray-400 hover:text-red-500 transition p-1">
                            <Trash2 size={15}/>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500">{total} resultados — Página {page} de {totalPages}</p>
                <div className="flex gap-1">
                  <button disabled={page <= 1} onClick={() => cargar(page - 1, busqueda)}
                    className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-30 hover:bg-gray-100 transition">
                    <ChevronLeft size={16}/>
                  </button>
                  <button disabled={page >= totalPages} onClick={() => cargar(page + 1, busqueda)}
                    className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-30 hover:bg-gray-100 transition">
                    <ChevronRight size={16}/>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
