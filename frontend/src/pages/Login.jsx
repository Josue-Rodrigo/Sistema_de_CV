import { useState } from 'react'
import { useAuth } from '../AuthContext'
import api from '../api'
import { LogIn, AlertCircle, Eye, EyeOff, UserPlus, User, Mail, Lock, Building, Sparkles } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const [modo, setModo] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const [regForm, setRegForm] = useState({ username: '', email: '', password: '', full_name: '' })
  const [regError, setRegError] = useState('')
  const [regExito, setRegExito] = useState('')
  const [regCargando, setRegCargando] = useState(false)
  const [regShowPass, setRegShowPass] = useState(false)

  const irAlLogin = () => {
    setTimeout(() => window.location.replace('/'), 200)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Ingresa usuario y contraseña'); return
    }
    setError(''); setCargando(true)
    try { await login(username, password); irAlLogin() }
    catch { setError('Usuario o contraseña incorrectos'); setCargando(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!regForm.username || !regForm.email || !regForm.password) {
      setRegError('Completa todos los campos obligatorios'); return
    }
    setRegError(''); setRegExito(''); setRegCargando(true)
    try {
      await api.post('/api/register', regForm)
      await login(regForm.username, regForm.password)
      irAlLogin()
    } catch (err) {
      if (err.response?.status === 409) {
        try {
          await login(regForm.username, regForm.password)
          irAlLogin()
        } catch {
          setRegError('Ese usuario ya existe. Intentá con otro nombre.')
        }
      } else {
        setRegError(err.response?.data?.error || 'Error al registrarse')
      }
    } finally { setRegCargando(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 relative overflow-hidden selection:bg-white/20">
      <div className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.12), transparent), radial-gradient(ellipse 60% 40% at 30% 120%, rgba(139,92,246,0.08), transparent), radial-gradient(ellipse 50% 30% at 70% 110%, rgba(99,102,241,0.06), transparent)',
        }}
      />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="w-full max-w-md relative z-10 px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 mb-4 ring-1 ring-white/10">
            <Sparkles className="text-white" size={28}/>
          </div>
          <h1 className="text-2xl font-bold text-white/90 tracking-tight">Municipalidad de Yau</h1>
          <p className="text-white/40 text-sm mt-1">Sistema de Análisis de CV con Machine Learning</p>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-indigo-400/10 to-violet-500/20 rounded-2xl blur-xl"/>

          <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 ring-1 ring-white/5">
            <div className="flex mb-8 bg-gray-800/50 rounded-xl p-1 border border-white/5">
              <button onClick={() => setModo('login')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${modo === 'login' ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20' : 'text-white/40 hover:text-white/70'}`}>
                <LogIn size={15} className="inline mr-1.5 -mt-0.5"/> Iniciar Sesión
              </button>
              <button onClick={() => { setModo('register'); setRegError(''); setRegExito('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${modo === 'register' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white/70'}`}>
                <UserPlus size={15} className="inline mr-1.5 -mt-0.5"/> Registrarse
              </button>
            </div>

            {modo === 'login' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">Usuario</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 peer-focus-within:text-indigo-400 transition-colors"/>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all peer"
                      placeholder="Ingresa tu usuario"/>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">Contraseña</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 peer-focus-within:text-indigo-400 transition-colors"/>
                    <input type={showPass ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all peer"
                      placeholder="Ingresa tu contraseña"/>
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                      {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2.5 text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm">
                    <AlertCircle size={16} className="shrink-0 text-red-400"/> {error}
                  </div>
                )}

                <button type="submit" disabled={cargando}
                  className="relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20 overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] hover:bg-[position:100%_100%] transition-all duration-700"/>
                  {cargando ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  ) : (
                    <><LogIn size={18}/> Iniciar Sesión</>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">Nombre completo</label>
                  <input type="text" value={regForm.full_name}
                    onChange={e => setRegForm({...regForm, full_name: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    placeholder="Ej: Juan Pérez"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">Usuario *</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"/>
                      <input type="text" value={regForm.username}
                        onChange={e => setRegForm({...regForm, username: e.target.value})} required
                        className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm"
                        placeholder="Usuario"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">Email *</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"/>
                      <input type="email" value={regForm.email}
                        onChange={e => setRegForm({...regForm, email: e.target.value})} required
                        className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm"
                        placeholder="tu@email.com"/>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">Contraseña *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"/>
                    <input type={regShowPass ? 'text' : 'password'} value={regForm.password}
                      onChange={e => setRegForm({...regForm, password: e.target.value})} required
                      className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                      placeholder="Crea una contraseña segura"/>
                    <button type="button" onClick={() => setRegShowPass(!regShowPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                      {regShowPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>

                {regError && (
                  <div className="flex items-center gap-2.5 text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm">
                    <AlertCircle size={16} className="shrink-0 text-red-400"/> {regError}
                  </div>
                )}
                {regExito && (
                  <div className="flex items-center gap-2.5 text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm">
                    <div className="w-5 h-5 border-2 border-emerald-300/30 border-t-emerald-300 rounded-full animate-spin shrink-0"/>
                    {regExito}
                  </div>
                )}

                <button type="submit" disabled={regCargando}
                  className="relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] hover:bg-[position:100%_100%] transition-all duration-700"/>
                  {regCargando ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  ) : (
                    <><UserPlus size={18}/> Crear Cuenta</>
                  )}
                </button>
              </form>
            )}

            {modo === 'login' && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-xs text-white/30 text-center mb-3 uppercase tracking-wider">Acceso rápido</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { rol: 'Administrador', user: 'admin', pass: 'admin123', cls: 'from-indigo-500/10 to-violet-500/10 border-indigo-500/20' },
                    { rol: 'Analista RRHH', user: 'analista', pass: 'analista123', cls: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20' },
                  ].map((item, i) => (
                    <button key={i} type="button" onClick={() => { setUsername(item.user); setPassword(item.pass) }}
                      className={`bg-gradient-to-br ${item.cls} border rounded-xl p-3.5 text-center hover:scale-[1.02] hover:bg-white/5 transition-all cursor-pointer`}>
                      <p className="text-white/70 font-medium text-xs tracking-wide">{item.rol}</p>
                      <p className="text-white/25 text-[10px] mt-1 font-mono">{item.user} / {item.pass}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 justify-center mt-8 text-white/15 text-xs">
          <span className="w-8 h-px bg-white/10"/>
          Municipalidad de Yau &copy; 2025
          <span className="w-8 h-px bg-white/10"/>
        </div>
      </div>
    </div>
  )
}
