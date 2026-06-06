from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta
from functools import wraps
import joblib
import pandas as pd
import fitz
from docx import Document
import io
import csv
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'municipalidad-ml-secret-key-2025'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///municipalidad.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=8)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
CORS(app)

modelo     = joblib.load('modelo_cv.pkl')
encoder    = joblib.load('encoder_category.pkl')
vectorizer = joblib.load('tfidf_vectorizer.pkl')
df_data    = pd.read_csv('cv_dataset.csv')


# ─── Modelos ────────────────────────────────────────────────────────────────
class User(db.Model):
    id           = db.Column(db.Integer, primary_key=True)
    username     = db.Column(db.String(80), unique=True, nullable=False)
    email        = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    full_name    = db.Column(db.String(120), default='')
    role         = db.Column(db.String(20), default='user')
    active       = db.Column(db.Boolean, default=True)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role,
            'active': self.active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class CVAnalysis(db.Model):
    id            = db.Column(db.Integer, primary_key=True)
    user_id       = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    filename      = db.Column(db.String(200), default='')
    texto         = db.Column(db.Text, default='')
    categoria     = db.Column(db.String(100))
    confianza     = db.Column(db.Float)
    caracteres    = db.Column(db.Integer)
    metodo        = db.Column(db.String(20), default='texto')
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('analyses', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else 'Anónimo',
            'filename': self.filename,
            'categoria': self.categoria,
            'confianza': self.confianza,
            'caracteres': self.caracteres,
            'metodo': self.metodo,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class CategoriaDataset(db.Model):
    id       = db.Column(db.Integer, primary_key=True)
    nombre   = db.Column(db.String(100), unique=True, nullable=False)
    cantidad = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {'id': self.id, 'nombre': self.nombre, 'cantidad': self.cantidad}


with app.app_context():
    db.create_all()
    if User.query.count() == 0:
        admin = User(
            username='admin',
            email='admin@municipalidad.pe',
            password_hash=bcrypt.generate_password_hash('admin123').decode('utf-8'),
            full_name='Administrador del Sistema',
            role='admin'
        )
        user1 = User(
            username='analista',
            email='analista@municipalidad.pe',
            password_hash=bcrypt.generate_password_hash('analista123').decode('utf-8'),
            full_name='Analista de Recursos Humanos',
            role='user'
        )
        db.session.add_all([admin, user1])
        db.session.commit()

    if CategoriaDataset.query.count() == 0:
        conteo = df_data['Category'].value_counts()
        for cat, cnt in conteo.items():
            db.session.add(CategoriaDataset(nombre=cat, cantidad=int(cnt)))
        db.session.commit()


# ─── Decoradores ────────────────────────────────────────────────────────────
def login_requerido(f):
    @wraps(f)
    def decorado(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'No autorizado. Inicia sesión.'}), 401
        return f(*args, **kwargs)
    return decorado


def admin_requerido(f):
    @wraps(f)
    def decorado(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'No autorizado'}), 401
        user = db.session.get(User, session['user_id'])
        if not user or user.role != 'admin':
            return jsonify({'error': 'Se requieren permisos de administrador'}), 403
        return f(*args, **kwargs)
    return decorado


# ─── Utilidades ─────────────────────────────────────────────────────────────
def extraer_texto_pdf(bytes_data):
    texto = ""
    doc = fitz.open(stream=bytes_data, filetype="pdf")
    for page in doc:
        texto += page.get_text()
    return texto


def extraer_texto_docx(bytes_data):
    doc = Document(io.BytesIO(bytes_data))
    return "\n".join([p.text for p in doc.paragraphs])


# ─── Auth ───────────────────────────────────────────────────────────────────
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '')
    password = data.get('password', '')

    user = User.query.filter_by(username=username).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Usuario o contraseña incorrectos'}), 401
    if not user.active:
        return jsonify({'error': 'Cuenta desactivada'}), 403

    session.permanent = True
    session['user_id'] = user.id
    session['username'] = user.username
    session['role'] = user.role

    return jsonify({'mensaje': 'Inicio de sesión exitoso', 'user': user.to_dict()})


@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'mensaje': 'Sesión cerrada'})


@app.route('/api/me', methods=['GET'])
def me():
    if 'user_id' not in session:
        return jsonify({'user': None})
    user = db.session.get(User, session['user_id'])
    if not user:
        session.clear()
        return jsonify({'user': None})
    return jsonify({'user': user.to_dict()})


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data.get('username') or not data.get('password') or not data.get('email'):
        return jsonify({'error': 'Faltan campos requeridos'}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'El usuario ya existe'}), 409
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'El email ya está registrado'}), 409

    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=bcrypt.generate_password_hash(data['password']).decode('utf-8'),
        full_name=data.get('full_name', ''),
        role='user'
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'mensaje': 'Usuario registrado exitosamente', 'user': user.to_dict()}), 201


# ─── Predicción ─────────────────────────────────────────────────────────────
def predecir_texto(texto):
    X = vectorizer.transform([texto]).toarray()
    pred = modelo.predict(X)
    categoria = encoder.inverse_transform(pred)[0]
    proba = modelo.predict_proba(X).max() * 100
    return categoria, round(float(proba), 2)


