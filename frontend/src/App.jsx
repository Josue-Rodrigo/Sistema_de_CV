import { useState } from 'react'
import { AuthProvider, useAuth } from './AuthContext'
import Dashboard from './pages/Dashboard'
import Predecir from './pages/Predecir'
import Estadisticas from './pages/Estadisticas'
import Historial from './pages/Historial'
import Usuarios from './pages/Usuarios'
import Perfil from './pages/Perfil'
import Login from './pages/Login'
import { LayoutDashboard, FileSearch, BarChart2, Clock, Users, UserCircle, LogOut, Loader2 } from 'lucide-react'

function AppContent() {
  const { user, logout, cargando } = useAuth()
  const [pagina, setPagina] = useState('dashboard')

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 size={32} className="animate-spin text-blue-800"/>
    </div>
  )

  if (!user) return <Login/>

  const nav = [
    { id: 'dashboard',    label: 'Panel',       icon: <LayoutDashboard size={18}/>, roles: ['admin','user'] },
    { id: 'predecir',     label: 'Analizar CV', icon: <FileSearch size={18}/>,       roles: ['admin','user'] },
    { id: 'historial',    label: 'Historial',   icon: <Clock size={18}/>,            roles: ['admin','user'] },
    { id: 'estadisticas', label: 'Estadísticas',icon: <BarChart2 size={18}/>,        roles: ['admin','user'] },
    { id: 'usuarios',     label: 'Usuarios',    icon: <Users size={18}/>,            roles: ['admin'] },
  ]

  const navFiltrado = nav.filter(n => n.roles.includes(user.role))

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-100 fixed h-full flex flex-col z-10">
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

        <div className="px-3 py-4 flex-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-3">Menú</p>
          <nav className="flex flex-col gap-1">
            {navFiltrado.map(n => (
              <button key={n.id} onClick={() => setPagina(n.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left w-full ${
                  pagina === n.id
                    ? 'bg-black text-white font-medium shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}>
                <span className={pagina === n.id ? 'text-white' : 'text-gray-400'}>{n.icon}</span>
                {n.label}
                {pagina === n.id && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-70"/>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-6 py-5 border-t border-gray-100">
          <button onClick={() => setPagina('perfil')}
            className="flex items-center gap-3 w-full mb-3 hover:bg-gray-50 rounded-xl px-3 py-2.5 transition">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">{user.username[0].toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-medium text-gray-700 truncate">{user.full_name || user.username}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role === 'admin' ? 'Administrador' : 'Analista'}</p>
            </div>
            <UserCircle size={16} className="text-gray-400"/>
          </button>
          <button onClick={logout}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-500 transition w-full px-3">
            <LogOut size={14}/> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 min-h-screen">
        {pagina === 'dashboard'    && <Dashboard setPagina={setPagina}/>}
        {pagina === 'predecir'     && <Predecir setPagina={setPagina}/>}
        {pagina === 'historial'    && <Historial/>}
        {pagina === 'estadisticas' && <Estadisticas/>}
        {pagina === 'usuarios'     && <Usuarios/>}
        {pagina === 'perfil'       && <Perfil/>}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent/>
    </AuthProvider>
  )
}
