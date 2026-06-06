import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../AuthContext'
import { Users, Shield, UserCircle, ToggleLeft, ToggleRight, Trash2, AlertCircle, Edit3, X, Save } from 'lucide-react'

export default function Usuarios() {
  const { user: currentUser } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '', role: 'user' })
  const [editForm, setEditForm] = useState({ username: '', email: '', full_name: '', password: '', role: '', active: true })

  const cargar = () => {
    setCargando(true)
    api.get('/api/usuarios')
      .then(res => setUsuarios(res.data.usuarios))
      .catch(() => setError('Error al cargar usuarios'))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [])

  const abrirEdicion = (u) => {
    setEditUser(u)
    setEditForm({
      username: u.username,
      email: u.email,
      full_name: u.full_name || '',
      password: '',
      role: u.role,
      active: u.active
    })
  }

  const guardarEdicion = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...editForm }
      if (!payload.password) delete payload.password
      await api.put(`/api/usuarios/${editUser.id}`, payload)
      setEditUser(null)
      cargar()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar')
    }
  }

  const toggleActivo = async (u) => {
    try {
      await api.put(`/api/usuarios/${u.id}`, { active: !u.active })
      cargar()
    } catch { setError('Error al cambiar estado') }
  }

  const cambiarRol = async (u, rol) => {
    try {
      await api.put(`/api/usuarios/${u.id}`, { role: rol })
      cargar()
    } catch { setError('Error al cambiar rol') }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este usuario permanentemente?')) return
    try { await api.delete(`/api/usuarios/${id}`); cargar() }
    catch { setError('Error al eliminar') }
  }

  const crear = async (e) => {
    e.preventDefault()
    try {
      await api.post('/api/register', form)
      setShowAdd(false)
      setForm({ username: '', email: '', password: '', full_name: '', role: 'user' })
      cargar()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear usuario')
    }
  }

  if (cargando) return <div className="flex items-center justify-center h-64 text-gray-500">Cargando usuarios...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
        <button onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-blue-800 text-white rounded-lg text-sm hover:bg-blue-700 transition">
          {showAdd ? 'Cancelar' : '+ Nuevo Usuario'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-4 py-2 mb-4 text-sm">
          <AlertCircle size={16}/> {error}
        </div>
      )}

      {showAdd && (
        <form onSubmit={crear} className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Usuario *</label>
            <input required value={form.username} onChange={e => setForm({...form, username: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
            <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña *</label>
            <input required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre completo</label>
            <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="user">Usuario</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition">
              Crear Usuario
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 border-b">
                <th className="text-left p-3">Usuario</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Nombre</th>
                <th className="text-left p-3">Rol</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-left p-3">Creado</th>
                <th className="text-right p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-500">{u.username[0].toUpperCase()}</span>
                      </div>
                      <span className="font-medium text-gray-800">{u.username}</span>
                      {u.id === currentUser?.id && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">tú</span>}
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">{u.email}</td>
                  <td className="p-3 text-gray-600">{u.full_name || '-'}</td>
                  <td className="p-3">
                    {currentUser?.role === 'admin' && u.id !== currentUser?.id ? (
                      <select value={u.role} onChange={e => cambiarRol(u, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="user">Usuario</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                        {u.role === 'admin' ? <Shield size={12}/> : <UserCircle size={12}/>}
                        {u.role === 'admin' ? 'Admin' : 'Usuario'}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <button onClick={() => toggleActivo(u)}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${u.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {u.active ? <ToggleRight size={14}/> : <ToggleLeft size={14}/>}
                      {u.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="p-3 text-xs text-gray-400">
                    {new Date(u.created_at).toLocaleDateString('es-PE')}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => abrirEdicion(u)}
                        className="text-gray-400 hover:text-blue-500 transition p-1" title="Editar">
                        <Edit3 size={15}/>
                      </button>
                      {u.id !== currentUser?.id && (
                        <button onClick={() => eliminar(u.id)}
                          className="text-gray-400 hover:text-red-500 transition p-1" title="Eliminar">
                          <Trash2 size={15}/>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">{editUser.username[0].toUpperCase()}</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Editar usuario</h2>
                  <p className="text-xs text-gray-500">@{editUser.username}</p>
                </div>
              </div>
              <button onClick={() => setEditUser(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                <X size={18}/>
              </button>
            </div>
            <form onSubmit={guardarEdicion} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Usuario</label>
                  <input value={editForm.username}
                    onChange={e => setEditForm({...editForm, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input type="email" value={editForm.email}
                    onChange={e => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre completo</label>
                <input value={editForm.full_name}
                  onChange={e => setEditForm({...editForm, full_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nueva contraseña
                    <span className="text-gray-400 font-normal"> (dejar vacío para mantener)</span>
                  </label>
                  <input type="password" value={editForm.password}
                    onChange={e => setEditForm({...editForm, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
                  <select value={editForm.role}
                    onChange={e => setEditForm({...editForm, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="user">Usuario</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={editForm.active}
                    onChange={e => setEditForm({...editForm, active: e.target.checked})}
                    className="sr-only peer"/>
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"/>
                </label>
                <span className="text-sm text-gray-600">{editForm.active ? 'Cuenta activa' : 'Cuenta inactiva'}</span>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setEditUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">
                  <Save size={15}/> Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