@app.route('/api/predecir', methods=['POST'])
@login_requerido
def predecir():
    texto = ""
    filename = ""
    metodo = "texto"

    if 'file' in request.files:
        file = request.files['file']
        filename = file.filename
        contenido = file.read()
        metodo = "archivo"

        if filename.lower().endswith('.pdf'):
            texto = extraer_texto_pdf(contenido)
        elif filename.lower().endswith('.docx'):
            texto = extraer_texto_docx(contenido)
        elif filename.lower().endswith('.txt'):
            texto = contenido.decode('utf-8', errors='ignore')
        else:
            return jsonify({'error': 'Formato no soportado. Usa PDF, DOCX o TXT'}), 400
    elif request.is_json:
        texto = request.get_json().get('resume', '')

    if not texto.strip():
        return jsonify({'error': 'No se pudo extraer texto'}), 400

    categoria, confianza = predecir_texto(texto)

    analisis = CVAnalysis(
        user_id=session['user_id'],
        filename=filename,
        texto=texto[:500],
        categoria=categoria,
        confianza=confianza,
        caracteres=len(texto),
        metodo=metodo
    )
    db.session.add(analisis)
    db.session.commit()

    return jsonify({
        'categoria': categoria,
        'confianza': confianza,
        'caracteres': len(texto),
        'id_analisis': analisis.id
    })


# ─── Historial ──────────────────────────────────────────────────────────────
@app.route('/api/historial', methods=['GET'])
@login_requerido
def historial():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    busqueda = request.args.get('q', '')

    query = CVAnalysis.query
    if busqueda:
        query = query.filter(CVAnalysis.categoria.contains(busqueda))

    query = query.order_by(CVAnalysis.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'analisis': [a.to_dict() for a in pagination.items],
        'total': pagination.total,
        'page': pagination.page,
        'pages': pagination.pages
    })


@app.route('/api/historial/<int:id>', methods=['DELETE'])
@login_requerido
def eliminar_analisis(id):
    analisis = db.session.get(CVAnalysis, id)
    if not analisis:
        return jsonify({'error': 'Análisis no encontrado'}), 404
    if session['role'] != 'admin':
        return jsonify({'error': 'Solo administradores pueden eliminar análisis'}), 403

    db.session.delete(analisis)
    db.session.commit()
    return jsonify({'mensaje': 'Análisis eliminado'})


@app.route('/api/historial/exportar/<formato>', methods=['GET'])
@login_requerido
def exportar_historial(formato):
    resultados = CVAnalysis.query.order_by(CVAnalysis.created_at.desc()).all()

    if formato == 'csv':
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['ID', 'Usuario', 'Archivo', 'Categoria', 'Confianza', 'Caracteres', 'Metodo', 'Fecha'])
        for r in resultados:
            writer.writerow([r.id, r.user.username if r.user else 'Anónimo', r.filename,
                           r.categoria, r.confianza, r.caracteres, r.metodo,
                           r.created_at.isoformat() if r.created_at else ''])
        return output.getvalue(), 200, {'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=historial.csv'}

    return jsonify({'analisis': [r.to_dict() for r in resultados]})


# ─── Usuarios (admin) ───────────────────────────────────────────────────────
@app.route('/api/usuarios', methods=['GET'])
@admin_requerido
def listar_usuarios():
    usuarios = User.query.order_by(User.created_at.desc()).all()
    return jsonify({'usuarios': [u.to_dict() for u in usuarios]})


@app.route('/api/usuarios/<int:id>', methods=['PUT', 'DELETE'])
@admin_requerido
def gestionar_usuario(id):
    user = db.session.get(User, id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    if request.method == 'DELETE':
        if user.id == session['user_id']:
            return jsonify({'error': 'No puedes eliminarte a ti mismo'}), 400
        db.session.delete(user)
        db.session.commit()
        return jsonify({'mensaje': 'Usuario eliminado'})

    data = request.get_json()
    if 'full_name' in data:
        user.full_name = data['full_name']
    if 'role' in data and session['role'] == 'admin':
        user.role = data['role']
    if 'active' in data:
        user.active = data['active']
    if 'password' in data and data['password']:
        user.password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    db.session.commit()
    return jsonify({'mensaje': 'Usuario actualizado', 'user': user.to_dict()})


# ─── Datos públicos ─────────────────────────────────────────────────────────
@app.route('/api/categorias', methods=['GET'])
def categorias():
    return jsonify({'categorias': encoder.classes_.tolist()})


@app.route('/api/estadisticas', methods=['GET'])
def estadisticas():
    conteo = df_data['Category'].value_counts().to_dict()
    total_analizados = CVAnalysis.query.count()
    return jsonify({
        'total': len(df_data),
        'por_categoria': conteo,
        'total_analizados': total_analizados
    })


@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    total_cvs = len(df_data)
    total_categorias = df_data['Category'].nunique()
    total_analizados = CVAnalysis.query.count()
    total_usuarios = User.query.count()

    analisis_hoy = CVAnalysis.query.filter(
        db.func.date(CVAnalysis.created_at) == datetime.utcnow().date()
    ).count()

    return jsonify({
        'total_cvs': total_cvs,
        'total_categorias': total_categorias,
        'total_analizados': total_analizados,
        'total_usuarios': total_usuarios,
        'analisis_hoy': analisis_hoy
    })


@app.route('/api/dataframe', methods=['GET'])
def dataframe():
    return jsonify({
        'total_filas': len(df_data),
        'columnas': list(df_data.columns),
        'categorias': df_data['Category'].value_counts().to_dict()
    })


# ─── Inicio ─────────────────────────────────────────────────────────────────
@app.route('/', methods=['GET'])
def index():
    return jsonify({'mensaje': 'API Municipalidad ML funcionando'})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
