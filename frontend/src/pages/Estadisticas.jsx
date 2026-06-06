import { useEffect, useState } from 'react'
import api from '../api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#1e40af','#7c3aed','#059669','#d97706','#dc2626','#0891b2','#be185d','#65a30d','#ea580c','#6366f1']

export default function Estadisticas() {
  const [datos, setDatos]     = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    api.get('/api/estadisticas')
      .then(res => { setDatos(res.data); setCargando(false) })
      .catch(() => setCargando(false))
  }, [])

  if (cargando) return (
    <div className="flex items-center justify-center h-64 text-gray-500">Cargando estadísticas...</div>
  )

  if (!datos) return (
    <div className="flex items-center justify-center h-64 text-red-500">
      Error al cargar datos. Verifica que el backend esté corriendo.
    </div>
  )

  const barData = Object.entries(datos.por_categoria)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const pieData = barData.slice(0, 10)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Estadísticas del Dataset</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <div className="bg-blue-800 text-white px-5 py-4 rounded-lg text-center">
            <p className="text-2xl font-bold">{datos.total.toLocaleString()}</p>
            <p className="text-xs text-blue-200">CVs en dataset</p>
          </div>
          <p className="text-sm text-gray-600">Currículos reales usados para entrenar el modelo ML.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <div className="bg-purple-600 text-white px-5 py-4 rounded-lg text-center">
            <p className="text-2xl font-bold">{Object.keys(datos.por_categoria).length}</p>
            <p className="text-xs text-purple-200">Categorías</p>
          </div>
          <p className="text-sm text-gray-600">Categorías profesionales detectadas por el modelo.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <div className="bg-green-600 text-white px-5 py-4 rounded-lg text-center">
            <p className="text-2xl font-bold">{(datos.total_analizados ?? 0).toLocaleString()}</p>
            <p className="text-xs text-green-200">Analizados</p>
          </div>
          <p className="text-sm text-gray-600">CVs analizados a través del sistema.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">CVs por categoría</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={barData} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }}/>
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90}/>
              <Tooltip />
              <Bar dataKey="value" fill="#1e40af" radius={[0,4,4,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Top 10 categorías</h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={120}
                label={({ name, percent }) => `${(percent*100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]}/>))}
              </Pie>
              <Legend formatter={v => <span style={{fontSize:11}}>{v}</span>}/>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Detalle por categoría</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left p-3 rounded-l-lg">#</th>
                <th className="text-left p-3">Categoría</th>
                <th className="text-left p-3">Cantidad</th>
                <th className="text-left p-3 rounded-r-lg">Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              {barData.map((row, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-3 text-gray-400">{i+1}</td>
                  <td className="p-3 font-medium text-gray-700">{row.name}</td>
                  <td className="p-3 text-gray-600">{row.value}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="h-2 rounded-full" style={{
                          width: `${(row.value/datos.total*100).toFixed(0)}%`,
                          backgroundColor: COLORS[i % COLORS.length]
                        }}/>
                      </div>
                      <span className="text-gray-500">{(row.value/datos.total*100).toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
