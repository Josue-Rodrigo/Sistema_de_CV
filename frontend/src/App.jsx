import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Predecir from './pages/Predecir'
import Estadisticas from './pages/Estadisticas'
import { LayoutDashboard, FileSearch, BarChart2 } from 'lucide-react'

export default function App() {
  const [pagina, setPagina] = useState('dashboard')

  const nav = [
    { id: 'dashboard',    label: 'Panel',        icon: <LayoutDashboard size={18}/> },
    { id: 'predecir',     label: 'Analizar CV',  icon: <FileSearch size={18}/> },
    { id: 'estadisticas', label: 'Estadísticas', icon: <BarChart2 size={18}/> },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 fixed h-full flex flex-col">

        {/* Logo */}
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">Municipalidad</p>
              <p className="text-xs text-gray-400">de Yau · ML</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="px-3 py-4 flex-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-3">Menú</p>
          <nav className="flex flex-col gap-1">
            {nav.map(n => (
              <button
                key={n.id}
                onClick={() => setPagina(n.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left w-full ${
                  pagina === n.id
                    ? 'bg-black text-white font-medium shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={pagina === n.id ? 'text-white' : 'text-gray-400'}>
                  {n.icon}
                </span>
                {n.label}
                {pagina === n.id && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-70"/>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-500">S</span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700">SENATI</p>
              <p className="text-xs text-gray-400">Taller ML · 2025</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {pagina === 'dashboard'    && <Dashboard setPagina={setPagina}/>}
        {pagina === 'predecir'     && <Predecir/>}
        {pagina === 'estadisticas' && <Estadisticas/>}
      </main>
    </div>
  )
}