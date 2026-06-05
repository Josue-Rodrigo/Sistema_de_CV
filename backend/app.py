from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import fitz  # pymupdf
from docx import Document
import io

app = Flask(__name__)
CORS(app)

modelo     = joblib.load('modelo_cv.pkl')
encoder    = joblib.load('encoder_category.pkl')
vectorizer = joblib.load('tfidf_vectorizer.pkl')
df_data    = pd.read_csv('cv_dataset.csv')

def extraer_texto_pdf(bytes_data):
    texto = ""
    doc = fitz.open(stream=bytes_data, filetype="pdf")
    for page in doc:
        texto += page.get_text()
    return texto

def extraer_texto_docx(bytes_data):
    doc = Document(io.BytesIO(bytes_data))
    return "\n".join([p.text for p in doc.paragraphs])

@app.route('/', methods=['GET'])
def index():
    return jsonify({'mensaje': '✅ API Municipalidad ML funcionando'})

@app.route('/predecir', methods=['POST'])
def predecir():
    texto = ""

    # Si viene archivo
    if 'file' in request.files:
        file = request.files['file']
        nombre = file.filename.lower()
        contenido = file.read()

        if nombre.endswith('.pdf'):
            texto = extraer_texto_pdf(contenido)
        elif nombre.endswith('.docx'):
            texto = extraer_texto_docx(contenido)
        elif nombre.endswith('.txt'):
            texto = contenido.decode('utf-8', errors='ignore')
        else:
            return jsonify({'error': 'Formato no soportado. Usa PDF, DOCX o TXT'}), 400

    # Si viene texto plano
    elif request.is_json:
        texto = request.get_json().get('resume', '')

    if not texto.strip():
        return jsonify({'error': 'No se pudo extraer texto del archivo'}), 400

    X = vectorizer.transform([texto]).toarray()
    pred  = modelo.predict(X)
    categoria = encoder.inverse_transform(pred)[0]
    proba = modelo.predict_proba(X).max() * 100

    return jsonify({
        'categoria': categoria,
        'confianza': round(float(proba), 2),
        'caracteres': len(texto)
    })

@app.route('/categorias', methods=['GET'])
def categorias():
    return jsonify({'categorias': encoder.classes_.tolist()})

@app.route('/estadisticas', methods=['GET'])
def estadisticas():
    conteo = df_data['Category'].value_counts().to_dict()
    return jsonify({'total': len(df_data), 'por_categoria': conteo})

if __name__ == '__main__':
    app.run(debug=True, port=5000)