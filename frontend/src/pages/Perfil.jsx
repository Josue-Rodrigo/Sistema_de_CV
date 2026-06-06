import { useState } from 'react'
import api from '../api'
import { useAuth } from '../AuthContext'
import { User, Mail, Lock, Save, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function Perfil() {
  const { user, login } = useAuth()
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    password: '',
    confirm_password: '',
  })
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setExito('')

    if (form.password && form.password !== form.confirm_password) {
      setError('Las contraseñas no coinciden'); return
    }

    setCargando(true)
    try {
      const payload = { full_name: form.full_name, email: form.email }
      if (form.password) payload.password = form.password
      await api.put(`/api/usuarios/${user.id}`, payload)
      await api.post('/api/login', { username: user.username, password: form.password || '___' }).catch(() => {})
      setExito('Perfil actualizado correctamente')
      setForm(prev => ({ ...prev, password: '', confirm_password: '' }))
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mi Perfil</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-center gap-4 pb-6 mb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">{user?.username[0].toUpperCase()}</span>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-800">{user?.full_name || user?.username}</p>
            <p className="text-sm text-gray-500">@{user?.username}</p>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1 ${user?.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
              {user?.role === 'admin' ? 'Administrador' : 'Analista'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input type="text" value={form.full_name}
                onChange={e => setForm({...form, full_name: e.target.value})}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tu nombre completo"/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input type="email" value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tu@email.com"/>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Cambiar contraseña</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input type="password" value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dejar vacío para mantener"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input type="password" value={form.confirm_password}
                    onChange={e => setForm({...form, confirm_password: e.target.value})}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Repite la contraseña"/>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-4 py-2 text-sm">
              <AlertCircle size={16}/> {error}
            </div>
          )}
          {exito && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg px-4 py-2 text-sm">
              <CheckCircle2 size={16}/> {exito}
            </div>
          )}

          <button type="submit" disabled={cargando}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50">
            <Save size={16}/> {cargando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}
