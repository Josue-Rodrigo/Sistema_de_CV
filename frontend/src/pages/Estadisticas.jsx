import { useEffect, useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#1e40af','#7c3aed','#059669','#d97706','#dc2626','#0891b2','#be185d','#65a30d','#ea580c','#6366f1']

export default function Estadisticas() {
  const [datos, setDatos]     = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/estadisticas')
      .then(res => { setDatos(res.data); setCargando(false) })
      .catch(() => setCargando(false))
  }, [])

  if (cargando) return (
    <div className="flex items-center justify-center h-64 text-gray-500">
      Cargando estadísticas...
    </div>
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

      {/* Total */}
      <div className="bg-white rounded-xl shadow p-5 mb-6 flex items-center gap-4">
        <div className="bg-blue-800 text-white px-6 py-4 rounded-lg text-center">
          <p className="text-3xl font-bold">{datos.total.toLocaleString()}</p>
          <p className="text-sm text-blue-200">CVs en el sistema</p>
        </div>
        <div>
          <p className="text-gray-700 font-medium">Dataset de entrenamiento</p>
          <p className="text-gray-500 text-sm">
            El modelo fue entrenado con {datos.total.toLocaleString()} currículos
            distribuidos en {Object.keys(datos.por_categoria).length} categorías profesionales.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica de barras */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">CVs por categoría</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={barData} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }}/>
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80}/>
              <Tooltip />
              <Bar dataKey="value" fill="#1e40af" radius={[0,4,4,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfica de pastel */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Top 10 categorías</h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label={({ name, percent }) => `${(percent*100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                ))}
              </Pie>
              <Legend formatter={v => <span style={{fontSize:11}}>{v}</span>}/>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla */}
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
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${(row.value/datos.total*100).toFixed(0)}%`,
                            backgroundColor: COLORS[i % COLORS.length]
                          }}
                        />
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