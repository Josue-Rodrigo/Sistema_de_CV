import { useState } from 'react'
import api from '../api'
import { Search, AlertCircle, CheckCircle2, Upload, FileText, File as FileIcon, History } from 'lucide-react'

export default function Predecir({ setPagina }) {
  const [texto, setTexto]         = useState('')
  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando]   = useState(false)
  const [error, setError]         = useState('')
  const [archivo, setArchivo]     = useState(null)
  const [esBinario, setEsBinario] = useState(false)

  const esPDFoDOCX = (name) => /\.(pdf|docx)$/i.test(name)

  const leerArchivo = (file) => {
    setArchivo(file)
    setError('')
    setResultado(null)
    const esBin = esPDFoDOCX(file.name)
    setEsBinario(esBin)
    if (esBin) { setTexto(''); return }
    const reader = new FileReader()
    reader.onload = (e) => setTexto(e.target.result)
    reader.readAsText(file, 'UTF-8')
  }

  const onDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) leerArchivo(file)
  }

  const onFileInput = (e) => {
    const file = e.target.files[0]
    if (file) leerArchivo(file)
  }

  const analizar = async () => {
    if (!archivo && !texto.trim()) {
      setError('Sube un archivo o ingresa el texto del CV')
      return
    }
    setError('')
    setCargando(true)
    setResultado(null)
    try {
      let res
      if (archivo && esBinario) {
        const fd = new FormData()
        fd.append('file', archivo)
        res = await api.post('/api/predecir', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        res = await api.post('/api/predecir', { resume: texto })
      }
      setResultado(res.data)
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Sesión expirada. Inicia sesión nuevamente.')
      } else {
        setError('Error al conectar con el servidor.')
      }
    } finally {
      setCargando(false)
    }
  }

  const limpiar = () => {
    setTexto(''); setResultado(null); setError('')
    setArchivo(null); setEsBinario(false)
  }

  const confianzaColor = (c) => {
    if (c >= 80) return 'bg-green-500'
    if (c >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Analizar CV</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center mb-4 hover:border-blue-500 transition cursor-pointer bg-blue-50"
          onClick={() => document.getElementById('fileInput').click()}
        >
          <Upload className="mx-auto text-blue-400 mb-2" size={32}/>
          <p className="text-sm text-gray-600 font-medium">
            Arrastra un archivo aquí o <span className="text-blue-600 underline">haz clic para subir</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">Formatos: .pdf, .docx, .txt</p>
          <input id="fileInput" type="file" accept=".pdf,.docx,.txt"
            className="hidden" onChange={onFileInput}/>
        </div>

        {archivo && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 mb-4">
            {esBinario ? <FileIcon size={16} className="text-green-600"/> : <FileText size={16} className="text-green-600"/>}
            <span className="text-sm text-green-700 font-medium">{archivo.name}</span>
            <span className="text-xs text-green-500 ml-auto">
              {esBinario ? 'Se enviará al servidor ✓' : 'Texto cargado ✓'}
            </span>
          </div>
        )}

        <label className="block text-sm font-medium text-gray-700 mb-2">
          {esBinario ? 'El contenido se extraerá en el servidor' : 'O pega el texto del currículo aquí'}
        </label>
        <textarea value={texto} onChange={e => setTexto(e.target.value)}
          rows={8} disabled={esBinario}
          placeholder={esBinario ? 'Desmarca el archivo para escribir texto manualmente' : 'Escribe o pega el contenido del CV aquí...'}
          className={`w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${esBinario ? 'bg-gray-100 cursor-not-allowed' : ''}`}/>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
            <AlertCircle size={16}/> {error}
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button onClick={analizar} disabled={cargando}
            className="flex items-center gap-2 bg-blue-800 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50">
            <Search size={18}/>
            {cargando ? 'Analizando...' : 'Analizar CV'}
          </button>
          <button onClick={limpiar}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition">
            Limpiar
          </button>
        </div>
      </div>

      {resultado && (
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="text-green-500" size={24}/>
            <h2 className="text-lg font-bold text-gray-800">Resultado del análisis</h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">Categoría detectada</p>
              <p className="text-xl font-bold text-blue-800">{resultado.categoria}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">Confianza</p>
              <p className="text-xl font-bold text-green-700">{resultado.confianza}%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">Caracteres</p>
              <p className="text-xl font-bold text-gray-700">{resultado.caracteres?.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Confianza del modelo</span>
              <span>{resultado.confianza}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className={`${confianzaColor(resultado.confianza)} h-3 rounded-full transition-all duration-700`}
                style={{ width: `${resultado.confianza}%` }}/>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {resultado.confianza >= 80 ? 'Alta confianza' : resultado.confianza >= 50 ? 'Confianza media' : 'Baja confianza'}
            </p>
          </div>

          {resultado.id_analisis && (
            <p className="text-xs text-gray-400 mt-3">ID de análisis: #{resultado.id_analisis}</p>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
            <button onClick={limpiar}
              className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
              Nuevo análisis
            </button>
            <button onClick={() => setPagina('historial')}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition">
              <History size={15}/> Ver historial
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
