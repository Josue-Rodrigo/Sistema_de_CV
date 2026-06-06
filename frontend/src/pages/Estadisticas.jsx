import { useEffect, useState } from 'react'
import api from '../api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const PALETA = ['#2563eb','#8b5cf6','#06b6d4','#10b981','#f59e0b','#f97316','#ef4444','#ec4899','#84cc16','#6366f1']
const PALETA_SUAVE = ['#93c5fd','#c4b5fd','#67e8f9','#6ee7b7','#fcd34d','#fdba74','#fca5a5','#f9a8d4','#bef264','#a5b4fc']

export default function Estadisticas() {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    api.get('/api/estadisticas')
      .then(res => { setDatos(res.data); setCargando(false) })
      .catch(() => setCargando(false))
  }, [])

  if (cargando) return (
    <div className="flex items-center justify-center h-64 text-gray-400">Cargando estadísticas...</div>
  )

  if (!datos) return (
    <div className="flex items-center justify-center h-64 text-red-500">
      Error al cargar datos. Verifica que el backend esté corriendo.
    </div>
  )

  const barData = Object.entries(datos.por_categoria)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const top10 = barData.slice(0, 10)

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Estadísticas del Dataset</h1>
      <p className="text-sm text-gray-400 mb-6">Distribución de los CVs utilizados para entrenar el modelo de Machine Learning.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Total CVs</p>
          <p className="text-3xl font-bold text-gray-800">{datos.total.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Currículos en el dataset de entrenamiento</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Categorías</p>
          <p className="text-3xl font-bold text-gray-800">{Object.keys(datos.por_categoria).length}</p>
          <p className="text-xs text-gray-400 mt-1">Áreas profesionales detectadas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">CVs Analizados</p>
          <p className="text-3xl font-bold text-gray-800">{(datos.total_analizados ?? 0).toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Analizados a través del sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-800 mb-1">Distribución por categoría</h2>
          <p className="text-xs text-gray-400 mb-4">Cantidad de CVs por área profesional</p>
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 50, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} width={140} axisLine={false} tickLine={false}/>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
                formatter={(v) => [`${v.toLocaleString()} CVs`, 'Cantidad']}
                labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}
                label={{ position: 'right', fill: '#64748b', fontSize: 11, formatter: v => v.toLocaleString() }}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={PALETA[i % PALETA.length]} fillOpacity={0.75}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-800 mb-1">Top 10 categorías</h2>
          <p className="text-xs text-gray-400 mb-4">Distribución porcentual de las 10 áreas principales</p>
          <ResponsiveContainer width="100%" height={420}>
            <PieChart>
              <Pie data={top10} dataKey="value" nameKey="name"
                cx="50%" cy="45%" outerRadius={110} innerRadius={50}
                label={({ name, percent }) => `${(percent*100).toFixed(0)}%`}
                labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}>
                {top10.map((_, i) => (
                  <Cell key={i} fill={PALETA[i % PALETA.length]} fillOpacity={0.8}/>
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
                formatter={(v, name) => [`${v.toLocaleString()} CVs`, name]}
              />
              <Legend
                formatter={v => <span style={{fontSize:11, color:'#475569'}}>{v}</span>}
                wrapperStyle={{ paddingTop: 10 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-800 mb-1">Detalle completo</h2>
        <p className="text-xs text-gray-400 mb-4">Todas las categorías ordenadas por cantidad de CVs</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 pr-4 text-xs font-medium text-gray-400 uppercase tracking-wider">#</th>
                <th className="text-left py-3 pr-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Categoría</th>
                <th className="text-right py-3 pr-4 text-xs font-medium text-gray-400 uppercase tracking-wider">CVs</th>
                <th className="text-right py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">%</th>
              </tr>
            </thead>
            <tbody>
              {barData.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 pr-4 text-gray-400 text-xs">{i+1}</td>
                  <td className="py-3 pr-4 font-medium text-gray-700">{row.name}</td>
                  <td className="py-3 pr-4 text-right text-gray-600 font-medium tabular-nums">{row.value.toLocaleString()}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{
                          width: `${(row.value/datos.total*100).toFixed(0)}%`,
                          backgroundColor: PALETA[i % PALETA.length],
                          opacity: 0.7
                        }}/>
                      </div>
                      <span className="text-gray-400 text-xs tabular-nums w-10 text-right">
                        {(row.value/datos.total*100).toFixed(1)}%
                      </span>
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
