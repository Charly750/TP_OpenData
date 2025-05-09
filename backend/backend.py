from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
import requests
import threading
import time
import concurrent.futures

# Initialisation de l'application Flask
app = Flask(__name__)
CORS(app)
cache = Cache(app, config={
    'CACHE_TYPE': 'SimpleCache',  # Ou 'RedisCache' ou 'FileSystemCache'
    'CACHE_DEFAULT_TIMEOUT': 3600  # Augmenté à 1 heure pour réduire les requêtes API
})

# Configuration
app.config['SECRET_KEY'] = 'cle_secrete_dev_123456789_flask_demo'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'

db = SQLAlchemy(app)

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

# Middleware d'authentification via JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if token is None:
            return jsonify({'error': 'Token manquant'}), 401
        try:
            token = token.replace("Bearer ", "")
            data = jwt.decode(
                token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.filter_by(
                username=data['username']).first()
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expiré'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token invalide'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# Fonction pour précharger une page spécifique avec réessais
def preload_single_page(sort, page, max_retries=10, retry_delay=5):
    """
    Précharge une seule page et l'ajoute au cache
    
    Args:
        sort: Critère de tri
        page: Numéro de page
        max_retries: Nombre maximal de tentatives (par défaut 3)
        retry_delay: Délai en secondes entre les tentatives (par défaut 5)
    
    Returns:
        bool: True si réussi, False sinon
    """
    cache_key = f'product_list_{sort}_{page}'
    
    # Vérifie si cette combinaison existe déjà dans le cache
    if cache.get(cache_key):
        print(f"Cache déjà existant pour {cache_key}")
        return True
    
    retries = 0
    success = False
    
    while retries < max_retries and not success:
        try:
            if retries > 0:
                print(f"Tentative {retries+1}/{max_retries} pour {cache_key}...")
            else:
                print(f"Préchargement de la page {page} avec tri {sort}...")
                
            url = f'https://world.openfoodfacts.org/api/v2/search?sort_by={sort}&countries_tags=en:france|fr:france&page={page}&page_size=51'
            response = requests.get(url, timeout=100)  # Ajout d'un timeout
            response.raise_for_status()
            results = response.json()
            
            # Vérification supplémentaire que la réponse contient les données attendues
            if 'products' not in results:
                raise ValueError("La réponse ne contient pas la clé 'products'")
                
            # Calcul de la pagination
            pagination = (results.get("count", 0) + 50) // 51
            results['pagination'] = pagination
            
            # Stockage dans le cache
            cache.set(cache_key, results)
            print(f"✓ Cache préchargé pour {cache_key}")
            success = True
            return True
                
        except (requests.exceptions.RequestException, ValueError) as e:
            retries += 1
            if retries < max_retries:
                print(f"❌ Échec du préchargement pour {cache_key} (tentative {retries}/{max_retries}): {str(e)}")
                print(f"Nouvelle tentative dans {retry_delay} secondes...")
                time.sleep(retry_delay)
            else:
                print(f"❌❌ Échec définitif du préchargement pour {cache_key} après {max_retries} tentatives: {str(e)}")
                return False

# Fonction de préchargement du cache en multithreading avec gestion des échecs
def preload_product_cache_thread():
    """
    Précharge les pages de produits dans le cache en utilisant le multithreading
    Cette fonction s'exécute dans un thread séparé pour ne pas bloquer l'application
    Les pages qui échouent sont réessayées jusqu'à succès
    """
    print("Démarrage du préchargement du cache en arrière-plan...")
    sort_options = ['popularity_key']  # Options de tri courantes
    max_pages = 20  # Nombre de pages à précharger par option de tri
    
    # Créer la liste de toutes les combinaisons sort/page à précharger
    tasks = [(sort, page) for sort in sort_options for page in range(1, max_pages + 1)]
    
    # Première passe avec le ThreadPoolExecutor
    failed_tasks = []
    
    # Utiliser un ThreadPoolExecutor pour le multithreading initial
    print("Première passe de préchargement...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        # Soumettre toutes les tâches à l'exécuteur
        future_to_task = {executor.submit(preload_single_page, sort, page): (sort, page) for sort, page in tasks}
        
        # Récupérer les résultats au fur et à mesure qu'ils sont terminés
        for future in concurrent.futures.as_completed(future_to_task):
            sort, page = future_to_task[future]
            try:
                success = future.result()
                if not success:
                    print(f"Échec du préchargement pour sort={sort}, page={page}, ajouté à la liste de réessai")
                    failed_tasks.append((sort, page))
            except Exception as exc:
                print(f"Erreur inattendue lors du préchargement de sort={sort}, page={page}: {exc}")
                failed_tasks.append((sort, page))
    
    # Réessai des tâches échouées avec un délai plus long entre les tentatives
    if failed_tasks:
        print(f"Réessai de {len(failed_tasks)} tâches échouées...")
        
        # Créer un thread séparé pour gérer les réessais en continu
        def retry_failed_tasks():
            remaining_tasks = failed_tasks.copy()
            attempt = 1
            
            while remaining_tasks and attempt <= 10:  # Limite à 10 tentatives par sécurité
                print(f"Tentative de récupération #{attempt} pour {len(remaining_tasks)} tâches échouées")
                still_failed = []
                
                # Traiter chaque tâche échouée séquentiellement avec un délai plus long
                for sort, page in remaining_tasks:
                    print(f"Réessai de préchargement pour sort={sort}, page={page}")
                    # Utiliser un délai plus long pour les réessais (8 secondes)
                    success = preload_single_page(sort, page, max_retries=3, retry_delay=8)
                    if not success:
                        still_failed.append((sort, page))
                    # Petit délai entre chaque réessai pour ne pas surcharger l'API
                    time.sleep(2)
                
                # Mettre à jour la liste des tâches échouées
                remaining_tasks = still_failed
                if remaining_tasks:
                    print(f"Il reste encore {len(remaining_tasks)} tâches échouées")
                    # Attendre avant le prochain lot de réessais
                    time.sleep(15)
                attempt += 1
            
            if not remaining_tasks:
                print("✅ Toutes les tâches ont été préchargées avec succès!")
            else:
                print(f"⚠️ {len(remaining_tasks)} tâches n'ont pas pu être préchargées après plusieurs tentatives")
        
        # Démarrer le thread de réessai
        retry_thread = threading.Thread(target=retry_failed_tasks)
        retry_thread.daemon = True
        retry_thread.start()
    else:
        print("✅ Préchargement du cache en arrière-plan terminé sans erreurs!")

# Démarrer le préchargement du cache en arrière-plan
def start_background_preload():
    """Démarrer le préchargement du cache dans un thread séparé"""
    preload_thread = threading.Thread(target=preload_product_cache_thread)
    preload_thread.daemon = True  # Le thread se termine quand le programme principal se termine
    preload_thread.start()
    print("Thread de préchargement du cache démarré.")

# Route d'enregistrement utilisateur
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

# Route d'authentification utilisateur
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

    return jsonify({'error': 'Nom d\'utilisateur ou mot de passe invalide'}), 401

@app.route('/product/list', methods=['POST'])
@token_required
def get_product(current_user):
    data = request.get_json()
    sort = data.get('sort', 'popularity_key')
    page = data.get('page', 1)
    cache_key = f'product_list_{sort}_{page}'

    cached_data = cache.get(cache_key)
    if cached_data:
        return jsonify(cached_data), 200

    try:
        url = f'https://world.openfoodfacts.org/api/v2/search?sort_by={sort}&countries_tags=en:france|fr:france&page={page}&page_size=51'
        response = requests.get(url)
        response.raise_for_status()
        results = response.json()

        pagination = (results.get("count", 0) + 50) // 51
        results['pagination'] = pagination

        cache.set(cache_key, results)  # Stocke la réponse dans le cache
        return jsonify(results), 200

    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Erreur de requête externe : {str(e)}'}), 400

# Recherche de produit par code-barres avec historique
@app.route('/product/<string:product_code>', methods=['GET'])
@token_required
def get_product_suggestions(current_user, product_code):
    try:
        # Enregistrement dans l'historique
        history_entry = SearchHistory(
            search_term=product_code, user_id=current_user.id)
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
@app.route('/search/category/<string:search>', methods=['GET'])
@token_required
def search_productbycategory(current_user, search):
    try:
        # Enregistrement dans l'historique
        history_entry = SearchHistory(search_term=search, user_id=current_user.id)
        db.session.add(history_entry)
        db.session.commit()

        url = f'https://world.openfoodfacts.org/api/v2/search?categories_tags_fr={search}&countries_tags=en:france|fr:france&page=1&page_size=51'
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

       
        return jsonify(data), 200
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 400
    
@app.route('/search/brand/<string:search>', methods=['GET'])
@token_required
def search_productbybrand(current_user, search):
    try:
        # Enregistrement dans l'historique
        history_entry = SearchHistory(search_term=search, user_id=current_user.id)
        db.session.add(history_entry)
        db.session.commit()
        url = f'https://world.openfoodfacts.org/api/v2/search?brands_tags_fr={search}&countries_tags=en:france|fr:france&page=1&page_size=51'
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        return jsonify(data), 200
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 400
    
# Affichage de l'historique utilisateur
@app.route('/history', methods=['GET'])
@token_required
def get_history(current_user):
    history = SearchHistory.query.filter_by(user_id=current_user.id).order_by(
        SearchHistory.timestamp.desc()).all()
    result = [
        {
            'search_term': h.search_term,
            'timestamp': h.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        }
        for h in history
    ]
    return jsonify(result), 200

# Endpoint pour vérifier le statut du préchargement du cache
@app.route('/cache/status', methods=['GET'])
@token_required
def cache_status(current_user):
    """
    Permet de vérifier l'état du cache (combien de pages sont préchargées)
    """
    sort_options = ['popularity_key']
    max_pages = 20
    
    status = {}
    total_cached = 0
    total_possible = len(sort_options) * max_pages
    missing_pages = []
    
    for sort in sort_options:
        status[sort] = []
        for page in range(1, max_pages + 1):
            cache_key = f'product_list_{sort}_{page}'
            is_cached = cache.get(cache_key) is not None
            status[sort].append({
                'page': page,
                'cached': is_cached
            })
            if is_cached:
                total_cached += 1
            else:
                missing_pages.append({'sort': sort, 'page': page})
    
    completion_percentage = (total_cached / total_possible) * 100 if total_possible > 0 else 0
    
    # Si des pages sont manquantes, lancer un thread pour les charger
    if missing_pages:
        def reload_missing_pages():
            print(f"Tentative de rechargement de {len(missing_pages)} pages manquantes...")
            for item in missing_pages:
                sort, page = item['sort'], item['page']
                print(f"Rechargement de la page manquante: sort={sort}, page={page}")
                preload_single_page(sort, page, max_retries=3, retry_delay=5)
                time.sleep(1)  # Petit délai entre chaque chargement
            print("Rechargement des pages manquantes terminé")
        
        # Démarrer le thread de rechargement
        reload_thread = threading.Thread(target=reload_missing_pages)
        reload_thread.daemon = True
        reload_thread.start()
    
    return jsonify({
        'status': status,
        'summary': {
            'total_cached': total_cached,
            'total_possible': total_possible,
            'completion_percentage': round(completion_percentage, 2),
            'missing_pages': len(missing_pages),
            'reload_triggered': len(missing_pages) > 0
        }
    }), 200

# Lancement de l'application Flask
if __name__ == '__main__':
    # Démarrer le préchargement du cache en arrière-plan
    start_background_preload()
    
    # Démarrage du serveur
    print("Démarrage du serveur Flask...")
    app.run(host='0.0.0.0', port=5000)