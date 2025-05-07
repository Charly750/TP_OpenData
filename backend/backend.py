from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
import requests

# Initialisation de l'application Flask
app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = 'cle_secrete_dev_123456789_flask_demo'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'

db = SQLAlchemy(app)

# Modèle Utilisateur
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    history = db.relationship('SearchHistory', backref='user', lazy=True)

# Modèle Historique
class SearchHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    search_term = db.Column(db.String(150), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# Création des tables
with app.app_context():
    db.create_all()

# Middleware d’authentification via JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if token is None:
            return jsonify({'error': 'Token manquant'}), 401
        try:
            token = token.replace("Bearer ", "")
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.filter_by(username=data['username']).first()
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expiré'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token invalide'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# Route d’enregistrement utilisateur
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Champs requis manquants'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Utilisateur déjà existant'}), 409

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'Utilisateur enregistré avec succès'}), 201

# Route d’authentification utilisateur
@app.route('/auth', methods=['POST'])
def auth():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        token = jwt.encode({
            'username': user.username,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({'message': 'Authentification réussie', 'token': token}), 200

    return jsonify({'error': 'Nom d’utilisateur ou mot de passe invalide'}), 401

# Recherche de produit par code-barres avec historique
@app.route('/product/list', methods=['POST'])
@token_required  # Activez si authentification requise
def get_product(current_user):
    data = request.get_json()
    sort = data.get('sort')
    page = data.get('page')
    if not sort:
        sort = 'nutriscore_score'
    if not page:
        page = 1
    try:
        url = f'https://world.openfoodfacts.org/api/v2/search?sort_by={sort}&page={page}&page_size=50'
        response = requests.get(url)
        response.raise_for_status()
        results = response.json()
        print(results.get("count"))
        pagination = results.get("count") / 50
        if pagination != int(pagination):
            pagination = int(pagination) + 1
        print(pagination)
        results['pagination'] = pagination
        if results.get('products'):
            return jsonify(results), 200
        else:
            return jsonify({'error': 'Aucun produit trouvé'}), 404

    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Erreur de requête externe : {str(e)}'}), 400

# Recherche de produit par code-barres avec historique
@app.route('/product/<string:product_code>', methods=['GET'])
@token_required
def get_product_suggestions(current_user, product_code):
    try:
        # Enregistrement dans l’historique
        history_entry = SearchHistory(search_term=product_code, user_id=current_user.id)
        db.session.add(history_entry)
        db.session.commit()

        url = f'https://world.openfoodfacts.org/api/v2/product/{product_code}'
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        if data:
            return jsonify(data), 200
        else:
            return jsonify({'error': 'Produit non trouvé'}), 404

    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 400

# Recherche par mot-clé avec historique
@app.route('/search/<string:search>', methods=['GET'])
@token_required
def search_product(current_user, search):
    try:
        # Enregistrement dans l’historique
        history_entry = SearchHistory(search_term=search, user_id=current_user.id)
        db.session.add(history_entry)
        db.session.commit()

        url = f'https://world.openfoodfacts.org/api/v2/search?categories_tags_fr={search}&countries_tags=en:france|fr:france&sort_by=nutriscore_score&page=1&page_size=5'
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        if len(data.get('products', [])) < 5:
            url = f'https://world.openfoodfacts.org/api/v2/search?brands_tags_fr={search}&countries_tags=en:france|fr:france&sort_by=nutriscore_score&page=1&page_size=5'
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()

        return jsonify(data), 200

    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 400

# Affichage de l’historique utilisateur
@app.route('/history', methods=['GET'])
@token_required
def get_history(current_user):
    history = SearchHistory.query.filter_by(user_id=current_user.id).order_by(SearchHistory.timestamp.desc()).all()
    result = [
        {
            'search_term': h.search_term,
            'timestamp': h.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        }
        for h in history
    ]
    return jsonify(result), 200

# Lancement de l’application Flask
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)


 # product = data.get('product', {})
        # categories = product.get('categories_tags', [])

        # search_category = next((cat for cat in categories if cat.startswith('fr:')), None)
        # if not search_category and categories:
        #     search_category = categories[-1]

        # if search_category:
        #     url2 = f'https://world.openfoodfacts.org/api/v2/search?categories_tags_fr={search_category}&countries_tags=en:france|fr:france&sort_by=nutriscore_score&page=1&page_size=5'
        #     response2 = requests.get(url2)
        #     response2.raise_for_status()
        #     data2 = response2.json()
        #     return jsonify(data2), 200
        # else:
        #     return jsonify({'error': 'No valid category found'}), 404